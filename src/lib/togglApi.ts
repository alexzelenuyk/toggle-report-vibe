import axios from 'axios';
import Papa from 'papaparse';
import { ReportParams, TimeEntryReport } from './types';

export async function generateReport(params: ReportParams): Promise<TimeEntryReport[]> {
  try {
    // Create basic auth token
    const authToken = Buffer.from(`${params.apiToken}:api_token`).toString('base64');
    
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
    
    // Parse CSV data
    const parsedData = Papa.parse(response.data, { header: true });
    
    if (!parsedData.data || parsedData.data.length === 0) {
      throw new Error('No time entries found for the specified period.');
    }
    
    // Process and transform the data
    const entriesByDay: Record<string, any[]> = {};
    
    parsedData.data.forEach((entry: any) => {
      if (!entry['Start date'] || !entry['Start time']) return;
      
      const startDate = entry['Start date'];
      
      if (!entriesByDay[startDate]) {
        entriesByDay[startDate] = [];
      }
      
      entriesByDay[startDate].push(entry);
    });
    
    // Create the summary report data
    const reportEntries: TimeEntryReport[] = [];
    
    Object.entries(entriesByDay).forEach(([date, entries]) => {
      // Sort entries by start time
      entries.sort((a, b) => a['Start time'].localeCompare(b['Start time']));
      
      // Get earliest start time and latest end time for the day
      const startTime = entries.reduce((earliest, entry) => {
        return entry['Start time'] < earliest ? entry['Start time'] : earliest;
      }, '23:59:59');
      
      const endTime = entries.reduce((latest, entry) => {
        return entry['End time'] > latest ? entry['End time'] : latest;
      }, '00:00:00');
      
      // Calculate pause duration (time not tracked between entries)
      let pauseDurationSeconds = 0;
      
      if (entries.length > 1) {
        for (let i = 0; i < entries.length - 1; i++) {
          const currentEntryEnd = entries[i]['End time'];
          const nextEntryStart = entries[i + 1]['Start time'];
          
          // Convert times to seconds for calculation (handling HH:MM:SS or HH:MM formats)
          const currentTimeParts = currentEntryEnd.split(':').map(Number);
          const nextTimeParts = nextEntryStart.split(':').map(Number);
          
          // Handle HH:MM:SS or HH:MM formats
          const currentHours = currentTimeParts[0] || 0;
          const currentMinutes = currentTimeParts[1] || 0;
          const currentSeconds = currentTimeParts[2] || 0;
          
          const nextHours = nextTimeParts[0] || 0;
          const nextMinutes = nextTimeParts[1] || 0;
          const nextSeconds = nextTimeParts[2] || 0;
          
          const currentTotalSeconds = (currentHours * 3600) + (currentMinutes * 60) + currentSeconds;
          const nextTotalSeconds = (nextHours * 3600) + (nextMinutes * 60) + nextSeconds;
          
          // Calculate difference in seconds
          const pauseSeconds = nextTotalSeconds - currentTotalSeconds;
          
          // Only add positive pauses (overlapping entries would give negative values)
          if (pauseSeconds > 0) {
            pauseDurationSeconds += pauseSeconds;
          }
        }
      }
      
      // Convert seconds to minutes, round up to nearest minute
      const pauseDurationMinutes = Math.ceil(pauseDurationSeconds / 60);
      
      // Convert minutes to relative value (where 1.0 = 60 minutes)
      const pauseDurationRelative = pauseDurationMinutes / 60;
      
      // Calculate total hours (end time - start time - pause duration)
      // Convert time strings to total hours
      const startTimeParts = startTime.split(':').map(Number);
      const endTimeParts = endTime.split(':').map(Number);
      
      const startHour = startTimeParts[0] + (startTimeParts[1] || 0) / 60 + (startTimeParts[2] || 0) / 3600;
      const endHour = endTimeParts[0] + (endTimeParts[1] || 0) / 60 + (endTimeParts[2] || 0) / 3600;
      
      // Handle cases where end time is on the next day (past midnight)
      let hourDiff = endHour >= startHour ? endHour - startHour : (24 - startHour) + endHour;
      
      // Subtract pause duration
      const totalHours = hourDiff - pauseDurationRelative;
      
      // Group descriptions by day (unique descriptions only)
      const descriptionSet = new Set<string>();
      entries.forEach(entry => {
        if (entry['Description']) {
          descriptionSet.add(entry['Description']);
        }
      });
      const descriptions = Array.from(descriptionSet);
      
      // Format job ID (use provided job ID or extract from descriptions)
      const jobId = params.jobId || extractJobId(descriptions.join(' ')) || '';
      
      // Round times to minutes (removing seconds)
      const formatTimeToMinutes = (timeStr: string) => {
        const parts = timeStr.split(':');
        return `${parts[0]}:${parts[1]}`;
      };

      reportEntries.push({
        startDate: date,
        startTime: formatTimeToMinutes(startTime),
        endTime: formatTimeToMinutes(endTime),
        jobId: jobId,
        pauseDuration: pauseDurationRelative.toFixed(2),
        totalHours: totalHours.toFixed(2),
        description: descriptions.join('; ')
      });
    });
    
    return reportEntries.sort((a, b) => a.startDate.localeCompare(b.startDate));
    
  } catch (error) {
    console.error('Error generating report:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Toggl API error: ${error.response.status} ${error.response.statusText}`);
    }
    throw error;
  }
}

// Helper function to extract job ID from description using regex
function extractJobId(description: string): string | null {
  const jobIdMatch = description.match(/(?:\b|\D)(\d{6}-\d{3})(?:\b|\D)/);
  return jobIdMatch ? jobIdMatch[1] : null;
}
