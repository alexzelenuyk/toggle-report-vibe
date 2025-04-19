export interface TogglTimeEntry {
  id: number;
  description: string;
  start: string;
  end: string;
  dur: number;
  tags?: string[];
  project_id?: number;
  task_id?: number;
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
