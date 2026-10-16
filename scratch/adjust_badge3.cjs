const fs = require('fs');
let css = fs.readFileSync('c:/React/vikram-portfolio/src/styles/index.css', 'utf8');

// Move badge-fullstack down to bottom: -36px so it clears his hands/watch completely
css = css.replace(
  /\.badge-fullstack\s*\{[^}]+\}/,
  `.badge-fullstack {
  bottom: -36px;
  left: 50%;
  transform: translateX(-50%);
  border: 1px solid rgba(255, 107, 53, 0.55);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 107, 53, 0.22), inset 0 1px 1px rgba(255, 255, 255, 0.18);
  animation: floatBadge3 5s ease-in-out infinite 1.2s;
  white-space: nowrap;
}`
);

fs.writeFileSync('c:/React/vikram-portfolio/src/styles/index.css', css, 'utf8');
console.log('Adjusted badge-fullstack to bottom: -36px');
