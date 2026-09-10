// ---------------------------------------------------------------------------
// Deterministic serialization — §5 Canonical Object Format
//
// Serialization must be deterministic or the hash is meaningless
// across rebuilds:
//   - Keys sorted
//   - No insignificant whitespace
//   - \n terminator on every line including the last
//   - Non-ASCII emitted as literal UTF-8, not \u escapes
// ---------------------------------------------------------------------------

import type { CanonicalRecord } from "../types/adapters.js";

/**
 * Deterministic JSON serialization.
 *
 * Keys are sorted lexicographically at every nesting level.
 * No whitespace. Non-ASCII stays as literal UTF-8.
 */
export function serializeDeterministic(value: unknown): string {
  return JSON.stringify(value, replacer);
}

function replacer(_key: string, value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value !== "object") return value;

  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        return sortObjectKeys(item as Record<string, unknown>);
      }
      return item;
    });
  }

  return sortObjectKeys(value as Record<string, unknown>);
}

function sortObjectKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const sorted: Record<string, unknown> = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    const val = obj[key];
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      sorted[key] = sortObjectKeys(val as Record<string, unknown>);
    } else if (Array.isArray(val)) {
      sorted[key] = val.map((item) =>
        item !== null && typeof item === "object" && !Array.isArray(item)
          ? sortObjectKeys(item as Record<string, unknown>)
          : item,
      );
    } else {
      sorted[key] = val;
    }
  }
  return sorted;
}

/**
 * Serialize a canonical record to a single JSONL line.
 *
 * The line includes a trailing \n. The writer tracks offsets as
 * BigInt to avoid Number precision loss on large objects.
 */
export function serializeLine(record: CanonicalRecord): string {
  return serializeDeterministic(record) + "\n";
}

/**
 * Compute the byte length of a UTF-8 string.
 * Uses TextEncoder for accurate byte counting.
 */
export function utf8ByteLength(str: string): number {
  return new TextEncoder().encode(str).byteLength;
}

/**
 * Verify that a byte offset lands on a UTF-8 boundary.
 *
 * A position is a valid UTF-8 boundary if the byte at that position
 * is not a continuation byte (10xxxxxx).
 */
export function isUtf8Boundary(bytes: Uint8Array, offset: number): boolean {
  if (offset < 0 || offset > bytes.length) return false;
  if (offset === bytes.length) return true; // end is always a boundary
  const byte = bytes[offset];
  // Continuation bytes: 10xxxxxx (0x80-0xBF)
  return (byte & 0xc0) !== 0x80;
}

/**
 * Build the header line for a canonical session object.
 *
 * Line grammar — §5:
 *   {"kind":"header","session_id":"ses_…","schema":"p0.session/1"}
 */
export function buildHeaderLine(sessionId: string): string {
  return serializeLine({
    kind: "header",
    sessionId,
    data: { session_id: sessionId, schema: "p0.session/1" },
  });
}

/**
 * Build the footer line for a canonical session object.
 *
 * Line grammar — §5:
 *   {"kind":"footer","counts":{…},"content_hash_of_body":"sha256:…"}
 */
export function buildFooterLine(
  counts: Record<string, number>,
  contentHashOfBody: string,
): string {
  return serializeLine({
    kind: "footer",
    data: { counts, content_hash_of_body: contentHashOfBody },
  });
}
