export type ApplicationStatus =
  | 'WISHLIST'
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEWING'
  | 'OFFER'
  | 'REJECTED'
  | 'ARCHIVED';

export type WorkplaceType = 'Remote' | 'Hybrid' | 'On-site';

export interface InterviewRound {
  id: string;
  roundName: string; // e.g. "Recruiter Screen", "Technical Take-home", "System Design", "Hiring Manager"
  date: string; // YYYY-MM-DD
  time?: string;
  interviewers: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'PASSED' | 'FAILED';
  notes: string;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedDate: string; // YYYY-MM-DD
  location: string;
  workplaceType: WorkplaceType;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  jobUrl?: string;
  jobDescription?: string;
  resumeVersion: string; // e.g. "Resume_FullStack_2026.pdf"
  resumeLink?: string; // Google Drive link or URL
  recruiterName?: string;
  recruiterEmail?: string;
  recruiterPhone?: string;
  recruiterNotes?: string;
  interviewRounds: InterviewRound[];
  notes?: string;
  nextAction?: string;
  nextActionDate?: string;
  rating: number; // 1-5 rating of excitement
  updatedAt: string;
}

export interface LinkedSheetInfo {
  spreadsheetId: string;
  spreadsheetUrl: string;
  spreadsheetTitle: string;
  lastSyncedAt: string | null;
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export interface FunnelMetric {
  status: ApplicationStatus;
  label: string;
  count: number;
  percentage: number;
}
