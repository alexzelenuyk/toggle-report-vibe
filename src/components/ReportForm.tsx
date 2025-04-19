"use client";

import { useState } from 'react';
import { TextField, Button, Stack, Box, Alert, CircularProgress } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import { generateReport } from '@/lib/togglApi';
import ReportTable from '@/components/ReportTable';
import { TimeEntryReport } from '@/lib/types';

// Configure dayjs to start week on Monday
dayjs.extend(updateLocale);
dayjs.updateLocale('en', {
  weekStart: 1 // Monday
});

export default function ReportForm() {
  const [workspaceId, setWorkspaceId] = useState('');
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(7, 'day'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [apiToken, setApiToken] = useState('');
  const [jobId, setJobId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState<TimeEntryReport[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous results immediately
    setLoading(true);
    setError('');
    setReportData(null);

    try {
      if (!startDate || !endDate || !workspaceId || !apiToken) {
        throw new Error('All fields are required');
      }

      const data = await generateReport({
        workspaceId,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        apiToken,
        jobId
      });
      
      // Only set new data if we received results
      if (data && data.length > 0) {
        setReportData(data);
      } else {
        throw new Error('No time entries found for the specified period');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            label="Workspace ID"
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            required
            fullWidth
          />
          
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack direction="row" spacing={2}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Stack>
          </LocalizationProvider>
          
          <TextField
            label="API Token"
            type="password"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            required
            fullWidth
            helperText="Found in your Toggl profile settings"
          />
          
          <TextField
            label="Job ID (optional)"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            fullWidth
          />
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={loading}
            sx={{ py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate Report'}
          </Button>
        </Stack>
      </form>
      
      {error && (
        <Box mt={3}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      
      {reportData && reportData.length > 0 && (
        <Box mt={4}>
          <ReportTable data={reportData} />
        </Box>
      )}
    </>
  );
}
