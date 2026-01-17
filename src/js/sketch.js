let sketch_obj = function(p){
  let obj;
  let texture;
  let shader;
  let s_rot = 0;
  let r_speed = 0.0025;
  p.setup = function(){
    p.createCanvas(p.windowWidth,p.windowHeight,p.WEBGL);
    p.angleMode(p.DEGREES);
  };
  p.preload = function(){
    obj = p.loadModel('src/assets/ch.obj');
    texture = p.loadImage('src/assets/texture.png');
    shader = p.loadShader('src/glsl/lighting.vert','src/glsl/lighting.frag');
  }
  p.windowResized = function(){
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  }

  p.draw = function(){
    p.clear();
    let baseSize = Math.min(p.width, p.height);
    let scaleFactor = baseSize * 0.075;

    p.push();
    p.translate(0, scaleFactor * 2, -50);
    p.rotateX(90);
    p.noStroke();
    p.fill(0, 0, 0, 30);
    p.ellipse(0, 0, scaleFactor * 2.67, scaleFactor * 1.07);
    p.pop();

    p.push();
    p.translate(0,0,0);
    //p.rotateWithFrameCount(100);
    p.rotateHalf();
    p.rotateZ(90);
    p.rotateY(90);
    let r_pos = (p.mouseY - p.height/2 - p.height/5) * 0.085;
    if (r_pos > 1.9){
      r_pos = 1.9;
    }
    p.rotateX(r_pos);

    p.texture(texture);
    p.noStroke();
    p.scale(scaleFactor);
    p.model(obj);
    p.pop();
  }
  p.rotateWithFrameCount = function(offset){
    p.rotateY(p.frameCount - offset);
  }
  p.rotateHalf = function(){
    p.rotateY(((Math.sin(s_rot) * 150) - 190) * -0.46);
    s_rot += r_speed;
  }
}

