import React from 'react';
import { Table, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useJobContext } from '../context/JobContext';

export const TopBar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    linkedSheet,
    syncStatus,
    setIsSyncModalOpen,
    user,
    lastSyncTime,
  } = useJobContext();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single Brand element */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
              TF
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              TrackForge
            </span>
          </div>

          {/* Zone 2: 3-4 clean single-line nav links */}
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === 'kanban'
                  ? 'border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === 'table'
                  ? 'border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              Data Grid
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeTab === 'analytics'
                  ? 'border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              Analytics
            </button>
          </nav>

          {/* Zone 3: 1 primary action / connection state */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsSyncModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors whitespace-nowrap shrink-0"
              title={
                linkedSheet
                  ? `Synced with Google Sheet (${lastSyncTime ? `Last synced: ${lastSyncTime}` : 'Active'})`
                  : 'Connect with Google Sheets'
              }
            >
              <Table className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              {syncStatus === 'syncing' ? (
                <span className="inline-flex items-center gap-1.5 text-indigo-600 font-medium">
                  <RefreshCw className="w-3 h-3 animate-spin shrink-0" />
                  Syncing Sheets...
                </span>
              ) : linkedSheet ? (
                <span className="inline-flex items-center gap-1.5 text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Google Sheets Synced</span>
                </span>
              ) : syncStatus === 'error' ? (
                <span className="inline-flex items-center gap-1 text-rose-600">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Sync Alert</span>
                </span>
              ) : (
                <span className="font-medium text-slate-700">Connect Google Sheets</span>
              )}
            </button>

            {user && (
              <button
                onClick={() => setIsSyncModalOpen(true)}
                className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center justify-center border border-indigo-200 hover:ring-2 hover:ring-indigo-400 transition-all"
                title={user.email || 'Google Account'}
              >
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'G'}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
