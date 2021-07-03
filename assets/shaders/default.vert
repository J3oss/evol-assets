#version 450
#extension GL_EXT_nonuniform_qualifier : require

#include <shaders://_builtins/types.glsl>

struct Light {
  vec3 color;
  uint intensity;
};

struct Scene {
  uint lightsCount;
};

struct Mesh {
  uint asd;
};

layout( push_constant ) uniform constants
{
	mat4 render_matrix;
  uint indexBufferIndex;
  uint vertexBufferIndex;
  uint materialBufferIndex;
} PushConstants;

layout(set = 1, binding = 0) uniform CameraParam {
  mat4 projection;
  mat4 view;
} Camera;

layout(set = 2, binding = 0) buffer MeshBuffer {
  layout(align = 16) Mesh mesh;
} MeshBuffers[];

layout(set = 2, binding = 1) buffer VertexBuffer {
  layout(align = 16) Vertex vertices[];
} VertexBuffers[];

layout(set = 2, binding = 2) buffer IndexBuffer {
  uint indices[];
} IndexBuffers[];

layout(set = 2, binding = 4) uniform sampler2D texSampler[];

layout(location = 0) out vec3 position;
layout(location = 1) out vec2 uv;
layout(location = 2) out vec3 cameraPos;
layout(location = 3) out vec3 lightPos;
layout(location = 4) smooth out mat3 TBN;

vec4 pointLightPos = vec4(0.0, 2.0, 0.0, 1.0);

void main()
{
  uint index = IndexBuffers[ PushConstants.indexBufferIndex ].indices[gl_VertexIndex];
  Vertex vertex = VertexBuffers[ PushConstants.vertexBufferIndex ].vertices[ index ];

  uv = vertex.uv[0];

  mat3 model = transpose(inverse(mat3(PushConstants.render_matrix)));

  vec3 T = normalize(model * vec3(vertex.tangent));
  vec3 N = normalize(model * vec3(vertex.normal));
  vec3 B = normalize(model * vec3(vertex.bitangent));
  /* T = normalize(T - dot(T, N) * N); // Re-orthoganize T with respect to N */
  /* vec3 B = normalize(cross(N, T)); */
  TBN = mat3(T, B, N);

  mat4 VP = Camera.projection * Camera.view;
  mat4 MVP =  VP * PushConstants.render_matrix;
  gl_Position = MVP * vec4(vertex.position.xyz, 1.0);
  position = (PushConstants.render_matrix * vec4(vertex.position.xyz, 1.0)).xyz;
  cameraPos = inverse(Camera.view)[3].xyz;
  /* lightPos = (pointLightPos).xyz; */
  lightPos = cameraPos;
}
