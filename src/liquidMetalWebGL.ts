/*
 * Liquid-metal dispersion renderer, adapted from ThreeUI
 * (https://github.com/MengTo/threeui), Copyright (c) 2026 Meng To,
 * MIT License.
 *
 * The upstream ships this shader inside a standalone HTML page and the
 * React wrapper (`@designcodeio/threeui`, and ThreeUI's own
 * LiquidMetalButton.tsx) embeds that page in an iframe, then talks to
 * it with postMessage. We did not take that path: an iframe is a wall.
 * Our CSS variables, brand fonts, and focus management cannot cross it,
 * and the source hardcodes the page background to #0e0f12 while this
 * button has to sit on our parchment panels. MIT allows the port; this
 * header is the required attribution.
 *
 * Changes from the source: no iframe; colours and the three effect knobs
 * (dispersion, sweep speed, rest luminance) are read from --game-ui-*
 * tokens via getComputedStyle so a theme switch retints the metal;
 * a process-wide context budget with CSS fallback; RAF pauses when the
 * button is off-screen or the tab is in the background rather than
 * destroying the context (teardown + rebuild hitch).
 */

export type LiquidMetalWebGLHandle = {
  pause: () => void;
  resume: () => void;
  dispose: () => void;
};

type Prog = {
  p: WebGLProgram;
  u: Record<string, WebGLUniformLocation | null>;
};

type Target = {
  tex: WebGLTexture;
  fbo: WebGLFramebuffer;
  w: number;
  h: number;
};

const VERT = `#version 300 es
in vec2 position; void main(){ gl_Position = vec4(position,0.,1.); }`;

const HEAD = `#version 300 es
precision highp float;
out vec4 o;

uniform vec2  uC;        // pill centre, device px
uniform vec2  uHalf;     // pill half-extent, device px
uniform float uT;        // seconds
uniform float uHover;    // 0..1
uniform float uPress;    // 0..1, eased
uniform vec4  uRip[3];   // xy centre (button heights, +y down), z start, w live
uniform vec4  uRipK;     // speed, ring width, decay, amplitude
uniform vec4  uRipK2;    // facet depth, facet count, crest sharpness, emission
uniform vec4  uPtr;      // xy trailing cursor, z strength, w normalised speed
uniform vec4  uPtrK;     // radius, base amplitude, speed amplitude, rim lift
uniform vec3  uAccent;   // brand tint from computed --game-ui-liquid-metal-accent

#define PI 3.14159265

float sdPill(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return min(max(q.x,q.y),0.) + length(max(q,0.)) - r;
}

/* Expanding ring from each press, in button-height units.  Three slots so a
   quick double-tap overlaps instead of cutting the first one off.

   Two things keep it from reading as a water ripple: the wavefront is
   faceted rather than circular — its radius is modulated by angle, and the
   facets rotate as it travels — and the crest profile is a cusp rather than
   a gaussian, so it lands as a crease in sheet metal instead of a soft swell. */
float ripple(vec2 p, float t){
  float sum = 0.;
  for(int i = 0; i < 3; i++){
    if(uRip[i].w < 0.5) continue;
    float age = t - uRip[i].z;
    if(age < 0. || age > 4.) continue;
    vec2  rp = p - uRip[i].xy;
    float facet = 1. + uRipK2.x * cos(uRipK2.y * atan(rp.y, rp.x) + age * 2.1 + float(i) * 2.4);
    float x = (length(rp) - age * uRipK.x * facet) / uRipK.y;
    sum += exp(-pow(abs(x) + 1e-4, uRipK2.z)) * exp(-age * uRipK.z);
  }
  return sum;
}

/* A soft well under the cursor.  It lags behind the real pointer and swells
   with speed, so moving across the button drags the metal rather than sliding
   a static blob over it. */
float pointerW(vec2 p){
  if(uPtr.z < 0.001) return 0.;
  float d = length(p - uPtr.xy) / uPtrK.x;
  return exp(-d*d) * uPtr.z;
}
/* Displacing the sample point, not the field value, is what makes this read as
   liquid: the bands bulge and stretch around the cursor like a lens instead of
   just getting brighter under it. */
vec2 pointerWarp(vec2 p){
  float w = pointerW(p);
  if(w <= 0.) return vec2(0.);
  return normalize(p - uPtr.xy + vec2(1e-5)) * w * (uPtrK.y + uPtrK.z * uPtr.w);
}
`;

