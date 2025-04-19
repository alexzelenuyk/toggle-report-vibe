"use client";

import { useState } from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Typography,
  Button,
  Box,
  Snackbar,
  Alert,
  Stack
} from '@mui/material';
import { TimeEntryReport } from '@/lib/types';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ReportTableProps {
  data: TimeEntryReport[];
}

export default function ReportTable({ data }: ReportTableProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  
  const generateCsvContent = () => {
    const headers = ['start_date', 'start_time', 'end_time', 'job_id', 'pause_duration', 'total_hours', 'description'];
    
    const csvRows = [
      headers.join(','),
      ...data.map(row => [
        row.startDate,
        row.startTime,
        row.endTime,
        row.jobId || '',
        row.pauseDuration,
        row.totalHours,
        row.description
      ].join(','))
    ];
    
    return csvRows.join('\n');
  };
  
  const downloadCsv = () => {
    const csvContent = generateCsvContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `toggl-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const downloadExcel = () => {
    // Create worksheet data with the requested column names
    const excelData = data.map(row => ({
      'Date': row.startDate,
      'StartTime': row.startTime,
      'EndTime': row.endTime,
      'JobCode': row.jobId || '',
      'Break': row.pauseDuration,
      'TotalHours': row.totalHours,
      'Description': row.description
    }));
    
    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Save file
    saveAs(blob, `toggl-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  };
  
  const copyToClipboard = async () => {
    try {
      const csvContent = generateCsvContent();
      await navigator.clipboard.writeText(csvContent);
      setCopySuccess(true);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };
  
  const handleCloseSnackbar = () => {
    setCopySuccess(false);
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Report Results</Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={copyToClipboard}>
            Copy CSV to Clipboard
          </Button>
          <Button variant="outlined" onClick={downloadCsv}>
            Download CSV
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={downloadExcel}
          >
            Export to Excel
          </Button>
        </Stack>
      </Box>
      
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Job ID</TableCell>
              <TableCell>Pause Duration (hours)</TableCell>
              <TableCell>Total Hours</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.startDate}</TableCell>
                <TableCell>{row.startTime}</TableCell>
                <TableCell>{row.endTime}</TableCell>
                <TableCell>{row.jobId || '-'}</TableCell>
                <TableCell>{row.pauseDuration}</TableCell>
                <TableCell>{row.totalHours}</TableCell>
                <TableCell>{row.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          CSV copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
}
