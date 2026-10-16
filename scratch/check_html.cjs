const fs = require('fs');
const html = fs.readFileSync('c:/React/vikram-portfolio/index.html', 'utf8');
const idx1 = html.indexOf('hero-visual-wrap');
console.log(html.substring(idx1 - 30, idx1 + 1200));
