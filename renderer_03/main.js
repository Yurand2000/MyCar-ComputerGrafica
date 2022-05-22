var Renderer = {};

Renderer.loadLights = function()
{
  var gl = Renderer.gl;
  var shader = Renderer.uniformShader;

  gl.useProgram(shader);

  gl.uniform3fv(
    shader.uSunLocation.direction,
    glMatrix.vec3.normalize(glMatrix.vec3.create(), Game.scene.weather.sunLightDirection)
  );
  
  gl.uniform1f(shader.uSunLocation.intensity, 1.0);
  for(var i = 0; i < Game.scene.lamps.length; i++)
    gl.uniform1f(shader.uSpotLightLocation[i].intensity, 10);

  for(var i = 0; i < Game.scene.lamps.length; i++)
  {
    var lampPosition = glMatrix.vec3.clone(Game.scene.lamps[i].position);
    lampPosition[1] = lampPosition[1] + Game.scene.lamps[i].height;
    gl.uniform3fv(shader.uSpotLightLocation[i].position, lampPosition);
  }

  gl.useProgram(null);
}

/*
initialize the objects in the scene
*/
Renderer.initializeObjects = function()
{
  var gl = Renderer.gl;

  Game.setScene(scene_0);
  this.car = Game.addCar("mycar");
  Renderer.draw_car = makeCar();
  Renderer.draw_car.initialize(Renderer.gl);

  createObjectBuffers(gl, Game.scene.trackObj);
  createObjectBuffers(gl, Game.scene.groundObj);
  for (var i = 0; i < Game.scene.buildings.length; ++i)
  {
    createObjectBuffers(gl, Game.scene.buildingsObjTex[i]);
    createObjectBuffers(gl, Game.scene.buildingsObjTex[i].roof);
  }
};

Renderer.startDrawScene = function ()
{
  var gl = Renderer.gl;
  var shader = Renderer.currentShader;
  var stack = Renderer.stack;

  var width = this.canvas.width;
  var height = this.canvas.height
  var ratio = width / height;

  gl.viewport(0, 0, width, height);

  //update cameras and build matrices
  let proj_matrix = glMatrix.mat4.perspective(glMatrix.mat4.create(),3.14 / 4, ratio, 1, 500);
  Renderer.cameras[Renderer.currentCamera].update(this.car.position, this.car.direction, this.car.frame);
  var invV = Renderer.cameras[Renderer.currentCamera].matrix();
  var view = Renderer.cameras[Renderer.currentCamera].view_direction();

  // Clear the framebuffer
  gl.clearColor(0.34, 0.5, 0.74, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //draw cubemap
  gl.useProgram(Renderer.skyboxShader);
  gl.depthMask(false);
  gl.cullFace(gl.FRONT);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, Renderer.skybox_texture);

  gl.uniformMatrix4fv(Renderer.skyboxShader.uProjectionMatrixLocation, false, proj_matrix);
  gl.uniformMatrix4fv(Renderer.skyboxShader.uViewMatrixLocation, false, invV);

  drawObject(Renderer.skyboxCube, [], Renderer.gl, Renderer.skyboxShader, false);

  gl.cullFace(gl.BACK);
  gl.useProgram(null);

  //start draw scene
	gl.depthMask(true);
  gl.useProgram(shader);

  gl.uniformMatrix4fv(shader.uProjectionMatrixLocation, false, proj_matrix);

  gl.uniform3fv(shader.uViewDirectionLocation, view);
  gl.uniformMatrix4fv(shader.uViewMatrixLocation, false, invV);
  
  // load the car headlights matrices and textures
  Renderer.headlights["left"].update(this.car.position, this.car.direction, this.car.frame);
  Renderer.headlights["right"].update(this.car.position, this.car.direction, this.car.frame);

  gl.uniformMatrix4fv(shader.uLeftHeadlightMatrixLocation, false,
    glMatrix.mat4.mul(
      glMatrix.mat4.create(),
      Renderer.headlightProjectionMatrix,
      Renderer.headlights["left"].matrix()
    )
  );
  
  gl.uniformMatrix4fv(shader.uRightHeadlightMatrixLocation, false,
    glMatrix.mat4.mul(
      glMatrix.mat4.create(),
      Renderer.headlightProjectionMatrix,
      Renderer.headlights["right"].matrix()
    )
  );
  
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, Renderer.headlight_texture);
}

