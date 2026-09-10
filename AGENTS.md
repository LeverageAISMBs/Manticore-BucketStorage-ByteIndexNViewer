# AGENTS.md — Rules for AI Agents Working on This Codebase

> This file is read by AI coding agents (Claude, Codex, Gemini, etc.) before they modify any file in this repository. It encodes the conventions, invariants, and taxonomy that must not be violated. Human developers should also read it.

---

## Before you write anything

1. Read this file in full.
2. Read `src/constants/taxonomy.ts` — it is the locked vocabulary.
3. Read `src/constants/invariants.ts` — violating an invariant is a bug, not a design choice.
4. If you are about to introduce a new term, entity, or concept, check whether the taxonomy already covers it. If it does, use the canonical form. If it does not, **amend the taxonomy** in the same PR — do not silently introduce a new term.

---

## Hard rules

### R-1: Canonical identity is owned by the catalog

Never use a provider's native ID (Claude Code's UUID filename, Codex's run ID, etc.) as a key, join column, or API parameter. Provider IDs are stored as `provider_native_id` for provenance only.

```typescript
// ✅ Correct
const session = await catalog.resolveSession(sessionId);

// ❌ Wrong — using provider-native ID as a key
const session = await catalog.findByProviderId("uuid-from-claude-code");
```

### R-2: Offsets are `bigint`, always

Manticore's `int` is 32-bit unsigned (~4.29 GB cap). Repository snapshots and video artifacts exceed this. Every byte offset in the system is `bigint` in TypeScript and `bigint` in Manticore. No exceptions.

```typescript
// ✅ Correct
interface ByteRange {
  readonly start: bigint;
  readonly len: bigint;
}

// ❌ Wrong
interface ByteRange {
  readonly start: number;  // will silently overflow on large objects
  readonly len: number;
}
```

### R-3: Objects are immutable and uncompressed

Never compress a canonical object. Never overwrite an existing key. Never re-serialize "for tidiness." If you need to change an object, write a new one with a new hash and re-segment onto it.

```typescript
// ✅ Correct — write a new canonical object
const newObject = await storage.put(newHash, redactedBody);
await resegment(sessionId, newObject.objectId);
await purge(originalObjectId);

// ❌ Wrong — editing bytes in place
await storage.overwrite(objectId, redactedBody);
```

### R-4: The index is droppable

Never store state in Manticore that does not exist in the bucket. If you find yourself wanting to add a `cached`, `pinned`, `relevance_score`, or `summary` column to the segment table, stop. Those belong elsewhere.

### R-5: Three verbs, not seven

The retrieval surface is `search`, `expand`, `materialize`. Do not add `inspect`, `fetch_segment`, `pin`, `release`, `hydrate`, `pull`, or any other verb. A wide surface trains agents to call the heaviest verb by default.

### R-6: A partial index must report a miss as a miss

When a local projection lacks a session, return `projection_miss` — never an empty result set that looks like absence. This is G-8.

```typescript
// ✅ Correct
if (!localProjection.has(sessionId)) {
  return { kind: "projection_miss", sessionId, routeTo: "server" };
}

// ❌ Wrong — empty result looks like "nothing exists"
return { hits: [], totalHits: 0 };
```

### R-7: Embedding model isolation

Any query touching `body_vector` must be scoped to a single `embed_model` value. A KNN query spanning two models is rejected (G-7), not silently answered.

---

## Taxonomy

The taxonomy in `src/constants/taxonomy.ts` is **locked**. The following are the most common mistakes:

### Provider vs Harness

```
✅ provider: "anthropic"    harness: "claude-code"
✅ provider: "openai"       harness: "codex-cli"
✅ provider: "google"       harness: "gemini-cli"
✅ provider: "anthropic"    harness: "pi-code"

❌ provider: "claude-code"  harness: "pi-code"   ← INVERTED, non-conformant
❌ provider: "claude"       harness: "code"      ← neither is a real value
```

### Object vs Artifact

- `object` / `obj_` — a content-addressed blob in a bucket. The unit of storage.
- `artifact` / `art_` — a produced thing (file, screenshot, PDF, repo snapshot). The unit of meaning.

