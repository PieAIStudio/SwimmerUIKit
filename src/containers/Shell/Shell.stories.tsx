import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import {
  Badge,
  Button,
  Icon,
  Input,
  ListRow,
  LiquidSurface,
  PageSurface,
  Panel as BasePanel,
  Progress,
  Shell,
  Toggle,
  type PageSurfaceLayout,
  type ShellPlatform,
  type SurfaceLayout,
} from '../../index';

const meta = {
  title: 'Swimmer/Tool shell/Six page skeleton',
  component: PageSurface,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'B3 工具壳骨架：Shell 只提供平台语气、侧栏/窗口栏/移动导航槽和减少动态边界；PageSurface 提供标题、主动作、内容、侧栏和底部槽。六页都由宿主 children 组合，Kit 不拥有路由或业务状态。',
      },
    },
  },
} satisfies Meta<typeof PageSurface>;

export default meta;
type Story = StoryObj<typeof meta>;

function Panel({ children, title }: { children: ReactNode; title: string }): ReactNode {
  return (
    <BasePanel>
      <h2 style={{ margin: 0, fontSize: 'var(--swimmer-tool-font-title)' }}>{title}</h2>
      {children}
    </BasePanel>
  );
}

type ToolPage = 'home' | 'progress' | 'results' | 'review' | 'complete' | 'settings';

const PAGE_LABELS: Record<ToolPage, string> = {
  home: 'Home',
  progress: 'Progress',
  results: 'Results',
  review: 'Review',
  complete: 'Complete',
  settings: 'Settings',
};

const PAGE_ICONS: Record<
  ToolPage,
  'home' | 'search' | 'scroll' | 'check' | 'settings' | 'history'
> = {
  home: 'home',
  progress: 'search',
  results: 'scroll',
  review: 'scroll',
  complete: 'check',
  settings: 'settings',
};

function ToolSidebar({ active }: { active: ToolPage }): ReactNode {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--swimmer-space-2)',
          padding: '0 var(--swimmer-space-3) var(--swimmer-space-8)',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 30,
            height: 30,
            borderRadius: 9,
            background: 'var(--swimmer-accent)',
            color: 'var(--swimmer-cta-text)',
          }}
        >
          <Icon icon="check" size="sm" />
        </span>
        <strong>Swimmer Tools</strong>
      </div>
      <nav aria-label="Tool pages">
        {(Object.keys(PAGE_LABELS) as ToolPage[]).map((page) => (
          <button data-current={active === page ? 'true' : undefined} key={page} type="button">
            <Icon icon={PAGE_ICONS[page]} size="sm" />
            <span>{PAGE_LABELS[page]}</span>
          </button>
        ))}
      </nav>
      <small>Shared shell · host-owned data</small>
    </div>
  );
}

function MobileNav({ active }: { active: ToolPage }): ReactNode {
  return (
    <nav
      aria-label="Tool pages on mobile"
      style={{ display: 'flex', gap: 'var(--swimmer-space-2)', justifyContent: 'space-around' }}
    >
      {(['home', 'results', 'review', 'settings'] as ToolPage[]).map((page) => (
        <button
          aria-current={active === page ? 'page' : undefined}
          key={page}
          style={{
            display: 'grid',
            justifyItems: 'center',
            gap: 2,
            minWidth: 'var(--swimmer-touch-target)',
            minHeight: 'var(--swimmer-touch-target)',
            border: 0,
            borderRadius: 'var(--swimmer-radius-small)',
            background: active === page ? 'var(--swimmer-selection)' : 'transparent',
            color: 'var(--swimmer-accent-ink)',
          }}
          type="button"
        >
          <Icon icon={PAGE_ICONS[page]} size="sm" />
          <span style={{ fontSize: 'var(--swimmer-tool-font-label)' }}>{PAGE_LABELS[page]}</span>
        </button>
      ))}
    </nav>
  );
}

function WindowBar({ page }: { page: ToolPage }): ReactNode {
  return (
    <>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        Workspace / {PAGE_LABELS[page]}
      </span>
      <span style={{ display: 'flex', gap: 'var(--swimmer-space-2)' }}>
        <Button size="sm">Help</Button>
        <Button size="sm">Theme</Button>
      </span>
    </>
  );
}

