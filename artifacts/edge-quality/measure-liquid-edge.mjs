/**
 * Pixel-true edge-quality harness for the liquid gooey silhouette.
 *
 * Does not import the donor. Replicates the production SVG filter chain from
 * src/liquidGooeyFilter.tsx so variants can be measured without editing
 * product code. Round 3 ships offset-only inset from the anti-aliased
 * `shape` (the `wavy-inset-aa` control) and asks whether BINARIZE is still
 * needed when nothing consumes `bin`. See EDGE-QUALITY.md.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
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
const BINARIZE = '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 60 -29.5';
const KIT_FILTER_AREA_BUDGET = 480_000;
/** Clay preview canvas-1. Used to composite honest 10× crops; transparent
 *  captures force semi-transparent inset pixels to opaque neon. */
const CLAY_RGB = [246, 232, 210];
const CLAY_CROP_IDS = new Set([
  'wavy-inset',
  'wavy-inset-aa',
  'wavy-inset-aa-keepbin',
  'wavy-shadow-full',
  'wavy-shadow-full-aa',
  'pill-inset',
  'pill-inset-aa',
  'pill-shadow-full',
  'pill-shadow-full-aa',
]);

/** Production `--game-ui-shadow-button` layers, already resolved. */
const INSET_CLAY = {
  x: 0,
  y: 2,
  blur: 0,
  spread: 0,
  color: 'rgba(255, 255, 255, 0.42)',
  inset: true,
};
const DROP_BUTTON = {
  x: 0,
  y: 13,
  blur: 26,
  spread: 0,
  color: 'rgba(76, 52, 28, 0.22)',
  inset: false,
};
const STROKE_TOKEN = { width: 1, color: 'rgba(90, 64, 42, 0.28)' };

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

function circlePath(cx, cy, r) {
  return `M ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} Z`;
}

function shadowExtentOf(shadows) {
  return (shadows ?? []).reduce(
    (extent, shadow) =>
      Math.max(
        extent,
        Math.max(Math.abs(shadow.x), Math.abs(shadow.y)) +
          shadow.blur * 1.5 +
          Math.max(0, shadow.spread),
      ),
    0,
  );
}

function insetPassXml(index, shadow, from) {
  const parts = [];
  let source = from;
  if (shadow.spread !== 0) {
    parts.push(
      `<feMorphology in="${source}" operator="${shadow.spread > 0 ? 'erode' : 'dilate'}" radius="${Math.abs(shadow.spread)}" result="shadow-${index}-erode"/>`,
    );
    source = `shadow-${index}-erode`;
  }
  if (shadow.x !== 0 || shadow.y !== 0) {
    parts.push(
      `<feOffset in="${source}" dx="${shadow.x}" dy="${shadow.y}" result="shadow-${index}-offset"/>`,
    );
    source = `shadow-${index}-offset`;
  }
  if (shadow.blur > 0) {
    parts.push(
      `<feGaussianBlur in="${source}" stdDeviation="${shadow.blur / 2}" result="shadow-${index}-blur"/>`,
    );
    source = `shadow-${index}-blur`;
  }
  parts.push(
    `<feComposite in="${from}" in2="${source}" operator="out" result="shadow-${index}-band"/>`,
    `<feFlood flood-color="${shadow.color}" result="shadow-${index}-color"/>`,
    `<feComposite in="shadow-${index}-color" in2="shadow-${index}-band" operator="in" result="shadow-${index}"/>`,
  );
  return parts;
}

function shadowPassXml(index, shadow) {
  const parts = [];
  let source = 'shape';
  if (shadow.spread !== 0) {
    parts.push(
      `<feMorphology in="bin" operator="${shadow.spread > 0 ? 'dilate' : 'erode'}" radius="${Math.abs(shadow.spread)}" result="shadow-${index}-spread"/>`,
    );
    source = `shadow-${index}-spread`;
  }
  if (shadow.blur > 0) {
    parts.push(
      `<feGaussianBlur in="${source}" stdDeviation="${shadow.blur / 2}" result="shadow-${index}-blur"/>`,
    );
    source = `shadow-${index}-blur`;
  }
  if (shadow.x !== 0 || shadow.y !== 0) {
    parts.push(
      `<feOffset in="${source}" dx="${shadow.x}" dy="${shadow.y}" result="shadow-${index}-offset"/>`,
    );
    source = `shadow-${index}-offset`;
  }
  parts.push(
    `<feFlood flood-color="${shadow.color}" result="shadow-${index}-color"/>`,
    `<feComposite in="shadow-${index}-color" in2="${source}" operator="in" result="shadow-${index}"/>`,
  );
  return parts;
}

