import { useDashboardStore, type Page } from '../store/dashboardStore';
import {
  LayoutDashboard,
  Database,
  Layers,
  Terminal,
  Activity,
  ChevronLeft,
  ChevronRight,
  Settings,
  Bell,
  Search,
  BookOpen,
} from 'lucide-react';

const navItems: Array<{ id: Page; label: string; icon: typeof LayoutDashboard; description: string }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, description: 'System metrics & health' },
  { id: 'storage', label: 'Storage', icon: Database, description: 'Object browser & integrity' },
  { id: 'segments', label: 'Segments', icon: Layers, description: 'Segment inspector' },
  { id: 'studio', label: 'Manticore Studio', icon: Terminal, description: 'Visual query builder' },
  { id: 'performance', label: 'Performance', icon: Activity, description: 'Metrics & monitoring' },
  { id: 'docs', label: 'Documentation', icon: BookOpen, description: 'Guides & reference' },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentPage, setPage, sidebarCollapsed, toggleSidebar } = useDashboardStore();

  return (
    <div className="h-screen flex flex-col bg-[#09090b] text-zinc-100 overflow-hidden">
      {/* Top bar */}
      <header className="h-14 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm flex items-center px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <span className="text-white text-xs font-bold">P1</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white leading-none">Agent History</h1>
            <p className="text-[10px] text-zinc-500 mt-0.5">Operations Dashboard</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search objects, segments..."
              className="bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 outline-none flex-1"
            />
          </div>
          <button className="p-2 rounded-lg hover:bg-zinc-800/50 text-zinc-400 hover:text-white transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-sky-500 rounded-full" />
          </button>
          <button className="p-2 rounded-lg hover:bg-zinc-800/50 text-zinc-400 hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-xs font-semibold text-white ml-2">
            M
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`border-r border-zinc-800/60 bg-zinc-950/50 shrink-0 transition-all duration-300 ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={`w-full flex items-center gap-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40 border border-transparent'
                  } ${sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-400' : ''}`} />
                  {!sidebarCollapsed && (
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium leading-none">{item.label}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{item.description}</div>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-16 left-0 right-0 px-3">
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800/40 transition-colors text-xs"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              {!sidebarCollapsed && <span>Collapse</span>}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
