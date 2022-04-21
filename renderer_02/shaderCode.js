vertexShaderSource = function()
{
return `
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;               
uniform mat4 uProjectionMatrix;              
attribute vec3 aPosition;
attribute vec2 aUVCoords;

varying vec3 vWorldPos;
varying vec2 vUVCoords;

void main(void)                                
{
    vUVCoords = vec2(aUVCoords.x, 1.0 - aUVCoords.y);

    vec4 worldPos = uModelMatrix * vec4(aPosition, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = uProjectionMatrix * uViewMatrix * worldPos;     
}                                              
`;

}

fragmentShaderSource = function()
{
    
return `
#extension GL_OES_standard_derivatives : enable
precision highp float;

struct material
{
    //diffuse color
    bool solid_color;
    vec4 diffuseColor;
    sampler2D texture;

    //specular color
    vec4 specularColor;
    float specularGlossiness;

    //emissive color
    vec4 emissiveColor;

    //normal map
    bool has_normal_map;
    sampler2D normalMap;
};

struct sunLight
{
    vec3 direction;
    vec4 color;
    float intensity;
};

struct pointLight
{
    vec3 position;
    vec4 color;
    float intensity;
    float test;
};

struct spotLight
{
    vec3 position;
    vec3 direction;
    vec4 color;
    float intensity;
    float openingAngle;
    float cutoffAngle;
    float strength;
};

varying vec3 vWorldPos;
varying vec2 vUVCoords;

const int pointLightCount = 0;
const int spotLightCount = 12;

uniform material uMaterial;
uniform vec4 uAmbientColor;
uniform sunLight uSunLight;
//uniform pointLight uPointLights[pointLightCount];
uniform spotLight uSpotLights[spotLightCount];

uniform vec3 uViewDirection;
uniform mat4 uModelMatrix;

vec3 computeNormal(material mat)
{
    if(mat.has_normal_map)   
    {
        vec3 normal = normalize( texture2D(mat.normalMap, vUVCoords).xyz );
        return ( uModelMatrix * vec4(normal, 0.0) ).xyz;
    }
    else
    {
        return normalize(  cross( dFdx(vWorldPos), dFdy(vWorldPos) )  );
    }
}

vec4 getDiffuseColor(material mat)
{
    if( mat.solid_color )
        return mat.diffuseColor;
    else
        return texture2D(mat.texture, vUVCoords);
}

//compute diffuse and specular color
vec4 computeDiffuseColor(vec3 currNormal, vec3 lightDirection, vec4 lightColor, float lightIntensity, vec4 diffuseColor)
{
    float diffuseDot = dot( lightDirection, currNormal );
    if(diffuseDot > 0.0)
        return vec4( (diffuseColor.xyz * lightColor.xyz) * (lightIntensity * diffuseDot), 1.0 );
    else
        return vec4(0.0, 0.0, 0.0, 1.0);
}

vec4 computeSpecularColor(vec3 currNormal, vec3 lightDirection, vec4 lightColor, float lightIntensity, vec4 specularColor)
{
    vec3 halfwayVector = normalize( lightDirection + uViewDirection );
    float specularDot = dot( halfwayVector, currNormal );
    if(specularDot > 0.0)
    {
    specularDot = pow(  dot( halfwayVector, currNormal ), uMaterial.specularGlossiness  );
        return vec4( specularColor.xyz * lightColor.xyz * specularDot * lightIntensity, 1.0 );
    }
    else
        return vec4(0.0, 0.0, 0.0, 1.0);
}

vec4 computeSunColor(vec3 currNormal, vec3 lightDirection, vec4 lightColor, float lightIntensity, vec4 materialDiffuseColor, vec4 materialSpecularColor)
{
    vec4 diffuseColor = computeDiffuseColor(currNormal, lightDirection, lightColor, lightIntensity, materialDiffuseColor);
    vec4 specularColor = computeSpecularColor(currNormal, lightDirection, lightColor, lightIntensity, materialSpecularColor);
    return diffuseColor + specularColor;
}

vec3 computePointDirection(vec3 currNormal, vec3 position)
{
    return normalize( position - vWorldPos );
}

float computePointDistance(vec3 worldPos, vec3 position)
{
    return length( position - worldPos );
}

vec4 computeAttenuatedColor(vec3 currNormal, vec3 lightDirection, vec4 lightColor, float lightIntensity,
    float lightDistance, vec4 materialDiffuseColor, vec4 materialSpecularColor)
{
    vec4 sunColor = computeSunColor(currNormal, lightDirection, lightColor, lightIntensity, materialDiffuseColor, materialSpecularColor);

    float attenuation = min( 1.0 / (lightDistance * lightDistance), 1.0 );
    return sunColor * attenuation;
}

vec4 computePointColor(vec3 currNormal, vec3 lightPosition, vec4 lightColor, float lightIntensity,
    vec4 materialDiffuseColor, vec4 materialSpecularColor)
{
    vec3 lightDirection = computePointDirection(currNormal, lightPosition);
    float lightDistance = computePointDistance(vWorldPos, lightPosition);
    return computeAttenuatedColor(currNormal, lightDirection, lightColor, lightIntensity,
        lightDistance, materialDiffuseColor, materialSpecularColor);
}

vec4 computeSpotColor(vec3 currNormal, vec3 lightPosition, vec3 spotDirection, vec4 lightColor, float lightIntensity,
    float spotOpeningAngle, float spotCutoffAngle, float spotStrength,
    vec4 materialDiffuseColor, vec4 materialSpecularColor)
{
    vec3 lightDirection = computePointDirection(currNormal, lightPosition);
    float lightDistance = computePointDistance(vWorldPos, lightPosition);
    vec4 attenuatedColor = computeAttenuatedColor(currNormal, lightDirection, lightColor, lightIntensity,
        lightDistance, materialDiffuseColor, materialSpecularColor);

    float angle = acos(  dot( -lightDirection, spotDirection )  );
    float attenuation = 0.0;
    if(angle < spotOpeningAngle)
        attenuation = 1.0;
    else if(angle < spotCutoffAngle)
        attenuation = 1.0 - pow( (angle - spotOpeningAngle) / (spotCutoffAngle - spotOpeningAngle), spotStrength );

    return attenuatedColor * attenuation;
}

void main(void)                                
{                             
    vec3 currNormal = computeNormal(uMaterial);
    vec4 currDiffuseColor = getDiffuseColor(uMaterial);
    vec4 ambientColor = vec4(uAmbientColor.xyz * currDiffuseColor.xyz, 1.0);
    vec4 emissiveColor = vec4(uMaterial.emissiveColor.xyz, 1.0);

    vec4 lightColorSum = computeSunColor(currNormal, uSunLight.direction, uSunLight.color, uSunLight.intensity, currDiffuseColor, uMaterial.specularColor);

    /*for(int i = 0; i < pointLightCount; i++)
    {
        lightColorSum = lightColorSum + computePointColor(currNormal, uPointLights[i].position, uPointLights[i].color, uPointLights[i].intensity, currDiffuseColor, uMaterial.specularColor);
    }*/

    for(int i = 0; i < spotLightCount; i++)
    {
        lightColorSum = lightColorSum + computeSpotColor(currNormal,
            uSpotLights[i].position, uSpotLights[i].direction, uSpotLights[i].color, uSpotLights[i].intensity,
            uSpotLights[i].openingAngle, uSpotLights[i].cutoffAngle, uSpotLights[i].strength,
            currDiffuseColor, uMaterial.specularColor);
    }

    vec4 outColor = clamp( ambientColor + lightColorSum + emissiveColor, 0.0, 1.0 );
    gl_FragColor = outColor;
}
`;

}