function strokePassXml(stroke) {
  return [
    `<feMorphology in="bin" operator="erode" radius="${stroke.width}" result="stroke-erode"/>`,
    `<feComposite in="bin" in2="stroke-erode" operator="out" result="stroke-band"/>`,
    `<feFlood flood-color="${stroke.color}" result="stroke-color"/>`,
    `<feComposite in="stroke-color" in2="stroke-band" operator="in" result="stroke-out"/>`,
  ];
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
  shadows = [],
  stroke = null,
  insetFrom = 'bin',
  forceBin = false,
}) {
  const intercept = INTERCEPT;
  const wavy = waviness > 0;
  const parts = [
    `<feGaussianBlur in="SourceGraphic" stdDeviation="${GOO_BLUR}" result="blur"/>`,
    `<feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${CONTRAST} ${intercept}" result="goo"/>`,
    `<feComposite in="SourceGraphic" in2="goo" operator="atop" result="${wavy ? 'shape-raw' : 'shape'}"/>`,
  ];
  if (wavy) {
    parts.push(
      `<feTurbulence type="${type}" baseFrequency="${wavinessFreq}" numOctaves="${octaves}" seed="7" result="wave-noise"/>`,
      `<feDisplacementMap in="shape-raw" in2="wave-noise" scale="${waviness * 2}" xChannelSelector="R" yChannelSelector="G" result="shape-displaced"/>`,
    );
    if (edgeBlur > 0) {
      parts.push(
        `<feGaussianBlur in="shape-displaced" stdDeviation="${edgeBlur}" result="shape"/>`,
      );
    } else {
      parts.push(`<feOffset in="shape-displaced" dx="0" dy="0" result="shape"/>`);
    }
  }
  const needsBin =
    forceBin ||
    stroke !== null ||
    shadows.some((shadow) => shadow.spread !== 0) ||
    (insetFrom === 'bin' && shadows.some((shadow) => shadow.inset));
  if (needsBin) {
    parts.push(`<feColorMatrix in="shape" type="matrix" values="${BINARIZE}" result="bin"/>`);
  }
  shadows.forEach((shadow, index) => {
    if (shadow.inset) {
      parts.push(...insetPassXml(index, shadow, insetFrom === 'shape' ? 'shape' : 'bin'));
    } else {
      parts.push(...shadowPassXml(index, shadow));
    }
  });
  if (stroke) parts.push(...strokePassXml(stroke));
  if (shadows.length > 0 || stroke) {
    const outer = shadows
      .map((shadow, index) => (shadow.inset ? -1 : index))
      .filter((index) => index >= 0)
      .reverse()
      .map((index) => `<feMergeNode in="shadow-${index}"/>`);
    const inner = shadows
      .map((shadow, index) => (shadow.inset ? `<feMergeNode in="shadow-${index}"/>` : ''))
      .filter(Boolean);
    parts.push(
      `<feMerge>${outer.join('')}<feMergeNode in="shape"/>${stroke ? '<feMergeNode in="stroke-out"/>' : ''}${inner.join('')}</feMerge>`,
    );
  }
  const passes = parts.length;
  const layoutArea = (width + pad * 2) * (height + pad * 2);
  return {
    passes,
    layoutArea,
    xml: `<filter id="${id}" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse" x="${-pad}" y="${-pad}" width="${width + pad * 2}" height="${height + pad * 2}">${parts.join('')}</filter>`,
  };
}

function padFor({
  waviness = WAVINESS,
  edgeBlur = EDGE_BLUR,
  shadows = [],
  stroke = null,
} = {}) {
  return Math.ceil(
    GOO_BLUR * 3 +
      FILTER_PADDING +
      waviness +
      shadowExtentOf(shadows) +
      (stroke ? stroke.width : 0) +
      (waviness > 0 ? Math.ceil(Math.max(edgeBlur, 0) * 3) : 0),
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
  downsample = 1,
  extra = '',
}) {
  const layoutW = width * (downsample === 2 ? 1 : scale);
  const layoutH = height * (downsample === 2 ? 1 : scale);
  const svgW = width * (downsample === 2 ? 2 : scale);
  const svgH = height * (downsample === 2 ? 2 : scale);
  const shotOnFrame = downsample === 2;
  const frameStyle = shotOnFrame
    ? `width:${layoutW}px;height:${layoutH}px;overflow:hidden;position:relative`
    : `width:${layoutW}px;height:${layoutH}px`;
  const svgStyle = shotOnFrame
    ? 'position:absolute;left:0;top:0;transform:scale(0.5);transform-origin:0 0'
    : '';
  const svgShot = shotOnFrame ? '' : ` data-shot="${id}"`;
  const frameShot = shotOnFrame ? ` data-shot="${id}"` : '';
  return `<figure class="cell" data-id="${id}" data-scale="${scale}" data-down="${downsample}" data-vw="${width}" data-vh="${height}">
    <figcaption>${id}</figcaption>
    <div class="frame"${frameShot} style="${frameStyle}">
      <svg${svgShot} xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${width} ${height}" overflow="visible" style="${svgStyle}">
        <defs>${filter}</defs>
        <g ${filter ? `filter="url(#${id})"` : ''} fill="${fill}">
          <path d="${d}"/>
          ${extra}
        </g>
      </svg>
    </div>
  </figure>`;
}

