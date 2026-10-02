import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  GameAvatar,
  GameButton,
  GameIconButton,
  GameListRow,
  GameOtpInput,
  GameTabs,
} from '../../index';

const meta = {
  title: 'Clay/Account/AccountControls',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div
        style={{
          background: 'var(--game-ui-bg)',
          color: 'var(--game-ui-text)',
          padding: 16,
          margin: -16,
        }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '平面水滴按钮、可选铜牌头像框、验证码输入、竖排页签与安静的列表行。账号请求、验证结果和危险操作确认仍由宿主负责。',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function PlaqueDemo(): ReactNode {
  return (
    <div
      data-account-plaque
      style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}
    >
      <GameButton>新建作品</GameButton>
      <GameButton>中文</GameButton>
      <GameIconButton label="账号与设置">☰</GameIconButton>
      <GameAvatar surface="plaque" name="River" size="md" />
      <GameButton disabled>尚不可用</GameButton>
    </div>
  );
}

function CodeDemo({ invalid = false }: { invalid?: boolean }): ReactNode {
  const [value, setValue] = useState('');
  const [completed, setCompleted] = useState(0);
  return (
    <div data-account-code>
      <GameOtpInput
        aria-label="验证码"
        aria-describedby={invalid ? 'account-code-error' : 'account-code-hint'}
        invalid={invalid}
        value={value}
        onChange={setValue}
        onComplete={() => setCompleted((count) => count + 1)}
        getSlotLabel={(index, length) => `第 ${index + 1} 位，共 ${length} 位`}
      />
      {invalid ? (
        <p id="account-code-error">验证码不对或已过期</p>
      ) : (
        <p id="account-code-hint">输入六位数字，也可一次粘贴。</p>
      )}
      <p role="status" data-code-completions={completed}>
        {value.length === 6 ? '已填满，尚未验证' : '等待输入'}
      </p>
    </div>
  );
}

function TabsDemo(): ReactNode {
  const [active, setActive] = useState('profile');
  const tabs = [
    { id: 'profile', label: '我的资料', panelId: 'account-demo-profile-panel' },
    { id: 'security', label: '登录与安全', panelId: 'account-demo-security-panel' },
    { id: 'privacy', label: '数据与隐私', panelId: 'account-demo-privacy-panel' },
  ];
  return (
    <div
      data-account-tabs
      style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'start' }}
    >
      <GameTabs
        id="account-demo-tabs"
        aria-label="账号页签"
        orientation="vertical"
        activeId={active}
        onSelect={setActive}
        tabs={tabs}
      />
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={tab.panelId}
          aria-labelledby={`account-demo-tabs-${tab.id}`}
          hidden={active !== tab.id}
          tabIndex={0}
        >
          {tab.label}的内容由宿主提供。
        </div>
      ))}
    </div>
  );
}

function RowsDemo(): ReactNode {
  const [selected, setSelected] = useState('river');
  const [status, setStatus] = useState('');
  return (
    <div data-account-rows style={{ display: 'grid', gap: 8, maxWidth: 700 }}>
      {[
        { id: 'river', title: '河流的故事', description: '最近编辑 · 当前作品' },
        { id: 'forest', title: '森林来信', description: '十二个场景' },
      ].map((item) => (
        <GameListRow
          key={item.id}
          title={item.title}
          description={item.description}
          current={item.id === 'river'}
          selected={selected === item.id}
          thumbnail={<GameAvatar name={item.title} size="sm" />}
          onSelect={() => {
            setSelected(item.id);
            setStatus(`已选择：${item.title}`);
          }}
          actions={
            <>
              <GameIconButton
                label={`${item.title}更多`}
                onClick={() => setStatus(`更多：${item.title}`)}
              >
                ⋯
              </GameIconButton>
              <GameButton
                variant="danger"
                aria-label={`移除${item.title}`}
                onClick={() => setStatus(`移除${item.title}需要宿主确认`)}
              >
                移除
              </GameButton>
            </>
          }
        />
      ))}
      <p role="status">{status || '选择与右侧动作彼此独立。'}</p>
    </div>
  );
}

function OverviewDemo(): ReactNode {
  return (
    <main
      data-account-overview
      style={{
        maxWidth: 800,
        display: 'grid',
        gap: 24,
        fontFamily: 'var(--game-ui-font-body)',
        color: 'var(--game-ui-text)',
      }}
    >
      <h1 style={{ margin: 0, fontSize: 'var(--game-ui-font-xl)' }}>账号界面原件</h1>
      <section aria-label="水滴操作与铜牌头像">
        <h2>水滴操作与铜牌头像</h2>
        <PlaqueDemo />
      </section>
      <section aria-label="验证码输入">
        <h2>验证码</h2>
        <CodeDemo />
      </section>
      <section aria-label="竖排页签">
        <h2>页签</h2>
        <TabsDemo />
      </section>
      <section aria-label="作品列表">
        <h2>列表</h2>
        <RowsDemo />
      </section>
    </main>
  );
}

export const Overview: Story = { render: () => <OverviewDemo /> };
export const Plaque: Story = { render: () => <PlaqueDemo /> };
export const Code: Story = { render: () => <CodeDemo /> };
export const InvalidCode: Story = { render: () => <CodeDemo invalid /> };
export const VerticalTabs: Story = { render: () => <TabsDemo /> };
export const ListRows: Story = { render: () => <RowsDemo /> };
