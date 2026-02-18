attribute vec4 position;
attribute vec4 normal;
attribute vec4 sourceColour;
attribute vec2 textureCoordIn;

// might not need these two.
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
//
// we need this though.
uniform vec4 lightPosition;

varying vec4 destinationColour; 
varying vec2 textureCoordOut;
varying float lightIntensity;

void main(){
  destinationColour = sourceColour;
  textureCoordOut = textureCoorOut;
  
  vec4 light = viewMatrix * lightPosition;
  lightIntensity = dot(light, normal);

  gl_Position = projectionMatrix * viewMatrix * position;
}