function cssInsetFigure(id) {
  const frame = 230;
  const size = 150;
  const origin = (frame - size) / 2;
  return `<figure class="cell" data-id="${id}" data-scale="1" data-down="1" data-vw="${size}" data-vh="${size}">
    <figcaption>${id}</figcaption>
    <div class="frame" style="width:${frame}px;height:${frame}px;position:relative">
      <div data-shot="${id}" style="position:absolute;left:${origin}px;top:${origin}px;width:${size}px;height:${size}px;border-radius:999px;background:${TEAL};box-shadow:inset 0 2px 0 rgba(255, 255, 255, 0.42)"></div>
    </div>
  </figure>`;
}

function pushGooFigure(figures, meta, { id, width, height, d, downsample = 1, ...variant }) {
  const pad = padFor(variant);
  const built = gooFilter({
    id,
    width,
    height,
    pad,
    waviness: variant.waviness ?? WAVINESS,
    wavinessFreq: variant.freq ?? BASE_FREQ,
    octaves: variant.octaves ?? 2,
    type: variant.type ?? 'fractalNoise',
    edgeBlur: variant.edgeBlur ?? EDGE_BLUR,
    shadows: variant.shadows ?? [],
    stroke: variant.stroke ?? null,
    insetFrom: variant.insetFrom ?? 'bin',
    forceBin: variant.forceBin ?? false,
  });
  figures.push(
    figureSvg({
      id,
      width,
      height,
      d,
      filter: built.xml,
      downsample,
    }),
  );
  const rasterMul = downsample === 2 ? 4 : 1;
  meta.push({
    id,
    passes: built.passes,
    pad,
    cssScale: downsample === 2 ? 2 : 1,
    downsample,
    width,
    height,
    layoutArea: built.layoutArea,
    rasterArea: built.layoutArea * rasterMul,
    overBudgetIfRasterCounted: built.layoutArea * rasterMul > KIT_FILTER_AREA_BUDGET,
    variant: { id, ...variant, downsample },
  });
}

