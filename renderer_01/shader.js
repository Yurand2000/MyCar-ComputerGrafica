uniformShader = function (gl)
{
    let attributes =
    [
        { location: "aPositionIndex", attribute: "aPosition", index: 0 }
    ];

    let uniforms =
    [
        //vertex shader uniforms
        { location: "uModelMatrixLocation", uniform: "uModelMatrix" },
        { location: "uViewMatrixLocation", uniform: "uViewMatrix" },
        { location: "uProjectionMatrixLocation", uniform: "uProjectionMatrix" },
    
        //fragment shader uniforms
        { location: "uViewDirectionLocation", uniform: "uViewDirection" },
    
        //material related uniforms
        { defineGroup: "uMaterialLocation" },
        { location: "uColorLocation", uniform: "uMaterial.diffuseColor" },
        { group: "uMaterialLocation", location: "diffuseColor", uniform: "uMaterial.diffuseColor" },
        { group: "uMaterialLocation", location: "specularColor", uniform: "uMaterial.specularColor" },
        { group: "uMaterialLocation", location: "specularGlossiness", uniform: "uMaterial.specularGlossiness" },
        { group: "uMaterialLocation", location: "emissiveColor", uniform: "uMaterial.emissiveColor" },
        
        //ambient related uniforms
        { location: "uAmbientColorLocation", uniform: "uAmbientColor" },
        
        //sunlight uniforms
        { defineGroup: "uSunLocation" },
        { group: "uSunLocation", location: "direction", uniform: "uSunLight.direction" },
        { group: "uSunLocation", location: "color", uniform: "uSunLight.color" },
        { group: "uSunLocation", location: "intensity", uniform: "uSunLight.intensity" },
    ];

    //point light uniforms
    uniforms.push({ defineArray: "uPointLightLocation" });
    for(var i = 0; i < Game.scene.lamps.length; i++)
    {
        uniforms.push({ array: "uPointLightLocation", defineIndex: i });
        uniforms.push({ array: "uPointLightLocation", index: i, location: "position", uniform: "uPointLights[" + i + "].position" });
        uniforms.push({ array: "uPointLightLocation", index: i, location: "color", uniform: "uPointLights[" + i + "].color" });
        uniforms.push({ array: "uPointLightLocation", index: i, location: "intensity", uniform: "uPointLights[" + i + "].intensity" });
    }

    //spotlight uniforms
    uniforms.push({ defineArray: "uSpotLightLocation" });
    for(var i = 0; i < Game.scene.lamps.length; i++)
    {
        uniforms.push({ array: "uSpotLightLocation", defineIndex: i });
        uniforms.push({ array: "uSpotLightLocation", index: i, location: "position", uniform: "uSpotLights[" + i + "].position" });
        uniforms.push({ array: "uSpotLightLocation", index: i, location: "direction", uniform: "uSpotLights[" + i + "].direction" });
        uniforms.push({ array: "uSpotLightLocation", index: i, location: "color", uniform: "uSpotLights[" + i + "].color" });
        uniforms.push({ array: "uSpotLightLocation", index: i, location: "intensity", uniform: "uSpotLights[" + i + "].intensity" });
        uniforms.push({ array: "uSpotLightLocation", index: i, location: "openingAngle", uniform: "uSpotLights[" + i + "].openingAngle" });
        uniforms.push({ array: "uSpotLightLocation", index: i, location: "cutoffAngle", uniform: "uSpotLights[" + i + "].cutoffAngle" });
        uniforms.push({ array: "uSpotLightLocation", index: i, location: "strength", uniform: "uSpotLights[" + i + "].strength" });
    }

    let shaderProgram = makeShader(gl, vertexShaderSource(), fragmentShaderSource(), attributes, uniforms);

    //set defaults
    gl.useProgram(shaderProgram);
    gl.uniform4fv(shaderProgram.uMaterialLocation.diffuseColor, [ 0, 0, 0, 1 ]);
    gl.uniform4fv(shaderProgram.uMaterialLocation.specularColor, [ 1, 1, 1, 1 ]);
    gl.uniform1f(shaderProgram.uMaterialLocation.specularGlossiness, 10.0);
    gl.uniform4fv(shaderProgram.uMaterialLocation.emissiveColor, [ 0, 0, 0, 1 ]);

    gl.uniform4fv(shaderProgram.uAmbientColorLocation, [ 0.1, 0.1, 0.1, 1 ]);
    gl.uniform3fv(shaderProgram.uViewDirectionLocation, [ 1, 0, 0 ]);

    //fill sunlight uniforms
    gl.uniform3fv(shaderProgram.uSunLocation.direction, [ 0, 1, 0 ]);
    gl.uniform4fv(shaderProgram.uSunLocation.color, [ 1, 0.8, 0.8, 1 ]);
    gl.uniform1f(shaderProgram.uSunLocation.intensity, 1.0);

    //fill pointlight uniforms
    for(var i = 0; i < Game.scene.lamps.length; i++)
    {
        gl.uniform3fv(shaderProgram.uPointLightLocation[i].position, [ 0, 0, 0 ]);
        gl.uniform4fv(shaderProgram.uPointLightLocation[i].color, [ 1, 1, 1, 1 ]);
        gl.uniform1f(shaderProgram.uPointLightLocation[i].intensity, 0);

        gl.uniform3fv(shaderProgram.uSpotLightLocation[i].position, [ 0, 0, 0 ]);
        gl.uniform3fv(shaderProgram.uSpotLightLocation[i].direction, [ 0, -1, 0 ]);
        gl.uniform4fv(shaderProgram.uSpotLightLocation[i].color, [ 1, 1, 1, 1 ]);
        gl.uniform1f(shaderProgram.uSpotLightLocation[i].intensity, 0);
        gl.uniform1f(shaderProgram.uSpotLightLocation[i].openingAngle, glMatrix.glMatrix.toRadian(20));
        gl.uniform1f(shaderProgram.uSpotLightLocation[i].cutoffAngle, glMatrix.glMatrix.toRadian(45));
        gl.uniform1f(shaderProgram.uSpotLightLocation[i].strength, 3);
    }

    gl.useProgram(null);

    return shaderProgram;
};