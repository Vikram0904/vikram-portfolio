/**
 * VIKRAM.DEV — WebGL Particle Mosaic Canvas
 *
 * Implements the signature cinematic effect from reference:
 * Thousands of glowing particles/dots float in the air, then gather and connect
 * together to dynamically assemble Vikram's portrait.
 *
 * Architecture:
 * - Samples brightness & alpha from Vikram's avatar.
 * - Computes floating "air" positions drifting across space with subtle sinusoids.
 * - Glides each particle along an eased organic arc into its "home" pixel coordinate.
 * - Twinkles with ambient lighting and copper/white tinting matching brand palette.
 * - Interactive pointer response (cursor gently parts adjacent particles).
 */

import { gsap } from 'gsap';

export class ParticleMosaic {
  constructor(options = {}) {
    this.canvas = options.canvas;
    this.anchorEl = options.anchorEl;
    this.imgSrc = options.imgSrc;
    this.onReady = options.onReady;
    this.startTime = null;
    this.isPlaying = false;
    this.gl = null;
    this.program = null;
    this.vao = null;
    this.buffers = [];
    this.uniforms = {};
    this.particleCount = 0;
    this.cellPitch = 5.0;
    this.settleTime = 1.8;
    this.scatterProgress = 0.0;
    this.imgData = null;
    this.rafId = null;
    this.mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    this.cachedWidth = -1;
    this.isDestroyed = false;

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.render = this.render.bind(this);
  }

