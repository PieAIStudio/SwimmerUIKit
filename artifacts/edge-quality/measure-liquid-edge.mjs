/**
 * Pixel-true edge-quality harness for the liquid gooey silhouette.
 *
 * Does not import the donor. Replicates the production SVG filter chain from
 * src/liquidGooeyFilter.tsx (1.11.2 / 1.11.1 baseline) so variants can be
 * measured without editing product code. Storybook captures are taken from
 * the live kit so the owner sees the same pixels.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const capturesDir = path.join(here, 'captures');
const cropsDir = path.join(here, 'crops');
const TEAL = '#1d9a8b';
const CONTRAST = 18;
const GOO_BLUR = 6;
const INTERCEPT = Math.round((0.5 - CONTRAST * (5 / 12)) * 100) / 100;
const BASE_FREQ = 0.018;
const WAVINESS = 6;
const EDGE_BLUR = 0.5;
const FILTER_PADDING = 24;

function roundedRectPath(x, y, w, h, radius) {
  let tl = radius;
  let tr = radius;
  let br = radius;
  let bl = radius;
  const factor = Math.min(
    1,
    w / Math.max(1e-6, tl + tr),
    w / Math.max(1e-6, bl + br),
    h / Math.max(1e-6, tl + bl),
    h / Math.max(1e-6, tr + br),
  );
  tl *= factor;
  tr *= factor;
  br *= factor;
  bl *= factor;
  return (
    `M ${x + tl} ${y} ` +
    `H ${x + w - tr} A ${tr} ${tr} 0 0 1 ${x + w} ${y + tr} ` +
    `V ${y + h - br} A ${br} ${br} 0 0 1 ${x + w - br} ${y + h} ` +
    `H ${x + bl} A ${bl} ${bl} 0 0 1 ${x} ${y + h - bl} ` +
    `V ${y + tl} A ${tl} ${tl} 0 0 1 ${x + tl} ${y} Z`
  );
}

function wavyCirclePath(cx, cy, r, amp, cycles, samples = 256) {
  const parts = [];
  for (let i = 0; i <= samples; i += 1) {
    const a = (i / samples) * Math.PI * 2;
    const rr = r + amp * Math.sin(cycles * a);
    const x = cx + rr * Math.cos(a);
    const y = cy + rr * Math.sin(a);
    parts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `${parts.join(' ')} Z`;
}

function stairCirclePath(cx, cy, r) {
  const pts = [];
  const n = Math.max(32, Math.round(2 * Math.PI * r));
  for (let i = 0; i <= n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    pts.push([Math.round(cx + r * Math.cos(a)), Math.round(cy + r * Math.sin(a))]);
  }
  const collapsed = [];
  for (const [x, y] of pts) {
    const last = collapsed[collapsed.length - 1];
    if (!last || last[0] !== x || last[1] !== y) collapsed.push([x, y]);
  }
  const stepped = [];
  for (let i = 0; i < collapsed.length; i += 1) {
    const [x, y] = collapsed[i];
    const prev = stepped[stepped.length - 1];
    if (!prev) {
      stepped.push([x, y]);
      continue;
    }
    if (prev[0] !== x && prev[1] !== y) stepped.push([x, prev[1]]);
    stepped.push([x, y]);
  }
  return `M ${stepped.map(([x, y]) => `${x} ${y}`).join(' L ')} Z`;
}

function gooFilter({
  id,
  width,
  height,
  pad,
  waviness = WAVINESS,
  wavinessFreq = BASE_FREQ,
  octaves = 2,
  type = 'fractalNoise',
  edgeBlur = EDGE_BLUR,
  noiseBlur = 0,
  preBlur = 0,
  posterize = false,
  reconstruct = false,
  reconstructSlope = 8,
}) {
  const intercept = INTERCEPT;
  const wavy = waviness > 0;
  const parts = [
    `<feGaussianBlur in="SourceGraphic" stdDeviation="${GOO_BLUR}" result="blur"/>`,
    `<feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${CONTRAST} ${intercept}" result="goo"/>`,
    `<feComposite in="SourceGraphic" in2="goo" operator="atop" result="${wavy ? (preBlur > 0 ? 'shape-hard' : 'shape-raw') : 'shape'}"/>`,
  ];
  if (wavy && preBlur > 0) {
    parts.push(
      `<feGaussianBlur in="shape-hard" stdDeviation="${preBlur}" result="shape-raw"/>`,
    );
  }
  if (wavy) {
    parts.push(
      `<feTurbulence type="${type}" baseFrequency="${wavinessFreq}" numOctaves="${octaves}" seed="7" result="wave-noise-raw"/>`,
    );
    let noiseId = 'wave-noise-raw';
    if (posterize) {
      parts.push(`<feComponentTransfer in="wave-noise-raw" result="wave-noise-q">
        <feFuncR type="discrete" tableValues="0 0.2 0.4 0.6 0.8 1"/>
        <feFuncG type="discrete" tableValues="0 0.2 0.4 0.6 0.8 1"/>
        <feFuncB type="discrete" tableValues="0 0.2 0.4 0.6 0.8 1"/>
      </feComponentTransfer>`);
      noiseId = 'wave-noise-q';
    }
    if (noiseBlur > 0) {
      parts.push(
        `<feGaussianBlur in="${noiseId}" stdDeviation="${noiseBlur}" result="wave-noise"/>`,
      );
    } else {
      parts.push(`<feOffset in="${noiseId}" dx="0" dy="0" result="wave-noise"/>`);
    }
    parts.push(
      `<feDisplacementMap in="shape-raw" in2="wave-noise" scale="${waviness * 2}" xChannelSelector="R" yChannelSelector="G" result="shape-displaced"/>`,
    );
    if (edgeBlur > 0) {
      parts.push(
        `<feGaussianBlur in="shape-displaced" stdDeviation="${edgeBlur}" result="${reconstruct ? 'shape-soft' : 'shape'}"/>`,
      );
    } else {
      parts.push(`<feOffset in="shape-displaced" dx="0" dy="0" result="${reconstruct ? 'shape-soft' : 'shape'}"/>`);
    }
    if (reconstruct) {
      const recIntercept = Math.round((0.5 - reconstructSlope * (5 / 12)) * 100) / 100;
      parts.push(
        `<feColorMatrix in="shape-soft" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${reconstructSlope} ${recIntercept}" result="shape"/>`,
      );
    }
  }
  const passes = parts.length;
  return {
    passes,
    xml: `<filter id="${id}" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse" x="${-pad}" y="${-pad}" width="${width + pad * 2}" height="${height + pad * 2}">${parts.join('')}</filter>`,
  };
}

function padFor({ waviness = WAVINESS, edgeBlur = EDGE_BLUR, noiseBlur = 0, preBlur = 0 } = {}) {
  return Math.ceil(
    GOO_BLUR * 3 +
      FILTER_PADDING +
      waviness +
      (waviness > 0
        ? Math.ceil(Math.max(edgeBlur, 0) * 3 + Math.max(noiseBlur, 0) * 3 + Math.max(preBlur, 0) * 3)
        : 0),
  );
}

function blobPath() {
  return roundedRectPath(40, 40, 150, 150, 999);
}

function pillPath() {
  return roundedRectPath(24, 14, 200, 52, 999);
}

function figureSvg({
  id,
  width,
  height,
  d,
  filter,
  fill = TEAL,
  scale = 1,
}) {
  const cssW = width * scale;
  const cssH = height * scale;
  return `<figure class="cell" data-id="${id}" data-scale="${scale}" data-vw="${width}" data-vh="${height}">
    <figcaption>${id}</figcaption>
    <div class="frame" style="width:${cssW}px;height:${cssH}px">
      <svg data-shot="${id}" xmlns="http://www.w3.org/2000/svg" width="${cssW}" height="${cssH}" viewBox="0 0 ${width} ${height}" overflow="visible">
        <defs>${filter}</defs>
        <g ${filter ? `filter="url(#${id})"` : ''} fill="${fill}">
          <path d="${d}"/>
        </g>
      </svg>
    </div>
  </figure>`;
}

function noiseSvg({ id, octaves = 2, posterize = false, blur = 0, freq = BASE_FREQ, type = 'fractalNoise' }) {
  const size = 200;
  const steps = [
    `<feTurbulence type="${type}" baseFrequency="${freq}" numOctaves="${octaves}" seed="7" result="n0"/>`,
  ];
  let src = 'n0';
  if (posterize) {
    steps.push(`<feComponentTransfer in="n0" result="nq">
      <feFuncR type="discrete" tableValues="0 0.2 0.4 0.6 0.8 1"/>
      <feFuncG type="discrete" tableValues="0 0.2 0.4 0.6 0.8 1"/>
    </feComponentTransfer>`);
    src = 'nq';
  }
  if (blur > 0) steps.push(`<feGaussianBlur in="${src}" stdDeviation="${blur}" result="n"/>`);
  else steps.push(`<feOffset in="${src}" dx="0" dy="0" result="n"/>`);
  return `<figure class="cell" data-id="${id}" data-scale="1" data-vw="${size}" data-vh="${size}" data-kind="noise">
    <figcaption>${id}</figcaption>
    <div class="frame" style="width:${size}px;height:${size}px">
      <svg data-shot="${id}" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <defs>
          <filter id="${id}" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse" x="0" y="0" width="${size}" height="${size}">
            ${steps.join('')}
          </filter>
        </defs>
        <rect width="${size}" height="${size}" filter="url(#${id})"/>
      </svg>
    </div>
  </figure>`;
}

function buildPage() {
  const blob = { width: 230, height: 230, d: blobPath() };
  const variants = [
    { id: 'cal-circle', kind: 'path', d: roundedRectPath(40, 40, 150, 150, 999) },
    { id: 'cal-wobble', kind: 'path', d: wavyCirclePath(115, 115, 75, 6, 7) },
    { id: 'cal-stairs', kind: 'path', d: stairCirclePath(115, 115, 75) },
    { id: 'baseline', waviness: 6, octaves: 2, freq: 0.018, edgeBlur: 0.5 },
    { id: 'calm', waviness: 0 },
    { id: 'no-edge-blur', waviness: 6, edgeBlur: 0 },
    { id: 'edge-blur-1', waviness: 6, edgeBlur: 1 },
    { id: 'edge-blur-1-5', waviness: 6, edgeBlur: 1.5 },
    { id: 'octaves-1', waviness: 6, octaves: 1 },
    { id: 'octaves-4', waviness: 6, octaves: 4 },
    { id: 'freq-low', waviness: 6, freq: 0.008 },
    { id: 'freq-high', waviness: 6, freq: 0.04 },
    { id: 'type-turbulence', waviness: 6, type: 'turbulence' },
    { id: 'posterize-noise', waviness: 6, posterize: true },
    { id: 'blur-noise-1', waviness: 6, noiseBlur: 1 },
    { id: 'blur-noise-2', waviness: 6, noiseBlur: 2 },
    { id: 'blur-noise-3', waviness: 6, noiseBlur: 3 },
    { id: 'smooth-field', waviness: 6, noiseBlur: 8 },
    { id: 'reconstruct-08-8', waviness: 6, edgeBlur: 0.8, reconstruct: true, reconstructSlope: 8 },
    { id: 'reconstruct-12-10', waviness: 6, edgeBlur: 1.2, reconstruct: true, reconstructSlope: 10 },
    { id: 'preblur-1', waviness: 6, edgeBlur: 0, noiseBlur: 0, preBlur: 1 },
    { id: 'preblur-1-post-05', waviness: 6, edgeBlur: 0.5, preBlur: 1 },
    { id: 'preblur-075', waviness: 6, edgeBlur: 0, preBlur: 0.75 },
  ];

  const figures = [];
  const meta = [];

  for (const variant of variants) {
    if (variant.kind === 'path') {
      figures.push(
        figureSvg({
          id: variant.id,
          width: blob.width,
          height: blob.height,
          d: variant.d,
          filter: '',
        }),
      );
      meta.push({ id: variant.id, passes: 0, pad: 0, cssScale: 1, width: blob.width, height: blob.height });
      continue;
    }
    const pad = padFor(variant);
    const built = gooFilter({
      id: variant.id,
      width: blob.width,
      height: blob.height,
      pad,
      waviness: variant.waviness ?? WAVINESS,
      wavinessFreq: variant.freq ?? BASE_FREQ,
      octaves: variant.octaves ?? 2,
      type: variant.type ?? 'fractalNoise',
      edgeBlur: variant.edgeBlur ?? EDGE_BLUR,
      noiseBlur: variant.noiseBlur ?? 0,
      preBlur: variant.preBlur ?? 0,
      posterize: variant.posterize ?? false,
      reconstruct: variant.reconstruct ?? false,
      reconstructSlope: variant.reconstructSlope ?? 8,
    });
    figures.push(
      figureSvg({
        id: variant.id,
        width: blob.width,
        height: blob.height,
        d: blob.d,
        filter: built.xml,
      }),
    );
    meta.push({
      id: variant.id,
      passes: built.passes,
      pad,
      cssScale: 1,
      width: blob.width,
      height: blob.height,
      variant,
    });
  }

  // 4x re-raster of the current baseline: same user-space filter, more device pixels.
  {
    const pad = padFor({ waviness: 6, edgeBlur: 0.5 });
    const built = gooFilter({
      id: 'baseline-4x',
      width: blob.width,
      height: blob.height,
      pad,
      waviness: 6,
      edgeBlur: 0.5,
    });
    figures.push(
      figureSvg({
        id: 'baseline-4x',
        width: blob.width,
        height: blob.height,
        d: blob.d,
        filter: built.xml,
        scale: 4,
      }),
    );
    meta.push({
      id: 'baseline-4x',
      passes: built.passes,
      pad,
      cssScale: 4,
      width: blob.width,
      height: blob.height,
    });
  }

  // Teal 52px pill, production baseline — the segmented-control indicator scale.
  {
    const width = 248;
    const height = 80;
    const pad = padFor({ waviness: 6, edgeBlur: 0.5 });
    const built = gooFilter({
      id: 'pill-baseline',
      width,
      height,
      pad,
      waviness: 6,
      edgeBlur: 0.5,
    });
    figures.push(figureSvg({ id: 'pill-baseline', width, height, d: pillPath(), filter: built.xml }));
    meta.push({ id: 'pill-baseline', passes: built.passes, pad, cssScale: 1, width, height });
    const calm = gooFilter({ id: 'pill-calm', width, height, pad: padFor({ waviness: 0 }), waviness: 0 });
    figures.push(figureSvg({ id: 'pill-calm', width, height, d: pillPath(), filter: calm.xml }));
    meta.push({ id: 'pill-calm', passes: calm.passes, pad: padFor({ waviness: 0 }), cssScale: 1, width, height });
  }

  figures.push(noiseSvg({ id: 'noise-baseline', octaves: 2 }));
  figures.push(noiseSvg({ id: 'noise-octaves-1', octaves: 1 }));
  figures.push(noiseSvg({ id: 'noise-posterize', octaves: 2, posterize: true }));
  figures.push(noiseSvg({ id: 'noise-blur-2', octaves: 2, blur: 2 }));
  figures.push(noiseSvg({ id: 'noise-freq-low', octaves: 2, freq: 0.008 }));
  figures.push(noiseSvg({ id: 'noise-freq-high', octaves: 2, freq: 0.04 }));

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>liquid edge quality</title>
  <style>
    html, body { margin: 0; background: transparent; font: 12px/1.4 ui-monospace, monospace; color: #3b2d23; }
    .grid { display: flex; flex-wrap: wrap; gap: 24px; padding: 24px; }
    .cell { margin: 0; }
    figcaption { margin-bottom: 6px; }
    .frame { background: transparent; }
    svg { display: block; }
  </style>
</head>
<body>
  <div class="grid">${figures.join('\n')}</div>
</body>
</html>`;
  return { html, meta };
}

async function analyzeFromDataUrl({ dataUrl, options }) {
  const round4 = (v) => Math.round(v * 10000) / 10000;
  const nnCrop = (buf, width, height, x, y, size, zoom) => {
    const sx = Math.max(0, Math.min(width - size, x));
    const sy = Math.max(0, Math.min(height - size, y));
    const dw = size * zoom;
    const dh = size * zoom;
    const out = document.createElement('canvas');
    out.width = dw;
    out.height = dh;
    const octx = out.getContext('2d');
    const imgData = octx.createImageData(dw, dh);
    for (let yy = 0; yy < dh; yy += 1) {
      const srcY = sy + Math.floor(yy / zoom);
      for (let xx = 0; xx < dw; xx += 1) {
        const srcX = sx + Math.floor(xx / zoom);
        const si = (srcY * width + srcX) * 4;
        const di = (yy * dw + xx) * 4;
        if (buf[si + 3] === 0) {
          const checker = ((Math.floor(xx / zoom) + Math.floor(yy / zoom)) & 1) === 0;
          imgData.data[di] = checker ? 240 : 210;
          imgData.data[di + 1] = checker ? 240 : 210;
          imgData.data[di + 2] = checker ? 240 : 210;
          imgData.data[di + 3] = 255;
        } else {
          imgData.data[di] = buf[si];
          imgData.data[di + 1] = buf[si + 1];
          imgData.data[di + 2] = buf[si + 2];
          imgData.data[di + 3] = 255;
        }
      }
    }
    octx.putImageData(imgData, 0, 0);
    return out.toDataURL('image/png');
  };
  const gaussSmooth = (values, sigmaBins) => {
    const n = values.length;
    const radius = Math.max(1, Math.ceil(sigmaBins * 3));
    const weights = [];
    let wsum = 0;
    for (let k = -radius; k <= radius; k += 1) {
      const wt = Math.exp(-(k * k) / (2 * sigmaBins * sigmaBins));
      weights.push(wt);
      wsum += wt;
    }
    return values.map((_, i) => {
      let acc = 0;
      for (let k = -radius; k <= radius; k += 1) {
        acc += values[(i + k + n * 8) % n] * (weights[k + radius] / wsum);
      }
      return acc;
    });
  };
  const rmsDiff = (a, b) => {
    let s = 0;
    for (let i = 0; i < a.length; i += 1) s += (a[i] - b[i]) ** 2;
    return Math.sqrt(s / a.length);
  };
  const rmsAbout = (values, mean) => {
    let s = 0;
    for (const v of values) s += (v - mean) ** 2;
    return Math.sqrt(s / values.length);
  };
  const bandRms = (signal, meanR, lambdaMin, lambdaMax) => {
    const n = signal.length;
    let energy = 0;
    const half = Math.floor(n / 2);
    for (let k = 1; k < half; k += 1) {
      let re = 0;
      let im = 0;
      for (let t = 0; t < n; t += 1) {
        const ang = (2 * Math.PI * k * t) / n;
        re += signal[t] * Math.cos(ang);
        im -= signal[t] * Math.sin(ang);
      }
      const mag = Math.hypot(re, im) / n;
      const lambda = (2 * Math.PI * meanR) / k;
      if (lambda >= lambdaMin && lambda < lambdaMax) energy += 2 * mag * mag;
    }
    return Math.sqrt(Math.max(0, energy));
  };

  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, w, h);
  const pxPerCss = options.viewCssWidth > 0 ? w / options.viewCssWidth : options.pxPerCss || 2;
  const kind = options.kind ?? 'shape';

  const alphaAt = (x, y) => {
    const xi = Math.round(x);
    const yi = Math.round(y);
    if (xi < 0 || yi < 0 || xi >= w || yi >= h) return 0;
    return data[(yi * w + xi) * 4 + 3];
  };
  const sampleAlpha = (x, y) => {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;
    return (
      alphaAt(x0, y0) * (1 - fx) * (1 - fy) +
      alphaAt(x0 + 1, y0) * fx * (1 - fy) +
      alphaAt(x0, y0 + 1) * (1 - fx) * fy +
      alphaAt(x0 + 1, y0 + 1) * fx * fy
    );
  };

  if (kind === 'noise') {
    let plateau = 0;
    let zero = 0;
    let n = 0;
    let sum = 0;
    const mags = [];
    for (let y = 1; y < h - 1; y += 1) {
      for (let x = 1; x < w - 1; x += 1) {
        const i = (y * w + x) * 4;
        const gx = data[i + 4] - data[i - 4];
        const gy = data[((y + 1) * w + x) * 4] - data[((y - 1) * w + x) * 4];
        const mag = Math.hypot(gx, gy);
        mags.push(mag);
        sum += mag;
        if (mag < 0.5) plateau += 1;
        if (mag === 0) zero += 1;
        n += 1;
      }
    }
    mags.sort((a, b) => a - b);
    const pct = (p) => mags[Math.min(mags.length - 1, Math.floor(p * (mags.length - 1)))] ?? 0;
    return {
      kind: 'noise',
      width: w,
      height: h,
      plateauFrac: plateau / Math.max(1, n),
      gradZeroFrac: zero / Math.max(1, n),
      gradMean: sum / Math.max(1, n),
      gradP10: pct(0.1),
      gradP50: pct(0.5),
      gradP90: pct(0.9),
      cropDataUrl: nnCrop(data, w, h, Math.floor(w * 0.35), Math.floor(h * 0.35), 32, 10),
    };
  }

  const threshold = 128;
  let mass = 0;
  let cx = 0;
  let cy = 0;
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (data[(y * w + x) * 4 + 3] >= threshold) {
        mass += 1;
        cx += x;
        cy += y;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (mass < 30) return { error: 'no-silhouette', width: w, height: h, mass };
  cx /= mass;
  cy /= mass;

  const bins = 720;
  const rMax = new Array(bins).fill(0);
  let edgeCount = 0;
  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      if (data[(y * w + x) * 4 + 3] < threshold) continue;
      const edge =
        data[(y * w + x - 1) * 4 + 3] < threshold ||
        data[(y * w + x + 1) * 4 + 3] < threshold ||
        data[((y - 1) * w + x) * 4 + 3] < threshold ||
        data[((y + 1) * w + x) * 4 + 3] < threshold;
      if (!edge) continue;
      edgeCount += 1;
      const dx = x - cx;
      const dy = y - cy;
      let ang = Math.atan2(dy, dx);
      if (ang < 0) ang += Math.PI * 2;
      const bin = Math.min(bins - 1, Math.floor((ang / (Math.PI * 2)) * bins));
      const r = Math.hypot(dx, dy) / pxPerCss;
      if (r > rMax[bin]) rMax[bin] = r;
    }
  }
  if (edgeCount < 16) return { error: 'no-edge', width: w, height: h, mass, edgeCount };

  for (let i = 0; i < bins; i += 1) {
    if (rMax[i] > 0) continue;
    let prev = i;
    let next = i;
    for (let k = 1; k < bins; k += 1) {
      if (rMax[(i - k + bins) % bins] > 0) {
        prev = (i - k + bins) % bins;
        break;
      }
    }
    for (let k = 1; k < bins; k += 1) {
      if (rMax[(i + k) % bins] > 0) {
        next = (i + k) % bins;
        break;
      }
    }
    rMax[i] = (rMax[prev] + rMax[next]) / 2;
  }

  const meanR = rMax.reduce((s, v) => s + v, 0) / bins;
  const sigmaAa = Math.max(0.6, (2.2 * bins) / (2 * Math.PI * meanR));
  const sigmaOrg = Math.max(1.2, (8 * bins) / (2 * Math.PI * meanR));
  const rAa = gaussSmooth(rMax, sigmaAa);
  const rOrg = gaussSmooth(rMax, sigmaOrg);
  const jaggedRms = rmsDiff(rMax, rAa);
  const wobbleRms = rmsAbout(rAa, meanR);

  const widths = [];
  for (let i = 0; i < bins; i += 8) {
    const ang = (i / bins) * Math.PI * 2;
    const ux = Math.cos(ang);
    const uy = Math.sin(ang);
    const px = cx / pxPerCss;
    const py = cy / pxPerCss;
    let s15 = null;
    let s85 = null;
    for (let s = meanR - 8; s <= meanR + 8; s += 0.1) {
      const a = sampleAlpha((px + ux * s) * pxPerCss, (py + uy * s) * pxPerCss) / 255;
      if (s15 === null && a >= 0.15) s15 = s;
      if (s85 === null && a >= 0.85) s85 = s;
    }
    if (s15 !== null && s85 !== null) widths.push(Math.abs(s85 - s15));
  }
  const fringe = widths.length ? widths.reduce((s, v) => s + v, 0) / widths.length : 0;

  let worstI = 0;
  let worst = -1;
  for (let i = 0; i < bins; i += 1) {
    const local = Math.abs(rMax[i] - rAa[i]);
    if (local > worst) {
      worst = local;
      worstI = i;
    }
  }
  const eastAng = 0;
  const worstAng = (worstI / bins) * Math.PI * 2;
  const cropOf = (ang) => {
    const r = rMax[Math.min(bins - 1, Math.floor((ang / (Math.PI * 2)) * bins))] || meanR;
    const x = cx + Math.cos(ang) * r * pxPerCss;
    const y = cy + Math.sin(ang) * r * pxPerCss;
    return nnCrop(data, w, h, Math.round(x) - 18, Math.round(y) - 18, 36, 10);
  };

  return {
    kind: 'shape',
    width: w,
    height: h,
    mass,
    edgeCount,
    pxPerCss: round4(pxPerCss),
    meanRadiusCssPx: round4(meanR),
    bboxCss: { w: round4((maxX - minX + 1) / pxPerCss), h: round4((maxY - minY + 1) / pxPerCss) },
    jaggedRmsCssPx: round4(jaggedRms),
    wobbleRmsCssPx: round4(wobbleRms),
    organicDeviationCssPx: round4(rmsDiff(rAa, rOrg)),
    jaggedBandRmsCssPx: round4(bandRms(rMax, meanR, 0, 5)),
    wobbleBandRmsCssPx: round4(bandRms(rAa, meanR, 12, 70)),
    alphaFringeCssPx: round4(fringe),
    worstLocalJaggedCssPx: round4(worst),
    cropDataUrl: cropOf(worstAng),
    eastCropDataUrl: cropOf(eastAng),
  };
}

async function saveDataUrl(dataUrl, filePath) {
  const match = /^data:image\/png;base64,(.+)$/.exec(dataUrl || '');
  if (!match) return;
  await writeFile(filePath, Buffer.from(match[1], 'base64'));
}

function stripDataUrl(row) {
  const { cropDataUrl, eastCropDataUrl, ...rest } = row;
  return rest;
}

async function captureStory(page, { id, url, selector, fileStem }) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 120_000 });
  await page.waitForTimeout(700);
  await page.addStyleTag({
    content: `
      .game-ui-liquid-content, .game-ui-segmented-option { opacity: 0 !important; }
      .game-ui-segmented-surface { opacity: 0 !important; }
      .game-ui-clay-preview { background: transparent !important; }
      .game-ui-liquid-gooey-card, .game-ui-liquid-demo-stage,
      .game-ui-liquid-waviness-cell, .game-ui-liquid-waviness-comparison { background: transparent !important; box-shadow: none !important; }
    `,
  });
  const loc = page.locator(selector).first();
  await loc.waitFor({ timeout: 60_000 });
  const buf = await loc.screenshot({ omitBackground: true });
  await writeFile(path.join(capturesDir, `${fileStem}.png`), buf);
  const box = await loc.boundingBox();
  const analyzed = await page.evaluate(analyzeFromDataUrl, {
    dataUrl: `data:image/png;base64,${buf.toString('base64')}`,
    options: { viewCssWidth: box?.width ?? 1, kind: 'shape' },
  });
  if (analyzed.cropDataUrl) await saveDataUrl(analyzed.cropDataUrl, path.join(cropsDir, `${fileStem}-nn10.png`));
  if (analyzed.eastCropDataUrl) await saveDataUrl(analyzed.eastCropDataUrl, path.join(cropsDir, `${fileStem}-east-nn10.png`));
  return { id, fileStem, box, metrics: stripDataUrl(analyzed) };
}

async function main() {
  await mkdir(capturesDir, { recursive: true });
  await mkdir(cropsDir, { recursive: true });
  const { html, meta } = buildPage();
  const metaById = Object.fromEntries(meta.map((row) => [row.id, row]));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    deviceScaleFactor: 2,
    viewport: { width: 1600, height: 2400 },
  });
  const page = await context.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.waitForTimeout(200);

  const results = [];
  const shotIds = await page.locator('[data-shot]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-shot')),
  );

  for (const id of shotIds) {
    const loc = page.locator(`[data-shot="${id}"]`);
    const buf = await loc.screenshot({ omitBackground: true });
    await writeFile(path.join(capturesDir, `${id}.png`), buf);
    const scale = Number((await loc.evaluate((el) => el.closest('[data-scale]')?.getAttribute('data-scale'))) ?? 1);
    const vw = Number(await loc.evaluate((el) => el.closest('[data-vw]')?.getAttribute('data-vw') ?? '0'));
    const kind = id.startsWith('noise-') ? 'noise' : 'shape';
    const analyzed = await page.evaluate(analyzeFromDataUrl, {
      dataUrl: `data:image/png;base64,${buf.toString('base64')}`,
      options: { viewCssWidth: vw, kind },
    });
    if (analyzed.cropDataUrl) await saveDataUrl(analyzed.cropDataUrl, path.join(cropsDir, `${id}-nn10.png`));
    if (analyzed.eastCropDataUrl) await saveDataUrl(analyzed.eastCropDataUrl, path.join(cropsDir, `${id}-east-nn10.png`));
    results.push({
      id,
      source: 'isolated-svg',
      cssScale: scale,
      meta: metaById[id] ?? null,
      metrics: stripDataUrl(analyzed),
    });
    console.log(
      JSON.stringify({
        id,
        jagged: analyzed.jaggedRmsCssPx,
        wobble: analyzed.wobbleRmsCssPx,
        fringe: analyzed.alphaFringeCssPx,
        plateau: analyzed.plateauFrac,
        error: analyzed.error ?? null,
      }),
    );
  }

  const storybookBase = process.env.STORYBOOK_URL ?? 'http://127.0.0.1:6006';
  const stories = [];
  try {
    stories.push(
      await captureStory(page, {
        id: 'story-waviness-default',
        url: `${storybookBase}/iframe.html?id=clay-effects-liquidgroup--waviness-default&viewMode=story`,
        selector: '[data-liquid-gooey-silhouette]',
        fileStem: 'story-waviness-default',
      }),
    );
    stories.push(
      await captureStory(page, {
        id: 'story-waviness-blob',
        url: `${storybookBase}/iframe.html?id=clay-effects-liquidgroup--waviness-clamp-comparison&viewMode=story`,
        selector: '[data-testid="waviness-blob-after"] [data-liquid-gooey-silhouette]',
        fileStem: 'story-waviness-blob',
      }),
    );
    stories.push(
      await captureStory(page, {
        id: 'story-segmented-teal',
        url: `${storybookBase}/iframe.html?id=clay-controls-gamesegmentedcontrol--move-indicator&viewMode=story`,
        selector: '.game-ui-segmented-follow [data-liquid-gooey-silhouette]',
        fileStem: 'story-segmented-teal',
      }),
    );
  } catch (error) {
    stories.push({ error: String(error) });
    console.error('storybook capture failed', error);
  }

  const report = {
    measuredAt: new Date().toISOString(),
    kitVersion: '1.11.2',
    notes: {
      dpr: 2,
      fill: TEAL,
      productionFilter:
        'feGaussianBlur(goo 6) + feColorMatrix(contrast 18) + feComposite(atop) + feTurbulence(fractalNoise 0.018 octaves=2 seed=7) + feDisplacementMap(scale=12) + feGaussianBlur(0.5)',
    },
    isolated: results,
    storybook: stories,
  };
  await writeFile(path.join(here, 'metrics.json'), JSON.stringify(report, null, 2));
  await browser.close();
  console.log(`wrote ${path.join(here, 'metrics.json')}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

