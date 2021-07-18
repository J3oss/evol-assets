#version 450

#include "shaders://_builtins/constants.glsl"
#include "shaders://_builtins/PBR.glsl"

struct Light {
  mat4 tranform;
  vec4 color;
  float intensity;
};

const int MAX_LIGHT_COUNT = 128;

layout( push_constant ) uniform constants
{
  uint lightCount;
} PushConstants;

layout(set = 0, binding = 0) uniform sampler2D positionTexture;
layout(set = 0, binding = 1) uniform sampler2D normalTexture;
layout(set = 0, binding = 2) uniform sampler2D albedoTexture;
layout(set = 0, binding = 3) uniform sampler2D specularTexture;

layout(set = 1, binding = 1) uniform LightBuffer {
  layout(align = 16) Light lights[MAX_LIGHT_COUNT];
} LightsBuffer;

layout (location = 0) in vec2 inUV;
layout(location = 1) in vec3 cameraPos;

layout(location = 0) out vec4 outColor;

void main()
{
  vec3 position = texture(positionTexture, inUV).rgb;
  vec3 normal = texture(normalTexture, inUV).rgb;
  vec3 albedo = texture(albedoTexture, inUV).rgb;

  vec3 spec = texture(specularTexture, inUV).rgb;
  float metallicFactor = spec.b;
  float roughnessFactor = spec.g;
  float ao = spec.r;

  vec3 V = normalize(cameraPos - position);

  vec3 Lo = vec3(0);
  for(int i = 0; i < PushConstants.lightCount; ++i)
  {
    Light l = LightsBuffer.lights[i];

    vec3 L = normalize(l.tranform[3].xyz - position);
    vec3 H = normalize(V + L);
    float distance    = length(l.tranform[3].xyz - position);
    float attenuation = 1.0 / (distance * distance);
    vec3 radiance     = l.color.xyz * attenuation * l.intensity;

    vec3 F0 = vec3(0.04);
    F0      = mix(F0, albedo, metallicFactor);

    vec3 F  = fresnelSchlick(max(dot(H, V), 0.0), F0);
    float NDF = DistributionGGX(normal, H, roughnessFactor);
    float G   = GeometrySmith(normal, V, L, roughnessFactor);

    vec3 numerator    = NDF * G * F;
    float denominator = 4.0 * max(dot(normal, V), 0.0) * max(dot(normal, L), 0.0);
    vec3 specular     = numerator / max(denominator, 0.001);

    vec3 kS = F;
    vec3 kD = vec3(1.0) - kS;
    kD *= 1.0 - metallicFactor;

    float NdotL = max(dot(normal, L), 0.0);
    Lo += (kD * albedo / PI + specular) * radiance * NdotL;
  }

  vec3 ambient = vec3(0.2) * albedo * ao;

  vec3 color   = ambient + Lo;
  // color += vec3();
  color = color / (color + vec3(1.0));

  outColor = vec4(color, 1.0);
}
