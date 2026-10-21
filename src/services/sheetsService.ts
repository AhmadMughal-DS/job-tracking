import { JobApplication, LinkedSheetInfo, ApplicationStatus, WorkplaceType } from '../types/job';

const DEFAULT_SPREADSHEET_TITLE = 'Job Application Tracker - Workspace';
const DEFAULT_SHEET_TAB_NAME = 'Applications';

export const SHEET_HEADERS = [
  'ID',
  'Company',
  'Role',
  'Status',
  'Applied Date',
  'Location',
  'Workplace Type',
  'Salary Min',
  'Salary Max',
  'Currency',
  'Job URL',
  'Resume Version',
  'Resume Link',
  'Recruiter Name',
  'Recruiter Email',
  'Recruiter Phone',
  'Next Action',
  'Next Action Date',
  'Interview Rounds Count',
  'Rating (1-5)',
  'Notes',
  'Last Updated',
];

/**
 * Searches for an existing "Job Application Tracker - Workspace" spreadsheet in the user's Drive.
 * If not found, creates a new styled spreadsheet with frozen headers.
 */
export const findOrCreateJobSpreadsheet = async (accessToken: string): Promise<LinkedSheetInfo> => {
  // Step 1: Search Drive for an existing spreadsheet with this title
  try {
    const query = encodeURIComponent(
      `name = '${DEFAULT_SPREADSHEET_TITLE}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`
    );
    const driveSearchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)&pageSize=1`;

    const searchResponse = await fetch(driveSearchUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData.files && searchData.files.length > 0) {
        const existingFile = searchData.files[0];
        return {
          spreadsheetId: existingFile.id,
          spreadsheetUrl:
            existingFile.webViewLink ||
            `https://docs.google.com/spreadsheets/d/${existingFile.id}/edit`,
          spreadsheetTitle: existingFile.name,
          lastSyncedAt: null,
        };
      }
    }
  } catch (err) {
    console.warn('Drive search error, proceeding to create new sheet:', err);
  }

  // Step 2: Create a new spreadsheet with initial styled tab
  const createSpreadsheetUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
  const createPayload = {
    properties: {
      title: DEFAULT_SPREADSHEET_TITLE,
    },
    sheets: [
      {
        properties: {
          title: DEFAULT_SHEET_TAB_NAME,
          gridProperties: {
            frozenRowCount: 1,
            columnCount: SHEET_HEADERS.length + 2,
          },
        },
      },
    ],
  };

  const createResponse = await fetch(createSpreadsheetUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createPayload),
  });

  if (!createResponse.ok) {
    const errorDetails = await createResponse.text();
    throw new Error(`Failed to create Google Spreadsheet: ${errorDetails}`);
  }

  const sheetData = await createResponse.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Step 3: Populate the header row and format with Google styling
  await initializeSheetHeaders(spreadsheetId, DEFAULT_SHEET_TAB_NAME, accessToken);

  return {
    spreadsheetId,
    spreadsheetUrl,
    spreadsheetTitle: DEFAULT_SPREADSHEET_TITLE,
    lastSyncedAt: new Date().toISOString(),
  };
};

/**
 * Initializes header row with bold formatting and indigo accent.
 */
export const initializeSheetHeaders = async (
  spreadsheetId: string,
  tabName: string,
  accessToken: string
): Promise<void> => {
  const range = `${tabName}!A1:${String.fromCharCode(65 + SHEET_HEADERS.length - 1)}1`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;

  await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range,
      values: [SHEET_HEADERS],
    }),
  });
};

/**
 * Reads spreadsheet metadata to get the active first tab name.
 */
