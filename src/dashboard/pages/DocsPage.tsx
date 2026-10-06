import { FileText, BookOpen, Shield, GraduationCap, ExternalLink } from 'lucide-react';

const docs = [
  {
    title: 'Dashboard README',
    filename: 'DASHBOARD_README.md',
    icon: BookOpen,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
    description: 'Architecture overview, component hierarchy, data flow, styling guide, and extension patterns for the dashboard.',
    sections: [
      'Component Hierarchy',
      'Data Flow',
      'Page breakdowns',
      'Styling & design system',
      'Quick start',
      'Extension guide',
    ],
  },
  {
    title: 'Dashboard AGENTS',
    filename: 'DASHBOARD_AGENTS.md',
    icon: Shield,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    description: 'Hard rules for AI agents working on the dashboard — component structure, state management, styling, data integration, and testing.',
    sections: [
      '10 hard rules (D-1 through D-10)',
      'Component patterns',
      'Data integration rules',
      'Zustand store patterns',
      'Testing expectations',
      'Common mistakes',
    ],
  },
  {
    title: 'Dashboard User Guide',
    filename: 'DASHBOARD_GUIDE.md',
    icon: GraduationCap,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    description: 'Comprehensive walkthrough of every page, data integration, component architecture, state management, extension guide, and practical examples.',
    sections: [
      'Page-by-page guide',
      'Data integration',
      'Component architecture',
      'State management',
      'Extension guide with examples',
      'Wiring everything together',
      'Troubleshooting',
    ],
  },
];

const p1Docs = [
  {
    title: 'P1 Specification',
    filename: 'README.md',
    icon: FileText,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    description: 'Storage, Index & Segment Contract — the foundation this dashboard operates on.',
  },
  {
    title: 'P1 AGENTS',
    filename: 'AGENTS.md',
    icon: Shield,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    description: 'Rules for AI agents working on the P1 codebase — taxonomy, invariants, validation gates.',
  },
  {
    title: 'P1 User Guide',
    filename: 'GUIDE.md',
    icon: GraduationCap,
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500/10',
    border: 'border-fuchsia-500/20',
    description: 'Detailed user guide for the P1 system — data flow, objects, segments, queries, redaction.',
  },
];

export function DocsPage() {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Documentation</h1>
        <p className="text-sm text-zinc-500">
          Guides, rules, and reference for the dashboard and P1 system
        </p>
      </div>

      {/* Dashboard docs */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-sky-500/20 flex items-center justify-center">
            <span className="text-sky-400 text-xs font-bold">D</span>
          </div>
          Dashboard Documentation
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {docs.map((doc) => {
            const Icon = doc.icon;
            return (
              <div
                key={doc.filename}
                className={`bg-zinc-900/50 border ${doc.border} rounded-xl p-5 hover:bg-zinc-900/80 transition-colors`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${doc.bg}`}>
                    <Icon className={`w-5 h-5 ${doc.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white">{doc.title}</h3>
                    <code className="text-[10px] text-zinc-500">{doc.filename}</code>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">{doc.description}</p>
                <div className="space-y-1">
                  {doc.sections.map((section) => (
                    <div key={section} className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="w-1 h-1 rounded-full bg-zinc-600" />
                      {section}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* P1 docs */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center">
            <span className="text-amber-400 text-xs font-bold">P1</span>
          </div>
          P1 Specification Documentation
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {p1Docs.map((doc) => {
            const Icon = doc.icon;
            return (
              <div
                key={doc.filename}
                className={`bg-zinc-900/50 border ${doc.border} rounded-xl p-5 hover:bg-zinc-900/80 transition-colors`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${doc.bg}`}>
                    <Icon className={`w-5 h-5 ${doc.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white">{doc.title}</h3>
                    <code className="text-[10px] text-zinc-500">{doc.filename}</code>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{doc.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick reference */}
      <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Reference</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">Dashboard Rules</h3>
            <div className="space-y-2">
              {[
                { id: 'D-1', rule: 'Component structure — page header + content' },
                { id: 'D-2', rule: 'State management — Zustand store only' },
                { id: 'D-3', rule: 'Styling — Tailwind only, zinc palette' },
                { id: 'D-4', rule: 'Data layer — mockData.ts, never inline' },
                { id: 'D-5', rule: 'Type safety — no any types' },
                { id: 'D-6', rule: 'Responsive — mobile, tablet, desktop' },
                { id: 'D-7', rule: 'Accessibility — keyboard nav, aria labels' },
                { id: 'D-8', rule: 'Performance — React.memo for expensive' },
                { id: 'D-9', rule: 'Error handling — try/catch all async' },
                { id: 'D-10', rule: 'Extension — use existing patterns' },
              ].map((item) => (
                <div key={item.id} className="flex items-start gap-2 text-xs">
                  <span className="font-mono text-sky-400 shrink-0">{item.id}</span>
                  <span className="text-zinc-400">{item.rule}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">File Structure</h3>
            <div className="bg-zinc-950 rounded-lg p-4 font-mono text-xs text-zinc-400 space-y-0.5">
              <div className="text-zinc-300">src/</div>
              <div className="pl-4">├── <span className="text-sky-400">App.tsx</span> <span className="text-zinc-600"># Page router</span></div>
              <div className="pl-4">├── <span className="text-sky-400">main.tsx</span> <span className="text-zinc-600"># Entry point</span></div>
              <div className="pl-4">├── <span className="text-sky-400">index.css</span> <span className="text-zinc-600"># Global styles</span></div>
              <div className="pl-4">├── dashboard/</div>
              <div className="pl-8">├── components/</div>
              <div className="pl-12">└── <span className="text-emerald-400">DashboardLayout.tsx</span></div>
              <div className="pl-8">├── data/</div>
              <div className="pl-12">└── <span className="text-emerald-400">mockData.ts</span></div>
              <div className="pl-8">├── pages/</div>
              <div className="pl-12">├── <span className="text-violet-400">OverviewPage.tsx</span></div>
              <div className="pl-12">├── <span className="text-violet-400">StoragePage.tsx</span></div>
              <div className="pl-12">├── <span className="text-violet-400">SegmentsPage.tsx</span></div>
              <div className="pl-12">├── <span className="text-violet-400">StudioPage.tsx</span></div>
              <div className="pl-12">└── <span className="text-violet-400">PerformancePage.tsx</span></div>
              <div className="pl-8">└── store/</div>
              <div className="pl-12">└── <span className="text-amber-400">dashboardStore.ts</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Extension checklist */}
      <div className="bg-gradient-to-r from-sky-950/20 to-violet-950/20 border border-sky-800/20 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Extension Checklist</h2>
        <p className="text-sm text-zinc-400 mb-4">
          When adding a new feature to the dashboard, follow this checklist:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'Add page component in src/dashboard/pages/',
            'Add Page type to dashboardStore.ts',
            'Add nav item to DashboardLayout.tsx',
            'Add route case to App.tsx PageRouter',
            'Add mock data to mockData.ts',
            'Add state to Zustand store if needed',
            'Follow D-1 through D-10 rules',
            'Test on mobile, tablet, desktop',
            'Update documentation',
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-zinc-400">
              <div className="w-4 h-4 rounded border border-zinc-700 flex items-center justify-center shrink-0">
                <span className="text-zinc-600 text-[10px]">{idx + 1}</span>
              </div>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
