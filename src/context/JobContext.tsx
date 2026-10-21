import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User } from 'firebase/auth';
import {
  JobApplication,
  ApplicationStatus,
  WorkplaceType,
  InterviewRound,
  LinkedSheetInfo,
  SyncStatus,
} from '../types/job';
import { INITIAL_APPLICATIONS } from '../data/mockData';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  subscribeAuth,
} from '../services/auth';
import {
  findOrCreateJobSpreadsheet,
  syncApplicationsToGoogleSheet,
  pullApplicationsFromGoogleSheet,
} from '../services/sheetsService';

const STORAGE_KEY = 'trackforge_job_applications_v1';
const SHEET_META_KEY = 'trackforge_linked_sheet_v1';

interface ConfirmationDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  isDestructive: boolean;
  onConfirm: () => void;
}

interface JobContextType {
  applications: JobApplication[];
  activeTab: 'kanban' | 'table' | 'analytics';
  setActiveTab: (tab: 'kanban' | 'table' | 'analytics') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  workplaceFilter: string;
  setWorkplaceFilter: (type: string) => void;
  selectedApplication: JobApplication | null;
  setSelectedApplication: (app: JobApplication | null) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isSyncModalOpen: boolean;
  setIsSyncModalOpen: (open: boolean) => void;
  editingApplication: JobApplication | null;
  setEditingApplication: (app: JobApplication | null) => void;
  // CRUD actions
  addApplication: (app: Omit<JobApplication, 'id' | 'updatedAt'>) => Promise<void>;
  updateApplication: (id: string, updates: Partial<JobApplication>) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  updateStatus: (id: string, newStatus: ApplicationStatus) => Promise<void>;
  addInterviewRound: (jobId: string, round: Omit<InterviewRound, 'id'>) => Promise<void>;
  updateInterviewRound: (
    jobId: string,
    roundId: string,
    updates: Partial<InterviewRound>
  ) => Promise<void>;
  deleteInterviewRound: (jobId: string, roundId: string) => Promise<void>;
  // Auth & Sync
  user: User | null;
  token: string | null;
  isAuthLoading: boolean;
  syncStatus: SyncStatus;
  syncError: string | null;
  lastSyncTime: string | null;
  linkedSheet: LinkedSheetInfo | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  triggerPushSync: () => Promise<void>;
  triggerPullSync: () => Promise<void>;
  connectSpreadsheet: () => Promise<LinkedSheetInfo | null>;
  // Confirmation Modal
  confirmationDialog: ConfirmationDialogState;
  requestConfirmation: (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmLabel?: string,
    isDestructive?: boolean
  ) => void;
  closeConfirmation: () => void;
  filteredApplications: JobApplication[];
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load applications from localStorage, fallback to realistic mock data
  const [applications, setApplications] = useState<JobApplication[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error reading localStorage applications:', e);
    }
    return INITIAL_APPLICATIONS;
  });

  const [linkedSheet, setLinkedSheet] = useState<LinkedSheetInfo | null>(() => {
    try {
      const stored = localStorage.getItem(SHEET_META_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading linked sheet from storage:', e);
    }
    return null;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'kanban' | 'table' | 'analytics'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [workplaceFilter, setWorkplaceFilter] = useState('ALL');
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Auth & Sync state
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(
    linkedSheet?.lastSyncedAt || null
  );

  // Destructive Confirmation Dialog
  const [confirmationDialog, setConfirmationDialog] = useState<ConfirmationDialogState>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    isDestructive: false,
    onConfirm: () => {},
  });

  const requestConfirmation = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      confirmLabel = 'Confirm',
      isDestructive = true
    ) => {
      setConfirmationDialog({
        isOpen: true,
        title,
        message,
        confirmLabel,
        isDestructive,
        onConfirm,
      });
    },
    []
  );

  const closeConfirmation = useCallback(() => {
    setConfirmationDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Save applications to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    } catch (e) {
      console.error('Error saving applications to localStorage:', e);
    }
  }, [applications]);

  // Save linkedSheet info to localStorage
  useEffect(() => {
    try {
      if (linkedSheet) {
        localStorage.setItem(SHEET_META_KEY, JSON.stringify(linkedSheet));
      } else {
        localStorage.removeItem(SHEET_META_KEY);
      }
    } catch (e) {
      console.error('Error saving linked sheet info:', e);
    }
  }, [linkedSheet]);

  // Auth Initialization & Subscription
  useEffect(() => {
    const unsubAuth = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
        setIsAuthLoading(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setIsAuthLoading(false);
      }
    );

    const unsubListener = subscribeAuth((updatedUser, updatedToken) => {
      setUser(updatedUser);
      setToken(updatedToken);
      setIsAuthLoading(false);
    });

    return () => {
      unsubAuth();
      unsubListener();
    };
  }, []);

  // Sync with Google Sheets helper
  const performSheetPush = useCallback(
    async (appsToPush: JobApplication[], activeToken: string, sheetInfo: LinkedSheetInfo) => {
      setSyncStatus('syncing');
      setSyncError(null);
      try {
        await syncApplicationsToGoogleSheet(sheetInfo.spreadsheetId, appsToPush, activeToken);
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSyncTime(timestamp);
        setLinkedSheet((prev) => (prev ? { ...prev, lastSyncedAt: timestamp } : prev));
        setSyncStatus('synced');
      } catch (err: any) {
        console.error('Push sync failed:', err);
        setSyncStatus('error');
        setSyncError(err.message || 'Failed to sync with Google Sheet');
      }
    },
    []
  );

  // Add Application
  const addApplication = useCallback(
    async (appData: Omit<JobApplication, 'id' | 'updatedAt'>) => {
      const newApp: JobApplication = {
        ...appData,
        id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        updatedAt: new Date().toISOString(),
      };
      const updated = [newApp, ...applications];
      setApplications(updated);

      // Auto push to Sheet if connected
      const currentToken = await getAccessToken();
      if (currentToken && linkedSheet) {
        performSheetPush(updated, currentToken, linkedSheet);
      }
    },
    [applications, linkedSheet, performSheetPush]
  );

  // Update Application
  const updateApplication = useCallback(
    async (id: string, updates: Partial<JobApplication>) => {
      const updated = applications.map((app) =>
        app.id === id ? { ...app, ...updates, updatedAt: new Date().toISOString() } : app
      );
      setApplications(updated);

      if (selectedApplication?.id === id) {
        setSelectedApplication((prev) =>
          prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null
        );
      }

      const currentToken = await getAccessToken();
      if (currentToken && linkedSheet) {
        performSheetPush(updated, currentToken, linkedSheet);
      }
    },
    [applications, selectedApplication, linkedSheet, performSheetPush]
  );

  // Delete Application
  const deleteApplication = useCallback(
    async (id: string) => {
      const updated = applications.filter((app) => app.id !== id);
      setApplications(updated);
      if (selectedApplication?.id === id) {
        setSelectedApplication(null);
      }
      const currentToken = await getAccessToken();
      if (currentToken && linkedSheet) {
        performSheetPush(updated, currentToken, linkedSheet);
      }
    },
    [applications, selectedApplication, linkedSheet, performSheetPush]
  );

  // Fast Update Status (Kanban drop / select)
  const updateStatus = useCallback(
    async (id: string, newStatus: ApplicationStatus) => {
      await updateApplication(id, { status: newStatus });
    },
    [updateApplication]
  );

  // Interview Rounds Management
  const addInterviewRound = useCallback(
    async (jobId: string, roundData: Omit<InterviewRound, 'id'>) => {
      const target = applications.find((a) => a.id === jobId);
      if (!target) return;

      const newRound: InterviewRound = {
        ...roundData,
        id: `rnd-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      };

      const updatedRounds = [...target.interviewRounds, newRound];
      await updateApplication(jobId, { interviewRounds: updatedRounds });
    },
    [applications, updateApplication]
  );

  const updateInterviewRound = useCallback(
    async (jobId: string, roundId: string, updates: Partial<InterviewRound>) => {
      const target = applications.find((a) => a.id === jobId);
      if (!target) return;

      const updatedRounds = target.interviewRounds.map((r) =>
        r.id === roundId ? { ...r, ...updates } : r
      );
      await updateApplication(jobId, { interviewRounds: updatedRounds });
    },
    [applications, updateApplication]
  );

  const deleteInterviewRound = useCallback(
    async (jobId: string, roundId: string) => {
      const target = applications.find((a) => a.id === jobId);
      if (!target) return;

      const updatedRounds = target.interviewRounds.filter((r) => r.id !== roundId);
      await updateApplication(jobId, { interviewRounds: updatedRounds });
    },
    [applications, updateApplication]
  );

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    try {
      setSyncError(null);
      const res = await googleSignIn();
      if (res?.accessToken) {
        setToken(res.accessToken);
        setUser(res.user);
        // Automatically check or create spreadsheet
        try {
          setSyncStatus('syncing');
          const sheetInfo = await findOrCreateJobSpreadsheet(res.accessToken);
          setLinkedSheet(sheetInfo);
          // Push initial data to ensure sheet is fully synced
          await syncApplicationsToGoogleSheet(sheetInfo.spreadsheetId, applications, res.accessToken);
          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setLastSyncTime(timestamp);
          setSyncStatus('synced');
        } catch (sheetErr: any) {
          console.error('Error connecting spreadsheet after sign-in:', sheetErr);
          setSyncStatus('error');
          setSyncError(sheetErr.message || 'Connected to Google, but spreadsheet setup failed.');
        }
      }
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      setSyncStatus('error');
      setSyncError(err.message || 'Google sign-in was cancelled or failed.');
    }
  }, [applications]);

  // Sign out
  const signOutUser = useCallback(async () => {
    await logout();
    setUser(null);
    setToken(null);
    setSyncStatus('idle');
  }, []);

  // Connect or Re-connect Spreadsheet
  const connectSpreadsheet = useCallback(async (): Promise<LinkedSheetInfo | null> => {
    let currentToken = await getAccessToken();
    if (!currentToken) {
      const res = await googleSignIn();
      if (!res?.accessToken) return null;
      currentToken = res.accessToken;
      setUser(res.user);
      setToken(res.accessToken);
    }

    setSyncStatus('syncing');
    setSyncError(null);
    try {
      const sheet = await findOrCreateJobSpreadsheet(currentToken);
      setLinkedSheet(sheet);
      await syncApplicationsToGoogleSheet(sheet.spreadsheetId, applications, currentToken);
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(timestamp);
      setSyncStatus('synced');
      return sheet;
    } catch (e: any) {
      setSyncStatus('error');
      setSyncError(e.message || 'Failed to connect spreadsheet.');
      throw e;
    }
  }, [applications]);

  // Push Sync
  const triggerPushSync = useCallback(async () => {
    let currentToken = await getAccessToken();
    if (!currentToken) {
      const res = await googleSignIn();
      if (!res?.accessToken) return;
      currentToken = res.accessToken;
      setUser(res.user);
      setToken(res.accessToken);
    }

    let sheet = linkedSheet;
    if (!sheet) {
      sheet = await findOrCreateJobSpreadsheet(currentToken);
      setLinkedSheet(sheet);
    }

    await performSheetPush(applications, currentToken, sheet);
  }, [applications, linkedSheet, performSheetPush]);

  // Pull Sync (from Google Sheet to app)
  const triggerPullSync = useCallback(async () => {
    let currentToken = await getAccessToken();
    if (!currentToken) {
      const res = await googleSignIn();
      if (!res?.accessToken) return;
      currentToken = res.accessToken;
      setUser(res.user);
      setToken(res.accessToken);
    }

    if (!linkedSheet) {
      throw new Error('No linked Google Sheet found. Please sync first.');
    }

    setSyncStatus('syncing');
    setSyncError(null);
    try {
      const fetched = await pullApplicationsFromGoogleSheet(
        linkedSheet.spreadsheetId,
        applications,
        currentToken
      );
      if (fetched.length > 0) {
        setApplications(fetched);
      }
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(timestamp);
      setSyncStatus('synced');
    } catch (err: any) {
      console.error('Pull sync failed:', err);
      setSyncStatus('error');
      setSyncError(err.message || 'Failed to pull from Google Sheet.');
    }
  }, [applications, linkedSheet]);

  // Filtered Applications memo
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Text search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        app.company.toLowerCase().includes(q) ||
        app.role.toLowerCase().includes(q) ||
        app.location.toLowerCase().includes(q) ||
        app.resumeVersion.toLowerCase().includes(q) ||
        (app.recruiterName && app.recruiterName.toLowerCase().includes(q)) ||
        (app.notes && app.notes.toLowerCase().includes(q));

      // Status filter
      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;

      // Workplace filter
      const matchesWorkplace =
        workplaceFilter === 'ALL' || app.workplaceType === workplaceFilter;

      return matchesSearch && matchesStatus && matchesWorkplace;
    });
  }, [applications, searchQuery, statusFilter, workplaceFilter]);

  return (
    <JobContext.Provider
      value={{
        applications,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        workplaceFilter,
        setWorkplaceFilter,
        selectedApplication,
        setSelectedApplication,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isSyncModalOpen,
        setIsSyncModalOpen,
        editingApplication,
        setEditingApplication,
        addApplication,
        updateApplication,
        deleteApplication,
        updateStatus,
        addInterviewRound,
        updateInterviewRound,
        deleteInterviewRound,
        user,
        token,
        isAuthLoading,
        syncStatus,
        syncError,
        lastSyncTime,
        linkedSheet,
        signInWithGoogle,
        signOutUser,
        triggerPushSync,
        triggerPullSync,
        connectSpreadsheet,
        confirmationDialog,
        requestConfirmation,
        closeConfirmation,
        filteredApplications,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export const useJobContext = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobContext must be used within a JobProvider');
  }
  return context;
};
