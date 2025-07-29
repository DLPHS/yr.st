let sketch_obj = function(p){
  let obj;
  let d;
  let texture;
  let shader;
  let c = p.color(255,0,0);
  p.setup = function(){
    d = p.createP('AUG 31ˢᵗ  2025');
    p.createCanvas(700,700,p.WEBGL);
    p.angleMode(p.DEGREES);
    // centering algo needed here
    // TODO:
    d.position(350,450);
    d.style('color','black');
    d.style('background-color', 'rgba(0,0,0,0)');
    d.style('font-size', '30px');
    //p.normalMaterial();
  };
  p.preload = function(){
    obj = p.loadModel('src/assets/ch.obj');
    texture = p.loadImage('src/assets/texture.png');
    shader = p.loadShader('src/glsl/lighting.vert','src/glsl/lighting.frag');
  }
  
  p.draw = function(){
    //p.background(185,182,184,0);
    p.clear();
    p.push();
    p.translate(0,0,0);
    p.rotateWithFrameCount(100);
    p.rotateZ(90);
    p.rotateY(90);
    p.texture(texture);
    p.noStroke();
    p.scale(75.0); // change this to scale with screen size for proper displays.
    p.model(obj);
    p.pop();
  }
  p.rotateWithFrameCount = function(offset){
    p.rotateY(p.frameCount - offset);
  }
  p.rainbow = function(){
    // increment r value while blue goes down.
    // increment b value while green goes down.
    // incremnet g value while red goes down.
  }
}

let obj_p5 = new p5(sketch_obj, 'canvas-container-obj');
