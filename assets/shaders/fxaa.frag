#version 450

layout(set = 0, binding = 0) uniform sampler2D ppIN;

layout (location = 0) in vec2 outUV;

layout(location = 0) out vec4 outColor;

void main()
{
  vec3 color = texture(ppIN, outUV).rgb;
  outColor = vec4(color, 1.0);
}
