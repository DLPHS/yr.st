let sketch_bg = function(p) {
  let shader;
  let texture;
  let tileImg;
  let mousePos = { x: 0, y: 0 };
  let mouseVel = { x: 0, y: 0 };
  let prevMouse = { x: 0, y: 0 };
  let rawMouse = { x: 0, y: 0 };

  const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 768);

  // Track mouse globally to avoid p5 canvas offset issues
  document.addEventListener('mousemove', function(e) {
    rawMouse.x = e.clientX;
    rawMouse.y = e.clientY;
  });

  let vertex_shader = `
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  varying vec2 vTexCoord;

  void main() {
    vTexCoord = aTexCoord;
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
  }
  `;

  let fragment_shader = `
  precision mediump float;

  varying vec2 vTexCoord;
  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform vec2 uMousePos;
  uniform vec2 uMouseVel;
  uniform float uIsMobile;

  // Simplex 2D noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                     + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                            dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vTexCoord;

    // Base noise displacement
    float time = uTime * 0.5;
    float noiseScale = 3.0;
    float noiseX = snoise(vec2(uv.x * noiseScale + time * 0.1, uv.y * noiseScale + time * 0.05));
    float noiseY = snoise(vec2(uv.x * noiseScale - time * 0.05, uv.y * noiseScale + time * 0.1));

    vec2 displacement = vec2(noiseX, noiseY) * 0.015;

    // Mouse interaction (desktop only)
    if (uIsMobile < 0.5) {
      vec2 mouseUV = uMousePos / uResolution;

      float dist = distance(uv, mouseUV);
      float radius = 0.25;

      if (dist < radius) {
        float strength = 1.0 - (dist / radius);
        strength = strength * strength * strength;

        // Velocity-based ripple
        vec2 velNorm = normalize(uMouseVel + vec2(0.001));
        float velMag = length(uMouseVel) * 0.0003;

        // Circular ripple from mouse
        vec2 dir = normalize(uv - mouseUV);
        float ripple = sin(dist * 40.0 - uTime * 3.0) * 0.5 + 0.5;

        displacement += dir * strength * ripple * 0.03;
        displacement += velNorm * strength * velMag;
      }
    }

    vec2 finalUV = uv + displacement;
    vec4 color = texture2D(uTexture, clamp(finalUV, 0.0, 1.0));

    gl_FragColor = color;
  }
  `;

  function buildTiledTexture() {
    let gridSize = 90;
    let imgSize = 150;
    let offset = (imgSize - gridSize) / 2;
    let cols = Math.ceil(p.width / gridSize) + 2;
    let rows = Math.ceil(p.height / gridSize) + 2;
    let buf = p.createGraphics(p.width, p.height);
    for (let row = 0; row < rows; row++) {
      let offsetX = (row % 3) * (gridSize / 3);
      for (let col = -1; col < cols; col++) {
        buf.image(tileImg, col * gridSize + offsetX - offset, row * gridSize - offset, imgSize, imgSize);
      }
    }
    return buf;
  }

  p.setup = function() {
    let canvas = p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    canvas.parent('overlay');
    p.pixelDensity(1);
    shader = p.createShader(vertex_shader, fragment_shader);
    texture = buildTiledTexture();
    p.noStroke();
  };

  p.preload = function() {
    tileImg = p.loadImage('src/assets/cross-pattern-single.png');
  };

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    texture = buildTiledTexture();
  };

  p.draw = function() {
    p.clear();

    // Update mouse velocity
    mouseVel.x = rawMouse.x - prevMouse.x;
    mouseVel.y = rawMouse.y - prevMouse.y;
    prevMouse.x = rawMouse.x;
    prevMouse.y = rawMouse.y;

    // Use raw mouse position directly (no smoothing for accurate cursor alignment)
    mousePos.x = rawMouse.x;
    mousePos.y = rawMouse.y;

    p.shader(shader);
    shader.setUniform('uTexture', texture);
    shader.setUniform('uResolution', [p.width, p.height]);
    shader.setUniform('uTime', p.millis() * 0.001);
    shader.setUniform('uMousePos', [mousePos.x, mousePos.y]);
    shader.setUniform('uMouseVel', [mouseVel.x * 0.15, mouseVel.y * 0.15]);
    shader.setUniform('uIsMobile', isMobile ? 1.0 : 0.0);

    p.noStroke();
    p.plane(p.width, p.height);
  };
};

let bg_p5 = new p5(sketch_bg);
