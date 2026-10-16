const fs = require('fs');
let css = fs.readFileSync('c:/React/vikram-portfolio/src/styles/index.css', 'utf8');

const responsiveSnippet = `
/* Hero Cyber Card Satellite HUD Responsive Overrides */
@media (max-width: 1200px) {
  .badge-wp { left: -12px; }
  .badge-ai { right: -12px; }
}

@media (max-width: 640px) {
  .hero-cyber-card {
    max-width: 360px;
    height: 440px;
  }
  .badge-wp {
    top: 4%;
    left: 8px;
    padding: 0.45rem 0.85rem;
  }
  .badge-ai {
    top: 15%;
    right: 8px;
    padding: 0.45rem 0.85rem;
  }
  .badge-fullstack {
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 24px);
    max-width: 320px;
    justify-content: center;
    padding: 0.5rem 0.85rem;
  }
  .hud-title {
    font-size: 0.8rem;
  }
  .hud-sub {
    font-size: 0.65rem;
  }
}
`;

if (!css.includes('Hero Cyber Card Satellite HUD Responsive Overrides')) {
  css += responsiveSnippet;
  fs.writeFileSync('c:/React/vikram-portfolio/src/styles/index.css', css, 'utf8');
  console.log('Appended responsive overrides to index.css!');
} else {
  console.log('Responsive overrides already present');
}
