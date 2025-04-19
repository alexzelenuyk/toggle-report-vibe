export interface RawTogglTimeEntry {
  'Start date': string;
  'Start time': string;
  'End time': string;
  'Duration': string;
  'Description': string;
  'Project'?: string;
  'Task'?: string;
  'Client'?: string;
  'Tags'?: string;
}

export interface TimeEntryReport {
  startDate: string;
  startTime: string;
  endTime: string;
  jobId: string;
  pauseDuration: string;
  totalHours: string;
  description: string;
}

export interface ReportParams {
  workspaceId: string;
  startDate: string;
  endDate: string;
  apiToken: string;
  jobId?: string;
}
