const fs = require('fs');
let html = fs.readFileSync('c:/React/vikram-portfolio/index.html', 'utf8');

const startIndex = html.indexOf('<!-- Cyberpunk 3D HUD Portrait Column -->');
const endIndex = html.indexOf('<!-- Scroll Cue Indicator -->');

if (startIndex !== -1 && endIndex !== -1) {
  const newHeroColumn = `<!-- Cyberpunk 3D HUD Portrait Column -->
        <div class="hero-visual-wrap">
          <div class="hero-cyber-card" id="hero-tilt-card">
            
            <!-- Cyber Outer Frame / Tech Borders -->
            <div class="cyber-frame" aria-hidden="true">
              <!-- Corner Brackets -->
              <div class="cyber-corner corner-tl"></div>
              <div class="cyber-corner corner-tr"></div>
              <div class="cyber-corner corner-bl"></div>
              <div class="cyber-corner corner-br"></div>
              
              <!-- Neon Dual Border Glow Overlay -->
              <div class="cyber-neon-border"></div>
            </div>

            <!-- Transparent Holographic Card Body (Allows 3D wireframe mesh to pass through) -->
            <div class="cyber-card-body">
              <!-- Soft Atmospheric Rim Glows -->
              <div class="cyber-glow-orange" aria-hidden="true"></div>
              <div class="cyber-glow-cyan" aria-hidden="true"></div>
              <div class="cyber-bg-pattern" aria-hidden="true"></div>

              <!-- Vikram Enhanced High-Res Cutout Portrait -->
              <img src="/assets/vikramdev-enhanced.png" alt="S Vikram - WordPress & AI Developer" class="cyber-portrait-img" />

              <!-- Bottom Vignette Fade so arms integrate smoothly with base frame -->
              <div class="cyber-portrait-fade" aria-hidden="true"></div>
            </div>

            <!-- Floating Orbital Glassmorphic HUD Badges (Positioned cleanly outside image silhouette) -->
            <!-- Badge 1: Top Left - WordPress Specialist (Floating in upper-left negative space) -->
            <div class="hud-badge badge-wp">
              <div class="hud-badge-icon wp-bg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.158 12.786l-2.698 7.84c.806.236 1.657.364 2.54.364 2.44 0 4.64-.99 6.233-2.59l-4.14-11.36-.002.002-1.933 5.744zm-6.28-1.528c0 2.227.818 4.263 2.164 5.835L4.47 7.766A9.914 9.914 0 005.878 11.258zm12.333-5.263c.692.936 1.107 2.096 1.107 3.35 0 1.29-.44 2.476-1.18 3.42l-3.328-9.452a9.92 9.92 0 013.401 2.682zM12 2a10 10 0 100 20 10 10 0 000-20zm0 1.5a8.49 8.49 0 015.657 2.158L12.44 18.09 9.382 9.243l-.403-1.168A8.47 8.47 0 0112 3.5z"/>
                </svg>
              </div>
              <div class="hud-badge-text">
                <span class="hud-title">WordPress Developer</span>
                <span class="hud-sub">Custom Themes & Plugins</span>
              </div>
            </div>

            <!-- Badge 2: Top Right - AI Integration (Floating in upper-right negative space) -->
            <div class="hud-badge badge-ai">
              <div class="hud-badge-icon ai-bg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00F0FF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="3" />
                  <rect x="9" y="9" width="6" height="6" rx="1" />
                  <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
                </svg>
              </div>
              <div class="hud-badge-text">
                <span class="hud-title">AI Integration</span>
                <span class="hud-sub">ChatGPT • API • MCP</span>
              </div>
            </div>

            <!-- Badge 3: Bottom Dock - Full Stack Architecture (Docked underneath arms with 0% body overlap) -->
            <div class="hud-badge badge-fullstack">
              <div class="hud-status-indicator">
                <span class="status-pulse-dot"></span>
              </div>
              <div class="hud-badge-text">
                <span class="hud-title">Full Stack Developer</span>
                <span class="hud-sub">React • PHP • JS • MySQL</span>
              </div>
            </div>

            <!-- Ambient Card Backglow -->
            <div class="hero-cyber-ambient-glow" aria-hidden="true"></div>
          </div>
        </div>
      </div>

      `;

  html = html.substring(0, startIndex) + newHeroColumn + html.substring(endIndex);
  fs.writeFileSync('c:/React/vikram-portfolio/index.html', html, 'utf8');
  console.log('Successfully updated index.html!');
} else {
  console.log('Indices not found:', startIndex, endIndex);
}
