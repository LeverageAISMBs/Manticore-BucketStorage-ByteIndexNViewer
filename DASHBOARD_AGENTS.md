# DASHBOARD_AGENTS.md — Rules for AI Agents Working on the Dashboard

> This file is read by AI coding agents before modifying the dashboard codebase. It encodes the conventions, patterns, and invariants that must not be violated.

---

## Before You Write Anything

1. Read this file in full
2. Read `DASHBOARD_README.md` for architecture overview
3. Read `src/dashboard/store/dashboardStore.ts` to understand state management
4. Check existing components for patterns before creating new ones

---

## Hard Rules

### D-1: Component Structure

Every page must follow this structure:

```tsx
export function PageName() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Page Title</h1>
        <p className="text-sm text-zinc-500">Page description</p>
      </div>
      
      {/* Content */}
      {/* ... */}
    </div>
  );
}
```

**Why:** Consistency across pages makes the codebase maintainable.

**Violation:** Creating pages with different root structure or missing header.

### D-2: State Management

All dashboard state must go through Zustand store (`src/dashboard/store/dashboardStore.ts`).

```tsx
// ✅ Correct
const { currentPage, setPage } = useDashboardStore();

// ❌ Wrong
const [currentPage, setCurrentPage] = useState('overview');
```

**Why:** Centralized state prevents prop drilling and keeps components in sync.

**Violation:** Using local `useState` for dashboard-wide state like `currentPage`, `studio` query, or `sidebarCollapsed`.

### D-3: Styling Conventions

Use only Tailwind utility classes. Never write custom CSS.

```tsx
// ✅ Correct
<div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5">

// ❌ Wrong
<div style={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}>
```

**Why:** Consistency, maintainability, and design system enforcement.

**Violation:** Using inline styles, custom CSS files, or deviating from the zinc color palette.

### D-4: Data Layer Separation

Mock data must live in `src/dashboard/data/mockData.ts`. Never hardcode data in components.

```tsx
// ✅ Correct
import { mockObjects } from '../data/mockData';

export function StoragePage() {
  const objects = mockObjects;
  // ...
}

// ❌ Wrong
export function StoragePage() {
  const objects = [
    { objectId: 'obj_123', /* ... */ }
  ];
  // ...
}
```

**Why:** Separation of concerns makes it easy to swap mock data for real API calls.

**Violation:** Hardcoding data arrays in components or mixing data definitions with UI logic.

### D-5: Type Safety

All components must be fully typed. No `any` types.

```tsx
// ✅ Correct
interface MetricCardProps {
  icon: typeof Database;
  label: string;
  value: string;
  change?: string;
  color: string;
}

export function MetricCard({ icon: Icon, label, value, change, color }: MetricCardProps) {
  // ...
}

// ❌ Wrong
export function MetricCard(props: any) {
  // ...
}
```

**Why:** Type safety catches bugs at compile time and provides better IDE support.

**Violation:** Using `any`, missing prop types, or implicit `any` in function parameters.

### D-6: Responsive Design

All pages must work on mobile, tablet, and desktop.

```tsx
// ✅ Correct
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// ❌ Wrong
<div className="grid grid-cols-4 gap-4">
```

**Why:** Dashboard must be usable on all device sizes.

**Violation:** Fixed-width layouts, missing responsive breakpoints, or horizontal scroll on mobile.

### D-7: Accessibility

All interactive elements must be keyboard accessible.

```tsx
// ✅ Correct
<button
  onClick={handleClick}
  className="px-3 py-1.5 rounded-lg"
  aria-label="Execute query"
>
  Execute
</button>

// ❌ Wrong
<div onClick={handleClick} className="px-3 py-1.5 rounded-lg">
  Execute
</div>
```

**Why:** Accessibility is not optional.

**Violation:** Using `<div>` for clickable elements, missing `aria-label` on icon-only buttons, or poor color contrast.

### D-8: Performance

Use React.memo for expensive components. Avoid unnecessary re-renders.

```tsx
// ✅ Correct
const ExpensiveChart = React.memo(({ data }: { data: DataPoint[] }) => {
  return <Chart data={data} />;
});

// ❌ Wrong
const ExpensiveChart = ({ data }: { data: DataPoint[] }) => {
  return <Chart data={data} />;
};
```

**Why:** Dashboard has many charts and tables. Unoptimized components cause lag.

**Violation:** Creating expensive components without memoization, or passing new object/array references on every render.

### D-9: Error Handling

All async operations must handle errors gracefully.

```tsx
// ✅ Correct
const executeQuery = async () => {
  try {
    set({ isExecuting: true });
    const results = await fetchResults();
    set({ results, isExecuting: false });
  } catch (error) {
    console.error('Query failed:', error);
    set({ isExecuting: false });
    // Show error toast or message
  }
};

// ❌ Wrong
const executeQuery = async () => {
  const results = await fetchResults();
  set({ results });
};
```

