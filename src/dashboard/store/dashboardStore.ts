import { create } from 'zustand';
import type { QueryResult } from '../data/mockData';

export type Page = 'overview' | 'storage' | 'segments' | 'studio' | 'performance';

export interface QueryState {
  match: string;
  project: string;
  harness: string[];
  provider: string;
  embedModel: string;
  limit: number;
  facets: string[];
  hybridMode: boolean;
}

export interface StudioState {
  query: QueryState;
  results: QueryResult[];
  isExecuting: boolean;
  executionTime: number | null;
  totalHits: number;
  queryHistory: Array<{
    id: string;
    query: string;
    timestamp: string;
    hits: number;
    duration: number;
  }>;
}

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

const defaultQuery: QueryState = {
  match: '',
  project: 'agent-history',
  harness: [],
  provider: '',
  embedModel: 'Xenova/all-MiniLM-L6-v2',
  limit: 20,
  facets: ['logical_category', 'harness', 'ref_kind'],
  hybridMode: false,
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  currentPage: 'overview',
  sidebarCollapsed: false,
  studio: {
    query: { ...defaultQuery },
    results: [],
    isExecuting: false,
    executionTime: null,
    totalHits: 0,
    queryHistory: [
      {
        id: '1',
        query: "MATCH('galera replication failure')",
        timestamp: '2026-09-05T18:25:00Z',
        hits: 3,
        duration: 42,
      },
      {
        id: '2',
        query: "hybrid_match('oauth flow 401 refresh')",
        timestamp: '2026-09-05T18:20:00Z',
        hits: 7,
        duration: 68,
      },
      {
        id: '3',
        query: "MATCH('context pack assembly')",
        timestamp: '2026-09-05T18:15:00Z',
        hits: 12,
        duration: 31,
      },
    ],
  },

  setPage: (page) => set({ currentPage: page }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  updateQuery: (updates) =>
    set((s) => ({
      studio: {
        ...s.studio,
        query: { ...s.studio.query, ...updates },
      },
    })),

  executeQuery: async () => {
    set((s) => ({
      studio: { ...s.studio, isExecuting: true },
    }));

    // Simulate query execution
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 400));

    const { mockQueryResults } = await import('../data/mockData');
    const executionTime = Math.floor(30 + Math.random() * 60);

    set((s) => ({
      studio: {
        ...s.studio,
        results: mockQueryResults,
        isExecuting: false,
        executionTime,
        totalHits: mockQueryResults.length,
      },
    }));

    // Add to history
    const state = get();
    const queryStr = state.studio.query.hybridMode
      ? `hybrid_match('${state.studio.query.match}')`
      : `MATCH('${state.studio.query.match}')`;
    
    set((s) => ({
      studio: {
        ...s.studio,
        queryHistory: [
          {
            id: Date.now().toString(),
            query: queryStr,
            timestamp: new Date().toISOString(),
            hits: mockQueryResults.length,
            duration: executionTime,
          },
          ...s.studio.queryHistory.slice(0, 19),
        ],
      },
    }));
  },

  addToHistory: (query, hits, duration) =>
    set((s) => ({
      studio: {
        ...s.studio,
        queryHistory: [
          {
            id: Date.now().toString(),
            query,
            timestamp: new Date().toISOString(),
            hits,
            duration,
          },
          ...s.studio.queryHistory.slice(0, 19),
        ],
      },
    })),
}));
