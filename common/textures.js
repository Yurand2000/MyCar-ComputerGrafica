load_texture = function(gl, src, texture_num, repeat)
{
    if(repeat === undefined || repeat)
        repeat = gl.REPEAT;
    else
        repeat = gl.CLAMP_TO_EDGE;

    var texture = gl.createTexture();

    load_empty_texture_bind(gl, texture, gl.TEXTURE_2D, [1, 1], texture_num, [120, 120, 255, 255]);
    load_image_to_texture(gl, texture, gl.TEXTURE_2D, src, texture_num,
        {
            min_filter : gl.LINEAR_MIPMAP_LINEAR,
            mag_filter : gl.LINEAR,
            wrap_s : repeat,
            wrap_t : repeat
        }
    );

    return texture;
}

make_empty_texture = function(gl, size, texture_num, repeat)
{
    if(repeat === undefined || repeat)
        repeat = gl.REPEAT;
    else
        repeat = gl.CLAMP_TO_EDGE;

    var texture = gl.createTexture();

    load_empty_texture_bind(gl, texture, gl.TEXTURE_2D, size, texture_num,
        {
            min_filter : gl.LINEAR,
            mag_filter : gl.LINEAR,
            wrap_s : repeat,
            wrap_t : repeat
        }
    );

    return texture;
}

make_empty_depth_texture = function(gl, size, texture_num)
{
    var texture = gl.createTexture();

    gl.activeTexture(gl.TEXTURE0 + texture_num);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, size[0], size[1], 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
    
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}

make_cubemap = function (gl, posx, negx, posy, negy, posz, negz, texture_num)
{
	texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + texture_num);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    set_texture_parameters(gl, texture, gl.TEXTURE_CUBE_MAP, texture_num,
        {
            min_filter : gl.LINEAR,
            mag_filter : gl.LINEAR,
            wrap_s : gl.CLAMP_TO_EDGE,
            wrap_t : gl.CLAMP_TO_EDGE
        }
    );

    let color = [128, 128, 255, 255];
    load_empty_texture(gl, gl.TEXTURE_CUBE_MAP_POSITIVE_X, [1, 1], color);
    load_empty_texture(gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, [1, 1], color);
    load_empty_texture(gl, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, [1, 1], color);
    load_empty_texture(gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, [1, 1], color);
    load_empty_texture(gl, gl.TEXTURE_CUBE_MAP_POSITIVE_Z, [1, 1], color);
    load_empty_texture(gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, [1, 1], color);

	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

    loadImages([posx, negx, posy, negy, posz, negz]).then(function(images)
    {
        gl.activeTexture(gl.TEXTURE0 + texture_num);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

        load_image_texture(gl, gl.TEXTURE_CUBE_MAP_POSITIVE_X, images[0], false);
        load_image_texture(gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, images[1], false);
        load_image_texture(gl, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, images[2], false);
        load_image_texture(gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, images[3], false);
        load_image_texture(gl, gl.TEXTURE_CUBE_MAP_POSITIVE_Z, images[4], false);
        load_image_texture(gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, images[5], false);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    });

	return texture;
}

load_empty_texture_bind = function(gl, texture, texture_type, size, texture_num, color, params)
{
    gl.activeTexture(gl.TEXTURE0 + texture_num);
    gl.bindTexture(texture_type, texture);

    load_empty_texture(gl, texture_type, size, color, params);
    
    gl.bindTexture(texture_type, null);
}

load_empty_texture = function(gl, texture_type, size, color, params)
{
    let array = null;
    if(color != null)
    {
        array = new Uint8Array(size[0] * size[1] * 4);
        for(i = 0; i < size[0] * size[1] * 4; i += 4)
        {
            array[i]   = color[0];
            array[i+1] = color[1];
            array[i+2] = color[2];
            array[i+3] = color[3];
        }
    }

    gl.texImage2D(texture_type, 0, gl.RGBA, size[0], size[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, array);

    if( !(params === undefined) )
        set_texture_parameters(gl, texture_type, params);
}

load_image_texture_bind = function(gl, texture, texture_type, texture_num, image, generateMipmaps, params)
{
    gl.activeTexture(gl.TEXTURE0 + texture_num);
    gl.bindTexture(texture_type, texture);

    load_image_texture(gl, texture_type, image, generateMipmaps, params);

    gl.bindTexture(texture_type, null);
}

load_image_texture = function(gl, texture_type, image, generateMipmaps, params)
{
    gl.texImage2D(texture_type, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    if( !(params === undefined) )
        set_texture_parameters(gl, texture_type, params);
    
    if( generateMipmaps && isPowerOf2(image.width) && isPowerOf2(image.height) )
    {
        gl.generateMipmap(texture_type);
        return true;
    }
    else
    {
        return false;
    }
}

load_image_to_texture = function(gl, texture, texture_type, src, texture_num, params)
{
    var image = new Image();
    image.src = src;
    image.addEventListener('load', function()
    {
        load_image_texture_bind(gl, texture, texture_type, texture_num, image, true, params);
    });

    return image;
}

set_texture_parameters_bind = function(gl, texture, texture_type, texture_num, params)
{
    gl.activeTexture(gl.TEXTURE0 + texture_num);
    gl.bindTexture(texture_type, texture);

    set_texture_parameters(gl, texture_type, params);
    
    gl.bindTexture(texture_type, null);
}

set_texture_parameters = function(gl, texture_type, params)
{
    if(params.min_filter != null)
        gl.texParameteri(texture_type, gl.TEXTURE_MIN_FILTER, params.min_filter);    
    if(params.mag_filter != null)
        gl.texParameteri(texture_type, gl.TEXTURE_MAG_FILTER, params.mag_filter);

    if(params.wrap_s != null)
        gl.texParameteri(texture_type, gl.TEXTURE_WRAP_S, params.wrap_s);    
    if(params.wrap_t != null)
        gl.texParameteri(texture_type, gl.TEXTURE_WRAP_T, params.wrap_t);
}

function isPowerOf2(value)
{
    return (value & (value - 1)) == 0;
}

async function loadImages(images_srcs)
{
    const promises = [];
    const images = [];

    for (let src of images_srcs)
    {
        promises.push(
            new Promise(resolve =>
            {
                let img = new Image();
                img.onload = resolve;
                img.src = src;
                images.push(img);
            })
        );
    }

    await Promise.all(promises);
    return images;
}