Renderer.drawScene = function ()
{
  var gl = Renderer.gl;
  var shader = Renderer.currentShader;
  var use_color = Renderer.useColor;
  var stack = Renderer.stack;

  // initialize the stack with the identity
  stack.loadIdentity();

  // drawing the car
  if(use_color)
  {
    gl.uniform1i(shader.uMaterialLocation.is_solid_color, 1);
    gl.uniform4fv(shader.uMaterialLocation.specularColor, [ 1, 1, 1, 1 ]);
  }

  stack.push();

  stack.multiply(this.car.frame);
  gl.uniformMatrix4fv(shader.uModelMatrixLocation, false, stack.matrix);
  Renderer.draw_car.draw(Renderer.car, gl, shader, stack, use_color);
  stack.pop();

  gl.uniformMatrix4fv(shader.uModelMatrixLocation, false, stack.matrix);

  // drawing the static elements (ground, track and buldings)
  if(use_color)
  {
    gl.uniform1i(shader.uMaterialLocation.is_solid_color, 0);
    gl.uniform4fv(shader.uMaterialLocation.specularColor, [ 0, 0, 0, 1 ]);
  }

  if(use_color)
  {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, Renderer.grass_tile_texture);
  }
	drawObject(Game.scene.groundObj, [0.3, 0.7, 0.2, 1.0], gl, shader, use_color);
  
  if(use_color)
  {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, Renderer.ground_texture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, Renderer.ground_texture_normal);
    gl.uniform1i(shader.uMaterialLocation.has_normal_map, 1);
  }
 	
  drawObject(Game.scene.trackObj, [0.9, 0.8, 0.7, 1.0], gl, shader, use_color);
  
  if(use_color)
  {
    gl.uniform1i(shader.uMaterialLocation.has_normal_map, 0);
  }

  if(use_color)
  {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, Renderer.facade2_texture);
  }
	for (var i in Game.scene.buildingsObjTex)
  {
		drawObject(Game.scene.buildingsObjTex[i], [0.8, 0.8, 0.8, 1.0], gl, shader, use_color);
  }

  if(use_color)
  {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, Renderer.roof_texture);
  }
	for (var i in Game.scene.buildingsObjTex)
  {
		drawObject(Game.scene.buildingsObjTex[i].roof, [0.8, 0.8, 0.8, 1.0], gl, shader, use_color);
  }
};

Renderer.endDrawScene = function()
{
  var gl = Renderer.gl;

	gl.useProgram(null);
}