function buildPage() {
  const blob = { width: 230, height: 230, d: blobPath() };
  const pill = { width: 248, height: 80, d: pillPath() };
  const figures = [];
  const meta = [];

  const pathOnly = [
    { id: 'cal-circle', d: roundedRectPath(40, 40, 150, 150, 999) },
    { id: 'cal-wobble', d: wavyCirclePath(115, 115, 75, 6, 7) },
    { id: 'cal-stairs', d: stairCirclePath(115, 115, 75) },
  ];
  for (const variant of pathOnly) {
    figures.push(
      figureSvg({
        id: variant.id,
        width: blob.width,
        height: blob.height,
        d: variant.d,
        filter: '',
      }),
    );
    meta.push({
      id: variant.id,
      passes: 0,
      pad: 0,
      cssScale: 1,
      downsample: 1,
      width: blob.width,
      height: blob.height,
      layoutArea: 0,
      rasterArea: 0,
    });
  }

  const ring = circlePath(115, 115, 74.25);
  const hair = circlePath(115, 115, 75);
  figures.push(
    figureSvg({
      id: 'cal-rim-ring',
      width: blob.width,
      height: blob.height,
      d: blobPath(),
      filter: '',
      extra: `<path d="${ring}" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.5"/>`,
    }),
  );
  meta.push({
    id: 'cal-rim-ring',
    passes: 0,
    pad: 0,
    cssScale: 1,
    downsample: 1,
    width: blob.width,
    height: blob.height,
    layoutArea: 0,
    rasterArea: 0,
  });
  figures.push(
    figureSvg({
      id: 'cal-rim-dashed',
      width: blob.width,
      height: blob.height,
      d: blobPath(),
      filter: '',
      extra: `<path d="${ring}" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.5" stroke-dasharray="5 4"/>`,
    }),
  );
  meta.push({
    id: 'cal-rim-dashed',
    passes: 0,
    pad: 0,
    cssScale: 1,
    downsample: 1,
    width: blob.width,
    height: blob.height,
    layoutArea: 0,
    rasterArea: 0,
  });
  figures.push(
    figureSvg({
      id: 'cal-rim-hairline',
      width: blob.width,
      height: blob.height,
      d: blobPath(),
      filter: '',
      extra: `<path d="${hair}" fill="none" stroke="rgba(255,255,255,0.95)" stroke-width="0.35"/>`,
    }),
  );
  meta.push({
    id: 'cal-rim-hairline',
    passes: 0,
    pad: 0,
    cssScale: 1,
    downsample: 1,
    width: blob.width,
    height: blob.height,
    layoutArea: 0,
    rasterArea: 0,
  });

  figures.push(cssInsetFigure('cal-css-inset'));
  meta.push({
    id: 'cal-css-inset',
    passes: 0,
    pad: 0,
    cssScale: 1,
    downsample: 1,
    width: 150,
    height: 150,
    layoutArea: 0,
    rasterArea: 0,
  });

  pushGooFigure(figures, meta, {
    id: 'cal-inset-bin',
    ...blob,
    waviness: 0,
    shadows: [INSET_CLAY],
  });
  pushGooFigure(figures, meta, {
    id: 'cal-inset-aa',
    ...blob,
    waviness: 0,
    shadows: [INSET_CLAY],
    insetFrom: 'shape',
  });

  pushGooFigure(figures, meta, { id: 'baseline', ...blob, waviness: 6, edgeBlur: 0.5 });
  pushGooFigure(figures, meta, { id: 'calm', ...blob, waviness: 0 });
  pushGooFigure(figures, meta, { id: 'no-edge-blur', ...blob, waviness: 6, edgeBlur: 0 });

  pushGooFigure(figures, meta, {
    id: 'wavy-inset',
    ...blob,
    waviness: 6,
    shadows: [INSET_CLAY],
  });
  pushGooFigure(figures, meta, {
    id: 'wavy-inset-aa',
    ...blob,
    waviness: 6,
    shadows: [INSET_CLAY],
    insetFrom: 'shape',
  });
  pushGooFigure(figures, meta, {
    id: 'wavy-inset-aa-keepbin',
    ...blob,
    waviness: 6,
    shadows: [INSET_CLAY],
    insetFrom: 'shape',
    forceBin: true,
  });
  pushGooFigure(figures, meta, {
    id: 'wavy-shadow-full',
    ...blob,
    waviness: 6,
    shadows: [DROP_BUTTON, INSET_CLAY],
  });
  pushGooFigure(figures, meta, {
    id: 'wavy-shadow-full-aa',
    ...blob,
    waviness: 6,
    shadows: [DROP_BUTTON, INSET_CLAY],
    insetFrom: 'shape',
  });
  pushGooFigure(figures, meta, {
    id: 'wavy-stroke',
    ...blob,
    waviness: 6,
    stroke: STROKE_TOKEN,
  });

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
      downsample: 1,
      width: blob.width,
      height: blob.height,
      layoutArea: built.layoutArea,
      rasterArea: built.layoutArea * 16,
      overBudgetIfRasterCounted: built.layoutArea * 16 > KIT_FILTER_AREA_BUDGET,
    });
  }

  pushGooFigure(figures, meta, {
    id: 'baseline-2x',
    ...blob,
    waviness: 6,
    downsample: 2,
  });
  pushGooFigure(figures, meta, {
    id: 'wavy-inset-2x',
    ...blob,
    waviness: 6,
    shadows: [INSET_CLAY],
    downsample: 2,
  });
  pushGooFigure(figures, meta, {
    id: 'wavy-inset-aa-2x',
    ...blob,
    waviness: 6,
    shadows: [INSET_CLAY],
    insetFrom: 'shape',
    downsample: 2,
  });

  pushGooFigure(figures, meta, { id: 'pill-baseline', ...pill, waviness: 6 });
  pushGooFigure(figures, meta, { id: 'pill-calm', ...pill, waviness: 0 });
  pushGooFigure(figures, meta, {
    id: 'pill-inset',
    ...pill,
    waviness: 6,
    shadows: [INSET_CLAY],
  });
  pushGooFigure(figures, meta, {
    id: 'pill-inset-aa',
    ...pill,
    waviness: 6,
    shadows: [INSET_CLAY],
    insetFrom: 'shape',
  });
  pushGooFigure(figures, meta, {
    id: 'pill-inset-2x',
    ...pill,
    waviness: 6,
    shadows: [INSET_CLAY],
    downsample: 2,
  });
  pushGooFigure(figures, meta, {
    id: 'pill-shadow-full',
    ...pill,
    waviness: 6,
    shadows: [DROP_BUTTON, INSET_CLAY],
  });
  pushGooFigure(figures, meta, {
    id: 'pill-shadow-full-aa',
    ...pill,
    waviness: 6,
    shadows: [DROP_BUTTON, INSET_CLAY],
    insetFrom: 'shape',
  });

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
  const nnCrop = (buf, width, height, x, y, size, zoom, bg) => {
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
        const a = buf[si + 3] / 255;
        if (bg) {
          imgData.data[di] = Math.round(buf[si] * a + bg[0] * (1 - a));
          imgData.data[di + 1] = Math.round(buf[si + 1] * a + bg[1] * (1 - a));
          imgData.data[di + 2] = Math.round(buf[si + 2] * a + bg[2] * (1 - a));
          imgData.data[di + 3] = 255;
        } else if (buf[si + 3] === 0) {
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
  const meanOf = (values) =>
    values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
  const sectorFrac = (flags, fromDeg, toDeg) => {
    const n = flags.length;
    let hit = 0;
    let count = 0;
    for (let i = 0; i < n; i += 1) {
      const deg = (i / n) * 360;
      const inSector =
        fromDeg <= toDeg ? deg >= fromDeg && deg < toDeg : deg >= fromDeg || deg < toDeg;
      if (!inSector) continue;
      count += 1;
      hit += flags[i];
    }
    return count ? hit / count : 0;
  };
  const circularRuns = (flags) => {
    const n = flags.length;
    if (n === 0) return { present: [], absent: [], breaks: 0 };
    if (flags.every((v) => v === flags[0])) {
      return flags[0]
        ? { present: [n], absent: [], breaks: 0 }
        : { present: [], absent: [n], breaks: 0 };
    }
    let start = 0;
    for (let k = 1; k < n; k += 1) {
      if (flags[k] !== flags[0]) {
        start = k;
        break;
      }
    }
    const present = [];
    const absent = [];
    let val = flags[start];
    let count = 0;
    for (let k = 0; k < n; k += 1) {
      const j = (start + k) % n;
      if (flags[j] === val) count += 1;
      else {
        (val ? present : absent).push(count);
        val = flags[j];
        count = 1;
      }
    }
    (val ? present : absent).push(count);
    return { present, absent, breaks: present.length + absent.length };
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
  const chanAt = (x, y, c) => {
    const xi = Math.round(x);
    const yi = Math.round(y);
    if (xi < 0 || yi < 0 || xi >= w || yi >= h) return 0;
    return data[(yi * w + xi) * 4 + c];
  };
  const sampleChan = (x, y, c) => {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;
    return (
      chanAt(x0, y0, c) * (1 - fx) * (1 - fy) +
      chanAt(x0 + 1, y0, c) * fx * (1 - fy) +
      chanAt(x0, y0 + 1, c) * (1 - fx) * fy +
      chanAt(x0 + 1, y0 + 1, c) * fx * fy
    );
  };
  const sampleLum = (x, y) =>
    0.2126 * sampleChan(x, y, 0) + 0.7152 * sampleChan(x, y, 1) + 0.0722 * sampleChan(x, y, 2);

  if (kind === 'noise') {
    return { kind: 'noise', width: w, height: h, error: 'noise-skipped' };
  }

  const threshold = 128;
  const fillKey = options.fillRgb || null;
  const fillDist2 = options.fillDist2 ?? 170 * 170;
  const isInk = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return false;
    const i = (y * w + x) * 4;
    if (data[i + 3] < threshold) return false;
    if (!fillKey) return true;
    const dr = data[i] - fillKey[0];
    const dg = data[i + 1] - fillKey[1];
    const db = data[i + 2] - fillKey[2];
    return dr * dr + dg * dg + db * db < fillDist2;
  };
  let mass = 0;
  let cx = 0;
  let cy = 0;
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (isInk(x, y)) {
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
      if (!isInk(x, y)) continue;
      const edge = !isInk(x - 1, y) || !isInk(x + 1, y) || !isInk(x, y - 1) || !isInk(x, y + 1);
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

  let fillLumAcc = 0;
  let fillN = 0;
  for (let y = Math.floor(cy) - 4; y <= Math.floor(cy) + 4; y += 1) {
    for (let x = Math.floor(cx) - 4; x <= Math.floor(cx) + 4; x += 1) {
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      const i = (y * w + x) * 4;
      if (data[i + 3] < 250) continue;
      fillLumAcc += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      fillN += 1;
    }
  }
  const fillLum = fillN ? fillLumAcc / fillN : 0;
  const PALE_EXCESS = 18;
  const OPAQUE = 160;
  const peakExcess = new Array(bins).fill(0);
  const present = new Array(bins).fill(0);
  for (let i = 0; i < bins; i += 1) {
    const ang = (i / bins) * Math.PI * 2;
    const ux = Math.cos(ang);
    const uy = Math.sin(ang);
    const r = rMax[i];
    let peak = 0;
    for (let s = r + 1.2; s >= r - 4; s -= 0.25) {
      const x = cx + ux * s * pxPerCss;
      const y = cy + uy * s * pxPerCss;
      if (sampleAlpha(x, y) < OPAQUE) continue;
      if (fillKey && !isInk(Math.round(x), Math.round(y))) continue;
      const ex = sampleLum(x, y) - fillLum;
      if (ex > peak) peak = ex;
    }
    peakExcess[i] = peak;
    present[i] = peak >= PALE_EXCESS ? 1 : 0;
  }
  const perimeterCss = 2 * Math.PI * meanR;
  const binCss = perimeterCss / bins;
  const runs = circularRuns(present);
  const presentPeaks = peakExcess.filter((_, i) => present[i]);
  const peakMean = meanOf(presentPeaks);
  const peakStd = presentPeaks.length
    ? Math.sqrt(meanOf(presentPeaks.map((v) => (v - peakMean) ** 2)))
    : 0;

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
  const northAng = (3 * Math.PI) / 2;
  const worstAng = (worstI / bins) * Math.PI * 2;
  const cropOf = (ang, bg) => {
    const r = rMax[Math.min(bins - 1, Math.floor((ang / (Math.PI * 2)) * bins))] || meanR;
    const x = cx + Math.cos(ang) * r * pxPerCss;
    const y = cy + Math.sin(ang) * r * pxPerCss;
    return nnCrop(data, w, h, Math.round(x) - 18, Math.round(y) - 18, 36, 10, bg);
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
    fillLum: round4(fillLum),
    rimPresentFrac: round4(meanOf(present)),
    rimNorthPresentFrac: round4(sectorFrac(present, 250, 290)),
    rimEastPresentFrac: round4(sectorFrac(present, 340, 20)),
    rimSouthPresentFrac: round4(sectorFrac(present, 70, 110)),
    rimMeanPresentRunCssPx: round4(meanOf(runs.present) * binCss),
    rimMeanAbsentRunCssPx: round4(meanOf(runs.absent) * binCss),
    rimBreaksPer100CssPx: round4(perimeterCss > 0 ? (runs.breaks / perimeterCss) * 100 : 0),
    rimPeakMeanExcess: round4(peakMean),
    rimPeakCv: round4(peakMean > 0 ? peakStd / peakMean : 0),
    cropDataUrl: cropOf(worstAng),
    eastCropDataUrl: cropOf(eastAng),
    northCropDataUrl: cropOf(northAng),
    clayEastCropDataUrl: options.clayRgb ? cropOf(eastAng, options.clayRgb) : null,
    clayNorthCropDataUrl: options.clayRgb ? cropOf(northAng, options.clayRgb) : null,
  };
}

async function saveDataUrl(dataUrl, filePath) {
  const match = /^data:image\/png;base64,(.+)$/.exec(dataUrl || '');
  if (!match) return;
  await writeFile(filePath, Buffer.from(match[1], 'base64'));
}

function stripDataUrl(row) {
  const {
    cropDataUrl,
    eastCropDataUrl,
    northCropDataUrl,
    clayEastCropDataUrl,
    clayNorthCropDataUrl,
    ...rest
  } = row;
  return rest;
}

function compactLog(id, analyzed, extra = {}) {
  return JSON.stringify({
    id,
    jagged: analyzed.jaggedRmsCssPx,
    wobble: analyzed.wobbleRmsCssPx,
    rim: analyzed.rimPresentFrac,
    north: analyzed.rimNorthPresentFrac,
    east: analyzed.rimEastPresentFrac,
    breaks: analyzed.rimBreaksPer100CssPx,
    error: analyzed.error ?? null,
    ...extra,
  });
}

async function captureStory(page, { id, url, selector, fileStem, hideChrome, dumpFilter, fillRgb, clayRgb }) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 120_000 });
  await page.waitForTimeout(700);
  if (hideChrome) {
    await page.addStyleTag({
      content: `
        .game-ui-liquid-content, .game-ui-segmented-option { opacity: 0 !important; }
        .game-ui-segmented-surface { opacity: 0 !important; }
        .game-ui-clay-preview { background: transparent !important; }
        .game-ui-liquid-gooey-card, .game-ui-liquid-demo-stage,
        .game-ui-liquid-waviness-cell, .game-ui-liquid-waviness-comparison { background: transparent !important; box-shadow: none !important; }
      `,
    });
  }
  const loc = page.locator(selector).first();
  await loc.waitFor({ timeout: 60_000 });
  const buf = await loc.screenshot({ omitBackground: hideChrome });
  await writeFile(path.join(capturesDir, `${fileStem}.png`), buf);
  const box = await loc.boundingBox();
  let filterDump = null;
  if (dumpFilter) {
    filterDump = await page.evaluate(() => {
      const group = document.querySelector('.game-ui-segmented-follow');
      const sil = group?.querySelector('[data-liquid-gooey-silhouette]');
      const filter = sil?.querySelector('filter');
      const primitives = filter
        ? Array.from(filter.children).map((node) => ({
            tag: node.tagName.toLowerCase(),
            in: node.getAttribute('in'),
            in2: node.getAttribute('in2'),
            result: node.getAttribute('result'),
            dx: node.getAttribute('dx'),
            dy: node.getAttribute('dy'),
            operator: node.getAttribute('operator'),
            flood: node.getAttribute('flood-color') || node.getAttribute('floodColor'),
            stdDeviation: node.getAttribute('stdDeviation'),
            radius: node.getAttribute('radius'),
            values: node.getAttribute('values'),
          }))
        : [];
      return {
        area: group?.getAttribute('data-liquid-filter-area'),
        budget: group?.getAttribute('data-liquid-filter-budget'),
        waviness: group?.getAttribute('data-liquid-waviness'),
        groupBox: group
          ? {
              w: Math.round(group.getBoundingClientRect().width),
              h: Math.round(group.getBoundingClientRect().height),
            }
          : null,
        filterId: filter?.id ?? null,
        primitiveCount: primitives.length,
        primitives,
      };
    });
  }
  const analyzed = await page.evaluate(analyzeFromDataUrl, {
    dataUrl: `data:image/png;base64,${buf.toString('base64')}`,
    options: {
      viewCssWidth: box?.width ?? 1,
      kind: 'shape',
      fillRgb: fillRgb ?? null,
      clayRgb: clayRgb ?? null,
    },
  });
  if (analyzed.cropDataUrl) await saveDataUrl(analyzed.cropDataUrl, path.join(cropsDir, `${fileStem}-nn10.png`));
  if (analyzed.eastCropDataUrl) {
    await saveDataUrl(analyzed.eastCropDataUrl, path.join(cropsDir, `${fileStem}-east-nn10.png`));
  }
  if (analyzed.northCropDataUrl) {
    await saveDataUrl(analyzed.northCropDataUrl, path.join(cropsDir, `${fileStem}-north-nn10.png`));
  }
  if (analyzed.clayEastCropDataUrl) {
    await saveDataUrl(analyzed.clayEastCropDataUrl, path.join(cropsDir, `${fileStem}-clay-east-nn10.png`));
  }
  if (analyzed.clayNorthCropDataUrl) {
    await saveDataUrl(analyzed.clayNorthCropDataUrl, path.join(cropsDir, `${fileStem}-clay-north-nn10.png`));
  }
  return { id, fileStem, box, filterDump, metrics: stripDataUrl(analyzed) };
}

