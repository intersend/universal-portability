#!/usr/bin/env node

/**
 * This script verifies the integrity of the npm package tarball
 * by checking if it contains all required distribution files.
 * 
 * Usage: node scripts/verify-package-integrity.cjs
 * 
 * This script is intended to be run after `npm pack` to catch issues
 * before actual publishing.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
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

console.log('\nVerifying package integrity for Universal Portability SDK...\n');

// Create a temporary directory to extract the package to
const tempDir = path.resolve(__dirname, '..', 'temp-package-verify');
if (fs.existsSync(tempDir)) {
  try {
    execSync(`rm -rf "${tempDir}"`);
  } catch (error) {
    console.error(chalk.red(`Failed to clean up temporary directory: ${tempDir}`));
    console.error(error);
    process.exit(1);
  }
}

fs.mkdirSync(tempDir, { recursive: true });

try {
  // Get package info
  const packageJson = require('../package.json');
  const packageName = packageJson.name;
  const packageVersion = packageJson.version;
  const tarballName = `${packageName.replace('@', '').replace('/', '-')}-${packageVersion}.tgz`;
  
  // Create a tarball
  console.log('Creating a test package tarball...');
  execSync('npm pack --quiet', { stdio: 'inherit' });
  
  // Extract the tarball to temp directory
  console.log('Extracting package to verify contents...');
  execSync(`tar -xzf "${tarballName}" -C "${tempDir}"`);
  
  // Check if dist directory exists in the package
  const packageDir = path.join(tempDir, 'package');
  const distDir = path.join(packageDir, 'dist');
  
  if (!fs.existsSync(distDir)) {
    console.error(chalk.red('CRITICAL ERROR: dist/ directory is missing from the package!'));
    console.error(chalk.yellow('This means the package will not work when installed by users.'));
    console.error(chalk.yellow('Check your package.json "files" field and ensure it includes "dist".'));
    throw new Error('Missing dist directory in package');
  }
  
  // List files in the dist directory to verify
  console.log('\nFiles included in dist/ directory:');
  const distFiles = fs.readdirSync(distDir);
  
  if (distFiles.length === 0) {
    console.error(chalk.red('CRITICAL ERROR: dist/ directory is empty!'));
    throw new Error('Empty dist directory in package');
  }
  
  // Check for key files
  const requiredPatterns = [
    /index\.js$/,
    /index\.esm\.js$/,
    /native\.js$/,
    /native\.esm\.js$/,
    /react-native\.js$/,
    /react-native\.esm\.js$/
  ];
  
  const missingPatterns = [];
  
  requiredPatterns.forEach(pattern => {
    const found = distFiles.some(file => pattern.test(file));
    if (!found) {
      missingPatterns.push(pattern.toString());
    }
  });
  
  if (missingPatterns.length > 0) {
    console.error(chalk.red('CRITICAL ERROR: Some required file patterns are missing:'));
    missingPatterns.forEach(pattern => console.error(`  - ${pattern}`));
    throw new Error('Missing required files in package');
  }
  
  // Display list of included files
  console.log(chalk.green('The following files are included in the dist/ directory:'));
  distFiles.forEach(file => console.log(`  - ${file}`));
  
  console.log(chalk.green('\nPackage integrity verified successfully!'));
  console.log('The package includes all required distribution files.\n');
  
} catch (error) {
  console.error(chalk.red('Package integrity verification failed!'));
  console.error(error.message || error);
  process.exit(1);
} finally {
  // Clean up
  try {
    console.log('Cleaning up...');
    execSync(`rm -rf "${tempDir}"`);
    const packageJson = require('../package.json');
    const packageName = packageJson.name;
    const packageVersion = packageJson.version;
    const tarballName = `${packageName.replace('@', '').replace('/', '-')}-${packageVersion}.tgz`;
    
    if (fs.existsSync(tarballName)) {
      fs.unlinkSync(tarballName);
    }
  } catch (cleanupError) {
    console.warn(chalk.yellow('Warning: Failed to clean up temporary files.'));
  }
}
