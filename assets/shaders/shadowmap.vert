#version 450
#extension GL_EXT_nonuniform_qualifier : require

struct Vertex {
  vec4 position;
  vec4 normal;
  vec2 uv[2];
  vec4 tangent;
  vec4 bitangent; // No longer needed. // TODO remove
};

struct Light {
  mat4 tranform;
  vec4 color;
  float intensity;
};

layout( push_constant ) uniform constants
{
	mat4 transform;
  uint indexBufferIndex;
  uint vertexBufferIndex;
} PushConstants;

layout(set = 0, binding = 1) buffer VertexBuffer {
  layout(align = 16) Vertex vertices[];
} VertexBuffers[];

layout(set = 0, binding = 2) buffer IndexBuffer {
  uint indices[];
} IndexBuffers[];

const int MAX_LIGHT_COUNT = 128;

layout(set = 1, binding = 0) uniform LightBuffer {
  layout(align = 16) Light lights[MAX_LIGHT_COUNT];
} LightsBuffer;

float near = 10;
float far = 0.1;

void main()
{
  uint index = IndexBuffers[ PushConstants.indexBufferIndex ].indices[gl_VertexIndex];
  Vertex vertex = VertexBuffers[ PushConstants.vertexBufferIndex ].vertices[ index ];

  mat4 lightView = transpose(inverse( LightsBuffer.lights[0].tranform));
  mat4 lightProjection = mat4(1.0);
  lightProjection[3][2] = -(far+near)/(far-near);
  lightProjection[2][2] = -2/(far-near);

  mat4 lightSpaceMatrix = lightProjection * lightView;

  gl_Position = lightSpaceMatrix * PushConstants.transform * vec4(vertex.position.xyz, 1.0);
}