const FRAG_RIM = `${HEAD}
uniform float uBw;       // stroke half-width, device px
uniform float uE[8];     // base, hot, chroma-across, chroma-along, speed,
                         // topBias, press lift, ripple lift

/* Arc-length position around the pill, 0..1, starting at the right-hand
   extreme and running counter-clockwise.  Straight runs and caps are measured
   in real length so a highlight travels at a constant speed all the way
   round instead of stalling on the caps. */
float perim(vec2 d, float a, float r){
  float P = 4.*a + 2.*PI*r;
  float s;
  if(d.x >= a){                                   // right cap
    float th = atan(d.y, d.x - a); if(th < 0.) th += 2.*PI;
    s = (th <= PI*0.5) ? r*th : P - r*(2.*PI - th);
  } else if(d.x <= -a){                           // left cap
    float th = atan(d.y, d.x + a); if(th < 0.) th += 2.*PI;
    s = r*PI*0.5 + 2.*a + r*(th - PI*0.5);
  } else if(d.y >= 0.){                           // top run
    s = r*PI*0.5 + (a - d.x);
  } else {                                        // bottom run
    s = r*PI*1.5 + 2.*a + (d.x + a);
  }
  return s / P;
}
// periodic bump, so a highlight wraps cleanly at s = 0
float pb(float u, float w){ u = fract(u); float x = min(u, 1.-u); return exp(-(x*x)/(w*w)); }

// travelling brightness around the rim — three lobes at different speeds and
// widths, which never quite re-align, so the light keeps re-pooling
float rimHot(float s, float t){
  float v = uE[0];
  v += 0.62 * pb(s - t*uE[4],             0.075);
  v += 0.44 * pb(s + t*uE[4]*0.63 + 0.41, 0.135);
  v += 0.30 * pb(s - t*uE[4]*0.34 + 0.73, 0.200);
  return v;
}
// soft band riding the pill edge, offset per channel to fringe across the stroke
float rimBand(float sd, float off){ return 1. - smoothstep(0., uBw*1.05, abs(sd + uBw*0.55 + off)); }

void main(){
  vec2  d  = gl_FragCoord.xy - uC;
  float sd = sdPill(d, uHalf, uHalf.y);
  if(sd > uBw*2.5 || sd < -uBw*3.5){ o = vec4(0.); return; }

  /* Each channel is offset both *across* the stroke and *along* it, so the rim
     fringes red-outside / cyan-inside and its hue also drifts as a highlight
     slides past — the two together are what read as metal rather than as a
     moving white dot. */
  float a = max(uHalf.x - uHalf.y, 0.);
  float s = perim(d, a, uHalf.y);
  float top = mix(1., 0.5 + 0.5 * (d.y / uHalf.y), uE[5]);

  // pressing lifts the whole outline, and each ripple flares it again as the
  // ring sweeps past — so the rim reports the press twice, once as a step and
  // once as a wave running round the edge
  // …and the stretch of outline nearest the cursor picks up a little too
  vec2  p   = vec2(d.x, -d.y) / (uHalf.y * 2.);
  float lift = 1. + uPress * uE[6] + ripple(p, uT) * uE[7]
             + pointerW(p) * uPtrK.w;

  o = vec4(vec3(
    rimBand(sd,  uE[2]) * rimHot(s + uE[3], uT),
    rimBand(sd,  0.   ) * rimHot(s,         uT),
    rimBand(sd, -uE[2]) * rimHot(s - uE[3], uT)
  ) * uE[1] * top * lift, 1.);
  // Brand tint lives here, not in the spectral offsets: those offsets are
  // what make it metal, and replacing them with a flat accent would turn
  // the rim into a neon sticker.
  o.rgb *= mix(vec3(1.0), uAccent, 0.40);
}`;

