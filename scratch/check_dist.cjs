const fs = require('fs');
const distHtml = fs.readFileSync('c:/React/vikram-portfolio/dist/index.html', 'utf8');
const idx = distHtml.indexOf('hero-visual-wrap');
console.log(distHtml.substring(idx - 100, idx + 800));
