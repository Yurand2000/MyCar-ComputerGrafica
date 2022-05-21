shadowMapVertexShaderSource = function()
{
return `
uniform mat4 uModelMatrix;
uniform mat4 uMatrix;

attribute vec3 aPosition;
attribute vec2 aUVCoords;

void main(void)
{
    vec4 worldPos = uModelMatrix * vec4(aPosition, 1.0);
    gl_Position = uMatrix * worldPos;
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