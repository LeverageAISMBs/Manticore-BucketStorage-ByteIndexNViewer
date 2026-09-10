// ---------------------------------------------------------------------------
// File tree — the repository layout for the agent-history system
//
// This module defines the canonical file tree as data, consumed by
// the documentation website to render the scaffold browser.
// ---------------------------------------------------------------------------

export interface FileNode {
  readonly name: string;
  readonly path: string;
  readonly kind: "file" | "directory";
  readonly description?: string;
  readonly children?: readonly FileNode[];
  /** For files: which spec section(s) they implement. */
  readonly specRef?: readonly string[];
}

export const FILE_TREE: FileNode = {
  name: "agent-history",
  path: "",
  kind: "directory",
  description: "Repository root",
  children: [
    {
      name: "src",
      path: "src",
      kind: "directory",
      description: "Application source",
      children: [
        {
          name: "constants",
          path: "src/constants",
          kind: "directory",
          description: "Conventions, taxonomy, invariants — the locked vocabulary",
          specRef: ["§2", "§A"],
          children: [
            { name: "planes.ts", path: "src/constants/planes.ts", kind: "file", description: "The four planes: EXECUTION / EVIDENCE / KNOWLEDGE / CONTEXT", specRef: ["§2"] },
            { name: "prefixes.ts", path: "src/constants/prefixes.ts", kind: "file", description: "ID prefix table and branded ID types", specRef: ["§3"] },
            { name: "taxonomy.ts", path: "src/constants/taxonomy.ts", kind: "file", description: "Taxonomy Lock v2 — canonical terms and forbidden variants", specRef: ["§A"] },
            { name: "invariants.ts", path: "src/constants/invariants.ts", kind: "file", description: "The four invariants (I-1 through I-4)", specRef: ["§1"] },
            { name: "index.ts", path: "src/constants/index.ts", kind: "file", description: "Barrel export" },
          ],
        },
        {
          name: "types",
          path: "src/types",
          kind: "directory",
          description: "Entity types, adapter interfaces, data shapes",
          specRef: ["§2", "§3", "§4", "§6", "§7", "§8", "§10", "§11"],
          children: [
            { name: "entities.ts", path: "src/types/entities.ts", kind: "file", description: "All 13 entity types across four planes", specRef: ["§2"] },
            { name: "storage.ts", path: "src/types/storage.ts", kind: "file", description: "ObjectRef, ByteRange, replica placement, encoding rules", specRef: ["§4"] },
            { name: "segment.ts", path: "src/types/segment.ts", kind: "file", description: "Segment fields, SegmentRow, segmentation policy", specRef: ["§6"] },
            { name: "catalog.ts", path: "src/types/catalog.ts", kind: "file", description: "CatalogRow, CatalogResolver", specRef: ["§7.1"] },
            { name: "retrieval.ts", path: "src/types/retrieval.ts", kind: "file", description: "Search/Expand/Materialize types, ProjectionMiss", specRef: ["§8"] },
            { name: "adapters.ts", path: "src/types/adapters.ts", kind: "file", description: "Five adapter interfaces: Capture, Storage, Index, Embedding, Retrieval", specRef: ["§11"] },
            { name: "index.ts", path: "src/types/index.ts", kind: "file", description: "Barrel export" },
          ],
        },
        {
          name: "schema",
          path: "src/schema",
          kind: "directory",
          description: "Manticore DDL and query templates",
          specRef: ["§7", "§8", "§9"],
          children: [
            { name: "manticore.ts", path: "src/schema/manticore.ts", kind: "file", description: "CREATE TABLE DDL, rebuild commands, query templates", specRef: ["§7", "§8", "§9"] },
            { name: "index.ts", path: "src/schema/index.ts", kind: "file", description: "Barrel export" },
          ],
        },
        {
          name: "lib",
          path: "src/lib",
          kind: "directory",
          description: "Core logic: identity minting, serialization, offset arithmetic, errors",
          specRef: ["§3", "§5", "§11"],
          children: [
            { name: "identity.ts", path: "src/lib/identity.ts", kind: "file", description: "ULID generation, branded ID minting, timestamp extraction", specRef: ["§3"] },
            { name: "serialization.ts", path: "src/lib/serialization.ts", kind: "file", description: "Deterministic JSON serialization, JSONL line building, UTF-8 boundary checks", specRef: ["§5"] },
            { name: "offsets.ts", path: "src/lib/offsets.ts", kind: "file", description: "BigInt offset arithmetic, range formatting/parsing, validation", specRef: ["§5"] },
            { name: "errors.ts", path: "src/lib/errors.ts", kind: "file", description: "Typed errors: ObjectPurged, RangeNotAddressable, ReplicaDivergent, etc.", specRef: ["§11"] },
            { name: "index.ts", path: "src/lib/index.ts", kind: "file", description: "Barrel export" },
          ],
        },
      ],
    },
    {
      name: "docs",
      path: "docs",
      kind: "directory",
      description: "Specification documents",
      children: [
        { name: "P0-canonical-history.md", path: "docs/P0-canonical-history.md", kind: "file", description: "P0 — Canonical History Contract (dependency)" },
        { name: "P1-storage-index-segment.md", path: "docs/P1-storage-index-segment.md", kind: "file", description: "P1 — This specification" },
        { name: "P2-context-assembly.md", path: "docs/P2-context-assembly.md", kind: "file", description: "P2 — Context Assembly & Ranking Contract (next)" },
      ],
    },
    {
      name: "fixtures",
      path: "fixtures",
      kind: "directory",
      description: "Test fixtures and validation data",
      specRef: ["§13"],
      children: [
        { name: "canonical-session.jsonl", path: "fixtures/canonical-session.jsonl", kind: "file", description: "Example canonical session object", specRef: ["§5"] },
        { name: "segments.json", path: "fixtures/segments.json", kind: "file", description: "Example segment rows for a session", specRef: ["§6"] },
        { name: "utf8-boundary-corpus.txt", path: "fixtures/utf8-boundary-corpus.txt", kind: "file", description: "Corpus with emoji, CJK, combining marks for G-3", specRef: ["§13"] },
      ],
    },
    { name: "tsconfig.json", path: "tsconfig.json", kind: "file", description: "TypeScript configuration" },
    { name: "package.json", path: "package.json", kind: "file", description: "Package manifest" },
    { name: "README.md", path: "README.md", kind: "file", description: "Project overview and quick start" },
    { name: "AGENTS.md", path: "AGENTS.md", kind: "file", description: "Rules for AI agents working on this codebase" },
    { name: "GUIDE.md", path: "GUIDE.md", kind: "file", description: "Detailed user guide" },
  ],
};

/**
 * Flatten the tree into a list of files for searching/indexing.
 */
export function flattenTree(node: FileNode): FileNode[] {
  const result: FileNode[] = [];
  if (node.kind === "file") {
    result.push(node);
  }
  if (node.children) {
    for (const child of node.children) {
      result.push(...flattenTree(child));
    }
  }
  return result;
}

/**
 * Get all directories in the tree.
 */
export function getDirectories(node: FileNode): FileNode[] {
  const result: FileNode[] = [];
  if (node.kind === "directory") {
    result.push(node);
  }
  if (node.children) {
    for (const child of node.children) {
      result.push(...getDirectories(child));
    }
  }
  return result;
}
