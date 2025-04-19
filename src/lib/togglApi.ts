import axios from 'axios';
import Papa from 'papaparse';
import { ReportParams, TimeEntryReport, RawTogglTimeEntry } from './types';
import { getFriendlyErrorMessage } from './utils/errorMessages';

// Main report generation function
export async function generateReport(params: ReportParams): Promise<TimeEntryReport[]> {
  try {
    // Fetch data from Toggl API
    const csvData = await fetchTogglData(params);
    
    // Parse and process the CSV data
    const parsedEntries = parseTimeEntries(csvData);
    
    // Group entries by day
    const entriesByDay = groupEntriesByDay(parsedEntries);
    
    // Generate report entries for each day
    const reportEntries = generateDailyReports(entriesByDay, params);
    
    // Sort report entries by date
    return reportEntries.sort((a, b) => a.startDate.localeCompare(b.startDate));
    
  } catch (error) {
    // Safely log error without sensitive data
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error generating report:', { 
        status: error.response.status,
        statusText: error.response.statusText,
        message: error.message
      });
    } else {
      console.error('Error generating report:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    // Generate a user-friendly error message with some humor
    const friendlyMessage = getFriendlyErrorMessage(error);
    throw new Error(friendlyMessage);
  }
}

// Fetch time entries from Toggl API
async function fetchTogglData(params: ReportParams): Promise<string> {
  // Create basic auth token (not logging sensitive data)
  const authToken = Buffer.from(`${params.apiToken}:api_token`).toString('base64');
  
  // Remove API token from params for logging safety
  const safeParams = { 
    ...params,
    apiToken: '[REDACTED]' 
  };
  
  // Log safe data
  console.log('Generating report with params:', {
    workspace: safeParams.workspaceId,
    dates: `${safeParams.startDate} to ${safeParams.endDate}`,
    hasJobId: !!safeParams.jobId
  });
  
  // Make request to Toggl API
  const response = await axios.post(
    `/api/toggl/reports/api/v3/workspace/${params.workspaceId}/search/time_entries.csv`,
    {
      start_date: params.startDate,
      end_date: params.endDate,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authToken}`,
      },
      responseType: 'text',
    }
  );
  
  return response.data;
}

// Parse CSV data into time entries
function parseTimeEntries(csvData: string): RawTogglTimeEntry[] {
  const parsedData = Papa.parse<RawTogglTimeEntry>(csvData, { header: true });
  
  if (!parsedData.data || parsedData.data.length === 0) {
    throw new Error('No time entries found for the specified period.');
  }
  
  return parsedData.data;
}

// Group time entries by day
function groupEntriesByDay(entries: RawTogglTimeEntry[]): Record<string, RawTogglTimeEntry[]> {
  const entriesByDay: Record<string, RawTogglTimeEntry[]> = {};
  
  entries.forEach((entry) => {
    if (!entry['Start date'] || !entry['Start time']) return;
    
    const startDate = entry['Start date'];
    
    if (!entriesByDay[startDate]) {
      entriesByDay[startDate] = [];
    }
    
    entriesByDay[startDate].push(entry);
  });
  
  return entriesByDay;
}

// Generate report entries for each day
function generateDailyReports(entriesByDay: Record<string, RawTogglTimeEntry[]>, params: ReportParams): TimeEntryReport[] {
  const reportEntries: TimeEntryReport[] = [];
  
  Object.entries(entriesByDay).forEach(([date, entries]) => {
    // Sort entries by start time
    entries.sort((a, b) => a['Start time'].localeCompare(b['Start time']));
    
    // Get earliest start time and latest end time for the day
    const startTime = findEarliestTime(entries);
    const endTime = findLatestTime(entries);
    
    // Calculate pause duration
    const pauseDurationRelative = calculatePauseDuration(entries);
    
    // Calculate total hours
    const totalHours = calculateTotalHours(startTime, endTime, pauseDurationRelative);
    
    // Get unique descriptions
    const descriptions = getUniqueDescriptions(entries);
    
    // Determine job ID
    const jobId = params.jobId || extractJobId(descriptions.join(' ')) || '';
    
    // Format times to minutes only (removing seconds)
    const formattedStartTime = formatTimeToMinutes(startTime);
    const formattedEndTime = formatTimeToMinutes(endTime);
    
    // Create the report entry
    reportEntries.push({
      startDate: date,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      jobId: jobId,
      pauseDuration: pauseDurationRelative.toFixed(2),
      totalHours: totalHours.toFixed(2),
      description: descriptions.join('; ')
    });
  });
  
  return reportEntries;
}

// Find the earliest start time from entries
export function findEarliestTime(entries: RawTogglTimeEntry[]): string {
  return entries.reduce((earliest, entry) => {
    return entry['Start time'] < earliest ? entry['Start time'] : earliest;
  }, '23:59:59');
}

// Find the latest end time from entries
export function findLatestTime(entries: RawTogglTimeEntry[]): string {
  return entries.reduce((latest, entry) => {
    return entry['End time'] > latest ? entry['End time'] : latest;
  }, '00:00:00');
}

// Calculate pause duration between time entries
export function calculatePauseDuration(entries: RawTogglTimeEntry[]): number {
  let pauseDurationSeconds = 0;
  
  if (entries.length > 1) {
    for (let i = 0; i < entries.length - 1; i++) {
      const currentEntryEnd = entries[i]['End time'];
      const nextEntryStart = entries[i + 1]['Start time'];
      
      // Calculate pause between current entry end and next entry start
      const pauseSeconds = calculateTimeDifferenceInSeconds(currentEntryEnd, nextEntryStart);
      
      // Only add positive pauses (overlapping entries would give negative values)
      if (pauseSeconds > 0) {
        pauseDurationSeconds += pauseSeconds;
      }
    }
  }
  
  // Convert seconds to minutes, round up to nearest minute
  const pauseDurationMinutes = Math.ceil(pauseDurationSeconds / 60);
  
  // Convert minutes to relative value (where 1.0 = 60 minutes)
  return pauseDurationMinutes / 60;
}

// Calculate difference between two time strings in seconds
export function calculateTimeDifferenceInSeconds(time1: string, time2: string): number {
  const time1Parts = time1.split(':').map(Number);
  const time2Parts = time2.split(':').map(Number);
  
  // Handle HH:MM:SS or HH:MM formats
  const time1Hours = time1Parts[0] || 0;
  const time1Minutes = time1Parts[1] || 0;
  const time1Seconds = time1Parts[2] || 0;
  
  const time2Hours = time2Parts[0] || 0;
  const time2Minutes = time2Parts[1] || 0;
  const time2Seconds = time2Parts[2] || 0;
  
  const time1TotalSeconds = (time1Hours * 3600) + (time1Minutes * 60) + time1Seconds;
  const time2TotalSeconds = (time2Hours * 3600) + (time2Minutes * 60) + time2Seconds;
  
  return time2TotalSeconds - time1TotalSeconds;
}

// Convert time string to hours as a decimal
export function timeStringToHours(timeStr: string): number {
  const parts = timeStr.split(':').map(Number);
  return parts[0] + (parts[1] || 0) / 60 + (parts[2] || 0) / 3600;
}

// Calculate total hours for the day
export function calculateTotalHours(startTime: string, endTime: string, pauseDurationHours: number): number {
  const startHour = timeStringToHours(startTime);
  const endHour = timeStringToHours(endTime);
  
  // Handle cases where end time is on the next day (past midnight)
  let hourDiff = endHour >= startHour ? endHour - startHour : (24 - startHour) + endHour;
  
  // Subtract pause duration
  return hourDiff - pauseDurationHours;
}

// Get unique descriptions from entries
export function getUniqueDescriptions(entries: RawTogglTimeEntry[]): string[] {
  const descriptionSet = new Set<string>();
  entries.forEach(entry => {
    if (entry['Description']) {
      descriptionSet.add(entry['Description']);
    }
  });
  return Array.from(descriptionSet);
}

// Format time string to HH:MM (removing seconds)
export function formatTimeToMinutes(timeStr: string): string {
  const parts = timeStr.split(':');
  return `${parts[0]}:${parts[1]}`;
}

// Handle API errors safely (without logging sensitive data)
export function handleApiError(error: any): never {
  // Safely log error without sensitive data
  console.error('Error generating report:', axios.isAxiosError(error) 
    ? { 
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message
      }
    : 'Unknown error');
  
  if (axios.isAxiosError(error) && error.response) {
    throw new Error(`Toggl API error: ${error.response.status} ${error.response.statusText}`);
  }
  throw new Error('Failed to generate report. Please check your credentials and try again.');
}

// Helper function to extract job ID from description using regex
export function extractJobId(description: string): string | null {
  const jobIdMatch = description.match(/(?:\b|\D)(\d{6}-\d{3})(?:\b|\D)/);
  return jobIdMatch ? jobIdMatch[1] : null;
}