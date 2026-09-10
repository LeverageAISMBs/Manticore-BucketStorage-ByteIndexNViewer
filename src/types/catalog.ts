// ---------------------------------------------------------------------------
// Catalog types — §7.1 Manticore Schema (catalog table)
//
// The catalog is the knowledge-of-existence table. Every machine holds
// the complete catalog (I-4). It is tiny relative to text and vectors.
// ---------------------------------------------------------------------------

import type { ObjectId, SessionId } from "../constants/prefixes.js";
import type { LifecycleState } from "./entities.js";

/**
 * A row in the Manticore `catalog` table.
 *
 * The table is declared rowwise with columnar opted in per attribute,
 * because `meta json` cannot be columnar.
 */
export interface CatalogRow {
  readonly object_id: string;
  readonly content_hash: string;
  readonly entity_kind: string;
  readonly session_id: string;
  readonly provider: string;
  readonly harness: string;
  readonly project: string;
  readonly repo?: string;
  readonly branch?: string;
  readonly created_at: string; // timestamp
  readonly ingested_at: string; // timestamp
  readonly size_bytes: string; // bigint as string
  readonly range_addressable: boolean;
  readonly replica_count: number;
  readonly lifecycle: LifecycleState;
  readonly provider_native_id: string;
  readonly meta?: Record<string, unknown>; // json — row-wise only
}

/**
 * Resolve a session to its object location.
 * Returns the same answer on every machine (I-4).
 */
export interface CatalogResolver {
  resolveSession(sessionId: SessionId): Promise<CatalogRow | null>;
  resolveObject(objectId: ObjectId): Promise<CatalogRow | null>;
  listByProject(project: string): Promise<readonly CatalogRow[]>;
}
