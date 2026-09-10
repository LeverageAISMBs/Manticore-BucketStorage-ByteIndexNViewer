// Mock data for the operations dashboard

export interface ObjectData {
  objectId: string;
  contentHash: string;
  sizeBytes: number;
  rangeAddressable: boolean;
  lifecycle: 'active' | 'tombstoned' | 'purged';
  replicas: Array<{
    provider: string;
    status: 'verified' | 'divergent' | 'pending';
    verifiedAt: string;
  }>;
  createdAt: string;
  sessionCount: number;
}

export interface SegmentData {
  segmentId: string;
  sessionId: string;
  refKind: 'message' | 'tool_event' | 'artifact_ref' | 'span';
  refId: string;
  seq: number;
  objectId: string;
  byteStart: number;
  byteLen: number;
  tokenEstimate: number;
  truncated: boolean;
  bodyText: string;
  provider: string;
  harness: string;
  project: string;
  createdAt: string;
}

export interface ValidationGate {
  id: string;
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'skip';
  lastRun: string;
  duration: number;
}

export interface QueryResult {
  segmentId: string;
  sessionId: string;
  score: number;
  tokenEstimate: number;
  bodyText: string;
  provider: string;
  harness: string;
}

// Generate realistic mock data
export const mockObjects: ObjectData[] = [
  {
    objectId: 'obj_01JQ8Z3K7M4P2V9XR6TB5NCWDH',
    contentHash: 'sha256:9f2ca7e1b04d3f8a5c6e7d8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
    sizeBytes: 419430400,
    rangeAddressable: true,
    lifecycle: 'active',
    replicas: [
      { provider: 'r2', status: 'verified', verifiedAt: '2026-09-05T18:02:11Z' },
      { provider: 'b2', status: 'verified', verifiedAt: '2026-09-05T18:04:39Z' },
    ],
    createdAt: '2026-09-01T10:23:45Z',
    sessionCount: 12,
  },
  {
    objectId: 'obj_01JQ8Z3K8N1Q4W7YS2UA6MDXFJ',
    contentHash: 'sha256:418b03fd97ae1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    sizeBytes: 125829120,
    rangeAddressable: true,
    lifecycle: 'active',
    replicas: [
      { provider: 'r2', status: 'verified', verifiedAt: '2026-09-05T17:45:22Z' },
      { provider: 'b2', status: 'verified', verifiedAt: '2026-09-05T17:47:18Z' },
    ],
    createdAt: '2026-09-02T14:15:30Z',
    sessionCount: 8,
  },
  {
    objectId: 'obj_01JQ8Z3K9P2R4T6V8X0Z2B4D6F',
    contentHash: 'sha256:d07751cc2b6f3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
    sizeBytes: 89128960,
    rangeAddressable: true,
    lifecycle: 'active',
    replicas: [
      { provider: 'r2', status: 'verified', verifiedAt: '2026-09-05T16:30:15Z' },
      { provider: 'b2', status: 'divergent', verifiedAt: '2026-09-05T16:32:44Z' },
    ],
    createdAt: '2026-09-03T09:45:12Z',
    sessionCount: 5,
  },
  {
    objectId: 'obj_01JQ8Z3K0A2C4E6G8I0K2M4O6Q',
    contentHash: 'sha256:a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    sizeBytes: 251658240,
    rangeAddressable: true,
    lifecycle: 'tombstoned',
    replicas: [
      { provider: 'r2', status: 'verified', verifiedAt: '2026-09-05T15:20:33Z' },
      { provider: 'b2', status: 'verified', verifiedAt: '2026-09-05T15:22:47Z' },
    ],
    createdAt: '2026-09-04T11:30:22Z',
    sessionCount: 3,
  },
  {
    objectId: 'obj_01JQ8Z3K1B3D5F7H9J1L3N5P7R',
    contentHash: 'sha256:f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1',
    sizeBytes: 52428800,
    rangeAddressable: true,
    lifecycle: 'active',
    replicas: [
      { provider: 'r2', status: 'verified', verifiedAt: '2026-09-05T14:15:08Z' },
      { provider: 'b2', status: 'verified', verifiedAt: '2026-09-05T14:17:22Z' },
    ],
    createdAt: '2026-09-05T08:45:33Z',
    sessionCount: 7,
  },
];

