uniformShader = function (gl)
{
  // create the vertex shader
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource());
  gl.compileShader(vertexShader);

  // create the fragment shader
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource());
  gl.compileShader(fragmentShader);

  // Create the shader program
  var aPositionIndex = 0;
  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.bindAttribLocation(shaderProgram, aPositionIndex, "aPosition");
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    var str = "Unable to initialize the shader program.\n\n";
    str += "VS:\n" + gl.getShaderInfoLog(vertexShader) + "\n\n";
    str += "FS:\n" + gl.getShaderInfoLog(fragmentShader) + "\n\n";
    str += "PROG:\n" + gl.getProgramInfoLog(shaderProgram);
    alert(str);
  }

  shaderProgram.aPositionIndex = aPositionIndex;

  //vertex shader uniforms
  shaderProgram.uModelMatrixLocation = gl.getUniformLocation(shaderProgram, "uModelMatrix");
  shaderProgram.uViewMatrixLocation = gl.getUniformLocation(shaderProgram, "uViewMatrix");
  shaderProgram.uProjectionMatrixLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");

  //fragment shader uniforms
  shaderProgram.uViewDirectionLocation = gl.getUniformLocation(shaderProgram, "uViewDirection");

  //material related uniforms
  shaderProgram.uColorLocation = gl.getUniformLocation(shaderProgram, "uMaterial.diffuseColor");
  shaderProgram.uMaterialLocation = {};
  shaderProgram.uMaterialLocation.diffuseColor = shaderProgram.uColorLocation;
  shaderProgram.uMaterialLocation.specularColor = gl.getUniformLocation(shaderProgram, "uMaterial.specularColor");
  shaderProgram.uMaterialLocation.specularGlossiness = gl.getUniformLocation(shaderProgram, "uMaterial.specularGlossiness");
  shaderProgram.uMaterialLocation.emissiveColor = gl.getUniformLocation(shaderProgram, "uMaterial.emissiveColor");

  //ambient related uniforms
  shaderProgram.uAmbientColorLocation = gl.getUniformLocation(shaderProgram, "uAmbientColor");

  //sunlight uniforms
  shaderProgram.uSunLocation = {};
  shaderProgram.uSunLocation.direction = gl.getUniformLocation(shaderProgram, "uSunLight.direction");
  shaderProgram.uSunLocation.color = gl.getUniformLocation(shaderProgram, "uSunLight.color");
  shaderProgram.uSunLocation.intensity = gl.getUniformLocation(shaderProgram, "uSunLight.intensity");

  //point light uniforms
  shaderProgram.uPointLightLocation = [];
  for(var i = 0; i < Game.scene.lamps.length; i++)
  {
    shaderProgram.uPointLightLocation[i] = {};
    shaderProgram.uPointLightLocation[i].position = gl.getUniformLocation(shaderProgram, "uPointLights[" + i + "].position");
    shaderProgram.uPointLightLocation[i].color = gl.getUniformLocation(shaderProgram, "uPointLights[" + i + "].color");
    shaderProgram.uPointLightLocation[i].intensity = gl.getUniformLocation(shaderProgram, "uPointLights[" + i + "].intensity");
  }

  //spot light uniforms
  shaderProgram.uSpotLightLocation = [];
  for(var i = 0; i < Game.scene.lamps.length; i++)
  {
    shaderProgram.uSpotLightLocation[i] = {};
    shaderProgram.uSpotLightLocation[i].position = gl.getUniformLocation(shaderProgram, "uSpotLights[" + i + "].position");
    shaderProgram.uSpotLightLocation[i].direction = gl.getUniformLocation(shaderProgram, "uSpotLights[" + i + "].direction");
    shaderProgram.uSpotLightLocation[i].color = gl.getUniformLocation(shaderProgram, "uSpotLights[" + i + "].color");
    shaderProgram.uSpotLightLocation[i].intensity = gl.getUniformLocation(shaderProgram, "uSpotLights[" + i + "].intensity");
    shaderProgram.uSpotLightLocation[i].openingAngle = gl.getUniformLocation(shaderProgram, "uSpotLights[" + i + "].openingAngle");
    shaderProgram.uSpotLightLocation[i].cutoffAngle = gl.getUniformLocation(shaderProgram, "uSpotLights[" + i + "].cutoffAngle");
    shaderProgram.uSpotLightLocation[i].strength = gl.getUniformLocation(shaderProgram, "uSpotLights[" + i + "].strength");
  }


  //set defaults
  gl.useProgram(shaderProgram);
  gl.uniform4fv(shaderProgram.uMaterialLocation.diffuseColor, [ 0, 0, 0, 1 ]);
  gl.uniform4fv(shaderProgram.uMaterialLocation.specularColor, [ 1, 1, 1, 1 ]);
  gl.uniform1f(shaderProgram.uMaterialLocation.specularGlossiness, 10.0);
  gl.uniform4fv(shaderProgram.uMaterialLocation.emissiveColor, [ 0, 0, 0, 1 ]);

  gl.uniform4fv(shaderProgram.uAmbientColorLocation, [ 0.1, 0.1, 0.1, 1 ]);
  gl.uniform3fv(shaderProgram.uViewDirectionLocation, [ 1, 0, 0 ]);

  //fill sunlight uniforms
  gl.uniform3fv(shaderProgram.uSunLocation.direction, [ 0, 1, 0 ]);
  gl.uniform4fv(shaderProgram.uSunLocation.color, [ 1, 0.8, 0.8, 1 ]);
  gl.uniform1f(shaderProgram.uSunLocation.intensity, 1.0);

  //fill pointlight uniforms
  for(var i = 0; i < Game.scene.lamps.length; i++)
  {
    gl.uniform3fv(shaderProgram.uPointLightLocation[i].position, [ 0, 0, 0 ]);
    gl.uniform4fv(shaderProgram.uPointLightLocation[i].color, [ 1, 1, 1, 1 ]);
    gl.uniform1f(shaderProgram.uPointLightLocation[i].intensity, 0);

    gl.uniform3fv(shaderProgram.uSpotLightLocation[i].position, [ 0, 0, 0 ]);
    gl.uniform3fv(shaderProgram.uSpotLightLocation[i].direction, [ 0, -1, 0 ]);
    gl.uniform4fv(shaderProgram.uSpotLightLocation[i].color, [ 1, 1, 1, 1 ]);
    gl.uniform1f(shaderProgram.uSpotLightLocation[i].intensity, 0);
    gl.uniform1f(shaderProgram.uSpotLightLocation[i].openingAngle, glMatrix.glMatrix.toRadian(20));
    gl.uniform1f(shaderProgram.uSpotLightLocation[i].cutoffAngle, glMatrix.glMatrix.toRadian(45));
    gl.uniform1f(shaderProgram.uSpotLightLocation[i].strength, 3);
  }

  gl.useProgram(null);

  return shaderProgram;
};