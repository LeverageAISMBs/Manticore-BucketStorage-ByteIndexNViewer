// ---------------------------------------------------------------------------
// Identity — §3 Identity Contract
//
// ULID generation and branded ID minting.
//
// ULIDs: 48-bit millisecond timestamp + 80-bit randomness, encoded
// as 26 Crockford base32 characters. Sort chronologically as strings.
// ---------------------------------------------------------------------------

import { ID_PREFIXES, type BrandedId, type IdPrefix } from "../constants/prefixes.js";

// ---- Crockford Base32 ------------------------------------------------------

const CROCKFORD_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function encodeBase32(bytes: Uint8Array): string {
  let result = "";
  let bits = 0;
  let value = 0;

  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      result += CROCKFORD_ALPHABET[(value >>> bits) & 0x1f];
    }
  }

  if (bits > 0) {
    result += CROCKFORD_ALPHABET[(value << (5 - bits)) & 0x1f];
  }

  return result;
}

// ---- ULID generation -------------------------------------------------------

/**
 * Generate a ULID: 48-bit timestamp + 80-bit randomness.
 *
 * Uses crypto.getRandomValues when available (browser + Node 19+),
 * falls back to Math.random for environments without it.
 */
export function generateUlid(): string {
  const now = Date.now();

  // 48-bit timestamp (6 bytes)
  const timeBytes = new Uint8Array(6);
  let ts = now;
  for (let i = 5; i >= 0; i--) {
    timeBytes[i] = ts & 0xff;
    ts = Math.floor(ts / 256);
  }

  // 80-bit randomness (10 bytes)
  const randomBytes = new Uint8Array(10);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < 10; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }

  const timePart = encodeBase32(timeBytes).padStart(10, "0");
  const randomPart = encodeBase32(randomBytes).padStart(16, "0");

  return timePart + randomPart;
}

// ---- Branded ID minting ----------------------------------------------------

type EntityWithPrefix = keyof typeof ID_PREFIXES;

/**
 * Mint a new branded ID for an entity.
 *
 *   mintId("session") → "ses_01JQ8Z3K7M4P2V9XR6TB5NCWDH"
 *
 * The returned type is branded to prevent use of raw strings as IDs.
 */
export function mintId<K extends EntityWithPrefix>(
  entity: K,
): BrandedId<(typeof ID_PREFIXES)[K]> {
  const prefix = ID_PREFIXES[entity];
  const ulid = generateUlid();
  return `${prefix}_${ulid}` as BrandedId<(typeof ID_PREFIXES)[K]>;
}

/**
 * Mint an ID with a specific prefix string (for dynamic entity kinds).
 */
export function mintIdWithPrefix(prefix: IdPrefix): string {
  return `${prefix}_${generateUlid()}`;
}

/**
 * Extract the timestamp from a ULID-based ID.
 */
export function extractTimestamp(id: string): Date {
  const parts = id.split("_");
  if (parts.length !== 2) {
    throw new Error(`Invalid branded ID format: ${id}`);
  }
  const ulidPart = parts[1];
  if (ulidPart.length !== 26) {
    throw new Error(`Invalid ULID length in ID: ${id}`);
  }

  // Decode first 10 characters (48-bit timestamp)
  let timestamp = 0;
  for (let i = 0; i < 10; i++) {
    const charIndex = CROCKFORD_ALPHABET.indexOf(ulidPart[i].toUpperCase());
    if (charIndex === -1) {
      throw new Error(`Invalid Crockford base32 character in ID: ${id}`);
    }
    timestamp = timestamp * 32 + charIndex;
  }

  return new Date(timestamp);
}