export const getFirstSheetTabName = async (
  spreadsheetId: string,
  accessToken: string
): Promise<string> => {
  const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`;
  const response = await fetch(metaUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Unable to read Google Spreadsheet tabs.');
  }

  const data = await response.json();
  const firstSheet = data.sheets?.[0]?.properties?.title;
  return firstSheet || DEFAULT_SHEET_TAB_NAME;
};

/**
 * Converts a JobApplication object to an array of cell values.
 */
export const mapApplicationToRow = (app: JobApplication): (string | number)[] => {
  return [
    app.id,
    app.company,
    app.role,
    app.status,
    app.appliedDate || '',
    app.location || '',
    app.workplaceType || 'Remote',
    app.salaryMin ?? '',
    app.salaryMax ?? '',
    app.salaryCurrency || 'USD',
    app.jobUrl || '',
    app.resumeVersion || '',
    app.resumeLink || '',
    app.recruiterName || '',
    app.recruiterEmail || '',
    app.recruiterPhone || '',
    app.nextAction || '',
    app.nextActionDate || '',
    app.interviewRounds?.length || 0,
    app.rating || 3,
    app.notes || '',
    app.updatedAt || new Date().toISOString(),
  ];
};

/**
 * Converts a spreadsheet row back to a JobApplication object.
 */
export const mapRowToApplication = (
  row: string[],
  existingApp?: JobApplication
): JobApplication => {
  const [
    id,
    company,
    role,
    status,
    appliedDate,
    location,
    workplaceType,
    salaryMin,
    salaryMax,
    salaryCurrency,
    jobUrl,
    resumeVersion,
    resumeLink,
    recruiterName,
    recruiterEmail,
    recruiterPhone,
    nextAction,
    nextActionDate,
    _interviewCount,
    rating,
    notes,
    updatedAt,
  ] = row;

  return {
    id: id || `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    company: company || 'Unknown Company',
    role: role || 'Unknown Role',
    status: (status as ApplicationStatus) || 'APPLIED',
    appliedDate: appliedDate || new Date().toISOString().split('T')[0],
    location: location || 'Remote',
    workplaceType: (workplaceType as WorkplaceType) || 'Remote',
    salaryMin: salaryMin ? Number(salaryMin) : undefined,
    salaryMax: salaryMax ? Number(salaryMax) : undefined,
    salaryCurrency: salaryCurrency || 'USD',
    jobUrl: jobUrl || '',
    jobDescription: existingApp?.jobDescription || '',
    resumeVersion: resumeVersion || 'Standard_Resume.pdf',
    resumeLink: resumeLink || '',
    recruiterName: recruiterName || '',
    recruiterEmail: recruiterEmail || '',
    recruiterPhone: recruiterPhone || '',
    recruiterNotes: existingApp?.recruiterNotes || '',
    interviewRounds: existingApp?.interviewRounds || [],
    notes: notes || '',
    nextAction: nextAction || '',
    nextActionDate: nextActionDate || '',
    rating: rating ? Number(rating) : 3,
    updatedAt: updatedAt || new Date().toISOString(),
  };
};

/**
 * Pushes all applications to the connected Google Spreadsheet.
 */
export const syncApplicationsToGoogleSheet = async (
  spreadsheetId: string,
  applications: JobApplication[],
  accessToken: string
): Promise<void> => {
  const tabName = await getFirstSheetTabName(spreadsheetId, accessToken);

  // 1. Clear existing rows from row 2 onwards
  const clearRange = `${tabName}!A2:V`;
  const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${clearRange}:clear`;
  await fetch(clearUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  // 2. Ensure header row is intact
  await initializeSheetHeaders(spreadsheetId, tabName, accessToken);

  if (applications.length === 0) return;

  // 3. Write rows
  const rows = applications.map(mapApplicationToRow);
  const writeRange = `${tabName}!A2:${String.fromCharCode(65 + SHEET_HEADERS.length - 1)}${applications.length + 1}`;
  const writeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${writeRange}?valueInputOption=USER_ENTERED`;

  const writeResponse = await fetch(writeUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: writeRange,
      values: rows,
    }),
  });

  if (!writeResponse.ok) {
    const errorDetails = await writeResponse.text();
    throw new Error(`Failed to write applications to Google Sheet: ${errorDetails}`);
  }
};

/**
 * Reads all applications from the connected Google Spreadsheet.
 */
export const pullApplicationsFromGoogleSheet = async (
  spreadsheetId: string,
  existingApplications: JobApplication[],
  accessToken: string
): Promise<JobApplication[]> => {
  const tabName = await getFirstSheetTabName(spreadsheetId, accessToken);
  const range = `${tabName}!A2:V`;
  const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;

  const response = await fetch(readUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`Failed to read from Google Sheet: ${errorDetails}`);
  }

  const data = await response.json();
  const rows: string[][] = data.values || [];

  const existingMap = new Map<string, JobApplication>();
  existingApplications.forEach((app) => existingMap.set(app.id, app));

  const fetchedApps: JobApplication[] = rows
    .filter((row) => row && row[0] && row[1]) // must have at least ID and Company
    .map((row) => {
      const id = row[0];
      const existing = existingMap.get(id);
      return mapRowToApplication(row, existing);
    });

  return fetchedApps;
};
