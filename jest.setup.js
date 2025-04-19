// Learn more: https://github.com/testing-library/jest-dom
require('@testing-library/jest-dom');

// Silence specific deprecation warnings
require('./src/lib/utils/silence-deprecation');

// Mock the clipboard API
Object.defineProperty(global.navigator, 'clipboard', {
  value: {
    writeText: jest.fn(),
  },
  writable: true,
});