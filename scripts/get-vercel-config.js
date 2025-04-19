#!/usr/bin/env node

/**
 * This script helps you get the Vercel token needed for CI/CD.
 * It provides instructions on how to set up Vercel deployment via GitHub Actions.
 */

console.log('\n📊 Vercel Deployment Configuration Helper 📊\n');

console.log('🔑 GitHub Actions Secret Configuration:');
console.log('-----------------------------------------');
console.log(`VERCEL_TOKEN=<Create this in your Vercel account settings>`);
console.log('\n');
console.log('✅ Instructions:');
console.log('1. Go to your GitHub repository settings');
console.log('2. Navigate to Secrets and Variables > Actions');
console.log('3. Create a Vercel token at https://vercel.com/account/tokens');
console.log('4. Add the token as the VERCEL_TOKEN secret');
console.log('5. Make sure your project is linked to Vercel');
console.log('   - You can do this by running "vercel" in your project directory\n');
console.log('The workflow will automatically use the Vercel project linked to your repository.\n');