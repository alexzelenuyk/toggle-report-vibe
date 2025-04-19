/**
 * This file is automatically loaded by Jest when running tests
 * It silences specific deprecation warnings
 */

// Suppress the specific DEP0040 warning for punycode
const originalProcessEmitWarning = process.emitWarning;
process.emitWarning = function(warning, type, code, ...args) {
  // Check if it's the punycode deprecation warning
  if (
    (code === 'DEP0040') || 
    (type === 'DeprecationWarning' && typeof warning === 'string' && warning.includes('punycode'))
  ) {
    // Silently ignore this warning
    return;
  }
  // Otherwise, pass it through to the original emitWarning
  return originalProcessEmitWarning(warning, type, code, ...args);
};

// Also suppress the warning in console output
const originalConsoleWarn = console.warn;
console.warn = function(...args) {
  // Check if this is the specific deprecation warning
  if (
    args.length > 0 && 
    typeof args[0] === 'object' && 
    args[0] && 
    args[0].name === 'DeprecationWarning' && 
    (args[0].code === 'DEP0040' || (args[0].message && args[0].message.includes('punycode')))
  ) {
    return; // Don't log this warning
  }
  return originalConsoleWarn.apply(console, args);
};

module.exports = {};