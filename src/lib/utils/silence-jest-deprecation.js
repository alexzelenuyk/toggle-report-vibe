// This file is specifically for Jest to silence deprecation warnings
// Runs before tests start

// Suppress the specific DEP0040 warning for punycode
const originalProcessEmitWarning = process.emitWarning;
process.emitWarning = function(warning, type, code, ...args) {
  if (
    (code === 'DEP0040') || 
    (type === 'DeprecationWarning' && typeof warning === 'string' && warning.includes('punycode'))
  ) {
    // Suppress this specific warning
    return;
  }
  return originalProcessEmitWarning(warning, type, code, ...args);
};

// Also suppress the same warning from older Node.js versions that use the events system
const originalConsoleWarn = console.warn;
console.warn = function(...args) {
  // Check if this is the specific punycode deprecation warning
  if (
    args.length > 0 && 
    args[0] && 
    typeof args[0] === 'object' && 
    args[0].name === 'DeprecationWarning' &&
    (args[0].code === 'DEP0040' || (args[0].message && args[0].message.includes('punycode')))
  ) {
    return; // Suppress this specific warning
  }
  return originalConsoleWarn.apply(console, args);
};

module.exports = {};