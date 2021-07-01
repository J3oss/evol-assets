#ifndef EV_GLSL_TYPES_H
#define EV_GLSL_TYPES_H

struct Material {
  vec4 baseColor;
  uint albedoTexture;

  uint normalTexture;

  float metallicFactor;
  float roughnessFactor;
  uint metallicRoughnessTexture;

  vec4 emissiveFactor;
  uint emissiveTexture;
};

struct Vertex {
  vec4 position;
  vec4 normal;
  vec2 uv[2];
  vec4 tangent;
  vec4 bitangent; // No longer needed. // TODO remove
};

#endif