function PageBody({ page }: { page: ToolPage }): ReactNode {
  switch (page) {
    case 'home':
      return (
        <>
          <Panel title="One clear next step">
            <p style={{ margin: 0, color: 'var(--swimmer-text-muted)' }}>
              Use the host application to provide real scope, copy and actions. The kit only keeps
              the page hierarchy steady.
            </p>
          </Panel>
          <ListRow
            description="A quiet, static list row for host-provided scope."
            title="Workspace scope"
            thumbnail={<Icon icon="card" />}
          />
          <Panel title="What stays visible">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--swimmer-space-2)' }}>
              <Badge tone="success">Ready</Badge>
              <Badge tone="neutral">Local</Badge>
            </div>
          </Panel>
        </>
      );
    case 'progress':
      return (
        <Panel title="Checking the selected scope">
          <div style={{ display: 'grid', gap: 'var(--swimmer-space-4)' }}>
            <Progress label="Workspace check" showValue value={62} />
            <div style={{ display: 'flex', gap: 'var(--swimmer-space-2)', alignItems: 'center' }}>
              <Badge tone="ai">In progress</Badge>
              <span style={{ color: 'var(--swimmer-text-muted)' }}>
                The host owns the real job.
              </span>
            </div>
          </div>
        </Panel>
      );
    case 'results':
      return (
        <>
          <Panel title="A calm result summary">
            <div style={{ display: 'grid', gap: 'var(--swimmer-space-3)' }}>
              <ListRow
                description="Static card/list treatment; no idle liquid."
                title="Recent items"
              />
              <ListRow
                description="Static card/list treatment; no idle liquid."
                title="Older items"
              />
            </div>
          </Panel>
          <Panel title="Needs attention">
            <p style={{ margin: 0, color: 'var(--swimmer-text-muted)' }}>
              Errors and decisions remain visible in host-owned copy.
            </p>
          </Panel>
        </>
      );
    case 'review':
      return (
        <>
          <ListRow
            current
            description="A selected row keeps native focus and selection semantics."
            selected
            title="Review this item"
            thumbnail={<Icon icon="scroll" />}
          />
          <ListRow
            description="Another item remains a quiet, flat sibling."
            title="Keep this item"
            thumbnail={<Icon icon="history" />}
          />
        </>
      );
    case 'complete':
      return (
        <>
          <div style={{ display: 'grid', justifyItems: 'center', gap: 'var(--swimmer-space-4)' }}>
            <LiquidSurface
              fill={{
                top: 'var(--swimmer-cta-from)',
                bottom: 'var(--swimmer-cta-to)',
              }}
              radius={42}
              style={{ width: 132, height: 116 }}
            >
              <span
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: '100%',
                  height: '100%',
                  color: 'var(--swimmer-cta-text)',
                }}
              >
                <Icon icon="check" label="Complete" size="lg" />
              </span>
            </LiquidSurface>
            <Badge tone="success">Complete once</Badge>
          </div>
          <Panel title="Host-owned completion copy">
            <p style={{ margin: 0, color: 'var(--swimmer-text-muted)' }}>
              This is the only completion liquid in the skeleton; static result cards stay still.
            </p>
          </Panel>
        </>
      );
    case 'settings':
      return (
        <Panel title="A small settings surface">
          <label style={{ display: 'grid', gap: 'var(--swimmer-space-2)' }}>
            Workspace label
            <Input aria-label="Workspace label" defaultValue="Example workspace" />
          </label>
          <Toggle checked label="Use compact rows" />
        </Panel>
      );
  }
}

function ToolShellPage({
  page,
  layout = 'desktop',
  platform = 'mac',
  reducedMotion = false,
}: {
  page: ToolPage;
  layout?: SurfaceLayout;
  platform?: ShellPlatform;
  reducedMotion?: boolean;
}): ReactNode {
  const layoutMode: PageSurfaceLayout = page === 'review' ? 'split' : 'default';
  return (
    <Shell
      compact={page === 'review'}
      layout={layout}
      mobileNav={<MobileNav active={page} />}
      platform={platform}
      reducedMotion={reducedMotion}
      sidebar={<ToolSidebar active={page} />}
      sidebarLabel="Tool navigation"
      title={`${PAGE_LABELS[page]} tool page`}
      windowBar={<WindowBar page={page} />}
    >
      <PageSurface
        aside={
          page === 'review' ? (
            <Panel title="Review groups">
              <Badge tone="neutral">All items</Badge>
              <Badge tone="warning">Needs attention</Badge>
              <Badge tone="success">Ready</Badge>
            </Panel>
          ) : undefined
        }
        description="A host-owned page skeleton with stable slots and no product state."
        eyebrow={`B3 · ${PAGE_LABELS[page]}`}
        footer={
          page === 'review' ? (
            <>
              <Button>Back</Button>
              <Button variant="primary">Apply selection</Button>
            </>
          ) : page === 'settings' ? (
            <Button variant="primary">Save settings</Button>
          ) : undefined
        }
        layout={layoutMode}
        primaryAction={
          page === 'home' ? (
            <Button variant="primary">Start check</Button>
          ) : page === 'results' ? (
            <Button variant="primary">Review changes</Button>
          ) : page === 'complete' ? (
            <Button variant="primary">Return to workspace</Button>
          ) : page === 'progress' ? (
            <Button>Stop</Button>
          ) : undefined
        }
        title={`${PAGE_LABELS[page]} page`}
      >
        <PageBody page={page} />
      </PageSurface>
    </Shell>
  );
}

export const Home: Story = {
  args: { children: null, title: 'Home page' },
  name: '01 · Home',
  render: () => <ToolShellPage page="home" />,
};

export const ProgressPage: Story = {
  args: { children: null, title: 'Progress page' },
  name: '02 · Progress',
  render: () => <ToolShellPage page="progress" />,
};

export const Results: Story = {
  args: { children: null, title: 'Results page' },
  name: '03 · Results',
  render: () => <ToolShellPage page="results" />,
};

export const Review: Story = {
  args: { children: null, title: 'Review page' },
  name: '04 · Review',
  render: () => <ToolShellPage page="review" />,
};

export const Complete: Story = {
  args: { children: null, title: 'Complete page' },
  name: '05 · Complete',
  render: () => <ToolShellPage page="complete" />,
};

export const Settings: Story = {
  args: { children: null, title: 'Settings page' },
  name: '06 · Settings',
  render: () => <ToolShellPage page="settings" />,
};

export const WindowsVoice: Story = {
  args: { children: null, title: 'Windows page' },
  name: 'Platform · Windows voice',
  render: () => <ToolShellPage page="results" platform="windows" />,
};

export const NarrowReducedMotion: Story = {
  args: { children: null, title: 'Mobile progress page' },
  name: 'Mobile · Reduced motion',
  render: () => <ToolShellPage layout="mobile" page="progress" reducedMotion />,
};
