// ---------------------------------------------------------------------------
// Adapter interfaces — §11
//
// Five seams, five interfaces. Every vendor in this architecture sits
// behind exactly one of them.
// ---------------------------------------------------------------------------

import type { Provider, Harness } from "./entities.js";
import type { ObjectRef, ByteRange } from "./storage.js";
import type { SegmentRow } from "./segment.js";
import type { SearchQuery, SearchResult, ExpandResult, MaterializeResult } from "./retrieval.js";

/**
 * Minimal readable stream interface.
 * In Node.js this is stream.Readable; in the browser it can be
 * a ReadableStream<Uint8Array> or an AsyncIterable<Uint8Array>.
 */
export interface ReadableStreamLike {
  [Symbol.asyncIterator](): AsyncIterator<Uint8Array>;
  pipe?(destination: unknown): unknown;
}

// ---- Canonical record (output of capture adapters) -------------------------

export type CanonicalRecordKind = "header" | "message" | "tool_event" | "artifact_ref" | "footer";

export interface CanonicalRecord {
  readonly kind: CanonicalRecordKind;
  readonly seq?: number;
  readonly messageId?: string;
  readonly toolEventId?: string;
  readonly artifactId?: string;
  readonly sessionId?: string;
  readonly data: Record<string, unknown>;
}

// ---- 1. CAPTURE ------------------------------------------------------------

/**
 * Provider/harness output → canonical records.
 * Each adapter knows how to detect and normalize one harness's raw format.
 */
export interface CaptureAdapter {
  readonly harness: Harness;
  readonly provider: Provider;
  detect(path: string): Promise<boolean>;
  normalize(raw: ReadableStreamLike): AsyncIterable<CanonicalRecord>;
}

// ---- 2. STORAGE ------------------------------------------------------------

/**
 * Content-addressed blobs. Range reads are mandatory.
 * The resolver selects among verified replicas by health → latency → cost.
 */
export interface StorageAdapter {
  readonly id: "r2" | "b2" | "s3" | "minio" | "fs";
  put(hash: string, body: ReadableStreamLike): Promise<ObjectRef>;
  getRange(hash: string, range: ByteRange): Promise<Uint8Array>;
  head(hash: string): Promise<ObjectRef | null>;
  verify(hash: string): Promise<boolean>;
  purge(hash: string): Promise<void>;
}

// ---- 3. INDEX --------------------------------------------------------------

/**
 * The search projection. Droppable by contract (I-2).
 * Holds zero state that does not exist in the bucket.
 */
export interface IndexAdapter {
  readonly id: "manticore";
  upsertSegments(rows: readonly SegmentRow[]): Promise<void>;
  deleteByObject(objectId: string): Promise<number>;
  search(q: SearchQuery): Promise<SearchResult>;
  expand(segmentId: string, depth: number): Promise<readonly SegmentRow[]>;
  drop(): Promise<void>;
}

// ---- 4. EMBEDDING ----------------------------------------------------------

/**
 * Declared, not invoked, when auto-embeddings are on.
 * The model runs inside Manticore via ONNX.
 *
 * embed_model is not optional bookkeeping — vectors from two different
 * models are not comparable (G-7).
 */
export interface EmbeddingAdapter {
  readonly modelName: string;
  readonly dims: number;
  readonly normalized: boolean;
}

// ---- 5. RETRIEVAL ----------------------------------------------------------

/**
 * The agent-facing surface. Three verbs.
 *
 *   search      → hits + cost
 *   expand      → wider projection
 *   materialize → bytes
 *
 * Each step is a decision point. Cost is visible before it is paid.
 */
export interface RetrievalAdapter {
  search(q: SearchQuery): Promise<SearchResult>;
  expand(segmentId: string, depth: number): Promise<ExpandResult>;
  materialize(objectId: string, range?: ByteRange): Promise<MaterializeResult>;
}
