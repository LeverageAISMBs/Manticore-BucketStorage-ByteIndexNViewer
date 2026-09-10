# Agent History — Operations Dashboard

> A premium GUI for monitoring, managing, and querying the Agent History system with an integrated Manticore Visual Studio.

---

## What is this?

This is the operations dashboard for the Agent History P1 system. It provides:

- **System Overview** — Real-time metrics, validation gate status, replica health
- **Storage Explorer** — Browse objects, verify replicas, manage lifecycle
- **Segment Inspector** — Inspect segments, view byte ranges, preview content
- **Manticore Visual Studio** — Visual query builder with live execution and schema exploration
- **Performance Monitoring** — Query metrics, cache performance, system health charts

The dashboard is built with React, TypeScript, Tailwind CSS, Recharts, and Zustand. It uses mock data that mirrors the P1 specification's data structures.

---

## Architecture

```
src/
├── App.tsx                          # Main app with page router
├── dashboard/
│   ├── components/
│   │   └── DashboardLayout.tsx      # Layout with sidebar navigation
│   ├── data/
│   │   └── mockData.ts              # Mock data matching P1 types
│   ├── pages/
│   │   ├── OverviewPage.tsx         # System metrics & validation gates
│   │   ├── StoragePage.tsx          # Object browser
│   │   ├── SegmentsPage.tsx         # Segment inspector
│   │   ├── StudioPage.tsx           # Manticore Visual Studio
│   │   └── PerformancePage.tsx      # Charts & monitoring
│   └── store/
│       └── dashboardStore.ts        # Zustand state management
```

### Component Hierarchy

```
App
└── DashboardLayout
    ├── Header (top bar with search, notifications, settings)
    ├── Sidebar (navigation with page links)
    └── Main Content
        └── PageRouter
            ├── OverviewPage
            │   ├── MetricCard (×4)
            │   ├── Secondary metrics (×3)
            │   └── ValidationGateCard (×9)
            ├── StoragePage
            │   ├── Filters (search, lifecycle)
            │   └── Objects table
            ├── SegmentsPage
            │   ├── Filters (search, ref_kind)
            │   ├── Segments table
            │   └── Detail panel
            ├── StudioPage
            │   ├── Schema panel (column list)
            │   ├── Query builder
            │   │   ├── Search input
            │   │   ├── Filters (project, provider, model, limit)
            │   │   ├── Facets toggle
            │   │   └── SQL preview + Execute button
            │   ├── Query templates
            │   ├── Results viewer (tabs: results/facets/raw)
            │   └── Query history
            └── PerformancePage
                ├── Key metrics (×4)
                ├── Charts (×4)
                └── Query distribution chart
```

---

## Data Flow

### Mock Data Layer

The dashboard uses `src/dashboard/data/mockData.ts` to provide realistic data that mirrors the P1 specification:

```typescript
// Object data matches P1's ObjectEntity
interface ObjectData {
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

// Segment data matches P1's Segment
interface SegmentData {
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
```

### State Management

The dashboard uses Zustand for state management (`src/dashboard/store/dashboardStore.ts`):

```typescript
interface DashboardState {
  currentPage: Page;
  sidebarCollapsed: boolean;
  studio: StudioState;
  setPage: (page: Page) => void;
  toggleSidebar: () => void;
  updateQuery: (updates: Partial<QueryState>) => void;
  executeQuery: () => Promise<void>;
  addToHistory: (query: string, hits: number, duration: number) => void;
}
```

**StudioState** manages the Manticore Visual Studio:
- `query` — Current query parameters (match, project, harness, provider, etc.)
- `results` — Query results
- `isExecuting` — Loading state
- `executionTime` — Query duration
- `totalHits` — Result count
- `queryHistory` — Recent queries

### Query Execution Flow

