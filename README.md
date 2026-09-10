# Agent History

> **Storage, Index & Segment Contract — Package P1**

Agent History is a system for capturing, storing, indexing, and retrieving the full history of AI-agent interactions across multiple providers (Anthropic, OpenAI, Google) and harnesses (claude-code, codex-cli, gemini-cli, pi-code). It provides byte-addressable retrieval over an immutable, content-addressed object store, projected into a Manticore search index that is fully droppable and rebuildable.

---

## What this package (P1) defines

P1 answers three questions:

1. **Where do bytes live?** — Content-addressed, uncompressed, immutable objects in S3-compatible storage.
2. **How is a 17 KB slice of a 400 MB object addressed?** — Via `segment` entities that bind a byte range to a knowledge entity.
3. **What does the search projection hold?** — Two Manticore real-time tables (`catalog` + `segment`) that contain zero state not reconstructible from the bucket.

P1 defines **nothing** about agents, UI, or capture mechanics — those belong to P0 (capture contract) and P2 (context assembly).

---

## Architecture at a glance

```
┌─────────────────────────────────────────────────────────────┐
│  EXECUTION          EVIDENCE           KNOWLEDGE     CONTEXT│
│  source             capture            session       segment│
│  provider           object             message       ctx-   │
│  harness            manifest           tool-event    pack   │
│  run                                 artifact-ref          │
│                                      artifact               │
└─────────────────────────────────────────────────────────────┘
         │                  │                │            │
         ▼                  ▼                ▼            ▼
    ┌──────────┐    ┌──────────────┐   ┌─────────────────────┐
    │ Catalog  │    │ Object Store │   │ Manticore (segment) │
    │ (every   │    │ (R2, B2,     │   │ (droppable,         │
    │  machine)│    │  S3, minio)  │   │  rebuildable)       │
    └──────────┘    └──────────────┘   └─────────────────────┘
```

### The four invariants

| ID | Statement |
|----|-----------|
| **I-1** | Canonical identity is owned by the catalog, never by a storage provider, search engine, or embedding model. |
| **I-2** | Manticore holds zero state that does not exist in the bucket. It is droppable and fully rebuildable. |
| **I-3** | Stored objects are immutable and content-addressed. Bytes never change under an offset. |
| **I-4** | Every machine holds the complete catalog; only the searchable representation is selectively projected. |

---

## Project structure

```
agent-history/
├── src/
│   ├── constants/        # Locked vocabulary — taxonomy, invariants, planes
│   │   ├── planes.ts         Four planes: EXECUTION / EVIDENCE / KNOWLEDGE / CONTEXT
│   │   ├── prefixes.ts       Branded ID prefixes and type-level enforcement
│   │   ├── taxonomy.ts       Taxonomy Lock v2 — canonical terms, forbidden variants
│   │   └── invariants.ts     I-1 through I-4 as machine-checkable constraints
│   ├── types/            # All data shapes and adapter contracts
│   │   ├── entities.ts       13 entity interfaces across 4 planes
│   │   ├── storage.ts        ObjectRef, ByteRange, replica placement
│   │   ├── segment.ts        Segment fields, segmentation policy
│   │   ├── catalog.ts        CatalogRow, CatalogResolver
│   │   ├── retrieval.ts      Search/Expand/Materialize types, ProjectionMiss
│   │   └── adapters.ts       5 adapter interfaces (Capture, Storage, Index, Embedding, Retrieval)
│   ├── schema/           # Manticore DDL and query templates
│   │   └── manticore.ts      CREATE TABLE for catalog + segment, example queries
│   └── lib/              # Core logic
│       ├── identity.ts       ULID generation, branded ID minting
│       ├── serialization.ts  Deterministic JSON, JSONL lines, UTF-8 boundary checks
│       ├── offsets.ts        BigInt offset arithmetic, range formatting
│       └── errors.ts         Typed errors (ObjectPurged, ReplicaDivergent, etc.)
├── docs/                 # Specification documents (P0, P1, P2)
├── fixtures/             # Test fixtures and validation data
├── README.md             # This file
├── AGENTS.md             # Rules for AI agents working on this codebase
└── GUIDE.md              # Detailed user guide
```

---

## Key concepts

### Objects are content-addressed and immutable

Every object is stored at `objects/<hash[0:2]>/<hash[2:4]>/<hash>` and is **never** overwritten, compressed, or altered. This is what makes a byte offset a durable address.

### Segments bind meaning to bytes

A `segment` is the only entity that knows both *what* something means and *where* its bytes physically are. It carries:
- `byte_start` / `byte_len` — address into the stored object
- `text_start` / `text_len` — address into the stripped text projection
- `body_text` — the extracted, noise-stripped text (indexed and embedded)

### Three retrieval verbs

| Verb | Bucket call? | Returns |
|------|--------------|---------|
| `search` | No | Hits + cost + facets |
| `expand` | No | Wider text projection |
| `materialize` | **Yes** | Raw bytes |

Each step is a decision point. Cost is visible before it is paid.

### The index is droppable

Manticore holds zero state that does not exist in the bucket. You can `DROP` both tables and reproject from the bucket at any time. This is a feature, not a fallback.

---

## Quick start

```bash
# Install dependencies
npm install

# Type-check
npm run typecheck

# Run tests (including validation gates G-1 through G-9)
npm test

# Start the documentation browser
npm run dev
```

### Prerequisites

- Node.js 20+
- TypeScript 5.4+
- Manticore 13.11.0+ (for the search projection)
- An S3-compatible bucket (R2, B2, MinIO, or local filesystem)

---

## Related packages

| Package | Status | Purpose |
|---------|--------|---------|
| **P0** | Defined | Canonical history contract, capture adapters, repository layout |
| **P1** | **This** | Storage, index, and segment contract |
| **P2** | Next | Context assembly and ranking contract |
| **P3** | Planned | Manticore Studio UI |
| **P4** | Deferred | Analytical projection (Parquet / DuckDB) |

---

## License

Proprietary. © 2026 LEVERAGEAI.
