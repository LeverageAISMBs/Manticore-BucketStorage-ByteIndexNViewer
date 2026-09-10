import { mockPerformanceData, mockMetrics } from '../data/mockData';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Activity, Clock, Zap, Database, TrendingUp, Server } from 'lucide-react';

export function PerformancePage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Performance</h1>
        <p className="text-sm text-zinc-500">Query metrics, cache performance, and system health</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <span className="text-xs text-zinc-500">Avg Latency</span>
          </div>
          <div className="text-2xl font-bold text-white">{mockMetrics.avgQueryLatency}ms</div>
          <div className="text-xs text-emerald-400 mt-1">↓ 12% from last hour</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-zinc-500">Queries/min</span>
          </div>
          <div className="text-2xl font-bold text-white">{mockMetrics.queriesPerMinute}</div>
          <div className="text-xs text-emerald-400 mt-1">↑ 8% from last hour</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-zinc-500">Cache Hit Rate</span>
          </div>
          <div className="text-2xl font-bold text-white">{(mockMetrics.cacheHitRate * 100).toFixed(1)}%</div>
          <div className="text-xs text-emerald-400 mt-1">↑ 2.3% from yesterday</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-zinc-500">Index Size</span>
          </div>
          <div className="text-2xl font-bold text-white">2.4 GB</div>
          <div className="text-xs text-zinc-500 mt-1">45,892 segments</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Query throughput */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Query Throughput</h3>
            <span className="text-xs text-zinc-500">Last 24 hours</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={mockPerformanceData}>
              <defs>
                <linearGradient id="queriesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="hour" stroke="#52525b" fontSize={10} />
              <YAxis stroke="#52525b" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="queries"
                stroke="#0ea5e9"
                fill="url(#queriesGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Query latency */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Query Latency</h3>
            <span className="text-xs text-zinc-500">Last 24 hours</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={mockPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="hour" stroke="#52525b" fontSize={10} />
              <YAxis stroke="#52525b" fontSize={10} unit="ms" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="latency"
                stroke="#a855f7"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cache hit rate */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Cache Hit Rate</h3>
            <span className="text-xs text-zinc-500">Last 24 hours</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={mockPerformanceData}>
              <defs>
                <linearGradient id="cacheGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="hour" stroke="#52525b" fontSize={10} />
              <YAxis stroke="#52525b" fontSize={10} domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
              />
              <Area
                type="monotone"
                dataKey="cacheHitRate"
                stroke="#f59e0b"
                fill="url(#cacheGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* System health */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">System Health</h3>
            <Server className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-400">Manticore CPU</span>
                <span className="text-xs text-zinc-300 font-mono">34%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-sky-500 h-2 rounded-full" style={{ width: '34%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-400">Manticore Memory</span>
                <span className="text-xs text-zinc-300 font-mono">62%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-violet-500 h-2 rounded-full" style={{ width: '62%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-400">Storage I/O</span>
                <span className="text-xs text-zinc-300 font-mono">18%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '18%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-400">Network</span>
                <span className="text-xs text-zinc-300 font-mono">45%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Query distribution */}
      <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Query Distribution by Harness</h3>
          <TrendingUp className="w-4 h-4 text-zinc-400" />
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={[
              { harness: 'claude-code', queries: 847 },
              { harness: 'codex-cli', queries: 312 },
              { harness: 'gemini-cli', queries: 156 },
              { harness: 'pi-code', queries: 89 },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="harness" stroke="#52525b" fontSize={10} />
            <YAxis stroke="#52525b" fontSize={10} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="queries" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
