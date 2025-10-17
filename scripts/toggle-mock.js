#!/usr/bin/env node

/**
 * Toggle Mock Data Script
 * 
 * Usage:
 *   node scripts/toggle-mock.js on    # Enable mock data
 *   node scripts/toggle-mock.js off   # Disable mock data
 *   node scripts/toggle-mock.js       # Show current status
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');

function readEnvFile() {
  if (!fs.existsSync(envPath)) {
    return '';
  }
  return fs.readFileSync(envPath, 'utf8');
}

function writeEnvFile(content) {
  fs.writeFileSync(envPath, content);
}

function updateMockSetting(useMock) {
  const envContent = readEnvFile();
  const lines = envContent.split('\n');
  
  let found = false;
  const newLines = lines.map(line => {
    if (line.startsWith('NEXT_PUBLIC_USE_MOCK=')) {
      found = true;
      return `NEXT_PUBLIC_USE_MOCK=${useMock}`;
    }
    return line;
  });
  
  if (!found) {
    newLines.push(`NEXT_PUBLIC_USE_MOCK=${useMock}`);
  }
  
  writeEnvFile(newLines.join('\n'));
}

function getCurrentStatus() {
  const envContent = readEnvFile();
  const match = envContent.match(/NEXT_PUBLIC_USE_MOCK=(.+)/);
  return match ? match[1] : 'not set';
}

const command = process.argv[2];

switch (command) {
  case 'on':
    updateMockSetting('true');
    console.log('🎭 Mock data enabled! Restart your dev server to apply changes.');
    break;
    
  case 'off':
    updateMockSetting('false');
    console.log('🗄️ Real database data enabled! Restart your dev server to apply changes.');
    break;
    
  case undefined:
    const status = getCurrentStatus();
    console.log(`📊 Current mock data status: ${status}`);
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/toggle-mock.js on    # Enable mock data');
    console.log('  node scripts/toggle-mock.js off   # Disable mock data');
    break;
    
  default:
    console.log('❌ Invalid command. Use "on", "off", or no argument to see status.');
    process.exit(1);
}



