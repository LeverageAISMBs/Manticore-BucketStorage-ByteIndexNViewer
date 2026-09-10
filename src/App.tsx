import { useState, useMemo } from "react";
import { FILE_TREE, flattenTree, type FileNode } from "./data/filetree";

// ---- File contents (embedded for the browser) ------------------------------
// For the scaffold browser, we embed representative content inline.

const SOURCE_FILES: Record<string, { content: string; lang: string }> = {};

function registerFile(path: string, content: string, lang = "typescript") {
  SOURCE_FILES[path] = { content, lang };
}

// -- constants/planes.ts --
registerFile("src/constants/planes.ts", `// ---------------------------------------------------------------------------
// Planes — §2 Entity Registry
//
// The four planes, in that order. Any document reordering or renaming them
// is non-conformant per the Taxonomy Lock v2 (Appendix A).
// ---------------------------------------------------------------------------

export const PLANES = [
  "EXECUTION",
  "EVIDENCE",
  "KNOWLEDGE",
  "CONTEXT",
] as const;

export type Plane = (typeof PLANES)[number];

export const ENTITY_PLANE: Record<EntityKind, Plane> = {
  source: "EXECUTION",
  provider: "EXECUTION",
  harness: "EXECUTION",
  run: "EXECUTION",
  capture: "EVIDENCE",
  object: "EVIDENCE",
  manifest: "EVIDENCE",
  session: "KNOWLEDGE",
  message: "KNOWLEDGE",
  "tool-event": "KNOWLEDGE",
  "artifact-reference": "KNOWLEDGE",
  artifact: "KNOWLEDGE",
  segment: "CONTEXT",
  "context-pack": "CONTEXT",
};

export const ENTITY_KINDS = [
  "source", "provider", "harness", "run",
  "capture", "object", "manifest",
  "session", "message", "tool-event", "artifact-reference", "artifact",
  "segment", "context-pack",
] as const;

export type EntityKind = (typeof ENTITY_KINDS)[number];

export const BYTE_OWNING_ENTITIES: readonly EntityKind[] = [
  "capture", "object", "manifest", "session", "artifact",
];

export function ownsBytes(kind: EntityKind): boolean {
  return BYTE_OWNING_ENTITIES.includes(kind);
}`);

// -- constants/prefixes.ts --
registerFile("src/constants/prefixes.ts", `// ---------------------------------------------------------------------------
// Identity prefixes — §3 Identity Contract
// ---------------------------------------------------------------------------

export const ID_PREFIXES = {
  source: "src",
  run: "run",
  capture: "cap",
  object: "obj",
  session: "ses",
  message: "msg",
  "tool-event": "tev",
  artifact: "art",
  "artifact-version": "arv",
  segment: "seg",
  "context-pack": "ctx",
} as const;

export type IdPrefix = (typeof ID_PREFIXES)[keyof typeof ID_PREFIXES];

export type BrandedId<P extends string> = string & { readonly __prefix: P };

export type SourceId = BrandedId<"src">;
export type ObjectId = BrandedId<"obj">;
export type SessionId = BrandedId<"ses">;
export type SegmentId = BrandedId<"seg">;
// ... (full file has all branded ID types)

export function isValidBrandedId(
  value: string,
  expectedPrefix: IdPrefix,
): boolean {
  const prefix = \`\${expectedPrefix}_\`;
  if (!value.startsWith(prefix)) return false;
  const ulid = value.slice(prefix.length);
  if (ulid.length !== 26) return false;
  return /^[0-9A-HJKMNP-TV-Z]{26}$/i.test(ulid);
}`);

