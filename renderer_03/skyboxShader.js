skyboxShader = function (gl)
{
  // create the vertex shader
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, skyboxVertexShaderSource());
  gl.compileShader(vertexShader);

  // create the fragment shader
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, skyboxFragmentShaderSource());
  gl.compileShader(fragmentShader);

  // Create the shader program
  var aPositionIndex = 0;
  var aUVCoordsIndex = 1;
  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.bindAttribLocation(shaderProgram, aPositionIndex, "aPosition");
  gl.bindAttribLocation(shaderProgram, aUVCoordsIndex, "aUVCoords");
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    var str = "Unable to initialize the skybox shader program.\n\n";
    str += "VS:\n" + gl.getShaderInfoLog(vertexShader) + "\n\n";
    str += "FS:\n" + gl.getShaderInfoLog(fragmentShader) + "\n\n";
    str += "PROG:\n" + gl.getProgramInfoLog(shaderProgram);
    alert(str);
  }

  shaderProgram.aPositionIndex = aPositionIndex;
  shaderProgram.aUVCoordsIndex = aUVCoordsIndex;

  //vertex shader uniforms
  shaderProgram.uViewMatrixLocation = gl.getUniformLocation(shaderProgram, "uViewMatrix");
  shaderProgram.uProjectionMatrixLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");

  //fragment shader uniforms
  shaderProgram.uSkyboxTextureLocation = gl.getUniformLocation(shaderProgram, "uSkyboxTexture");

  //fill uniforms
  gl.useProgram(shaderProgram);

  gl.uniform1i(shaderProgram.uSkyboxTextureLocation, 0);

  gl.useProgram(null);

  return shaderProgram;
};