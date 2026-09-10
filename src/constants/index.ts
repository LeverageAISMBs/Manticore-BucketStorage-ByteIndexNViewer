// ---------------------------------------------------------------------------
// Constants barrel export
// ---------------------------------------------------------------------------

export { PLANES, ENTITY_PLANE, ENTITY_KINDS, BYTE_OWNING_ENTITIES, ownsBytes } from "./planes.js";
export type { Plane, EntityKind } from "./planes.js";

export {
  ID_PREFIXES,
  isValidBrandedId,
} from "./prefixes.js";
export type {
  IdPrefix,
  BrandedId,
  SourceId,
  RunId,
  CaptureId,
  ObjectId,
  SessionId,
  MessageId,
  ToolEventId,
  ArtifactId,
  ArtifactVersionId,
  SegmentId,
  ContextPackId,
} from "./prefixes.js";

export {
  TAXONOMY_P0,
  TAXONOMY_P1,
  TAXONOMY_ALL,
  KNOWN_DRIFT_PATTERNS,
  validateProviderHarnessRecord,
} from "./taxonomy.js";
export type { TaxonomyEntry } from "./taxonomy.js";

export { INVARIANTS } from "./invariants.js";
export type { Invariant } from "./invariants.js";
