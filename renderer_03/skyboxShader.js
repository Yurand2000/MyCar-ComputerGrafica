skyboxShader = function (gl)
{
    let attributes =
    [
        { location: "aPositionIndex", attribute: "aPosition", index: 0 },
        { location: "aUVCoordsIndex", attribute: "aUVCoords", index: 1 }
    ];

    let uniforms =
    [
        { location: "uViewMatrixLocation", uniform: "uViewMatrix" },
        { location: "uProjectionMatrixLocation", uniform: "uProjectionMatrix" },
        { location: "uSkyboxTextureLocation", uniform: "uSkyboxTexture" }
    ];

    let shaderProgram = makeShader(gl, skyboxVertexShaderSource(), skyboxFragmentShaderSource(), attributes, uniforms);

    //fill uniforms
    gl.useProgram(shaderProgram);

    gl.uniform1i(shaderProgram.uSkyboxTextureLocation, 0);

    gl.useProgram(null);

    return shaderProgram;
};

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