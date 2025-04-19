// Learn more: https://github.com/testing-library/jest-dom
require('@testing-library/jest-dom');

// Silence specific deprecation warnings
require('./src/lib/utils/silence-deprecation');

// Mock the clipboard API
Object.defineProperty(global.navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
  writable: true,
});

// Mock ResizeObserver which isn't available in JSDOM
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock window.matchMedia which isn't available in JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollTo which isn't available in JSDOM
window.scrollTo = jest.fn();