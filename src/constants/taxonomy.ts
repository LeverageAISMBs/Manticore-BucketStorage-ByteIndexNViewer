// ---------------------------------------------------------------------------
// Taxonomy Lock v2 — Appendix A
//
// The single authoritative mapping from canonical terms to their meanings,
// plus the variants that must never be used. Drift enters through sample
// records rather than definitions; this lock prevents that.
// ---------------------------------------------------------------------------

export interface TaxonomyEntry {
  readonly canonical: string;
  readonly meaning: string;
  readonly forbidden: readonly string[];
}

// ---- Carried forward from P0 — unchanged -----------------------------------

export const TAXONOMY_P0: readonly TaxonomyEntry[] = [
  {
    canonical: "pi-code",
    meaning: "Provider directory, adapter directory, corpus name",
    forbidden: ["providers/pi/", "Pi"],
  },
  {
    canonical: "history capture pi",
    meaning: "CLI verb only — the CLI token stays short",
    forbidden: ["history capture pi-code"],
  },
  {
    canonical: "provider",
    meaning: "anthropic, openai, google — the model vendor",
    forbidden: ["using provider to mean the CLI"],
  },
  {
    canonical: "harness",
    meaning: "claude-code, codex-cli, gemini-cli, pi-code",
    forbidden: ["collapsing harness into provider"],
  },
  {
    canonical: "raw / canonical / markdown",
    meaning: "L1 / L2 / L3 directory names inside a provider",
    forbidden: ["archive", "normalized", "clean"],
  },
  {
    canonical: "shared/corpus/",
    meaning: "The materialized federation (L5)",
    forbidden: ["merged", "global", "unified"],
  },
  {
    canonical: "organization/current/",
    meaning: "Normative, presently-believed state",
    forbidden: ["truth", "master", "latest"],
  },
  {
    canonical: "context pack / ctx_",
    meaning: "Assembled continuation state (L7)",
    forbidden: ["bundle", "payload", "briefing"],
  },
  {
    canonical: "EXECUTION / EVIDENCE / KNOWLEDGE / CONTEXT",
    meaning: "The four planes, in that order",
    forbidden: ["renaming or reordering planes"],
  },
  {
    canonical: "P0–P8",
    meaning: "Implementation packages",
    forbidden: ["phases", "milestones", "sprints"],
  },
];

// ---- New in P1 -------------------------------------------------------------

export const TAXONOMY_P1: readonly TaxonomyEntry[] = [
  {
    canonical: "object / obj_",
    meaning: "A content-addressed blob in a bucket",
    forbidden: ["blob", "file", "artifact"],
  },
  {
    canonical: "segment / seg_",
    meaning: "An addressable slice: byte range + text range + locator",
    forbidden: ["chunk", "span (only a sub-segment ref_kind)", "shard"],
  },
  {
    canonical: "content_hash",
    meaning: "sha256 of the exact stored bytes",
    forbidden: ["etag", "checksum", "digest"],
  },
  {
    canonical: "byte_start / byte_len",
    meaning: "Byte address of a segment within an object",
    forbidden: ["byte_end", "offset", "position"],
  },
  {
    canonical: "catalog",
    meaning: "The knowledge-of-existence table",
    forbidden: ["registry", "manifest"],
  },
  {
    canonical: "materialize",
    meaning: "The only verb that fetches bytes",
    forbidden: ["fetch", "download", "hydrate", "pull"],
  },
  {
    canonical: "projection_miss",
    meaning: "Machine lacks the searchable representation",
    forbidden: ["not found", "no results", "empty"],
  },
  {
    canonical: "lifecycle",
    meaning: "active / tombstoned / purged",
    forbidden: ["status", "state", "deleted flag"],
  },
];

export const TAXONOMY_ALL: readonly TaxonomyEntry[] = [
  ...TAXONOMY_P0,
  ...TAXONOMY_P1,
];

// ---- Drift detection -------------------------------------------------------

/**
 * The known-inverted record from the architecture draft.
 * provider: claude-code, harness: pi-code is void.
 * Correct form: provider: anthropic, harness: claude-code.
 */
export const KNOWN_DRIFT_PATTERNS: readonly { wrong: string; correct: string }[] = [
  { wrong: "provider: claude-code", correct: "harness: claude-code" },
  { wrong: "harness: pi-code (as provider)", correct: "provider: anthropic (or openai, google)" },
];

/**
 * Check a provider/harness record for the known inversion.
 */
export function validateProviderHarnessRecord(record: {
  provider: string;
  harness: string;
}): { valid: boolean; error?: string } {
  const KNOWN_PROVIDERS = ["anthropic", "openai", "google"] as const;
  const KNOWN_HARNESSES = ["claude-code", "codex-cli", "gemini-cli", "pi-code"] as const;

  if (!(KNOWN_PROVIDERS as readonly string[]).includes(record.provider)) {
    return {
      valid: false,
      error: `"${record.provider}" is not a known provider. Did you mean to use it as a harness?`,
    };
  }
  if (!(KNOWN_HARNESSES as readonly string[]).includes(record.harness)) {
    return {
      valid: false,
      error: `"${record.harness}" is not a known harness.`,
    };
  }
  return { valid: true };
}