async function main() {
  await mkdir(capturesDir, { recursive: true });
  await mkdir(cropsDir, { recursive: true });
  const { html, meta } = buildPage();
  const metaById = Object.fromEntries(meta.map((row) => [row.id, row]));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    deviceScaleFactor: 2,
    viewport: { width: 1600, height: 2800 },
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
    const vw = Number(await loc.evaluate((el) => el.closest('[data-vw]')?.getAttribute('data-vw') ?? '0'));
    const analyzed = await page.evaluate(analyzeFromDataUrl, {
      dataUrl: `data:image/png;base64,${buf.toString('base64')}`,
      options: { viewCssWidth: vw, kind: 'shape', clayRgb: CLAY_CROP_IDS.has(id) ? CLAY_RGB : null },
    });
    if (analyzed.cropDataUrl) await saveDataUrl(analyzed.cropDataUrl, path.join(cropsDir, `${id}-nn10.png`));
    if (analyzed.eastCropDataUrl) {
      await saveDataUrl(analyzed.eastCropDataUrl, path.join(cropsDir, `${id}-east-nn10.png`));
    }
    if (analyzed.northCropDataUrl) {
      await saveDataUrl(analyzed.northCropDataUrl, path.join(cropsDir, `${id}-north-nn10.png`));
    }
    if (analyzed.clayEastCropDataUrl) {
      await saveDataUrl(analyzed.clayEastCropDataUrl, path.join(cropsDir, `${id}-clay-east-nn10.png`));
    }
    if (analyzed.clayNorthCropDataUrl) {
      await saveDataUrl(analyzed.clayNorthCropDataUrl, path.join(cropsDir, `${id}-clay-north-nn10.png`));
    }
    results.push({
      id,
      source: 'isolated-svg',
      meta: metaById[id] ?? null,
      metrics: stripDataUrl(analyzed),
    });
    console.log(compactLog(id, analyzed));
  }

  const extra = [];
  for (const srcId of ['baseline-4x']) {
    const srcPath = path.join(capturesDir, `${srcId}.png`);
    const destId = `${srcId}-down`;
    const png = await readFile(srcPath);
    await page.setContent(
      `<!doctype html><html><body style="margin:0;background:transparent"><img id="down" src="data:image/png;base64,${png.toString('base64')}" width="230" height="230" style="display:block;image-rendering:auto"/></body></html>`,
    );
    await page.waitForTimeout(100);
    const buf = await page.locator('#down').screenshot({ omitBackground: true });
    await writeFile(path.join(capturesDir, `${destId}.png`), buf);
    const analyzed = await page.evaluate(analyzeFromDataUrl, {
      dataUrl: `data:image/png;base64,${buf.toString('base64')}`,
      options: { viewCssWidth: 230, kind: 'shape' },
    });
    if (analyzed.eastCropDataUrl) {
      await saveDataUrl(analyzed.eastCropDataUrl, path.join(cropsDir, `${destId}-east-nn10.png`));
    }
    extra.push({ id: destId, source: '4x-bilinear-down', metrics: stripDataUrl(analyzed) });
    console.log(compactLog(destId, analyzed, { down: true }));
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
        hideChrome: true,
      }),
    );
    stories.push(
      await captureStory(page, {
        id: 'story-waviness-blob',
        url: `${storybookBase}/iframe.html?id=clay-effects-liquidgroup--waviness-clamp-comparison&viewMode=story`,
        selector: '[data-testid="waviness-blob-after"] [data-liquid-gooey-silhouette]',
        fileStem: 'story-waviness-blob',
        hideChrome: true,
      }),
    );
    stories.push(
      await captureStory(page, {
        id: 'story-segmented-teal-after',
        url: `${storybookBase}/iframe.html?id=clay-controls-gamesegmentedcontrol--move-indicator&viewMode=story`,
        selector: '.game-ui-segmented-follow [data-liquid-gooey-silhouette]',
        fileStem: 'story-segmented-teal-after',
        hideChrome: true,
        dumpFilter: true,
        clayRgb: CLAY_RGB,
      }),
    );
    stories.push(
      await captureStory(page, {
        id: 'story-segmented-on-clay-after',
        url: `${storybookBase}/iframe.html?id=clay-controls-gamesegmentedcontrol--move-indicator&viewMode=story`,
        selector: '.game-ui-segmented',
        fileStem: 'story-segmented-on-clay-after',
        hideChrome: false,
      }),
    );
  } catch (error) {
    stories.push({ error: String(error) });
    console.error('storybook capture failed', error);
  }

  for (const story of stories) {
    if (story?.metrics) console.log(compactLog(story.id, story.metrics, { story: true }));
    if (story?.filterDump) {
      console.log(
        JSON.stringify({
          id: 'live-filter',
          area: story.filterDump.area,
          budget: story.filterDump.budget,
          waviness: story.filterDump.waviness,
          groupBox: story.filterDump.groupBox,
          primitiveCount: story.filterDump.primitiveCount,
          primitives: story.filterDump.primitives,
        }),
      );
    }
  }

  const byId = Object.fromEntries(results.map((row) => [row.id, row]));
  const metricOf = (id) => byId[id]?.metrics ?? null;
  const live = stories.find((story) => story?.id === 'story-segmented-teal-after');
  const report = {
    measuredAt: new Date().toISOString(),
    kitVersion: '1.11.3',
    notes: {
      dpr: 2,
      fill: TEAL,
      paleExcessThreshold: 18,
      productionFilter:
        'feGaussianBlur(goo 6) + feColorMatrix(contrast 18) + feComposite(atop) + feTurbulence(fractalNoise 0.018 octaves=2 seed=7) + feDisplacementMap(scale=12) + feGaussianBlur(0.5)',
      productionTealIndicator:
        'GameSurfaces.tsx follow LiquidGroup: fill --game-ui-secondary, shadow --game-ui-shadow-button (outer drop + inset 0 2px 0 rgba(255,255,255,0.42)), no stroke. Offset-only inset is drawn from shape; BINARIZE is omitted when nothing consumes bin.',
    },
    round3: {
      shipped: true,
      insetFrom: 'shape',
      binarizeForOffsetOnlyInset: false,
      keepbinIdenticalToAa:
        JSON.stringify(metricOf('wavy-inset-aa')) ===
        JSON.stringify(metricOf('wavy-inset-aa-keepbin')),
      livePrimitives: live?.filterDump?.primitiveCount ?? null,
      liveArea: live?.filterDump?.area ?? null,
    },
    isolated: results,
    extra,
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