// -- constants/taxonomy.ts --
registerFile("src/constants/taxonomy.ts", `// ---------------------------------------------------------------------------
// Taxonomy Lock v2 — Appendix A
// ---------------------------------------------------------------------------

export interface TaxonomyEntry {
  readonly canonical: string;
  readonly meaning: string;
  readonly forbidden: readonly string[];
}

export const TAXONOMY_P0: readonly TaxonomyEntry[] = [
  { canonical: "pi-code", meaning: "Provider directory, adapter directory, corpus name",
    forbidden: ["providers/pi/", "Pi"] },
  { canonical: "provider", meaning: "anthropic, openai, google — the model vendor",
    forbidden: ["using provider to mean the CLI"] },
  { canonical: "harness", meaning: "claude-code, codex-cli, gemini-cli, pi-code",
    forbidden: ["collapsing harness into provider"] },
  // ... (10 entries total)
];

export const TAXONOMY_P1: readonly TaxonomyEntry[] = [
  { canonical: "object / obj_", meaning: "A content-addressed blob in a bucket",
    forbidden: ["blob", "file", "artifact"] },
  { canonical: "segment / seg_", meaning: "An addressable slice: byte range + text range + locator",
    forbidden: ["chunk", "span", "shard"] },
  { canonical: "content_hash", meaning: "sha256 of the exact stored bytes",
    forbidden: ["etag", "checksum", "digest"] },
  { canonical: "materialize", meaning: "The only verb that fetches bytes",
    forbidden: ["fetch", "download", "hydrate", "pull"] },
  { canonical: "projection_miss", meaning: "Machine lacks the searchable representation",
    forbidden: ["not found", "no results", "empty"] },
  { canonical: "lifecycle", meaning: "active / tombstoned / purged",
    forbidden: ["status", "state", "deleted flag"] },
  // ... (8 entries total)
];

export function validateProviderHarnessRecord(record: {
  provider: string; harness: string;
}): { valid: boolean; error?: string } {
  const KNOWN_PROVIDERS = ["anthropic", "openai", "google"];
  const KNOWN_HARNESSES = ["claude-code", "codex-cli", "gemini-cli", "pi-code"];
  if (!KNOWN_PROVIDERS.includes(record.provider)) {
    return { valid: false, error: \`"\${record.provider}" is not a known provider\` };
  }
  if (!KNOWN_HARNESSES.includes(record.harness)) {
    return { valid: false, error: \`"\${record.harness}" is not a known harness\` };
  }
  return { valid: true };
}`);

// -- constants/invariants.ts --
registerFile("src/constants/invariants.ts", `// ---------------------------------------------------------------------------
// Invariants — §1 The four invariants
// ---------------------------------------------------------------------------

export interface Invariant {
  readonly id: string;
  readonly statement: string;
  readonly violationConsequence: string;
}

export const INVARIANTS: readonly Invariant[] = [
  {
    id: "I-1",
    statement: "Canonical identity is owned by the catalog, never by a storage provider, search engine, or embedding model.",
    violationConsequence: "Swapping R2 for B2, or Manticore for anything else, becomes a migration instead of a config change.",
  },
  {
    id: "I-2",
    statement: "Manticore holds zero state that does not exist in the bucket. It is droppable and fully rebuildable.",
    violationConsequence: "The index becomes a database of record; auditability claim collapses.",
  },
  {
    id: "I-3",
    statement: "Stored objects are immutable and content-addressed. Bytes never change under an offset.",
    violationConsequence: "Every stored byte range silently becomes wrong; corruption is undetectable.",
  },
  {
    id: "I-4",
    statement: "Every machine holds the complete catalog; only the searchable representation is selectively projected.",
    violationConsequence: 'A partial index cannot distinguish "does not exist" from "I do not have it" — siloing returns.',
  },
];`);

// -- types/entities.ts --
registerFile("src/types/entities.ts", `// ---------------------------------------------------------------------------
// Entity types — §2 Entity Registry
// 13 entities across 4 planes
// ---------------------------------------------------------------------------

export type Provider = "anthropic" | "openai" | "google";
export type Harness = "claude-code" | "codex-cli" | "gemini-cli" | "pi-code";
export type LifecycleState = "active" | "tombstoned" | "purged";

// ---- Execution plane -------------------------------------------------------
export interface Source {
  readonly sourceId: SourceId;
  readonly machine: string;
  readonly account: string;
  readonly registeredAt: string;
}

export interface Run {
  readonly runId: RunId;
  readonly sourceId: SourceId;
  readonly startedAt: string;
  readonly completedAt?: string;
}

// ---- Evidence plane --------------------------------------------------------
export interface Capture {
  readonly captureId: CaptureId;
  readonly objectId: ObjectId;
  readonly provider: Provider;
  readonly harness: Harness;
  readonly providerNativeId: string;
  readonly ingestedAt: string;
}

export interface ObjectEntity {
  readonly objectId: ObjectId;
  readonly contentHash: string;  // sha256:<hex>
  readonly sizeBytes: bigint;
  readonly rangeAddressable: boolean;
  readonly replicas: readonly Replica[];
  readonly lifecycle: LifecycleState;
}

export interface Replica {
  readonly provider: StorageProvider;
  readonly status: ReplicaStatus;
  readonly verifiedAt: string;
}

// ---- Knowledge plane -------------------------------------------------------
export interface Session {
  readonly sessionId: SessionId;
  readonly objectId: ObjectId;
  readonly provider: Provider;
  readonly harness: Harness;
  readonly project: string;
  readonly providerNativeId: string;
  readonly createdAt: string;
  readonly messageCount: number;
}

export interface Message {
  readonly messageId: MessageId;
  readonly sessionId: SessionId;
  readonly seq: number;
  readonly role: "user" | "assistant" | "system";
  readonly content: readonly ContentBlock[];
}

// ---- Context plane ---------------------------------------------------------
export interface ContextPack {
  readonly contextPackId: ContextPackId;
  readonly sessionId: SessionId;
  readonly segmentIds: readonly SegmentId[];
  readonly totalTokenEstimate: number;
  readonly assembledAt: string;
}

// ... (full file has all 13 entity interfaces)`);

