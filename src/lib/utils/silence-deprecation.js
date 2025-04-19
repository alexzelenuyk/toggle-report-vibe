// Silence specific deprecation warnings
process.on('warning', e => {
  if (e.name === 'DeprecationWarning' && 
     (e.message.includes('util._extend') || 
      e.code === 'DEP0060' || 
      e.message.includes('punycode') || 
      e.code === 'DEP0040')) {
    // Silence these specific warnings
    return;
  }
  // Log all other warnings
  console.warn(e);
});

// Export a no-op function so that this module is importable
module.exports = () => {};