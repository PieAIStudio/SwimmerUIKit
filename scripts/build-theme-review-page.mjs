/** Compile an offline S4 review page around retained pixels and real captures.
 * Supplemental S0 held states come from the saved, unmodified S0 Storybook. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { preview } from 'vite';
import { STYLE_NAMES } from './lib/control-style-contract.mjs';

const output = path.resolve(process.argv[2] ?? '.scratch/s4/review');
assert.ok(output.startsWith(`${process.cwd()}/.scratch/`), 'Review evidence stays local');
const current = JSON.parse(await readFile(path.join(output, 'receipt.json'), 'utf8'));
assert.equal(current.passed, true, 'Complete S4 capture and assertions before preparing review');
const baseline = JSON.parse(await readFile('.scratch/baseline/screenshots.json', 'utf8'));
const oldRoot = path.resolve('.scratch/baseline/storybook');
const oldOutput = path.join(output, 'baseline');
await mkdir(oldOutput, { recursive: true });
const server = await preview({
  configFile: false,
  build: { outDir: oldRoot },
  preview: { host: '127.0.0.1', port: 0 },
});
const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
const browser = await chromium.launch();
const oldShots = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  });
  for (const theme of ['light', 'dark']) {
    // Historical readback only. The current kit never interprets this value.
    const oldTheme = theme === 'dark' ? baseline.themes[1] : baseline.themes[0];
    for (const [kind, story] of [
      [
        'ordinary',
        baseline.captures.find((item) => item.id.endsWith('-controls-gamebutton--secondary')).id,
      ],
      [
        'cta',
        baseline.captures.find((item) => item.id.endsWith('-controls-gamebutton--liquid-cta')).id,
      ],
    ]) {
      await page.goto(
        `${origin}/iframe.html?id=${story}&viewMode=story&globals=theme:${oldTheme}`,
        { waitUntil: 'networkidle' },
      );
      await page.evaluate(() => document.fonts.ready);
      const button = page.locator('#storybook-root button').first();
      await button.waitFor();
      await page.waitForTimeout(700);
      const box = await button.boundingBox();
      const clip = {
        x: Math.max(0, Math.floor(box.x - 32)),
        y: Math.max(0, Math.floor(box.y - 32)),
        width: Math.ceil(box.width + 64),
        height: Math.ceil(box.height + 64),
      };
      const original = baseline.captures.find(
        (shot) => shot.id === story && shot.theme === oldTheme,
      );
      assert.ok(original, 'The old story must be part of S0, not an invented fixture');
      const sourcePixels = await readFile(path.join('.scratch/baseline', original.filename));
      assert.equal(
        createHash('sha256').update(sourcePixels).digest('hex'),
        original.sha256,
        'Never replace the original baseline',
      );
      // Crop the retained original at native pixel scale; no re-rendered rest
      // state is substituted for the Owner's baseline.
      const cropped = await page.evaluate(
        async ({ encoded, clip }) => {
          const image = new Image();
          image.src = `data:image/png;base64,${encoded}`;
          await image.decode();
          const canvas = document.createElement('canvas');
          canvas.width = clip.width;
          canvas.height = clip.height;
          const context = canvas.getContext('2d');
          context.imageSmoothingEnabled = false;
          context.drawImage(
            image,
            clip.x,
            clip.y,
            clip.width,
            clip.height,
            0,
            0,
            clip.width,
            clip.height,
          );
          return canvas.toDataURL('image/png').split(',')[1];
        },
        { encoded: sourcePixels.toString('base64'), clip },
      );
      await writeFile(
        path.join(oldOutput, `${theme}-${kind}-rest.png`),
        Buffer.from(cropped, 'base64'),
      );
      await button.hover();
      await page.mouse.down();
      await page.waitForTimeout(170);
      await page.screenshot({
        path: path.join(oldOutput, `${theme}-${kind}-pressed.png`),
        clip,
        animations: 'disabled',
      });
      await page.mouse.up();
      oldShots.push({
        theme,
        kind,
        story,
        original: original.filename,
        originalSha256: original.sha256,
        clip,
        rest: 'cropped original S0 pixels',
        pressed: 'supplemental capture from preserved S0 build',
      });
    }
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
await writeFile(
  path.join(oldOutput, 'receipt.json'),
  JSON.stringify({ sourceCommit: baseline.sourceCommit, shots: oldShots }, null, 2),
);
const names = {
  candy: '彩色',
  pastel: '淡彩',
  mist: '雾色',
  grey: '灰阶',
  outline: '包边',
  ink: '黑白包边',
};
const image = (src, alt, cls = '') =>
  `<a href="${src}" target="_blank"><img loading="lazy" class="${cls}" src="${src}" alt="${alt}"></a>`;
const cards = STYLE_NAMES.flatMap((style) =>
  ['light', 'dark'].map((theme) => {
    const id = `${style}-${theme}`,
      label = `${names[style]} · ${theme === 'light' ? '浅色' : '深色'}`;
    const shot = current.cases.find((item) => item.id === id);
    assert.ok(shot?.edge && shot?.guide, `Missing review evidence: ${id}`);
    const compare = (kind, title) =>
      `<h3>${title}</h3><div class="pair"><figure><figcaption>S0 · 原来</figcaption><div class="states"><div>${image(`baseline/${theme}-${kind}-rest.png`, 'S0 静止')}<small>静止：原始基线像素</small></div><div>${image(`baseline/${theme}-${kind}-pressed.png`, 'S0 按下')}<small>按下：原始构建补拍</small></div></div></figure><figure><figcaption>S4 · ${label}</figcaption><div class="states"><div>${image(`${id}-${kind}-rest.png`, 'S4 静止')}<small>静止</small></div><div>${image(`${id}-${kind}-pressed.png`, 'S4 按下')}<small>按住 170 毫秒</small></div></div></figure></div>`;
    const overview = baseline.captures.find(
      (item) =>
        item.id.endsWith('-account-accountcontrols--overview') &&
        item.theme === (theme === 'dark' ? baseline.themes[1] : baseline.themes[0]),
    );
    const oldLink = path.relative(output, path.resolve('.scratch/baseline', overview.filename));
    return `<section class="case" id="${id}" ${id === 'pastel-light' ? '' : 'hidden'}>
    <h2>${label} <code>${style} / ${theme}</code></h2>
    <p>同一原件、同一波幅；区别来自 token 配色。选中加对勾，文字和原生点击框保持不动。</p>
    <div class="pair overview"><figure><figcaption>S0 · 账号组件原始基线</figcaption>${image(oldLink, '原始账号组件')}</figure><figure><figcaption>S4 · 十二组合之一（真实构建）</figcaption>${image(`${id}-overview.png`, label)}</figure></div>
    ${compare('ordinary', '普通按钮：立体底边 → 平面水滴')}
    ${compare('cta', '主操作：旧液体 → 统一的潮汐液体')}
    <h3>长行边缘 · DPR 1 原图与 8 倍逐像素放大</h3>
    <p>原图截图时设备像素比是 1。放大未做平滑、锐化或修图；点图查看完整尺寸。正常的抗锯齿像素不等于液体硬阈值产生的轮廓台阶。</p>
    <figure>${image(`${id}-row.png`, '长行完整截图')}<figcaption>选中行：点击区两端对齐，形变只在背景 SVG。</figcaption></figure>
    <figure class="edge">${image(`${id}-edge-dpr1.png`, 'DPR1 边缘原图', 'native-edge')}<figcaption>12 像素高的原始边缘</figcaption>${image(`${id}-edge-8x.png`, '8倍无平滑放大的边缘', 'zoom-edge')}<figcaption>8×。SVG path + non-scaling-stroke；普通控件没有液体滤镜。</figcaption></figure>
    <h3>涟的引导 · 与 LiquidReveal 同一种材质</h3>
    <p>这张不是摆拍替身：真实点击打开引导，校验明暗与风格跨弹出层继承，点击「明白了」关闭。</p>
    <figure>${image(`${id}-guide.png`, `${label} 真实引导面板`)}</figure>
  </section>`;
  }),
).join('\n');
const nav = STYLE_NAMES.map(
  (style) =>
    `<div><strong>${names[style]} <small>${style}</small></strong>${['light', 'dark'].map((theme) => `<button data-case="${style}-${theme}" aria-pressed="${style === 'pastel' && theme === 'light'}">${theme === 'light' ? '浅色' : '深色'}</button>`).join('')}</div>`,
).join('');
const html = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Swimmer UIKit 3.0 · S4 提交前评审</title>
<style>
:root{font-family:system-ui,-apple-system,"PingFang SC",sans-serif;color:#223332;background:#f3f5f2;line-height:1.65}*{box-sizing:border-box}body{margin:0}header,main,footer{max-width:1360px;margin:auto;padding:28px 36px}header{padding-top:48px}h1{font-size:clamp(26px,4vw,42px);margin:8px 0}h2{font-size:26px}h3{margin:36px 0 12px}p{max-width:100ch}code,small{font-size:12px}code{background:#e5ece6;padding:4px 8px;border-radius:6px}.eyebrow{letter-spacing:.12em;font-size:12px;font-weight:750}.status{display:inline-block;padding:6px 12px;background:#fff0c7;color:#56450b;border-radius:6px;font-weight:650}.meta{font-size:13px;color:#53645d}nav{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin:24px 0}nav>div{display:flex;gap:6px;flex-wrap:wrap;padding:12px;background:white;border:1px solid #d5dfd8;border-radius:12px}nav strong{display:block;flex-basis:100%}nav strong small{font-weight:400}button{border:1px solid #a3b5aa;border-radius:8px;padding:6px 14px;background:white;color:inherit;cursor:pointer;font:inherit;font-size:13px}button[aria-pressed=true]{background:#203e35;color:white;border-color:#203e35}button:focus-visible,a:focus-visible{outline:3px solid #22795d;outline-offset:3px}.case[hidden]{display:none}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}figure{margin:0;background:white;border:1px solid #d5dfd8;border-radius:12px;overflow:hidden;padding:14px}figcaption{font-size:13px;color:#53645d;margin-bottom:12px}.states{display:grid;gap:18px}.states small{display:block}.states img{width:auto;max-width:100%}img{display:block;max-width:100%;height:auto}.overview img{width:100%}.edge{overflow-x:auto;margin:16px 0}.edge .zoom-edge{max-width:none;image-rendering:pixelated}.edge .native-edge{max-width:none}.case>figure img{max-height:1200px}.mobile img{width:100%;max-width:390px;margin:auto}.proof{padding:18px 24px;border-left:4px solid #22795d;background:#eaf1eb}.links{display:flex;flex-wrap:wrap;gap:18px}a{color:#215d48}footer{font-size:13px;border-top:1px solid #d5dfd8}@media(max-width:850px){header,main,footer{padding:20px}nav{grid-template-columns:repeat(3,minmax(0,1fr))}.pair{grid-template-columns:1fr}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}
</style><header><div class="eyebrow">SWIMMER UI KIT · 3.0 · S4</div><h1>从厚按钮，到二维水滴。</h1><span class="status">提交前评审 · 尚未提交或发布</span>
<p>六套风格全部保留，明暗独立。普通控件不发亮、不鼓起来；唯一的主操作保留潮汐液体。这里每张图都来自本机实际渲染，不是设计效果图。</p>
<p class="meta">S0：${baseline.sourceCommit.slice(0, 7)} · 原始截图保持不变。S4：${current.sourceCommit.slice(0, 7)} 之后的未提交工作区。浏览器 ${current.browserName} ${current.browser}，DPR 1。</p>
<div class="proof"><strong>请交 Claude 评审。</strong> 先检查轮廓、静止与按下、十二种组合的层次，再检查边缘放大图和涟的引导。此页的自动检查结果不是审美批准。</div><nav aria-label="六套风格和明暗">${nav}</nav></header>
<main>${cards}<h2>窄屏补充</h2><div class="pair mobile"><figure>${image('mobile-375.png', '375像素窄屏')}<figcaption>375 px · 无横向页面溢出</figcaption></figure><figure>${image('mobile-390.png', '390像素窄屏')}<figcaption>390 px · 无横向页面溢出</figcaption></figure></div>
<h2>证据与边界</h2><p>每套风格实际检查了普通控件的投影、渐变、滤镜与点击框；测试了鼠标按下和松开、引导面板打开和关闭。对比度与键盘、表单、减少动态等完整检查记录见相邻证据文件。传感器、真实手机硬件和下游产品接入不属于此页验收。</p>
<div class="links"><a href="receipt.json">S4 截图与交互记录</a><a href="baseline/receipt.json">S0 像素来源</a><a href="../../baseline/index.html">原始 288 张基线图集</a><a href="../style-contrast-chromium.json">十二组合对比度</a><a href="../../../docs/reference/migration-3.0.md">迁移表</a></div></main>
<footer>本轮停在 S4 提交前。Claude 意见由 Owner 转回后再修改、提交，之后才进入文档治理和发布候选阶段。</footer>
<script>const cases=[...document.querySelectorAll('.case')],buttons=[...document.querySelectorAll('[data-case]')];function select(id){if(!cases.some(n=>n.id===id))return;cases.forEach(n=>n.hidden=n.id!==id);buttons.forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.case===id)));history.replaceState(null,'','#'+id)}buttons.forEach(n=>n.addEventListener('click',()=>select(n.dataset.case)));select(location.hash.slice(1)||'pastel-light');</script></html>`;
await writeFile(path.join(output, 'index.html'), html);
console.log(`S4 offline review page: ${path.join(output, 'index.html')}`);
