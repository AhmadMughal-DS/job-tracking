# Job Application Tracker with Google Sheets Synchronization

A high-performance, structured job search workspace that centralizes job applications, interview stages, recruiter communications, salary targets, and resume versions, complete with automated two-way Google Sheets synchronization and real-time funnel analytics.

### User Review & Critical Decisions

> [!IMPORTANT]
> The implementation directly incorporates all user preferences confirmed during Phase 1:
> - **Google Sheets Sync**: Auto-creates a dedicated spreadsheet in the user's Google Drive with formatted headers, frozen panes, and full two-way synchronization.
> - **Primary Layout**: Kanban board organized across pipeline stages (Wishlist, Applied, Screening, Interviewing, Offer, Rejected) paired with an instant sliding detail drawer.
> - **Core Tracking Suite**: Granular tracking for multi-stage interview rounds, salary brackets, recruiter contacts, resume versions/links, and job search metrics (response rates, active offers, stage conversion).

- **Confirmed Decision 1**: Automated Sheet provisioning on Google Drive with two-way read/write sync and local-first fallback persistence.
- **Confirmed Decision 2**: Interactive Kanban board with drag-and-drop / one-click stage moves, quick filter bars, and high-density tabular view toggle.
- **Confirmed Decision 3**: Comprehensive data capture per job (interview timeline, recruiter dossiers, resume tags, salary figures, and next-action deadlines).
- **OAuth Scope Requirement**: Needs `https://www.googleapis.com/auth/spreadsheets` and `https://www.googleapis.com/auth/drive.file` to create and update the tracking spreadsheet with user permission.

---

### 1. Overview & Core Concept

- **What It Does**: Empowers job seekers to orchestrate their entire job hunt in one unified cockpit. Users can track job listings from discovery to signed offer, manage interview dates and prep notes, log recruiter contacts, analyze response rates across resume versions, and keep everything synced in real time with Google Sheets.
- **Target Audience / Persona**: Software engineers, tech professionals, and career switchers managing multiple concurrent applications across high-growth startups and enterprise companies.
- **Key Value**: Eliminates lost application details and disjointed spreadsheets by providing a tactile Kanban workflow combined with the permanence and shareability of Google Sheets.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. *Dashboard Entry & Overview*: The user lands on a clean workspace displaying active job metrics (Total Applied, Interview Rate, Active Offers, Upcoming Next Actions) alongside the interactive Kanban pipeline.
  2. *Application Creation & Quick Capture*: Clicking "Add Application" opens an intuitive form capturing company, role, workplace type (Remote/Hybrid/On-site), salary bracket, job posting URL, target resume version, and recruiter contact info.
  3. *Kanban Progression*: Dragging cards across columns (or using the stage selector) updates application status and triggers automatic timestamp logging.
  4. *Quick Drawer Deep-Dive*: Clicking any card slides in a comprehensive drawer to manage interview rounds, prep questions, recruiter feedback, follow-up dates, and links.
  5. *Google Sheets Connection & Sync*: Clicking "Sync with Google Sheets" prompts Google authentication with official styling, provisions the spreadsheet with formatted header rows and data validation, and establishes continuous sync.
  6. *Analytics & Funnel View*: Dedicated modal/tab revealing response rate percentages, stage progression drop-offs, and resume version performance.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Refined SaaS productivity aesthetic engineered around clean lines, high-density scannability, subtle surface elevation, and zero visual clutter.
  - *Color Palette & Mood*: Dominant slate canvas (`#F8FAFC` light / `#0F172A` dark neutral base), structural card surfaces (`#FFFFFF` / `#1E293B`), subtle borders (`border-slate-200 / border-slate-800`), and purposeful semantic accents:
    - Primary Action: Deep Indigo (`#4F46E5`)
    - Nominal / Active / Passed: Emerald (`#10B981`)
    - Upcoming / Interviewing: Amber (`#F59E0B`)
    - Offer / Milestone: Violet (`#8B5CF6`)
    - Rejection / Inactive: Rose (`#F43F5E`)
  - *Typography & Hierarchy*: `Plus Jakarta Sans` for clean titles, `DM Sans` for scannable body text, and tabular monospace (`tabular-nums font-mono`) for salary ranges, interview dates, and conversion percentages.
  - *Anti-Slop Discipline*: Zero static pill containers; unboxed inline metadata separated with `·`; no arbitrary percentage gimmicks or pseudo-code comment headers.

- **Interactive Feedback & Motion**:
  - Micro-interactions on column drops and stage transitions ($\le 180\text{ms}$).
  - Real-time sync indicator showing last synchronized timestamp with Google Sheets.
  - Accessible keyboard navigation and visible focus rings.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Auto-Provisioned Google Sheet vs. Manual Sheet ID Entry**
  - *Chosen Approach*: Automatically create or detect a dedicated "Job Application Tracker - Workspace" spreadsheet via Google Sheets & Drive API, while offering an optional "Change Linked Sheet" dialog for advanced users.
  - *Why*: Reduces onboarding friction to a single click while ensuring correct header formatting and column schemas.
  - *Alternatives Considered*: Requiring the user to manually copy and paste a Google Sheet URL, which causes format mismatches and user errors.