Do not use "blob", "file", or "shard" to mean `object`. Do not use "chunk" to mean `segment`.

### Segment vs Span

- `segment` — the retrieval unit. One per canonical line (deterministic floor).
- `span` — a sub-segment `ref_kind` for long assistant messages. Never use "span" as a synonym for "segment".

### materialize vs fetch

The only verb that fetches bytes is `materialize`. Do not call it `fetch`, `download`, `hydrate`, or `pull`.

### catalog vs manifest

- `catalog` — the knowledge-of-existence table (Manticore).
- `manifest` — the durable bucket-side record of objects, hashes, replicas, and lifecycle events.

Do not call the catalog the "registry" or the manifest the "truth".

---

## Adding a new entity

If you need a fourteenth entity (the registry currently has thirteen), you must:

1. Add it to `ENTITY_KINDS` in `src/constants/planes.ts`.
2. Add it to `ENTITY_PLANE` with its plane assignment.
3. Add its ID prefix to `ID_PREFIXES` in `src/constants/prefixes.ts`.
4. Add its interface to `src/types/entities.ts`.
5. Update the Entity Registry table in the P1 spec (or the next spec that amends it).
6. Update this AGENTS.md file's entity count.

Do not define the entity in a feature branch without amending the registry.

---

## Adding a new adapter

There are exactly five adapter interfaces. If you need a sixth:

1. Justify why it cannot be expressed as a method on one of the existing five.
2. Add it to `src/types/adapters.ts`.
3. Add it to the barrel export in `src/types/index.ts`.
4. Update §11 of the spec.

The five existing seams are: **Capture**, **Storage**, **Index**, **Embedding**, **Retrieval**. Every vendor in this architecture sits behind exactly one of them.

---

## File organization

- **`src/constants/`** — The locked vocabulary. Changes here are high-leverage and require spec amendments.
- **`src/types/`** — Data shapes and interfaces. Adding types is low-risk; changing existing types requires checking all consumers.
- **`src/schema/`** — Manticore DDL. Changes here require a reprojection plan (§9).
- **`src/lib/`** — Core logic. Changes here must pass validation gates (§13).
- **`src/adapters/`** — (Not yet created) Concrete adapter implementations. One directory per vendor.
- **`fixtures/`** — Test data. Must include UTF-8 boundary corpus for G-3.

---

## Testing expectations

Every change must satisfy the validation gates in §13. The most important:

| Gate | What it proves |
|------|---------------|
| **G-1** | Byte index round-trips exactly. Segments reassemble into the original object byte-for-byte. |
| **G-2** | Deterministic serialization — re-normalizing the same capture twice yields identical `content_hash`. |
| **G-3** | Every offset lands on a UTF-8 boundary (emoji, CJK, combining marks). |
| **G-4** | Index rebuildability — DROP + reproject matches pre-drop state. |
| **G-7** | Model isolation — KNN spanning two `embed_model` values is rejected. |
| **G-8** | Miss reporting — partial projection returns `projection_miss`, never empty. |

If your change breaks any gate, it is not mergeable. Fix the gate or fix the change.

---

## Commit message conventions

```
<type>(<scope>): <subject>

Types: feat, fix, refactor, docs, test, chore, spec
Scopes: constants, types, schema, lib, adapters, fixtures, ci

Examples:
  feat(types): add LifecycleEvent interface for §10 purge tracking
  fix(lib): handle UTF-8 boundary at exact object end
  docs(constants): clarify taxonomy entry for 'materialize'
  test(lib): add G-3 validation for CJK + combining marks corpus
  spec(P1): record open decision on logical_category vocabulary
```

---

## What to do when you are unsure

1. Check the spec (P0, P1, or the relevant package).
2. Check the taxonomy (`src/constants/taxonomy.ts`).
3. Check the invariants (`src/constants/invariants.ts`).
4. If none of those answer your question, **ask** — do not guess. A wrong guess that ships is worse than a question that delays by one turn.

---

## Summary

This codebase is small by design. Thirteen entities, four planes, five adapters, four invariants, nine validation gates. The complexity is in the constraints, not the code. Respect the constraints.
