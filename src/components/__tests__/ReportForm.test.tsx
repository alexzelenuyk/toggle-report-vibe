import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReportForm from '../ReportForm';
import { generateReport } from '@/lib/togglApi';

// Mock the togglApi module
jest.mock('@/lib/togglApi', () => ({
  generateReport: jest.fn(),
}));

describe('ReportForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form elements correctly', () => {
    render(<ReportForm />);
    
    // Check for main form elements
    expect(screen.getByLabelText(/workspace id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/api token/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job id/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate report/i })).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    render(<ReportForm />);
    
    // Try to submit the form without filling required fields
    const submitButton = screen.getByRole('button', { name: /generate report/i });
    fireEvent.click(submitButton);
    
    // Mock implementation should not be called with empty fields
    await waitFor(() => {
      expect(generateReport).not.toHaveBeenCalled();
    });
  });

  test('submits form with valid data', async () => {
    const mockReportData = [
      {
        startDate: '2025-04-01',
        startTime: '09:00',
        endTime: '17:00',
        jobId: '123456-789',
        pauseDuration: '1.0',
        totalHours: '7.0',
        description: 'Test task'
      }
    ];
    
    (generateReport as jest.Mock).mockResolvedValue(mockReportData);
    
    render(<ReportForm />);
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText(/workspace id/i), '12345');
    await userEvent.type(screen.getByLabelText(/api token/i), 'test-token');
    await userEvent.type(screen.getByLabelText(/job id/i), '123456-789');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /generate report/i });
    fireEvent.click(submitButton);
    
    // Verify generateReport was called with correct data
    await waitFor(() => {
      expect(generateReport).toHaveBeenCalledWith(expect.objectContaining({
        workspaceId: '12345',
        apiToken: 'test-token',
        jobId: '123456-789',
      }));
    });
  });

  test('displays error message and grumpy cat image on API failure', async () => {
    (generateReport as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    render(<ReportForm />);
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText(/workspace id/i), '12345');
    await userEvent.type(screen.getByLabelText(/api token/i), 'test-token');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /generate report/i });
    fireEvent.click(submitButton);
    
    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
      expect(screen.getByText('Report Generation Failed')).toBeInTheDocument();
      expect(screen.getByTestId('grumpy-cat-image')).toBeInTheDocument();
      expect(screen.getByAltText(/grumpy cat is not impressed/i)).toBeInTheDocument();
    });
  });
  
  test('displays friendly error message with formatting and grumpy cat', async () => {
    const friendlyError = new Error('🔍 This is a friendly error message.\nIt has multiple lines and an emoji!');
    (generateReport as jest.Mock).mockRejectedValue(friendlyError);
    
    render(<ReportForm />);
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText(/workspace id/i), '12345');
    await userEvent.type(screen.getByLabelText(/api token/i), 'test-token');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /generate report/i });
    fireEvent.click(submitButton);
    
    // Check that error message is displayed with formatting
    await waitFor(() => {
      const errorMessage = screen.getByText(/This is a friendly error message/);
      expect(errorMessage).toBeInTheDocument();
      expect(screen.getByText('Report Generation Failed')).toBeInTheDocument();
      
      // The parent Alert should be of the error severity
      const alertElement = errorMessage.closest('.MuiAlert-root');
      expect(alertElement).toHaveClass('MuiAlert-filledError');
      
      // Check for grumpy cat image
      expect(screen.getByTestId('grumpy-cat-image')).toBeInTheDocument();
    });
  });
});