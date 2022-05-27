makeShader = function(gl, vertexShaderSource, fragmentShaderSource, attributes, uniforms)
{  
    // create the vertex shader
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
  
    // create the fragment shader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // Create the shader program
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);

    for(let i = 0; i < attributes.length; i++)
    {
      gl.bindAttribLocation(shaderProgram, attributes[i].index, attributes[i].attribute);
      shaderProgram[attributes[i].location] = attributes[i].index;
    }
    gl.linkProgram(shaderProgram);
  
    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
    {
      var str = "Unable to initialize the shader program.\n\n";
      str += "VS:\n" + gl.getShaderInfoLog(vertexShader) + "\n\n";
      str += "FS:\n" + gl.getShaderInfoLog(fragmentShader) + "\n\n";
      str += "PROG:\n" + gl.getProgramInfoLog(shaderProgram);
      alert(str);
    }

    for(let i = 0; i < uniforms.length; i++)
    {

        if(uniforms[i].defineGroup !== undefined)
        {
            shaderProgram[uniforms[i].defineGroup] = {};
        }
        else if(uniforms[i].defineArray !== undefined)
        {
            shaderProgram[uniforms[i].defineArray] = [];
        }
        else if(uniforms[i].defineIndex !== undefined)
        {
            shaderProgram[uniforms[i].array][uniforms[i].defineIndex] = {};
        }
        else
        {
            let uniform = gl.getUniformLocation(shaderProgram, uniforms[i].uniform);

            if(uniforms[i].group !== undefined)
                shaderProgram[uniforms[i].group][uniforms[i].location] = uniform;
            else if(uniforms[i].array !== undefined)
                shaderProgram[uniforms[i].array][uniforms[i].index][uniforms[i].location] = uniform;
            else
                shaderProgram[uniforms[i].location] = uniform;
        }
    }
  
    return shaderProgram;
};