// ---------------------------------------------------------------------------
// Segment types — §6 Segment Contract
//
// A segment binds a knowledge entity to an exact byte range in an exact
// object, plus a text projection cheap enough to answer most queries
// without any bucket call at all.
// ---------------------------------------------------------------------------

import type { SegmentId, SessionId, ObjectId, MessageId, ToolEventId, ArtifactId } from "../constants/prefixes.js";

/**
 * The kind of knowledge entity a segment materializes.
 */
export type RefKind = "message" | "tool_event" | "artifact_ref" | "span";

/**
 * A segment — the only entity that knows both what something means
 * and where its bytes physically are.
 */
export interface Segment {
  readonly segmentId: SegmentId;
  readonly sessionId: SessionId;
  readonly refKind: RefKind;
  readonly refId: string; // msg_ / tev_ / art_
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

/**
 * A segment row as stored in the Manticore segment table.
 * Mirrors the Segment interface but uses string representations
 * for bigint fields (Manticore wire format).
 */
export interface SegmentRow {
  readonly segment_id: string;
  readonly session_id: string;
  readonly ref_kind: RefKind;
  readonly ref_id: string;
  readonly seq: number;
  readonly object_id: string;
  readonly byte_start: string; // bigint as string
  readonly byte_len: string;
  readonly text_start: string;
  readonly text_len: string;
  readonly token_estimate: number;
  readonly body_text: string;
  readonly truncated: boolean;
  readonly provider: string;
  readonly harness: string;
  readonly project: string;
  readonly logical_category?: string;
  readonly created_at: string;
  readonly embed_model: string;
}

/**
 * Segmentation policy — §6.
 *
 * - One segment per canonical line, always. Deterministic floor.
 * - Long assistant messages may produce ref_kind=span sub-segments.
 * - Sub-segments split on paragraph or fenced-code boundaries.
 * - Tool outputs above threshold: body_text truncated, full payload
 *   stays fetchable by range.
 */
export const SEGMENTATION_POLICY = {
  /** One segment per canonical line — the deterministic floor. */
  oneSegmentPerLine: true,

  /** Size threshold (bytes) above which tool output body_text is truncated. */
  toolOutputTruncationThreshold: 16_384,

  /** Sub-segments split on these boundaries only. */
  splitBoundaries: ["paragraph", "fenced-code"] as const,

  /** Never split mid-token or across a UTF-8 boundary. */
  neverSplitMidToken: true,
} as const;

/**
 * byte_range and text_range are not the same range — §6.
 *
 * The byte range addresses the canonical JSONL line (including JSON
 * envelope, tool payload, metadata). The text range addresses the
 * stripped prose inside the extracted projection.
 *
 * A highlighted match at text_start=412 does NOT sit at byte_start+412.
 */
export function assertDistinctRanges(
  byteStart: bigint,
  textStart: bigint,
): void {
  // This is a documentation guard. In practice, byte and text offsets
  // will differ because the byte range includes JSON structure.
  void byteStart;
  void textStart;
}