```
User builds query in StudioPage
    ↓
updateQuery() updates Zustand store
    ↓
SQL preview updates in real-time
    ↓
User clicks Execute
    ↓
executeQuery() simulates API call (300-700ms delay)
    ↓
Results loaded from mockQueryResults
    ↓
Results displayed in tabs (results/facets/raw)
    ↓
Query added to history
```

---

## Pages

### Overview

**Purpose:** System health at a glance

**Components:**
- **MetricCard** — Primary metrics (objects, segments, storage, cache hit rate)
- **Secondary metrics** — Query performance, object lifecycle, replica health
- **ValidationGateCard** — G-1 through G-9 status with pass/fail indicators

**Data sources:**
- `mockMetrics` — System-wide metrics
- `mockValidationGates` — Validation gate status

**Extension points:**
- Add new metric cards by creating new `MetricCard` instances
- Add new validation gates by extending `mockValidationGates`
- Add real-time updates by replacing mock data with API calls

### Storage Explorer

**Purpose:** Browse and manage objects

**Components:**
- **Filters** — Search by ID/hash, filter by lifecycle
- **Objects table** — Sortable columns with replica status indicators
- **LifecycleBadge** — Color-coded lifecycle states
- **ReplicaStatus** — Verified/divergent/pending icons

**Data sources:**
- `mockObjects` — Array of `ObjectData`

**Extension points:**
- Add object detail modal by creating `ObjectDetailModal` component
- Add purge workflow by extending table actions
- Add replica verification by adding verify button per replica

### Segment Inspector

**Purpose:** Inspect segments and their byte ranges

**Components:**
- **Filters** — Search by ID/session/content, filter by ref_kind
- **Segments table** — Clickable rows with byte range display
- **Detail panel** — Segment metadata, byte range, content preview
- **RefKindIcon** — Color-coded icons for message/tool_event/artifact_ref/span

**Data sources:**
- `mockSegments` — Array of `SegmentData`

**Extension points:**
- Add byte range visualization by creating `ByteRangeVisualizer` component
- Add segment comparison by creating `SegmentComparison` component
- Add materialize button to fetch actual bytes from storage

### Manticore Visual Studio

**Purpose:** Visual query builder with live execution

**Components:**
- **Schema panel** — Column list with types and descriptions
- **Query builder** — Search input, filters, facets, SQL preview
- **Query templates** — Pre-built query patterns
- **Results viewer** — Tabs for results/facets/raw JSON
- **Query history** — Recent queries with re-run capability

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

### Performance

**Purpose:** Monitor query performance and system health

**Components:**
- **Key metrics** — Latency, throughput, cache hit rate, index size
- **Charts** — Query throughput, latency, cache hit rate, system health
- **Query distribution** — Bar chart by harness

**Data sources:**
- `mockPerformanceData` — Time-series data (24 hours)
- `mockMetrics` — Current metrics

**Extension points:**
- Add real-time updates by replacing mock data with WebSocket/API
- Add custom date ranges by adding date picker
- Add alert thresholds by creating `AlertThreshold` component
- Add export by creating `PerformanceExporter` component

---

## Styling

### Design System

**Colors:**
- Background: `#09090b` (zinc-950)
- Cards: `bg-zinc-900/50` with `border-zinc-800/60`
- Text: `text-zinc-100` (primary), `text-zinc-400` (secondary), `text-zinc-500` (tertiary)
- Accents: `sky-400`, `violet-400`, `emerald-400`, `amber-400`, `rose-400`

**Typography:**
- Body: Inter
- Code: JetBrains Mono
- Sizes: `text-xs` (10-12px), `text-sm` (14px), `text-lg` (18px), `text-2xl` (24px)

**Spacing:**
- Page padding: `p-6`
- Card padding: `p-5`
- Gap between cards: `gap-4` or `gap-6`

**Borders:**
- Card borders: `border border-zinc-800/60 rounded-xl`
- Dividers: `border-b border-zinc-800/60`