let sketch_misc = function(p){
  let isHovered = false;

  let vertex_shader = `
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  varying vec2 vTexCoord;
  
  void main(){
    vTexCoord = aTexCoord;
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
  }
  `;

  let fragment_shader = `
  precision mediump float;
  
  uniform sampler2D uTexture;
  uniform vec2 resolution;
  uniform float pixelSize;
  varying vec2 vTexCoord;

  void main(){
    // this pixelated the texture on the geometry.
    //vec2 uv = vTexCoord;
    //float dx = pixelSize/resolution.x;
    //float dy = pixelSize/resolution.y;
    //vec2 pixelatedUV = vec2(dx * floor(uv.x/dx), dy * floor(uv.y/dy));
    vec2 pixelCoord = floor(vTexCoord * resolution /pixelSize) * pixelSize / resolution;
    
    vec4 color = texture2D(uTexture, pixelCoord);

    gl_FragColor = color;
  }
  `;
  let pg;
  const m_scale = 0.0015;
  let basePixel;
  let pixelSize;
  let obj;
  let texture;
  let shader;
  let h_scale = 1;
  p.setup = function(){
    let container = document.getElementById('canvas-container-misc');
    basePixel = Math.max(3, Math.min(p.windowWidth, p.windowHeight) * 0.000082);
    pixelSize = basePixel;
    let w = container.offsetWidth || p.windowWidth;
    let h = container.offsetHeight || p.windowHeight;
    p.createCanvas(w, h, p.WEBGL);
    p.angleMode(p.DEGREES);
    shader = p.createShader(vertex_shader, fragment_shader);
    pg = p.createGraphics(p.width, p.height, p.WEBGL);
    p.noStroke();
  };
  p.preload = function(){
    texture = p.loadImage('src/assets/texture.png');
  }
  p.windowResized = function(){
    let container = document.getElementById('canvas-container-misc');
    let w = container.offsetWidth || p.windowWidth;
    let h = container.offsetHeight || p.windowHeight;
    p.resizeCanvas(w, h);
    pg = p.createGraphics(p.width, p.height, p.WEBGL);
    basePixel = Math.max(3, Math.min(p.width, p.height) * 0.006);
    pixelSize = basePixel;
  }

  p.draw = function(){
    if (isHovered) {
      p.animate_hover_in();
    } else {
      p.animate_hover_out();
    }

    pg.clear()
    pg.push();
    pg.texture(texture);
    pg.noStroke();
    let size = Math.min(p.width, p.height) * 0.75;
    let half = size / 2;
    pg.scale(h_scale);
    pg.rotateY((p.mouseX - p.width/2)* m_scale);
    pg.rotateX(((p.mouseY - p.height/2) * m_scale) * -1);
    pg.quad(-half, -half, half, -half, half, half, -half, half);
    pg.pop();
    p.clear();
    p.push();
    p.shader(shader);
    shader.setUniform('uTexture', pg);
    shader.setUniform('resolution', [p.width, p.height]);
    shader.setUniform('pixelSize', pixelSize);
    p.quad(
      -p.width/2,-p.height/2,
      p.width/2,-p.height/2,
      p.width/2,p.height/2,
      -p.width/2,p.height/2
    );
    p.pop();
  }
  p.rotateWithFrameCount = function(offset){
    p.rotateY(p.frameCount - offset);
  }

  p.checkHover = function(){
    let mx = p.mouseX - p.width/2;
    let my = p.mouseY - p.height/2;
    let half = Math.min(p.width, p.height) * 0.75 / 2;

    let angle = p.radians(p.frameCount - 2);
    let cosA = Math.cos(angle);

    let rotatedX = mx / cosA;

    if (Math.abs(cosA) > 0.1) {
      isHovered = Math.abs(rotatedX) < half && Math.abs(my) < half;
    } else {
      isHovered = false;
    }
    return isHovered;
  }

  p.onHover = function(){
    pixelSize = 1;
  }

  p.onHoverOut = function(){
    pixelSize = basePixel;
  }
  p.mouseMoved = function(){
    let n_hovered = isHovered;
    p.checkHover();
  }
  p.animate_hover_in = function(){
    let speed = 0.025;
    let p_speed = basePixel * 0.02;
    if(h_scale < 1.25){
      h_scale += speed;
    }
    if(pixelSize > 1){
      pixelSize -= p_speed;
    }
  }
  p.animate_hover_out = function(){
    let speed = 0.025;
    let p_speed = basePixel * 0.02;
    if(h_scale > 1.0){
      h_scale -= speed;
    }
    if(pixelSize < basePixel){
      pixelSize += p_speed;
    }
  }
}

