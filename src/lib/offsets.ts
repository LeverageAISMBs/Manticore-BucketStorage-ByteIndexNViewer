// ---------------------------------------------------------------------------
// Offset arithmetic — §5 Canonical Object Format
//
// Offsets are bigint everywhere. Manticore's int is 32-bit unsigned
// (~4.29 GB cap). A 400 MB object is fine, but repository snapshots
// and video artifacts can exceed Number.MAX_SAFE_INTEGER territory.
// ---------------------------------------------------------------------------

import type { ByteRange } from "../types/storage.js";

/**
 * Compute the byte range for the next line in a JSONL object.
 *
 * Returns the range and the new offset after this line.
 */
export function nextLineOffset(
  currentOffset: bigint,
  lineByteLength: bigint,
): { range: ByteRange; nextOffset: bigint } {
  return {
    range: {
      start: currentOffset,
      len: lineByteLength,
    },
    nextOffset: currentOffset + lineByteLength,
  };
}

/**
 * Compute the byte range for a segment within a JSONL line.
 *
 * Sub-segments (ref_kind=span) have byte ranges strictly contained
 * by their parent line's range.
 */
export function subSegmentRange(
  lineStart: bigint,
  lineLen: bigint,
  innerStart: bigint,
  innerLen: bigint,
): ByteRange {
  const absoluteStart = lineStart + innerStart;
  const absoluteEnd = absoluteStart + innerLen;
  const lineEnd = lineStart + lineLen;

  if (absoluteStart < lineStart || absoluteEnd > lineEnd) {
    throw new Error(
      `Sub-segment range [${absoluteStart}, ${absoluteEnd}) exceeds ` +
      `parent line range [${lineStart}, ${lineEnd})`,
    );
  }

  return {
    start: absoluteStart,
    len: innerLen,
  };
}

/**
 * Format a byte range as an HTTP Range header value.
 *
 *   formatRangeHeader({ start: 17482210n, len: 17552n })
 *   → "bytes=17482210-17499761"
 */
export function formatRangeHeader(range: ByteRange): string {
  const end = range.start + range.len - 1n;
  return `bytes=${range.start}-${end}`;
}

/**
 * Parse an HTTP Content-Range response header.
 *
 *   parseContentRange("bytes 17482210-17499761/419430400")
 *   → { start: 17482210n, len: 17552n, total: 419430400n }
 */
export function parseContentRange(header: string): {
  start: bigint;
  len: bigint;
  total: bigint;
} {
  const match = header.match(/^bytes (\d+)-(\d+)\/(\d+|\*)$/);
  if (!match) {
    throw new Error(`Invalid Content-Range header: ${header}`);
  }

  const start = BigInt(match[1]);
  const end = BigInt(match[2]);
  const total = match[3] === "*" ? -1n : BigInt(match[3]);

  return {
    start,
    len: end - start + 1n,
    total,
  };
}

/**
 * Validate that a byte offset is within an object's bounds.
 */
export function validateOffset(
  offset: bigint,
  objectSize: bigint,
): void {
  if (offset < 0n) {
    throw new Error(`Negative byte offset: ${offset}`);
  }
  if (offset > objectSize) {
    throw new Error(
      `Byte offset ${offset} exceeds object size ${objectSize}`,
    );
  }
}

/**
 * Validate that a byte range is within an object's bounds.
 */
export function validateRange(
  range: ByteRange,
  objectSize: bigint,
): void {
  validateOffset(range.start, objectSize);
  const end = range.start + range.len;
  if (end > objectSize) {
    throw new Error(
      `Byte range end ${end} exceeds object size ${objectSize}`,
    );
  }
}