**Why:** Network calls fail. Dashboard must not crash.

**Violation:** Missing try-catch blocks, unhandled promise rejections, or silent failures.

### D-10: Extension Points

When adding new features, use existing extension points. Don't create parallel systems.

```tsx
// ✅ Correct - Add new page type to existing enum
export type Page = 'overview' | 'storage' | 'segments' | 'studio' | 'performance' | 'newpage';

// ❌ Wrong - Create separate navigation system
const newPageRoutes = ['/newpage'];
```

**Why:** Parallel systems create maintenance burden and inconsistency.

**Violation:** Creating duplicate navigation, separate state stores, or alternative styling patterns.

---

## Component Patterns

### MetricCard Pattern

Use for displaying key metrics:

```tsx
<MetricCard
  icon={Database}
  label="Total Objects"
  value="1,247"
  change="+12%"
  color="bg-sky-500/10 text-sky-400"
/>
```

**Rules:**
- Always include icon, label, and value
- `change` is optional (for trend indicators)
- `color` must use Tailwind classes with `/10` opacity for background

### Table Pattern

Use for displaying lists of entities:

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

**Rules:**
- Always use `border-b border-zinc-800/60` for header
- Always use `hover:bg-zinc-800/20 transition-colors` for rows
- Always use `text-xs font-semibold text-zinc-400 uppercase tracking-wider` for headers

### Badge Pattern

Use for status indicators:

```tsx
<span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
  Active
</span>
```

**Rules:**
- Always use `/10` opacity for background
- Always include border with `/20` opacity
- Always use `text-xs font-medium`

---

## Data Integration

### Mock Data Structure

All mock data must match P1 specification types:

```typescript
// ✅ Correct - Matches P1 ObjectEntity
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

// ❌ Wrong - Doesn't match P1 spec
interface ObjectData {
  id: string;
  hash: string;
  size: number;
}
```

**Why:** Mock data must be a drop-in replacement for real API data.

**Violation:** Using different field names, missing required fields, or incorrect types.

### Zustand Store Pattern

All store actions must be pure functions:

```tsx
// ✅ Correct
setPage: (page) => set({ currentPage: page }),

// ❌ Wrong
setPage: (page) => {
  console.log('Setting page:', page);
  set({ currentPage: page });
},
```

**Why:** Pure functions are predictable and testable.

**Violation:** Side effects in store actions, async operations without proper error handling, or mutating state directly.

---

## Testing Expectations

### Component Tests

Every new component must have tests:

```tsx
import { render, screen } from '@testing-library/react';
import { MetricCard } from './MetricCard';

test('renders metric card with label and value', () => {
  render(<MetricCard label="Total" value="100" icon={Database} color="bg-sky-500" />);
  expect(screen.getByText('Total')).toBeInTheDocument();
  expect(screen.getByText('100')).toBeInTheDocument();
});
```

**Rules:**
- Test rendering with required props
- Test user interactions (clicks, hovers)
- Test conditional rendering

### Integration Tests

Every new page must have integration tests:

```tsx
import { render, screen } from '@testing-library/react';
import { StoragePage } from './StoragePage';

test('renders storage page with objects table', () => {
  render(<StoragePage />);
  expect(screen.getByText('Storage Explorer')).toBeInTheDocument();
  expect(screen.getByRole('table')).toBeInTheDocument();
});
```

**Rules:**
- Test page renders without errors
- Test navigation works
- Test data displays correctly

---

## Common Mistakes

### Mistake 1: Breaking the Layout

**Wrong:**
```tsx
<div className="flex">
  <Sidebar />
  <Main />
</div>
```

**Right:**
```tsx
<DashboardLayout>
  <PageContent />
</DashboardLayout>
```

**Why:** DashboardLayout handles responsive behavior, sidebar collapse, and consistent spacing.

### Mistake 2: Hardcoding Colors

**Wrong:**
```tsx
<div className="bg-[#18181b] text-[#fafafa]">
```

**Right:**
```tsx
<div className="bg-zinc-900 text-zinc-100">
```

**Why:** Tailwind classes are maintainable and consistent.

### Mistake 3: Missing Loading States

**Wrong:**
```tsx
const { data } = useQuery({ queryKey: ['objects'], queryFn: fetchObjects });
return <ObjectsTable objects={data} />;
```

**Right:**
```tsx
const { data, isLoading } = useQuery({ queryKey: ['objects'], queryFn: fetchObjects });
if (isLoading) return <LoadingSpinner />;
return <ObjectsTable objects={data} />;
```

**Why:** Users need feedback during async operations.

---

## What to Do When You're Unsure

1. Check existing components for patterns
2. Read the P1 specification (README.md, GUIDE.md)
3. Check the Zustand store for state management patterns
4. Ask for clarification — don't guess

---

## Summary

This dashboard is small by design. Five pages, one store, consistent patterns. The complexity is in the data integration, not the UI. Respect the patterns.
