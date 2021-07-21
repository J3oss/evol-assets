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

float near = 0.001;
float far  = 50.0;

float LinearizeDepth(float depth)
{
    float z = depth * 2.0 - 1.0; // back to NDC
    return (2.0 * near * far) / (far + near - z * (far - near));
}

void main() {
  gNormal = vec4(1.0);
  gSpecular = vec4(1.0);
  gPosition = outpos;
  gAlbedo = vec4(1.0);
}
