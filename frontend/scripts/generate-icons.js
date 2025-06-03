import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon sizes needed for PWA
const iconSizes = [48, 72, 96, 144, 192, 512];

async function generateIcons() {
  const svgPath = path.join(__dirname, '../public/favicon.svg');
  const publicDir = path.join(__dirname, '../public');
  
  try {
    // Read the SVG file
    const svgBuffer = await fs.readFile(svgPath);
    
    console.log('Generating PNG icons from SVG...');
    
    // Generate regular icons
    for (const size of iconSizes) {
      const outputPath = path.join(publicDir, `icon-${size}.png`);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated icon-${size}.png`);
    }
    
    // Generate maskable icons with safe area padding (192 and 512)
    const maskableSizes = [192, 512];
    for (const size of maskableSizes) {
      const outputPath = path.join(publicDir, `icon-maskable-${size}.png`);
      
      // For maskable icons, we need to add padding (safe area is ~80% of the icon)
      const iconSize = Math.floor(size * 0.8);
      const padding = Math.floor((size - iconSize) / 2);
      
      await sharp(svgBuffer)
        .resize(iconSize, iconSize)
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 26, g: 26, b: 46, alpha: 1 } // #1A1A2E
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated icon-maskable-${size}.png`);
    }
    
    console.log('\nAll icons generated successfully!');
    
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();