const FRAG_SCENE = `${HEAD}
uniform float uP[21];    // tunables

float h21(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vn(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.-2.*f);
  float a = h21(i), b = h21(i+vec2(1,0)), c = h21(i+vec2(0,1)), d = h21(i+vec2(1,1));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y) * 2. - 1.;
}
// normalised to roughly -1..1; low gain keeps the first octave dominant, which
// is what keeps the ribbons big and smooth instead of turbulent
float fbm(vec2 p, float g){
  float s = 0., a = 1., n = 0.;
  for(int i=0;i<4;i++){ s += a*vn(p); n += a; p = p*2.03 + 11.7; a *= g; }
  return s / n;
}
float fbm(vec2 p){ return fbm(p, 0.5); }

/* p is in button-height units, +y down, origin at the pill centre.

   The bands in the reference are a *family of parallel curves*: one swooping
   valley repeated up the button, dense where the light is pinched and pulled
   wide open where it is not.  So the field is built that way explicitly —

       V = (y - valley(x)) * density(x)

   — rather than hoping 2-D noise happens to produce it.  Level sets of V are
   all vertical translates of the same valley curve, which is what makes the
   ribbons laminar and near-parallel; a density that varies along x is what makes
   them crowd into razor fringes at one end and open into a broad wash at the
   other.  A soft plateau over V then paints them, sampled once per
   wavelength at slightly offset heights, so every edge opens into a prism of
   width dispersion / |grad V|.                                             */

// smooth 1-D wiggle that drifts slowly with time
float wig(float x, float t, float seed){
  return vn(vec2(x,          t*0.150 + seed)) * 0.60
       + vn(vec2(x*2.07 + 4., t*0.105 + seed)) * 0.27
       + vn(vec2(x*4.30 - 7., t*0.080 + seed)) * 0.13;
}

float valleyAt(vec2 p, float t){ return wig(p.x*uP[0], t, 0.0) * uP[1]; }
float densAt  (vec2 p, float t){ return uP[2] * exp(uP[3] * wig(p.x*uP[4] + 9.0, t, 2.7)); }

float surface(vec2 p, float t){
  float V = (p.y - valleyAt(p,t)) * densAt(p,t);
  V += uP[5] * fbm(p*vec2(0.8, 1.7)*uP[6] + vec2(t*0.05, -t*0.03), uP[17]);
  return V - uP[7];
}
// One plateau per unit of V — so the density is literally bands per button height.
// A plateau rather than a step is what puts warm on the low edge and cool on
// the high edge of every ribbon.
float tone(float v){
  float u = fract(v);
  float e = uP[9], W = uP[10] * 0.5;
  return smoothstep(0.5-W-e, 0.5-W, u) * (1. - smoothstep(0.5+W, 0.5+W+e, u));
}
vec3 spec(float t){ return clamp(vec3(1.5) - abs(4.*t - vec3(3.,2.,1.)), 0., 1.); }

void main(){
  vec2  d  = gl_FragCoord.xy - uC;
  float sd = sdPill(d, uHalf, uHalf.y);
  float pill = 1. - smoothstep(-1., 1., sd);
  float S = uHalf.y * 2.;                 // button height, device px
  float t = uT;

  // rgb is premultiplied by the mask and alpha carries it, so the blur that
  // follows can normalise and keep a clean edge instead of a dark vignette
  if(uHover <= 0.0015 || pill <= 0.0015){ o = vec4(0., 0., 0., pill); return; }

  vec2  p = vec2(d.x, -d.y) / S;          // gl_FragCoord is y-up
  vec2  q = p + pointerWarp(p);           // the cursor drags the sheet

  // self-refraction: bend the lookup along the field's own slope, which piles
  // iso-lines up into folds instead of leaving them evenly spaced
  float h0 = surface(q, t);
  vec2  gp = vec2(dFdx(h0), -dFdy(h0)) * S;          // grad in p-units
  float V  = surface(q - gp * uP[8] / max(uP[2], .001), t);

  // gradient-aligned filaments: fast variation across the iso-lines, slow
  // along them, so the fine detail reads as drawn-out fibres of light
  vec2  gd = normalize(gp + vec2(1e-5));
  V += uP[13] * fbm(vec2(dot(q,gd)*uP[14], dot(q, vec2(-gd.y,gd.x))*uP[14]*0.04) + vec2(0., t*0.06));

  // press ripple: displacing the field rather than adding light means the
  // bands themselves bow outwards as the ring passes, which is what sells it
  // as a disturbance *in* the metal instead of a decal over it
  float rip  = ripple(p, t);
  float well = pointerW(p);
  V += rip * uRipK.w;

  // Real dispersion is not linear in wavelength — the blue end bends far more
  // than the red (Cauchy).  Skewing the sample offsets the same way is what
  // gives the reference its broad cool wash against a tight warm edge.
  const int N = 21;
  float mid = 1. - pow(0.5, uP[12]);
  vec3 col = vec3(0.), wsum = vec3(0.);
  for(int i=0;i<N;i++){
    float k = float(i)/float(N-1);
    vec3  w = spec(k);
    col  += w * tone(V + ((1. - pow(1. - k, uP[12])) - mid) * uP[11]);
    wsum += w;
  }
  col /= wsum;
  col = pow(col, vec3(uP[15]));

  // light envelope — the ribbons only exist where the sheet is lit, and the
  // dark upper region is bounded by the same valley curve the bands follow
  float lit = smoothstep(uP[18], uP[19], q.y - valleyAt(q, t));
  lit *= mix(1., lit, 0.55);                     // deepen the unlit crescent
  col *= uP[16] * lit;

  // the crest runs hotter, and carries a little light of its own so it stays
  // legible through the softening blur and across the unlit part of the pill
  col = col * (1. + rip * 1.15 + well * 0.60);

  o = vec4(col * pill * uHover, pill);
}`;

const FRAG_DOWN = `#version 300 es
precision highp float;
out vec4 o;
uniform sampler2D uTex, uTex2;
uniform vec2 uDstTexel;   // 1 / destination size  (maps dest fragCoord -> uv)
uniform vec2 uSrcTexel;   // 1 / source size       (tap spacing)
uniform float uAdd;       // 1 to include uTex2
void main(){
  vec2 uv = gl_FragCoord.xy * uDstTexel;
  // Taps sit a quarter of a *destination* texel out, so for a 2x reduction
  // they land exactly on the four source texel centres.  Spacing them by a
  // whole source texel instead — as this did originally — skips every other
  // pixel, and any fine detail in the field folds down into low-frequency
  // moiré that no amount of subsequent blurring can remove.
  vec2 e = uDstTexel * 0.25;
  vec4 s = texture(uTex, uv + vec2(-e.x,-e.y)) + texture(uTex, uv + vec2( e.x,-e.y))
         + texture(uTex, uv + vec2(-e.x, e.y)) + texture(uTex, uv + vec2( e.x, e.y));
  s *= 0.25;
  if(uAdd > 0.5){
    vec4 r = texture(uTex2, uv + vec2(-e.x,-e.y)) + texture(uTex2, uv + vec2( e.x,-e.y))
           + texture(uTex2, uv + vec2(-e.x, e.y)) + texture(uTex2, uv + vec2( e.x, e.y));
    s.rgb += r.rgb * 0.25;
  }
  o = s;
}`;

