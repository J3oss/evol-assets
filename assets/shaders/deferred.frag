#version 450

#include "shaders://_builtins/constants.glsl"
#include "shaders://_builtins/PBR.glsl"

struct Light {
  mat4 transform;
  vec4 color;
  float intensity;
};

const int MAX_LIGHT_COUNT = 128;

#define SHADOW_FACTOR 0.25
layout(set = 1, binding = 1) uniform LightBuffer {
layout(align = 16) Light lights[MAX_LIGHT_COUNT];
} LightsBuffer;

layout( push_constant ) uniform constants
{
  uint lightCount;
} PushConstants;

layout(set = 0, binding = 0) uniform sampler2D positionTexture;
layout(set = 0, binding = 1) uniform sampler2D normalTexture;
layout(set = 0, binding = 2) uniform sampler2D albedoTexture;
layout(set = 0, binding = 3) uniform sampler2D specularTexture;

layout(set = 0, binding = 4) uniform sampler2D shadowmapTexture;

layout (location = 0) in vec2 inUV;
layout(location = 1) in vec3 cameraPos;

layout(location = 0) out vec4 outColor;

mat4 get_orthographicMatrix(float l, float r, float b, float t, float f, float n)
{
  mat4 M = mat4(0);

    // set OpenGL perspective projection matrix
    M[0][0] = 2 / (r - l);
    M[0][1] = 0;
    M[0][2] = 0;
    M[0][3] = 0;

    M[1][0] = 0;
    M[1][1] = -2 / (t - b);
    M[1][2] = 0;
    M[1][3] = 0;

    M[2][0] = 0;
    M[2][1] = 0;
    M[2][2] = -2 / (f - n);
    M[2][3] = 0;

    M[0][3] = -(r + l) / (r - l);
    M[1][3] = -(t + b) / (t - b);
    M[2][3] = -(f + n) / (f - n);
    M[3][3] = 1;

    return M;
}

float textureProj(vec4 P, float bias, vec2 offset)
{
	float shadow = 1.0;
	vec4 shadowCoord = P / P.w;
	shadowCoord.st = shadowCoord.st * 0.5 + 0.5;


	if (shadowCoord.z > -1.0 && shadowCoord.z < 1.0)
	{
		float dist = texture(shadowmapTexture, shadowCoord.st + offset).r;
		if (shadowCoord.w > 0.0 && dist < shadowCoord.z - bias)
		{
			shadow = SHADOW_FACTOR;
		}
	}
	return shadow;
}

float filterPCF(vec4 sc, float bias)
{
  ivec2 texDim = textureSize(shadowmapTexture, 0).xy;
  float scale = 1.5;
  float dx = scale * 1.0 / float(texDim.x);
  float dy = scale * 1.0 / float(texDim.y);

  float shadowFactor = 0.0;
  int count = 0;
  int range = 1;

  for (int x = -range; x <= range; x++)
  {
    for (int y = -range; y <= range; y++)
    {
      shadowFactor += textureProj(sc, bias, vec2(dx*x, dy*y));
      count++;
    }
  }

  return shadowFactor / count;
}

vec4 shadow(vec3 fragcolor, float bias, vec3 fragpos)
{
  mat4 projectionMatrix = get_orthographicMatrix(-1, 1, -1, 1, 100, 0.1);
  mat4 viewMatrix = inverse( LightsBuffer.lights[0].transform);
  vec4 shadowClip	= projectionMatrix * viewMatrix * vec4(fragpos, 1.0);

	float shadowFactor;
	shadowFactor= filterPCF(shadowClip, bias);

	fragcolor *= shadowFactor;

	return vec4(fragcolor, 1.0);
}

void main()
{
  vec4 gposition = texture(positionTexture, inUV);
  vec4 gnormal = texture(normalTexture, inUV);
  vec4 galbedo = texture(albedoTexture, inUV);
  vec4 gspec = texture(specularTexture, inUV);

  vec4 shadowmap = texture(shadowmapTexture, inUV);

  vec3 position = gposition.xyz;
  vec3 normal = gnormal.xyz;
  vec3 albedo = galbedo.xyz;
  vec3 spec = gspec.xyz;
  float specFactor = gspec.w;

  float metallicFactor = gposition.w;
  float roughnessFactor = galbedo.w;
  float ao = gnormal.w;

  vec3 V = normalize(cameraPos - position);

  vec3 F0 = mix(vec3(0.04), albedo, metallicFactor);
  vec3 F  = fresnelSchlickRoughness(max(dot(normal, V), 0.0), F0, roughnessFactor);

  vec3 Lo = vec3(0);

  {
    Light directional_light = LightsBuffer.lights[0];

    vec3 L = vec3(directional_light.transform[2]);
    vec3 H = normalize(V + L);
    vec3 radiance     = directional_light.color.xyz * directional_light.intensity;

    float NDF = DistributionGGX(normal, H, roughnessFactor);
    float G   = GeometrySmith(normal, V, L, roughnessFactor);

    vec3 numerator    = NDF * G * F;
    float denominator = 4.0 * max(dot(normal, V), 0.0) * max(dot(normal, L), 0.0);

    vec3 specular     = numerator / max(denominator, 0.001);

    vec3 kS = F;
    vec3 kD = vec3(1.0) - kS;
    kD *= 1.0 - metallicFactor;

    float NdotL = max(dot(normal, L), 0.0);
    Lo += clamp((kD * albedo / PI + specular) * radiance * NdotL, vec3(0), vec3(1));
  }

  for(int i = 1; i < PushConstants.lightCount; ++i)
  {
    Light l = LightsBuffer.lights[i];

    vec3 L = normalize(l.transform[3].xyz - position);
    vec3 H = normalize(V + L);
    float distance    = length(l.transform[3].xyz - position);
    float attenuation = 1.0 / (distance * distance);
    vec3 radiance     = l.color.xyz * attenuation * l.intensity;

    float NDF = DistributionGGX(normal, H, roughnessFactor);
    float G   = GeometrySmith(normal, V, L, roughnessFactor);

    vec3 numerator    = NDF * G * F;
    float denominator = 4.0 * max(dot(normal, V), 0.0) * max(dot(normal, L), 0.0);

    vec3 specular     = numerator / max(denominator, 0.001);

    vec3 kS = F;
    vec3 kD = vec3(1.0) - kS;
    kD *= 1.0 - metallicFactor;

    float NdotL = max(dot(normal, L), 0.0);
    Lo += clamp((kD * albedo / PI + specular) * radiance * NdotL, vec3(0), vec3(1));
  }

  vec3 ambient = vec3(0.2) * albedo;

  vec3 color =  ambient + Lo;
  color += spec * specFactor;

  float bias = 0.0000005;
  outColor = shadow(color, bias, position);
}
