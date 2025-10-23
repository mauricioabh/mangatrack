#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎯 Running Playwright tests with coverage...\n');

try {
  // Run tests with coverage
  execSync('npx playwright test --project=chromium-coverage', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.log('\n✅ Tests completed!');
  console.log('\n📊 Coverage reports available:');
  console.log('   • HTML Report: playwright-report/index.html');
  console.log('   • JSON Results: test-results/results.json');
  console.log('   • JUnit Results: test-results/results.xml');
  
  // Check if coverage files exist
  const coverageDir = path.join(process.cwd(), 'coverage');
  if (fs.existsSync(coverageDir)) {
    console.log('   • Coverage Report: coverage/index.html');
  }

} catch (error) {
  console.error('❌ Tests failed:', error.message);
  process.exit(1);
}


