# Dashboard User Guide — Agent History Operations

> A comprehensive walkthrough of the operations dashboard, including UI navigation, data integration, extension points, and architecture.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Dashboard Overview](#2-dashboard-overview)
3. [Page-by-Page Guide](#3-page-by-page-guide)
4. [Data Integration](#4-data-integration)
5. [Component Architecture](#5-component-architecture)
6. [State Management](#6-state-management)
7. [Extension Guide](#7-extension-guide)
8. [Wiring Everything Together](#8-wiring-everything-together)
9. [Practical Examples](#9-practical-examples)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Getting Started

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd agent-history

# Install dependencies
npm install

# Start development server
npm run dev
```

The dashboard will be available at `http://localhost:5173`.

### First Launch

When you first open the dashboard:

1. **Overview page** loads by default
2. **Sidebar** shows all available pages
3. **Top bar** has search, notifications, and settings
4. **Mock data** is pre-loaded for demonstration

### Navigation

- **Click sidebar items** to navigate between pages
- **Click collapse button** (bottom of sidebar) to toggle sidebar width
- **Use top bar search** to search across objects and segments (not yet implemented)

---

## 2. Dashboard Overview

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Header (top bar)                                       │
│  - Logo, title                                          │
│  - Search input                                         │
│  - Notifications, settings, user avatar                 │
├──────────┬──────────────────────────────────────────────┤
│ Sidebar  │  Main Content                                │
│          │                                              │
│ - Over-  │  ┌────────────────────────────────────────┐ │
│   view   │  │  Page Header                           │ │
│ - Storage│  │  Title + description                   │ │
│ - Seg-   │  └────────────────────────────────────────┘ │
│   ments  │                                              │
│ - Studio │  ┌────────────────────────────────────────┐ │
│ - Perf   │  │  Page Content                          │ │
│          │  │  Metrics, tables, charts, etc.         │ │
│          │  └────────────────────────────────────────┘ │
│          │                                              │
│ [Collapse│                                              │
│  button] │                                              │
└──────────┴──────────────────────────────────────────────┘
```

### Design System

**Colors:**
- Background: `#09090b` (zinc-950)
- Cards: `bg-zinc-900/50` with `border-zinc-800/60`
- Text: Primary `text-zinc-100`, Secondary `text-zinc-400`, Tertiary `text-zinc-500`
- Accents: `sky-400`, `violet-400`, `emerald-400`, `amber-400`, `rose-400`

**Typography:**
- Body: Inter (sans-serif)
- Code: JetBrains Mono (monospace)
- Sizes: `text-xs` (10-12px), `text-sm` (14px), `text-lg` (18px), `text-2xl` (24px)

**Spacing:**
- Page padding: `p-6` (24px)
- Card padding: `p-5` (20px)
- Gap between cards: `gap-4` (16px) or `gap-6` (24px)

---

## 3. Page-by-Page Guide

### 3.1 Overview Page

**Purpose:** System health at a glance

**What you see:**
- 4 primary metric cards (objects, segments, storage, cache hit rate)
- 3 secondary metric panels (query performance, object lifecycle, replica health)
- 9 validation gate cards (G-1 through G-9)

**How to use:**
1. **Check validation gates** — All should show green "PASS" status
2. **Monitor metrics** — Look for trends in the change indicators
3. **Check replica health** — Divergent replicas need attention

**Data sources:**
- `mockMetrics` — System-wide metrics
- `mockValidationGates` — Validation gate status

**Extension points:**
- Add new metric cards by creating new `MetricCard` instances
- Add new validation gates by extending `mockValidationGates` array
- Add real-time updates by replacing mock data with API calls

**Example: Adding a new metric card**

```tsx
// In OverviewPage.tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Existing cards */}
  <MetricCard icon={Database} label="Total Objects" value="1,247" change="+12%" color="bg-sky-500/10 text-sky-400" />
  
  {/* New card */}
  <MetricCard
    icon={Users}
    label="Active Users"
    value="42"
    change="+5%"
    color="bg-violet-500/10 text-violet-400"
  />
</div>
```

### 3.2 Storage Explorer

**Purpose:** Browse and manage objects

**What you see:**
- Search input (filter by object ID or content hash)
- Lifecycle filter dropdown (all/active/tombstoned/purged)
- Objects table with columns: Object ID, Size, Lifecycle, Replicas, Sessions, Created, Actions

**How to use:**
1. **Search** — Type object ID or hash in search box
2. **Filter** — Select lifecycle state from dropdown
3. **View details** — Click object row to see more details (not yet implemented)
4. **Copy ID** — Click copy icon next to object ID
5. **Actions** — Click more icon for additional actions (not yet implemented)

**Data sources:**
- `mockObjects` — Array of `ObjectData`

**Extension points:**
- Add object detail modal by creating `ObjectDetailModal` component
- Add purge workflow by extending table actions
- Add replica verification by adding verify button per replica

**Example: Adding object detail modal**

```tsx
// Create ObjectDetailModal.tsx
export function ObjectDetailModal({ object, onClose }: { object: ObjectData; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Object Details</h2>
        <div className="space-y-3">
          <div>
            <span className="text-xs text-zinc-500">Object ID</span>
            <code className="block text-sm text-sky-400">{object.objectId}</code>
          </div>
          {/* More fields */}
        </div>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-zinc-800 rounded-lg">
          Close
        </button>
      </div>
    </div>
  );
}

// Use in StoragePage.tsx
const [selectedObject, setSelectedObject] = useState<ObjectData | null>(null);

<tr onClick={() => setSelectedObject(obj)}>
  {/* ... */}
</tr>

{selectedObject && (
  <ObjectDetailModal object={selectedObject} onClose={() => setSelectedObject(null)} />
)}
```

### 3.3 Segment Inspector

**Purpose:** Inspect segments and their byte ranges

**What you see:**
- Search input (filter by segment ID, session ID, or content)
- Ref kind filter dropdown (all/message/tool_event/artifact_ref/span)
- Segments table (left panel) with columns: Segment, Byte Range, Tokens, Status
- Detail panel (right panel) showing selected segment details

**How to use:**
1. **Search** — Type segment ID, session ID, or content text
2. **Filter** — Select ref kind from dropdown
3. **Select segment** — Click row in table to see details
4. **View byte range** — See byte_start, byte_len, byte_end in detail panel
5. **Preview content** — See body text in detail panel

**Data sources:**
- `mockSegments` — Array of `SegmentData`

**Extension points:**
- Add byte range visualization by creating `ByteRangeVisualizer` component
- Add segment comparison by creating `SegmentComparison` component
- Add materialize button to fetch actual bytes from storage

**Example: Adding byte range visualization**

```tsx
// Create ByteRangeVisualizer.tsx
export function ByteRangeVisualizer({ byteStart, byteLen, objectSize }: { 
  byteStart: number; 
  byteLen: number; 
  objectSize: number 
}) {
  const startPercent = (byteStart / objectSize) * 100;
  const lenPercent = (byteLen / objectSize) * 100;
  
  return (
    <div className="relative h-8 bg-zinc-800 rounded-lg overflow-hidden">
      <div
        className="absolute h-full bg-sky-500/30 border-l-2 border-r-2 border-sky-500"
        style={{ left: `${startPercent}%`, width: `${lenPercent}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-400">
        {byteStart.toLocaleString()} - {(byteStart + byteLen).toLocaleString()}
      </div>
    </div>
  );
}

// Use in SegmentsPage detail panel
<ByteRangeVisualizer
  byteStart={selected.byteStart}
  byteLen={selected.byteLen}
  objectSize={419430400} // Get from object data
/>
```

### 3.4 Manticore Visual Studio

**Purpose:** Visual query builder with live execution

**What you see:**
- Schema panel (left) — Column list with types
- Query builder (right) — Search input, filters, facets, SQL preview, execute button
- Query templates — Pre-built query patterns
- Results viewer — Tabs for results/facets/raw JSON
- Query history — Recent queries with re-run capability

**How to use:**
1. **Build query** — Type search term in MATCH() input
2. **Toggle hybrid mode** — Check "Hybrid mode" for semantic search
3. **Set filters** — Choose project, provider, embed model, limit
4. **Select facets** — Click facet buttons to include in query
5. **Preview SQL** — See generated SQL in real-time
6. **Execute** — Click Execute button to run query
7. **View results** — Switch between results/facets/raw tabs
8. **Re-run** — Click query in history to re-execute

**Data sources:**
- `SCHEMA_FIELDS` — Segment table schema
- `QUERY_TEMPLATES` — Pre-built query patterns
- `mockQueryResults` — Query results
- Zustand store — Query state, results, history

**Extension points:**
- Add query validation by creating `QueryValidator` component
- Add query optimization suggestions by analyzing query patterns
- Add query export by creating `QueryExporter` component
- Add saved queries by persisting to localStorage or backend

**Example: Adding query validation**

```tsx
// Create QueryValidator.tsx
export function QueryValidator({ query }: { query: QueryState }) {
  const errors: string[] = [];
  
  if (!query.match) {
    errors.push('Search term is required');
  }
  
  if (query.match.includes("'") && !query.match.includes("\\'")) {
    errors.push('Unescaped single quote in search term');
  }
  
  if (errors.length === 0) return null;
  
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
      <h4 className="text-sm font-semibold text-red-400 mb-2">Validation Errors</h4>
      <ul className="space-y-1">
        {errors.map((error, idx) => (
          <li key={idx} className="text-xs text-red-300">• {error}</li>
        ))}
      </ul>
    </div>
  );
}

// Use in StudioPage
<QueryValidator query={query} />
```

### 3.5 Performance

**Purpose:** Monitor query performance and system health

**What you see:**
- 4 key metric cards (latency, throughput, cache hit rate, index size)
- 4 charts (query throughput, latency, cache hit rate, system health)
- Query distribution chart (by harness)

**How to use:**
1. **Check metrics** — Look at current latency, throughput, cache hit rate
2. **Analyze trends** — Review charts for patterns over last 24 hours
3. **Monitor health** — Check CPU, memory, I/O, network utilization
4. **Identify bottlenecks** — Look for high latency or low cache hit rate

**Data sources:**
- `mockPerformanceData` — Time-series data (24 hours)
- `mockMetrics` — Current metrics

**Extension points:**
- Add real-time updates by replacing mock data with WebSocket/API
- Add custom date ranges by adding date picker
- Add alert thresholds by creating `AlertThreshold` component
- Add export by creating `PerformanceExporter` component

**Example: Adding date range picker**

```tsx
// Create DateRangePicker.tsx
export function DateRangePicker({ value, onChange }: { 
  value: { start: Date; end: Date }; 
  onChange: (range: { start: Date; end: Date }) => void 
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={value.start.toISOString().split('T')[0]}
        onChange={(e) => onChange({ ...value, start: new Date(e.target.value) })}
        className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm"
      />
      <span className="text-zinc-500">to</span>
      <input
        type="date"
        value={value.end.toISOString().split('T')[0]}
        onChange={(e) => onChange({ ...value, end: new Date(e.target.value) })}
        className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm"
      />
    </div>
  );
}

// Use in PerformancePage
const [dateRange, setDateRange] = useState({
  start: new Date(Date.now() - 24 * 60 * 60 * 1000),
  end: new Date(),
});

<DateRangePicker value={dateRange} onChange={setDateRange} />
```

---

## 4. Data Integration

### Mock Data Layer

The dashboard uses `src/dashboard/data/mockData.ts` to provide realistic data. This file exports:

- `mockObjects` — Array of `ObjectData` (matches P1 `ObjectEntity`)
- `mockSegments` — Array of `SegmentData` (matches P1 `Segment`)
- `mockValidationGates` — Array of `ValidationGate`
- `mockQueryResults` — Array of `QueryResult`
- `mockMetrics` — System-wide metrics
- `mockPerformanceData` — Time-series data

**Replacing mock data with real API:**

```typescript
// 1. Create API client
// src/dashboard/api/client.ts
export async function fetchObjects(): Promise<ObjectData[]> {
  const response = await fetch('/api/objects');
  if (!response.ok) throw new Error('Failed to fetch objects');
  return response.json();
}

// 2. Use React Query in page
// src/dashboard/pages/StoragePage.tsx
import { useQuery } from '@tanstack/react-query';
import { fetchObjects } from '../api/client';

export function StoragePage() {
  const { data: objects, isLoading, error } = useQuery({
    queryKey: ['objects'],
    queryFn: fetchObjects,
  });

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6">Error: {error.message}</div>;

  return (
    <div className="p-6">
      {/* Render objects */}
    </div>
  );
}

// 3. Install React Query
// npm install @tanstack/react-query

// 4. Wrap app with QueryClientProvider
// src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardLayout>
        <PageRouter />
      </DashboardLayout>
    </QueryClientProvider>
  );
}
```

### Data Flow

```
User Action (click, type, etc.)
    ↓
Component Event Handler
    ↓
Zustand Store Action (if state change needed)
    ↓
State Update
    ↓
React Re-render
    ↓
UI Update
```

**Example: Query execution flow**

```
User types in search input
    ↓
onChange handler calls updateQuery({ match: value })
    ↓
Zustand store updates query.match
    ↓
StudioPage re-renders with new query
    ↓
SQL preview updates (buildSqlPreview() called)
    ↓
User clicks Execute button
    ↓
executeQuery() called
    ↓
Store sets isExecuting = true
    ↓
Simulated API call (setTimeout)
    ↓
Store sets results, isExecuting = false, executionTime
    ↓
StudioPage re-renders with results
    ↓
Results displayed in tabs
```

---

## 5. Component Architecture

### Component Hierarchy

```
App
├── DashboardLayout
│   ├── Header
│   ├── Sidebar
│   └── Main Content
│       └── PageRouter
│           ├── OverviewPage
│           │   ├── MetricCard (×4)
│           │   ├── Secondary metrics (×3)
│           │   └── ValidationGateCard (×9)
│           ├── StoragePage
│           │   ├── Filters
│           │   └── Objects table
│           ├── SegmentsPage
│           │   ├── Filters
│           │   ├── Segments table
│           │   └── Detail panel
│           ├── StudioPage
│           │   ├── Schema panel
│           │   ├── Query builder
│           │   ├── Query templates
│           │   ├── Results viewer
│           │   └── Query history
│           └── PerformancePage
│               ├── Key metrics (×4)
│               ├── Charts (×4)
│               └── Query distribution chart
```

### Reusable Components

**MetricCard** — Display key metrics with icon, label, value, and optional change indicator

**ValidationGateCard** — Display validation gate status with pass/fail indicators

**RefKindIcon** — Color-coded icons for segment ref kinds

**LifecycleBadge** — Color-coded badges for object lifecycle states

**ReplicaStatus** — Icons for replica verification status

### Creating New Components

**Step 1: Define props interface**

```tsx
interface NewComponentProps {
  prop1: string;
  prop2: number;
  optionalProp?: boolean;
}
```

**Step 2: Create component**

```tsx
export function NewComponent({ prop1, prop2, optionalProp = false }: NewComponentProps) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5">
      {/* Component content */}
    </div>
  );
}
```

**Step 3: Use in page**

```tsx
import { NewComponent } from '../components/NewComponent';

<NewComponent prop1="value" prop2={42} optionalProp={true} />
```

---

## 6. State Management

### Zustand Store

The dashboard uses Zustand for state management (`src/dashboard/store/dashboardStore.ts`).

**Store structure:**

```typescript
interface DashboardState {
  // UI state
  currentPage: Page;
  sidebarCollapsed: boolean;
  
  // Studio state
  studio: StudioState;
  
  // Actions
  setPage: (page: Page) => void;
  toggleSidebar: () => void;
  updateQuery: (updates: Partial<QueryState>) => void;
  executeQuery: () => Promise<void>;
  addToHistory: (query: string, hits: number, duration: number) => void;
}
```

**Using the store:**

```tsx
import { useDashboardStore } from '../store/dashboardStore';

export function MyComponent() {
  // Select specific values
  const currentPage = useDashboardStore((state) => state.currentPage);
  const setPage = useDashboardStore((state) => state.setPage);
  
  // Or destructure
  const { currentPage, setPage } = useDashboardStore();
  
  return (
    <button onClick={() => setPage('studio')}>
      Go to Studio (current: {currentPage})
    </button>
  );
}
```

**Adding new state:**

```typescript
// 1. Add to state interface
interface DashboardState {
  // ... existing state
  newFeature: {
    enabled: boolean;
    config: string;
  };
  
  // ... existing actions
  setNewFeature: (enabled: boolean, config: string) => void;
}

// 2. Add initial state
export const useDashboardStore = create<DashboardState>((set) => ({
  // ... existing state
  newFeature: {
    enabled: false,
    config: 'default',
  },
  
  // ... existing actions
  setNewFeature: (enabled, config) =>
    set((state) => ({
      newFeature: { enabled, config },
    })),
}));

// 3. Use in component
const { newFeature, setNewFeature } = useDashboardStore();
```

---

## 7. Extension Guide

### Adding a New Page

**Step 1: Create page component**

```tsx
// src/dashboard/pages/NewPage.tsx
export function NewPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">New Page</h1>
        <p className="text-sm text-zinc-500">Page description</p>
      </div>
      
      {/* Page content */}
    </div>
  );
}
```

**Step 2: Add to Page type**

```typescript
// src/dashboard/store/dashboardStore.ts
export type Page = 'overview' | 'storage' | 'segments' | 'studio' | 'performance' | 'newpage';
```

**Step 3: Add navigation item**

```tsx
// src/dashboard/components/DashboardLayout.tsx
import { NewIcon } from 'lucide-react';

