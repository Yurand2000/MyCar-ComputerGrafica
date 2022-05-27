/* the main object to be implementd */
var Renderer = new Object();

update_camera = function(camera_name)
{
  Renderer.currentCamera = camera_name;
}

/* dictionary of cameras that will be used */
Renderer.cameras = {};
Renderer.cameras["FollowFromUp"] = new FollowFromUpCamera();
Renderer.cameras["Chase"] = new ChaseCamera([0, 1.5, 0], [0, 4, 10]);
Renderer.currentCamera = "Chase";

Renderer.loadLights = function(gl)
{
  for(var i = 0; i < Game.scene.lamps.length; i++)
  {
    var lampPosition = glMatrix.vec3.clone(Game.scene.lamps[i].position);
    lampPosition[1] = lampPosition[1] + Game.scene.lamps[i].height;
    gl.uniform3fv(this.uniformShader.uSpotLightLocation[i].position, lampPosition);
  }
}

Renderer.headlights = {};
Renderer.headlights["left"] = new ChaseCamera([-0.7, 0.35, -4], [-0.55, 0.45, -2]);
Renderer.headlights["right"] = new ChaseCamera([0.7, 0.35, -4], [0.55, 0.45, -2]);

/*
initialize the object in the scene
*/
Renderer.initializeObjects = function (gl) {
  Game.setScene(scene_0);
  this.car = Game.addCar("mycar");
  Renderer.draw_car = makeCar();
  Renderer.draw_car.initialize(Renderer.gl);

  createObjectBuffers(gl,Game.scene.trackObj);
  createObjectBuffers(gl,Game.scene.groundObj);
  for (var i = 0; i < Game.scene.buildings.length; ++i)
  {
    createObjectBuffers(gl,Game.scene.buildingsObjTex[i]);
    createObjectBuffers(gl,Game.scene.buildingsObjTex[i].roof);
  }
};


Renderer.drawScene = function (gl) {

  var width = this.canvas.width;
  var height = this.canvas.height
  var ratio = width / height;
  var stack = new MatrixStack();

  gl.viewport(0, 0, width, height);
  
  gl.enable(gl.DEPTH_TEST);

  // Clear the framebuffer
  gl.clearColor(0.34, 0.5, 0.74, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  gl.useProgram(this.uniformShader);
  gl.uniform3fv(
    this.uniformShader.uSunLocation.direction,
    glMatrix.vec3.normalize(glMatrix.vec3.create(), Game.scene.weather.sunLightDirection)
  );
  
  gl.uniformMatrix4fv(this.uniformShader.uProjectionMatrixLocation, false, glMatrix.mat4.perspective(glMatrix.mat4.create(),3.14 / 4, ratio, 1, 500));

  Renderer.cameras[Renderer.currentCamera].update(this.car.position, this.car.direction, this.car.frame);
  var invV = Renderer.cameras[Renderer.currentCamera].matrix();
  var view = Renderer.cameras[Renderer.currentCamera].view_direction();
  gl.uniform3fv(this.uniformShader.uViewDirectionLocation, view);
  gl.uniformMatrix4fv(this.uniformShader.uViewMatrixLocation, false, invV);
  
  // load the car headlights matrices
  var headlightProjMatrix = glMatrix.mat4.perspective( glMatrix.mat4.create(), 0.35, 1, 1, 500 );

  Renderer.headlights["left"].update(this.car.position, this.car.direction, this.car.frame);
  gl.uniformMatrix4fv(this.uniformShader.uLeftHeadlightMatrix, false,
    glMatrix.mat4.mul(
      glMatrix.mat4.create(),
      headlightProjMatrix,
      Renderer.headlights["left"].matrix()
    )
  );
  
  Renderer.headlights["right"].update(this.car.position, this.car.direction, this.car.frame);
  gl.uniformMatrix4fv(this.uniformShader.uRightHeadlightMatrix, false,
    glMatrix.mat4.mul(
      glMatrix.mat4.create(),
      headlightProjMatrix,
      Renderer.headlights["right"].matrix()
    )
  );
  
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, Renderer.headlight_texture);

  // initialize the stack with the identity
  stack.loadIdentity();

  // drawing the car
  gl.uniform1i(this.uniformShader.uMaterialLocation.is_solid_color, 1);
  gl.uniform4fv(this.uniformShader.uMaterialLocation.specularColor, [ 1, 1, 1, 1 ]);

  stack.push();

  stack.multiply(this.car.frame);
  gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, stack.matrix);
  Renderer.draw_car.draw(Renderer.car, gl, this.uniformShader, stack);
  stack.pop();

  gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, stack.matrix);

  // drawing the static elements (ground, track and buldings)
  gl.uniform1i(this.uniformShader.uMaterialLocation.is_solid_color, 0);
  gl.uniform4fv(this.uniformShader.uMaterialLocation.specularColor, [ 0, 0, 0, 1 ]);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, Renderer.grass_tile_texture);
	drawObject(Game.scene.groundObj, [0.3, 0.7, 0.2, 1.0], gl, this.uniformShader);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, Renderer.ground_texture);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, Renderer.ground_texture_normal);
  gl.uniform1i(this.uniformShader.uMaterialLocation.has_normal_map, 1);
 	drawObject(Game.scene.trackObj, [0.9, 0.8, 0.7, 1.0], gl, this.uniformShader);
  gl.uniform1i(this.uniformShader.uMaterialLocation.has_normal_map, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, Renderer.facade2_texture);
	for (var i in Game.scene.buildingsObjTex)
  {
		drawObject(Game.scene.buildingsObjTex[i], [0.8, 0.8, 0.8, 1.0], gl, this.uniformShader);
  }
  
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, Renderer.roof_texture);
	for (var i in Game.scene.buildingsObjTex)
  {
		drawObject(Game.scene.buildingsObjTex[i].roof, [0.8, 0.8, 0.8, 1.0], gl, this.uniformShader);
  }
	gl.useProgram(null);
};