const FRAG_BLUR = `#version 300 es
precision highp float;
out vec4 o;
uniform sampler2D uTex; uniform vec2 uTexel; uniform vec2 uDir; uniform float uR;
void main(){
  vec2 uv = gl_FragCoord.xy * uTexel;
  vec2 st = uTexel * uDir * uR;
  vec4 s = texture(uTex, uv) * 0.1964;
  s += (texture(uTex, uv + st*1.4118) + texture(uTex, uv - st*1.4118)) * 0.2969;
  s += (texture(uTex, uv + st*3.2941) + texture(uTex, uv - st*3.2941)) * 0.0944;
  s += (texture(uTex, uv + st*5.1765) + texture(uTex, uv - st*5.1765)) * 0.0104;
  o = s;
}`;

const FRAG_COMP = `${HEAD}
uniform sampler2D uSoft, uRim, uGlow;
uniform vec2  uRes;
uniform float uGlowGain, uGlowIn, uOccl, uDim, uPunch;

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec3 glow = texture(uGlow, uv).rgb;
  vec2  d    = gl_FragCoord.xy - uC;
  float sd   = sdPill(d, uHalf, uHalf.y);
  float pill = 1. - smoothstep(-1., 1., sd);

  // normalised blur: dividing by the blurred coverage keeps the softened metal
  // full strength right up to the edge instead of fading into the mask
  vec4 m = texture(uSoft, uv);

  // Scrim, applied *after* the blur: knock the metal back through the middle
  // where the label sits, leaving the top and bottom at full brightness.  Doing
  // this before the blur would smear the protection away at high blur values.
  float veil = 1. - smoothstep(0.46, 0.88, abs(d.y) / uHalf.y);

  // Blurring flattens the tonal range into a wash; putting the contrast back
  // with a power curve — after the blur, so it costs no smoothness — is what
  // makes it read as poured metal rather than a soft glow.  Highlights keep
  // their level while the mid-tones drop away.
  vec3 metal = pow(max(m.rgb / max(m.a, 1e-3), 0.), vec3(uPunch));

  vec3 core = metal * pill * mix(1., uDim, veil) + texture(uRim, uv).rgb;

  // The ripple's own light is added here, after the blur, so the crease stays
  // a hard line.  Its displacement of the field still rides inside the
  // softened metal — the sheet bows, and the crest glints along the fold.
  float rip = ripple(vec2(d.x, -d.y) / (uHalf.y * 2.), uT);
  core += vec3(rip * rip) * uRipK2.w * pill * mix(1., 0.42, veil);

  // The button occludes its own bloom over the patch where its shadow falls,
  // so the drop shadow keeps its contrast even when the face is blown out.
  float sdSh = sdPill(d + vec2(0., uHalf.y * 0.62), uHalf * 0.94, uHalf.y * 0.94);
  float occl = uOccl * exp(-max(sdSh, 0.) / (uHalf.y * 0.75));

  // Bloom spills mostly outward; a little of it is allowed back inside so the
  // hot rim bleeds onto the face, as it does on the reference component.
  vec3 rgb = core + glow * uGlowGain * mix(1., uGlowIn, pill) * (1. - occl * (1. - pill));
  rgb *= mix(vec3(1.0), uAccent, 0.18);

  // premultiplied — the page's ambient pool and the button's drop shadow are
  // CSS underneath, and this layer adds light on top of them
  float a = clamp(max(rgb.r, max(rgb.g, rgb.b)), 0., 1.);
  o = vec4(min(rgb, vec3(1.)), a);
}`;

const P = {
  valFreq: 0.5,
  valAmp: 0.55,
  dens: 2.4,
  densVar: 2.2,
  densFreq: 0.32,
  wobAmp: 0.12,
  wobFreq: 1.6,
  lift: 0.05,
  refract: 0.18,
  edge: 0.04,
  width: 0.46,
  disp: 0.3,
  skew: 1.5,
  fineAmp: 0.0,
  fineFreq: 9.0,
  gamma: 1.0,
  gain: 1.9,
  octGain: 0.32,
  litLo: -0.26,
  litHi: 0.1,
  dim: 0.44,
};

const PKEYS = Object.keys(P) as Array<keyof typeof P>;

const E = {
  base: 0.2,
  hot: 0.82,
  chromA: 0.42,
  chromS: 0.03,
  speed: 0.07,
  top: 0.35,
  press: 0.85,
  ripple: 1.6,
};

const EKEYS = Object.keys(E) as Array<keyof typeof E>;

const C = {
  glow: 1.95,
  glowR: 1.3,
  glowIn: 0.3,
  occl: 0.62,
  soften: 0.24,
  punch: 1.5,
};

const R = {
  speed: 1.85,
  width: 0.2,
  decay: 1.35,
  amp: 1.35,
  facet: 0.18,
  lobes: 6.0,
  sharp: 1.15,
  emit: 0.45,
  ptrRad: 0.55,
  ptrAmp: 0.32,
  ptrFast: 0.4,
  ptrRim: 0.8,
  ptrLag: 0.0016,
  ptrVref: 4.5,
};

