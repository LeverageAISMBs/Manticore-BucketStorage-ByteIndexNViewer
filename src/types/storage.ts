// ---------------------------------------------------------------------------
// Storage types — §4 Object Storage Contract
//
// Content-addressed, uncompressed, written-once. The three properties
// that together make a byte offset a durable address.
// ---------------------------------------------------------------------------

import type { ObjectId } from "../constants/prefixes.js";

/**
 * Reference to a stored object. Returned by StorageAdapter.put().
 */
export interface ObjectRef {
  readonly objectId: ObjectId;
  readonly contentHash: string; // sha256:<hex>
  readonly sizeBytes: bigint;
  readonly rangeAddressable: boolean;
}

/**
 * A byte range within a stored object.
 * Uses bigint because Manticore's int is 32-bit unsigned (~4.29 GB cap),
 * and repository snapshots can exceed that.
 */
export interface ByteRange {
  readonly start: bigint;
  readonly len: bigint;
}

/**
 * Storage key convention — §4.
 *
 *   objects/<hash[0:2]>/<hash[2:4]>/<hash>
 *
 * The two-level fan-out keeps bucket listings navigable at tens of
 * millions of objects.
 */
export function storageKey(contentHash: string): string {
  const hex = contentHash.replace(/^sha256:/, "");
  return `objects/${hex.slice(0, 2)}/${hex.slice(2, 4)}/${hex}`;
}

/**
 * Encoding rules — non-negotiable, §4.
 */
export const ENCODING_RULES = {
  required: [
    "Stored uncompressed at rest",
    "UTF-8, no BOM",
    "LF line endings only",
    "Byte offsets, never character offsets",
    "Every offset lands on a UTF-8 boundary",
  ],
  forbidden: [
    "Server-side or client-side gzip on canonical objects",
    "Transfer encodings that alter stored bytes",
    "Overwriting an existing key",
    'Re-serializing an object "for tidiness"',
    "CRLF anywhere in the pipeline",
  ],
} as const;

/**
 * Replica placement record — §4.
 */
export interface ReplicaPlacement {
  readonly objectId: ObjectId;
  readonly contentHash: string;
  readonly sizeBytes: bigint;
  readonly rangeAddressable: boolean;
  readonly replicas: readonly ReplicaRecord[];
  readonly durability: {
    readonly replicaCount: number;
    readonly providerCount: number;
  };
}

export interface ReplicaRecord {
  readonly provider: string;
  readonly status: "verified" | "divergent" | "pending";
  readonly verifiedAt: string;
}
