vertexShaderSource = function()
{
return `
uniform mat4 uModelMatrix; 
uniform mat4 uViewMatrix;               
uniform mat4 uProjectionMatrix;              
attribute vec3 aPosition;

varying vec3 vWorldPos;

void main(void)                                
{
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
    vec4 diffuseColor;
    vec4 specularColor;
    float specularGlossiness;
    vec4 emissiveColor;
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

const int pointLightCount = 0;
const int spotLightCount = 12;

uniform material uMaterial;
uniform vec4 uAmbientColor;
uniform sunLight uSunLight;
//uniform pointLight uPointLights[pointLightCount];
uniform spotLight uSpotLights[spotLightCount];
uniform vec3 uViewDirection;

vec3 computeNormal(vec3 worldPos)
{
    return normalize(  cross( dFdx(worldPos), dFdy(worldPos) )  );
}


//compute diffuse and specular color
vec4 computeDiffuseColor(vec3 currNormal, vec3 direction, vec4 color, float intensity)
{
    float diffuseDot = dot( direction, currNormal );
    if(diffuseDot > 0.0)
        return vec4( (uMaterial.diffuseColor.xyz * color.xyz) * (intensity * diffuseDot), 1.0 );
    else
        return vec4(0.0, 0.0, 0.0, 1.0);
}

vec4 computeSpecularColor(vec3 currNormal, vec3 direction, vec4 color, float intensity)
{
    vec3 halfwayVector = normalize( direction + uViewDirection );
    float specularDot = dot( halfwayVector, currNormal );
    if(specularDot > 0.0)
    {
    specularDot = pow(  dot( halfwayVector, currNormal ), uMaterial.specularGlossiness  );
        return vec4( uMaterial.specularColor.xyz * color.xyz * specularDot * intensity, 1.0 );
    }
    else
        return vec4(0.0, 0.0, 0.0, 1.0);
}

vec4 computeSunColor(vec3 currNormal, vec3 direction, vec4 color, float intensity)
{
    vec4 diffuseColor = computeDiffuseColor(currNormal, direction, color, intensity);
    vec4 specularColor = computeSpecularColor(currNormal, direction, color, intensity);
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

vec4 computeAttenuatedColor(vec3 currNormal, vec3 direction, vec4 color, float intensity, float distance)
{
    vec4 sunColor = computeSunColor(currNormal, direction, color, intensity);

    float attenuation = min( 1.0 / (distance * distance), 1.0 );
    return sunColor * attenuation;
}

vec4 computePointColor(vec3 currNormal, vec3 position, vec4 color, float intensity)
{
    vec3 direction = computePointDirection(currNormal, position);
    float distance = computePointDistance(vWorldPos, position);
    return computeAttenuatedColor(currNormal, direction, color, intensity, distance);
}

vec4 computeSpotColor(vec3 currNormal, vec3 position, vec3 spotDirection, vec4 color, float intensity, float openingAngle, float cutoffAngle, float strength)
{
    vec3 direction = computePointDirection(currNormal, position);
    float distance = computePointDistance(vWorldPos, position);
    vec4 attenuatedColor = computeAttenuatedColor(currNormal, direction, color, intensity, distance);

    float angle = acos(  dot( -direction, spotDirection )  );
    float attenuation = 0.0;
    if(angle < openingAngle)
        attenuation = 1.0;
    else if(angle < cutoffAngle)
        attenuation = 1.0 - pow( (angle - openingAngle) / (cutoffAngle - openingAngle), strength );

    return attenuatedColor * attenuation;
}

void main(void)                                
{                             
    vec3 currNormal = computeNormal(vWorldPos);
    vec4 ambientColor = vec4(uAmbientColor.xyz * uMaterial.diffuseColor.xyz, 1.0);
    vec4 emissiveColor = vec4(uMaterial.emissiveColor.xyz, 1.0);

    vec4 lightColorSum = computeSunColor(currNormal, uSunLight.direction, uSunLight.color, uSunLight.intensity);

    /*for(int i = 0; i < pointLightCount; i++)
    {
        lightColorSum = lightColorSum + computePointColor(currNormal, uPointLights[i].position, uPointLights[i].color, uPointLights[i].intensity);
    }*/

    for(int i = 0; i < spotLightCount; i++)
    {
        lightColorSum = lightColorSum + computeSpotColor(currNormal,
            uSpotLights[i].position, uSpotLights[i].direction, uSpotLights[i].color, uSpotLights[i].intensity,
            uSpotLights[i].openingAngle, uSpotLights[i].cutoffAngle, uSpotLights[i].strength);
    }

    vec4 outColor = clamp( ambientColor + lightColorSum + emissiveColor, 0.0, 1.0 );
    gl_FragColor = outColor;
}
`;

}