import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReportTable from '../ReportTable';
import { TimeEntryReport } from '@/lib/types';
import { saveAs } from 'file-saver';

// Mock dependencies
jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

// Mock clipboard API - Jest setup file also mocks this but we need it here for TypeScript
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
  writable: true,
});

describe('ReportTable', () => {
  const mockData: TimeEntryReport[] = [
    {
      startDate: '2025-04-01',
      startTime: '09:00',
      endTime: '17:00',
      jobId: '123456-789',
      pauseDuration: '1.0',
      totalHours: '7.0',
      description: 'Test task'
    },
    {
      startDate: '2025-04-02',
      startTime: '10:00',
      endTime: '18:00',
      jobId: '123456-789',
      pauseDuration: '0.5',
      totalHours: '7.5',
      description: 'Another task'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders table with provided data', () => {
    render(<ReportTable data={mockData} />);
    
    // Check table headers
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Start Time')).toBeInTheDocument();
    expect(screen.getByText('End Time')).toBeInTheDocument();
    expect(screen.getByText('Job ID')).toBeInTheDocument();
    expect(screen.getByText('Pause Duration (hours)')).toBeInTheDocument();
    expect(screen.getByText('Total Hours')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    
    // Check data rows
    expect(screen.getByText('2025-04-01')).toBeInTheDocument();
    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('17:00')).toBeInTheDocument();
    expect(screen.getAllByText('123456-789')[0]).toBeInTheDocument();
    expect(screen.getByText('1.0')).toBeInTheDocument();
    expect(screen.getByText('7.0')).toBeInTheDocument();
    expect(screen.getByText('Test task')).toBeInTheDocument();
    
    expect(screen.getByText('2025-04-02')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByText('18:00')).toBeInTheDocument();
    expect(screen.getByText('0.5')).toBeInTheDocument();
    expect(screen.getByText('7.5')).toBeInTheDocument();
    expect(screen.getByText('Another task')).toBeInTheDocument();
  });

  test('renders action buttons', () => {
    render(<ReportTable data={mockData} />);
    
    expect(screen.getByRole('button', { name: /copy csv to clipboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download csv/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export to excel/i })).toBeInTheDocument();
  });

  test('copies CSV to clipboard when button is clicked', async () => {
    render(<ReportTable data={mockData} />);
    
    const copyButton = screen.getByRole('button', { name: /copy csv to clipboard/i });
    
    await act(async () => {
      fireEvent.click(copyButton);
    });
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('start_date,start_time,end_time,job_id,pause_duration,total_hours,description'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('2025-04-01,09:00,17:00,123456-789,1.0,7.0,Test task'));
    
    // Check that success message appears
    await waitFor(() => {
      expect(screen.getByText('CSV copied to clipboard!')).toBeInTheDocument();
    });
  });

  test('exports to Excel when button is clicked', async () => {
    // Setup the DOM elements needed for the URL.createObjectURL
    global.URL.createObjectURL = jest.fn().mockReturnValue('mock-url');
    
    render(<ReportTable data={mockData} />);
    
    const exportButton = screen.getByRole('button', { name: /export to excel/i });
    
    await act(async () => {
      fireEvent.click(exportButton);
    });
    
    // Wait for promises to resolve
    await waitFor(() => {
      expect(saveAs).toHaveBeenCalled();
    });
  });
});