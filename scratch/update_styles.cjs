const fs = require('fs');
let css = fs.readFileSync('c:/React/vikram-portfolio/src/styles/index.css', 'utf8');

const startMarker = '/* Main Card Body Container */';
const endMarker = '/* Scroll Cue */';

const startIndex = css.indexOf(startMarker);
const endIndex = css.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const newStyles = `/* Main Card Body Container - Transparent Holographic Viewport */
.cyber-card-body {
  position: absolute;
  inset: 2px;
  background: linear-gradient(
    155deg,
    rgba(10, 16, 28, 0.12) 0%,
    rgba(5, 8, 16, 0.04) 40%,
    rgba(10, 16, 28, 0.18) 100%
  );
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  clip-path: polygon(
    27px 0,
    calc(100% - 27px) 0,
    100% 27px,
    100% calc(100% - 27px),
    calc(100% - 27px) 100%,
    27px 100%,
    0 calc(100% - 27px),
    0 27px
  );
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  box-shadow: 
    0 25px 60px rgba(0, 0, 0, 0.45),
    inset 0 1px 1px rgba(255, 255, 255, 0.12),
    inset 0 0 20px rgba(0, 240, 255, 0.05);
}

/* Atmospheric Delicate Rim Glows (Screen blend so 3D wireframe mesh remains crystal clear) */
.cyber-glow-orange {
  position: absolute;
  bottom: -5%;
  left: -10%;
  width: 65%;
  height: 65%;
  background: radial-gradient(circle, rgba(255, 107, 53, 0.28) 0%, rgba(255, 158, 0, 0.1) 40%, transparent 70%);
  filter: blur(40px);
  mix-blend-mode: screen;
  pointer-events: none;
  z-index: 1;
}

.cyber-glow-cyan {
  position: absolute;
  top: -5%;
  right: -10%;
  width: 65%;
  height: 65%;
  background: radial-gradient(circle, rgba(0, 240, 255, 0.24) 0%, rgba(0, 180, 216, 0.08) 45%, transparent 70%);
  filter: blur(40px);
  mix-blend-mode: screen;
  pointer-events: none;
  z-index: 1;
}

.cyber-bg-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 26px 26px;
  opacity: 0.15;
  pointer-events: none;
  z-index: 2;
}

/* Portrait Cutout Image - Enhanced Resolution */
.cyber-portrait-img {
  position: relative;
  z-index: 5;
  width: 96%;
  height: 96%;
  object-fit: contain;
  object-position: bottom center;
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.85)) contrast(1.05) brightness(1.02);
  transition: transform 0.5s var(--ease-out-expo);
  pointer-events: none;
}

.hero-cyber-card:hover .cyber-portrait-img {
  transform: scale(1.02) translateY(-2px);
}

/* Bottom Vignette Blend */
.cyber-portrait-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 65px;
  background: linear-gradient(to bottom, transparent 0%, rgba(6, 9, 18, 0.8) 100%);
  pointer-events: none;
  z-index: 6;
}

/* Floating Satellite Glassmorphic HUD Badges - Zero Overlap on Subject */
.hud-badge {
  position: absolute;
  z-index: 25;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1.15rem;
  background: rgba(8, 12, 22, 0.84);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 14px;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.15);
  transition: transform 0.35s var(--ease-out-expo), box-shadow 0.35s ease, border-color 0.35s ease;
  pointer-events: auto;
  transform-style: preserve-3d;
}

.hud-badge:hover {
  transform: translateY(-4px) scale(1.04) !important;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.82), inset 0 1px 2px rgba(255, 255, 255, 0.25);
}

.hud-badge-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.hud-title {
  font-family: var(--font-display);
  font-size: 0.88rem;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.hud-sub {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-muted);
  letter-spacing: 0.02em;
  white-space: nowrap;
}

/* Badge 1: Top Left - Floating in open negative space above left shoulder */
.badge-wp {
  top: 7%;
  left: -32px;
  border: 1px solid rgba(0, 240, 255, 0.45);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.7), 0 0 18px rgba(0, 240, 255, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2);
  animation: floatBadge1 4.5s ease-in-out infinite;
}

.wp-bg {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00C6FF 0%, #0072FF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  box-shadow: 0 0 12px rgba(0, 198, 255, 0.5);
  flex-shrink: 0;
}

/* Badge 2: Top Right - Floating in open negative space above right shoulder */
.badge-ai {
  top: 14%;
  right: -28px;
  border: 1px solid rgba(0, 240, 255, 0.45);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.7), 0 0 18px rgba(0, 240, 255, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.2);
  animation: floatBadge2 4.8s ease-in-out infinite 0.6s;
}

.badge-ai .hud-sub {
  color: #00F0FF;
  font-weight: 600;
}

.ai-bg {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(0, 240, 255, 0.12);
  border: 1px solid rgba(0, 240, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00F0FF;
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.3);
  flex-shrink: 0;
}

/* Badge 3: Bottom Dock - Symmetrically anchored underneath forearms, 0% overlap on arms */
.badge-fullstack {
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  border: 1px solid rgba(255, 107, 53, 0.5);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.75), 0 0 20px rgba(255, 107, 53, 0.22), inset 0 1px 1px rgba(255, 255, 255, 0.15);
  animation: floatBadge3 5s ease-in-out infinite 1.2s;
  white-space: nowrap;
}

.badge-fullstack .hud-sub {
  color: #FF8A48;
}

.hud-status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255, 107, 53, 0.12);
  border: 1px solid rgba(255, 107, 53, 0.4);
  flex-shrink: 0;
}

.status-pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #FF6B35;
  box-shadow: 0 0 8px #FF6B35;
  animation: pulseStatus 2s infinite ease-in-out;
}

@keyframes pulseStatus {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.35); opacity: 0.6; }
}

/* Ambient Outer Card Backglow */
.hero-cyber-ambient-glow {
  position: absolute;
  top: -8%;
  left: -8%;
  right: -8%;
  bottom: -8%;
  background: radial-gradient(circle at 75% 25%, rgba(0, 240, 255, 0.22) 0%, rgba(255, 107, 53, 0.22) 60%, transparent 80%);
  z-index: -1;
  filter: blur(55px);
  opacity: 0.8;
  pointer-events: none;
}

/* Floating Keyframe Animations for HUD Badges */
@keyframes floatBadge1 {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-7px); }
}

@keyframes floatBadge2 {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

@keyframes floatBadge3 {
  0%, 100% { transform: translateX(-50%) translateY(0px); }
  50% { transform: translateX(-50%) translateY(-6px); }
}

`;

  css = css.substring(0, startIndex) + newStyles + css.substring(endIndex);
  fs.writeFileSync('c:/React/vikram-portfolio/src/styles/index.css', css, 'utf8');
  console.log('Successfully updated index.css hero card styles!');
} else {
  console.log('Markers not found in index.css:', startIndex, endIndex);
}