- **Decision 2: Local-First Storage with Cloud Sheet Sync**
  - *Chosen Approach*: Store applications in client state backed by local persistence (`localStorage`), then bidirectionally synchronize with Google Sheets when authenticated.
  - *Why*: The app is immediately functional without requiring sign-in on first load, and operates seamlessly even in flaky network environments.
  - *Alternatives Considered*: Pure cloud-only storage, which locks out users prior to Google sign-in.

- **Decision 3: Dual View: Interactive Kanban & Sortable Table**
  - *Chosen Approach*: Primary Kanban view with quick switch to a dense tabular grid view with search and multi-column sorting.
  - *Why*: Kanban excels for daily status tracking; table view excels for bulk reviews, salary comparisons, and fast sorting.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Top Navigation Bar                              │
│  [JobTracker Studio]   [Kanban | Table | Analytics]   [Google Sync CTA] │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
┌─────────────────────────────────┐             ┌────────────────────────────────┐
│      Metrics & Quick KPI Strip  │             │   Search & Stage Filter Bar    │
│  Applied · Interviews · Offers  │             │   Role / Company / Location    │
└────────────────┬────────────────┘             └────────────────┬───────────────┘
                 │                                               │
                 ▼                                               ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│               Interactive Pipeline Kanban / High-Density Grid                   │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│   │   Wishlist   │ │   Applied    │ │ Interviewing │ │    Offer     │          │
│   │ ──────────── │ │ ──────────── │ │ ──────────── │ │ ──────────── │          │
│   │ Card item    │ │ Card item    │ │ Card item    │ │ Card item    │          │
│   └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘          │
└────────────────────────────────────┬───────────────────────────────────────────┘
                                     │ (Click Card)
                                     ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                     Job Detail & Interview Drawer                              │
│  - Company, Role, Salary Range ($120k-$150k), Location (Remote)                │
│  - Recruiter Contact: Name, Email, Phone, Recruiter Notes                      │
│  - Resume Version: "SWE_Senior_Platform_v2.pdf" + Drive/Docs Link              │
│  - Multi-round Interview Schedule & Round Prep Logs                            │
│  - Stage Shift Actions & Destructive Confirmation Modal                        │
└────────────────────────────────────┬───────────────────────────────────────────┘
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
┌─────────────────────────────────┐             ┌────────────────────────────────┐
│      Local-First Store          │             │     Google Sheets API Client   │
│  Immediate reactivity & offline │ ◄─────────► │  Sheets v4 (spreadsheets.create│
│  cache via browser state        │             │  values.get, values.batchUpdate│
└─────────────────────────────────┘             └────────────────────────────────┘
```

- **Data Model & Entities**:
  - `JobApplication`: `id`, `company`, `role`, `status` (`WISHLIST`, `APPLIED`, `SCREENING`, `INTERVIEWING`, `OFFER`, `REJECTED`, `ARCHIVED`), `appliedDate`, `location`, `workplaceType`, `salaryMin`, `salaryMax`, `salaryCurrency`, `jobUrl`, `jobDescription`, `resumeVersion`, `resumeLink`, `recruiterName`, `recruiterEmail`, `recruiterPhone`, `recruiterNotes`, `interviewRounds`, `notes`, `nextAction`, `nextActionDate`, `rating`, `updatedAt`.
  - `InterviewRound`: `id`, `roundName` (e.g. Recruiter Screen, Technical Coding, System Design, Executive Bar Raiser), `date`, `interviewers`, `notes`, `status` (`SCHEDULED`, `COMPLETED`, `PASSED`, `FAILED`).
  - `SearchMetrics`: Total applications, response rate (interviews / applied), offer rate, stage distribution breakdown.

- **Google Sheets Schema (Column Headers)**:
  `ID`, `Company`, `Role`, `Status`, `Applied Date`, `Location`, `Workplace Type`, `Salary Min`, `Salary Max`, `Currency`, `Job URL`, `Resume Version`, `Resume Link`, `Recruiter Name`, `Recruiter Email`, `Next Action`, `Next Action Date`, `Interview Rounds Count`, `Notes`, `Last Updated`.

- **Interactive Handlers & Flows**:
  - Drag & drop and one-click stage movements with undo toasts.
  - Multi-criteria live filtering (search text, workplace type, salary threshold).
  - Explicit confirmation modal for destructive operations (delete job application or clear sheet).
  - OAuth login modal via Firebase Auth with `GoogleAuthProvider` requesting `spreadsheets` and `drive.file` scopes.
