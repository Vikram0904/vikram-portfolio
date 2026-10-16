const fs = require('fs');
let css = fs.readFileSync('c:/React/vikram-portfolio/src/styles/index.css', 'utf8');

// Replace .hero-content-wrap grid definition
css = css.replace(
  'grid-template-columns: 1.15fr 0.85fr;\n  align-items: center;\n  gap: 3.5rem;',
  'grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);\n  align-items: center;\n  gap: 2.5rem;'
);

// Replace .hero-title font size and remove white-space: nowrap
css = css.replace(
  'font-size: clamp(2.2rem, 4.4vw, 4.2rem);',
  'font-size: clamp(2rem, 3.5vw, 3.6rem);'
);

css = css.replace(
  '.hero-title .title-line {\n  display: block;\n  white-space: nowrap;\n}',
  '.hero-title .title-line {\n  display: block;\n}'
);

fs.writeFileSync('c:/React/vikram-portfolio/src/styles/index.css', css, 'utf8');
console.log('Successfully optimized hero grid and typography!');
