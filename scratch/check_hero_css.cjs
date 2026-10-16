const fs = require('fs');
const css = fs.readFileSync('c:/React/vikram-portfolio/src/styles/index.css', 'utf8');
const idx = css.indexOf('.hero-content-wrap');
console.log(css.substring(idx, idx + 800));
