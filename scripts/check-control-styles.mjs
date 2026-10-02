/** Real computed paint from the actual minified distribution stylesheet.
 * This checks CSS formulas after hue, style, mode and selection are resolved. */
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { bundle } from 'lightningcss';
import { chromium, firefox, webkit } from 'playwright';
import {
  inspectControlStyleBlocks,
  STYLE_NAMES,
  HUES,
  contrastRatio,
} from './lib/control-style-contract.mjs';

inspectControlStyleBlocks(readFileSync('src/tokens/control-styles.css', 'utf8'));
const { code, warnings } = bundle({ filename: 'src/styles.css', minify: true });
assert.equal(warnings.length, 0, 'Token styles must compile without CSS warnings');
const browserName = process.argv[2] ?? 'chromium';
assert.ok(['chromium', 'firefox', 'webkit'].includes(browserName), 'Choose a supported browser');
const browser = await { chromium, firefox, webkit }[browserName].launch();
const results = [];
try {
  const page = await browser.newPage({
    viewport: { width: 900, height: 700 },
    deviceScaleFactor: 1,
  });
  await page.setContent(`<style>${code}</style><div id="fixture"></div>`);
  for (const theme of ['light', 'dark'])
    for (const style of STYLE_NAMES)
      for (const hue of HUES)
        for (const state of ['rest', 'on', 'meaning', 'disabled', 'danger']) {
          const sample = await page.evaluate(
            ({ theme, style, hue, state }) => {
              const fixture = document.querySelector('#fixture');
              fixture.innerHTML = `<div data-game-ui-theme="${theme}"><div data-game-ui-style="${style}"><button data-game-ui-paint ${state === 'on' ? 'aria-pressed="true"' : ''} ${state === 'meaning' ? 'data-game-ui-meaning="true"' : ''} ${state === 'disabled' ? 'disabled' : ''} ${state === 'danger' ? 'data-game-ui-danger="true"' : ''} style="--hue:var(--game-ui-hue-${hue})">Sample</button></div></div>`;
              const control = fixture.querySelector('button'),
                css = getComputedStyle(control);
              const canvas = document.createElement('canvas');
              canvas.width = 1;
              canvas.height = 1;
              const context = canvas.getContext('2d');
              const rgba = (value) => {
                context.clearRect(0, 0, 1, 1);
                context.fillStyle = value;
                context.fillRect(0, 0, 1, 1);
                return [...context.getImageData(0, 0, 1, 1).data];
              };
              return {
                foreground: rgba(css.color),
                background: rgba(css.backgroundColor),
                fill: css.backgroundColor,
                color: css.color,
                scheme: css.colorScheme,
              };
            },
            { theme, style, hue, state },
          );
          assert.equal(
            sample.background[3],
            255,
            `${style}/${theme}/${hue}/${state}: background must be opaque, not an undefined formula`,
          );
          assert.equal(
            sample.foreground[3],
            255,
            `${style}/${theme}/${hue}/${state}: text must be opaque`,
          );
          const ratio = contrastRatio(sample.foreground, sample.background);
          results.push({ theme, style, hue, state, ...sample, ratio });
        }
  const failures = results.filter((result) => result.ratio < 4.5);
  mkdirSync('.scratch/s4', { recursive: true });
  writeFileSync(
    `.scratch/s4/style-contrast-${browserName}.json`,
    JSON.stringify({ browser: browser.version(), samples: results, failures }, null, 2),
  );
  assert.deepEqual(
    failures,
    [],
    'Every enabled/disabled normal/selected/meaning text pair must pass 4.5:1',
  );
  // The same probe can flip axes in either nesting order without changing
  // the meaning of a selected hue. Mode is not baked into inherited formulas.
  for (const theme of ['light', 'dark'])
    for (const style of STYLE_NAMES) {
      const nesting = await page.evaluate(
        ({ theme, style }) => {
          const fixture = document.querySelector('#fixture');
          fixture.innerHTML = `<div data-game-ui-style="ink" data-game-ui-theme="${theme === 'dark' ? 'light' : 'dark'}"><div data-game-ui-style="${style}"><div data-game-ui-theme="${theme}"><button data-game-ui-paint aria-pressed="true" style="--hue:var(--game-ui-hue-sky)">Nested</button></div></div></div>`;
          const css = getComputedStyle(fixture.querySelector('button'));
          return { fill: css.backgroundColor, color: css.color };
        },
        { theme, style },
      );
      const before = results.find(
        (row) =>
          row.theme === theme && row.style === style && row.hue === 'sky' && row.state === 'on',
      );
      assert.equal(
        nesting.fill,
        before.fill,
        `${style}/${theme}: nested style/theme must have the same fill`,
      );
      assert.equal(
        nesting.color,
        before.color,
        `${style}/${theme}: nested style/theme must have the same text`,
      );
    }
  const additional = await page.evaluate(() => {
    const fixture = document.querySelector('#fixture');
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext('2d');
    const rgb = (value) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data];
    };
    const result = [];
    for (const theme of ['light', 'dark']) {
      fixture.innerHTML = `<div data-game-ui-theme="${theme}"><button data-game-ui-paint>Default</button></div>`;
      const button = fixture.querySelector('button');
      const implicit = {
        fill: getComputedStyle(button).backgroundColor,
        color: getComputedStyle(button).color,
      };
      button.parentElement.setAttribute('data-game-ui-style', 'pastel');
      const explicit = {
        fill: getComputedStyle(button).backgroundColor,
        color: getComputedStyle(button).color,
      };
      result.push({ id: `${theme}/default-pastel`, implicit, explicit });
      for (const style of ['candy', 'pastel', 'mist', 'grey', 'outline', 'ink']) {
        button.parentElement.setAttribute('data-game-ui-style', style);
        button.setAttribute('data-game-ui-danger', 'true');
        button.style.cssText = '--hue:var(--game-ui-hue-sky)';
        result.push({
          id: `${theme}/${style}/danger`,
          foreground: rgb(getComputedStyle(button).color),
          background: rgb(getComputedStyle(button).backgroundColor),
        });
        button.removeAttribute('data-game-ui-danger');
        for (let step = 0; step <= 20; step++) {
          // The unlit tide ramp is a conservative check: white sheen only
          // raises contrast for its fixed dark ink. Check the darkened bottom
          // as well, matching LiquidFill's 5% black finishing stop.
          const background =
            step === 20
              ? 'color-mix(in srgb, var(--game-ui-cta-to), black 5%)'
              : `color-mix(in srgb, var(--game-ui-cta-from) ${100 - step * 5}%, var(--game-ui-cta-to))`;
          button.style.cssText = `background:${background};color:var(--game-ui-cta-text)`;
          result.push({
            id: `${theme}/${style}/cta-${step}`,
            foreground: rgb(getComputedStyle(button).color),
            background: rgb(getComputedStyle(button).backgroundColor),
          });
        }
        button.style.cssText = '';
      }
    }
    return result;
  });
  for (const sample of additional) {
    if (sample.implicit) assert.deepEqual(sample.implicit, sample.explicit, sample.id);
    else {
      assert.equal(sample.background[3], 255, sample.id);
      assert.ok(
        contrastRatio(sample.foreground, sample.background) >= 4.5,
        `${sample.id} must pass AA`,
      );
    }
  }
  writeFileSync(
    `.scratch/s4/style-additional-${browserName}.json`,
    JSON.stringify(additional, null, 2),
  );
  console.log(
    `Style contract PASS (${browserName}): twelve complete blocks; ${results.length} compiled paint pairs >= 4.5:1; nested axes, omitted default, danger and 21-step tide ramps pass; minimum ${Math.min(...results.map((result) => result.ratio)).toFixed(3)}:1`,
  );
} finally {
  await browser.close();
}
