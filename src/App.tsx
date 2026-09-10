import { useDashboardStore } from './dashboard/store/dashboardStore';
import { DashboardLayout } from './dashboard/components/DashboardLayout';
import { OverviewPage } from './dashboard/pages/OverviewPage';
import { StoragePage } from './dashboard/pages/StoragePage';
import { SegmentsPage } from './dashboard/pages/SegmentsPage';
import { StudioPage } from './dashboard/pages/StudioPage';
import { PerformancePage } from './dashboard/pages/PerformancePage';

function PageRouter() {
  const { currentPage } = useDashboardStore();

  switch (currentPage) {
    case 'overview':
      return <OverviewPage />;
    case 'storage':
      return <StoragePage />;
    case 'segments':
      return <SegmentsPage />;
    case 'studio':
      return <StudioPage />;
    case 'performance':
      return <PerformancePage />;
    default:
      return <OverviewPage />;
  }
}

export default function App() {
  return (
    <DashboardLayout>
      <PageRouter />
    </DashboardLayout>
  );
}
