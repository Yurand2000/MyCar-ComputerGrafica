makeCar = function()
{
    let new_car = {};

    new_car.initialize = function(gl)
    {
        new_car.car_frame = new Cube();
        new_car.rotation_angle = 0;
        createObjectBuffers(gl, new_car.car_frame);
        new_car.car_frame_transform = glMatrix.mat4.create();
        glMatrix.mat4.translate(new_car.car_frame_transform, new_car.car_frame_transform, [0, 0.2, 0]);
        glMatrix.mat4.scale(new_car.car_frame_transform, new_car.car_frame_transform, [2, 0.5, 4]);
        glMatrix.mat4.translate(new_car.car_frame_transform, new_car.car_frame_transform, [0, 0.5, 0]);
        glMatrix.mat4.scale(new_car.car_frame_transform, new_car.car_frame_transform, [0.5, 0.5, 0.5]); //set the cube side length to 1

        new_car.car_wheel = new Cylinder(16);
        createObjectBuffers(gl, new_car.car_wheel);
        var car_wheel_translation = glMatrix.mat4.create();
        glMatrix.mat4.translate(car_wheel_translation, car_wheel_translation, [0.15, 0, 0]);

        new_car.car_wheel_transform = glMatrix.mat4.create();
        new_car.car_wheel_radius = 0.3;
        glMatrix.mat4.rotateZ(new_car.car_wheel_transform, new_car.car_wheel_transform, glMatrix.glMatrix.toRadian(90));
        glMatrix.mat4.scale(new_car.car_wheel_transform, new_car.car_wheel_transform, [new_car.car_wheel_radius, 0.3, new_car.car_wheel_radius]);
        glMatrix.mat4.scale(new_car.car_wheel_transform, new_car.car_wheel_transform, [1, 0.5, 1]); //set the cilinder height and radius to 1

        new_car.car_wheel_translation_fl = glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [-1, 0.3, -1.5]);
        glMatrix.mat4.mul(new_car.car_wheel_translation_fl, new_car.car_wheel_translation_fl, car_wheel_translation);
        new_car.car_wheel_translation_fr = glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [1, 0.3, -1.5]);
        glMatrix.mat4.mul(new_car.car_wheel_translation_fr, new_car.car_wheel_translation_fr, car_wheel_translation);
        new_car.car_wheel_translation_bl = glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [-1, 0.3, 1.5]);
        glMatrix.mat4.mul(new_car.car_wheel_translation_bl, new_car.car_wheel_translation_bl, car_wheel_translation);
        new_car.car_wheel_translation_br = glMatrix.mat4.fromTranslation(glMatrix.mat4.create(), [1, 0.3, 1.5]);
        glMatrix.mat4.mul(new_car.car_wheel_translation_br, new_car.car_wheel_translation_br, car_wheel_translation);
    }

    new_car.draw = function(car, gl, shader, stack, use_color)
    {
        stack.push();
        stack.multiply(new_car.car_frame_transform);
        new_car.loadModelMatrix(gl, shader, stack);
        drawObject(new_car.car_frame, [0.2, 0.2, 1, 1], gl, shader, use_color);
        stack.pop();
      
        var speed = car.speed;
        var circumference = new_car.car_wheel_radius * 2 * 3.1415;
        new_car.rotation_angle = new_car.rotation_angle + (speed / circumference);
        var car_wheel_speed = glMatrix.mat4.fromXRotation(glMatrix.mat4.create(), -new_car.rotation_angle);
        var steering_angle = car.wheelsAngle;
        var car_wheel_rotation_and_speed = glMatrix.mat4.fromYRotation(glMatrix.mat4.create(), steering_angle);
        glMatrix.mat4.mul(car_wheel_rotation_and_speed, car_wheel_rotation_and_speed, car_wheel_speed);
      
        stack.push();
        stack.multiply(new_car.car_wheel_translation_fl);
        stack.push();
        stack.multiply(car_wheel_rotation_and_speed);
        stack.push();
        stack.multiply(new_car.car_wheel_transform);
        new_car.loadModelMatrix(gl, shader, stack);
        drawObject(new_car.car_wheel, [0.2, 0.2, 0.2, 1], gl, shader, use_color);
        stack.pop();
        stack.pop();
        stack.pop();
      
        stack.push();
        stack.multiply(new_car.car_wheel_translation_fr);
        stack.push();
        stack.multiply(car_wheel_rotation_and_speed);
        stack.push();
        stack.multiply(new_car.car_wheel_transform);
        new_car.loadModelMatrix(gl, shader, stack);
        drawObject(new_car.car_wheel, [0.2, 0.2, 0.2, 1], gl, shader, use_color);
        stack.pop();
        stack.pop();
        stack.pop();
      
      
      
        stack.push();
        stack.multiply(new_car.car_wheel_translation_bl);
        stack.push();
        stack.multiply(car_wheel_speed);
        stack.push();
        stack.multiply(new_car.car_wheel_transform);
        new_car.loadModelMatrix(gl, shader, stack);
        drawObject(new_car.car_wheel, [0.2, 0.2, 0.2, 1], gl, shader, use_color);
        stack.pop();
        stack.pop();
        stack.pop();
      
        stack.push();
        stack.multiply(new_car.car_wheel_translation_br);
        stack.push();
        stack.multiply(car_wheel_speed);
        stack.push();
        stack.multiply(new_car.car_wheel_transform);
        new_car.loadModelMatrix(gl, shader, stack);
        drawObject(new_car.car_wheel, [0.2, 0.2, 0.2, 1], gl, shader, use_color);
        stack.pop();
        stack.pop();
        stack.pop();
    }
    
    new_car.loadModelMatrix = function(gl, shader, stack)
    {    
      gl.uniformMatrix4fv(shader.uModelMatrixLocation, false, stack.matrix);
    }

    return new_car;
}