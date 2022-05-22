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

ControllableChaseCamera = function(center, cam_position)
{  
  this.camera_default_y_angle = 90 - get_angle_with_y(center, cam_position);

  this.camera_x_angle = 0;
  this.camera_y_angle = this.camera_default_y_angle;
  this.camera_offset = glMatrix.vec4.create();

  this.camera_position = [cam_position[0], cam_position[1], cam_position[2], 1];
  this.camera_direction = [0, 0, -1, 0];
  this.camera_offset = [0, 0, 0, 0];

  this.camera_upper_y_angle = 89;
  this.camera_lower_y_angle = - this.camera_upper_y_angle;
  this.camera_world_frame = glMatrix.mat4.create();
  
  this.update = function(car_position, car_direction, car_frame)
  {
    glMatrix.mat4.copy(this.camera_world_frame, car_frame);
  }

  this.view_direction = function()
  {
    let rot_matrix = get_rotation_matrix(this);
    let direction = glMatrix.vec4.clone(this.camera_direction);
    glMatrix.vec4.transformMat4(direction, direction, rot_matrix);
    glMatrix.vec4.transformMat4(direction, direction, this.camera_world_frame);
    glMatrix.vec4.scale(direction, direction, -1);
    glMatrix.vec4.normalize(direction, direction);
    return glMatrix.vec3.clone(direction);
  }

  this.matrix = function()
  {
    let rot_matrix = get_rotation_matrix(this);
    let direction = glMatrix.vec4.clone(this.camera_direction);
    glMatrix.vec4.transformMat4(direction, direction, rot_matrix);

    let cam_pos = glMatrix.vec4.clone(this.camera_position);
    let center = glMatrix.vec4.add(glMatrix.vec4.create(), direction, cam_pos);
    glMatrix.vec4.add(center, center, this.camera_offset);
    glMatrix.vec4.add(cam_pos, cam_pos, this.camera_offset);
    glMatrix.vec4.transformMat4(center, center, this.camera_world_frame);
    glMatrix.vec4.transformMat4(cam_pos, cam_pos, this.camera_world_frame);
    
    return glMatrix.mat4.lookAt(glMatrix.mat4.create(), cam_pos, center, [0, 1, 0]);
  }
  
  this.reset_camera = function()
  {
    this.camera_x_angle = 0;
    this.camera_y_angle = this.camera_default_y_angle;
    this.camera_offset = glMatrix.vec4.create();
  }

  this.add_rotation = function(x_rot, y_rot)
  {
    this.camera_y_angle += y_rot;
    if(this.camera_y_angle > this.camera_upper_y_angle) this.camera_y_angle = this.camera_upper_y_angle;
    else if(this.camera_y_angle < this.camera_lower_y_angle) this.camera_y_angle = this.camera_lower_y_angle;

    this.camera_x_angle += x_rot;
  }

  this.add_offset = function(offset)
  {
    let rotation_matrix = get_rotation_matrix(this);
    glMatrix.vec3.add(
      this.camera_offset,
      this.camera_offset,
      glMatrix.vec3.transformMat4(
        glMatrix.vec3.create(),
        offset,
        rotation_matrix
      )
    );
  }

  let get_rotation_matrix = function(me)
  {
    let rot_matrix = glMatrix.mat4.create();
    glMatrix.mat4.rotateY(rot_matrix, rot_matrix, glMatrix.glMatrix.toRadian(me.camera_x_angle));
    glMatrix.mat4.rotateX(rot_matrix, rot_matrix, glMatrix.glMatrix.toRadian(me.camera_y_angle));
    return rot_matrix;
  }
}

let get_angle_with_y = function(center, cam_position)
{
  let view_dir = glMatrix.vec3.sub(glMatrix.vec3.create(), center, cam_position);
  glMatrix.vec3.normalize(view_dir, view_dir);
  let up_axis = [0, 1, 0];

  let angle = Math.acos( glMatrix.vec3.dot(up_axis, view_dir) );
  return angle * 180 / Math.PI;
}