Renderer.display = function()
{
  var gl = Renderer.gl;
  var width = Renderer.canvas.width;
  var height = Renderer.canvas.height
  var ratio = width / height;

  //draw scene on framebuffer
  Renderer.currentShader = Renderer.shadowMapShader;
  Renderer.useColor = false;

  gl.useProgram(Renderer.shadowMapShader);
  
  /* create shadowmap */
  gl.bindFramebuffer(gl.FRAMEBUFFER, Renderer.shadowMapFramebuffer);
  gl.clear(gl.DEPTH_BUFFER_BIT);

  gl.viewport(0, 0, Renderer.shadowMapResolution[0], Renderer.shadowMapResolution[1]);
  
  gl.uniformMatrix4fv(Renderer.shadowMapShader.uMatrixLocation, false,
    glMatrix.mat4.mul(
      glMatrix.mat4.create(),
      Renderer.shadowMapProjectionMatrix,
      Renderer.shadowMapViewMatrix
    )
  );
  
  Renderer.drawScene();

  /* left headlight shadowmap */
  gl.bindFramebuffer(gl.FRAMEBUFFER, Renderer.leftHeadlightShadowMapFramebuffer);
  gl.clear(gl.DEPTH_BUFFER_BIT);

  gl.viewport(0, 0, Renderer.headlightShadowMapResolution[0], Renderer.headlightShadowMapResolution[1]);
  
  gl.uniformMatrix4fv(Renderer.shadowMapShader.uMatrixLocation, false,
    glMatrix.mat4.mul(
      glMatrix.mat4.create(),
      Renderer.headlightProjectionMatrix,
      Renderer.headlights["left"].matrix()
    )
  );
  
  Renderer.drawScene();

  /* right headlight shadowmap */
  gl.bindFramebuffer(gl.FRAMEBUFFER, Renderer.rightHeadlightShadowMapFramebuffer);
  gl.clear(gl.DEPTH_BUFFER_BIT);

  gl.viewport(0, 0, Renderer.headlightShadowMapResolution[0], Renderer.headlightShadowMapResolution[1]);
  
  gl.uniformMatrix4fv(Renderer.shadowMapShader.uMatrixLocation, false,
    glMatrix.mat4.mul(
      glMatrix.mat4.create(),
      Renderer.headlightProjectionMatrix,
      Renderer.headlights["right"].matrix()
    )
  );
  
  Renderer.drawScene();

  gl.useProgram(null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  //draw scene with normal shader
  Renderer.currentShader = Renderer.uniformShader;
  Renderer.useColor = true;
  Renderer.startDrawScene();

  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, Renderer.shadowMapFramebuffer.depth_texture);
  gl.uniformMatrix4fv(Renderer.uniformShader.uShadowMapMatrixLocation, false,
    glMatrix.mat4.mul(
      glMatrix.mat4.create(),
      Renderer.shadowMapProjectionMatrix,
      Renderer.shadowMapViewMatrix
    )
  );

  gl.activeTexture(gl.TEXTURE4);
  gl.bindTexture(gl.TEXTURE_2D, Renderer.leftHeadlightShadowMapFramebuffer.depth_texture);
  gl.uniformMatrix4fv(Renderer.uniformShader.uLeftHeadlightMatrixLocation, false,
    glMatrix.mat4.mul(
      glMatrix.mat4.create(),
      Renderer.headlightProjectionMatrix,
      Renderer.headlights["left"].matrix()
    )
  );

  gl.activeTexture(gl.TEXTURE5);
  gl.bindTexture(gl.TEXTURE_2D, Renderer.rightHeadlightShadowMapFramebuffer.depth_texture);
  gl.uniformMatrix4fv(Renderer.uniformShader.uRightHeadlightMatrixLocation, false,
    glMatrix.mat4.mul(
      glMatrix.mat4.create(),
      Renderer.headlightProjectionMatrix,
      Renderer.headlights["right"].matrix()
    )
  );


  Renderer.drawScene();
  Renderer.endDrawScene();

  window.requestAnimationFrame(Renderer.display);
};


