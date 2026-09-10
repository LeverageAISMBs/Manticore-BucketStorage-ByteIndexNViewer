import { mockMetrics, mockValidationGates } from '../data/mockData';
import {
  Database,
  Layers,
  HardDrive,
  Zap,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Activity,
} from 'lucide-react';

function formatBytes(bytes: number): string {
  if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(2)} TB`;
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(2)} KB`;
  return `${bytes} B`;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  change,
  color,
}: {
  icon: typeof Database;
  label: string;
  value: string;
  change?: string;
  color: string;
}) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5 hover:border-zinc-700/60 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        {change && (
          <div className="flex items-center gap-1 text-xs text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            {change}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-zinc-500">{label}</div>
    </div>
  );
}

function ValidationGateCard({ gate }: { gate: typeof mockValidationGates[0] }) {
  const statusConfig = {
    pass: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    fail: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
    skip: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  };

  const config = statusConfig[gate.status];
  const StatusIcon = config.icon;

  return (
    <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-lg p-4 hover:border-zinc-700/60 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-500">{gate.id}</span>
          <h3 className="text-sm font-semibold text-white">{gate.name}</h3>
        </div>
        <div className={`p-1.5 rounded-lg ${config.bg}`}>
          <StatusIcon className={`w-4 h-4 ${config.color}`} />
        </div>
      </div>
      <p className="text-xs text-zinc-400 mb-3 leading-relaxed">{gate.description}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-500">
          Last run: {new Date(gate.lastRun).toLocaleString()}
        </span>
        <span className="text-zinc-400 font-mono">{gate.duration}ms</span>
      </div>
    </div>
  );
}

export function OverviewPage() {
  const passCount = mockValidationGates.filter((g) => g.status === 'pass').length;
  const totalGates = mockValidationGates.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">System Overview</h1>
        <p className="text-sm text-zinc-500">Real-time metrics and validation status</p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Database}
          label="Total Objects"
          value={mockMetrics.totalObjects.toLocaleString()}
          change="+12%"
          color="bg-sky-500/10 text-sky-400"
        />
        <MetricCard
          icon={Layers}
          label="Total Segments"
          value={mockMetrics.totalSegments.toLocaleString()}
          change="+8%"
          color="bg-violet-500/10 text-violet-400"
        />
        <MetricCard
          icon={HardDrive}
          label="Total Storage"
          value={formatBytes(mockMetrics.totalSizeBytes)}
          change="+5%"
          color="bg-emerald-500/10 text-emerald-400"
        />
        <MetricCard
          icon={Zap}
          label="Cache Hit Rate"
          value={`${(mockMetrics.cacheHitRate * 100).toFixed(1)}%`}
          change="+2.3%"
          color="bg-amber-500/10 text-amber-400"
        />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-semibold text-white">Query Performance</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Avg Latency</span>
              <span className="text-sm font-mono text-white">{mockMetrics.avgQueryLatency}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Queries/min</span>
              <span className="text-sm font-mono text-white">{mockMetrics.queriesPerMinute}</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-semibold text-white">Object Lifecycle</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Active</span>
              <span className="text-sm font-mono text-emerald-400">{mockMetrics.activeObjects}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Tombstoned</span>
              <span className="text-sm font-mono text-amber-400">{mockMetrics.tombstonedObjects}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Purged</span>
              <span className="text-sm font-mono text-red-400">{mockMetrics.purgedObjects}</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-semibold text-white">Replica Health</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Verified</span>
              <span className="text-sm font-mono text-emerald-400">{mockMetrics.verifiedReplicas}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Divergent</span>
              <span className="text-sm font-mono text-red-400">{mockMetrics.divergentReplicas}</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{
                  width: `${(mockMetrics.verifiedReplicas / (mockMetrics.verifiedReplicas + mockMetrics.divergentReplicas)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Validation gates */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Validation Gates</h2>
            <p className="text-xs text-zinc-500">
              {passCount}/{totalGates} gates passing
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-xs font-semibold text-emerald-400">
                {passCount} PASS
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockValidationGates.map((gate) => (
            <ValidationGateCard key={gate.id} gate={gate} />
          ))}
        </div>
      </div>
    </div>
  );
}
