import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function verifyPWAAssets() {
  const publicDir = path.join(__dirname, '../public');
  const manifestPath = path.join(publicDir, 'manifest.json');
  
  try {
    // Read manifest
    const manifestContent = await fs.readFile(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);
    
    console.log('Verifying PWA manifest assets...\n');
    
    let allAssetsExist = true;
    
    // Check icons
    console.log('Checking icons:');
    for (const icon of manifest.icons) {
      const iconPath = path.join(publicDir, icon.src.replace('/', ''));
      try {
        await fs.access(iconPath);
        console.log(`✓ ${icon.src} (${icon.sizes})`);
      } catch (error) {
        console.log(`✗ ${icon.src} (${icon.sizes}) - MISSING`);
        allAssetsExist = false;
      }
    }
    
    // Check screenshots
    if (manifest.screenshots) {
      console.log('\nChecking screenshots:');
      for (const screenshot of manifest.screenshots) {
        const screenshotPath = path.join(publicDir, screenshot.src.replace('/', ''));
        try {
          await fs.access(screenshotPath);
          console.log(`✓ ${screenshot.src}`);
        } catch (error) {
          console.log(`✗ ${screenshot.src} - MISSING`);
          allAssetsExist = false;
        }
      }
    }
    
    // Check splash pages
    if (manifest.splash_pages) {
      console.log('\nChecking splash pages:');
      for (const splash of manifest.splash_pages) {
        const splashPath = path.join(publicDir, splash.src.replace('/', ''));
        try {
          await fs.access(splashPath);
          console.log(`✓ ${splash.src}`);
        } catch (error) {
          console.log(`✗ ${splash.src} - MISSING`);
          allAssetsExist = false;
        }
      }
    }
    
    console.log('\n' + (allAssetsExist ? '✅ All PWA assets verified!' : '❌ Some assets are missing!'));
    
  } catch (error) {
    console.error('Error verifying assets:', error);
    process.exit(1);
  }
}

verifyPWAAssets();