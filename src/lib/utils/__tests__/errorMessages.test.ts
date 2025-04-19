import { getFriendlyErrorMessage } from '../errorMessages';
import axios from 'axios';

describe('getFriendlyErrorMessage', () => {
  // Test Axios errors with different status codes
  test('handles 401 Unauthorized errors', () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        status: 401,
        statusText: 'Unauthorized'
      }
    };
    const message = getFriendlyErrorMessage(axiosError as unknown as Error);
    expect(message).toContain('Authentication failed');
    expect(message).toContain('API token');
  });

  test('handles 404 Not Found errors', () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        status: 404,
        statusText: 'Not Found'
      }
    };
    const message = getFriendlyErrorMessage(axiosError as unknown as Error);
    expect(message).toContain('workspace wasn\'t found');
    expect(message).toContain('workspace ID');
  });

  test('handles 429 Rate Limit errors', () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        status: 429,
        statusText: 'Too Many Requests'
      }
    };
    const message = getFriendlyErrorMessage(axiosError as unknown as Error);
    expect(message).toContain('rate limit');
    expect(message).toContain('try again');
  });

  test('handles 500 server errors', () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        status: 500,
        statusText: 'Internal Server Error'
      }
    };
    const message = getFriendlyErrorMessage(axiosError as unknown as Error);
    expect(message).toContain('It\'s not you, it\'s Toggl');
    expect(message).toContain('servers');
  });

  // Test standard Error objects with different messages
  test('handles "no time entries found" errors', () => {
    const error = new Error('No time entries found for the specified period.');
    const message = getFriendlyErrorMessage(error);
    expect(message).toContain('empty');
    expect(message).toContain('date range');
  });

  test('handles "network error" messages', () => {
    const error = new Error('Network Error');
    const message = getFriendlyErrorMessage(error);
    expect(message).toContain('network error');
    expect(message).toContain('internet connection');
  });

  test('handles "all fields are required" validation errors', () => {
    const error = new Error('All fields are required');
    const message = getFriendlyErrorMessage(error);
    expect(message).toContain('Missing information');
    expect(message).toContain('required fields');
  });

  test('handles date-related errors', () => {
    const error = new Error('Invalid date range specified');
    const message = getFriendlyErrorMessage(error);
    expect(message).toContain('Date drama');
    expect(message).toContain('date selection');
  });

  // Test unknown error types
  test('provides a generic message for unknown error types', () => {
    const unknownError = { foo: 'bar' };
    const message = getFriendlyErrorMessage(unknownError);
    expect(message).toContain('Something went wrong');
  });

  // Verify that each error message contains at least one emoji or symbol
  test('includes emoji or symbol in error messages', () => {
    const errors = [
      { isAxiosError: true, response: { status: 401, statusText: 'Unauthorized' } },
      new Error('No time entries found for the specified period.'),
      new Error('Network Error'),
      { foo: 'bar' }
    ];

    errors.forEach(error => {
      const message = getFriendlyErrorMessage(error as unknown as Error);
      // Check for any emoji or symbol (including ☕, 🔍, etc.)
      expect(message).toMatch(/[\u{1F300}-\u{1F6FF}]|[☕🔍🕵️‍♂️🚫🏎️💔✨😴🤔📅📝🙃]/u);
    });
  });
});