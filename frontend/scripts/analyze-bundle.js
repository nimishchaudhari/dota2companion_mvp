#!/usr/bin/env node
// Bundle analysis script for Dota 2 Companion
// Run with: node scripts/analyze-bundle.js

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

async function analyzeBundles() {
  console.log('🔍 Analyzing bundle sizes...\n');
  
  try {
    // Run build with detailed output
    const { stdout } = await execAsync('npm run build', { cwd: process.cwd() });
    console.log(stdout);
    
    // Check if dist directory exists
    const distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distPath)) {
      console.error('❌ Dist directory not found. Build failed?');
      return;
    }
    
    // Calculate total bundle size
    const files = fs.readdirSync(path.join(distPath, 'assets'));
    let totalSize = 0;
    let jsSize = 0;
    let cssSize = 0;
    
    files.forEach(file => {
      const filePath = path.join(distPath, 'assets', file);
      const stats = fs.statSync(filePath);
      const size = stats.size;
      totalSize += size;
      
      if (file.endsWith('.js')) {
        jsSize += size;
      } else if (file.endsWith('.css')) {
        cssSize += size;
      }
    });
    
    console.log('\n📊 Bundle Analysis Summary:');
    console.log(`📦 Total Bundle Size: ${(totalSize / 1024).toFixed(2)} KB`);
    console.log(`📝 JavaScript: ${(jsSize / 1024).toFixed(2)} KB`);
    console.log(`🎨 CSS: ${(cssSize / 1024).toFixed(2)} KB`);
    
    // Performance recommendations
    console.log('\n💡 Performance Recommendations:');
    
    if (jsSize > 500 * 1024) {
      console.log('⚠️  Large JavaScript bundle detected. Consider code splitting.');
    } else {
      console.log('✅ JavaScript bundle size looks good.');
    }
    
    if (cssSize > 50 * 1024) {
      console.log('⚠️  Large CSS bundle detected. Consider critical CSS extraction.');
    } else {
      console.log('✅ CSS bundle size looks good.');
    }
    
    console.log('\n🔗 View detailed analysis: ./dist/stats.html');
    
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message);
  }
}

analyzeBundles();