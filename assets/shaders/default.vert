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

struct Vertex {
  vec4 position;
  vec4 normal;
  vec4 color;
  vec2 uv[2];
};

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

layout(set = 2, binding = 3) buffer MaterialBuffer {
  layout(align = 16) Material materials[];
} MaterialBuffers;

layout(set = 2, binding = 4) uniform sampler2D texSampler[];

layout(location = 0) out vec3 normal;
layout(location = 1) out vec3 color;
layout(location = 2) out Material material;

void main()
{
  material  = MaterialBuffers.materials[ PushConstants.materialBufferIndex ];

  uint index = IndexBuffers[ PushConstants.indexBufferIndex ].indices[gl_VertexIndex];
  Vertex vertex = VertexBuffers[ PushConstants.vertexBufferIndex ].vertices[ index ];

  color = texture(texSampler[material.albedoTexture], vertex.uv[0]).xyz;

  if(material.normalTexture != 0) {
    normal = texture(texSampler[material.normalTexture], vertex.uv[0]).xyz;
  }
  else {
    normal = vertex.normal.xyz;
  }

  gl_Position = Camera.projection * Camera.view * PushConstants.render_matrix * vec4(vertex.position.xyz, 1.0);
}
