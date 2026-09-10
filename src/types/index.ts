// ---------------------------------------------------------------------------
// Types barrel export
// ---------------------------------------------------------------------------

export type {
  Source,
  Run,
  Capture,
  ObjectEntity,
  Replica,
  StorageProvider,
  ReplicaStatus,
  Manifest,
  LifecycleEvent,
  Session,
  Message,
  ContentBlock,
  ToolEvent,
  ArtifactReference,
  Artifact,
  ArtifactVersion,
  ContextPack,
  LifecycleState,
  Provider,
  Harness,
} from "./entities.js";
export { planeOf } from "./entities.js";

export type {
  ObjectRef,
  ByteRange,
  ReplicaPlacement,
  ReplicaRecord,
} from "./storage.js";
export { storageKey, ENCODING_RULES } from "./storage.js";

export type {
  Segment,
  SegmentRow,
  RefKind,
} from "./segment.js";
export { SEGMENTATION_POLICY, assertDistinctRanges } from "./segment.js";

export type {
  CatalogRow,
  CatalogResolver,
} from "./catalog.js";

export type {
  SearchQuery,
  SearchHit,
  FacetCount,
  SearchResult,
  ExpandResult,
  ExpandedSegment,
  MaterializeResult,
  ProjectionMiss,
  RetrievalResult,
} from "./retrieval.js";

export type {
  CanonicalRecord,
  CanonicalRecordKind,
  CaptureAdapter,
  StorageAdapter,
  IndexAdapter,
  EmbeddingAdapter,
  RetrievalAdapter,
} from "./adapters.js";
