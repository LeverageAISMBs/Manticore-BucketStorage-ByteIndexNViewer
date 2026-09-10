// ---------------------------------------------------------------------------
// Identity prefixes — §3 Identity Contract
//
// Every entity carries a branded, prefixed, lexicographically sortable
// string ID minted by the catalog.
//
// Format: <prefix>_<26-char Crockford base32 ULID>
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

/**
 * Branded string type for a catalog-minted ID.
 * The brand prevents accidental use of provider-native IDs as keys.
 */
export type BrandedId<P extends string> = string & { readonly __prefix: P };

export type SourceId = BrandedId<"src">;
export type RunId = BrandedId<"run">;
export type CaptureId = BrandedId<"cap">;
export type ObjectId = BrandedId<"obj">;
export type SessionId = BrandedId<"ses">;
export type MessageId = BrandedId<"msg">;
export type ToolEventId = BrandedId<"tev">;
export type ArtifactId = BrandedId<"art">;
export type ArtifactVersionId = BrandedId<"arv">;
export type SegmentId = BrandedId<"seg">;
export type ContextPackId = BrandedId<"ctx">;

/**
 * Validate that a string matches the expected prefix and ULID length.
 * ULID body is 26 Crockford base32 characters.
 */
export function isValidBrandedId(
  value: string,
  expectedPrefix: IdPrefix,
): boolean {
  const prefix = `${expectedPrefix}_`;
  if (!value.startsWith(prefix)) return false;
  const ulid = value.slice(prefix.length);
  if (ulid.length !== 26) return false;
  return /^[0-9A-HJKMNP-TV-Z]{26}$/i.test(ulid);
}
