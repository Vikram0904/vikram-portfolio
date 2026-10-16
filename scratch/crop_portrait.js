import sharp from 'sharp';
import path from 'path';

const inputPath = path.resolve('public/assets/vikram-face-banner.jpg');
const outputPath = path.resolve('public/assets/hero-portrait.jpg');

async function fineTuneCrop() {
  const metadata = await sharp(inputPath).metadata();
  console.log('Original dimensions:', metadata.width, metadata.height);

  // In the 786x748 image:
  // Vikram's head is near x=390, y=280
  // Left inner orange border is around x=260
  // Right inner blue border is around x=580
  // Top inner border is around x=260..580, y=140
  // Bottom table is around y=680
  // Let's crop right inside the neon frame:
  // left: 240, width: 440, top: 110, height: 560
  const left = 240;
  const top = 100;
  const width = 430;
  const height = 550;

  await sharp(inputPath)
    .extract({ left, top, width, height })
    .resize(600, 750, { fit: 'cover' })
    .jpeg({ quality: 96 })
    .toFile(outputPath);

  console.log('Fine-tuned cropped portrait successfully written to:', outputPath);
}

fineTuneCrop().catch(console.error);
