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
  mat4 transform;
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

mat4 get_orthographicMatrix(float l, float r, float b, float t, float f, float n)
{
  mat4 M = mat4(0);

    // set OpenGL perspective projection matrix
    M[0][0] = 2 / (r - l);
    M[0][1] = 0;
    M[0][2] = 0;
    M[0][3] = 0;

    M[1][0] = 0;
    M[1][1] = -2 / (t - b);
    M[1][2] = 0;
    M[1][3] = 0;

    M[2][0] = 0;
    M[2][1] = 0;
    M[2][2] = -2 / (f - n);
    M[2][3] = 0;

    M[0][3] = -(r + l) / (r - l);
    M[1][3] = -(t + b) / (t - b);
    M[2][3] = -(f + n) / (f - n);
    M[3][3] = 1;

    return M;
}

void main()
{
  uint index = IndexBuffers[ PushConstants.indexBufferIndex ].indices[gl_VertexIndex];
  Vertex vertex = VertexBuffers[ PushConstants.vertexBufferIndex ].vertices[ index ];

  mat4 lightView = inverse( LightsBuffer.lights[0].transform);
  mat4 lightProjection = get_orthographicMatrix(-1, 1, -1, 1, 100, 0.1);
  mat4 lightSpaceMatrix = lightProjection * lightView;

  gl_Position = lightSpaceMatrix * PushConstants.transform * vec4(vertex.position.xyz, 1.0);
}
