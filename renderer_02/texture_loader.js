load_texture = function(gl, src, texture_num)
{
    var texture = gl.createTexture();

    gl.activeTexture(gl.TEXTURE0 + texture_num);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
        1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([120, 120, 255, 255]));
    
    gl.bindTexture(gl.TEXTURE_2D, null);

    var image = new Image();
    image.src = src;
    image.addEventListener('load', function()
    {	
        gl.activeTexture(gl.TEXTURE0 + texture_num);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        if( isPowerOf2(image.width) && isPowerOf2(image.height) )
        {
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        }
        else
        {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }

        gl.bindTexture(gl.TEXTURE_2D, null);
    });

    return texture;
}
function isPowerOf2(value)
{
    return (value & (value - 1)) == 0;
}