// -- types/adapters.ts --
registerFile("src/types/adapters.ts", `// ---------------------------------------------------------------------------
// Adapter interfaces — §11
// Five seams, five interfaces
// ---------------------------------------------------------------------------

export interface ReadableStreamLike {
  [Symbol.asyncIterator](): AsyncIterator<Uint8Array>;
}

/** 1. CAPTURE — provider/harness output → canonical records */
export interface CaptureAdapter {
  readonly harness: Harness;
  readonly provider: Provider;
  detect(path: string): Promise<boolean>;
  normalize(raw: ReadableStreamLike): AsyncIterable<CanonicalRecord>;
}

/** 2. STORAGE — content-addressed blobs. Range reads are mandatory. */
export interface StorageAdapter {
  readonly id: "r2" | "b2" | "s3" | "minio" | "fs";
  put(hash: string, body: ReadableStreamLike): Promise<ObjectRef>;
  getRange(hash: string, range: ByteRange): Promise<Uint8Array>;
  head(hash: string): Promise<ObjectRef | null>;
  verify(hash: string): Promise<boolean>;
  purge(hash: string): Promise<void>;
}

/** 3. INDEX — the search projection. Droppable by contract (I-2). */
export interface IndexAdapter {
  readonly id: "manticore";
  upsertSegments(rows: readonly SegmentRow[]): Promise<void>;
  deleteByObject(objectId: string): Promise<number>;
  search(q: SearchQuery): Promise<SearchResult>;
  expand(segmentId: string, depth: number): Promise<readonly SegmentRow[]>;
  drop(): Promise<void>;
}

/** 4. EMBEDDING — declared, not invoked, when auto-embeddings are on. */
export interface EmbeddingAdapter {
  readonly modelName: string;
  readonly dims: number;
  readonly normalized: boolean;
}

/** 5. RETRIEVAL — the agent-facing surface. Three verbs. */
export interface RetrievalAdapter {
  search(q: SearchQuery): Promise<SearchResult>;
  expand(segmentId: string, depth: number): Promise<ExpandResult>;
  materialize(objectId: string, range?: ByteRange): Promise<MaterializeResult>;
}`);

// -- types/segment.ts --
registerFile("src/types/segment.ts", `// ---------------------------------------------------------------------------
// Segment types — §6 Segment Contract
// ---------------------------------------------------------------------------

export type RefKind = "message" | "tool_event" | "artifact_ref" | "span";

export interface Segment {
  readonly segmentId: SegmentId;
  readonly sessionId: SessionId;
  readonly refKind: RefKind;
  readonly refId: string;           // msg_ / tev_ / art_
  readonly seq: number;
  readonly objectId: ObjectId;
  readonly byteStart: bigint;
  readonly byteLen: bigint;
  readonly textStart: bigint;
  readonly textLen: bigint;
  readonly tokenEstimate: number;
  readonly bodyText: string;
  readonly truncated: boolean;
  readonly provider: string;
  readonly harness: string;
  readonly project: string;
  readonly logicalCategory?: string;
  readonly createdAt: string;
  readonly embedModel: string;
}

export const SEGMENTATION_POLICY = {
  oneSegmentPerLine: true,
  toolOutputTruncationThreshold: 16_384,
  splitBoundaries: ["paragraph", "fenced-code"] as const,
  neverSplitMidToken: true,
} as const;`);

