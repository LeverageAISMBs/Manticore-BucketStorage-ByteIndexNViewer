// ---------------------------------------------------------------------------
// Retrieval types — §8 Retrieval Contract
//
// Three verbs: search, expand, materialize.
// Only materialize touches a bucket. Every response states its cost.
// ---------------------------------------------------------------------------

import type { SegmentId, SessionId, ObjectId } from "../constants/prefixes.js";
import type { ByteRange } from "./storage.js";
import type { RefKind } from "./segment.js";

// ---- search ----------------------------------------------------------------

export interface SearchQuery {
  /** Full-text match expression (Manticore MATCH syntax). */
  readonly match?: string;
  /** Hybrid match: lexical + KNN from one query string. */
  readonly hybridMatch?: string;
  /** Filter: project name. */
  readonly project?: string;
  /** Filter: harness. */
  readonly harness?: string | readonly string[];
  /** Filter: provider. */
  readonly provider?: string;
  /** Filter: created after (ISO 8601 or unix timestamp). */
  readonly createdAfter?: string;
  /** Filter: created before. */
  readonly createdBefore?: string;
  /** Filter: ref_kind. */
  readonly refKind?: RefKind | readonly RefKind[];
  /** Filter: logical_category. */
  readonly logicalCategory?: string;
  /** REQUIRED: embed_model scope. G-7: queries spanning two models are rejected. */
  readonly embedModel: string;
  /** Max results. */
  readonly limit?: number;
  /** Facet fields to include counts for. */
  readonly facets?: readonly string[];
}

export interface SearchHit {
  readonly segmentId: string;
  readonly sessionId: string;
  readonly refKind: RefKind;
  readonly seq: number;
  readonly objectId: string;
  readonly byteStart: string;
  readonly byteLen: string;
  readonly tokenEstimate: number;
  readonly score: number; // WEIGHT()
}

export interface FacetCount {
  readonly value: string;
  readonly count: number;
}

export interface SearchResult {
  readonly hits: readonly SearchHit[];
  readonly totalHits: number;
  readonly facets: Readonly<Record<string, readonly FacetCount[]>>;
  /** Total token cost if all hits were expanded. */
  readonly totalTokenEstimate: number;
}

// ---- expand ----------------------------------------------------------------

export interface ExpandResult {
  readonly segments: readonly ExpandedSegment[];
  readonly totalTokenEstimate: number;
}

export interface ExpandedSegment {
  readonly segmentId: string;
  readonly seq: number;
  readonly refKind: RefKind;
  readonly bodyText: string;
  readonly tokenEstimate: number;
}

// ---- materialize -----------------------------------------------------------

export interface MaterializeResult {
  readonly objectId: string;
  readonly range?: ByteRange;
  readonly bytes: Uint8Array;
  readonly byteCount: number;
  /** Lines parsed from the range — whole JSONL lines, no reassembly. */
  readonly lines: readonly string[];
  /** Whether hash verification was performed (first fetch). */
  readonly verified: boolean;
}

// ---- projection miss — §12 -------------------------------------------------

/**
 * When a partial projection lacks a session, the result is an explicit
 * projection_miss that routes to the server — never an empty result set
 * that looks like absence. (I-4, G-8)
 */
export interface ProjectionMiss {
  readonly kind: "projection_miss";
  readonly sessionId: SessionId;
  readonly message: string;
  readonly routeTo: "server";
}

export type RetrievalResult<T> = T | ProjectionMiss;
