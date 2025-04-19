import axios from 'axios';
import { generateReport } from '../togglApi';
import { ReportParams } from '../types';
import Papa from 'papaparse';

// Mock axios and papaparse
jest.mock('axios');
jest.mock('papaparse');

describe('togglApi', () => {
  // Sample test data
  const mockParams: ReportParams = {
    workspaceId: '123456',
    startDate: '2023-01-01',
    endDate: '2023-01-05',
    apiToken: 'test-token',
    jobId: '123456-789'
  };

  const mockCsvData = `Start date,Start time,End time,Duration,Description,Project,Task,Client,Tags
2023-01-01,09:00:00,12:30:00,3.5,Meeting with team,Project A,Task 1,Client X,
2023-01-01,13:30:00,17:00:00,3.5,Development work,Project A,Task 2,Client X,
2023-01-02,09:00:00,17:00:00,8,API Integration,Project B,Task 3,Client Y,`;

  // Mock parsed data that will be returned by Papa.parse
  const mockParsedData = {
    data: [
      {
        'Start date': '2023-01-01',
        'Start time': '09:00:00',
        'End time': '12:30:00',
        'Duration': '3.5',
        'Description': 'Meeting with team',
        'Project': 'Project A',
        'Task': 'Task 1',
        'Client': 'Client X'
      },
      {
        'Start date': '2023-01-01',
        'Start time': '13:30:00',
        'End time': '17:00:00',
        'Duration': '3.5',
        'Description': 'Development work',
        'Project': 'Project A',
        'Task': 'Task 2',
        'Client': 'Client X'
      },
      {
        'Start date': '2023-01-02',
        'Start time': '09:00:00',
        'End time': '17:00:00',
        'Duration': '8',
        'Description': 'API Integration',
        'Project': 'Project B',
        'Task': 'Task 3',
        'Client': 'Client Y'
      }
    ],
    errors: [],
    meta: { aborted: false, delimiter: ',', linebreak: '\n', truncated: false }
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    (axios.post as jest.Mock).mockResolvedValue({ data: mockCsvData });
    (Papa.parse as jest.Mock).mockReturnValue(mockParsedData);
    
    // Spy on console methods
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateReport', () => {
    it('should fetch and process time entries from Toggl API', async () => {
      // Call the function
      const result = await generateReport(mockParams);
      
      // Check that the API was called with correct parameters
      expect(axios.post).toHaveBeenCalledWith(
        `/api/toggl/reports/api/v3/workspace/${mockParams.workspaceId}/search/time_entries.csv`,
        {
          start_date: mockParams.startDate,
          end_date: mockParams.endDate,
        },
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Basic '),
          },
          responseType: 'text',
        })
      );
      
      // Check that Papa.parse was called with the CSV data
      expect(Papa.parse).toHaveBeenCalledWith(mockCsvData, { header: true });
      
      // Check the result formatting
      expect(result).toHaveLength(2); // 2 days in the data
      expect(result[0]).toHaveProperty('startDate', '2023-01-01');
      expect(result[0]).toHaveProperty('jobId', mockParams.jobId);
      expect(result[0]).toHaveProperty('description', expect.stringContaining('Meeting with team'));
    });

    it('should handle API errors gracefully', async () => {
      // Setup mock for API error to be recognizable as an Axios error
      const errorResponse = new Error('API Error');
      Object.defineProperty(errorResponse, 'isAxiosError', { value: true });
      Object.defineProperty(errorResponse, 'response', { 
        value: { status: 401, statusText: 'Unauthorized' } 
      });
      
      // Make sure axios.isAxiosError returns true for our mock
      jest.spyOn(axios, 'isAxiosError').mockImplementation(() => true);
      
      (axios.post as jest.Mock).mockRejectedValue(errorResponse);
      
      // Call the function and check it throws the expected error
      await expect(generateReport(mockParams)).rejects.toThrow('Toggl API error: 401 Unauthorized');
      
      // Check error was logged
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle empty data', async () => {
      // Mock empty data
      (Papa.parse as jest.Mock).mockReturnValue({ data: [] });
      
      // Call the function and check it throws the expected error
      await expect(generateReport(mockParams)).rejects.toThrow('No time entries found for the specified period.');
    });

    it('should calculate pause duration correctly', async () => {
      // Create mock data with a 1-hour pause between entries
      const pauseTestData = {
        data: [
          {
            'Start date': '2023-01-01',
            'Start time': '09:00:00',
            'End time': '12:00:00',
            'Duration': '3',
            'Description': 'Morning work'
          },
          {
            'Start date': '2023-01-01',
            'Start time': '13:00:00',
            'End time': '17:00:00',
            'Duration': '4',
            'Description': 'Afternoon work'
          }
        ]
      };
      
      (Papa.parse as jest.Mock).mockReturnValue(pauseTestData);
      
      // Call the function
      const result = await generateReport(mockParams);
      
      // Check pause duration (should be 1 hour = 1.00)
      expect(result[0].pauseDuration).toBe('1.00');
    });

    it('should extract job ID from description if not provided', async () => {
      // Create mock data with job ID in description
      const jobIdTestData = {
        data: [
          {
            'Start date': '2023-01-01',
            'Start time': '09:00:00',
            'End time': '12:00:00',
            'Duration': '3',
            'Description': 'Task 123456-789: Some work'
          }
        ]
      };
      
      (Papa.parse as jest.Mock).mockReturnValue(jobIdTestData);
      
      // Override the jobId in params
      const paramsWithoutJobId = { ...mockParams, jobId: undefined };
      
      // Call the function
      const result = await generateReport(paramsWithoutJobId);
      
      // Check job ID is extracted from description
      expect(result[0].jobId).toBe('123456-789');
    });

    it('should combine descriptions with semicolons', async () => {
      // Create mock data with multiple entries for same day
      const multipleDescriptionsData = {
        data: [
          {
            'Start date': '2023-01-01',
            'Start time': '09:00:00',
            'End time': '10:00:00',
            'Duration': '1',
            'Description': 'Task A'
          },
          {
            'Start date': '2023-01-01',
            'Start time': '10:30:00',
            'End time': '12:00:00',
            'Duration': '1.5',
            'Description': 'Task B'
          },
          {
            'Start date': '2023-01-01',
            'Start time': '13:00:00',
            'End time': '17:00:00',
            'Duration': '4',
            'Description': 'Task C'
          }
        ]
      };
      
      (Papa.parse as jest.Mock).mockReturnValue(multipleDescriptionsData);
      
      // Call the function
      const result = await generateReport(mockParams);
      
      // Check descriptions are combined with semicolons
      expect(result[0].description).toBe('Task A; Task B; Task C');
    });
    
    it('should calculate total hours correctly', async () => {
      // Create mock data with entries spanning from 9:00 to 17:00 with 1 hour pause
      const totalHoursTestData = {
        data: [
          {
            'Start date': '2023-01-01',
            'Start time': '09:00:00',
            'End time': '12:00:00',
            'Duration': '3',
            'Description': 'Morning work'
          },
          {
            'Start date': '2023-01-01',
            'Start time': '13:00:00',
            'End time': '17:00:00',
            'Duration': '4',
            'Description': 'Afternoon work'
          }
        ]
      };
      
      (Papa.parse as jest.Mock).mockReturnValue(totalHoursTestData);
      
      // Call the function
      const result = await generateReport(mockParams);
      
      // Total hours should be (17:00 - 09:00) - 1 hour pause = 7 hours
      expect(result[0].totalHours).toBe('7.00');
    });
  });
});