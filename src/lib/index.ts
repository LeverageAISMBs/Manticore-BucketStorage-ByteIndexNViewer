// ---------------------------------------------------------------------------
// Lib barrel export
// ---------------------------------------------------------------------------

export {
  generateUlid,
  mintId,
  mintIdWithPrefix,
  extractTimestamp,
} from "./identity.js";

export {
  serializeDeterministic,
  serializeLine,
  utf8ByteLength,
  isUtf8Boundary,
  buildHeaderLine,
  buildFooterLine,
} from "./serialization.js";

export {
  nextLineOffset,
  subSegmentRange,
  formatRangeHeader,
  parseContentRange,
  validateOffset,
  validateRange,
} from "./offsets.js";

export {
  ObjectPurgedError,
  RangeNotAddressableError,
  ReplicaDivergentError,
  EmbeddingModelMismatchError,
  ProjectionMissError,
  Utf8BoundaryError,
} from "./errors.js";
