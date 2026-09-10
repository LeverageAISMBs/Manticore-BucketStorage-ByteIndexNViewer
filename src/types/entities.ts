// ---------------------------------------------------------------------------
// Entity types — §2 Entity Registry
//
// Thirteen entities across four planes. This is the single registry;
// any document introducing a fourteenth must amend it rather than
// define its own.
// ---------------------------------------------------------------------------

import type {
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
} from "../constants/prefixes.js";
import type { Plane } from "../constants/planes.js";

// ---- Execution plane -------------------------------------------------------

export interface Source {
  readonly sourceId: SourceId;
  readonly machine: string;
  readonly account: string;
  readonly registeredAt: string; // ISO 8601
}

export type Provider = "anthropic" | "openai" | "google";
export type Harness = "claude-code" | "codex-cli" | "gemini-cli" | "pi-code";

export interface Run {
  readonly runId: RunId;
  readonly sourceId: SourceId;
  readonly startedAt: string;
  readonly completedAt?: string;
}

// ---- Evidence plane --------------------------------------------------------

export interface Capture {
  readonly captureId: CaptureId;
  readonly objectId: ObjectId;
  readonly provider: Provider;
  readonly harness: Harness;
  readonly providerNativeId: string;
  readonly ingestedAt: string;
}

/**
 * An object has dual identity — §3.
 * object_id is the catalog's branded handle.
 * content_hash is sha256 of the exact stored bytes.
 */
export interface ObjectEntity {
  readonly objectId: ObjectId;
  readonly contentHash: string; // sha256:<hex>
  readonly sizeBytes: bigint;
  readonly rangeAddressable: boolean;
  readonly replicas: readonly Replica[];
  readonly lifecycle: LifecycleState;
  readonly createdAt: string;
  readonly ingestedAt: string;
}

export interface Replica {
  readonly provider: StorageProvider;
  readonly status: ReplicaStatus;
  readonly verifiedAt: string;
}

export type StorageProvider = "r2" | "b2" | "s3" | "minio" | "fs";
export type ReplicaStatus = "verified" | "divergent" | "pending";

export interface Manifest {
  readonly objectId: ObjectId;
  readonly contentHash: string;
  readonly replicas: readonly Replica[];
  readonly lifecycleEvents: readonly LifecycleEvent[];
}

export interface LifecycleEvent {
  readonly kind: "purge" | "tombstone" | "restore";
  readonly objectId: ObjectId;
  readonly contentHash: string;
  readonly reason?: string;
  readonly actor: string;
  readonly timestamp: string;
  readonly replicasConfirmed?: readonly StorageProvider[];
}

// ---- Knowledge plane -------------------------------------------------------

export interface Session {
  readonly sessionId: SessionId;
  readonly objectId: ObjectId; // canonical JSONL object
  readonly provider: Provider;
  readonly harness: Harness;
  readonly project: string;
  readonly repo?: string;
  readonly branch?: string;
  readonly providerNativeId: string;
  readonly createdAt: string;
  readonly messageCount: number;
}

export interface Message {
  readonly messageId: MessageId;
  readonly sessionId: SessionId;
  readonly seq: number;
  readonly role: "user" | "assistant" | "system";
  readonly content: readonly ContentBlock[];
}

export interface ContentBlock {
  readonly type: "text" | "tool_use" | "tool_result" | "image";
  readonly text?: string;
  readonly toolName?: string;
  readonly toolInput?: unknown;
  readonly toolOutput?: unknown;
}

export interface ToolEvent {
  readonly toolEventId: ToolEventId;
  readonly sessionId: SessionId;
  readonly seq: number;
  readonly toolName: string;
  readonly input: unknown;
  readonly output: unknown;
  readonly startedAt: string;
  readonly completedAt: string;
}

export interface ArtifactReference {
  readonly artifactId: ArtifactId;
  readonly sessionId: SessionId;
  readonly seq: number;
  readonly versionId: ArtifactVersionId;
}

export interface Artifact {
  readonly artifactId: ArtifactId;
  readonly versions: readonly ArtifactVersion[];
  readonly kind: "file" | "screenshot" | "pdf" | "repo-snapshot";
}

export interface ArtifactVersion {
  readonly versionId: ArtifactVersionId;
  readonly artifactId: ArtifactId;
  readonly objectId: ObjectId;
  readonly contentHash: string;
  readonly createdAt: string;
}

// ---- Context plane ---------------------------------------------------------

export interface ContextPack {
  readonly contextPackId: ContextPackId;
  readonly sessionId: SessionId;
  readonly segmentIds: readonly SegmentId[];
  readonly totalTokenEstimate: number;
  readonly assembledAt: string;
}

// ---- Lifecycle -------------------------------------------------------------

export type LifecycleState = "active" | "tombstoned" | "purged";

// ---- Plane assignment helper -----------------------------------------------

export function planeOf(entityKind: string): Plane {
  const EXECUTION = ["source", "provider", "harness", "run"];
  const EVIDENCE = ["capture", "object", "manifest"];
  const KNOWLEDGE = ["session", "message", "tool-event", "artifact-reference", "artifact"];
  const CONTEXT = ["segment", "context-pack"];

  if (EXECUTION.includes(entityKind)) return "EXECUTION";
  if (EVIDENCE.includes(entityKind)) return "EVIDENCE";
  if (KNOWLEDGE.includes(entityKind)) return "KNOWLEDGE";
  if (CONTEXT.includes(entityKind)) return "CONTEXT";
  throw new Error(`Unknown entity kind: ${entityKind}`);
}
