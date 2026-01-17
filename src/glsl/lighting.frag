varying lowp vec4 destinationColour;
varying lowp vec2 textureCoordOut;
varying highp float lightIntensity;

varying vec4 destinationColour;
varying vec2 textureCoordOut;
varying float lightIntensity;

uniform sampler2D demoTexture;

void main(){
  // look this up
  // it doesn't make sense
  highp float l = max(0.3, lightIntensity * 0.3);
  highp vec4 colour = vec4 (l,l,l,1.0);

  float l = max (0.3, lightIntensity * 0.3);
  vec4 colour = vec4(l,l,l,1.0);

  gl_FragColor = colour * texture2D (demoTexture, textureCoordOut);
}
