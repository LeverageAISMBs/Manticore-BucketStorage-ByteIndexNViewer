import { useState } from 'react';
import { mockSegments } from '../data/mockData';
import { Search, Filter, FileText, Wrench, Package, Layers, Copy } from 'lucide-react';

function RefKindIcon({ refKind }: { refKind: string }) {
  const config = {
    message: { icon: FileText, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    tool_event: { icon: Wrench, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    artifact_ref: { icon: Package, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    span: { icon: Layers, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  }[refKind] || { icon: FileText, color: 'text-zinc-400', bg: 'bg-zinc-500/10' };

  const Icon = config.icon;
  return (
    <div className={`p-1.5 rounded-lg ${config.bg}`}>
      <Icon className={`w-3.5 h-3.5 ${config.color}`} />
    </div>
  );
}

export function SegmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [refKindFilter, setRefKindFilter] = useState<string>('all');
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  const filteredSegments = mockSegments.filter((seg) => {
    const matchesSearch =
      searchQuery === '' ||
      seg.segmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seg.sessionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seg.bodyText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRefKind = refKindFilter === 'all' || seg.refKind === refKindFilter;
    return matchesSearch && matchesRefKind;
  });

  const selected = mockSegments.find((s) => s.segmentId === selectedSegment);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Segment Inspector</h1>
        <p className="text-sm text-zinc-500">Browse segments, view byte ranges, inspect content</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by segment ID, session ID, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 outline-none flex-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500" />
          <select
            value={refKindFilter}
            onChange={(e) => setRefKindFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 outline-none"
          >
            <option value="all">All Ref Kinds</option>
            <option value="message">Message</option>
            <option value="tool_event">Tool Event</option>
            <option value="artifact_ref">Artifact Ref</option>
            <option value="span">Span</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Segments list */}
        <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800/60 rounded-xl overflow-hidden">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-zinc-900/95 backdrop-blur-sm">
                <tr className="border-b border-zinc-800/60">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Segment
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Byte Range
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Tokens
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSegments.map((seg) => (
                  <tr
                    key={seg.segmentId}
                    onClick={() => setSelectedSegment(seg.segmentId)}
                    className={`border-b border-zinc-800/40 cursor-pointer transition-colors ${
                      selectedSegment === seg.segmentId
                        ? 'bg-sky-500/10 border-sky-500/20'
                        : 'hover:bg-zinc-800/20'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <RefKindIcon refKind={seg.refKind} />
                        <code className="text-xs font-mono text-zinc-300">
                          {seg.segmentId.slice(0, 16)}...
                        </code>
                      </div>
                      <div className="text-xs text-zinc-500 line-clamp-1">{seg.bodyText}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-mono text-zinc-400">
                        {seg.byteStart.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-zinc-600">
                        +{seg.byteLen.toLocaleString()} bytes
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-zinc-300">{seg.tokenEstimate}</span>
                    </td>
                    <td className="px-4 py-3">
                      {seg.truncated ? (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Truncated
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Complete
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5">
          {selected ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Segment Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Segment ID</span>
                    <div className="flex items-center gap-1">
                      <code className="text-xs font-mono text-sky-400">{selected.segmentId.slice(0, 12)}...</code>
                      <button className="p-1 rounded hover:bg-zinc-700/50 text-zinc-500 hover:text-white transition-colors">
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Session ID</span>
                    <code className="text-xs font-mono text-zinc-400">{selected.sessionId.slice(0, 12)}...</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Ref Kind</span>
                    <span className="text-xs text-zinc-300 capitalize">{selected.refKind.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Sequence</span>
                    <span className="text-xs text-zinc-300">{selected.seq}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Object ID</span>
                    <code className="text-xs font-mono text-zinc-400">{selected.objectId.slice(0, 12)}...</code>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-800/60 pt-4">
                <h3 className="text-sm font-semibold text-white mb-2">Byte Range</h3>
                <div className="bg-zinc-950 rounded-lg p-3 font-mono text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">byte_start:</span>
                    <span className="text-emerald-400">{selected.byteStart.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">byte_len:</span>
                    <span className="text-emerald-400">{selected.byteLen.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">byte_end:</span>
                    <span className="text-emerald-400">{(selected.byteStart + selected.byteLen).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-800/60 pt-4">
                <h3 className="text-sm font-semibold text-white mb-2">Content Preview</h3>
                <div className="bg-zinc-950 rounded-lg p-3 text-xs text-zinc-300 leading-relaxed max-h-48 overflow-y-auto">
                  {selected.bodyText}
                </div>
              </div>

              <div className="border-t border-zinc-800/60 pt-4">
                <h3 className="text-sm font-semibold text-white mb-2">Metadata</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Provider</span>
                    <span className="text-xs text-zinc-300">{selected.provider}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Harness</span>
                    <span className="text-xs text-zinc-300">{selected.harness}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Project</span>
                    <span className="text-xs text-zinc-300">{selected.project}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">Token Estimate</span>
                    <span className="text-xs text-zinc-300">{selected.tokenEstimate}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
              Select a segment to view details
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>
          Showing {filteredSegments.length} of {mockSegments.length} segments
        </span>
        <span>
          Total tokens: {filteredSegments.reduce((sum, seg) => sum + seg.tokenEstimate, 0).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
