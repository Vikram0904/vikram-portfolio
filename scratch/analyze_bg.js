import sharp from 'sharp';
import path from 'path';

const userDir = 'C:\\Users\\vikra\\.gemini\\antigravity-ide\\brain\\132be5b3-dd02-4f7b-8380-a4b15e363c2a\\.user_uploaded';
const cutoutFile = path.join(userDir, 'media_1790350129455.jpg');

async function checkBackground() {
  const image = sharp(cutoutFile);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  console.log('Image dimensions:', info.width, info.height);

  // Check top-left corner pixel values
  for (let y = 0; y < 10; y++) {
    const row = [];
    for (let x = 0; x < 10; x++) {
      const idx = (y * info.width + x) * 3;
      row.push(`(${data[idx]},${data[idx+1]},${data[idx+2]})`);
    }
    console.log(`Row ${y}:`, row.slice(0, 5).join(' '));
  }
}

checkBackground().catch(console.error);
