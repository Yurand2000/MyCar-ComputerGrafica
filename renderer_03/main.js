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

  // Clear the framebuffer
  gl.clearColor(0.34, 0.5, 0.74, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(shader);

  gl.uniformMatrix4fv(shader.uProjectionMatrixLocation, false, glMatrix.mat4.perspective(glMatrix.mat4.create(),3.14 / 4, ratio, 1, 500));

  Renderer.cameras[Renderer.currentCamera].update(this.car.position, this.car.direction, this.car.frame);
  var invV = Renderer.cameras[Renderer.currentCamera].matrix();
  var view = Renderer.cameras[Renderer.currentCamera].view_direction();
  gl.uniform3fv(shader.uViewDirectionLocation, view);
  gl.uniformMatrix4fv(shader.uViewMatrixLocation, false, invV);
  
  // load the car headlights matrices and textures
  var headlightProjMatrix = glMatrix.mat4.perspective( glMatrix.mat4.create(), 0.35, 1, 1, 500 );

  Renderer.headlights["left"].update(this.car.position, this.car.direction, this.car.frame);
  gl.uniformMatrix4fv(shader.uLeftHeadlightMatrixLocation, false,
    glMatrix.mat4.mul(
      glMatrix.mat4.create(),
      headlightProjMatrix,
      Renderer.headlights["left"].matrix()
    )
  );
  
  Renderer.headlights["right"].update(this.car.position, this.car.direction, this.car.frame);
  gl.uniformMatrix4fv(shader.uRightHeadlightMatrixLocation, false,
    glMatrix.mat4.mul(
      glMatrix.mat4.create(),
      headlightProjMatrix,
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

  gl.bindFramebuffer(gl.FRAMEBUFFER, Renderer.shadowMapFramebuffer);
  gl.clear(gl.DEPTH_BUFFER_BIT);

  gl.viewport(0, 0, Renderer.shadowMapResolution[0], Renderer.shadowMapResolution[1]);
  gl.useProgram(Renderer.shadowMapShader);

  let shadowMapProjectionMatrix = glMatrix.mat4.ortho(glMatrix.mat4.create(), -150, 150, -120, 120, 30, 350);
  let shadowMapViewMatrix = glMatrix.mat4.lookAt(
    glMatrix.mat4.create(),
    glMatrix.vec3.scale(glMatrix.vec3.create(), Game.scene.weather.sunLightDirection, 100),
    [0, 0, 0],
    [0, 1, 0]
  );

  gl.uniformMatrix4fv(Renderer.shadowMapShader.uProjectionMatrixLocation, false, shadowMapProjectionMatrix);
  gl.uniformMatrix4fv(Renderer.shadowMapShader.uViewMatrixLocation, false, shadowMapViewMatrix);
  
  Renderer.drawScene();

  gl.useProgram(null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  //draw scene with normal shader
  Renderer.currentShader = Renderer.uniformShader;
  Renderer.useColor = true;
  Renderer.startDrawScene();

  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, Renderer.shadowMapFramebuffer.depth_texture);

  gl.uniformMatrix4fv(Renderer.uniformShader.uShadowMapProjectionMatrixLocation, false, shadowMapProjectionMatrix);
  gl.uniformMatrix4fv(Renderer.uniformShader.uShadowMapViewMatrixLocation, false, shadowMapViewMatrix);

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
  Renderer.currentCamera = "Chase";

  /* create the matrix stack */
	Renderer.stack = new MatrixStack();

  /* initialize objects to be rendered */
  Renderer.initializeObjects();

  /* create the shaders */
  Renderer.uniformShader = new uniformShader(Renderer.gl);
  Renderer.loadLights();
  Renderer.shadowMapShader = new shadowMapShader(Renderer.gl);
  Renderer.shadowMapResolution = [4096, 4096];
  Renderer.shadowMapFramebuffer = makeFramebuffer(Renderer.gl, Renderer.shadowMapResolution);
  Renderer.currentShader = Renderer.uniformShader;

  /* load headlights for the car */
  Renderer.headlights = {};
  Renderer.headlights["left"] = new ChaseCamera([-0.7, 0.35, -4], [-0.55, 0.45, -2]);
  Renderer.headlights["right"] = new ChaseCamera([0.7, 0.35, -4], [0.55, 0.45, -2]);

  /* load textures */
  Renderer.ground_texture        = load_texture(gl, "../common/textures/street4.png", 0);
  Renderer.ground_texture_normal = load_texture(gl, "../common/textures/asphalt_normal_map.jpg", 1);
  Renderer.facade1_texture       = load_texture(gl, "../common/textures/facade1.jpg", 0);
  Renderer.facade2_texture       = load_texture(gl, "../common/textures/facade2.jpg", 0);
  Renderer.facade3_texture       = load_texture(gl, "../common/textures/facade3.jpg", 0);
  Renderer.roof_texture          = load_texture(gl, "../common/textures/roof.jpg", 0);
  Renderer.grass_tile_texture    = load_texture(gl, "../common/textures/grass_tile.png", 0);
  Renderer.headlight_texture     = load_texture(gl, "../common/textures/headlight.png", 2);

  /*
  add listeners for the mouse / keyboard events
  */
  Renderer.canvas.addEventListener('mousemove', on_mouseMove, false);
  Renderer.canvas.addEventListener('keydown', on_keydown, false);
  Renderer.canvas.addEventListener('keyup', on_keyup, false);

  Renderer.display();
}

on_mouseMove = function(e)
{

}

on_keyup = function(e)
{
	Renderer.car.control_keys[e.key] = false;
}

on_keydown = function(e)
{
	Renderer.car.control_keys[e.key] = true;
}

update_camera = function(camera_name)
{
  Renderer.currentCamera = camera_name;
}

window.onload = Renderer.setupAndStart;



