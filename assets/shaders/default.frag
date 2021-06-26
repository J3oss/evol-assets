#version 450
#extension GL_EXT_nonuniform_qualifier : require

struct Material {
  vec4 baseColor;
  uint albedoTexture;

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

vec3 directional_light = vec3(-1.0,-1.0,-1.0);

layout(set = 0, binding = 0) uniform SceneData {
  layout(align = 16) Scene mesh;
} SceneBuffers[];

layout(set = 0, binding = 1) uniform LightBuffer {
  layout(align = 16) Light lights[];
} LightsBuffers;

// layout(set = 2, binding = 4) uniform sampler2D texSampler[];

layout(location = 0) in vec3 normal;
layout(location = 1) in vec3 color;
layout(location = 2) flat in Material material;

layout(location = 0) out vec4 outColor;

void main() {
  float intensity = ((dot(normalize(normal), normalize(directional_light)) +1)/2.0)+0.05;

  // outColor = vec4(color * intensity, 1.0);
  outColor = vec4(color * intensity, 1.0);
}
