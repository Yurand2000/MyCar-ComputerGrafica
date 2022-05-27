/* the main object to be implementd */
var Renderer = new Object();

Renderer.loadMatrix = function(gl, stack)
{
  gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, stack.matrix);
}

Renderer.initializeCar = function(gl) 
{
  Renderer.car_frame = new Cube();
  Renderer.rotation_angle = 0;
  Renderer.createObjectBuffers(gl, this.car_frame);
  Renderer.car_frame_transform = glMatrix.mat4.create();
  glMatrix.mat4.translate(Renderer.car_frame_transform, Renderer.car_frame_transform, [0, 0.2, 0]);
  glMatrix.mat4.scale(Renderer.car_frame_transform, Renderer.car_frame_transform, [2, 0.5, 4]);
  glMatrix.mat4.translate(Renderer.car_frame_transform, Renderer.car_frame_transform, [0, 0.5, 0]);
  glMatrix.mat4.scale(Renderer.car_frame_transform, Renderer.car_frame_transform, [0.5, 0.5, 0.5]); //set the cube side length to 1

  Renderer.car_wheel = new Cylinder(16);
  Renderer.createObjectBuffers(gl, this.car_wheel);
  var car_wheel_translation = glMatrix.mat4.create();
  glMatrix.mat4.translate(car_wheel_translation, car_wheel_translation, [0.15, 0, 0]);

  Renderer.car_wheel_transform = glMatrix.mat4.create();
  Renderer.car_wheel_radius = 0.3;
  glMatrix.mat4.rotateZ(Renderer.car_wheel_transform, Renderer.car_wheel_transform, glMatrix.glMatrix.toRadian(90));
  glMatrix.mat4.scale(Renderer.car_wheel_transform, Renderer.car_wheel_transform, [Renderer.car_wheel_radius, 0.3, Renderer.car_wheel_radius]);
  glMatrix.mat4.scale(Renderer.car_wheel_transform, Renderer.car_wheel_transform, [1, 0.5, 1]); //set the cilinder height and radius to 1

  Renderer.car_wheel_translation_fl = glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [-1, 0.3, -1.5]);
  glMatrix.mat4.mul(Renderer.car_wheel_translation_fl, Renderer.car_wheel_translation_fl, car_wheel_translation);
  Renderer.car_wheel_translation_fr = glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [1, 0.3, -1.5]);
  glMatrix.mat4.mul(Renderer.car_wheel_translation_fr, Renderer.car_wheel_translation_fr, car_wheel_translation);
  Renderer.car_wheel_translation_bl = glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [-1, 0.3, 1.5]);
  glMatrix.mat4.mul(Renderer.car_wheel_translation_bl, Renderer.car_wheel_translation_bl, car_wheel_translation);
  Renderer.car_wheel_translation_br = glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [1, 0.3, 1.5]);
  glMatrix.mat4.mul(Renderer.car_wheel_translation_br, Renderer.car_wheel_translation_br, car_wheel_translation);
}

Renderer.drawCar = function (gl, stack)
{
  stack.push();
  stack.multiply(this.car_frame_transform);
  Renderer.loadMatrix(gl, stack);
  this.drawObject(gl, this.car_frame, [0.2, 0.2, 1, 1], [0, 0, 0, 1]);
  stack.pop();

  var speed = Renderer.car.speed;
  var circumference = Renderer.car_wheel_radius * 2 * 3.1415;
  Renderer.rotation_angle = Renderer.rotation_angle + (speed / circumference);
  var car_wheel_speed = glMatrix.mat4.fromXRotation(glMatrix.mat4.create(), -Renderer.rotation_angle);
  var steering_angle = Renderer.car.wheelsAngle;
  var car_wheel_rotation_and_speed = glMatrix.mat4.fromYRotation(glMatrix.mat4.create(), steering_angle);
  glMatrix.mat4.mul(car_wheel_rotation_and_speed, car_wheel_rotation_and_speed, car_wheel_speed);

  stack.push();
  stack.multiply(this.car_wheel_translation_fl);
  stack.push();
  stack.multiply(car_wheel_rotation_and_speed);
  stack.push();
  stack.multiply(this.car_wheel_transform);
  Renderer.loadMatrix(gl, stack);
  this.drawObject(gl, this.car_wheel, [0.2, 0.2, 0.2, 1], [0, 0, 0, 1]);
  stack.pop();
  stack.pop();
  stack.pop();

  stack.push();
  stack.multiply(this.car_wheel_translation_fr);
  stack.push();
  stack.multiply(car_wheel_rotation_and_speed);
  stack.push();
  stack.multiply(this.car_wheel_transform);
  Renderer.loadMatrix(gl, stack);
  this.drawObject(gl, this.car_wheel, [0.2, 0.2, 0.2, 1], [0, 0, 0, 1]);
  stack.pop();
  stack.pop();
  stack.pop();



  stack.push();
  stack.multiply(this.car_wheel_translation_bl);
  stack.push();
  stack.multiply(car_wheel_speed);
  stack.push();
  stack.multiply(this.car_wheel_transform);
  Renderer.loadMatrix(gl, stack);
  this.drawObject(gl, this.car_wheel, [0.2, 0.2, 0.2, 1], [0, 0, 0, 1]);
  stack.pop();
  stack.pop();
  stack.pop();

  stack.push();
  stack.multiply(this.car_wheel_translation_br);
  stack.push();
  stack.multiply(car_wheel_speed);
  stack.push();
  stack.multiply(this.car_wheel_transform);
  Renderer.loadMatrix(gl, stack);
  this.drawObject(gl, this.car_wheel, [0.2, 0.2, 0.2, 1], [0, 0, 0, 1]);
  stack.pop();
  stack.pop();
  stack.pop();
};

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