**Shadows:**
- Subtle: `shadow-lg shadow-sky-500/20` (for accent elements)

### Component Patterns

**MetricCard:**
```tsx
<div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5 hover:border-zinc-700/60 transition-colors">
  <div className="flex items-start justify-between mb-3">
    <div className={`p-2 rounded-lg ${color}`}>
      <Icon className="w-4 h-4" />
    </div>
    {change && <div className="text-xs text-emerald-400">{change}</div>}
  </div>
  <div className="text-2xl font-bold text-white mb-1">{value}</div>
  <div className="text-xs text-zinc-500">{label}</div>
</div>
```

**Table:**
```tsx
<table className="w-full">
  <thead>
    <tr className="border-b border-zinc-800/60 bg-zinc-900/80">
      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        Column
      </th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors">
      <td className="px-4 py-3">Content</td>
    </tr>
  </tbody>
</table>
```

**Button:**
```tsx
<button className="px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-colors text-xs font-medium">
  Button
</button>
```

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Prerequisites

- Node.js 20+
- npm or yarn

---

## Extension Guide

### Adding a New Page

1. Create page component in `src/dashboard/pages/`:
```tsx
export function NewPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Page Title</h1>
        <p className="text-sm text-zinc-500">Page description</p>
      </div>
      {/* Page content */}
    </div>
  );
}
```

2. Add page to `Page` type in `src/dashboard/store/dashboardStore.ts`:
```typescript
export type Page = 'overview' | 'storage' | 'segments' | 'studio' | 'performance' | 'newpage';
```

3. Add navigation item in `src/dashboard/components/DashboardLayout.tsx`:
```typescript
const navItems = [
  // ... existing items
  { id: 'newpage', label: 'New Page', icon: Icon, description: 'Description' },
];
```

4. Add route in `src/App.tsx`:
```typescript
case 'newpage':
  return <NewPage />;
```

### Adding a New Component

1. Create component file in appropriate directory:
```tsx
export function NewComponent({ prop1, prop2 }: { prop1: string; prop2: number }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5">
      {/* Component content */}
    </div>
  );
}
```

2. Import and use in page:
```tsx
import { NewComponent } from '../components/NewComponent';

<NewComponent prop1="value" prop2={42} />
```

### Adding Real Data

Replace mock data with API calls:

1. Create API client:
```typescript
// src/dashboard/api/client.ts
export async function fetchObjects(): Promise<ObjectData[]> {
  const response = await fetch('/api/objects');
  return response.json();
}
```

2. Use React Query or useEffect in page:
```tsx
import { useQuery } from '@tanstack/react-query';
import { fetchObjects } from '../api/client';

export function StoragePage() {
  const { data: objects, isLoading } = useQuery({
    queryKey: ['objects'],
    queryFn: fetchObjects,
  });

  if (isLoading) return <div>Loading...</div>;
  // Render objects
}
```

3. Replace mock data imports with API calls.

---

## Troubleshooting

### Dashboard not loading

**Symptom:** Blank page or error

**Fix:**
1. Check browser console for errors
2. Verify all imports are correct
3. Ensure Zustand store is initialized

### Charts not rendering

**Symptom:** Empty chart area

**Fix:**
1. Check that Recharts is installed: `npm list recharts`
2. Verify data format matches Recharts expectations
3. Check `ResponsiveContainer` has explicit height

### Query execution not working

**Symptom:** Execute button does nothing

**Fix:**
1. Check that `query.match` is not empty
2. Verify Zustand store is connected
3. Check browser console for errors

---

## Related Documentation

- **README.md** (root) — P1 specification overview
- **AGENTS.md** (root) — Rules for P1 codebase
- **GUIDE.md** (root) — P1 user guide
- **DASHBOARD_AGENTS.md** — Rules for dashboard development
- **DASHBOARD_GUIDE.md** — Dashboard user guide

---

## License

Proprietary. © 2026 LEVERAGEAI.
