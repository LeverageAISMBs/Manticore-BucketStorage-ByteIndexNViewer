// ---------------------------------------------------------------------------
// Invariants — §1 The four invariants
//
// These are the load-bearing constraints of the system. Any architectural
// decision that violates one must be rejected or the invariant amended.
// ---------------------------------------------------------------------------

export interface Invariant {
  readonly id: string;
  readonly statement: string;
  readonly violationConsequence: string;
}

export const INVARIANTS: readonly Invariant[] = [
  {
    id: "I-1",
    statement:
      "Canonical identity is owned by the catalog, never by a storage provider, search engine, or embedding model.",
    violationConsequence:
      "Swapping R2 for B2, or Manticore for anything else, becomes a migration instead of a config change.",
  },
  {
    id: "I-2",
    statement:
      "Manticore holds zero state that does not exist in the bucket. It is droppable and fully rebuildable.",
    violationConsequence:
      "The index becomes a database of record; auditability claim collapses.",
  },
  {
    id: "I-3",
    statement:
      "Stored objects are immutable and content-addressed. Bytes never change under an offset.",
    violationConsequence:
      "Every stored byte range silently becomes wrong; corruption is undetectable.",
  },
  {
    id: "I-4",
    statement:
      "Every machine holds the complete catalog; only the searchable representation is selectively projected.",
    violationConsequence:
      'A partial index cannot distinguish "does not exist" from "I do not have it" — siloing returns.',
  },
];