Renderer.setupAndStart = function ()
{
  /* create the canvas */
	Renderer.canvas = document.getElementById("OUTPUT-CANVAS");
  
  /* get the webgl context */
  var gl = Renderer.canvas.getContext("webgl");
  gl.getExtension('OES_standard_derivatives');
  gl.getExtension('WEBGL_depth_texture');
	Renderer.gl = gl;

  /* read the webgl version and log */
	var gl_version = gl.getParameter(gl.VERSION); 
	log("glversion: " + gl_version);
	var GLSL_version = gl.getParameter(gl.SHADING_LANGUAGE_VERSION)
	log("glsl  version: "+GLSL_version);

  /* setup webgl */
  gl.enable(gl.CULL_FACE);  
  gl.enable(gl.DEPTH_TEST);

  /* dictionary of cameras that will be used */
  Renderer.cameras = {};
  Renderer.cameras["FollowFromUp"] = new FollowFromUpCamera();
  Renderer.cameras["Chase"] = new ChaseCamera([0, 1.5, 0], [0, 4, 10]);
  Renderer.cameras["Relative"] = new ControllableChaseCamera([0, 1.5, 0], [0, 4, 10]);
  Renderer.currentCamera = "Relative";

  /* create the matrix stack */
	Renderer.stack = new MatrixStack();

  /* initialize objects to be rendered */
  Renderer.initializeObjects();

  /* create the shader */
  Renderer.uniformShader = new uniformShader(Renderer.gl);
  Renderer.currentShader = Renderer.uniformShader;
  Renderer.loadLights();

  /* create the skybox shader */
  Renderer.skyboxShader = new skyboxShader(Renderer.gl);
  Renderer.skyboxCube = new Cube();
  createObjectBuffers(Renderer.gl, Renderer.skyboxCube);

  /* setup headlights for the car and shadowmap framebuffers */
  Renderer.headlights = {};
  Renderer.headlightProjectionMatrix = glMatrix.mat4.perspective( glMatrix.mat4.create(), 0.35, 1, 1, 500 );
  Renderer.headlights["left"] = new ChaseCamera([-0.7, 0.35, -4], [-0.55, 0.45, -2]);
  Renderer.headlights["right"] = new ChaseCamera([0.7, 0.35, -4], [0.55, 0.45, -2]);

  Renderer.headlightShadowMapResolution = [2048, 2048];
  Renderer.leftHeadlightShadowMapFramebuffer = makeFramebuffer(Renderer.gl, Renderer.headlightShadowMapResolution);
  Renderer.rightHeadlightShadowMapFramebuffer = makeFramebuffer(Renderer.gl, Renderer.headlightShadowMapResolution);

  /* setup shadowmap shader and matrices */
  Renderer.shadowMapShader = new shadowMapShader(Renderer.gl);
  Renderer.shadowMapResolution = [4096, 4096];
  Renderer.shadowMapFramebuffer = makeFramebuffer(Renderer.gl, Renderer.shadowMapResolution);

  Renderer.shadowMapProjectionMatrix = glMatrix.mat4.ortho(glMatrix.mat4.create(), -150, 150, -120, 120, 30, 350);
  Renderer.shadowMapViewMatrix = glMatrix.mat4.lookAt(
    glMatrix.mat4.create(),
    glMatrix.vec3.scale(glMatrix.vec3.create(), Game.scene.weather.sunLightDirection, 100),
    [0, 0, 0],
    [0, 1, 0]
  );

  /* load textures */
  Renderer.ground_texture        = load_texture(gl, "../common/textures/street4.png", 0);
  Renderer.ground_texture_normal = load_texture(gl, "../common/textures/asphalt_normal_map.jpg", 1);
  Renderer.facade1_texture       = load_texture(gl, "../common/textures/facade1.jpg", 0);
  Renderer.facade2_texture       = load_texture(gl, "../common/textures/facade2.jpg", 0);
  Renderer.facade3_texture       = load_texture(gl, "../common/textures/facade3.jpg", 0);
  Renderer.roof_texture          = load_texture(gl, "../common/textures/roof.jpg", 0);
  Renderer.grass_tile_texture    = load_texture(gl, "../common/textures/grass_tile.png", 0);
  Renderer.headlight_texture     = load_texture(gl, "../common/textures/headlight.png", 2);
  Renderer.skybox_texture        = make_cubemap(gl,
    "../common/textures/cubemap/posx.jpg",
    "../common/textures/cubemap/negx.jpg",
    "../common/textures/cubemap/negy.jpg",
    "../common/textures/cubemap/posy.jpg",
    "../common/textures/cubemap/posz.jpg",
    "../common/textures/cubemap/negz.jpg",
  2);

  /*
  add listeners for the mouse / keyboard events
  */
  Renderer.mouse = {};
  Renderer.keys = {};
  Renderer.canvas.addEventListener('mousedown', on_mouseDown, false);
  Renderer.canvas.addEventListener('mouseup', on_mouseUp, false);
  Renderer.canvas.addEventListener('mousemove', on_mouseMove, false);
  Renderer.canvas.addEventListener('keydown', on_keydown, false);
  Renderer.canvas.addEventListener('keyup', on_keyup, false);

  Renderer.display();
}

on_mouseUp = function(e)
{
  Renderer.mouse[e.button] = false;
}
  
on_mouseDown = function(e)
{
  Renderer.mouse[e.button] = true;
}

on_mouseMove = function(e)
{
  let scale = 0.5;
  if(Renderer.mouse[0] && Renderer.currentCamera == "Relative")
  {
    Renderer.cameras["Relative"].add_rotation(-e.movementX * scale, -e.movementY * scale);
  }
}

on_keyup = function(e)
{
	Renderer.keys[e.key] = false;
	Renderer.car.control_keys[e.key] = false;
}

on_keydown = function(e)
{
	Renderer.keys[e.key] = true;
	Renderer.car.control_keys[e.key] = true;

  /* reset camera */
  if(e.key == "Home" && Renderer.currentCamera == "Relative")
  {
    Renderer.cameras["Relative"].reset_camera();
  }

  /* move camera */
  if(Renderer.currentCamera == "Relative")
  {
    let current_offset = [0, 0, 0];
    if(e.key == "w")
      current_offset[2] -= 1;
    if(e.key == "s")
      current_offset[2] += 1;
    if(e.key == "a")
      current_offset[0] -= 1;
    if(e.key == "d")
      current_offset[0] += 1;
    if(e.key == "q")
      current_offset[1] += 1;
    if(e.key == "e")
      current_offset[1] -= 1;

    Renderer.cameras["Relative"].add_offset(current_offset);
  }
}

update_camera = function(camera_name)
{
  Renderer.currentCamera = camera_name;
}

window.onload = Renderer.setupAndStart;