// -- types/retrieval.ts --
registerFile("src/types/retrieval.ts", `// ---------------------------------------------------------------------------
// Retrieval types — §8 Retrieval Contract
// Three verbs: search, expand, materialize
// ---------------------------------------------------------------------------

export interface SearchQuery {
  readonly match?: string;
  readonly hybridMatch?: string;
  readonly project?: string;
  readonly harness?: string | readonly string[];
  readonly provider?: string;
  readonly createdAfter?: string;
  readonly embedModel: string;  // REQUIRED — G-7
  readonly limit?: number;
  readonly facets?: readonly string[];
}

export interface SearchResult {
  readonly hits: readonly SearchHit[];
  readonly totalHits: number;
  readonly facets: Readonly<Record<string, readonly FacetCount[]>>;
  readonly totalTokenEstimate: number;
}

export interface ExpandResult {
  readonly segments: readonly ExpandedSegment[];
  readonly totalTokenEstimate: number;
}

export interface MaterializeResult {
  readonly objectId: string;
  readonly range?: ByteRange;
  readonly bytes: Uint8Array;
  readonly byteCount: number;
  readonly lines: readonly string[];
  readonly verified: boolean;
}

/** projection_miss — §12: never return empty for a session you don't have */
export interface ProjectionMiss {
  readonly kind: "projection_miss";
  readonly sessionId: SessionId;
  readonly message: string;
  readonly routeTo: "server";
}`);

// -- schema/manticore.ts --
registerFile("src/schema/manticore.ts", `// ---------------------------------------------------------------------------
// Manticore DDL — §7 Manticore Schema
// Verified against Manticore 13.11.0+ manual on 2026-09-05
// ---------------------------------------------------------------------------

export const CREATE_CATALOG_TABLE = \`
CREATE TABLE catalog (
    object_id          string attribute,
    content_hash       string attribute,
    entity_kind        string attribute engine='columnar',
    session_id         string attribute engine='columnar',
    provider           string attribute engine='columnar',
    harness            string attribute engine='columnar',
    project            string attribute engine='columnar',
    created_at         timestamp        engine='columnar',
    size_bytes         bigint           engine='columnar',
    range_addressable  bool,
    lifecycle          string attribute engine='columnar',
    provider_native_id string attribute,
    meta               json
) engine='rowwise';
\`;

export const CREATE_SEGMENT_TABLE = \`
CREATE TABLE segment (
    body_text        text,
    segment_id       string attribute,
    session_id       string attribute engine='columnar',
    ref_kind         string attribute engine='columnar',
    seq              int              engine='columnar',
    object_id        string attribute,
    byte_start       bigint           engine='columnar',
    byte_len         bigint           engine='columnar',
    text_start       bigint,
    text_len         bigint,
    provider         string attribute engine='columnar',
    project          string attribute engine='columnar',
    logical_category string attribute engine='columnar',
    token_estimate   int              engine='columnar',
    truncated        bool,
    embed_model      string attribute engine='columnar',
    body_vector      float_vector
        KNN_TYPE='hnsw'
        HNSW_SIMILARITY='cosine'
        MODEL_NAME='Xenova/all-MiniLM-L6-v2'
        FROM='body_text'
) engine='rowwise';
\`;

export const QUERIES = {
  search: \`SELECT segment_id, session_id, ref_kind, seq, object_id,
       byte_start, byte_len, token_estimate, WEIGHT() AS score
FROM segment
WHERE MATCH(:match) AND project = :project
  AND embed_model = :embed_model
ORDER BY score DESC LIMIT :limit
FACET logical_category FACET harness FACET ref_kind;\`,

  hybridSearch: \`SELECT segment_id, session_id, byte_start, byte_len
FROM segment
WHERE hybrid_match(:query) AND project = :project
LIMIT :limit;\`,

  expand: \`SELECT segment_id, seq, ref_kind, body_text, token_estimate
FROM segment
WHERE session_id = :session_id
  AND seq BETWEEN :seq_min AND :seq_max
ORDER BY seq ASC;\`,
} as const;`);

