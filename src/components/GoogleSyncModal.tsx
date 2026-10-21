import React from 'react';
import {
  X,
  Table,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  UploadCloud,
  DownloadCloud,
  LogOut,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useJobContext } from '../context/JobContext';

export const GoogleSyncModal: React.FC = () => {
  const {
    isSyncModalOpen,
    setIsSyncModalOpen,
    user,
    token,
    linkedSheet,
    syncStatus,
    syncError,
    lastSyncTime,
    signInWithGoogle,
    signOutUser,
    triggerPushSync,
    triggerPullSync,
    connectSpreadsheet,
    requestConfirmation,
    applications,
  } = useJobContext();

  if (!isSyncModalOpen) return null;

  const handlePullWithConfirmation = () => {
    requestConfirmation(
      'Import from Google Sheet',
      `This will import the latest rows from "${linkedSheet?.spreadsheetTitle || 'your Google Sheet'}" and merge with your current applications. Proceed?`,
      () => triggerPullSync(),
      'Import Rows',
      false
    );
  };

  const handlePushWithConfirmation = () => {
    requestConfirmation(
      'Update Google Sheet',
      `This will synchronize ${applications.length} applications to "${linkedSheet?.spreadsheetTitle || 'your Google Sheet'}". Existing rows will be updated. Proceed?`,
      () => triggerPushSync(),
      'Sync Sheet',
      false
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Google Sheets Synchronization
              </h3>
              <p className="text-xs text-slate-500">
                Automated two-way backup with your personal Google Drive
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSyncModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          {syncError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block">Sync Notice</span>
                <span className="text-[11px] leading-relaxed">{syncError}</span>
              </div>
            </div>
          )}

          {!user || !token ? (
            /* Unauthenticated state */
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div className="max-w-sm mx-auto">
                <h4 className="text-sm font-bold text-slate-900">
                  Connect your Google Account
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Sign in to automatically create and sync a dedicated spreadsheet on your Google Drive. Your applications stay backed up and accessible from any device.
                </p>
              </div>

              {/* Official Google Sign-in Button */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="gsi-material-button"
                >
                  <div className="gsi-material-button-state"></div>
                  <div className="gsi-material-button-content-wrapper">
                    <div className="gsi-material-button-icon">
                      <svg
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        style={{ display: 'block' }}
                      >
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                        ></path>
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        ></path>
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        ></path>
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        ></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                    </div>
                    <span className="gsi-material-button-contents">Sign in with Google</span>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            /* Connected state */
            <div className="space-y-4">
              {/* User Account info */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block truncate max-w-[240px]">
                      {user.displayName || user.email}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate max-w-[240px]">
                      {user.email}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={signOutUser}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-md transition-colors text-xs font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>

              {/* Linked Sheet Card */}
              {linkedSheet ? (
                <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">
                          {linkedSheet.spreadsheetTitle}
                        </h4>
                        <span className="text-[11px] text-slate-500 font-mono">
                          ID: {linkedSheet.spreadsheetId.slice(0, 16)}...
                        </span>
                      </div>
                    </div>

                    <a
                      href={linkedSheet.spreadsheetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-emerald-300 rounded-md text-emerald-700 font-semibold hover:bg-emerald-50 transition-colors text-xs shrink-0"
                    >
                      <span>Open in Sheets</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="text-[11px] text-slate-600 flex items-center justify-between border-t border-emerald-200/60 pt-2 font-mono tabular-nums">
                    <span>
                      Status:{' '}
                      <strong className="text-emerald-700">Active Two-Way Sync</strong>
                    </span>
                    <span>
                      {lastSyncTime ? `Last synced: ${lastSyncTime}` : 'Never synced'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center space-y-2">
                  <p className="text-slate-600 text-xs">
                    No spreadsheet linked yet. Click below to initialize.
                  </p>
                  <button
                    type="button"
                    onClick={connectSpreadsheet}
                    className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 text-xs"
                  >
                    Create & Link Spreadsheet
                  </button>
                </div>
              )}

              {/* Sync Actions */}
              {linkedSheet && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handlePushWithConfirmation}
                    disabled={syncStatus === 'syncing'}
                    className="p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-left flex flex-col gap-1 disabled:opacity-50"
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                      <UploadCloud className="w-4 h-4 text-indigo-600" />
                      <span>Push to Sheet</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Export all {applications.length} applications to Google Sheets
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePullWithConfirmation}
                    disabled={syncStatus === 'syncing'}
                    className="p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-left flex flex-col gap-1 disabled:opacity-50"
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                      <DownloadCloud className="w-4 h-4 text-emerald-600" />
                      <span>Import from Sheet</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Fetch updates edited directly in Google Sheets
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Uses Google Drive & Sheets API with user permission
          </span>
          <button
            type="button"
            onClick={() => setIsSyncModalOpen(false)}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
