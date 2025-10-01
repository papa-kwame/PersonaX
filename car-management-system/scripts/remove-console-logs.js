#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to recursively find all JavaScript/JSX files
function findJSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findJSFiles(filePath, fileList);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to remove console.log statements from a file
function removeConsoleLogs(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Remove console.log statements (including multi-line)
    content = content.replace(/console\.log\s*\([^)]*\)\s*;?\s*/g, '');
    
    // Remove console.error statements (including multi-line)
    content = content.replace(/console\.error\s*\([^)]*\)\s*;?\s*/g, '');
    
    // Remove console.warn statements (including multi-line)
    content = content.replace(/console\.warn\s*\([^)]*\)\s*;?\s*/g, '');
    
    // Remove console.info statements (including multi-line)
    content = content.replace(/console\.info\s*\([^)]*\)\s*;?\s*/g, '');
    
    // Remove console.debug statements (including multi-line)
    content = content.replace(/console\.debug\s*\([^)]*\)\s*;?\s*/g, '');
    
    // Clean up empty lines (more than 2 consecutive)
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Cleaned: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main function
function main() {
  const srcDir = path.join(__dirname, '..', 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error('Source directory not found:', srcDir);
    process.exit(1);
  }
  
  console.log('Finding JavaScript/JSX files...');
  const jsFiles = findJSFiles(srcDir);
  
  console.log(`Found ${jsFiles.length} files to process`);
  
  let cleanedCount = 0;
  
  jsFiles.forEach(file => {
    if (removeConsoleLogs(file)) {
      cleanedCount++;
    }
  });
  
  console.log(`\nCleaning complete!`);
  console.log(`Files processed: ${jsFiles.length}`);
  console.log(`Files cleaned: ${cleanedCount}`);
}

// Run the script
main();

export { removeConsoleLogs, findJSFiles };