const navItems = [
  // ... existing items
  { id: 'newpage', label: 'New Page', icon: NewIcon, description: 'Description' },
];
```

**Step 4: Add route**

```tsx
// src/App.tsx
import { NewPage } from './dashboard/pages/NewPage';

function PageRouter() {
  const { currentPage } = useDashboardStore();

  switch (currentPage) {
    // ... existing cases
    case 'newpage':
      return <NewPage />;
    default:
      return <OverviewPage />;
  }
}
```

### Adding a New Chart

**Step 1: Import Recharts components**

```tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
```

**Step 2: Create chart component**

```tsx
export function NewChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Chart Title</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="name" stroke="#52525b" fontSize={10} />
          <YAxis stroke="#52525b" fontSize={10} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

**Step 3: Use in page**

```tsx
<NewChart data={chartData} />
```

### Adding Real API Integration

**Step 1: Create API client**

```typescript
// src/dashboard/api/client.ts
const API_BASE = '/api';

export async function fetchObjects(): Promise<ObjectData[]> {
  const response = await fetch(`${API_BASE}/objects`);
  if (!response.ok) throw new Error('Failed to fetch objects');
  return response.json();
}

export async function fetchSegments(): Promise<SegmentData[]> {
  const response = await fetch(`${API_BASE}/segments`);
  if (!response.ok) throw new Error('Failed to fetch segments');
  return response.json();
}

export async function executeQuery(query: QueryState): Promise<QueryResult[]> {
  const response = await fetch(`${API_BASE}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  });
  if (!response.ok) throw new Error('Query execution failed');
  return response.json();
}
```

**Step 2: Install React Query**

```bash
npm install @tanstack/react-query
```

**Step 3: Wrap app with provider**

```tsx
// src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardLayout>
        <PageRouter />
      </DashboardLayout>
    </QueryClientProvider>
  );
}
```

**Step 4: Use in pages**

```tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchObjects, executeQuery } from '../api/client';

