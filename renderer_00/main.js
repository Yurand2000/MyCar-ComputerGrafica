/* the main object to be implementd */
var Renderer = new Object();

Renderer.loadMatrix = function(gl, stack)
{
  gl.uniformMatrix4fv(this.uniformShader.uModelViewMatrixLocation, false, stack.matrix);
}

Renderer.initializeCar = function(gl) 
{
  Renderer.car_frame = new Cube();
  Renderer.createObjectBuffers(gl, this.car_frame);
  Renderer.car_frame_transform = glMatrix.mat4.create();
  glMatrix.mat4.translate(Renderer.car_frame_transform, Renderer.car_frame_transform, [0, 0.75, 0]);
  glMatrix.mat4.scale(Renderer.car_frame_transform, Renderer.car_frame_transform, [0.5, 0.5, 0.5]);
  glMatrix.mat4.scale(Renderer.car_frame_transform, Renderer.car_frame_transform, [2, 1, 4]);

  Renderer.car_wheel = new Cylinder(16);
  Renderer.createObjectBuffers(gl, this.car_wheel);
  var car_wheel_transform = glMatrix.mat4.create();
  glMatrix.mat4.translate(car_wheel_transform, car_wheel_transform, [0.1, 0, 0]);
  glMatrix.mat4.rotateZ(car_wheel_transform, car_wheel_transform, glMatrix.glMatrix.toRadian(90));
  glMatrix.mat4.scale(car_wheel_transform, car_wheel_transform, [0.3, 0.1, 0.3]);

  Renderer.car_wheel_transform_fl = glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [-1, 0.3, -1.5]);
  glMatrix.mat4.mul(Renderer.car_wheel_transform_fl, Renderer.car_wheel_transform_fl, car_wheel_transform);
  Renderer.car_wheel_transform_fr = glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [1, 0.3, -1.5]);
  glMatrix.mat4.mul(Renderer.car_wheel_transform_fr, Renderer.car_wheel_transform_fr, car_wheel_transform);
  Renderer.car_wheel_transform_bl = glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [-1, 0.3, 1.5]);
  glMatrix.mat4.mul(Renderer.car_wheel_transform_bl, Renderer.car_wheel_transform_bl, car_wheel_transform);
  Renderer.car_wheel_transform_br = glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [1, 0.3, 1.5]);
  glMatrix.mat4.mul(Renderer.car_wheel_transform_br, Renderer.car_wheel_transform_br, car_wheel_transform);
}

Renderer.drawCar = function (gl, stack)
{
  stack.push();
  stack.multiply(this.car_frame_transform);
  Renderer.loadMatrix(gl, stack);
  this.drawObject(gl, this.car_frame, [0.2, 0.2, 1, 1], [0, 0, 0, 1]);
  stack.pop();

  stack.push();
  stack.multiply(this.car_wheel_transform_fl);
  Renderer.loadMatrix(gl, stack);
  this.drawObject(gl, this.car_wheel, [0.2, 0.2, 0.2, 1], [0, 0, 0, 1]);
  stack.pop();

  stack.push();
  stack.multiply(this.car_wheel_transform_fr);
  Renderer.loadMatrix(gl, stack);
  this.drawObject(gl, this.car_wheel, [0.2, 0.2, 0.2, 1], [0, 0, 0, 1]);
  stack.pop();

  stack.push();
  stack.multiply(this.car_wheel_transform_bl);
  Renderer.loadMatrix(gl, stack);
  this.drawObject(gl, this.car_wheel, [0.2, 0.2, 0.2, 1], [0, 0, 0, 1]);
  stack.pop();

  stack.push();
  stack.multiply(this.car_wheel_transform_br);
  Renderer.loadMatrix(gl, stack);
  this.drawObject(gl, this.car_wheel, [0.2, 0.2, 0.2, 1], [0, 0, 0, 1]);
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
  gl.uniform4fv(this.uniformShader.uColorLocation, fillColor);
  gl.drawElements(gl.TRIANGLES, obj.triangleIndices.length, gl.UNSIGNED_SHORT, 0);

  gl.disable(gl.POLYGON_OFFSET_FILL);
  
  gl.uniform4fv(this.uniformShader.uColorLocation, lineColor);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferEdges);
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
  
  gl.uniformMatrix4fv(this.uniformShader.uProjectionMatrixLocation,     false,glMatrix.mat4.perspective(glMatrix.mat4.create(),3.14 / 4, ratio, 1, 500));

  Renderer.cameras[Renderer.currentCamera].update(this.car.position, this.car.direction, this.car.frame);
  var invV = Renderer.cameras[Renderer.currentCamera].matrix();
  
  // initialize the stack with the identity
  stack.loadIdentity();
  // multiply by the view matrix
  stack.multiply(invV);

  // drawing the car
   stack.push();

  stack.multiply(this.car.frame);
  gl.uniformMatrix4fv(this.uniformShader.uModelViewMatrixLocation, false, stack.matrix);
  this.drawCar(gl, stack);
  stack.pop();

  gl.uniformMatrix4fv(this.uniformShader.uModelViewMatrixLocation, false, stack.matrix);

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



