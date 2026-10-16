const fs = require('fs');
const html = fs.readFileSync('c:/React/vikram-portfolio/index.html', 'utf8');
const idx1 = html.indexOf('cyber-portrait-img');
console.log(html.substring(idx1, idx1 + 1000));