function parseCssColor(value: string): [number, number, number] {
  const trimmed = value.trim();
  const hex = /^#([0-9a-f]{3,8})$/i.exec(trimmed);
  if (hex?.[1]) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => `${c}${c}`).join('');
    return [
      Number.parseInt(h.slice(0, 2), 16) / 255,
      Number.parseInt(h.slice(2, 4), 16) / 255,
      Number.parseInt(h.slice(4, 6), 16) / 255,
    ];
  }
  const rgb = /^rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)/i.exec(trimmed);
  if (rgb?.[1] && rgb[2] && rgb[3]) {
    const r = Number(rgb[1]);
    const g = Number(rgb[2]);
    const b = Number(rgb[3]);
    const scale = r > 1 || g > 1 || b > 1 ? 255 : 1;
    return [r / scale, g / scale, b / scale];
  }
  return [1, 1, 1];
}

function readNumber(style: CSSStyleDeclaration, name: string, fallback: number): number {
  const n = Number.parseFloat(style.getPropertyValue(name).trim());
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Indexed access on the uniform map is `T | undefined` under
 * noUncheckedIndexedAccess. WebGL treats a null location as a no-op, which
 * is the right failure mode for an unused uniform, not a throw.
 */
function uniforms(gl: WebGL2RenderingContext, u: Record<string, WebGLUniformLocation | null>) {
  const at = (name: string): WebGLUniformLocation | null => u[name] ?? null;
  return {
    f1: (name: string, v: number) => gl.uniform1f(at(name), v),
    f2: (name: string, x: number, y: number) => gl.uniform2f(at(name), x, y),
    f3: (name: string, x: number, y: number, z: number) => gl.uniform3f(at(name), x, y, z),
    f4: (name: string, x: number, y: number, z: number, w: number) =>
      gl.uniform4f(at(name), x, y, z, w),
    fv1: (name: string, data: Float32Array) => gl.uniform1fv(at(name), data),
    fv4: (name: string, data: Float32Array) => gl.uniform4fv(at(name), data),
    i1: (name: string, v: number) => gl.uniform1i(at(name), v),
  };
}

/**
 * Attach the dispersion pipeline to an existing canvas. Returns null instead
 * of throwing when the GPU cannot give us a WebGL2 context — the React
 * wrapper stays on the CSS renderer, which is the point of the fallback.
 */
export function attachLiquidMetalWebGL(
  canvas: HTMLCanvasElement,
  button: HTMLElement,
  host: HTMLElement,
): LiquidMetalWebGLHandle | null {
  if (typeof canvas.getContext !== 'function') return null;

  let gl: WebGL2RenderingContext | null = null;
  try {
    gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: 'high-performance',
    });
  } catch {
    return null;
  }
  if (!gl) return null;

  const context = gl;

  try {
    return startSession(context, canvas, button, host);
  } catch {
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return null;
  }
}

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('liquid-metal: createShader returned null');
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? 'liquid-metal: shader compile failed');
  }
  return shader;
}

function program(gl: WebGL2RenderingContext, fs: string): Prog {
  const p = gl.createProgram();
  if (!p) throw new Error('liquid-metal: createProgram returned null');
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.bindAttribLocation(p, 0, 'position');
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p) ?? 'liquid-metal: program link failed');
  }
  const u: Record<string, WebGLUniformLocation | null> = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS) as number;
  for (let i = 0; i < n; i += 1) {
    const info = gl.getActiveUniform(p, i);
    if (!info) continue;
    u[info.name.replace('[0]', '')] = gl.getUniformLocation(p, info.name);
  }
  return { p, u };
}