/*
create the buffers for an object as specified in common/shapes/triangle.js
*/
Renderer.createObjectBuffers = function (gl, obj) {

  obj.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, obj.vertices, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  obj.indexBufferTriangles = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferTriangles);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, obj.triangleIndices, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  // create edges
  var edges = new Uint16Array(obj.numTriangles * 3 * 2);
  for (var i = 0; i < obj.numTriangles; ++i) {
    edges[i * 6 + 0] = obj.triangleIndices[i * 3 + 0];
    edges[i * 6 + 1] = obj.triangleIndices[i * 3 + 1];
    edges[i * 6 + 2] = obj.triangleIndices[i * 3 + 0];
    edges[i * 6 + 3] = obj.triangleIndices[i * 3 + 2];
    edges[i * 6 + 4] = obj.triangleIndices[i * 3 + 1];
    edges[i * 6 + 5] = obj.triangleIndices[i * 3 + 2];
  }

  obj.indexBufferEdges = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferEdges);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, edges, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};

/*
draw an object as specified in common/shapes/triangle.js for which the buffer 
have alrady been created
*/
Renderer.drawObject = function (gl, obj, fillColor, lineColor) {

  gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
  gl.enableVertexAttribArray(this.uniformShader.aPositionIndex);
  gl.vertexAttribPointer(this.uniformShader.aPositionIndex, 3, gl.FLOAT, false, 0, 0);

  gl.enable(gl.POLYGON_OFFSET_FILL);
  gl.polygonOffset(1.0, 1.0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferTriangles);
  gl.uniform4fv(this.uniformShader.uMaterialLocation.diffuseColor, fillColor);
  gl.uniform1f(this.uniformShader.uSunLocation.intensity, 1.0);
  for(var i = 0; i < Game.scene.lamps.length; i++)
    gl.uniform1f(this.uniformShader.uSpotLightLocation[i].intensity, 10);
  gl.drawElements(gl.TRIANGLES, obj.triangleIndices.length, gl.UNSIGNED_SHORT, 0);

  gl.disable(gl.POLYGON_OFFSET_FILL);
  
  gl.uniform4fv(this.uniformShader.uMaterialLocation.diffuseColor, lineColor);
  gl.uniform1f(this.uniformShader.uSunLocation.intensity, 0.0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferEdges);
  for(var i = 0; i < Game.scene.lamps.length; i++)
    gl.uniform1f(this.uniformShader.uSpotLightLocation[i].intensity, 0);
  gl.drawElements(gl.LINES, obj.numTriangles * 3 * 2, gl.UNSIGNED_SHORT, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  gl.disableVertexAttribArray(this.uniformShader.aPositionIndex);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
};

/*
initialize the object in the scene
*/
Renderer.initializeObjects = function (gl) {
  Game.setScene(scene_0);
  this.car = Game.addCar("mycar");
  Renderer.initializeCar(gl);

  Renderer.createObjectBuffers(gl,Game.scene.trackObj);
  Renderer.createObjectBuffers(gl,Game.scene.groundObj);
  for (var i = 0; i < Game.scene.buildings.length; ++i) 
	  	Renderer.createObjectBuffers(gl,Game.scene.buildingsObj[i]);
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
  
  // initialize the stack with the identity
  stack.loadIdentity();

  // drawing the car
  stack.push();

  stack.multiply(this.car.frame);
  gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, stack.matrix);
  this.drawCar(gl, stack);
  stack.pop();

  gl.uniformMatrix4fv(this.uniformShader.uModelMatrixLocation, false, stack.matrix);

  // drawing the static elements (ground, track and buldings)
	this.drawObject(gl, Game.scene.groundObj, [0.3, 0.7, 0.2, 1.0], [0, 0, 0, 1.0]);
 	this.drawObject(gl, Game.scene.trackObj, [0.9, 0.8, 0.7, 1.0], [0, 0, 0, 1.0]);
	for (var i in Game.scene.buildingsObj) 
		this.drawObject(gl, Game.scene.buildingsObj[i], [0.8, 0.8, 0.8, 1.0], [0.2, 0.2, 0.2, 1.0]);
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

  /* create the matrix stack */
	Renderer.stack = new MatrixStack();

  /* initialize objects to be rendered */
  Renderer.initializeObjects(Renderer.gl);

  /* create the shader */
  Renderer.uniformShader = new uniformShader(Renderer.gl);

  Renderer.gl.useProgram(Renderer.uniformShader);
  Renderer.loadLights(Renderer.gl);
  Renderer.gl.useProgram(null);

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