export const mockSegments: SegmentData[] = [
  {
    segmentId: 'seg_01JQ8Z3K7M4P2V9XR6TB5NCWDH',
    sessionId: 'ses_01JQ8Z3K7M4P2V9XR6TB5NCWDH',
    refKind: 'message',
    refId: 'msg_01JQ8Z3K7M4P2V9XR6TB5NCWDH',
    seq: 1,
    objectId: 'obj_01JQ8Z3K7M4P2V9XR6TB5NCWDH',
    byteStart: 0,
    byteLen: 2048,
    tokenEstimate: 450,
    truncated: false,
    bodyText: 'User asked about implementing Galera cluster replication with multi-master setup. Discussed configuration options for wsrep_provider and gcomm:// connection string.',
    provider: 'anthropic',
    harness: 'claude-code',
    project: 'agent-history',
    createdAt: '2026-09-01T10:25:12Z',
  },
  {
    segmentId: 'seg_01JQ8Z3K8N1Q4W7YS2UA6MDXFJ',
    sessionId: 'ses_01JQ8Z3K7M4P2V9XR6TB5NCWDH',
    refKind: 'message',
    refId: 'msg_01JQ8Z3K8N1Q4W7YS2UA6MDXFJ',
    seq: 2,
    objectId: 'obj_01JQ8Z3K7M4P2V9XR6TB5NCWDH',
    byteStart: 2048,
    byteLen: 4096,
    tokenEstimate: 890,
    truncated: false,
    bodyText: 'Assistant provided detailed explanation of Galera replication architecture, including synchronous replication, conflict resolution, and network partition handling.',
    provider: 'anthropic',
    harness: 'claude-code',
    project: 'agent-history',
    createdAt: '2026-09-01T10:26:45Z',
  },
  {
    segmentId: 'seg_01JQ8Z3K9P2R4T6V8X0Z2B4D6F',
    sessionId: 'ses_01JQ8Z3K7M4P2V9XR6TB5NCWDH',
    refKind: 'tool_event',
    refId: 'tev_01JQ8Z3K9P2R4T6V8X0Z2B4D6F',
    seq: 3,
    objectId: 'obj_01JQ8Z3K7M4P2V9XR6TB5NCWDH',
    byteStart: 6144,
    byteLen: 8192,
    tokenEstimate: 1560,
    truncated: true,
    bodyText: 'Tool execution: file_read with path /etc/mysql/mariadb.conf.d/50-server.cnf. Returned configuration file contents showing Galera cluster settings.',
    provider: 'anthropic',
    harness: 'claude-code',
    project: 'agent-history',
    createdAt: '2026-09-01T10:28:33Z',
  },
  {
    segmentId: 'seg_01JQ8Z3K0A2C4E6G8I0K2M4O6Q',
    sessionId: 'ses_01JQ8Z3K8N1Q4W7YS2UA6MDXFJ',
    refKind: 'message',
    refId: 'msg_01JQ8Z3K0A2C4E6G8I0K2M4O6Q',
    seq: 1,
    objectId: 'obj_01JQ8Z3K8N1Q4W7YS2UA6MDXFJ',
    byteStart: 0,
    byteLen: 1536,
    tokenEstimate: 320,
    truncated: false,
    bodyText: 'User requested help debugging OAuth 2.0 flow that kept returning 401 after token refresh. Provided error logs and token validation code.',
    provider: 'openai',
    harness: 'codex-cli',
    project: 'agent-history',
    createdAt: '2026-09-02T14:17:22Z',
  },
  {
    segmentId: 'seg_01JQ8Z3K1B3D5F7H9J1L3N5P7R',
    sessionId: 'ses_01JQ8Z3K8N1Q4W7YS2UA6MDXFJ',
    refKind: 'message',
    refId: 'msg_01JQ8Z3K1B3D5F7H9J1L3N5P7R',
    seq: 2,
    objectId: 'obj_01JQ8Z3K8N1Q4W7YS2UA6MDXFJ',
    byteStart: 1536,
    byteLen: 3072,
    tokenEstimate: 680,
    truncated: false,
    bodyText: 'Assistant identified issue: refresh token was being used instead of access token in Authorization header. Provided corrected code with proper token handling.',
    provider: 'openai',
    harness: 'codex-cli',
    project: 'agent-history',
    createdAt: '2026-09-02T14:19:45Z',
  },
];

