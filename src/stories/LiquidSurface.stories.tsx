import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import {
  GameButton,
  LIQUID_FORMS,
  LiquidGroup,
  LiquidSurface,
  liquidFormGroup,
  liquidFormItem,
  type LiquidForm,
} from '../index';

const meta = {
  title: 'Clay/Liquid/LiquidSurface',
  component: LiquidSurface,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '液体形态。引擎本身只有 blur / contrast 这些物理旋钮,没有「长什么样」;`form` 就是补上的那一层——每个名字是一组实测过的参数。不规则的外形来自 `blob`——路径数据本身向外涌出,不是滤镜位移:Chrome 对 feDisplacementMap 用最近邻采样,轮廓只能落在整像素上,高频是逐像素的毛刺,低频则是整条边突然错开一格。',
      },
    },
  },
} satisfies Meta<typeof LiquidSurface>;

export default meta;
type Story = StoryObj<typeof meta>;

function FormDemo({ form }: { form: LiquidForm }) {
  const [active, setActive] = useState(false);
  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
      <LiquidSurface active={active} fill="var(--game-ui-accent)" form={form} radius={20}>
        <span style={{ display: 'block', width: 150, height: 62 }} />
      </LiquidSurface>
      <GameButton onClick={() => setActive((value) => !value)}>
        {active ? '复位' : '触发'}
      </GameButton>
      <code style={{ color: 'var(--game-ui-text-muted)', fontSize: 12 }}>
        blur {LIQUID_FORMS[form].group.blur} · contrast {LIQUID_FORMS[form].group.contrast} · blob{' '}
        {LIQUID_FORMS[form].group.blob}
      </code>
    </div>
  );
}

export const Press: Story = {
  args: { children: null },
  render: () => <FormDemo form="press" />,
  parameters: { docs: { description: { story: LIQUID_FORMS.press.summary } } },
};

export const Settle: Story = {
  args: { children: null },
  render: () => <FormDemo form="settle" />,
  parameters: { docs: { description: { story: LIQUID_FORMS.settle.summary } } },
};

export const Fill: Story = {
  args: { children: null },
  render: () => <FormDemo form="fill" />,
  parameters: { docs: { description: { story: LIQUID_FORMS.fill.summary } } },
};

export const Drain: Story = {
  args: { children: null },
  render: () => <FormDemo form="drain" />,
  parameters: { docs: { description: { story: LIQUID_FORMS.drain.summary } } },
};

/*
 * `merge` is a relationship between siblings rather than a property of one
 * body, so it is arranged with a `LiquidGroup` directly instead of through
 * `LiquidSurface`. This is the move the whole technique exists for: two
 * separate silhouettes reach for each other and become one.
 */
function MergeDemo() {
  const [together, setTogether] = useState(false);
  const group = liquidFormGroup('merge');
  const item = liquidFormItem('merge');
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      <LiquidGroup
        blur={group.blur}
        contrast={group.contrast}
        fill="var(--game-ui-accent)"
        filterPadding={group.filterPadding}
      >
        <div
          style={{
            display: 'flex',
            gap: together ? 2 : 54,
            transition: 'gap 520ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <LiquidGroup.Item
            {...(item.effect === undefined ? {} : { effect: item.effect })}
            {...(item.morph === undefined ? {} : { morph: item.morph })}
            {...(item.transition === undefined ? {} : { transition: item.transition })}
            radius={999}
          >
            <span style={{ display: 'block', width: 66, height: 66 }} />
          </LiquidGroup.Item>
          <LiquidGroup.Item
            {...(item.effect === undefined ? {} : { effect: item.effect })}
            {...(item.morph === undefined ? {} : { morph: item.morph })}
            {...(item.transition === undefined ? {} : { transition: item.transition })}
            radius={999}
          >
            <span style={{ display: 'block', width: 66, height: 66 }} />
          </LiquidGroup.Item>
        </div>
      </LiquidGroup>
      <GameButton onClick={() => setTogether((value) => !value)}>
        {together ? '分开' : '靠拢'}
      </GameButton>
    </div>
  );
}

export const Merge: Story = {
  args: { children: null },
  render: () => <MergeDemo />,
  parameters: { docs: { description: { story: LIQUID_FORMS.merge.summary } } },
};

/*
 * Tone and surface are separate axes. Folding 'liquid' into `variant` would
 * have made 「a destructive action that is also liquid」 unsayable.
 */
export const ButtonSurfaces: Story = {
  args: { children: null },
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      {(['primary', 'secondary', 'danger', 'success'] as const).map((variant) => (
        <div key={variant} style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
          <GameButton surface="liquid" variant={variant}>
            {variant}
          </GameButton>
          <GameButton variant={variant}>flat</GameButton>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: { story: '同一个 `variant` 色调,`surface="liquid"` 换外观,两个轴互不吃掉。' },
    },
  },
};
