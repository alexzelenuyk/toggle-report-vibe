import { RawTogglTimeEntry } from '../types';
import {
  findEarliestTime,
  findLatestTime,
  calculatePauseDuration,
  calculateTimeDifferenceInSeconds,
  timeStringToHours,
  calculateTotalHours,
  getUniqueDescriptions,
  formatTimeToMinutes,
  extractJobId
} from '../togglApi';

describe('togglApi Helper Functions', () => {
  describe('findEarliestTime', () => {
    it('should find the earliest start time from entries', () => {
      const entries: RawTogglTimeEntry[] = [
        { 'Start date': '2023-01-01', 'Start time': '10:00:00', 'End time': '12:00:00', 'Duration': '2', 'Description': 'Test 1' },
        { 'Start date': '2023-01-01', 'Start time': '09:30:00', 'End time': '11:00:00', 'Duration': '1.5', 'Description': 'Test 2' },
        { 'Start date': '2023-01-01', 'Start time': '14:00:00', 'End time': '16:00:00', 'Duration': '2', 'Description': 'Test 3' },
      ];
      
      const result = findEarliestTime(entries);
      expect(result).toBe('09:30:00');
    });
    
    it('should return default when entries array is empty', () => {
      const result = findEarliestTime([]);
      expect(result).toBe('23:59:59');
    });
  });
  
  describe('findLatestTime', () => {
    it('should find the latest end time from entries', () => {
      const entries: RawTogglTimeEntry[] = [
        { 'Start date': '2023-01-01', 'Start time': '10:00:00', 'End time': '12:00:00', 'Duration': '2', 'Description': 'Test 1' },
        { 'Start date': '2023-01-01', 'Start time': '09:30:00', 'End time': '11:00:00', 'Duration': '1.5', 'Description': 'Test 2' },
        { 'Start date': '2023-01-01', 'Start time': '14:00:00', 'End time': '18:30:00', 'Duration': '4.5', 'Description': 'Test 3' },
      ];
      
      const result = findLatestTime(entries);
      expect(result).toBe('18:30:00');
    });
    
    it('should return default when entries array is empty', () => {
      const result = findLatestTime([]);
      expect(result).toBe('00:00:00');
    });
  });
  
  describe('calculateTimeDifferenceInSeconds', () => {
    it('should calculate difference between two time strings in seconds', () => {
      const time1 = '10:15:30';
      const time2 = '11:30:45';
      
      const result = calculateTimeDifferenceInSeconds(time1, time2);
      
      // (11 - 10) hours = 3600 seconds
      // (30 - 15) minutes = 15 * 60 = 900 seconds
      // (45 - 30) seconds = 15 seconds
      // Total: 3600 + 900 + 15 = 4515 seconds
      expect(result).toBe(4515);
    });
    
    it('should handle HH:MM format without seconds', () => {
      const time1 = '10:15';
      const time2 = '11:30';
      
      const result = calculateTimeDifferenceInSeconds(time1, time2);
      
      // (11 - 10) hours = 3600 seconds
      // (30 - 15) minutes = 15 * 60 = 900 seconds
      // Total: 3600 + 900 = 4500 seconds
      expect(result).toBe(4500);
    });
    
    it('should return negative value when time1 is later than time2', () => {
      const time1 = '11:30:00';
      const time2 = '10:15:00';
      
      const result = calculateTimeDifferenceInSeconds(time1, time2);
      expect(result).toBe(-4500);
    });
  });
  
  describe('calculatePauseDuration', () => {
    it('should calculate pause duration between time entries', () => {
      const entries: RawTogglTimeEntry[] = [
        { 'Start date': '2023-01-01', 'Start time': '09:00:00', 'End time': '10:30:00', 'Duration': '1.5', 'Description': 'Task 1' },
        { 'Start date': '2023-01-01', 'Start time': '11:00:00', 'End time': '12:30:00', 'Duration': '1.5', 'Description': 'Task 2' },
        { 'Start date': '2023-01-01', 'Start time': '14:00:00', 'End time': '17:00:00', 'Duration': '3', 'Description': 'Task 3' },
      ];
      
      const result = calculatePauseDuration(entries);
      
      // Pauses: 10:30 - 11:00 (30 minutes) and 12:30 - 14:00 (90 minutes)
      // Total: 120 minutes = 2 hours
      expect(result).toBe(2);
    });
    
    it('should ignore overlapping entries', () => {
      const entries: RawTogglTimeEntry[] = [
        { 'Start date': '2023-01-01', 'Start time': '09:00:00', 'End time': '11:00:00', 'Duration': '2', 'Description': 'Task 1' },
        { 'Start date': '2023-01-01', 'Start time': '10:30:00', 'End time': '12:30:00', 'Duration': '2', 'Description': 'Task 2' },
      ];
      
      const result = calculatePauseDuration(entries);
      
      // Entries overlap (10:30 - 11:00), so pause duration is 0
      expect(result).toBe(0);
    });
    
    it('should round up pause minutes to nearest minute', () => {
      const entries: RawTogglTimeEntry[] = [
        { 'Start date': '2023-01-01', 'Start time': '09:00:00', 'End time': '10:00:00', 'Duration': '1', 'Description': 'Task 1' },
        { 'Start date': '2023-01-01', 'Start time': '10:00:30', 'End time': '11:00:00', 'Duration': '1', 'Description': 'Task 2' },
      ];
      
      const result = calculatePauseDuration(entries);
      
      // Pause is 30 seconds, which should round up to 1 minute = 0.0166... hours
      // But after Math.ceil(), it's 1 minute = 1/60 = 0.016666... hours
      expect(result).toBeCloseTo(0.016666, 5);
    });
  });
  
  describe('timeStringToHours', () => {
    it('should convert time string to decimal hours', () => {
      expect(timeStringToHours('10:30:00')).toBe(10.5);
      expect(timeStringToHours('10:15:00')).toBe(10.25);
      expect(timeStringToHours('10:45:00')).toBe(10.75);
    });
    
    it('should handle time string without seconds', () => {
      expect(timeStringToHours('10:30')).toBe(10.5);
    });
    
    it('should handle seconds', () => {
      expect(timeStringToHours('10:30:30')).toBeCloseTo(10.508333, 5); // 10.5 + 30/3600
    });
  });
  
  describe('calculateTotalHours', () => {
    it('should calculate total hours in a day', () => {
      const startTime = '09:00:00';
      const endTime = '17:00:00';
      const pauseDuration = 1; // 1 hour
      
      const result = calculateTotalHours(startTime, endTime, pauseDuration);
      
      // (17 - 9) - 1 = 7 hours
      expect(result).toBe(7);
    });
    
    it('should handle times spanning midnight', () => {
      const startTime = '22:00:00';
      const endTime = '02:00:00';
      const pauseDuration = 0;
      
      const result = calculateTotalHours(startTime, endTime, pauseDuration);
      
      // (24 - 22) + 2 = 4 hours
      expect(result).toBe(4);
    });
  });
  
  describe('getUniqueDescriptions', () => {
    it('should get unique descriptions from entries', () => {
      const entries: RawTogglTimeEntry[] = [
        { 'Start date': '2023-01-01', 'Start time': '09:00:00', 'End time': '10:00:00', 'Duration': '1', 'Description': 'Task A' },
        { 'Start date': '2023-01-01', 'Start time': '10:30:00', 'End time': '11:30:00', 'Duration': '1', 'Description': 'Task B' },
        { 'Start date': '2023-01-01', 'Start time': '12:00:00', 'End time': '13:00:00', 'Duration': '1', 'Description': 'Task A' },
      ];
      
      const result = getUniqueDescriptions(entries);
      
      // Should only include each description once
      expect(result).toEqual(['Task A', 'Task B']);
      expect(result.length).toBe(2);
    });
    
    it('should filter out empty descriptions', () => {
      const entries: RawTogglTimeEntry[] = [
        { 'Start date': '2023-01-01', 'Start time': '09:00:00', 'End time': '10:00:00', 'Duration': '1', 'Description': 'Task A' },
        { 'Start date': '2023-01-01', 'Start time': '10:30:00', 'End time': '11:30:00', 'Duration': '1', 'Description': '' },
      ];
      
      const result = getUniqueDescriptions(entries);
      
      expect(result).toEqual(['Task A']);
    });
  });
  
  describe('formatTimeToMinutes', () => {
    it('should format time string to HH:MM (removing seconds)', () => {
      expect(formatTimeToMinutes('10:30:45')).toBe('10:30');
      expect(formatTimeToMinutes('09:05:00')).toBe('09:05');
    });
    
    it('should handle time string without seconds', () => {
      expect(formatTimeToMinutes('10:30')).toBe('10:30');
    });
  });
  
  describe('extractJobId', () => {
    it('should extract job ID from description', () => {
      expect(extractJobId('Task for project 123456-789: implementation')).toBe('123456-789');
      expect(extractJobId('123456-789 - Development work')).toBe('123456-789');
    });
    
    it('should return null when job ID not found', () => {
      expect(extractJobId('Task for project: implementation')).toBeNull();
    });
    
    it('should match the correct format only', () => {
      expect(extractJobId('12345-789')).toBeNull(); // Too few digits in first part
      expect(extractJobId('1234567-789')).toBeNull(); // Too many digits in first part
      expect(extractJobId('123456-78')).toBeNull(); // Too few digits in second part
      expect(extractJobId('123456-7890')).toBeNull(); // Too many digits in second part
    });
  });
});