Renderer.Display = function () {
  Renderer.drawScene(Renderer.gl);
  window.requestAnimationFrame(Renderer.Display) ;
};


Renderer.setupAndStart = function () {
 /* create the canvas */
	Renderer.canvas = document.getElementById("OUTPUT-CANVAS");
  
 /* get the webgl context */
	Renderer.gl = Renderer.canvas.getContext("webgl");
  Renderer.gl.getExtension('OES_standard_derivatives');

  /* read the webgl version and log */
	var gl_version = Renderer.gl.getParameter(Renderer.gl.VERSION); 
	log("glversion: " + gl_version);
	var GLSL_version = Renderer.gl.getParameter(Renderer.gl.SHADING_LANGUAGE_VERSION)
	log("glsl  version: "+GLSL_version);

  /* setup webgl */
  Renderer.gl.enable(Renderer.gl.CULL_FACE);

  /* create the matrix stack */
	Renderer.stack = new MatrixStack();

  /* initialize objects to be rendered */
  Renderer.initializeObjects(Renderer.gl);

  /* create the shader */
  Renderer.uniformShader = new uniformShader(Renderer.gl);

  /* load lights */
  Renderer.gl.useProgram(Renderer.uniformShader);
  Renderer.loadLights(Renderer.gl);
  Renderer.gl.useProgram(null);

  /* load textures */
  Renderer.ground_texture        = load_texture(Renderer.gl, "../common/textures/street4.png", 0);
  Renderer.ground_texture_normal = load_texture(Renderer.gl, "../common/textures/asphalt_normal_map.jpg", 1);
  Renderer.facade1_texture       = load_texture(Renderer.gl, "../common/textures/facade1.jpg", 0);
  Renderer.facade2_texture       = load_texture(Renderer.gl, "../common/textures/facade2.jpg", 0);
  Renderer.facade3_texture       = load_texture(Renderer.gl, "../common/textures/facade3.jpg", 0);
  Renderer.roof_texture          = load_texture(Renderer.gl, "../common/textures/roof.jpg", 0);
  Renderer.grass_tile_texture    = load_texture(Renderer.gl, "../common/textures/grass_tile.png", 0);
  Renderer.headlight_texture     = load_texture(Renderer.gl, "../common/textures/headlight.png", 2);

  /*
  add listeners for the mouse / keyboard events
  */
  Renderer.canvas.addEventListener('mousemove',on_mouseMove,false);
  Renderer.canvas.addEventListener('keydown',on_keydown,false);
  Renderer.canvas.addEventListener('keyup',on_keyup,false);

  Renderer.Display();
}

on_mouseMove = function(e){}

on_keyup = function(e){
	Renderer.car.control_keys[e.key] = false;
}
on_keydown = function(e){
	Renderer.car.control_keys[e.key] = true;
}

window.onload = Renderer.setupAndStart;



