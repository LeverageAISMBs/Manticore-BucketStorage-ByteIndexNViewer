import { useState } from 'react';
import { mockObjects } from '../data/mockData';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  MoreVertical,
} from 'lucide-react';

function formatBytes(bytes: number): string {
  if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(2)} TB`;
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(2)} KB`;
  return `${bytes} B`;
}

function LifecycleBadge({ lifecycle }: { lifecycle: string }) {
  const config = {
    active: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Active' },
    tombstoned: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Tombstoned' },
    purged: { color: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Purged' },
  }[lifecycle] || { color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', label: lifecycle };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
}

function ReplicaStatus({ status }: { status: string }) {
  const config = {
    verified: { icon: CheckCircle2, color: 'text-emerald-400' },
    divergent: { icon: XCircle, color: 'text-red-400' },
    pending: { icon: AlertCircle, color: 'text-amber-400' },
  }[status] || { icon: AlertCircle, color: 'text-zinc-400' };

  const Icon = config.icon;
  return <Icon className={`w-3.5 h-3.5 ${config.color}`} />;
}

export function StoragePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [lifecycleFilter, setLifecycleFilter] = useState<string>('all');

  const filteredObjects = mockObjects.filter((obj) => {
    const matchesSearch =
      searchQuery === '' ||
      obj.objectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.contentHash.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLifecycle = lifecycleFilter === 'all' || obj.lifecycle === lifecycleFilter;
    return matchesSearch && matchesLifecycle;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Storage Explorer</h1>
        <p className="text-sm text-zinc-500">Browse objects, verify replicas, manage lifecycle</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by object ID or content hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 outline-none flex-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500" />
          <select
            value={lifecycleFilter}
            onChange={(e) => setLifecycleFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 outline-none"
          >
            <option value="all">All Lifecycle</option>
            <option value="active">Active</option>
            <option value="tombstoned">Tombstoned</option>
            <option value="purged">Purged</option>
          </select>
        </div>
      </div>

      {/* Objects table */}
      <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Object ID
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Size
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Lifecycle
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Replicas
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Sessions
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredObjects.map((obj) => (
                <tr
                  key={obj.objectId}
                  className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-sky-400">{obj.objectId.slice(0, 20)}...</code>
                      <button className="p-1 rounded hover:bg-zinc-700/50 text-zinc-500 hover:text-white transition-colors">
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-[10px] text-zinc-600 font-mono mt-0.5">
                      {obj.contentHash.slice(0, 30)}...
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-zinc-300">{formatBytes(obj.sizeBytes)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <LifecycleBadge lifecycle={obj.lifecycle} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {obj.replicas.map((replica, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <ReplicaStatus status={replica.status} />
                          <span className="text-xs text-zinc-400 uppercase">{replica.provider}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-zinc-300">{obj.sessionCount}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-zinc-500">
                      {new Date(obj.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-zinc-700/50 text-zinc-500 hover:text-white transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-zinc-700/50 text-zinc-500 hover:text-white transition-colors">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>
          Showing {filteredObjects.length} of {mockObjects.length} objects
        </span>
        <span>
          Total storage: {formatBytes(filteredObjects.reduce((sum, obj) => sum + obj.sizeBytes, 0))}
        </span>
      </div>
    </div>
  );
}
