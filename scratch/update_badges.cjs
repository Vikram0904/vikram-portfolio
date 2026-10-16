const fs = require('fs');
let css = fs.readFileSync('c:/React/vikram-portfolio/src/styles/index.css', 'utf8');

// Replace badge-wp, badge-ai, badge-fullstack rules
css = css.replace(
  /\.badge-wp\s*\{[^}]+\}/,
  `.badge-wp {
  top: 3%;
  left: -32px;
  border: 1px solid rgba(0, 240, 255, 0.45);
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.75), 0 0 18px rgba(0, 240, 255, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.2);
  animation: floatBadge1 4.5s ease-in-out infinite;
}`
);

css = css.replace(
  /\.badge-ai\s*\{[^}]+\}/,
  `.badge-ai {
  top: 4%;
  right: -32px;
  border: 1px solid rgba(0, 240, 255, 0.45);
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.75), 0 0 18px rgba(0, 240, 255, 0.16), inset 0 1px 1px rgba(255, 255, 255, 0.2);
  animation: floatBadge2 4.8s ease-in-out infinite 0.6s;
}`
);

css = css.replace(
  /\.badge-fullstack\s*\{[^}]+\}/,
  `.badge-fullstack {
  bottom: -28px;
  left: 50%;
  transform: translateX(-50%);
  border: 1px solid rgba(255, 107, 53, 0.55);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 107, 53, 0.22), inset 0 1px 1px rgba(255, 255, 255, 0.18);
  animation: floatBadge3 5s ease-in-out infinite 1.2s;
  white-space: nowrap;
}`
);

// Scale portrait to 92% for comfortable breathing room
css = css.replace(
  'width: 96%;\n  height: 96%;',
  'width: 92%;\n  height: 92%;'
);

// Update responsive rules at the end of file
const respStart = css.indexOf('/* Hero Cyber Card Satellite HUD Responsive Overrides */');
if (respStart !== -1) {
  css = css.substring(0, respStart);
}

css += `/* Hero Cyber Card Satellite HUD Responsive Overrides */
@media (max-width: 1200px) {
  .badge-wp { left: -10px; top: 2%; }
  .badge-ai { right: -10px; top: 3%; }
  .badge-fullstack { bottom: -24px; }
}

@media (max-width: 640px) {
  .hero-cyber-card {
    max-width: 350px;
    height: 430px;
  }
  .badge-wp {
    top: -12px;
    left: 8px;
    padding: 0.45rem 0.8rem;
  }
  .badge-ai {
    top: -12px;
    right: 8px;
    padding: 0.45rem 0.8rem;
  }
  .badge-fullstack {
    bottom: -22px;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 24px);
    max-width: 310px;
    justify-content: center;
    padding: 0.45rem 0.85rem;
  }
  .hud-title {
    font-size: 0.78rem;
  }
  .hud-sub {
    font-size: 0.65rem;
  }
}
`;

fs.writeFileSync('c:/React/vikram-portfolio/src/styles/index.css', css, 'utf8');
console.log('Successfully updated badge positions for zero overlap!');
