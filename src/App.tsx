/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { JobProvider, useJobContext } from './context/JobContext';
import { TopBar } from './components/TopBar';
import { MetricsBar } from './components/MetricsBar';
import { FilterBar } from './components/FilterBar';
import { KanbanBoard } from './components/KanbanBoard';
import { TableView } from './components/TableView';
import { AnalyticsView } from './components/AnalyticsView';
import { JobDrawer } from './components/JobDrawer';
import { JobModal } from './components/JobModal';
import { GoogleSyncModal } from './components/GoogleSyncModal';
import { ConfirmationModal } from './components/ConfirmationModal';

const DashboardContent: React.FC = () => {
  const { activeTab } = useJobContext();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 3-Zone Top Navigation */}
      <TopBar />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Scannable Metrics Strip */}
        <MetricsBar />

        {/* Search, Stage & Workplace Filter Toolbar */}
        <FilterBar />

        {/* Primary View Area */}
        <div className="transition-all">
          {activeTab === 'kanban' && <KanbanBoard />}
          {activeTab === 'table' && <TableView />}
          {activeTab === 'analytics' && <AnalyticsView />}
        </div>
      </main>

      {/* Modals and Sliding Drawers */}
      <JobDrawer />
      <JobModal />
      <GoogleSyncModal />
      <ConfirmationModal />
    </div>
  );
};

export default function App() {
  return (
    <JobProvider>
      <DashboardContent />
    </JobProvider>
  );
}
