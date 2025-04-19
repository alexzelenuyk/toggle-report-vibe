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
import ExcelJS from 'exceljs';
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
  
  const downloadExcel = async () => {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');
    
    // Add column headers
    worksheet.columns = [
      { header: 'Date', key: 'date' },
      { header: 'StartTime', key: 'startTime' },
      { header: 'EndTime', key: 'endTime' },
      { header: 'JobCode', key: 'jobCode' },
      { header: 'Break', key: 'break' },
      { header: 'TotalHours', key: 'totalHours' },
      { header: 'Description', key: 'description' }
    ];
    
    // Add rows
    data.forEach(row => {
      worksheet.addRow({
        date: row.startDate,
        startTime: row.startTime,
        endTime: row.endTime,
        jobCode: row.jobId || '',
        break: row.pauseDuration,
        totalHours: row.totalHours,
        description: row.description
      });
    });
    
    // Apply styles to header row
    worksheet.getRow(1).font = { bold: true };
    
    // Auto-fit columns
    worksheet.columns.forEach(column => {
      if (column) {
        let maxLength = 0;
        if (column.eachCell) {
          column.eachCell({ includeEmpty: true }, cell => {
            const columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > maxLength) {
              maxLength = columnLength;
            }
          });
          column.width = maxLength < 10 ? 10 : maxLength + 2;
        }
      }
    });
    
    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
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
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          mb: 2, 
          gap: 2 
        }}
      >
        <Typography variant="h6">Report Results</Typography>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={1} 
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          <Button 
            variant="outlined" 
            onClick={copyToClipboard}
            fullWidth
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
          >
            Copy CSV
          </Button>
          <Button 
            variant="outlined" 
            onClick={downloadCsv}
            fullWidth
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
          >
            Download CSV
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => downloadExcel().catch(err => console.error('Excel export error:', err))}
            fullWidth
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
          >
            Export to Excel
          </Button>
        </Stack>
      </Box>
      
      <TableContainer component={Paper} sx={{ overflow: 'auto' }}>
        <Table sx={{ minWidth: { xs: 300, sm: 650 } }}>
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
