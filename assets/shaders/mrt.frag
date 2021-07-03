#version 450
#extension GL_EXT_nonuniform_qualifier : require

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

layout(set = 2, binding = 3) buffer MaterialBuffer {
  layout(align = 16) Material materials[];
} MaterialBuffers;

layout(set = 2, binding = 4) uniform sampler2D texSampler[];

layout(location = 0) in vec2 uv;
layout(location = 1) smooth in mat3 TBN;
layout(location = 4) in vec4 outpos;

layout (location = 0) out vec4 gPosition;
layout (location = 1) out vec3 gNormal;
layout (location = 2) out vec3 gAlbedo;

float near = 0.001;
float far  = 50.0;

float LinearizeDepth(float depth)
{
    float z = depth * 2.0 - 1.0; // back to NDC
    return (2.0 * near * far) / (far + near - z * (far - near));
}

void main() {
  Material material  = MaterialBuffers.materials[ PushConstants.materialBufferIndex ];

  vec3 out_normal;
  if(material.normalTexture == 0) {
    out_normal = TBN[2].xyz;
  } else {
    vec3 sampled_normal = texture(texSampler[material.normalTexture], uv).rgb;
    sampled_normal = 2.0 * sampled_normal - vec3(1.0);
    out_normal = normalize(TBN * sampled_normal);
  }


  float intensity = dot(out_normal, normalize(directional_light)) + 0.2;

  vec3 inColor;
  if(material.albedoTexture == 0) {
    inColor = material.baseColor.xyz;
  } else {
    inColor = texture(texSampler[material.albedoTexture], uv).xyz;
  }

  float depth = LinearizeDepth(gl_FragCoord.z) / far; // divide by far for demonstration

  gPosition = outpos;
  gNormal = out_normal;
  gAlbedo = inColor;
  // outColor = vec4(vec3(outpos.z) * 0.5 + 0.5 , 1.0);
  // outColor = vec4(inColor, 1.0);
  // outColor = vec4(vec3(intensity), 1.0);
  // outColor = vec4(out_normal, 1.0);
}