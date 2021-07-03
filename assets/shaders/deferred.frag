#version 450

layout(set = 0, binding = 0) uniform sampler2D positionTexture;

layout(set = 0, binding = 1) uniform sampler2D normalTexture;

layout(set = 0, binding = 2) uniform sampler2D albedoTexture;

layout(set = 0, binding = 3) uniform sampler2D specularTexture;

layout (location = 0) in vec2 inUV;

layout(location = 0) out vec4 outColor;

void main()
{
  vec3 fragPos = texture(positionTexture, inUV).rgb;
  vec3 normal = texture(normalTexture, inUV).rgb;
  vec4 albedo = texture(albedoTexture, inUV);

  // outColor = vec4(fragPos, 1.0);
  // outColor = vec4(normal, 1.0);
  outColor = albedo;
}