export function StoragePage() {
  const { data: objects, isLoading, error } = useQuery({
    queryKey: ['objects'],
    queryFn: fetchObjects,
  });

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6">Error: {error.message}</div>;

  return (
    <div className="p-6">
      {/* Render objects */}
    </div>
  );
}

export function StudioPage() {
  const executeMutation = useMutation({
    mutationFn: executeQuery,
    onSuccess: (results) => {
      // Update store with results
    },
  });

  const handleExecute = () => {
    executeMutation.mutate(query);
  };

  return (
    <button
      onClick={handleExecute}
      disabled={executeMutation.isPending}
    >
      {executeMutation.isPending ? 'Executing...' : 'Execute'}
    </button>
  );
}
```

---

## 8. Wiring Everything Together

### File Structure

```
src/
├── App.tsx                          # Main app with page router
├── main.tsx                         # Entry point
├── index.css                        # Global styles
├── dashboard/
│   ├── components/
│   │   └── DashboardLayout.tsx      # Layout with sidebar
│   ├── data/
│   │   └── mockData.ts              # Mock data
│   ├── pages/
│   │   ├── OverviewPage.tsx
│   │   ├── StoragePage.tsx
│   │   ├── SegmentsPage.tsx
│   │   ├── StudioPage.tsx
│   │   └── PerformancePage.tsx
│   └── store/
│       └── dashboardStore.ts        # Zustand store
```

### How It's Wired

**1. Entry point (`main.tsx`)**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**2. App component (`App.tsx`)**

```tsx
import { useDashboardStore } from './dashboard/store/dashboardStore';
import { DashboardLayout } from './dashboard/components/DashboardLayout';
import { OverviewPage } from './dashboard/pages/OverviewPage';
// ... other page imports