let sketch_guy = function(p){
  let isHovered = false;

  let vertex_shader = `
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  varying vec2 vTexCoord;
  
  void main(){
    vTexCoord = aTexCoord;
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
  }
  `;

  let fragment_shader = `
  precision mediump float;
  
  uniform sampler2D uTexture;
  uniform vec2 resolution;
  uniform float pixelSize;
  varying vec2 vTexCoord;

  void main(){
    // this pixelated the texture on the geometry.
    //vec2 uv = vTexCoord;
    //float dx = pixelSize/resolution.x;
    //float dy = pixelSize/resolution.y;
    //vec2 pixelatedUV = vec2(dx * floor(uv.x/dx), dy * floor(uv.y/dy));
    vec2 pixelCoord = floor(vTexCoord * resolution /pixelSize) * pixelSize / resolution;
    
    vec4 color = texture2D(uTexture, pixelCoord);

    gl_FragColor = color;
  }
  `;
  let pg;
  const m_scale = 0.0015;
  let basePixel;
  let pixelSize;
  let obj;
  let texture;
  let shader;
  let h_scale = 1;
  p.setup = function(){
    let container = document.getElementById('canvas-container-guy');
    basePixel = Math.max(3, Math.min(p.windowWidth, p.windowHeight) * 0.000082);
    pixelSize = basePixel;
    let w = container.offsetWidth || p.windowWidth;
    let h = container.offsetHeight || p.windowHeight;
    p.createCanvas(w, h, p.WEBGL);
    p.angleMode(p.DEGREES);
    shader = p.createShader(vertex_shader, fragment_shader);
    pg = p.createGraphics(p.width, p.height, p.WEBGL);
    p.noStroke();
  };
  p.preload = function(){
    texture = p.loadImage('src/assets/cat_guy.png');
  }
  p.windowResized = function(){
    let container = document.getElementById('canvas-container-guy');
    let w = container.offsetWidth || p.windowWidth;
    let h = container.offsetHeight || p.windowHeight;
    p.resizeCanvas(w, h);
    pg = p.createGraphics(p.width, p.height, p.WEBGL);
    basePixel = Math.max(3, Math.min(p.width, p.height) * 0.006);
    pixelSize = basePixel;
  }

  p.draw = function(){
    if (isHovered) {
      p.animate_hover_in();
    } else {
      p.animate_hover_out();
    }

    pg.clear()
    pg.push();
    pg.texture(texture);
    pg.noStroke();
    let size = Math.min(p.width, p.height) * 0.75;
    let half = size / 2;
    pg.scale(h_scale);
    pg.rotateY((p.mouseX - p.width/2)* m_scale);
    pg.rotateX(((p.mouseY - p.height/2) * m_scale) * -1);
    pg.quad(-half, -half, half, -half, half, half, -half, half);
    pg.pop();
    p.clear();
    p.push();
    p.shader(shader);
    shader.setUniform('uTexture', pg);
    shader.setUniform('resolution', [p.width, p.height]);
    shader.setUniform('pixelSize', pixelSize);
    p.quad(
      -p.width/2,-p.height/2,
      p.width/2,-p.height/2,
      p.width/2,p.height/2,
      -p.width/2,p.height/2
    );
    p.pop();
  }
  p.rotateWithFrameCount = function(offset){
    p.rotateY(p.frameCount - offset);
  }

  p.checkHover = function(){
    let mx = p.mouseX - p.width/2;
    let my = p.mouseY - p.height/2;
    let half = Math.min(p.width, p.height) * 0.75 / 2;

    let angle = p.radians(p.frameCount - 2);
    let cosA = Math.cos(angle);

    let rotatedX = mx / cosA;

    if (Math.abs(cosA) > 0.1) {
      isHovered = Math.abs(rotatedX) < half && Math.abs(my) < half;
    } else {
      isHovered = false;
    }
    return isHovered;
  }

  p.onHover = function(){
    pixelSize = 1;
  }

  p.onHoverOut = function(){
    pixelSize = basePixel;
  }
  p.mouseMoved = function(){
    let n_hovered = isHovered;
    p.checkHover();
  }
  p.animate_hover_in = function(){
    let speed = 0.025;
    let p_speed = basePixel * 0.02;
    if(h_scale < 1.25){
      h_scale += speed;
    }
    if(pixelSize > 1){
      pixelSize -= p_speed;
    }
  }
  p.animate_hover_out = function(){
    let speed = 0.025;
    let p_speed = basePixel * 0.02;
    if(h_scale > 1.0){
      h_scale -= speed;
    }
    if(pixelSize < basePixel){
      pixelSize += p_speed;
    }
  }
}

