/** The backdrop ribbon as SkSL, for targets that run it (Motionade). */
export const CHEVRON_RIBBON_SKSL = `uniform float4 ms_contentRect;
uniform float ms_dpr;
uniform float p_spinAngle;
uniform float p_pillarSize;
uniform float p_baseHalfGap;
uniform float p_chevronSlope;
uniform float p_fadeHeight;
uniform float4 p_limeColor;

float2 frontProfile(float x, float S, float theta) {
  float R = S * 0.70710678;
  float a0 = theta + 0.78539816;
  float a1 = theta + 2.35619449;
  float a2 = theta + 3.92699082;
  float a3 = theta + 5.49778714;
  float2 v0 = float2(R * sin(a0), R * cos(a0));
  float2 v1 = float2(R * sin(a1), R * cos(a1));
  float2 v2 = float2(R * sin(a2), R * cos(a2));
  float2 v3 = float2(R * sin(a3), R * cos(a3));

  float xMin = min(min(v0.x, v1.x), min(v2.x, v3.x));
  float xMax = max(max(v0.x, v1.x), max(v2.x, v3.x));
  float insideX = min(x - xMin, xMax - x);

  float zMax = -1e6;
  float xc = clamp(x, xMin, xMax);
  float lo0 = min(v0.x, v1.x); float hi0 = max(v0.x, v1.x);
  if (hi0 - lo0 > 0.001 && xc >= lo0 - 0.001 && xc <= hi0 + 0.001) {
    float t = clamp((xc - v0.x) / (v1.x - v0.x), 0.0, 1.0);
    zMax = max(zMax, mix(v0.y, v1.y, t));
  }
  float lo1 = min(v1.x, v2.x); float hi1 = max(v1.x, v2.x);
  if (hi1 - lo1 > 0.001 && xc >= lo1 - 0.001 && xc <= hi1 + 0.001) {
    float t = clamp((xc - v1.x) / (v2.x - v1.x), 0.0, 1.0);
    zMax = max(zMax, mix(v1.y, v2.y, t));
  }
  float lo2 = min(v2.x, v3.x); float hi2 = max(v2.x, v3.x);
  if (hi2 - lo2 > 0.001 && xc >= lo2 - 0.001 && xc <= hi2 + 0.001) {
    float t = clamp((xc - v2.x) / (v3.x - v2.x), 0.0, 1.0);
    zMax = max(zMax, mix(v2.y, v3.y, t));
  }
  float lo3 = min(v3.x, v0.x); float hi3 = max(v3.x, v0.x);
  if (hi3 - lo3 > 0.001 && xc >= lo3 - 0.001 && xc <= hi3 + 0.001) {
    float t = clamp((xc - v3.x) / (v0.x - v3.x), 0.0, 1.0);
    zMax = max(zMax, mix(v3.y, v0.y, t));
  }
  return float2(zMax, insideX);
}

half4 main(float2 fragCoord) {
  float dpr = max(ms_dpr, 0.001);
  float2 center = ms_contentRect.xy + 0.5 * ms_contentRect.zw;
  float2 p = (fragCoord - center) / dpr;

  float theta = p_spinAngle * 0.0174532925;
  float2 prof = frontProfile(p.x, p_pillarSize, theta);
  float zFront = prof.x;
  float insideX = prof.y;

  float aaX = smoothstep(-0.75, 0.75, insideX);
  if (aaX <= 0.0001) return half4(0.0);

  float innerHalf = max(3.0, p_baseHalfGap - p_chevronSlope * zFront);
  float ay = abs(p.y);
  float d = ay - innerHalf;

  float aaInner = smoothstep(-0.75, 0.75, d);
  float u = clamp(max(d, 0.0) / max(p_fadeHeight, 1.0), 0.0, 1.0);
  float fadeAlpha = 1.0 - smoothstep(0.0, 1.0, pow(u, 1.2));

  float a = aaX * aaInner * fadeAlpha * p_limeColor.a;
  float3 rgb = p_limeColor.a > 0.001 ? (p_limeColor.rgb / p_limeColor.a) : float3(0.0);
  return half4(half3(rgb * a), half(a));
}`;