export const mockValidationGates: ValidationGate[] = [
  {
    id: 'G-1',
    name: 'Round-trip fidelity',
    description: 'Canonical object → segments → range fetch → reassembled bytes equal original',
    status: 'pass',
    lastRun: '2026-09-05T18:30:00Z',
    duration: 2450,
  },
  {
    id: 'G-2',
    name: 'Deterministic serialization',
    description: 'Re-normalizing same capture twice yields identical content_hash',
    status: 'pass',
    lastRun: '2026-09-05T18:30:00Z',
    duration: 1230,
  },
  {
    id: 'G-3',
    name: 'Offset boundary safety',
    description: 'Every byte_start and byte_start + byte_len lands on UTF-8 boundary',
    status: 'pass',
    lastRun: '2026-09-05T18:30:00Z',
    duration: 890,
  },
  {
    id: 'G-4',
    name: 'Index rebuildability',
    description: 'DROP tables, reproject from bucket, all segment rows match pre-drop state',
    status: 'pass',
    lastRun: '2026-09-05T18:30:00Z',
    duration: 4520,
  },
  {
    id: 'G-5',
    name: 'Replica byte-equality',
    description: 'Independently hashed R2 and B2 copies match',
    status: 'pass',
    lastRun: '2026-09-05T18:30:00Z',
    duration: 3100,
  },
  {
    id: 'G-6',
    name: 'Purge completeness',
    description: 'After purge, range GET 404s on every replica, zero segment rows remain',
    status: 'pass',
    lastRun: '2026-09-05T18:30:00Z',
    duration: 1890,
  },
  {
    id: 'G-7',
    name: 'Model isolation',
    description: 'KNN query spanning two embed_model values is rejected',
    status: 'pass',
    lastRun: '2026-09-05T18:30:00Z',
    duration: 420,
  },
  {
    id: 'G-8',
    name: 'Miss reporting',
    description: 'Partial projection returns projection_miss, never empty result',
    status: 'pass',
    lastRun: '2026-09-05T18:30:00Z',
    duration: 380,
  },
  {
    id: 'G-9',
    name: 'Token accounting',
    description: 'Reported token_estimate within 10% of tokenizer count',
    status: 'pass',
    lastRun: '2026-09-05T18:30:00Z',
    duration: 1560,
  },
];

export const mockQueryResults: QueryResult[] = [
  {
    segmentId: 'seg_01JQ8Z3K7M4P2V9XR6TB5NCWDH',
    sessionId: 'ses_01JQ8Z3K7M4P2V9XR6TB5NCWDH',
    score: 0.94,
    tokenEstimate: 450,
    bodyText: 'User asked about implementing Galera cluster replication with multi-master setup. Discussed configuration options for wsrep_provider and gcomm:// connection string.',
    provider: 'anthropic',
    harness: 'claude-code',
  },
  {
    segmentId: 'seg_01JQ8Z3K8N1Q4W7YS2UA6MDXFJ',
    sessionId: 'ses_01JQ8Z3K7M4P2V9XR6TB5NCWDH',
    score: 0.87,
    tokenEstimate: 890,
    bodyText: 'Assistant provided detailed explanation of Galera replication architecture, including synchronous replication, conflict resolution, and network partition handling.',
    provider: 'anthropic',
    harness: 'claude-code',
  },
  {
    segmentId: 'seg_01JQ8Z3K9P2R4T6V8X0Z2B4D6F',
    sessionId: 'ses_01JQ8Z3K7M4P2V9XR6TB5NCWDH',
    score: 0.76,
    tokenEstimate: 1560,
    bodyText: 'Tool execution: file_read with path /etc/mysql/mariadb.conf.d/50-server.cnf. Returned configuration file contents showing Galera cluster settings.',
    provider: 'anthropic',
    harness: 'claude-code',
  },
];

export const mockMetrics = {
  totalObjects: 1247,
  totalSegments: 45892,
  totalSizeBytes: 89234567890,
  cacheHitRate: 0.847,
  avgQueryLatency: 45,
  queriesPerMinute: 127,
  activeObjects: 1189,
  tombstonedObjects: 42,
  purgedObjects: 16,
  verifiedReplicas: 2389,
  divergentReplicas: 3,
};

export const mockPerformanceData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  queries: Math.floor(Math.random() * 200) + 50,
  latency: Math.floor(Math.random() * 50) + 20,
  cacheHitRate: 0.75 + Math.random() * 0.2,
}));