// -- lib/identity.ts --
registerFile("src/lib/identity.ts", `// ---------------------------------------------------------------------------
// Identity — §3 Identity Contract
// ULID generation and branded ID minting
// ---------------------------------------------------------------------------

const CROCKFORD_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function encodeBase32(bytes: Uint8Array): string {
  let result = "";
  let bits = 0, value = 0;
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      result += CROCKFORD_ALPHABET[(value >>> bits) & 0x1f];
    }
  }
  if (bits > 0) result += CROCKFORD_ALPHABET[(value << (5 - bits)) & 0x1f];
  return result;
}

export function generateUlid(): string {
  const now = Date.now();
  const timeBytes = new Uint8Array(6);
  let ts = now;
  for (let i = 5; i >= 0; i--) {
    timeBytes[i] = ts & 0xff;
    ts = Math.floor(ts / 256);
  }
  const randomBytes = new Uint8Array(10);
  crypto.getRandomValues(randomBytes);
  return encodeBase32(timeBytes).padStart(10, "0")
       + encodeBase32(randomBytes).padStart(16, "0");
}

export function mintId<K extends EntityWithPrefix>(
  entity: K,
): BrandedId<(typeof ID_PREFIXES)[K]> {
  const prefix = ID_PREFIXES[entity];
  return \`\${prefix}_\${generateUlid()}\` as BrandedId<(typeof ID_PREFIXES)[K]>;
}

// Usage:
//   mintId("session")  → "ses_01JQ8Z3K7M4P2V9XR6TB5NCWDH"
//   mintId("segment")  → "seg_01JQ8Z3K8N1Q4W7YS2UA6MDXFJ"`);

// -- lib/serialization.ts --
registerFile("src/lib/serialization.ts", `// ---------------------------------------------------------------------------
// Deterministic serialization — §5 Canonical Object Format
// ---------------------------------------------------------------------------

export function serializeDeterministic(value: unknown): string {
  return JSON.stringify(value, replacer);
}

function replacer(_key: string, value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(item =>
    typeof item === "object" && item !== null
      ? sortObjectKeys(item as Record<string, unknown>)
      : item
  );
  return sortObjectKeys(value as Record<string, unknown>);
}

function sortObjectKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    const val = obj[key];
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      sorted[key] = sortObjectKeys(val as Record<string, unknown>);
    } else {
      sorted[key] = val;
    }
  }
  return sorted;
}

export function serializeLine(record: CanonicalRecord): string {
  return serializeDeterministic(record) + "\\n";
}

export function isUtf8Boundary(bytes: Uint8Array, offset: number): boolean {
  if (offset === bytes.length) return true;
  return (bytes[offset] & 0xc0) !== 0x80;
}`);

// -- lib/offsets.ts --
registerFile("src/lib/offsets.ts", `// ---------------------------------------------------------------------------
// Offset arithmetic — §5
// Offsets are bigint everywhere
// ---------------------------------------------------------------------------

export function nextLineOffset(
  currentOffset: bigint,
  lineByteLength: bigint,
): { range: ByteRange; nextOffset: bigint } {
  return {
    range: { start: currentOffset, len: lineByteLength },
    nextOffset: currentOffset + lineByteLength,
  };
}

export function formatRangeHeader(range: ByteRange): string {
  const end = range.start + range.len - 1n;
  return \`bytes=\${range.start}-\${end}\`;
}

// Example:
//   formatRangeHeader({ start: 17482210n, len: 17552n })
//   → "bytes=17482210-17499761"

export function validateRange(range: ByteRange, objectSize: bigint): void {
  if (range.start < 0n) throw new Error(\`Negative offset: \${range.start}\`);
  if (range.start + range.len > objectSize)
    throw new Error(\`Range exceeds object size\`);
}`);

// -- lib/errors.ts --
registerFile("src/lib/errors.ts", `// ---------------------------------------------------------------------------
// Typed errors — §11 resolver behaviour
// ---------------------------------------------------------------------------

export class ObjectPurgedError extends Error {
  readonly objectId: string;
  readonly contentHash: string;
  constructor(objectId: string, contentHash: string) {
    super(\`Object \${objectId} has been purged\`);
    this.name = "ObjectPurgedError";
    this.objectId = objectId;
    this.contentHash = contentHash;
  }
}

export class RangeNotAddressableError extends Error {
  readonly objectId: string;
  constructor(objectId: string) {
    super(\`Object \${objectId} is not range-addressable\`);
    this.name = "RangeNotAddressableError";
    this.objectId = objectId;
  }
}

export class ReplicaDivergentError extends Error {
  readonly objectId: string;
  readonly provider: string;
  constructor(objectId: string, provider: string, expected: string, actual: string) {
    super(\`Replica on \${provider} for \${objectId} divergent\`);
    this.name = "ReplicaDivergentError";
    this.objectId = objectId;
    this.provider = provider;
  }
}

export class EmbeddingModelMismatchError extends Error {
  readonly models: readonly string[];
  constructor(models: readonly string[]) {
    super(\`KNN spans multiple models: \${models.join(", ")}\`);
    this.name = "EmbeddingModelMismatchError";
    this.models = models;
  }
}

export class ProjectionMissError extends Error {
  readonly sessionId: string;
  constructor(sessionId: string) {
    super(\`Session \${sessionId} not in local projection\`);
    this.name = "ProjectionMissError";
    this.sessionId = sessionId;
  }
}`);


