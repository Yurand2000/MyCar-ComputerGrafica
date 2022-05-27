uniformShader = function (gl)
{
    var vertexShaderSource = `
    uniform   mat4 uModelViewMatrix;               
    uniform   mat4 uProjectionMatrix;              
    attribute vec3 aPosition;                      
    void main(void)                                
    {                                              
        gl_Position = uProjectionMatrix *            
        uModelViewMatrix * vec4(aPosition, 1.0);     
    }                                              
    `;

    var fragmentShaderSource = `
    precision highp float;                         
    uniform vec4 uColor;                           
    void main(void)                                
    {                                              
        gl_FragColor = vec4(uColor);                 
    }                                             
    `;

    let attributes =
    [
        { location: "aPositionIndex", attribute: "aPosition", index: 0 }
    ];

    let uniforms =
    [
        { location: "uModelViewMatrixLocation", uniform: "uModelViewMatrix" },
        { location: "uProjectionMatrixLocation", uniform: "uProjectionMatrix" },
        { location: "uColorLocation", uniform: "uColor" }
    ];

    let shaderProgram = makeShader(gl, vertexShaderSource, fragmentShaderSource, attributes, uniforms);

    return shaderProgram;
};