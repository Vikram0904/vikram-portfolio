import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const userDir = 'C:\\Users\\vikra\\.gemini\\antigravity-ide\\brain\\132be5b3-dd02-4f7b-8380-a4b15e363c2a\\.user_uploaded';
const files = fs.readdirSync(userDir);

for (const file of files) {
  if (file.includes('1790350129')) {
    const fullPath = path.join(userDir, file);
    const meta = await sharp(fullPath).metadata();
    console.log(file, meta.format, meta.width, meta.height, meta.channels, meta.hasAlpha ? 'Has Alpha' : 'No Alpha');
  }
}
