#version 450

layout(set = 0, binding = 0) uniform sampler2D ppIn;

// layout (location = 0) in vec2 uv;

layout(location = 0) out vec4 outColor;

const vec2 resolution = vec2(1920, 1080);

#define FXAA_SUBPIX_SHIFT (1.0/4.0)
#define FXAA_SPAN_MAX 32.0
#define FXAA_REDUCE_MUL   (1.0/FXAA_SPAN_MAX)
#define FXAA_REDUCE_MIN   (1.0/256.0)

void main()
{
  vec2 rcpFrame = 1./resolution.xy;
  vec2 uv2 = gl_FragCoord.xy / resolution.xy;

  vec4 uv = vec4(uv2, uv2 - (rcpFrame * (0.5 + FXAA_SUBPIX_SHIFT)));

  vec3 luma = vec3(0.299, 0.587, 0.114);

  vec3 rgbNW = texture(ppIn, uv.zw).xyz;
  vec3 rgbNE = texture(ppIn, uv.zw + vec2(1,0)*rcpFrame.xy).xyz;
  vec3 rgbSW = texture(ppIn, uv.zw + vec2(0,1)*rcpFrame.xy).xyz;
  vec3 rgbSE = texture(ppIn, uv.zw + vec2(1,1)*rcpFrame.xy).xyz;
  vec3 rgbM  = texture(ppIn, uv.xy).xyz;

  float lumaNW = dot(rgbNW, luma);
  float lumaNE = dot(rgbNE, luma);
  float lumaSW = dot(rgbSW, luma);
  float lumaSE = dot(rgbSE, luma);
  float lumaM  = dot(rgbM,  luma);

  float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
  float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

  vec2 dir;
  dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
  dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));

  float dirReduce = max(
    (lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL),
    FXAA_REDUCE_MIN);
  float rcpDirMin = 1.0/(min(abs(dir.x), abs(dir.y)) + dirReduce);
  
  dir = min(vec2( FXAA_SPAN_MAX,  FXAA_SPAN_MAX),
        max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
        dir * rcpDirMin)) * rcpFrame.xy;

  vec3 rgbA = (1.0/2.0) * (
      texture(ppIn, uv.xy + dir * (1.0/3.0 - 0.5)).xyz +
      texture(ppIn, uv.xy + dir * (2.0/3.0 - 0.5)).xyz);
  vec3 rgbB = rgbA * (1.0/2.0) + (1.0/4.0) * (
      texture(ppIn, uv.xy + dir * (0.0/3.0 - 0.5)).xyz +
      texture(ppIn, uv.xy + dir * (3.0/3.0 - 0.5)).xyz);
  
  float lumaB = dot(rgbB, luma);

  if((lumaB < lumaMin) || (lumaB > lumaMax)) 
    outColor = vec4(rgbA, 1.0);
  else
    outColor = vec4(rgbB, 1.0);

  if(uv.x < 0.5)
    outColor = vec4(rgbM, 1.0);
}
