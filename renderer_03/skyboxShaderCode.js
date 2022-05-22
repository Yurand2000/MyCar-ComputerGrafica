skyboxVertexShaderSource = function()
{
return `
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

attribute vec3 aPosition;
attribute vec2 aUVCoords;

varying vec3 vPosition;

void main(void)
{
    vPosition = vec3(aPosition.x, aPosition.y, aPosition.z);
    vec4 direction = uViewMatrix * vec4(aPosition * 2.0, 0.0);
    gl_Position = uProjectionMatrix * vec4(direction.xyz, 1.0);
}
`;
}

skyboxFragmentShaderSource = function()
{
return `
precision highp float;
uniform samplerCube uSkyboxTexture;

varying vec3 vPosition;

void main(void)                                
{        
    gl_FragColor = textureCube( uSkyboxTexture, normalize(-vPosition) );
}
`;
}