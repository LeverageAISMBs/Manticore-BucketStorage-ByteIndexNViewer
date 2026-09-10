// ---------------------------------------------------------------------------
// Typed errors — §11 Adapter Interfaces (resolver behaviour)
//
// Failures surface as typed errors — never as a swallowed exception
// or a null return.
// ---------------------------------------------------------------------------

/**
 * Object has been purged from all replicas.
 * The manifest retains the content_hash for audit.
 */
export class ObjectPurgedError extends Error {
  readonly objectId: string;
  readonly contentHash: string;

  constructor(objectId: string, contentHash: string) {
    super(`Object ${objectId} (hash: ${contentHash}) has been purged`);
    this.name = "ObjectPurgedError";
    this.objectId = objectId;
    this.contentHash = contentHash;
  }
}

/**
 * Object exists but is not range-addressable (compressed or flagged).
 * Cannot perform byte-range reads.
 */
export class RangeNotAddressableError extends Error {
  readonly objectId: string;

  constructor(objectId: string) {
    super(`Object ${objectId} is not range-addressable`);
    this.name = "RangeNotAddressableError";
    this.objectId = objectId;
  }
}

/**
 * A replica's bytes do not match the catalog's content_hash.
 * The replica is excluded from the resolver's candidate set.
 */
export class ReplicaDivergentError extends Error {
  readonly objectId: string;
  readonly provider: string;
  readonly expectedHash: string;
  readonly actualHash: string;

  constructor(
    objectId: string,
    provider: string,
    expectedHash: string,
    actualHash: string,
  ) {
    super(
      `Replica on ${provider} for object ${objectId} is divergent: ` +
      `expected ${expectedHash}, got ${actualHash}`,
    );
    this.name = "ReplicaDivergentError";
    this.objectId = objectId;
    this.provider = provider;
    this.expectedHash = expectedHash;
    this.actualHash = actualHash;
  }
}

/**
 * A KNN query spans two different embed_model values.
 * Vectors from different models are not comparable (G-7).
 */
export class EmbeddingModelMismatchError extends Error {
  readonly models: readonly string[];

  constructor(models: readonly string[]) {
    super(
      `KNN query spans multiple embedding models: ${models.join(", ")}. ` +
      `Vectors from different models are not comparable.`,
    );
    this.name = "EmbeddingModelMismatchError";
    this.models = models;
  }
}

/**
 * A partial projection lacks the requested session.
 * Routes to the server rather than returning an empty result (G-8).
 */
export class ProjectionMissError extends Error {
  readonly sessionId: string;

  constructor(sessionId: string) {
    super(
      `Session ${sessionId} is not in the local projection. ` +
      `This is a projection_miss, not an absence.`,
    );
    this.name = "ProjectionMissError";
    this.sessionId = sessionId;
  }
}

/**
 * A byte offset does not land on a UTF-8 boundary.
 * This indicates corruption in the byte index (G-3).
 */
export class Utf8BoundaryError extends Error {
  readonly offset: bigint;
  readonly objectId: string;

  constructor(objectId: string, offset: bigint) {
    super(
      `Byte offset ${offset} in object ${objectId} does not land on a UTF-8 boundary`,
    );
    this.name = "Utf8BoundaryError";
    this.objectId = objectId;
    this.offset = offset;
  }
}
