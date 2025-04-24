#!/usr/bin/env node

/**
 * This script verifies that all required distribution files exist before publishing.
 * It checks for the presence of essential files in the dist/ directory.
 * 
 * Usage: node scripts/verify-dist.cjs
 * 
 * This script is intended to be run as part of the prepublishOnly npm script
 * to prevent publishing packages that are missing essential files.
 */

const fs = require('fs');
const path = require('path');
let chalk;
try {
  chalk = require('chalk');
} catch (error) {
  chalk = { 
    red: (text) => `ERROR: ${text}`, 
    green: (text) => `SUCCESS: ${text}`, 
    yellow: (text) => `WARNING: ${text}` 
  };
}

// List of required files that must exist in the dist directory
const REQUIRED_FILES = [
  // Main bundle
  'dist/index.js',
  'dist/index.esm.js',
  'dist/index.d.ts',
  
  // Native bundle
  'dist/native.js',
  'dist/native.esm.js',
  'dist/native.d.ts',
  
  // React Native bundle
  'dist/react-native.js',
  'dist/react-native.esm.js',
  'dist/react-native.d.ts'
];

console.log('\nVerifying distribution files for Universal Portability SDK...\n');

// Check if dist directory exists
if (!fs.existsSync(path.resolve(__dirname, '..', 'dist'))) {
  console.error(chalk.red('Missing dist/ directory. Please run "npm run build" before publishing.'));
  process.exit(1);
}

// Check for each required file
const missingFiles = [];
REQUIRED_FILES.forEach(file => {
  const filePath = path.resolve(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
  }
});

// Report any missing files
if (missingFiles.length > 0) {
  console.error(chalk.red('The following required files are missing:'));
  missingFiles.forEach(file => console.error(`  - ${file}`));
  console.error(chalk.yellow('\nPlease run "npm run build" to generate all required files before publishing.'));
  process.exit(1);
}

// Verify file sizes to ensure they contain content
const suspiciousFiles = [];
REQUIRED_FILES.forEach(file => {
  const filePath = path.resolve(__dirname, '..', file);
  const stats = fs.statSync(filePath);
  if (stats.size < 100) { // Arbitrarily small size that would indicate a problem
    suspiciousFiles.push(`${file} (${stats.size} bytes)`);
  }
});

// Warn about suspicious files
if (suspiciousFiles.length > 0) {
  console.warn(chalk.yellow('The following files exist but are suspiciously small:'));
  suspiciousFiles.forEach(file => console.warn(`  - ${file}`));
  console.warn(chalk.yellow('\nPlease verify that the build process completed successfully.'));
}

// Success message
console.log(chalk.green('✓ All required distribution files are present!'));
console.log('Here are the files found:');
REQUIRED_FILES.forEach(file => {
  const filePath = path.resolve(__dirname, '..', file);
  const stats = fs.statSync(filePath);
  console.log(`  - ${file} (${stats.size} bytes)`);
});
console.log('\nDistribution files verified and ready for publishing.\n');
