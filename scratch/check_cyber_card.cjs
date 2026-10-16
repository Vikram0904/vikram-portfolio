const fs = require('fs');
const css = fs.readFileSync('c:/React/vikram-portfolio/src/styles/index.css', 'utf8');
const idx = css.indexOf('.hero-cyber-card');
console.log(css.substring(idx - 100, idx + 800));
