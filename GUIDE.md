# User Guide — Agent History P1

> A detailed walkthrough for developers and operators working with the Storage, Index & Segment Contract.

---

## Table of Contents

1. [Conceptual Overview](#1-conceptual-overview)
2. [Data Flow](#2-data-flow)
3. [Working with Objects](#3-working-with-objects)
4. [Working with Segments](#4-working-with-segments)
5. [Querying the Index](#5-querying-the-index)
6. [Retrieval Workflows](#6-retrieval-workflows)
7. [Redaction and Purging](#7-redaction-and-purging)
8. [Reprojection and Maintenance](#8-reprojection-and-maintenance)
9. [Topology and Deployment](#9-topology-and-deployment)
10. [Validation and Testing](#10-validation-and-testing)
11. [Troubleshooting](#11-troubleshooting)
12. [Reference](#12-reference)

---

## 1. Conceptual Overview

Agent History is a system for capturing, storing, and retrieving the complete history of AI-agent interactions. It is designed around three core principles:

1. **Immutability** — Once bytes are stored, they never change. This makes byte offsets durable addresses.
2. **Content addressing** — Objects are identified by their hash, not by a filename or path. This enables deduplication and integrity verification.
3. **Droppable index** — The search index (Manticore) holds zero state that does not exist in the bucket. You can drop and rebuild it at any time.

### The four planes

The system organizes entities into four planes, in order:

| Plane | Entities | Purpose |
|-------|----------|---------|
| **EXECUTION** | source, provider, harness, run | Who produced the data and how |
| **EVIDENCE** | capture, object, manifest | The raw and canonical bytes |
| **KNOWLEDGE** | session, message, tool-event, artifact-reference, artifact | Normalized, provider-independent knowledge |
| **CONTEXT** | segment, context-pack | Addressable slices for retrieval |

### The thirteen entities

```
EXECUTION        EVIDENCE         KNOWLEDGE        CONTEXT
─────────        ────────         ─────────        ───────
source           capture          session          segment
provider         object           message          context-pack
harness          manifest         tool-event
run                               artifact-reference
                                  artifact
```

Each entity has a branded ID with a prefix (e.g., `ses_`, `seg_`, `obj_`). These IDs are ULIDs — lexicographically sortable, timestamped, and minted by the catalog.

---

## 2. Data Flow

### From capture to retrieval

```
┌─────────────┐
│ Raw capture │  ← Provider output (Claude Code JSON, Codex logs, etc.)
│ (L1: raw/)  │
└──────┬──────┘
       │ normalize()
       ▼
┌─────────────────┐
│ Canonical JSONL │  ← One message/tool-event per line, deterministic serialization
│ (L2: canonical/)│
└──────┬──────────┘
       │ store()
       ▼
┌──────────────────┐
│ Object in bucket │  ← Content-addressed, uncompressed, immutable
│ objects/xx/yy/…  │
└──────┬───────────┘
       │ segment()
       ▼
┌──────────────────┐
│ Segment rows     │  ← Byte ranges + text projection + embeddings
│ (Manticore)      │
└──────┬───────────┘
       │ search() / expand() / materialize()
       ▼
┌──────────────────┐
│ Agent receives   │  ← Progressive disclosure: hits → context → bytes
│ context          │
└──────────────────┘
```

### Key transformations

1. **Normalize** — Convert provider-specific formats to canonical JSONL. This is where `provider: anthropic, harness: claude-code` becomes a provider-independent session.
2. **Store** — Write the canonical object to the bucket. Compute `content_hash` (sha256). Store at `objects/<hash[0:2]>/<hash[2:4]>/<hash>`.
3. **Segment** — Parse the JSONL line-by-line. For each line, record its byte offset and length. Extract `body_text` (stripped of JSON structure). Generate embeddings.
4. **Index** — Insert segment rows into Manticore. The catalog table tracks object existence; the segment table holds searchable text and vectors.

---

## 3. Working with Objects

### Object identity is dual

Every object has two identities:

- `object_id` — The catalog's branded handle (`obj_…`). Stable across re-replication.
- `content_hash` — `sha256` of the exact stored bytes. Makes byte offsets safe.

If two captures produce identical bytes, they share one `content_hash` and one physical blob, but the catalog may record two `capture` rows pointing at it.

### Storage key convention

```
objects/<hash[0:2]>/<hash[2:4]>/<hash>

Example:
objects/9f/2c/9f2ca7e1b04d…c88
```

The two-level fan-out keeps bucket listings navigable at tens of millions of objects.

### Encoding rules (non-negotiable)

**Required:**
- Stored uncompressed at rest
- UTF-8, no BOM
- LF line endings only
- Byte offsets, never character offsets
- Every offset lands on a UTF-8 boundary

**Forbidden:**
- Server-side or client-side gzip on canonical objects
- Transfer encodings that alter stored bytes
- Overwriting an existing key
- Re-serializing an object "for tidiness"
- CRLF anywhere in the pipeline

**Why this matters:** A range GET returns the *stored* bytes. If an object is stored gzipped, every offset held in Manticore silently addresses compressed garbage — and it fails quietly.

### Replica placement

Objects are stored in multiple replicas (e.g., R2 + B2). Replicas must be byte-identical, verified by re-hashing (not by trusting the provider's ETag).

```typescript
const object: ObjectEntity = {
  objectId: "obj_01JQ8Z…",
  contentHash: "sha256:9f2ca7e1…",
  sizeBytes: 419430400n,
  rangeAddressable: true,
  replicas: [
    { provider: "r2", status: "verified", verifiedAt: "2026-09-05T18:02:11Z" },
    { provider: "b2", status: "verified", verifiedAt: "2026-09-05T18:04:39Z" },
  ],
  lifecycle: "active",
};
```

A replica that fails verification is marked `divergent` and removed from the resolver's candidate set.

### Reading bytes

Use the `StorageAdapter.getRange()` method to fetch a byte range:

```typescript
const bytes = await storage.getRange(contentHash, {
  start: 17482210n,
  len: 17552n,
});
```

The resolver selects among verified replicas by health → latency → cost, with exponential backoff and jitter.

---

## 4. Working with Segments

### What is a segment?

A segment is the only entity that knows both *what* something means and *where* its bytes physically are. It binds a knowledge entity (message, tool-event, artifact-ref) to an exact byte range in an exact object.

### Segment fields

| Field | Type | Meaning |
|-------|------|---------|
| `segmentId` | `seg_…` | Branded ID |
| `sessionId` | `ses_…` | Owning session |
| `refKind` | enum | `message` \| `tool_event` \| `artifact_ref` \| `span` |
| `refId` | string | The `msg_` / `tev_` / `art_` this segment materializes |
| `seq` | int | Ordinal within the session (drives `expand()` neighbourhoods) |
| `objectId` | `obj_…` | The object the bytes live in |
| `byteStart` | bigint | Offset from byte zero of the stored object |
| `byteLen` | bigint | Length in bytes |
| `textStart` | bigint | Offset into the extracted text projection |
| `textLen` | bigint | Length in the text projection |
| `tokenEstimate` | int | Cost signal returned to agents before they fetch |
| `bodyText` | text | The extracted, noise-stripped text (indexed and embedded) |
| `truncated` | bool | Whether `bodyText` is truncated (large tool outputs) |

### byte_range ≠ text_range

The byte range addresses the canonical JSONL line (including JSON envelope, tool payload, metadata). The text range addresses the stripped prose inside the extracted projection.

**Example:** A highlighted match at `textStart = 412` does **not** sit at `byteStart + 412`. Both are stored; neither is derived from the other at query time.

### Segmentation policy

- **One segment per canonical line** — This is the deterministic floor.
- **Sub-segments** — Long assistant messages may produce `refKind = "span"` sub-segments whose byte ranges are strictly contained by their parent line's range.
- **Split boundaries** — Sub-segments split on paragraph or fenced-code boundaries, never mid-token, and never across a UTF-8 boundary.
- **Truncation** — Tool outputs above 16 KB are segmented but their `bodyText` is truncated with `truncated = true`. The full payload stays fetchable by range.

### Creating segments

When you write a canonical JSONL object, you compute offsets at write time:

```typescript
let offset = 0n;
for (const record of records) {
  const line = Buffer.from(serializeDeterministic(record) + "\n", "utf8");
  segments.push({
    kind: record.kind,
    refId: record.messageId ?? record.toolEventId,
    seq: record.seq,
    byteStart: offset,
    byteLen: BigInt(line.byteLength),
  });
  offset += BigInt(line.byteLength);
  await sink.write(line);
}
```

`BigInt` is not decoration — a 400 MB object is fine, but repository snapshots can exceed `Number.MAX_SAFE_INTEGER`.

---

## 5. Querying the Index

### The Manticore schema

Two real-time tables:

1. **catalog** — Knowledge of existence. Tiny. Every machine holds the complete catalog.
2. **segment** — Searchable representation. Text + vectors. Selectively projected per machine.

### Search queries

**Lexical search:**

```sql
SELECT segment_id, session_id, ref_kind, seq, object_id,
       byte_start, byte_len, token_estimate,
       WEIGHT() AS score
FROM segment
WHERE MATCH('galera replication failure')
  AND project = 'agent-history'
  AND harness IN ('claude-code', 'codex-cli')
  AND created_at > UNIX_TIMESTAMP('2026-08-01 00:00:00')
  AND embed_model = 'Xenova/all-MiniLM-L6-v2'
ORDER BY score DESC
LIMIT 20
FACET logical_category
FACET harness
FACET ref_kind;
```

**Hybrid search (lexical + semantic):**

```sql
SELECT segment_id, session_id, byte_start, byte_len, token_estimate
FROM segment
WHERE hybrid_match('the oauth flow that kept 401-ing after refresh')
  AND project = 'agent-history'
LIMIT 10;
```

**Expand (neighbourhood):**

```sql
SELECT segment_id, seq, ref_kind, body_text, token_estimate
FROM segment
WHERE session_id = 'ses_01JQ8Z…'
  AND seq BETWEEN 47 AND 53
ORDER BY seq ASC;
```

### Using the TypeScript API

```typescript
import { RetrievalAdapter } from "./types";

const retrieval: RetrievalAdapter = /* ... */;

// Search
const results = await retrieval.search({
  match: "galera replication failure",
  project: "agent-history",
  harness: ["claude-code", "codex-cli"],
  createdAfter: "2026-08-01T00:00:00Z",
  embedModel: "Xenova/all-MiniLM-L6-v2",
  limit: 20,
  facets: ["logical_category", "harness", "ref_kind"],
});

console.log(`Found ${results.totalHits} hits`);
console.log(`Total token cost: ${results.totalTokenEstimate}`);

// Expand
const expanded = await retrieval.expand(results.hits[0].segmentId, 3);
console.log(`Expanded to ${expanded.segments.length} segments`);

// Materialize (the only bucket call)
const materialized = await retrieval.materialize(
  results.hits[0].objectId,
  { start: BigInt(results.hits[0].byteStart), len: BigInt(results.hits[0].byteLen) }
);
console.log(`Fetched ${materialized.byteCount} bytes`);
```

### Facets

Facets are the progressive-disclosure primitive. A search returns twenty hits plus counts across categories and harnesses, so the agent can narrow without a second full query.

```typescript
results.facets.logical_category.forEach(({ value, count }) => {
  console.log(`${value}: ${count}`);
});
// Output:
// debugging: 8
// architecture: 5
// deployment: 4
// testing: 3
```

---

## 6. Retrieval Workflows

### The three verbs

| Verb | Bucket call? | Returns | Use case |
|------|--------------|---------|----------|
| `search` | No | Hits + cost + facets | Find relevant segments |
| `expand` | No | Wider text projection | Get context around a hit |
| `materialize` | **Yes** | Raw bytes | Fetch the original payload |

Each step is a decision point. Cost is visible before it is paid.

### Progressive disclosure

An agent should follow this pattern:

1. **Search** — Get hits with token estimates. Decide if the results are relevant.
2. **Expand** — If a hit looks promising, expand to get the surrounding context (a few thousand tokens instead of tens of thousands).
3. **Materialize** — Only if the agent needs the exact original bytes (e.g., to reproduce a bug, verify a hash, or extract a tool output).

**Why not one call?** A wide surface trains agents to call the heaviest verb by default. Progressive disclosure is enforced by the shape of the API.

### Handling projection misses

If a local projection lacks a session, the result is an explicit `projection_miss` that routes to the server — never an empty result set that looks like absence.

```typescript
const result = await retrieval.search({ /* ... */ });

if ("kind" in result && result.kind === "projection_miss") {
  console.log(`Session ${result.sessionId} not in local projection`);
  console.log(`Routing to server: ${result.routeTo}`);
  // Fetch from server, or prompt the user to sync
} else {
  // Normal search result
  console.log(`Found ${result.totalHits} hits`);
}
```

---

## 7. Redaction and Purging

Immutability applies to bytes, not to their continued existence. Canonical identity and the audit record survive a purge that removes the bytes from every replica.

### Lifecycle states

| State | Bytes | Catalog row | Segments | Reversible |
|-------|-------|-------------|----------|------------|
| `active` | Present, verified | Full | Indexed | — |
| `tombstoned` | Present | Full | Removed from `segment` | Yes — reproject |
| `purged` | Deleted from every replica | Identity + provenance only | Removed | No |

### When to tombstone vs purge

- **Tombstone** — Temporarily hide an object from search (e.g., during investigation). Reversible by reprojecting.
- **Purge** — Permanently delete bytes from every replica (e.g., credential exposure, legal requirement). Irreversible.

### Purge procedure

```typescript
// 1. Mark as tombstoned
await catalog.updateLifecycle(objectId, "tombstoned");

// 2. Delete segment rows
const deletedCount = await indexAdapter.deleteByObject(objectId);
console.log(`Deleted ${deletedCount} segment rows`);

// 3. Delete bytes from every replica, in placement order
for (const replica of object.replicas) {
  const adapter = getStorageAdapter(replica.provider);
  await adapter.purge(object.contentHash);
}

// 4. Verify range GET returns 404 on each replica
for (const replica of object.replicas) {
  const adapter = getStorageAdapter(replica.provider);
  const head = await adapter.head(object.contentHash);
  if (head !== null) {
    throw new Error(`Replica ${replica.provider} still has the object`);
  }
}

// 5. Mark as purged
await catalog.updateLifecycle(objectId, "purged");

// 6. Append manifest event
await manifest.append({
  kind: "purge",
  objectId,
  contentHash: object.contentHash, // retained for audit
  reason: "credential_exposure",
  actor: "mike",
  timestamp: new Date().toISOString(),
  replicasConfirmed: object.replicas.map(r => r.provider),
});
```

**Why the hash is retained:** It lets a later integrity sweep prove that a missing object was purged by policy rather than lost to corruption — the distinction the whole auditability claim rests on.

### Redaction as re-canonicalization

Where only part of an object must go (one leaked key in one tool result), the correct operation is **not** editing bytes. Write a new canonical object with the value replaced by a redaction marker, register it as a new `object_id`, re-segment the session onto it, then purge the original.

```typescript
// 1. Read the original object
const originalBytes = await storage.getRange(originalHash, { start: 0n, len: originalSize });

// 2. Redact
const redactedBytes = redact(originalBytes, "sk-ant-abc123…", "[REDACTED]");

// 3. Compute new hash
const newHash = await sha256(redactedBytes);

// 4. Store as new object
const newObject = await storage.put(newHash, redactedBytes);

// 5. Re-segment the session onto the new object
await resegment(sessionId, newObject.objectId);

// 6. Purge the original
await purge(originalObjectId);
```

The session keeps its identity; the offsets are new because the object is new.

---

## 8. Reprojection and Maintenance

### When to reproject

| Change | Scope | Mechanism |
|--------|-------|-----------|
| New embedding model | Vectors only | `ALTER TABLE segment REBUILD EMBEDDINGS body_vector`, then flip `embed_model` |
| New segmentation policy | All segment rows | Full re-segmentation from canonical objects into a shadow table, then atomic swap |
| Schema change | Table definition | Create new table, reproject, swap. No in-place `ALTER` on the live table. |
| Canonical format change | Objects too | New canonical objects written; old ones retained. Offsets never rewritten in place. |

### Reprojection workflow

```bash
# 1. Drop the existing tables
manticore -e "DROP TABLE IF EXISTS segment; DROP TABLE IF EXISTS catalog;"

# 2. Recreate from DDL
manticore < src/schema/manticore.ts # (extracted SQL)

# 3. Reproject from the bucket
node scripts/reproject.js --bucket s3://agent-history --table segment

# 4. Verify
node scripts/validate.js --gate G-4
```

### Bulk-ingest option

For the initial corpus load, adding a model-backed `float_vector` column *after* loading (via `ALTER TABLE … ADD COLUMN`) is materially faster than embedding inline on insert. The table is not semantically searchable until the `ALTER` finishes. Use it for the first backfill; use inline embedding for steady-state ingest.

### Cache maintenance

The materialization cache is keyed by `content_hash` and can never be stale (objects are immutable). Eviction is LRU with a byte ceiling. A purge event broadcasts a hash-keyed eviction to every machine.

Monitor cache hit rate — it is a first-class metric, not a nice-to-have. Range GETs bill per operation, so a high hit rate is what makes fine-grained retrieval economically viable.

---

## 9. Topology and Deployment

### Projection policy

Every machine carries the complete catalog and a partial searchable projection:

| Machine | catalog | segment (text + vectors) | Cache |
|---------|---------|--------------------------|-------|
| Server | Complete | Complete | Large |
| Workstation | Complete | Active projects | Medium |
| Laptop | Complete | Last 90 days | Small |
| Cloud worker | Complete | None — remote query | Ephemeral |

The catalog is tier-one data: identity, provenance, timestamps, hashes, and locators are tiny relative to text and vectors. Replicating it everywhere costs little and buys the property that `resolve(ses_…)` returns the same answer on every machine.

### Deployment checklist

1. **Bucket setup** — Create an S3-compatible bucket (R2, B2, MinIO, or local filesystem). Configure lifecycle policies if needed.
2. **Manticore setup** — Install Manticore 13.11.0+. Run the DDL from `src/schema/manticore.ts`.
3. **Catalog replication** — Deploy the catalog to every machine. For a laptop, this is a SQLite file or a small Manticore table.
4. **Segment projection** — Configure the projection policy per machine type (see table above).
5. **Cache sizing** — Set the cache byte ceiling per machine type. Monitor hit rate.
6. **Validation** — Run the validation gates (G-1 through G-9) after deployment.

### Latency considerations

- **Catalog resolution** — Should be <10 ms locally. If it is not, the catalog is too large or the machine is under-provisioned.
- **Search** — Should be <100 ms for a full-text query on a million-segment index. If it is not, check the Manticore query plan.
- **Materialize** — Depends on the bucket provider and network. A range GET from R2 is typically 50-200 ms. Cache hit rate should be >80% to keep costs viable.

---

## 10. Validation and Testing

### The nine validation gates

| Gate | What it proves | How to test |
|------|---------------|-------------|
| **G-1** | Byte index round-trips exactly | Canonical object → segments → range fetch each segment → reassembled bytes equal the original object byte-for-byte. |
| **G-2** | Deterministic serialization | Re-normalizing the same capture twice yields an identical `content_hash`. |
| **G-3** | Offset boundary safety | Every `byte_start` and `byte_start + byte_len` lands on a UTF-8 boundary across a corpus containing emoji, CJK, and combining marks. |
| **G-4** | Index rebuildability | `DROP` both tables, reproject from the bucket, and every segment row matches the pre-drop state. |
| **G-5** | Replica byte-equality | Independently hashed R2 and B2 copies match; ETags are not accepted as evidence. |
| **G-6** | Purge completeness | After purge, a range GET 404s on every replica, zero segment rows remain, and the manifest event is present. |
| **G-7** | Model isolation | A KNN query spanning two `embed_model` values is rejected rather than silently answered. |
| **G-8** | Miss reporting | A partial projection returns `projection_miss`, never an empty result, for a session it does not hold. |
| **G-9** | Token accounting | Reported `token_estimate` is within 10% of the tokenizer's count on a 500-segment sample. |

### Running the validation suite

```bash
# Run all gates
npm test -- --gates all

# Run a specific gate
npm test -- --gate G-1

# Run with verbose output
npm test -- --gates all --verbose
```

### G-1 is the gate that matters most

It is the single test that proves the byte index is real: if segments cannot reassemble into the original object, every offset in the system is suspect and no downstream result can be trusted.

---

## 11. Troubleshooting

### "Empty search results"

**Symptom:** A search returns zero hits, but you know the data exists.

**Diagnosis:**
1. Check if the session is in the local projection. If not, you will get a `projection_miss` (not an empty result).
2. Check the `embed_model` filter. If you recently changed models, you may need to rebuild embeddings.
3. Check the date filters. The `created_at` field is a timestamp, not a date string.

**Fix:**
```typescript
const result = await retrieval.search({ /* ... */ });
if ("kind" in result && result.kind === "projection_miss") {
  // Route to server or sync the projection
}
```

### "Byte offset out of range"

**Symptom:** A `materialize` call throws `RangeError: Byte offset exceeds object size`.

**Diagnosis:**
1. The segment's `byteStart + byteLen` exceeds the object's `sizeBytes`.
2. This indicates corruption in the byte index or a mismatch between the catalog and the bucket.

**Fix:**
1. Verify the object exists and has the expected size: `await storage.head(contentHash)`.
2. Re-segment the object: delete the segment rows and reproject.
3. Run validation gate G-1 to confirm the byte index round-trips.

### "Replica divergent"

**Symptom:** A `ReplicaDivergentError` is thrown during a `materialize` call.

**Diagnosis:**
1. A replica's bytes do not match the catalog's `content_hash`.
2. This can happen if a replica was corrupted, or if the catalog's `content_hash` was updated without re-verifying replicas.

**Fix:**
1. Mark the divergent replica as `divergent` in the catalog.
2. Re-verify the other replicas.
3. If all replicas are divergent, the object is lost. Restore from backup or re-ingest from the raw capture.

### "Embedding model mismatch"

**Symptom:** A KNN query throws `EmbeddingModelMismatchError`.

**Diagnosis:**
1. The query spans segments with different `embed_model` values.
2. This happens if you changed the embedding model without rebuilding all vectors.

**Fix:**
1. Scope the query to a single `embed_model`: `WHERE embed_model = 'Xenova/all-MiniLM-L6-v2'`.
2. Or rebuild embeddings for all segments: `ALTER TABLE segment REBUILD EMBEDDINGS body_vector`.

### "UTF-8 boundary violation"

**Symptom:** A `Utf8BoundaryError` is thrown during segmentation or materialization.

**Diagnosis:**
1. A byte offset does not land on a UTF-8 boundary.
2. This indicates corruption in the byte index or a bug in the segmentation logic.

**Fix:**
1. Run validation gate G-3 to identify all boundary violations.
2. Re-segment the object.
3. If the violation persists, check the canonical object for malformed UTF-8.

---

## 12. Reference

### API reference

- **Constants** — `src/constants/`
  - `planes.ts` — Four planes and entity-plane mapping
  - `prefixes.ts` — ID prefixes and branded ID types
  - `taxonomy.ts` — Canonical terms and forbidden variants
  - `invariants.ts` — The four invariants

- **Types** — `src/types/`
  - `entities.ts` — 13 entity interfaces
  - `storage.ts` — ObjectRef, ByteRange, replica placement
  - `segment.ts` — Segment fields, segmentation policy
  - `catalog.ts` — CatalogRow, CatalogResolver
  - `retrieval.ts` — Search/Expand/Materialize types
  - `adapters.ts` — 5 adapter interfaces

- **Schema** — `src/schema/`
  - `manticore.ts` — DDL and query templates

- **Library** — `src/lib/`
  - `identity.ts` — ULID generation, branded ID minting
  - `serialization.ts` — Deterministic JSON, JSONL lines
  - `offsets.ts` — BigInt offset arithmetic
  - `errors.ts` — Typed errors

### Spec reference

- **P0** — Canonical History Contract (dependency)
- **P1** — Storage, Index & Segment Contract (this document)
- **P2** — Context Assembly & Ranking Contract (next)

### Glossary

- **Byte range** — An address into a stored object: `byteStart` + `byteLen`.
- **Text range** — An address into the extracted text projection: `textStart` + `textLen`.
- **Catalog** — The knowledge-of-existence table (Manticore).
- **Manifest** — The durable bucket-side record of objects, hashes, replicas, and lifecycle events.
- **Materialize** — The only verb that fetches bytes.
- **Projection miss** — Machine lacks the searchable representation for a session.
- **Lifecycle** — `active` / `tombstoned` / `purged`.
- **Content hash** — `sha256` of the exact stored bytes.
- **Object** — A content-addressed blob in a bucket.
- **Segment** — An addressable slice: byte range + text range + locator.

---

## Further reading

- **README.md** — Project overview and quick start
- **AGENTS.md** — Rules for AI agents working on this codebase
- **P1 specification** — The full technical specification (docs/P1-storage-index-segment.md)

---

*Last updated: 2026-09-05*