  init() {
    if (!this.canvas || !this.anchorEl) return;

    const gl = this.canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false
    });

    if (!gl) {
      console.warn('[ParticleMosaic] WebGL2 not supported; falling back to static portrait.');
      if (this.anchorEl) this.anchorEl.style.opacity = '1';
      return;
    }
    this.gl = gl;

    // Shaders
    const vsSource = `#version 300 es
    precision highp float;

    in vec2 aHome;   // 0..1 inside the anchor rect
    in vec3 aAir;    // x,y 0..1 over the canvas, z = depth (0 near, 1 far)
    in vec4 aInfo;   // brightness, delay, duration, phase
    in vec3 aCell;   // kind (0 tile/dot, 1 dust speck)

    uniform vec2 uRes;       // canvas CSS px
    uniform vec4 uRect;      // anchor x, y, w, h in canvas CSS px
    uniform float uCell;     // tile pitch CSS px
    uniform float uDpr;
    uniform float uTime;     // elapsed seconds
    uniform float uReveal;   // seconds since play start
    uniform float uScatter;  // 0 = assembled portrait, 1 = cosmic dismantle explosion
    uniform vec2 uMouse;     // mouse in CSS px

    out float vBright;
    out float vLand;
    out float vAlpha;
    out float vPhase;
    out float vKind;

    float inOut(float t) {
      return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
    }

    void main() {
      float bright = aInfo.x;
      float delay  = aInfo.y;
      float dur    = aInfo.z;
      float phase  = aInfo.w;
      float depth  = aAir.z;
      bool dust    = aCell.z > 0.5;

      // Air drifting floating coordinates
      vec2 drift = vec2(sin(uTime * 0.45 + phase * 6.283), cos(uTime * 0.35 + phase * 9.1))
                 * (8.0 + 24.0 * (1.0 - depth));
      vec2 air  = aAir.xy * uRes + drift;
      vec2 home = uRect.xy + aHome * uRect.zw;

      // Staggered reveal & flight home
      float appear = smoothstep(0.0, 0.45, uReveal - delay * 0.3);
      float fly    = dust ? 0.0 : clamp((uReveal - delay) / dur, 0.0, 1.0);
      float e      = inOut(fly);

      // --- COSMIC DISMANTLE & SCATTER (Aigent + Superbien style disassembly) ---
      // Stagger each dot's dismantle departure using its unique phase and position
      float scatterDelay = phase * 0.25 + (1.0 - aHome.y) * 0.20;
      float sProgress = clamp((uScatter - scatterDelay) / 0.55, 0.0, 1.0);
      float sCurve = sProgress * sProgress * (3.0 - 2.0 * sProgress); // smoothstep curve

      // Radial blast direction outward from image center + curl swirl
      vec2 center = uRect.xy + vec2(0.5, 0.45) * uRect.zw;
      vec2 radDir = home - center;
      float distFromCenter = length(radDir);
      vec2 normDir = distFromCenter > 0.001 ? normalize(radDir) : vec2(0.0, 1.0);
      vec2 tangent = vec2(-normDir.y, normDir.x) * (phase - 0.5) * 2.0;

      // Blast distance expands far into outer space across entire screen
      float blastDist = 320.0 + 850.0 * (1.0 - depth * 0.5);
      float swirl = (phase - 0.5) * 360.0;
      vec2 scatterOffset = (normDir * blastDist + tangent * swirl) * sCurve;

      // Base assembled coordinate
      vec2 pos = mix(air, home, e);

      // Organic flight trajectory
      vec2 d = home - air;
      pos += vec2(-d.y, d.x) * 0.22 * sin(3.14159 * e) * (phase - 0.5);

      // Apply dismantle displacement
      pos += scatterOffset;

      // Interactive cursor parting
      vec2 m = pos - uMouse;
      float ml = length(m);
      pos += (ml > 0.001 ? m / ml : vec2(0.0)) * smoothstep(90.0, 0.0, ml) * 18.0 * e;

      float land  = smoothstep(0.6, 1.0, e) * (1.0 - sProgress);
      float speck = mix(2.6, 1.2, depth);
      float tile  = uCell * (0.35 + 0.65 * bright);
      float size  = mix(speck, tile, land) * (1.0 + sCurve * 1.0); // radiant flare during burst

      float dustA = dust ? mix(0.5, 0.15, smoothstep(1.5, 3.0, uReveal)) : 1.0;
      float scatterFade = 1.0 - smoothstep(0.65, 1.0, sProgress);
      vAlpha  = appear * mix(0.35 + 0.65 * (1.0 - depth), 1.0, land) * dustA * scatterFade;
      vBright = bright;
      vLand   = land;
      vPhase  = phase;
      vKind   = aCell.z;

      vec2 clip = pos / uRes * 2.0 - 1.0;
      gl_Position  = vec4(clip.x, -clip.y, 0.0, 1.0);
      gl_PointSize = max(size * uDpr, 1.0);
    }`;

    const fsSource = `#version 300 es
    precision highp float;

    uniform float uTime;

    in float vBright;
    in float vLand;
    in float vAlpha;
    in float vPhase;
    in float vKind;
    out vec4 outColor;

    void main() {
      // Soft round circular point/dot
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;

      float radialSoft = smoothstep(0.5, 0.15, dist);

      // Brand copper (#FF6B35 = vec3(1.0, 0.42, 0.21)) & crisp white highlights
      vec3 copper = vec3(1.0, 0.42, 0.208);
      vec3 white  = vec3(1.0, 1.0, 1.0);
      vec3 deep   = vec3(0.92, 0.94, 1.0);

      // Twinkle ambient shimmer
      float twinkle = 0.88 + 0.12 * sin(uTime * 2.2 + vPhase * 40.0);

      // Interpolate between copper accents and luminous skin/hair values
      vec3 tile = mix(deep, copper, 0.32);
      tile = mix(tile, white, vBright * 0.7);
      tile *= (0.2 + 0.95 * vBright) * twinkle;

      vec3 speck = mix(vec3(0.85, 0.9, 1.0), copper, 0.4);
      vec3 rgb = mix(speck, tile, vLand);

      float finalAlpha = vAlpha * radialSoft;
      outColor = vec4(rgb * finalAlpha, finalAlpha);
    }`;

    try {
      this.program = this.createProgram(gl, vsSource, fsSource);
    } catch (e) {
      console.error('[ParticleMosaic] Program compilation failed:', e);
      if (this.anchorEl) this.anchorEl.style.opacity = '1';
      return;
    }

    gl.useProgram(this.program);

    this.uniforms = {
      res: gl.getUniformLocation(this.program, 'uRes'),
      rect: gl.getUniformLocation(this.program, 'uRect'),
      cell: gl.getUniformLocation(this.program, 'uCell'),
      dpr: gl.getUniformLocation(this.program, 'uDpr'),
      time: gl.getUniformLocation(this.program, 'uTime'),
      reveal: gl.getUniformLocation(this.program, 'uReveal'),
      scatter: gl.getUniformLocation(this.program, 'uScatter'),
      mouse: gl.getUniformLocation(this.program, 'uMouse')
    };

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    const attribs = ['aHome', 'aAir', 'aInfo', 'aCell'];
    const sizes = [2, 3, 4, 3];
    this.buffers = attribs.map((name, i) => {
      const buf = gl.createBuffer();
      const loc = gl.getAttribLocation(this.program, name);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, sizes[i], gl.FLOAT, false, 0, 0);
      return buf;
    });

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // Event listeners
    window.addEventListener('pointermove', this.onMouseMove, { passive: true });
    document.addEventListener('pointerleave', this.onMouseLeave, { passive: true });

    // Load Image and sample points
    this.loadImage(this.imgSrc).then((img) => {
      if (this.isDestroyed) return;
      this.imgData = img;
      this.buildParticles();
      if (typeof this.onReady === 'function') this.onReady();
    }).catch((err) => {
      console.warn('[ParticleMosaic] Image load error:', err);
      if (this.anchorEl) this.anchorEl.style.opacity = '1';
    });
  }

  createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(log || 'Shader compilation error');
    }
    return shader;
  }

  createProgram(gl, vsSource, fsSource) {
    const vs = this.createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = this.createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(log || 'Program linking error');
    }
    return program;
  }

  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  buildParticles() {
    if (!this.imgData || !this.gl || !this.anchorEl) return;

    const rect = this.anchorEl.getBoundingClientRect();
    const width = rect.width || 360;
    if (width < 20 || Math.abs(width - this.cachedWidth) < 2) return;
    this.cachedWidth = width;

    // Pitch determination: ~3.5 to 5.5px depending on screen
    const cell = Math.min(5.5, Math.max(3.2, width / 180));
    this.cellPitch = cell;

    const cols = Math.max(25, Math.round(width / cell));
    const rows = Math.round(cols * (this.imgData.naturalHeight / this.imgData.naturalWidth));

    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = cols;
    sampleCanvas.height = rows;
    const ctx = sampleCanvas.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(this.imgData, 0, 0, cols, rows);

    const pixels = ctx.getImageData(0, 0, cols, rows).data;
    const homeArr = [];
    const airArr = [];
    const infoArr = [];
    const cellArr = [];

    let maxFlightTime = 0;

    const addParticle = (hx, hy, bright, isDust = false) => {
      homeArr.push(hx, hy);
      // Random starting point in ambient space
      airArr.push(
        Math.random() * 1.3 - 0.15,
        Math.random() * 1.3 - 0.15,
        Math.random()
      );
      // Delay (0.2s - 1.6s), Duration (1.7s - 2.5s), Phase (0..1)
      const delay = 0.2 + Math.random() * 0.9 + hy * 0.5;
      const duration = 1.7 + Math.random() * 0.7;
      if (!isDust) {
        maxFlightTime = Math.max(maxFlightTime, delay + duration);
      }
      infoArr.push(bright, delay, duration, Math.random());
      cellArr.push(0, 0, isDust ? 1 : 0);
    };

    // Extract brightness & sample points where alpha > threshold
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = (r * cols + c) * 4;
        const alpha = pixels[idx + 3] / 255;
        if (alpha < 0.1) continue;

        // Relative luminance
        const lum = (0.2126 * pixels[idx] + 0.7152 * pixels[idx + 1] + 0.0722 * pixels[idx + 2]) / 255 * alpha;
        if (lum < 0.03) continue;

        const hx = (c + 0.5) / cols;
        const hy = (r + 0.5) / rows;
        addParticle(hx, hy, lum, false);
      }
    }

    // Add 8% ambient floating dust specks
    const dustCount = Math.round(homeArr.length / 2 * 0.08);
    for (let i = 0; i < dustCount; i++) {
      addParticle(0.5, 0.5, 0.35, true);
    }

    this.particleCount = homeArr.length / 2;
    this.settleTime = maxFlightTime;

    const gl = this.gl;
    const dataList = [
      new Float32Array(homeArr),
      new Float32Array(airArr),
      new Float32Array(infoArr),
      new Float32Array(cellArr)
    ];

    dataList.forEach((arr, i) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[i]);
      gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
    });
  }

  play() {
    this.isPlaying = true;
    this.startTime = performance.now() / 1000;
    if (this.anchorEl) {
      // Hide static img while particles fly
      this.anchorEl.style.opacity = '0';
    }
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(this.render);
    }
  }

  onMouseMove(e) {
    if (!this.canvas) return;
    const r = this.canvas.getBoundingClientRect();
    this.mouse.tx = e.clientX - r.left;
    this.mouse.ty = e.clientY - r.top;
    if (this.mouse.x < -900) {
      this.mouse.x = this.mouse.tx;
      this.mouse.y = this.mouse.ty;
    }
  }

  onMouseLeave() {
    this.mouse.tx = -9999;
    this.mouse.ty = -9999;
  }

  render() {
    if (this.isDestroyed) return;

    const gl = this.gl;
    if (!gl || !this.particleCount || this.startTime === null) {
      this.rafId = requestAnimationFrame(this.render);
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const canvasRect = this.canvas.getBoundingClientRect();
    const pixelWidth = Math.round(canvasRect.width * dpr);
    const pixelHeight = Math.round(canvasRect.height * dpr);

    if (this.canvas.width !== pixelWidth || this.canvas.height !== pixelHeight) {
      this.canvas.width = pixelWidth;
      this.canvas.height = pixelHeight;
    }

    this.buildParticles();

    const anchorRect = this.anchorEl.getBoundingClientRect();
    const now = performance.now() / 1000;
    const elapsedReveal = now - this.startTime;

    // Smooth cursor movement
    this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.18;
    this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.18;

    gl.viewport(0, 0, pixelWidth, pixelHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);
    gl.uniform2f(this.uniforms.res, canvasRect.width, canvasRect.height);
    gl.uniform4f(
      this.uniforms.rect,
      anchorRect.left - canvasRect.left,
      anchorRect.top - canvasRect.top,
      anchorRect.width,
      anchorRect.height
    );
    gl.uniform1f(this.uniforms.cell, this.cellPitch);
    gl.uniform1f(this.uniforms.dpr, dpr);
    gl.uniform1f(this.uniforms.time, elapsedReveal);
    gl.uniform1f(this.uniforms.reveal, elapsedReveal);
    gl.uniform1f(this.uniforms.scatter, this.scatterProgress);
    gl.uniform2f(this.uniforms.mouse, this.mouse.x, this.mouse.y);

    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.POINTS, 0, this.particleCount);

    // Keep anchor element at 0 opacity so the dots remain purely WebGL particles
    // and can dismantle/scatter smoothly into space without a static image behind them
    if (this.anchorEl && this.anchorEl.style.opacity !== '0') {
      this.anchorEl.style.opacity = '0';
    }

    this.rafId = requestAnimationFrame(this.render);
  }

  /**
   * Cosmic dismantle: Particles scatter radially outward and dissolve into space (AigentX + Superbien style)
   */
  dismantle(duration = 1.4) {
    if (this.anchorEl) {
      this.anchorEl.style.opacity = '0';
    }
    return gsap.to(this, {
      scatterProgress: 1.0,
      duration: duration,
      ease: 'power2.inOut'
    });
  }

  destroy() {
    this.isDestroyed = true;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    window.removeEventListener('pointermove', this.onMouseMove);
    document.removeEventListener('pointerleave', this.onMouseLeave);

    if (this.gl) {
      this.buffers.forEach((b) => this.gl.deleteBuffer(b));
      if (this.vao) this.gl.deleteVertexArray(this.vao);
      if (this.program) this.gl.deleteProgram(this.program);
    }
  }
}
