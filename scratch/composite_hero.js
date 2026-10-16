import sharp from 'sharp';
import path from 'path';

const userDir = 'C:\\Users\\vikra\\.gemini\\antigravity-ide\\brain\\132be5b3-dd02-4f7b-8380-a4b15e363c2a\\.user_uploaded';
const bgFile = path.join(userDir, 'media_1790350129465.jpg');
const cutoutFile = path.resolve('public/assets/vikram-cutout.png');
const outputFile = path.resolve('public/assets/hero-portrait.png');

async function compositeHero() {
  const bgMeta = await sharp(bgFile).metadata();
  const bgW = bgMeta.width;
  const bgH = bgMeta.height;

  // In Image 2 (783x731), Vikram's head starts around y=110, chest around y=350, hands at bottom y=680
  // Let's resize the cutout to match exactly
  const targetH = Math.round(bgH * 0.88); // approx 643px
  const targetW = Math.round(bgW * 0.72); // approx 560px

  const resizedCutout = await sharp(cutoutFile)
    .resize(targetW, targetH, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const cMeta = await sharp(resizedCutout).metadata();

  const left = Math.round((bgW - cMeta.width) / 2) + 6;
  const top = bgH - cMeta.height - 10;

  await sharp(bgFile)
    .composite([
      {
        input: resizedCutout,
        left: Math.max(0, left),
        top: Math.max(0, top),
        blend: 'over'
      }
    ])
    .png({ quality: 96 })
    .toFile(outputFile);

  console.log('Successfully composited hero image to:', outputFile);
}

compositeHero().catch(console.error);
