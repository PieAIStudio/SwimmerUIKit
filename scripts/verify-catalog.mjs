/** Browser acceptance for the deployed catalog; no consumers or global budgets are modified. */
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium, firefox, webkit } from 'playwright';

const origin = process.argv[2] ?? 'http://127.0.0.1:5176';
const browserName = process.argv[3] ?? 'chromium';
const browserType = { chromium, firefox, webkit }[browserName];
assert.ok(browserType, 'Browser must be chromium, firefox or webkit');
const output = `.devspace-visual/liquid-catalog-${browserName}-${new Date().toISOString().replaceAll(':', '-')}`;
mkdirSync(output, { recursive: true });
const browser = await browserType.launch();
const results = [];
try {
  for (const [name, width, theme, extras] of [
    ['desktop', 1280, 'light', {}],
    [
      'mobile-night',
      375,
      'night',
      {
        ...(browserName === 'firefox' ? {} : { isMobile: true }),
        hasTouch: true,
        deviceScaleFactor: 2,
      },
    ],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height: width < 760 ? 812 : 720 },
      ...extras,
    });
    const page = await context.newPage();
    const errors = [],
      budgetWarnings = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (/budget is insufficient/.test(message.text())) budgetWarnings.push(message.text());
    });
    await page.goto(`${origin}/?theme=${theme}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const initialAction = await page
      .locator('.kit-catalog-stage')
      .getByRole('button')
      .first()
      .boundingBox();
    assert.ok(
      initialAction &&
        initialAction.y >= 0 &&
        initialAction.y + initialAction.height <= page.viewportSize().height,
      `${name}: the first example must be visible without scrolling (${JSON.stringify(initialAction)})`,
    );
    await page.screenshot({ path: `${output}/${name}-first-view.png` });
    results.push({ name, firstExampleVisible: true, initialAction });
    for (const recipe of [
      'button',
      'icon',
      'toggle',
      'segmented',
      'progress',
      'select',
      'input',
      'textarea',
      'checkbox',
      'slider',
      'feedback',
      'modal',
    ]) {
      await page.goto(`${origin}/?component=${recipe}&material=glossy&theme=${theme}`, {
        waitUntil: 'networkidle',
      });
      const stage = page.locator('.kit-catalog-stage');
      await stage.waitFor();
      await page.evaluate(() => document.fonts.ready);
      if (recipe === 'button') {
        const control = stage.getByRole('button');
        await control.focus();
        await page.keyboard.press('Space');
        await page.keyboard.press('Enter');
        assert.match(await stage.innerText(), /已触发 2 次/);
        const surface = stage.locator('.game-ui-liquid-surface');
        await control.hover();
        const before = await control.boundingBox();
        await page.mouse.down();
        assert.equal(await surface.getAttribute('data-liquid-active'), 'true');
        // Check after the former native CSS press transition, not just t=0.
        await page.waitForTimeout(250);
        const down = await control.boundingBox();
        assert.equal(before.width, down.width);
        assert.equal(before.height, down.height);
        await page.mouse.up();
        await page.locator('.kit-catalog-controls select').first().selectOption('matte');
        assert.equal(await stage.locator('feSpecularLighting').count(), 0);
        await page.locator('.kit-catalog-controls select').first().selectOption('glossy');
        assert.equal(await stage.locator('feSpecularLighting').count(), 1);
        await page.getByLabel('并排比较两种液体').check();
        assert.equal(await stage.locator('[data-liquid-gooey-silhouette]').count(), 2);
        assert.equal(await stage.locator('feSpecularLighting').count(), 1);
      } else if (recipe === 'icon') {
        await stage.getByRole('button', { name: '收藏这个示例' }).click();
        assert.match(await stage.innerText(), /已收藏 1 次/);
      } else if (recipe === 'toggle') {
        const control = stage.getByRole('switch');
        await control.focus();
        await page.keyboard.press('Space');
        assert.equal(await control.getAttribute('aria-checked'), 'true');
        await page.waitForFunction(() => {
          const track = document.querySelector('.kit-catalog-stage .game-ui-toggle-liquid-track');
          const thumb = document.querySelector('.kit-catalog-stage .game-ui-toggle-liquid-thumb');
          return (
            track &&
            thumb &&
            Math.abs(thumb.getBoundingClientRect().left - track.getBoundingClientRect().left - 26) <
              1
          );
        });
      } else if (recipe === 'segmented') {
        const control = stage.getByRole('button', { name: '练习', exact: true });
        await control.click();
        assert.equal(await control.getAttribute('aria-pressed'), 'true');
      } else if (recipe === 'progress' || recipe === 'slider') {
        const range = stage.getByRole('slider');
        await range.focus();
        await page.keyboard.press('ArrowRight');
        assert.equal(await range.inputValue(), '45');
        if (recipe === 'progress')
          assert.equal(await stage.getByRole('progressbar').getAttribute('aria-valuenow'), '45');
      } else if (recipe === 'select') {
        const select = stage.locator('select');
        await select.selectOption('code');
        await stage.getByRole('button', { name: '提交选择' }).click();
        assert.match(await stage.innerText(), /已提交：code/);
        await stage.getByRole('button', { name: '重置' }).click();
        assert.equal(await select.inputValue(), '');
        await select.focus();
        assert.equal(await select.evaluate((element) => element === document.activeElement), true);
        // The earlier Down/Enter popup assumption failed in Mac headless.
        // Use Playwright's documented select API for the value/change contract,
        // and retain the unverified OS-popup boundary in the evidence record.
        await select.selectOption({ label: '思考与表达' });
        assert.equal(await select.inputValue(), 'thinking');
        const originalSelect = await select.elementHandle();
        await page.locator('.kit-catalog-controls select').nth(1).selectOption('disabled');
        assert.equal(await select.isDisabled(), true);
        assert.equal(await originalSelect.evaluate((element) => element.isConnected), true);
        await page.locator('.kit-catalog-controls select').nth(1).selectOption('ready');
        for (const material of ['matte', 'flat', 'glossy']) {
          await page.locator('.kit-catalog-controls select').first().selectOption(material);
          assert.equal(await originalSelect.evaluate((element) => element.isConnected), true);
          assert.equal(await select.inputValue(), 'thinking');
        }
        await originalSelect.dispose();
        results.push({
          name,
          nativeSelectValueChangeAndReset: true,
          selectionAndNativeNodeSurviveReconfiguration: true,
          nativePopupKeyboard: 'not established in Mac headless; previous Down/Enter check failed',
        });
      } else if (recipe === 'input' || recipe === 'textarea') {
        const field = stage.locator(recipe === 'input' ? 'input' : 'textarea');
        await field.fill(recipe === 'input' ? 'demo@example.com' : '我现在可以输入中文笔记。');
        assert.notEqual(await field.inputValue(), '');
      } else if (recipe === 'checkbox') {
        // This control intentionally hides the native square behind its label.
        // Use the human-visible label, then independently exercise keyboard.
        await stage.getByText('保存我的阅读位置', { exact: true }).click();
        assert.equal(await stage.getByRole('checkbox').isChecked(), true);
        await stage.getByRole('checkbox').focus();
        await page.keyboard.press('Space');
        assert.equal(await stage.getByRole('checkbox').isChecked(), false);
      } else if (recipe === 'modal') {
        const trigger = stage.getByRole('button', { name: '打开对话框' });
        // macOS WebKit does not focus a button on pointer click. Exercise that
        // opening path, then test return-focus against a keyboard-focused opener
        // rather than assuming every browser changes focus on mouse activation.
        await trigger.click();
        await page.getByRole('dialog').waitFor();
        await page.keyboard.press('Escape');
        assert.equal(await page.getByRole('dialog').count(), 0);
        await trigger.focus();
        await page.keyboard.press('Enter');
        await page.getByRole('dialog').waitFor();
        await page.keyboard.press('Escape');
        assert.equal(await page.getByRole('dialog').count(), 0);
        assert.equal(await trigger.evaluate((element) => element === document.activeElement), true);
      }
      await page.mouse.move(0, 0);
      await stage.scrollIntoViewIfNeeded();
      const layout = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      assert.ok(
        layout.scroll <= layout.viewport + 1,
        `${name}/${recipe} overflow: ${JSON.stringify(layout)}`,
      );
      await page.screenshot({ path: `${output}/${name}-${recipe}.png` });
      results.push({
        name,
        recipe,
        layout,
        groups: await stage.locator('[data-liquid-gooey-silhouette]').count(),
        interaction: true,
      });
      if (['button', 'icon', 'toggle', 'segmented', 'select'].includes(recipe)) {
        await page.locator('.kit-catalog-controls select').nth(1).selectOption('disabled');
        assert.equal(await stage.locator('[data-liquid-gooey-silhouette]').count(), 0);
        assert.ok((await stage.locator(':disabled').count()) > 0);
      }
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(budgetWarnings, []);
    await page.goto(`${origin}/?component=select&material=matte&state=invalid&theme=${theme}`, {
      waitUntil: 'networkidle',
    });
    assert.equal(
      await page.locator('.kit-catalog-stage select').getAttribute('aria-invalid'),
      'true',
    );
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('.kit-catalog-controls select').first().inputValue(), 'matte');
    await page.locator('.kit-catalog-search input').fill('不存在的组件');
    assert.match(await page.locator('.kit-catalog-sidebar').innerText(), /没有匹配/);
    await page.locator('.kit-catalog-search input').fill('');
    assert.equal(await page.locator('.kit-catalog-sidebar nav button').count(), 12);
    if (browserName === 'chromium') {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await page.getByRole('button', { name: '复制代码', exact: true }).click();
      assert.equal(
        await page.evaluate(() => navigator.clipboard.readText()),
        await page.locator('.kit-catalog-code pre').innerText(),
      );
      results.push({ name, systemClipboardRoundtrip: true });
    }
    // Regardless of browser clipboard permissions, a denied write must leave
    // the complete source available rather than pretending the copy succeeded.
    await page.evaluate(() =>
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: () => Promise.reject(new DOMException('Denied', 'NotAllowedError')) },
      }),
    );
    await page.getByRole('button', { name: '复制代码', exact: true }).click();
    await page.getByText('浏览器不允许自动复制。', { exact: false }).waitFor();
    assert.ok(
      (await page.locator('.kit-catalog-code pre').innerText()).includes('export function Example'),
    );
    results.push({ name, clipboardDeniedFallback: true });
    await page.goto(`${origin}/?component=button&material=matte&theme=${theme}`, {
      waitUntil: 'networkidle',
    });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    const zoomLayout = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    assert.ok(zoomLayout.scroll <= zoomLayout.viewport + 1, `${name}: 200% text overflow`);
    results.push({ name, text200Percent: true, zoomLayout });
    assert.deepEqual(errors, []);
    assert.deepEqual(budgetWarnings, []);
    await context.close();
  }
  for (const mode of browserName === 'webkit' ? ['reduced'] : ['reduced', 'forced']) {
    const page = await browser.newPage({
      viewport: { width: 375, height: 812 },
      ...(mode === 'reduced' ? { reducedMotion: 'reduce' } : { forcedColors: 'active' }),
    });
    await page.goto(`${origin}/?component=button&material=glossy`, { waitUntil: 'networkidle' });
    const button = page.locator('.kit-catalog-stage').getByRole('button');
    await button.focus();
    await page.keyboard.down('Space');
    if (mode === 'reduced')
      assert.equal(
        await page
          .locator('.kit-catalog-stage .game-ui-liquid-surface')
          .getAttribute('data-liquid-active'),
        'false',
      );
    await page.keyboard.up('Space');
    assert.match(await page.locator('.kit-catalog-stage').innerText(), /已触发 1 次/);
    await page.screenshot({ path: `${output}/${mode}.png` });
    results.push({ mode, nativeAction: true });
    if (mode === 'forced') {
      await page.goto(`${origin}/?component=toggle&material=glossy`, { waitUntil: 'networkidle' });
      const toggle = page.locator('.kit-catalog-stage').getByRole('switch');
      const track = page.locator('.kit-catalog-stage .game-ui-toggle-liquid-track');
      const off = await track.evaluate((element) => getComputedStyle(element, '::after').left);
      await toggle.click();
      const on = await track.evaluate((element) => getComputedStyle(element, '::after').left);
      assert.notEqual(off, on);
      assert.equal(await toggle.getAttribute('aria-checked'), 'true');
      await page.screenshot({ path: `${output}/forced-switch.png` });
      results.push({ forcedSwitchPosition: true, off, on });
    }
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const warnings = [];
  page.on('console', (message) => {
    if (/budget is insufficient/.test(message.text())) warnings.push(message.text());
  });
  await page.goto(`${origin}/liquid.html`, { waitUntil: 'networkidle' });
  assert.ok((await page.locator('[data-liquid-gooey-silhouette]').count()) <= 2);
  await page.locator('select').selectOption('matte');
  assert.equal(await page.locator('feSpecularLighting').count(), 0);
  for (const kind of ['单体形态', '多体形态']) {
    const group = page.getByRole('group', { name: kind, exact: true });
    for (const button of await group.getByRole('button').all()) {
      await button.click();
      assert.ok((await page.locator('[data-liquid-gooey-silhouette]').count()) <= 2);
    }
  }
  for (const button of await page
    .getByRole('group', { name: '材料实验类别' })
    .getByRole('button')
    .all()) {
    await button.click();
    assert.ok((await page.locator('[data-liquid-gooey-silhouette]').count()) <= 2);
  }
  assert.deepEqual(warnings, []);
  results.push({ materialExplorer: true, maxGroups: 2 });
  await page.goto(`${origin}/?view=reference`, { waitUntil: 'networkidle' });
  assert.ok(await page.locator('#game-ui-preview-start-title').count());
  results.push({ legacyReference: true });
  await page.close();
} finally {
  writeFileSync(`${output}/results.json`, JSON.stringify(results, null, 2) + '\n');
  await browser.close();
}
console.log(
  JSON.stringify(
    {
      verifiedScenarios: results.filter(
        (item) =>
          item.interaction ||
          item.firstExampleVisible ||
          item.nativeAction ||
          item.forcedSwitchPosition ||
          item.materialExplorer ||
          item.legacyReference,
      ).length,
      records: results.length,
      output,
      results,
    },
    null,
    2,
  ),
);
