#version 450
#extension GL_EXT_nonuniform_qualifier : require

#include "shaders://_builtins/constants.glsl"
#include "shaders://_builtins/srgb_ops.glsl"
#include "shaders://_builtins/PBR.glsl"

struct Material {
  vec4 baseColor;
  uint albedoTexture;

  uint normalTexture;

  float metallicFactor;
  float roughnessFactor;
  uint metallicRoughnessTexture;
};

struct Light {
  vec3 color;
  uint intensity;
};

struct Scene {
  uint lightsCount;
};

vec3 directional_light = vec3(1.0);

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

layout (set = 0, binding = 2) uniform samplerCube skybox;

layout(set = 2, binding = 3) buffer MaterialBuffer {
  layout(align = 16) Material materials[];
} MaterialBuffers;

layout(set = 2, binding = 4) uniform sampler2D texSampler[];

layout(location = 0) in vec2 uv;
layout(location = 1) smooth in mat3 TBN;
layout(location = 4) in vec4 outpos;
layout(location = 5) in vec3 cameraPos;

layout (location = 0) out vec4 gPosition;
layout (location = 1) out vec4 gNormal;
layout (location = 2) out vec4 gAlbedo;
layout (location = 3) out vec4 gSpecular;

void main() {
  Material material  = MaterialBuffers.materials[ PushConstants.materialBufferIndex ];

  vec3 outNormal;
  if(material.normalTexture == 0) {
    outNormal = TBN[2].xyz;
  } else {
    vec3 sampled_normal = LinearToSRGB(texture(texSampler[material.normalTexture], uv)).rgb;
    sampled_normal = 2.0 * sampled_normal - vec3(1.0);
    outNormal = normalize(TBN * sampled_normal);
  }

  //float intensity = dot(outNormal, normalize(directional_light)) + 0.2;

  vec3 outColor;
  if(material.albedoTexture == 0) {
    outColor = material.baseColor.xyz;
  } else {
    outColor = texture(texSampler[material.albedoTexture], uv).xyz;
  }

  vec3 outSpecular;
  if(material.metallicRoughnessTexture == 0) {
    outSpecular.b = material.metallicFactor;
    outSpecular.g = material.roughnessFactor;
    outSpecular.r = 1;
  } else {
    outSpecular = LinearToSRGB(texture(texSampler[material.metallicRoughnessTexture], uv)).xyz;

    float metallicFactor = outSpecular.z;
    float roughnessFactor = outSpecular.y;
    // vec3 F0 = mix(vec3(0.04), outColor, (metallicFactor - roughnessFactor));
    // float reflectance = max(max(F0.x, F0.y), F0.z);
    // float reflectance = (metallicFactor + roughnessFactor) * 0.5;
    float reflectance = 1.0 - roughnessFactor;

    gNormal.w = outSpecular.x;
    gAlbedo.w = roughnessFactor;
    gPosition.w = metallicFactor;
    gSpecular.w = reflectance;
  }

  vec3 I = normalize(outpos.xyz - cameraPos);
  vec3 R = reflect(I, normalize(outNormal));
  //R = R * -1;
  outSpecular = texture(skybox, R).rgb;


  gPosition = outpos;
  gNormal.xyz = outNormal;
  gAlbedo.xyz = outColor;
  gSpecular.xyz = outSpecular;
}
