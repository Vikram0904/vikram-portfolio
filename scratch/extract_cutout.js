import sharp from 'sharp';
import path from 'path';

const userDir = 'C:\\Users\\vikra\\.gemini\\antigravity-ide\\brain\\132be5b3-dd02-4f7b-8380-a4b15e363c2a\\.user_uploaded';
const cutoutFile = path.join(userDir, 'media_1790350129455.jpg');
const outputFile = path.resolve('public/assets/vikram-cutout.png');

async function removeCheckerboard() {
  const image = sharp(cutoutFile);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;

  // Create RGBA buffer
  const rgbaData = Buffer.alloc(width * height * 4);

  // Flood fill / threshold mask from corners
  // In the checkerboard, pixels are grayscale (r approx == g approx == b) and light (r > 195).
  // Vikram's hair/skin/hoodie:
  // - Dark hair / hoodie: r, g, b < 100
  // - Face/skin: r is high, g/b are different (r > g > b, warm skin tones)
  // - Orange rim light on left: r > 180, g ~ 100, b < 40
  // - Cyan rim light on right: b > 180, g > 150, r < 80
  // Checkerboard is neutral gray/white where |r-g| < 10 and |g-b| < 10 and |r-b| < 10 and r > 180.

  // Let's do a flood fill mask from the edges (top, left, right)
  const isBackground = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    const idx = (y * width + x) * 3;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    const isNeutral = Math.abs(r - g) <= 12 && Math.abs(g - b) <= 12 && Math.abs(r - b) <= 12;
    const isLight = r >= 190 && g >= 190 && b >= 190;
    return isNeutral && isLight;
  };

  // BFS flood fill visited array
  const visited = new Uint8Array(width * height);
  const queue = [];

  // Seed with border pixels
  for (let x = 0; x < width; x++) {
    if (isBackground(x, 0)) { queue.push(x, 0); visited[0 * width + x] = 1; }
    if (isBackground(x, height - 1)) { queue.push(x, height - 1); visited[(height - 1) * width + x] = 1; }
  }
  for (let y = 0; y < height; y++) {
    if (isBackground(0, y)) { queue.push(0, y); visited[y * width + 0] = 1; }
    if (isBackground(width - 1, y)) { queue.push(width - 1, y); visited[y * width + (width - 1)] = 1; }
  }

  let head = 0;
  const dx = [1, -1, 0, 0];
  const dy = [0, 0, 1, -1];

  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];

    for (let i = 0; i < 4; i++) {
      const nx = cx + dx[i];
      const ny = cy + dy[i];
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIdx = ny * width + nx;
        if (!visited[nIdx] && isBackground(nx, ny)) {
          visited[nIdx] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }

  // Populate RGBA
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 3;
      const dstIdx = (y * width + x) * 4;
      const isBg = visited[y * width + x];

      rgbaData[dstIdx] = data[srcIdx];
      rgbaData[dstIdx + 1] = data[srcIdx + 1];
      rgbaData[dstIdx + 2] = data[srcIdx + 2];
      rgbaData[dstIdx + 3] = isBg ? 0 : 255;
    }
  }

  await sharp(rgbaData, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(outputFile);

  console.log('Clean transparent PNG saved to:', outputFile);
}

removeCheckerboard().catch(console.error);
