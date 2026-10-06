import { useState } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import {
  Play,
  Clock,
  History,
  Database,
  Columns,
  Hash,
  Type,
  Calendar,
  Zap,
  Loader2,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

const SCHEMA_FIELDS = [
  { name: 'body_text', type: 'text', icon: Type, description: 'Full-text searchable content' },
  { name: 'segment_id', type: 'string', icon: Hash, description: 'Branded segment ID' },
  { name: 'session_id', type: 'string', icon: Hash, description: 'Owning session ID' },
  { name: 'ref_kind', type: 'string', icon: Type, description: 'message | tool_event | artifact_ref | span' },
  { name: 'ref_id', type: 'string', icon: Hash, description: 'The msg_/tev_/art_ this materializes' },
  { name: 'seq', type: 'int', icon: Hash, description: 'Ordinal within session' },
  { name: 'object_id', type: 'string', icon: Hash, description: 'The object the bytes live in' },
  { name: 'byte_start', type: 'bigint', icon: Hash, description: 'Byte offset in stored object' },
  { name: 'byte_len', type: 'bigint', icon: Hash, description: 'Byte length of segment' },
  { name: 'token_estimate', type: 'int', icon: Hash, description: 'Cost signal for agents' },
  { name: 'provider', type: 'string', icon: Type, description: 'anthropic | openai | google' },
  { name: 'harness', type: 'string', icon: Type, description: 'claude-code | codex-cli | ...' },
  { name: 'project', type: 'string', icon: Type, description: 'Project name' },
  { name: 'logical_category', type: 'string', icon: Type, description: 'Category classification' },
  { name: 'created_at', type: 'timestamp', icon: Calendar, description: 'Creation timestamp' },
  { name: 'embed_model', type: 'string', icon: Type, description: 'Embedding model name' },
  { name: 'body_vector', type: 'float_vector', icon: Zap, description: 'HNSW vector (cosine)' },
];

const QUERY_TEMPLATES = [
  {
    name: 'Full-text search',
    query: "MATCH('galera replication failure')",
    description: 'Lexical search with facets',
  },
  {
    name: 'Hybrid search',
    query: "hybrid_match('oauth flow that kept 401-ing')",
    description: 'Lexical + semantic combined',
  },
  {
    name: 'Filter by project',
    query: "MATCH('context pack') AND project = 'agent-history'",
    description: 'Search within a project',
  },
  {
    name: 'Time range',
    query: "MATCH('deployment') AND created_at > UNIX_TIMESTAMP('2026-08-01')",
    description: 'Search within date range',
  },
  {
    name: 'Multi-harness',
    query: "MATCH('testing') AND harness IN ('claude-code', 'codex-cli')",
    description: 'Search across harnesses',
  },
];

export function StudioPage() {
  const { studio, updateQuery, executeQuery } = useDashboardStore();
  const { query, results, isExecuting, executionTime, totalHits, queryHistory } = studio;
  const [showSchema, setShowSchema] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'results' | 'facets' | 'raw'>('results');

  // Build the SQL preview
  const buildSqlPreview = () => {
    const select = `SELECT segment_id, session_id, ref_kind, seq, object_id,\n       byte_start, byte_len, token_estimate,\n       WEIGHT() AS score`;
    const from = `FROM segment`;
    
    const conditions: string[] = [];
    if (query.match) {
      if (query.hybridMode) {
        conditions.push(`hybrid_match('${query.match}')`);
      } else {
        conditions.push(`MATCH('${query.match}')`);
      }
    }
    if (query.project) conditions.push(`project = '${query.project}'`);
    if (query.harness.length > 0) {
      conditions.push(`harness IN ('${query.harness.join("', '")}')`);
    }
    if (query.provider) conditions.push(`provider = '${query.provider}'`);
    conditions.push(`embed_model = '${query.embedModel}'`);

    const where = conditions.length > 0 ? `WHERE ${conditions.join('\n  AND ')}` : '';
    const orderBy = `ORDER BY score DESC`;
    const limit = `LIMIT ${query.limit}`;
    const facet = query.facets.length > 0 ? `FACET ${query.facets.join('\nFACET ')}` : '';

    return [select, from, where, orderBy, limit, facet].filter(Boolean).join('\n');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Manticore Studio</h1>
          <p className="text-sm text-zinc-500">Visual query builder with live execution</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSchema(!showSchema)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showSchema
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-white'
            }`}
          >
            <Columns className="w-3 h-3 inline mr-1" />
            Schema
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showHistory
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-white'
            }`}
          >
            <History className="w-3 h-3 inline mr-1" />
            History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Schema panel */}
        {showSchema && (
          <div className="col-span-3 bg-zinc-900/50 border border-zinc-800/60 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800/60 bg-zinc-900/80">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-semibold text-white">segment table</span>
              </div>
              <span className="text-[10px] text-zinc-500">engine='rowwise'</span>
            </div>
            <div className="p-2 max-h-[500px] overflow-y-auto space-y-0.5">
              {SCHEMA_FIELDS.map((field) => {
                const Icon = field.icon;
                const typeColors: Record<string, string> = {
                  text: 'text-emerald-400',
                  string: 'text-sky-400',
                  int: 'text-violet-400',
                  bigint: 'text-amber-400',
                  timestamp: 'text-rose-400',
                  float_vector: 'text-fuchsia-400',
                };
                return (
                  <div
                    key={field.name}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-800/40 cursor-pointer group"
                  >
                    <Icon className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400" />
                    <code className="text-xs text-zinc-300 flex-1">{field.name}</code>
                    <span className={`text-[10px] font-mono ${typeColors[field.type] || 'text-zinc-500'}`}>
                      {field.type}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Query builder */}
        <div className={`${showSchema ? 'col-span-9' : 'col-span-12'} space-y-4`}>
          {/* Query input */}
          <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-semibold text-white">Query Builder</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs text-zinc-400">
                  <input
                    type="checkbox"
                    checked={query.hybridMode}
                    onChange={(e) => updateQuery({ hybridMode: e.target.checked })}
                    className="rounded border-zinc-700 bg-zinc-800 text-sky-500 focus:ring-sky-500/20"
                  />
                  Hybrid mode
                </label>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Search input */}
              <div>
                <label className="text-xs text-zinc-500 mb-1.5 block">
                  {query.hybridMode ? 'hybrid_match()' : 'MATCH()'} expression
                </label>
                <input
                  type="text"
                  value={query.match}
                  onChange={(e) => updateQuery({ match: e.target.value })}
                  placeholder={query.hybridMode ? "e.g. 'oauth flow that kept 401-ing'" : "e.g. 'galera replication failure'"}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-sky-500/50 font-mono"
                />
              </div>

              {/* Filters row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block">Project</label>
                  <input
                    type="text"
                    value={query.project}
                    onChange={(e) => updateQuery({ project: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 outline-none focus:border-sky-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block">Provider</label>
                  <select
                    value={query.provider}
                    onChange={(e) => updateQuery({ provider: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 outline-none focus:border-sky-500/50"
                  >
                    <option value="">All</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="openai">OpenAI</option>
                    <option value="google">Google</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block">Embed Model</label>
                  <select
                    value={query.embedModel}
                    onChange={(e) => updateQuery({ embedModel: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 outline-none focus:border-sky-500/50"
                  >
                    <option value="Xenova/all-MiniLM-L6-v2">all-MiniLM-L6-v2</option>
                    <option value="Xenova/all-mpnet-base-v2">all-mpnet-base-v2</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block">Limit</label>
                  <input
                    type="number"
                    value={query.limit}
                    onChange={(e) => updateQuery({ limit: parseInt(e.target.value) || 20 })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 outline-none focus:border-sky-500/50"
                  />
                </div>
              </div>

              {/* Facets */}
              <div>
                <label className="text-xs text-zinc-500 mb-1.5 block">Facets</label>
                <div className="flex flex-wrap gap-2">
                  {['logical_category', 'harness', 'ref_kind', 'provider', 'project'].map((facet) => (
                    <button
                      key={facet}
                      onClick={() => {
                        const facets = query.facets.includes(facet)
                          ? query.facets.filter((f) => f !== facet)
                          : [...query.facets, facet];
                        updateQuery({ facets });
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        query.facets.includes(facet)
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          : 'bg-zinc-800 text-zinc-500 border border-zinc-700 hover:text-zinc-300'
                      }`}
                    >
                      {facet}
                    </button>
                  ))}
                </div>
              </div>

              {/* SQL preview + Execute */}
              <div className="flex items-start gap-3">
                <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-zinc-400 whitespace-pre overflow-x-auto">
                  {buildSqlPreview()}
                </div>
                <button
                  onClick={executeQuery}
                  disabled={isExecuting || !query.match}
                  className="px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm font-semibold transition-colors flex items-center gap-2 shrink-0"
                >
                  {isExecuting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Execute
                </button>
              </div>
            </div>
          </div>

          {/* Query templates */}
          <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Quick Templates
            </h3>
            <div className="flex flex-wrap gap-2">
              {QUERY_TEMPLATES.map((template) => (
                <button
                  key={template.name}
                  onClick={() => updateQuery({ match: template.query.replace(/.*'(.*)'.*/, '$1') })}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
                  title={template.description}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800/60 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {(['results', 'facets', 'raw'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-sm font-medium capitalize transition-colors ${
                        activeTab === tab ? 'text-sky-400' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span>{totalHits} hits</span>
                  {executionTime !== null && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {executionTime}ms
                    </span>
                  )}
                </div>
              </div>

              {activeTab === 'results' && (
                <div className="divide-y divide-zinc-800/40">
                  {results.map((result, idx) => (
                    <div key={result.segmentId} className="p-4 hover:bg-zinc-800/20 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-zinc-600">#{idx + 1}</span>
                          <code className="text-xs font-mono text-sky-400">
                            {result.segmentId.slice(0, 16)}...
                          </code>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-zinc-500">
                            score: <span className="text-emerald-400 font-mono">{result.score.toFixed(3)}</span>
                          </span>
                          <span className="text-xs text-zinc-500">
                            tokens: <span className="text-zinc-300 font-mono">{result.tokenEstimate}</span>
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed mb-2">{result.bodyText}</p>
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{result.provider}</span>
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{result.harness}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'facets' && (
                <div className="p-4 grid grid-cols-3 gap-4">
                  {[
                    { name: 'logical_category', values: [{ value: 'debugging', count: 8 }, { value: 'architecture', count: 5 }, { value: 'deployment', count: 4 }] },
                    { name: 'harness', values: [{ value: 'claude-code', count: 12 }, { value: 'codex-cli', count: 5 }] },
                    { name: 'ref_kind', values: [{ value: 'message', count: 14 }, { value: 'tool_event', count: 3 }] },
                  ].map((facet) => (
                    <div key={facet.name}>
                      <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                        {facet.name}
                      </h4>
                      <div className="space-y-1">
                        {facet.values.map((v) => (
                          <div key={v.value} className="flex items-center justify-between text-xs">
                            <span className="text-zinc-300">{v.value}</span>
                            <span className="text-zinc-500 font-mono">{v.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'raw' && (
                <div className="p-4">
                  <pre className="text-xs font-mono text-zinc-400 bg-zinc-950 rounded-lg p-4 overflow-x-auto">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Query history */}
          {showHistory && queryHistory.length > 0 && (
            <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800/60">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-zinc-400" />
                  Query History
                </h3>
              </div>
              <div className="divide-y divide-zinc-800/40 max-h-64 overflow-y-auto">
                {queryHistory.map((item) => (
                  <div
                    key={item.id}
                    className="px-4 py-3 hover:bg-zinc-800/20 cursor-pointer transition-colors"
                    onClick={() => updateQuery({ match: item.query.replace(/.*'(.*)'.*/, '$1') })}
                  >
                    <code className="text-xs font-mono text-sky-400 block mb-1">{item.query}</code>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                      <span>{item.hits} hits</span>
                      <span>{item.duration}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
