// ---------------------------------------------------------------------------
// Planes — §2 Entity Registry
//
// The four planes, in that order. Any document reordering or renaming them
// is non-conformant per the Taxonomy Lock v2 (Appendix A).
// ---------------------------------------------------------------------------

export const PLANES = [
  "EXECUTION",
  "EVIDENCE",
  "KNOWLEDGE",
  "CONTEXT",
] as const;

export type Plane = (typeof PLANES)[number];

/**
 * Map each entity kind to its plane.
 * This is the single source of truth — §2 states there is no second list.
 */
export const ENTITY_PLANE: Record<EntityKind, Plane> = {
  source: "EXECUTION",
  provider: "EXECUTION",
  harness: "EXECUTION",
  run: "EXECUTION",
  capture: "EVIDENCE",
  object: "EVIDENCE",
  manifest: "EVIDENCE",
  session: "KNOWLEDGE",
  message: "KNOWLEDGE",
  "tool-event": "KNOWLEDGE",
  "artifact-reference": "KNOWLEDGE",
  artifact: "KNOWLEDGE",
  segment: "CONTEXT",
  "context-pack": "CONTEXT",
};

/**
 * The thirteen entity kinds from §2.
 * Any document introducing a fourteenth must amend the registry.
 */
export const ENTITY_KINDS = [
  "source",
  "provider",
  "harness",
  "run",
  "capture",
  "object",
  "manifest",
  "session",
  "message",
  "tool-event",
  "artifact-reference",
  "artifact",
  "segment",
  "context-pack",
] as const;

export type EntityKind = (typeof ENTITY_KINDS)[number];

/**
 * Entities that own bytes (directly store content in the bucket).
 */
export const BYTE_OWNING_ENTITIES: readonly EntityKind[] = [
  "capture",
  "object",
  "manifest",
  "session",
  "artifact",
];

export function ownsBytes(kind: EntityKind): boolean {
  return BYTE_OWNING_ENTITIES.includes(kind);
}
