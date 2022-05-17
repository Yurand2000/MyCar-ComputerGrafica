shadowMapVertexShaderSource = function()
{
return `
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

attribute vec3 aPosition;
attribute vec2 aUVCoords;

void main(void)
{
    vec4 worldPos = uModelMatrix * vec4(aPosition, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * worldPos;
}
`;

}

shadowMapFragmentShaderSource = function()
{
    
return `
precision highp float;

void main(void)                                
{
    
}
`;

}