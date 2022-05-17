ChaseCamera = function(center, cam_position)
{
  this.center = center;
  this.camera_pos = cam_position;

  this.world_center = [0,0,0];
  this.world_camera_pos = [0,0,0];
  
  this.update = function(car_position, car_direction, car_frame)
  {
    glMatrix.vec3.transformMat4(this.world_center, this.center, car_frame);
    glMatrix.vec3.transformMat4(this.world_camera_pos, this.camera_pos, car_frame);
  }

  this.view_direction = function()
  {
    return glMatrix.vec3.normalize( glMatrix.vec3.create(), glMatrix.vec3.sub(glMatrix.vec3.create(), this.world_camera_pos, this.world_center) );
  }

  this.matrix = function()
  {
    return glMatrix.mat4.lookAt(glMatrix.mat4.create(), this.world_camera_pos, this.world_center, [0, 1, 0]);	
  }
}

FollowFromUpCamera = function()
{
  this.pos = [0,0,0];
  
  this.update = function(car_position, car_direction, car_frame)
  {
    this.pos = car_position;
  }
  
  this.view_direction = function()
  {
    return [0, -1, 0];
  }

  this.matrix = function()
  {
    return glMatrix.mat4.lookAt(glMatrix.mat4.create(),[ this.pos[0],50, this.pos[2]], this.pos,[0, 0, -1]);	
  }
}