function startSession(
  gl: WebGL2RenderingContext,
  canvas: HTMLCanvasElement,
  button: HTMLElement,
  host: HTMLElement,
): LiquidMetalWebGLHandle {
  const pScene = program(gl, FRAG_SCENE);
  const pRim = program(gl, FRAG_RIM);
  const pDown = program(gl, FRAG_DOWN);
  const pBlur = program(gl, FRAG_BLUR);
  const pComp = program(gl, FRAG_COMP);

  const vao = gl.createVertexArray();
  const vbo = gl.createBuffer();
  if (!vao || !vbo) throw new Error('liquid-metal: VAO/VBO unavailable');
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  // WebGL2 colour-renderable half-float is EXT_color_buffer_float, not the
  // WebGL1 half-float extension the original HTML probed. Enabling the
  // wrong one leaves RGBA16F framebuffers incomplete; every pass then
  // draws into the void and the canvas stays fully transparent.
  const hasFloat = Boolean(gl.getExtension('EXT_color_buffer_float'));

  function makeTarget(): Target {
    const tex = gl.createTexture();
    const fbo = gl.createFramebuffer();
    if (!tex || !fbo) throw new Error('liquid-metal: FBO unavailable');
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return { tex, fbo, w: 0, h: 0 };
  }

  function sizeTarget(t: Target, w: number, h: number): void {
    if (t.w === w && t.h === h) return;
    t.w = w;
    t.h = h;
    gl.bindTexture(gl.TEXTURE_2D, t.tex);
    if (hasFloat) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      gl.bindTexture(gl.TEXTURE_2D, t.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }
  }

  const T_core = makeTarget();
  const T_rim = makeTarget();
  const T_s1 = makeTarget();
  const T_s2 = makeTarget();
  const T_a = makeTarget();
  const T_b = makeTarget();

  let W = 0;
  let H = 0;
  let BW = 0;
  let BH = 0;
  let CX = 0;
  let CY = 0;
  let DOWN = 4;
  const GLOW_TEX = 129;
  let needResize = true;

  // Probe span so `var(--game-ui-liquid-metal-accent)` resolves to rgb() —
  // getPropertyValue on the custom prop itself returns the specified `var()`
  // text, which is not a colour the shader can eat.
  const probe = document.createElement('span');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText =
    'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;color:var(--game-ui-liquid-metal-accent)';
  host.appendChild(probe);

  function resize(): void {
    const br = button.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Source stage pad is 900 reference units against a 516-tall pill, ~90px
    // at the original 52px height. Keep the same ratio so bloom is not clipped
    // against a visible rectangle.
    const pad = (900 / 516) * Math.max(br.height, 1);
    const cssW = br.width + pad * 2;
    const cssH = br.height + pad * 2;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    const w = Math.max(2, Math.round(cssW * dpr));
    const h = Math.max(2, Math.round(cssH * dpr));
    if (w !== W || h !== H) {
      W = w;
      H = h;
      canvas.width = W;
      canvas.height = H;
    }
    BW = br.width * dpr;
    BH = br.height * dpr;
    CX = W / 2;
    CY = H / 2;
    sizeTarget(T_core, W, H);
    sizeTarget(T_rim, W, H);
    const hw = Math.max(2, Math.ceil(W / 2));
    const hh = Math.max(2, Math.ceil(H / 2));
    sizeTarget(T_s1, hw, hh);
    sizeTarget(T_s2, hw, hh);
    DOWN = Math.max(1, Math.min(4, Math.round(Math.max(BH, 110) / GLOW_TEX)));
    const dw = Math.max(2, Math.ceil(W / DOWN));
    const dh = Math.max(2, Math.ceil(H / DOWN));
    sizeTarget(T_a, dw, dh);
    sizeTarget(T_b, dw, dh);
    needResize = false;
  }

  function drawTo(t: Target | null): void {
    gl.bindFramebuffer(gl.FRAMEBUFFER, t ? t.fbo : null);
    gl.viewport(0, 0, t ? t.w : W, t ? t.h : H);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  const uArr = new Float32Array(PKEYS.length);
  const eArr = new Float32Array(EKEYS.length);
  let hover = 0;
  let hoverTarget = 0;
  let clock = 0;
  let last = performance.now();

  const RIP = [0, 1, 2].map(() => ({ x: 0, y: 0, t: -99, on: 0 }));
  const ripArr = new Float32Array(12);
  let ripNext = 0;
  let press = 0;
  let pressTarget = 0;

  const ptr = { x: 0, y: 0 };
  const ptrS = { x: 0, y: 0 };
  let ptrAmt = 0;
  let ptrSpeed = 0;

  const on = { over: false, press: false, focus: false };

  function addRipple(x: number, y: number): void {
    const slot = RIP[ripNext];
    if (!slot) return;
    ripNext = (ripNext + 1) % RIP.length;
    slot.x = x;
    slot.y = y;
    slot.t = clock;
    slot.on = 1;
  }

  function localPt(event: PointerEvent): [number, number] {
    const box = button.getBoundingClientRect();
    const s = box.height || 1;
    return [
      (event.clientX - (box.left + box.width / 2)) / s,
      (event.clientY - (box.top + box.height / 2)) / s,
    ];
  }

  function syncHot(): void {
    hoverTarget = on.over || on.press || on.focus ? 1 : 0;
    pressTarget = on.press ? 1 : 0;
  }

  const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  let drawn: string | null = null;
  let raf = 0;
  let paused = false;
  let disposed = false;

  function readTokens(): { accent: [number, number, number] } {
    const style = getComputedStyle(button);
    E.base = readNumber(style, '--game-ui-liquid-metal-rest', E.base);
    E.speed = readNumber(style, '--game-ui-liquid-metal-sweep-speed', E.speed);
    P.disp = readNumber(style, '--game-ui-liquid-metal-dispersion', P.disp);
    C.glow = readNumber(style, '--game-ui-liquid-metal-bloom', C.glow);
    return { accent: parseCssColor(getComputedStyle(probe).color) };
  }

  function frame(now: number): void {
    raf = 0;
    if (paused || disposed) return;
    const dtRaw = (now - last) / 1000;
    last = now;
    const dt = Math.min(dtRaw, 1 / 20);
    if (!calm.matches) clock += dt;

    const k = hoverTarget > hover ? 1 - Math.pow(0.0012, dt) : 1 - Math.pow(0.00012, dt);
    hover += (hoverTarget - hover) * k;
    if (Math.abs(hoverTarget - hover) < 0.0008) hover = hoverTarget;

    const pk = pressTarget > press ? 1 - Math.pow(1e-9, dt) : 1 - Math.pow(0.004, dt);
    press += (pressTarget - press) * pk;
    if (Math.abs(pressTarget - press) < 0.002) press = pressTarget;

    let ripLive = false;
    for (let i = 0; i < RIP.length; i += 1) {
      const r = RIP[i];
      if (!r) continue;
      if (r.on && clock - r.t > 4) r.on = 0;
      if (r.on) ripLive = true;
      ripArr[i * 4] = r.x;
      ripArr[i * 4 + 1] = r.y;
      ripArr[i * 4 + 2] = r.t;
      ripArr[i * 4 + 3] = r.on;
    }

    const lag = 1 - Math.pow(R.ptrLag, dt);
    const dx = (ptr.x - ptrS.x) * lag;
    const dy = (ptr.y - ptrS.y) * lag;
    ptrS.x += dx;
    ptrS.y += dy;
    const inst = Math.min(Math.hypot(dx, dy) / Math.max(dt, 1e-3) / R.ptrVref, 1);
    ptrSpeed += (inst - ptrSpeed) * (1 - Math.pow(inst > ptrSpeed ? 0.001 : 0.02, dt));
    const wantWell = on.over || on.press ? 1 : 0;
    ptrAmt += (wantWell - ptrAmt) * (1 - Math.pow(0.004, dt));
    if (Math.abs(wantWell - ptrAmt) < 0.002) ptrAmt = wantWell;

    // :hover is what Playwright's real pointer hover sets; pointerenter can
    // miss if the hit lands on the label span first in some engines.
    on.over = button.matches(':hover');
    on.focus = button.matches(':focus-visible');
    syncHot();

    if (needResize) resize();

    const sig = calm.matches && !ripLive && ptrAmt < 0.002 ? `${hover}|${press}|${W}|${H}` : null;
    if (sig !== null && sig === drawn) {
      raf = requestAnimationFrame(frame);
      return;
    }
    drawn = sig;

    const { accent } = readTokens();
    for (let i = 0; i < uArr.length; i += 1) {
      const key = PKEYS[i];
      if (key) uArr[i] = P[key];
    }
    for (let i = 0; i < eArr.length; i += 1) {
      const key = EKEYS[i];
      if (key) eArr[i] = E[key];
    }
    // The original tuned bloom against a ~52px retina pill (~104 device px)
    // on a near-black page. Our kit control is 40–44px on parchment; using
    // the raw height made the halo collapse to a 1px rim you cannot see
    // on cream. Floor the bloom scale so a short button still spills light.
    const bloomH = Math.max(BH, 110);
    const bw = Math.max(2.4, 3.2 * (bloomH / 516));
    const scene = uniforms(gl, pScene.u);
    const rim = uniforms(gl, pRim.u);
    const down = uniforms(gl, pDown.u);
    const blur = uniforms(gl, pBlur.u);
    const comp = uniforms(gl, pComp.u);

    gl.useProgram(pScene.p);
    scene.f2('uC', CX, CY);
    scene.f2('uHalf', BW / 2, BH / 2);
    scene.f1('uT', clock);
    scene.f1('uHover', hover);
    scene.f1('uPress', press);
    scene.fv4('uRip', ripArr);
    scene.f4('uRipK', R.speed, R.width, R.decay, R.amp);
    scene.f4('uRipK2', R.facet, R.lobes, R.sharp, R.emit);
    scene.f4('uPtr', ptrS.x, ptrS.y, ptrAmt, ptrSpeed);
    scene.f4('uPtrK', R.ptrRad, R.ptrAmp, R.ptrFast, R.ptrRim);
    scene.f3('uAccent', accent[0], accent[1], accent[2]);
    scene.fv1('uP', uArr);
    drawTo(T_core);

    gl.useProgram(pRim.p);
    rim.f2('uC', CX, CY);
    rim.f2('uHalf', BW / 2, BH / 2);
    rim.f1('uT', clock);
    rim.f1('uBw', bw);
    rim.f1('uPress', press);
    rim.fv4('uRip', ripArr);
    rim.f4('uRipK', R.speed, R.width, R.decay, R.amp);
    rim.f4('uRipK2', R.facet, R.lobes, R.sharp, R.emit);
    rim.f4('uPtr', ptrS.x, ptrS.y, ptrAmt, ptrSpeed);
    rim.f4('uPtrK', R.ptrRad, R.ptrAmp, R.ptrFast, R.ptrRim);
    rim.f3('uAccent', accent[0], accent[1], accent[2]);
    rim.fv1('uE', eArr);
    drawTo(T_rim);

    gl.useProgram(pDown.p);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, T_core.tex);
    down.i1('uTex', 0);
    down.f1('uAdd', 0);
    down.f2('uDstTexel', 1 / T_s1.w, 1 / T_s1.h);
    down.f2('uSrcTexel', 1 / W, 1 / H);
    drawTo(T_s1);

    gl.useProgram(pBlur.p);
    blur.i1('uTex', 0);
    blur.f2('uTexel', 1 / T_s1.w, 1 / T_s1.h);
    const sigTex = C.soften * (bloomH * 0.5) * 0.95;
    if (sigTex > 0.1) {
      const iters = Math.min(4, Math.max(1, Math.ceil(sigTex / 3.0)));
      blur.f1('uR', sigTex / Math.sqrt(iters) / 1.95);
      for (let i = 0; i < iters; i += 1) {
        gl.bindTexture(gl.TEXTURE_2D, T_s1.tex);
        blur.f2('uDir', 1, 0);
        drawTo(T_s2);
        gl.bindTexture(gl.TEXTURE_2D, T_s2.tex);
        blur.f2('uDir', 0, 1);
        drawTo(T_s1);
      }
    }

    gl.useProgram(pDown.p);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, T_s1.tex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, T_rim.tex);
    down.i1('uTex', 0);
    down.i1('uTex2', 1);
    down.f1('uAdd', 1);
    down.f2('uDstTexel', 1 / T_a.w, 1 / T_a.h);
    down.f2('uSrcTexel', 1 / T_s1.w, 1 / T_s1.h);
    drawTo(T_a);

    gl.useProgram(pBlur.p);
    gl.activeTexture(gl.TEXTURE0);
    blur.i1('uTex', 0);
    blur.f2('uTexel', 1 / T_a.w, 1 / T_a.h);
    const rs = (C.glowR * (bloomH / DOWN)) / GLOW_TEX;
    for (const r of [1.0, 2.3, 5.2, 9.0].map((v) => v * rs)) {
      blur.f1('uR', r);
      gl.bindTexture(gl.TEXTURE_2D, T_a.tex);
      blur.f2('uDir', 1, 0);
      drawTo(T_b);
      gl.bindTexture(gl.TEXTURE_2D, T_b.tex);
      blur.f2('uDir', 0, 1);
      drawTo(T_a);
    }

    gl.useProgram(pComp.p);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, T_s1.tex);
    comp.i1('uSoft', 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, T_rim.tex);
    comp.i1('uRim', 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, T_a.tex);
    comp.i1('uGlow', 2);
    comp.f2('uRes', W, H);
    comp.f2('uC', CX, CY);
    comp.f2('uHalf', BW / 2, BH / 2);
    comp.f1('uT', clock);
    comp.fv4('uRip', ripArr);
    comp.f4('uRipK', R.speed, R.width, R.decay, R.amp);
    comp.f4('uRipK2', R.facet, R.lobes, R.sharp, R.emit);
    comp.f3('uAccent', accent[0], accent[1], accent[2]);
    comp.f1('uGlowGain', C.glow);
    comp.f1('uGlowIn', C.glowIn);
    comp.f1('uOccl', C.occl);
    comp.f1('uDim', P.dim);
    comp.f1('uPunch', C.punch);
    drawTo(null);

    raf = requestAnimationFrame(frame);
  }

  const onEnter = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse') return;
    const [x, y] = localPt(event);
    ptr.x = x;
    ptr.y = y;
    ptrS.x = x;
    ptrS.y = y;
    ptrSpeed = 0;
    on.over = true;
    syncHot();
  };
  const onLeave = (event: PointerEvent): void => {
    if (event.pointerType === 'mouse') {
      on.over = false;
      syncHot();
    }
  };
  const onMove = (event: PointerEvent): void => {
    if (!on.over && !on.press) return;
    const [x, y] = localPt(event);
    ptr.x = x;
    ptr.y = y;
  };
  const onDown = (event: PointerEvent): void => {
    const [x, y] = localPt(event);
    ptr.x = x;
    ptr.y = y;
    on.press = true;
    syncHot();
    addRipple(x, y);
  };
  const onUp = (): void => {
    on.press = false;
    syncHot();
  };
  const onFocus = (): void => {
    on.focus = button.matches(':focus-visible');
    syncHot();
  };
  const onBlur = (): void => {
    on.focus = false;
    syncHot();
  };
  const onKeyDown = (event: KeyboardEvent): void => {
    if ((event.key !== 'Enter' && event.key !== ' ') || event.repeat) return;
    on.press = true;
    syncHot();
    addRipple(0, 0);
  };
  const onKeyUp = (event: KeyboardEvent): void => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    on.press = false;
    syncHot();
  };

  button.addEventListener('pointerenter', onEnter);
  button.addEventListener('pointerleave', onLeave);
  window.addEventListener('pointermove', onMove, { passive: true });
  button.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  button.addEventListener('focus', onFocus);
  button.addEventListener('blur', onBlur);
  button.addEventListener('keydown', onKeyDown);
  button.addEventListener('keyup', onKeyUp);

  const ro = new ResizeObserver(() => {
    needResize = true;
  });
  ro.observe(host);
  ro.observe(button);

  resize();
  raf = requestAnimationFrame(frame);

  return {
    pause: () => {
      paused = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },
    resume: () => {
      if (disposed) return;
      paused = false;
      last = performance.now();
      drawn = null;
      if (!raf) raf = requestAnimationFrame(frame);
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      paused = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      button.removeEventListener('pointerenter', onEnter);
      button.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointermove', onMove);
      button.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      button.removeEventListener('focus', onFocus);
      button.removeEventListener('blur', onBlur);
      button.removeEventListener('keydown', onKeyDown);
      button.removeEventListener('keyup', onKeyUp);
      probe.remove();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
