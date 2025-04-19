// Learn more: https://github.com/testing-library/jest-dom
require('@testing-library/jest-dom');

// Mock the clipboard API
Object.defineProperty(global.navigator, 'clipboard', {
  value: {
    writeText: jest.fn(),
  },
  writable: true,
});