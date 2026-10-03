import assert from 'node:assert/strict';
import { spawnSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import {
  cpSync,
  appendFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const tarball = path.resolve(process.argv[2] ?? '');
const evidence = path.resolve(
  process.argv[3] ?? '.devspace-reports/uikit-3-completion/S13/next-consumer',
);
assert.ok(tarball.endsWith('.tgz') && existsSync(tarball), 'Pass the actual candidate tarball');
mkdirSync(evidence, { recursive: true });
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const sha256 = createHash('sha256').update(readFileSync(tarball)).digest('hex');
const fixture = mkdtempSync(path.join(os.tmpdir(), 'swimmer-uikit-next-'));
const write = (file, content) => {
  const target = path.join(fixture, file);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, content);
};
write(
  'package.json',
  JSON.stringify(
    {
      name: 'swimmer-uikit-next-consumer',
      private: true,
      scripts: { build: 'next build --webpack' },
      dependencies: {
        '@pieai/swimmer-ui-kit': 'file:./candidate.tgz',
        next: '16.3.8',
        react: pkg.devDependencies.react,
        'react-dom': pkg.devDependencies['react-dom'],
      },
      devDependencies: Object.fromEntries(
        ['typescript', '@types/react', '@types/react-dom', '@types/node'].map((name) => [
          name,
          pkg.devDependencies[name],
        ]),
      ),
    },
    null,
    2,
  ),
);
write('next.config.mjs', 'export default { experimental: { cpus: 1 } };\n');
write(
  'app/layout.tsx',
  `import type { ReactNode } from 'react';
import '@pieai/swimmer-ui-kit/styles.css';
import '@pieai/swimmer-ui-kit/liquid-presence.css';
export default function Layout({children}:{children:ReactNode}) {
  return <html lang="en"><head><link rel="icon" href="data:," /></head>
    <body><div style={{padding:24}}>{children}</div></body></html>;
}
`,
);
write(
  'app/page.tsx',
  'import { GameButton, GameBadge } from "@pieai/swimmer-ui-kit";\nimport { LiquidPopover } from "@pieai/swimmer-ui-kit/liquid-presence";\nimport Host from "./host";\nexport default function Page(){return <main><h1>UIKit 3 Next consumer</h1><GameBadge>Server import</GameBadge><GameButton href="/read">Read</GameButton><Host Popover={LiquidPopover}/></main>;}\n',
);
write(
  'app/host.tsx',
  `'use client';
import {useRef,useState,type ComponentType} from 'react';
import Link from 'next/link';
import {GameButton} from '@pieai/swimmer-ui-kit';
import {LiquidPopover as DirectPopover,type LiquidPopoverProps} from '@pieai/swimmer-ui-kit/liquid-presence';
function Example({Popover,title}:{Popover:ComponentType<LiquidPopoverProps>;title:string}) {
  const source=useRef<HTMLButtonElement>(null),[open,setOpen]=useState(false);
  return <section style={{marginTop:32}}>
    <GameButton ref={source} size="sm" onClick={()=>setOpen(true)}>Open {title}</GameButton>
    <Popover open={open} onOpenChange={setOpen} source={source} title={title}>
      <p>Actual packed liquid component</p>
      <GameButton onClick={()=>setOpen(false)}>Done</GameButton>
    </Popover>
  </section>;
}
export default function Host({Popover}:{Popover:ComponentType<LiquidPopoverProps>}) {
  return <><Example Popover={Popover} title="Server popover" />
    <Example Popover={DirectPopover} title="Client popover" />
    <GameButton href="/read" linkComponent={Link}>Read through Next Link</GameButton></>;
}
`,
);
write(
  'app/read/page.tsx',
  'import {GameBadge} from "@pieai/swimmer-ui-kit";\nexport default function Read(){return <main><h1>Read</h1><GameBadge tone="success">Ready</GameBadge></main>;}\n',
);
cpSync(tarball, path.join(fixture, 'candidate.tgz'));
const env = { ...process.env, CI: '1', NEXT_TELEMETRY_DISABLED: '1' };
const receipt = {
  passed: false,
  version: pkg.version,
  tarball,
  sha256,
  fixture,
  checkedAt: new Date().toISOString(),
};
const saveReceipt = (details) =>
  writeFileSync(
    path.join(evidence, 'receipt.json'),
    JSON.stringify({ ...receipt, ...details }, null, 2) + '\n',
  );
saveReceipt({ status: 'checking' });
const run = (name, args) => {
  const result = spawnSync('npm', args, {
    cwd: fixture,
    env,
    encoding: 'utf8',
    timeout: 300000,
    maxBuffer: 16 * 1024 * 1024,
  });
  writeFileSync(
    path.join(evidence, name + '.log'),
    `${result.stdout ?? ''}\n${result.stderr ?? ''}`,
  );
  assert.equal(
    result.status,
    0,
    `${name} failed; inspect ${name}.log (${result.error?.message ?? result.signal ?? result.status})`,
  );
};
try {
  run('install', [
    'install',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    '--registry=https://registry.npmjs.org',
  ]);
  const installed = JSON.parse(
    readFileSync(path.join(fixture, 'node_modules/@pieai/swimmer-ui-kit/package.json'), 'utf8'),
  );
  assert.equal(installed.version, pkg.version);
  cpSync(path.join(fixture, 'package-lock.json'), path.join(evidence, 'package-lock.json'));
  cpSync(path.join(fixture, 'package.json'), path.join(evidence, 'fixture-package.json'));
  cpSync(path.join(fixture, 'app'), path.join(evidence, 'fixture-app'), { recursive: true });
  run('build', ['run', 'build']);
  const probe = createServer();
  probe.listen(0, '127.0.0.1');
  await once(probe, 'listening');
  const port = probe.address().port;
  await new Promise((resolve, reject) =>
    probe.close((error) => (error ? reject(error) : resolve())),
  );
  const origin = `http://127.0.0.1:${port}`;
  const serverLog = path.join(evidence, 'server.log');
  writeFileSync(serverLog, '');
  const server = spawn(
    process.execPath,
    ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', String(port)],
    { cwd: fixture, env, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  let startError;
  server.on('error', (error) => {
    startError = error;
  });
  server.stdout.on('data', (data) => appendFileSync(serverLog, data));
  server.stderr.on('data', (data) => appendFileSync(serverLog, data));
  try {
    let ready = false;
    for (let i = 0; i < 80; i++) {
      assert.ok(!startError && server.exitCode === null, 'Next start exited; inspect server.log');
      try {
        ready = (await fetch(origin, { signal: AbortSignal.timeout(1000) })).ok;
      } catch {}
      if (ready) break;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    assert.ok(ready, 'Next start did not become ready');
    const html = await (await fetch(origin)).text();
    assert.match(html, /UIKit 3 Next consumer/);
    assert.match(html, /Server import/);
    assert.match(html, /href="\/read"/);
    writeFileSync(path.join(evidence, 'server-render.html'), html);
    const browser = await chromium.launch({ headless: true });
    const errors = [];
    try {
      const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      page.on('response', (response) => {
        if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
      });
      await page.goto(origin, { waitUntil: 'networkidle' });
      assert.equal(
        await page
          .locator('.game-ui-badge')
          .evaluate((node) => node.getBoundingClientRect().height),
        24,
      );
      for (const title of ['Server popover', 'Client popover']) {
        const trigger = page.getByRole('button', { name: `Open ${title}`, exact: true });
        assert.equal(await trigger.evaluate((node) => node.getBoundingClientRect().height), 32);
        await trigger.click();
        await page.getByRole('dialog', { name: title }).waitFor({ state: 'visible' });
        await page.waitForFunction((text) => document.activeElement?.textContent === text, title);
        await page.screenshot({
          path: path.join(
            evidence,
            `${title.startsWith('Server') ? 'server' : 'client'}-popover.png`,
          ),
        });
        await page.keyboard.press('Escape');
        await page.getByRole('dialog', { name: title }).waitFor({ state: 'hidden' });
        await page.waitForFunction(
          (text) => document.activeElement?.textContent === text,
          `Open ${title}`,
        );
      }
      await page.getByRole('link', { name: 'Read through Next Link' }).click();
      await page.getByRole('heading', { name: 'Read', exact: true }).waitFor();
      assert.equal(new URL(page.url()).pathname, '/read');
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(origin, { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Open Client popover', exact: true }).click();
      const panel = page.getByRole('dialog', { name: 'Client popover' });
      await panel.waitFor({ state: 'visible' });
      await page.waitForFunction(
        () =>
          document
            .querySelector('[data-popover-placement]')
            ?.getAttribute('data-popover-placement') === 'top',
      );
      assert.ok((await panel.boundingBox()).width <= 366.5);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: path.join(evidence, 'narrow-reduced.png') });
      await page.getByRole('button', { name: 'Done', exact: true }).click();
      await panel.waitFor({ state: 'hidden' });
      assert.deepEqual(errors, [], 'Browser console/network/hydration must remain clean');
    } finally {
      await browser.close();
    }
    assert.doesNotMatch(
      readFileSync(serverLog, 'utf8'),
      /Error:|Invalid hook call|Hydration failed/,
    );
    saveReceipt({
      passed: true,
      status: 'passed',
      nextVersion: '16.3.8',
      reactVersion: pkg.devDependencies.react,
      directServerImports: ['GameButton', 'GameBadge', 'LiquidPopover'],
      clientLiquidImport: true,
      hydratedInteractions: true,
      nextLinkNavigation: true,
      css: true,
      narrowReducedMotion: true,
      errors,
    });
    console.log(`Next consumer PASS: ${pkg.version}, SHA-256 ${sha256}`);
  } finally {
    if (server.exitCode === null) {
      const exited = once(server, 'exit');
      server.kill('SIGTERM');
      const timer = setTimeout(() => server.kill('SIGKILL'), 5000);
      try {
        await exited;
      } finally {
        clearTimeout(timer);
      }
    }
  }
} catch (error) {
  saveReceipt({ status: 'failed', error: String(error) });
  throw error;
} finally {
  if (process.env.KEEP_NEXT_FIXTURE !== '1') rmSync(fixture, { recursive: true, force: true });
}
