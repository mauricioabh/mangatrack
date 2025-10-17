#!/usr/bin/env node

/**
 * Development server with increased memory allocation
 * Usage: node scripts/dev-with-memory.js
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting MangaTrack with increased memory allocation...');
console.log('💾 Memory limit: 4GB');
console.log('⚡ Using Turbopack for faster builds');

const nextPath = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');
const args = ['dev', '--turbopack'];

const child = spawn('node', ['--max-old-space-size=4096', nextPath, ...args], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..')
});

child.on('error', (error) => {
  console.error('❌ Failed to start development server:', error);
  process.exit(1);
});

child.on('close', (code) => {
  console.log(`\n🛑 Development server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development server...');
  child.kill('SIGTERM');
});
