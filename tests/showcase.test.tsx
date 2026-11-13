import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DemoPanel } from '../src/showcase/DemoPanel';
import { FlowStrip } from '../src/showcase/FlowStrip';
import { KitCard } from '../src/showcase/KitCard';
import { ShowcaseShell } from '../src/showcase/ShowcaseShell';
import { StatusList } from '../src/showcase/StatusList';
import type { KitManifest } from '../src/showcase/types';

const kit: KitManifest = {
  name: 'FixtureKit',
  tagline: { en: 'Fixture', zh: '样例' },
  consumers: { en: 'Teams', zh: '团队' },
  type: 'visual',
  version: '1.0.0',
  status: { label: { en: 'State', zh: '状态' }, value: 'Ready', tone: 'success' },
  lastRelease: '2026-11-13',
  what: { en: 'One line', zh: '一句话' },
  updates: [{ date: '2026-11-13', text: { en: 'New', zh: '新' } }],
  code: ['one', 'two', 'three'],
};

describe('showcase parts', () => {
  it('renders the five-block shell and localized rail', () => {
    const html = renderToStaticMarkup(
      <ShowcaseShell
        kit={kit}
        language="zh"
        demo={
          <DemoPanel label="输入" runLabel="运行" resultLabel="结果">
            <FlowStrip steps={[{ label: 'A' }, { label: 'B' }, { label: 'C' }]} />
          </DemoPanel>
        }
      />,
    );
    expect(html).toContain('FixtureKit');
    expect(html).toContain('如何接入');
    expect(html).toContain('更新');
    expect(html).toContain('game-ui-showcase-flow');
  });
  it('keeps cards and status independently reusable', () => {
    expect(renderToStaticMarkup(<KitCard kit={kit} />)).toContain('FixtureKit');
    expect(renderToStaticMarkup(<StatusList kit={kit} />)).toContain('Ready');
  });
});
