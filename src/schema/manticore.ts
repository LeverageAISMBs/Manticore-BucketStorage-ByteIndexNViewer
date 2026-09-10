// ---------------------------------------------------------------------------
// Manticore DDL — §7 Manticore Schema
//
// Two real-time tables: catalog (existence) and segment (retrieval).
// Verified against Manticore 13.11.0+ manual on 2026-09-05.
//
// Constraints from the docs that shape this schema:
//   - float_vector: real-time tables only, cannot UPDATE (use REPLACE)
//   - json attributes: not columnar, must stay row-wise
//   - int: 32-bit unsigned → all byte offsets are bigint
// ---------------------------------------------------------------------------

/**
 * §7.1 catalog — knowledge of existence
 *
 * engine='rowwise' with columnar opted in per attribute, because
 * meta json cannot be columnar.
 */
export const CREATE_CATALOG_TABLE = `
CREATE TABLE catalog (
    object_id          string attribute,
    content_hash       string attribute,
    entity_kind        string attribute engine='columnar',
    session_id         string attribute engine='columnar',
    provider           string attribute engine='columnar',
    harness            string attribute engine='columnar',
    project            string attribute engine='columnar',
    repo               string attribute engine='columnar',
    branch             string attribute engine='columnar',
    created_at         timestamp        engine='columnar',
    ingested_at        timestamp        engine='columnar',
    size_bytes         bigint           engine='columnar',
    range_addressable  bool,
    replica_count      int              engine='columnar',
    lifecycle          string attribute engine='columnar',
    provider_native_id string attribute,
    meta               json
) engine='rowwise';
`.trim();

/**
 * §7.2 segment — searchable representation
 *
 * ONNX path: ~14× throughput of Candle on identical hardware.
 * cosine similarity: vectors normalized on insert, comparable if
 * model is later swapped for another normalized model.
 */
export const CREATE_SEGMENT_TABLE = `
CREATE TABLE segment (
    body_text        text,
    segment_id       string attribute,
    session_id       string attribute engine='columnar',
    ref_kind         string attribute engine='columnar',
    ref_id           string attribute,
    seq              int              engine='columnar',

    object_id        string attribute,
    byte_start       bigint           engine='columnar',
    byte_len         bigint           engine='columnar',
    text_start       bigint,
    text_len         bigint,

    provider         string attribute engine='columnar',
    harness          string attribute engine='columnar',
    project          string attribute engine='columnar',
    logical_category string attribute engine='columnar',
    created_at       timestamp        engine='columnar',
    token_estimate   int              engine='columnar',
    truncated        bool,
    embed_model      string attribute engine='columnar',

    body_vector      float_vector
        KNN_TYPE='hnsw'
        HNSW_SIMILARITY='cosine'
        MODEL_NAME='Xenova/all-MiniLM-L6-v2'
        FROM='body_text'
) engine='rowwise';
`.trim();

/**
 * §7.3 What is deliberately absent:
 *
 * - No summary column — derived artifact, belongs in bucket
 * - No pinned/cached column — machine-local, violates I-2
 * - No relevance_score column — computed per query, never stored
 */

/**
 * Rebuild commands — §9 Reprojection
 */
export const REBUILD_EMBEDDINGS = `
ALTER TABLE segment REBUILD EMBEDDINGS body_vector;
`.trim();

/**
 * Example queries — §8 Retrieval Contract
 */
export const QUERIES = {
  /** §8.1 search — no bucket call */
  search: `
SELECT segment_id, session_id, ref_kind, seq, object_id,
       byte_start, byte_len, token_estimate,
       WEIGHT() AS score
FROM segment
WHERE MATCH(:match)
  AND project = :project
  AND harness IN (:harnesses)
  AND created_at > UNIX_TIMESTAMP(:created_after)
  AND embed_model = :embed_model
ORDER BY score DESC
LIMIT :limit
FACET logical_category
FACET harness
FACET ref_kind;
`.trim(),

  /** §8.2 hybrid search */
  hybridSearch: `
SELECT segment_id, session_id, byte_start, byte_len, token_estimate
FROM segment
WHERE hybrid_match(:query)
  AND project = :project
LIMIT :limit;
`.trim(),

  /** §8.3 expand — still no bucket call */
  expand: `
SELECT segment_id, seq, ref_kind, body_text, token_estimate
FROM segment
WHERE session_id = :session_id
  AND seq BETWEEN :seq_min AND :seq_max
ORDER BY seq ASC;
`.trim(),
} as const;

/**
 * Full DDL bundle for bootstrapping a fresh Manticore instance.
 */
export const FULL_DDL = [CREATE_CATALOG_TABLE, CREATE_SEGMENT_TABLE].join("\n\n");
