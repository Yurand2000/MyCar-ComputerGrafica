uniformShader = function (gl) {//line 1,Listing 2.14
  var vertexShaderSource = `
    uniform mat4 uModelMatrix; 
    uniform mat4 uViewMatrix;               
    uniform mat4 uProjectionMatrix;              
    attribute vec3 aPosition;

    varying vec3 vWorldPos;

    void main(void)                                
    {
      vec4 worldPos = uModelMatrix * vec4(aPosition, 1.0);
      vWorldPos = worldPos.xyz;
      gl_Position = uProjectionMatrix * uViewMatrix * worldPos;     
    }                                              
  `;

  var fragmentShaderSource = `
    #extension GL_OES_standard_derivatives : enable
    precision highp float;
    varying vec3 vWorldPos;

    //material properties
    uniform vec4 uDiffuseColor;
    uniform vec4 uSpecularColor;
    uniform float uSpecularGlossiness;
    uniform vec4 uEmissiveColor;

    //ambient properties
    uniform vec4 uAmbientColor;
    uniform vec3 uSunDirection;
    uniform vec4 uSunColor;

    uniform vec3 uViewDirection;

    vec3 computeNormal(vec3 worldPos)
    {
      return normalize(  cross( dFdx(worldPos), dFdy(worldPos) )  );
    }

    vec4 computeDiffuseColor(vec3 currNormal)
    {
      float diffuseDot = dot( uSunDirection, currNormal );
      if(diffuseDot > 0.0)
        return vec4( uDiffuseColor.xyz * uSunColor.xyz * diffuseDot, 1.0 );
      else
        return vec4(0.0, 0.0, 0.0, 1.0);
    }

    vec4 computeSpecularColor(vec3 currNormal)
    {
      vec3 halfwayVector = normalize( uSunDirection + uViewDirection );
      float specularDot = dot( halfwayVector, currNormal );
      if(specularDot > 0.0)
      {
        specularDot = pow(  dot( halfwayVector, currNormal ), uSpecularGlossiness  );
        return vec4( uSpecularColor.xyz * uSunColor.xyz * specularDot, 1.0 );
      }
      else
        return vec4(0.0, 0.0, 0.0, 1.0);
    }

    void main(void)                                
    {                             
      vec3 currNormal = computeNormal(vWorldPos);
      vec4 diffuseColor = computeDiffuseColor(currNormal);
      vec4 specularColor = computeSpecularColor(currNormal);
      vec4 ambientColor = vec4(uAmbientColor.xyz, 1.0);
      vec4 outColor = clamp( ambientColor + diffuseColor + specularColor + vec4(uEmissiveColor.xyz, 1.0), 0.0, 1.0 );
      gl_FragColor = outColor;
    }
  `;

  // create the vertex shader
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  // create the fragment shader
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
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
  shaderProgram.uModelMatrixLocation = gl.getUniformLocation(shaderProgram, "uModelMatrix");
  shaderProgram.uViewMatrixLocation = gl.getUniformLocation(shaderProgram, "uViewMatrix");
  shaderProgram.uProjectionMatrixLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
  shaderProgram.uColorLocation = gl.getUniformLocation(shaderProgram, "uDiffuseColor");

  shaderProgram.uDiffuseColorLocation = shaderProgram.uColorLocation;
  shaderProgram.uSpecularColorLocation = gl.getUniformLocation(shaderProgram, "uSpecularColor");
  shaderProgram.uSpecularGlossinessLocation = gl.getUniformLocation(shaderProgram, "uSpecularGlossiness");
  shaderProgram.uEmissiveColorLocation = gl.getUniformLocation(shaderProgram, "uEmissiveColor");

  shaderProgram.uAmbientColorLocation = gl.getUniformLocation(shaderProgram, "uAmbientColor");
  shaderProgram.uSunDirectionLocation = gl.getUniformLocation(shaderProgram, "uSunDirection");
  shaderProgram.uSunColorLocation = gl.getUniformLocation(shaderProgram, "uSunColor");
  shaderProgram.uViewDirectionLocation = gl.getUniformLocation(shaderProgram, "uViewDirection");

  gl.useProgram(shaderProgram);
  gl.uniform4fv(shaderProgram.uDiffuseColorLocation, [ 0, 0, 0, 1 ]);
  gl.uniform4fv(shaderProgram.uSpecularColorLocation, [ 1, 1, 1, 1 ]);
  gl.uniform1f(shaderProgram.uSpecularGlossinessLocation, 10);
  gl.uniform4fv(shaderProgram.uEmissiveColorLocation, [ 0, 0, 0, 1 ]);

  gl.uniform4fv(shaderProgram.uAmbientColorLocation, [ 0, 0, 0, 1 ]);
  gl.uniform3fv(shaderProgram.uSunDirectionLocation, [ 0, 1, 0 ]);
  gl.uniform4fv(shaderProgram.uSunColorLocation, [ 1, 1, 1, 1 ]);
  gl.uniform3fv(shaderProgram.uViewDirectionLocation, [ 1, 0, 0 ]);
  gl.useProgram(null);

  return shaderProgram;
};//line 55