function PageRouter() {
  const { currentPage } = useDashboardStore();

  switch (currentPage) {
    case 'overview': return <OverviewPage />;
    case 'storage': return <StoragePage />;
    // ... other cases
    default: return <OverviewPage />;
  }
}

export default function App() {
  return (
    <DashboardLayout>
      <PageRouter />
    </DashboardLayout>
  );
}
```

**3. DashboardLayout**

```tsx
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentPage, setPage, sidebarCollapsed, toggleSidebar } = useDashboardStore();

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header>...</header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside>
          <nav>
            {navItems.map((item) => (
              <button onClick={() => setPage(item.id)}>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
```

**4. Pages use store and data**

```tsx
export function StoragePage() {
  const { mockObjects } = require('../data/mockData');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredObjects = mockObjects.filter(/* ... */);
  
  return (
    <div className="p-6">
      <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      <table>
        {filteredObjects.map((obj) => (
          <tr key={obj.objectId}>...</tr>
        ))}
      </table>
    </div>
  );
}
```

### Data Flow Summary

```
User → UI Event → Component Handler → Zustand Store → State Update → React Re-render → UI Update
                                                    ↓
                                              Mock Data / API
```

---

## 9. Practical Examples

### Example 1: Adding a New Metric

**Goal:** Add "Total Sessions" metric to Overview page

**Step 1: Add to mock data**

```typescript
// src/dashboard/data/mockData.ts
export const mockMetrics = {
  // ... existing metrics
  totalSessions: 3847,
};
```

**Step 2: Add metric card**

```tsx
// src/dashboard/pages/OverviewPage.tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Existing cards */}
  <MetricCard icon={Database} label="Total Objects" value={mockMetrics.totalObjects.toLocaleString()} />
  <MetricCard icon={Layers} label="Total Segments" value={mockMetrics.totalSegments.toLocaleString()} />
  <MetricCard icon={HardDrive} label="Total Storage" value={formatBytes(mockMetrics.totalSizeBytes)} />
  <MetricCard icon={Zap} label="Cache Hit Rate" value={`${(mockMetrics.cacheHitRate * 100).toFixed(1)}%`} />
  
  {/* New card */}
  <MetricCard
    icon={MessageSquare}
    label="Total Sessions"
    value={mockMetrics.totalSessions.toLocaleString()}
    change="+15%"
    color="bg-rose-500/10 text-rose-400"
  />
</div>
```

### Example 2: Adding a Filter

**Goal:** Add provider filter to Storage page

**Step 1: Add state**

```tsx
// src/dashboard/pages/StoragePage.tsx
const [providerFilter, setProviderFilter] = useState<string>('all');
```

**Step 2: Add UI**

```tsx
<div className="flex items-center gap-3">
  {/* Existing search */}
  <div className="flex-1 flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
    <Search className="w-4 h-4 text-zinc-500" />
    <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
  </div>
  
  {/* Existing lifecycle filter */}
  <select value={lifecycleFilter} onChange={(e) => setLifecycleFilter(e.target.value)}>
    <option value="all">All Lifecycle</option>
    <option value="active">Active</option>
    {/* ... */}
  </select>
  
  {/* New provider filter */}
  <select value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)}>
    <option value="all">All Providers</option>
    <option value="r2">R2</option>
    <option value="b2">B2</option>
    <option value="s3">S3</option>
  </select>
</div>
```

**Step 3: Update filter logic**

```tsx
const filteredObjects = mockObjects.filter((obj) => {
  const matchesSearch = searchQuery === '' || obj.objectId.includes(searchQuery);
  const matchesLifecycle = lifecycleFilter === 'all' || obj.lifecycle === lifecycleFilter;
  const matchesProvider = providerFilter === 'all' || 
    obj.replicas.some(r => r.provider === providerFilter);
  return matchesSearch && matchesLifecycle && matchesProvider;
});
```

### Example 3: Adding a Modal

**Goal:** Add object detail modal to Storage page

**Step 1: Create modal component**

```tsx
// src/dashboard/components/ObjectDetailModal.tsx
import { ObjectData } from '../data/mockData';
import { X } from 'lucide-react';

export function ObjectDetailModal({ object, onClose }: { 
  object: ObjectData; 
  onClose: () => void 
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Object Details</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <span className="text-xs text-zinc-500 block mb-1">Object ID</span>
            <code className="text-sm text-sky-400">{object.objectId}</code>
          </div>
          <div>
            <span className="text-xs text-zinc-500 block mb-1">Content Hash</span>
            <code className="text-sm text-zinc-300">{object.contentHash}</code>
          </div>
          <div>
            <span className="text-xs text-zinc-500 block mb-1">Size</span>
            <span className="text-sm text-zinc-300">{formatBytes(object.sizeBytes)}</span>
          </div>
          {/* More fields */}
        </div>
        
        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Use in Storage page**

```tsx
// src/dashboard/pages/StoragePage.tsx
import { ObjectDetailModal } from '../components/ObjectDetailModal';

export function StoragePage() {
  const [selectedObject, setSelectedObject] = useState<ObjectData | null>(null);
  
  return (
    <div className="p-6">
      {/* Existing content */}
      
      <tr onClick={() => setSelectedObject(obj)} className="cursor-pointer">
        {/* ... */}
      </tr>
      
      {selectedObject && (
        <ObjectDetailModal
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
        />
      )}
    </div>
  );
}
```

---

## 10. Troubleshooting

### Dashboard not loading

**Symptom:** Blank page or error

**Fix:**
1. Check browser console for errors
2. Verify all imports are correct
3. Ensure Zustand store is initialized
4. Check that `main.tsx` is rendering `<App />`

### Charts not rendering

**Symptom:** Empty chart area

**Fix:**
1. Check that Recharts is installed: `npm list recharts`
2. Verify data format matches Recharts expectations (array of objects)
3. Check `ResponsiveContainer` has explicit height
4. Ensure chart components are imported correctly

### Query execution not working

**Symptom:** Execute button does nothing

**Fix:**
1. Check that `query.match` is not empty
2. Verify Zustand store is connected
3. Check browser console for errors
4. Ensure `executeQuery` action is called

### Sidebar not collapsing

**Symptom:** Sidebar stays expanded

**Fix:**
1. Check that `toggleSidebar` action is called
2. Verify `sidebarCollapsed` state is updating
3. Check CSS transition is working
4. Ensure sidebar width classes are correct

### Styles not applying

**Symptom:** Components look unstyled

**Fix:**
1. Check that Tailwind is configured correctly
2. Verify `index.css` imports Tailwind
3. Check that classes are spelled correctly
4. Ensure no conflicting CSS

---

## Further Reading

- **DASHBOARD_README.md** — Architecture overview
- **DASHBOARD_AGENTS.md** — Rules for AI agents
- **README.md** (root) — P1 specification
- **AGENTS.md** (root) — P1 codebase rules
- **GUIDE.md** (root) — P1 user guide

---

*Last updated: 2026-09-05*