let sketch_house = function(p){
  let isHovered = false;

  let vertex_shader = `
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  varying vec2 vTexCoord;
  
  void main(){
    vTexCoord = aTexCoord;
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
  }
  `;

  let fragment_shader = `
  precision mediump float;
  
  uniform sampler2D uTexture;
  uniform vec2 resolution;
  uniform float pixelSize;
  varying vec2 vTexCoord;

  void main(){
    // this pixelated the texture on the geometry.
    //vec2 uv = vTexCoord;
    //float dx = pixelSize/resolution.x;
    //float dy = pixelSize/resolution.y;
    //vec2 pixelatedUV = vec2(dx * floor(uv.x/dx), dy * floor(uv.y/dy));
    vec2 pixelCoord = floor(vTexCoord * resolution /pixelSize) * pixelSize / resolution;
    
    vec4 color = texture2D(uTexture, pixelCoord);

    gl_FragColor = color;
  }
  `;
  let pg;
  const m_scale = 0.0015;
  let basePixel;
  let pixelSize;
  let obj;
  let texture;
  let shader;
  let h_scale = 1;
  p.setup = function(){
    let container = document.getElementById('canvas-container-guy');
    basePixel = Math.max(3, Math.min(p.windowWidth, p.windowHeight) * 0.000082);
    pixelSize = basePixel;
    let w = container.offsetWidth || p.windowWidth;
    let h = container.offsetHeight || p.windowHeight;
    p.createCanvas(w, h, p.WEBGL);
    p.angleMode(p.DEGREES);
    shader = p.createShader(vertex_shader, fragment_shader);
    pg = p.createGraphics(p.width, p.height, p.WEBGL);
    p.noStroke();
  };
  p.preload = function(){
    texture = p.loadImage('src/assets/house_guy.png');
  }
  p.windowResized = function(){
    let container = document.getElementById('canvas-container-house');
    let w = container.offsetWidth || p.windowWidth;
    let h = container.offsetHeight || p.windowHeight;
    p.resizeCanvas(w, h);
    pg = p.createGraphics(p.width, p.height, p.WEBGL);
    basePixel = Math.max(3, Math.min(p.width, p.height) * 0.006);
    pixelSize = basePixel;
  }

  p.draw = function(){
    if (isHovered) {
      p.animate_hover_in();
    } else {
      p.animate_hover_out();
    }

    pg.clear()
    pg.push();
    pg.texture(texture);
    pg.noStroke();
    let size = Math.min(p.width, p.height) * 0.75;
    let half = size / 2;
    pg.scale(h_scale);
    pg.rotateY((p.mouseX - p.width/2)* m_scale);
    pg.rotateX(((p.mouseY - p.height/2) * m_scale) * -1);
    pg.quad(-half, -half, half, -half, half, half, -half, half);
    pg.pop();
    p.clear();
    p.push();
    p.shader(shader);
    shader.setUniform('uTexture', pg);
    shader.setUniform('resolution', [p.width, p.height]);
    shader.setUniform('pixelSize', pixelSize);
    p.quad(
      -p.width/2,-p.height/2,
      p.width/2,-p.height/2,
      p.width/2,p.height/2,
      -p.width/2,p.height/2
    );
    p.pop();
  }
  p.rotateWithFrameCount = function(offset){
    p.rotateY(p.frameCount - offset);
  }

  p.checkHover = function(){
    let mx = p.mouseX - p.width/2;
    let my = p.mouseY - p.height/2;
    let half = Math.min(p.width, p.height) * 0.75 / 2;

    let angle = p.radians(p.frameCount - 2);
    let cosA = Math.cos(angle);

    let rotatedX = mx / cosA;

    if (Math.abs(cosA) > 0.1) {
      isHovered = Math.abs(rotatedX) < half && Math.abs(my) < half;
    } else {
      isHovered = false;
    }
    return isHovered;
  }

  p.onHover = function(){
    pixelSize = 1;
  }

  p.onHoverOut = function(){
    pixelSize = basePixel;
  }
  p.mouseMoved = function(){
    let n_hovered = isHovered;
    p.checkHover();
  }
  p.animate_hover_in = function(){
    let speed = 0.025;
    let p_speed = basePixel * 0.02;
    if(h_scale < 1.25){
      h_scale += speed;
    }
    if(pixelSize > 1){
      pixelSize -= p_speed;
    }
  }
  p.animate_hover_out = function(){
    let speed = 0.025;
    let p_speed = basePixel * 0.02;
    if(h_scale > 1.0){
      h_scale -= speed;
    }
    if(pixelSize < basePixel){
      pixelSize += p_speed;
    }
  }
}

let obj_p5 = new p5(sketch_obj, 'canvas-container-obj');
let misc_p5 = new p5(sketch_misc, 'canvas-container-misc');
let guy_p5 = new p5(sketch_guy, 'canvas-container-guy');
let house_p5 = new p5(sketch_house, 'canvas-container-house');
