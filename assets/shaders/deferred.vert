#version 450

layout(set = 1, binding = 0) uniform CameraParam {
  mat4 projection;
  mat4 view;
} Camera;

layout (location = 0) out vec2 outUV;
layout(location = 1) out vec3 cameraPos;

void main()
{
	outUV = vec2((gl_VertexIndex << 1) & 2, gl_VertexIndex & 2);
	gl_Position = vec4(outUV * 2.0f - 1.0f, 0.0f, 1.0f);

  cameraPos = inverse(Camera.view)[3].xyz;
}
