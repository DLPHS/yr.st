let sketch_obj = function(p){
  let obj;
  let texture;
  let s_rot = 0;
  let r_speed = 0.0025;
  const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 768);
  p.setup = function(){
    let container = document.getElementById('canvas-container-obj');
    let w = isMobile ? container.offsetWidth : p.windowWidth;
    let h = isMobile ? container.offsetHeight : p.windowHeight;
    p.createCanvas(w, h, p.WEBGL);
    p.angleMode(p.DEGREES);
  };
  p.preload = function(){
    obj = p.loadModel('src/assets/ch.obj');
    texture = p.loadImage('src/assets/texture.png');
  }
  p.windowResized = function(){
    if (isMobile) {
      let container = document.getElementById('canvas-container-obj');
      p.resizeCanvas(container.offsetWidth, container.offsetHeight);
    } else {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    }
  }

  p.draw = function(){
    p.clear();
    let baseSize = Math.min(p.width, p.height);
    let scaleFactor = isMobile ? baseSize * 0.14 : baseSize * 0.075;

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
    let r_pos;
    if (isMobile) {
      r_pos = 0;
    } else {
      r_pos = (p.mouseY - p.height/2 - p.height/5) * 0.085;
      if (r_pos > 1.9) {
        r_pos = 1.9;
      }
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

let obj_p5 = new p5(sketch_obj, 'canvas-container-obj');
