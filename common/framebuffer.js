makeFramebuffer = function(gl, size)
{
    var framebuffer = gl.createFramebuffer();

    framebuffer.depth_texture = make_empty_depth_texture(gl, size, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        gl.TEXTURE_2D,
        framebuffer.depth_texture,
        0);

    let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status != gl.FRAMEBUFFER_COMPLETE)
    {
        var str = "Unable to initialize the framebuffer.\n\n";
        if(status == gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT)
            str += "Incomplete Attachment";
        else if(status == gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT)
            str += "Incomplete Missing Attachment";
        alert(str);
    }
        

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return framebuffer;
}