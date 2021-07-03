#version 450
#extension GL_EXT_nonuniform_qualifier : require

#include "shaders://_builtins/types.glsl"
#include "shaders://_builtins/constants.glsl"
#include "shaders://_builtins/srgb_ops.glsl"
#include "shaders://_builtins/PBR.glsl"

struct Light {
  vec3 color;
  uint intensity;
};

struct Scene {
  uint lightsCount;
};

vec3 pointLightColor = vec3(1.0, 1.0, 1.0);

layout( push_constant ) uniform constants
{
	mat4 render_matrix;
  uint indexBufferIndex;
  uint vertexBufferIndex;
  uint materialBufferIndex;
} PushConstants;

layout(set = 0, binding = 0) uniform SceneData {
  layout(align = 16) Scene mesh;
} SceneBuffers[];

layout(set = 0, binding = 1) uniform LightBuffer {
  layout(align = 16) Light lights[];
} LightsBuffers;

layout(set = 2, binding = 3) buffer MaterialBuffer {
  layout(align = 16) Material materials[];
} MaterialBuffers;

layout(set = 2, binding = 4) uniform sampler2D texSampler[];

layout(location = 0) in vec3 position;
layout(location = 1) in vec2 uv;
layout(location = 2) in vec3 cameraPos;
layout(location = 3) in vec3 pointLightPos;
layout(location = 4) smooth in mat3 TBN;

layout(location = 0) out vec4 outColor;

vec4 GetAlbedo(Material material, vec2 uv)
{
  vec4 albedo;
  if(material.albedoTexture == 0) {
    albedo = material.baseColor;
  } else {
    albedo = texture(texSampler[material.albedoTexture], uv);
  }
  return albedo;
}

vec3 GetNormal(Material material, vec2 uv, mat3 TBN)
{
  vec3 normal;
  if(material.normalTexture == 0) {
    normal = TBN[2].xyz;
  } else {
    vec3 sampled_normal = LinearToSRGB(texture(texSampler[material.normalTexture], uv)).rgb;
    sampled_normal = 2.0 * sampled_normal - vec3(1.0);
    normal = normalize(TBN * sampled_normal);
  }
  return normal;
}

void main() 
{
  Material material  = MaterialBuffers.materials[ PushConstants.materialBufferIndex ];

  vec4 albedo4 = GetAlbedo(material, uv);
  if(albedo4.a < 0.5) {
    // discard;
  }
  vec3 albedo = albedo4.rgb;

  vec3 N = GetNormal(material, uv, TBN);

  float metallicFactor;
  float roughnessFactor;
  float ao;
  if(material.metallicRoughnessTexture == 0) {
    metallicFactor = material.metallicFactor;
    roughnessFactor = material.roughnessFactor;
  } else {
    vec4 sampled_mr = LinearToSRGB(texture(texSampler[material.metallicRoughnessTexture], uv));
    ao = sampled_mr.r;
    roughnessFactor = sampled_mr.g;
    metallicFactor = sampled_mr.b;
  }

  vec3 emissiveness;
  if(material.emissiveTexture == 0) {
    emissiveness = vec3(0.0);
  } else {
    emissiveness = texture(texSampler[material.emissiveTexture], uv).rgb;
    emissiveness *= material.emissiveFactor.xyz;
  }

  float lightIntensity = 2.0;

  vec3 V = normalize(cameraPos - position);
  vec3 L = normalize(pointLightPos - position);
  vec3 H = normalize(V + L);
  float distance    = length(pointLightPos - position);
  float attenuation = 1.0 / (distance * distance);
  vec3 radiance     = pointLightColor * attenuation * lightIntensity;

  vec3 F0 = vec3(0.04); 
  F0      = mix(F0, albedo, metallicFactor);

  vec3 F  = fresnelSchlick(max(dot(H, V), 0.0), F0);
  float NDF = DistributionGGX(N, H, roughnessFactor);
  float G   = GeometrySmith(N, V, L, roughnessFactor);

  vec3 numerator    = NDF * G * F;
  float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0);
  vec3 specular     = numerator / max(denominator, 0.001);

  vec3 kS = F;
  vec3 kD = vec3(1.0) - kS;
  kD *= 1.0 - metallicFactor;

  float NdotL = max(dot(N, L), 0.0);        
  vec3 Lo = (kD * albedo / PI + specular) * radiance * NdotL;

  vec3 ambient = vec3(0.03) * albedo * ao;

  vec3 color   = ambient + Lo;
  color += emissiveness;
  color = color / (color + vec3(1.0));

  outColor = vec4(color, 1.0);
}