// ---- File Tree Component ---------------------------------------------------

function FileTreeItem({
  node,
  depth,
  selectedPath,
  onSelect,
  expanded,
  onToggle,
}: {
  node: FileNode;
  depth: number;
  selectedPath: string | null;
  onSelect: (path: string) => void;
  expanded: Set<string>;
  onToggle: (path: string) => void;
}) {
  const isExpanded = expanded.has(node.path);
  const isSelected = selectedPath === node.path;
  const isDir = node.kind === "directory";

  return (
    <div>
      <button
        className={`w-full text-left flex items-center gap-1.5 px-2 py-1 rounded text-sm transition-colors ${
          isSelected
            ? "bg-sky-500/15 text-sky-300"
            : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          if (isDir) {
            onToggle(node.path);
          } else {
            onSelect(node.path);
          }
        }}
      >
        {isDir ? (
          <svg
            className={`w-3.5 h-3.5 shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        {isDir ? (
          <svg className="w-4 h-4 shrink-0 text-amber-400/70" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
        <span className="truncate">{node.name}</span>
        {node.specRef && (
          <span className="ml-auto text-[10px] text-slate-600 shrink-0">
            {node.specRef.join(" ")}
          </span>
        )}
      </button>
      {isDir && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Syntax Highlighting (simple) ------------------------------------------

function highlightTS(code: string): string {
  // Escape HTML
  let html = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Comments
  html = html.replace(/(\/\/.*$)/gm, '<span class="text-slate-500 italic">$1</span>');
  html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-slate-500 italic">$1</span>');

  // Strings
  html = html.replace(/("(?:[^"\\]|\\.)*")/g, '<span class="text-emerald-400">$1</span>');
  html = html.replace(/('(?:[^'\\]|\\.)*')/g, '<span class="text-emerald-400">$1</span>');
  html = html.replace(/(`(?:[^`\\]|\\.)*`)/g, '<span class="text-emerald-400">$1</span>');

  // Keywords
  const keywords = ["export", "const", "let", "var", "function", "interface", "type", "readonly", "import", "from", "as", "return", "if", "else", "throw", "new", "class", "extends", "async", "await", "typeof", "void", "null", "undefined", "true", "false"];
  for (const kw of keywords) {
    html = html.replace(
      new RegExp(`\\b(${kw})\\b`, "g"),
      '<span class="text-purple-400">$1</span>'
    );
  }

  // Types
  const types = ["string", "number", "boolean", "bigint", "unknown", "any", "never", "Promise", "Uint8Array", "Record", "Readonly", "AsyncIterator", "AsyncIterable"];
  for (const t of types) {
    html = html.replace(
      new RegExp(`\\b(${t})\\b`, "g"),
      '<span class="text-sky-300">$1</span>'
    );
  }

  // SQL keywords (for schema files)
  const sqlKw = ["CREATE", "TABLE", "SELECT", "FROM", "WHERE", "AND", "ORDER", "BY", "LIMIT", "FACET", "INSERT", "ALTER", "DROP", "engine", "attribute", "text", "int", "bool"];
  for (const kw of sqlKw) {
    html = html.replace(
      new RegExp(`\\b(${kw})\\b`, "g"),
      '<span class="text-amber-400">$1</span>'
    );
  }

  return html;
}

// ---- Code Viewer -----------------------------------------------------------

function CodeViewer({ path, content, lang }: { path: string; content: string; lang: string }) {
  const lines = content.split("\n");
  const highlighted = highlightTS(content);
  const highlightedLines = highlighted.split("\n");

  return (
    <div className="h-full flex flex-col">
      {/* File header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 border-b border-slate-700/50">
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-sm text-slate-300 font-mono">{path}</span>
        <span className="ml-auto text-xs text-slate-600">{lang}</span>
        <span className="text-xs text-slate-600">{lines.length} lines</span>
      </div>

      {/* Code body */}
      <div className="flex-1 overflow-auto">
        <pre className="text-sm leading-relaxed p-0 m-0">
          <code>
            {highlightedLines.map((line, i) => (
              <div key={i} className="flex hover:bg-white/[0.02]">
                <span className="inline-block w-12 text-right pr-4 text-slate-600 select-none shrink-0 text-xs leading-relaxed py-px">
                  {i + 1}
                </span>
                <span
                  className="flex-1 py-px"
                  dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }}
                />
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

// ---- Overview Panel --------------------------------------------------------

function OverviewPanel() {
  const allFiles = useMemo(() => flattenTree(FILE_TREE), []);

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
          Agent History — Scaffolded Codebase
        </h1>
        <p className="text-slate-400 leading-relaxed">
          This is the scaffolded application built from the P1 specification.
          Browse the file tree to explore the conventions, taxonomy, types, schema,
          and library code that implement the Storage, Index &amp; Segment Contract.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Source files", value: allFiles.length.toString(), color: "text-sky-400" },
          { label: "Entity types", value: "13", color: "text-emerald-400" },
          { label: "Adapter interfaces", value: "5", color: "text-purple-400" },
          { label: "Invariants", value: "4", color: "text-amber-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Architecture summary */}
      <div className="space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-sky-500/20 text-sky-400 text-xs flex items-center justify-center font-bold">1</span>
            Conventions & Taxonomy
          </h2>
          <div className="bg-slate-800/30 border border-slate-700/40 rounded-lg p-4 text-sm text-slate-400">
            <p className="mb-2"><code className="text-sky-300">src/constants/</code> — The locked vocabulary.</p>
            <ul className="list-disc list-inside space-y-1 text-slate-500">
              <li><code className="text-slate-300">planes.ts</code> — Four planes: EXECUTION / EVIDENCE / KNOWLEDGE / CONTEXT</li>
              <li><code className="text-slate-300">prefixes.ts</code> — Branded ID prefixes and type-level enforcement</li>
              <li><code className="text-slate-300">taxonomy.ts</code> — Canonical terms, forbidden variants, drift detection</li>
              <li><code className="text-slate-300">invariants.ts</code> — I-1 through I-4 as machine-checkable constraints</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">2</span>
            Types & Interfaces
          </h2>
          <div className="bg-slate-800/30 border border-slate-700/40 rounded-lg p-4 text-sm text-slate-400">
            <p className="mb-2"><code className="text-sky-300">src/types/</code> — All data shapes and adapter contracts.</p>
            <ul className="list-disc list-inside space-y-1 text-slate-500">
              <li><code className="text-slate-300">entities.ts</code> — 13 entity interfaces across 4 planes</li>
              <li><code className="text-slate-300">storage.ts</code> — ObjectRef, ByteRange, storage key convention</li>
              <li><code className="text-slate-300">segment.ts</code> — Segment fields, segmentation policy</li>
              <li><code className="text-slate-300">catalog.ts</code> — CatalogRow, CatalogResolver</li>
              <li><code className="text-slate-300">retrieval.ts</code> — Search/Expand/Materialize types, ProjectionMiss</li>
              <li><code className="text-slate-300">adapters.ts</code> — 5 adapter interfaces (Capture, Storage, Index, Embedding, Retrieval)</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center font-bold">3</span>
            Schema
          </h2>
          <div className="bg-slate-800/30 border border-slate-700/40 rounded-lg p-4 text-sm text-slate-400">
            <p className="mb-2"><code className="text-sky-300">src/schema/</code> — Manticore DDL and query templates.</p>
            <ul className="list-disc list-inside space-y-1 text-slate-500">
              <li><code className="text-slate-300">manticore.ts</code> — CREATE TABLE for catalog + segment, example queries</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">4</span>
            Library
          </h2>
          <div className="bg-slate-800/30 border border-slate-700/40 rounded-lg p-4 text-sm text-slate-400">
            <p className="mb-2"><code className="text-sky-300">src/lib/</code> — Core logic implementations.</p>
            <ul className="list-disc list-inside space-y-1 text-slate-500">
              <li><code className="text-slate-300">identity.ts</code> — ULID generation, branded ID minting</li>
              <li><code className="text-slate-300">serialization.ts</code> — Deterministic JSON, JSONL lines, UTF-8 boundary checks</li>
              <li><code className="text-slate-300">offsets.ts</code> — BigInt offset arithmetic, range formatting</li>
              <li><code className="text-slate-300">errors.ts</code> — Typed errors (ObjectPurged, ReplicaDivergent, etc.)</li>
            </ul>
          </div>
        </section>
      </div>

      {/* Design principles */}
      <div className="mt-10 p-5 bg-gradient-to-r from-sky-950/20 to-purple-950/20 border border-sky-800/20 rounded-xl">
        <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider mb-3">Design Principles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-400">
          <div className="flex gap-2">
            <span className="text-sky-500 shrink-0">→</span>
            <span>Canonical identity owned by the catalog, never by infrastructure</span>
          </div>
          <div className="flex gap-2">
            <span className="text-sky-500 shrink-0">→</span>
            <span>Index is droppable and fully rebuildable from the bucket</span>
          </div>
          <div className="flex gap-2">
            <span className="text-sky-500 shrink-0">→</span>
            <span>Objects are immutable, uncompressed, content-addressed</span>
          </div>
          <div className="flex gap-2">
            <span className="text-sky-500 shrink-0">→</span>
            <span>Every machine holds the complete catalog</span>
          </div>
          <div className="flex gap-2">
            <span className="text-sky-500 shrink-0">→</span>
            <span>Three retrieval verbs with visible cost at each step</span>
          </div>
          <div className="flex gap-2">
            <span className="text-sky-500 shrink-0">→</span>
            <span>Five adapter interfaces — one per vendor seam</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Main App --------------------------------------------------------------

export default function App() {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(["src", "src/constants", "src/types", "src/schema", "src/lib"])
  );
  const [mobileTreeOpen, setMobileTreeOpen] = useState(false);

  const toggleExpand = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const selectedFile = selectedPath ? SOURCE_FILES[selectedPath] : null;

  return (
    <div className="h-screen flex flex-col bg-[#0a0e17] text-slate-200 overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b border-slate-800 bg-[#0d1321]">
        <div className="flex items-center h-12 px-4">
          <button
            className="lg:hidden mr-3 p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5"
            onClick={() => setMobileTreeOpen(!mobileTreeOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">P1</span>
            </div>
            <div>
              <span className="text-sm font-semibold text-white">agent-history</span>
              <span className="text-slate-600 mx-2">/</span>
              <span className="text-sm text-slate-400">scaffold</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-slate-600">
              LEVERAGEAI · AGENT-HISTORY
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
              DRAFT
            </span>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside
          className={`absolute lg:relative z-20 h-full w-72 shrink-0 bg-[#0d1321] border-r border-slate-800 overflow-y-auto transition-transform ${
            mobileTreeOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 px-2 mb-2">
              Explorer
            </div>
            <FileTreeItem
              node={FILE_TREE}
              depth={0}
              selectedPath={selectedPath}
              onSelect={(path) => {
                setSelectedPath(path);
                setMobileTreeOpen(false);
              }}
              expanded={expanded}
              onToggle={toggleExpand}
            />
          </div>
        </aside>

        {/* Mobile overlay */}
        {mobileTreeOpen && (
          <div
            className="absolute inset-0 z-10 bg-black/50 lg:hidden"
            onClick={() => setMobileTreeOpen(false)}
          />
        )}

        {/* Content */}
        <main className="flex-1 overflow-hidden">
          {selectedPath && selectedFile ? (
            <CodeViewer path={selectedPath} content={selectedFile.content} lang={selectedFile.lang} />
          ) : (
            <div className="h-full overflow-y-auto">
              <OverviewPanel />
            </div>
          )}
        </main>
      </div>

      {/* Status bar */}
      <footer className="shrink-0 h-6 border-t border-slate-800 bg-[#0d1321] flex items-center px-4 text-[11px] text-slate-600">
        <span>P1 · Storage, Index & Segment Contract</span>
        <span className="mx-2">·</span>
        <span>{selectedPath ? selectedPath : `${flattenTree(FILE_TREE).length} files`}</span>
        <span className="ml-auto">TypeScript · Manticore 13.11.0+</span>
      </footer>
    </div>
  );
}
