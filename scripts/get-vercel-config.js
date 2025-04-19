#!/usr/bin/env node

/**
 * This script helps you get the Vercel configuration details needed for CI/CD.
 * Run this script after linking your project to Vercel with the Vercel CLI.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('\n📊 Vercel Project Configuration Helper 📊\n');

// Read Vercel config
try {
  // Get path to Vercel config file (usually in ~/.vercel/project.json)
  const configPath = path.join(os.homedir(), '.vercel', 'project.json');
  
  if (!fs.existsSync(configPath)) {
    console.log('❌ Vercel project configuration not found.');
    console.log('Please run "vercel link" to connect your project first.\n');
    process.exit(1);
  }
  
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  console.log('🔑 GitHub Actions Secret Configuration:');
  console.log('-----------------------------------------');
  console.log(`VERCEL_ORG_ID=${config.orgId}`);
  console.log(`VERCEL_PROJECT_ID=${config.projectId}`);
  console.log(`VERCEL_TOKEN=<Create this in your Vercel account settings>`);
  console.log('\n');
  console.log('✅ Instructions:');
  console.log('1. Go to your GitHub repository settings');
  console.log('2. Navigate to Secrets and Variables > Actions');
  console.log('3. Add the secrets above with their respective values');
  console.log('4. Create a Vercel token at https://vercel.com/account/tokens');
  console.log('5. Add the token as the VERCEL_TOKEN secret\n');
  
} catch (error) {
  console.error('❌ Error reading Vercel configuration:', error.message);
  console.log('Please make sure you have linked your project with "vercel link".\n');
}