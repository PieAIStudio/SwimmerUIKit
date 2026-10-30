import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import {
  ActionPill,
  BentoProgress,
  GlassCard,
  Gem,
  Icon,
  ManagerSheet,
  RoundAction,
  Switch,
  ToolIcon,
  ToolLanding,
  ToolSidebar,
  ToolWindow,
  type ToolSidebarItem,
  type ToolWorld,
} from '../../src';

const meta = {
  title: 'Swimmer/Colour Worlds/Mock pages',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Kit-only static mock pages for the Colour Worlds contract. App data and 3D art remain slots; these demos use a small generic stand-in art block so no consumer asset is shipped.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type NavItem = ToolSidebarItem;

function Art({
  name,
  tone = 'var(--swimmer-tool-gem1)',
}: {
  name: string;
  tone?: string;
}): ReactNode {
  return (
    <div
      style={{
        display: 'grid',
        width: 220,
        height: 180,
        placeItems: 'center',
        border: '1px solid color-mix(in srgb, white 36%, transparent)',
        borderRadius: 38,
        background: `linear-gradient(145deg, color-mix(in srgb, ${tone} 78%, white), var(--swimmer-tool-gem2))`,
        boxShadow:
          'inset 0 -14px 24px color-mix(in srgb, black 22%, transparent), 0 24px 34px color-mix(in srgb, black 30%, transparent)',
        color: 'white',
      }}
    >
      <ToolIcon label={name} name={name as never} size={72} />
    </div>
  );
}

function Sidebar({
  app,
  items,
  mode = 'normal',
}: {
  app: string;
  items: NavItem[];
  mode?: 'normal' | 'rail';
}) {
  return (
    <ToolSidebar
      appName={app}
      appIcon={
        <Gem>
          <Icon icon="gem" size="sm" />
        </Gem>
      }
      items={items}
      mode={mode}
    />
  );
}

function Landing({
  app,
  art,
  features,
  lead,
  title,
  world,
  items,
  action,
}: {
  app: string;
  art: string;
  features: Parameters<typeof ToolLanding>[0]['features'];
  lead: ReactNode;
  title: ReactNode;
  world: ToolWorld;
  items: NavItem[];
  action: ReactNode;
}) {
  return (
    <ToolWindow sidebar={<Sidebar app={app} items={items} />} title={app} world={world}>
      <ToolLanding art={<Art name={art} />} features={features} lead={lead} title={title} />
      {action}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 14,
          right: 20,
          color: 'var(--swimmer-tool-muted)',
          fontSize: 12,
        }}
      >
        EN · 中
      </div>
      <p
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 14,
          left: 18,
          margin: 0,
          color: 'var(--swimmer-tool-muted)',
          fontSize: 12,
        }}
      >
        ● ● ●
      </p>
    </ToolWindow>
  );
}

const claudeItems: NavItem[] = [
  { id: 'overview', icon: <Icon icon="home" />, label: 'Overview', selected: true },
  { id: 'local', icon: <Icon icon="chat" />, label: 'Local Code sessions' },
  { id: 'cloud', icon: <ToolIcon name="cloud" />, label: 'Cloud Code sessions' },
  { id: 'backup', icon: <Icon icon="history" />, label: 'Backups' },
  { id: 'settings', icon: <Icon icon="settings" />, label: 'Folder settings' },
];
const mailItems: NavItem[] = [
  { id: 'clean', icon: <ToolIcon name="inbox" />, label: 'Clean Up', selected: true },
  { id: 'history', icon: <Icon icon="undo" />, label: 'Batch history' },
  { id: 'qq', icon: <ToolIcon name="mail" />, label: 'QQ Mail', badge: '3,580' },
  { id: 'gmail', icon: <ToolIcon name="mail" />, label: 'Gmail', badge: '4,460' },
  { id: 'hotmail', icon: <ToolIcon name="mail" />, label: 'Hotmail', badge: '3,140' },
  { id: 'business', icon: <ToolIcon name="mail" />, label: 'Business', badge: '3,960' },
];
const onePlaceItems: NavItem[] = [
  { id: 'home', icon: <ToolIcon name="folder" />, label: '家庭文件夹', selected: true, badge: '2' },
  { id: 'devices', icon: <ToolIcon name="laptop" />, label: '设备与连接', badge: '2/3' },
  { id: 'restore', icon: <Icon icon="undo" />, label: '找回文件' },
  { id: 'settings', icon: <Icon icon="settings" />, label: '设置' },
];
const attendantItems: NavItem[] = [
  { id: 'start', icon: <ToolIcon name="spark" />, label: 'Start here', selected: true },
  { id: 'accounts', icon: <Icon icon="user" />, label: 'Accounts', badge: '0' },
  { id: 'records', icon: <ToolIcon name="list" />, label: 'Records' },
  { id: 'reminders', icon: <ToolIcon name="pulse" />, label: 'Reminders' },
  { id: 'settings', icon: <Icon icon="settings" />, label: 'Settings' },
];

export const ClaudeSyncLanding: Story = {
  render: () => (
    <Landing
      action={<RoundAction promise="Read-only until you confirm">Check</RoundAction>}
      app="ClaudeSync"
      art="chat"
      features={[
        { id: 'local', icon: <Icon icon="chat" />, title: 'Local and cloud Code sessions' },
        { id: 'accounts', icon: <Icon icon="user" />, title: 'Personal ↔ Work, both found' },
        { id: 'safe', icon: <Icon icon="lock" />, title: 'Read-only until you confirm' },
      ]}
      items={claudeItems}
      lead="Switch accounts and keep your train of thought. Bring your chats across and carry on where you stopped."
      title="Sync Chats"
      world="violet"
    />
  ),
};

export const ClaudeSyncLandingDark: Story = {
  ...ClaudeSyncLanding,
  name: 'ClaudeSync landing · dark',
};

const managerRows = [
  {
    id: 'billing',
    checked: true,
    date: 'Oct 29, 2026',
    icon: <Icon icon="chat" />,
    meta: '~/Work/billing-service · 46 messages',
    name: 'Refactor billing webhooks',
    size: '2.4 MB',
  },
  {
    id: 'launch',
    checked: true,
    date: 'Oct 27, 2026',
    icon: <Icon icon="chat" />,
    meta: '~/Sites/launch · 18 messages',
    name: 'Landing page copy, round 3',
    size: '712 KB',
  },
];

export const ClaudeSyncReview: Story = {
  render: () => (
    <ToolWindow
      sidebar={<Sidebar app="ClaudeSync" items={claudeItems} mode="rail" />}
      sidebarMode="rail"
      title="Local Code Sessions"
      world="blue"
    >
      <ManagerSheet
        actionLabel="Sync 2"
        footerNote="A backup is made before every sync"
        groups={[
          {
            id: 'new',
            icon: <Icon icon="redo" />,
            label: 'Not in Work yet',
            meta: '2 chats · 3.1 MB',
            badge: 2,
            selected: true,
          },
          {
            id: 'old',
            icon: <ToolIcon name="box" />,
            label: 'Old, can be archived',
            meta: '1 chat · 820 KB',
            badge: 1,
          },
          {
            id: 'look',
            icon: <Icon icon="search" />,
            label: 'Needs a look',
            meta: 'Title or content differs',
            badge: 1,
          },
          {
            id: 'both',
            icon: <Icon icon="check" />,
            label: 'Already in both',
            meta: 'Nothing to do',
            badge: 1,
          },
        ]}
        rows={managerRows}
        selectedCount="2 chats selected"
        selectedSize="3.1 MB"
        sortLabel="Recent"
        subtitle="These chats exist only in Personal. Syncing copies them; the originals stay where they are."
        title="Local Code Sessions"
      />
    </ToolWindow>
  ),
};

export const MailWardLanding: Story = {
  render: () => (
    <Landing
      action={<RoundAction promise="Read-only · nothing is moved while scanning">Scan</RoundAction>}
      app="MailWard"
      art="mail"
      features={[
        { id: 'promo', icon: <Icon icon="gift" />, title: 'Promotions and newsletters' },
        { id: 'codes', icon: <Icon icon="hourglass" />, title: 'Expired codes and old notices' },
        { id: 'undo', icon: <Icon icon="undo" />, title: 'Every batch can come back' },
      ]}
      items={mailItems}
      lead="Find the mail you no longer need across all five mailboxes. Bills, contracts and people you know stay put."
      title="Mail Clean Up"
      world="coral"
    />
  ),
};

export const MailWardSummary: Story = {
  render: () => (
    <ToolWindow
      sidebar={<Sidebar app="MailWard" items={mailItems} mode="rail" />}
      sidebarMode="rail"
      title="Clean Up"
      world="coral"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr auto',
          gap: 16,
          flex: 1,
          padding: '58px 56px 168px',
        }}
      >
        <h1
          style={{
            gridColumn: '1 / -1',
            margin: 0,
            alignSelf: 'end',
            color: 'var(--swimmer-tool-text)',
            fontSize: 26,
            fontWeight: 400,
            textAlign: 'center',
          }}
        >
          1,869 of 3,220 messages can go.
        </h1>
        <GlassCard
          description="Shops, apps and newsletters you haven't opened in 60 days. Unsubscribe links are kept in the report."
          icon={<ToolIcon name="gift" size={56} />}
          title="904 promotions"
          variant="big"
          actions={
            <>
              <ActionPill>Review</ActionPill>
              <ActionPill>Clean</ActionPill>
            </>
          }
        />
        <GlassCard
          description="Login and delivery codes that already ran out."
          title="429 expired codes"
          actions={<ActionPill>Review</ActionPill>}
        />
        <GlassCard
          description="System notices older than 90 days, plus 210 quiet subscriptions."
          title="536 old notices"
          actions={<ActionPill>Review</ActionPill>}
        />
        <GlassCard
          description="Bills, contracts and mail from real people. MailWard never offers these for cleaning."
          icon={
            <Gem size="lg">
              <Icon icon="lock" />
            </Gem>
          }
          title="1,351 kept for you"
          variant="kept"
        />
      </div>
      <RoundAction promise="Moves to a batch you can restore">Clean</RoundAction>
    </ToolWindow>
  ),
};

export const MailWardProgress: Story = {
  render: () => (
    <ToolWindow
      sidebar={<Sidebar app="MailWard" items={mailItems} mode="rail" />}
      sidebarMode="rail"
      title="Clean Up"
      world="coral"
    >
      <BentoProgress
        tiles={[
          {
            id: 'qq',
            label: 'QQ Mail',
            state: 'done',
            value: '412',
            detail: 'can go',
            art: <Icon icon="gift" size="lg" />,
          },
          {
            id: 'gmail',
            label: 'Reading Gmail…',
            state: 'now',
            value: '2,918 of 4,460 · headers only',
            art: <ToolIcon name="search" size={72} />,
          },
          {
            id: 'hotmail',
            label: 'Hotmail',
            state: 'waiting',
            value: 'Next in line',
            art: <ToolIcon name="bell" size={72} />,
          },
          {
            id: 'business',
            label: 'Business',
            state: 'waiting',
            value: 'Next in line',
            art: <ToolIcon name="doc" size={72} />,
          },
        ]}
      />
      <RoundAction promise="Read-only · nothing is moved while scanning" state="stop">
        Stop
      </RoundAction>
    </ToolWindow>
  ),
};

export const OnePlaceLanding: Story = {
  render: () => (
    <Landing
      action={
        <RoundAction promise="关掉窗口也会继续传">
          放进
          <br />
          文件
        </RoundAction>
      }
      app="OnePlace"
      art="folder"
      features={[
        {
          id: 'files',
          icon: <ToolIcon name="image" />,
          title: '照片和文档',
          description: '2 个文件 · 两台都保管好了',
        },
        {
          id: 'devices',
          icon: <ToolIcon name="laptop" />,
          title: '2 台在线',
          description: '书房 Mac、这台 Mac · 客厅设备没打开',
        },
        {
          id: 'restore',
          icon: <Icon icon="undo" />,
          title: '删错了也能找回',
          description: '30 天内随时恢复',
        },
      ]}
      items={onePlaceItems}
      lead="家里每台设备看到的是同一份文件。每个文件都有两台设备一起保管。"
      title="家庭文件夹"
      world="teal"
    />
  ),
};

export const OnePlaceManagerDark: Story = {
  render: () => (
    <ToolWindow
      sidebar={<Sidebar app="OnePlace" items={onePlaceItems} mode="rail" />}
      sidebarMode="rail"
      title="找回文件"
      world="teal"
    >
      <ManagerSheet
        actionLabel="找回"
        footerNote="找回不会覆盖现有文件"
        groups={[
          {
            id: 'photos',
            icon: <ToolIcon name="image" />,
            label: '照片',
            meta: '3 个 · 14.2 MB',
            badge: 3,
            selected: true,
          },
          {
            id: 'docs',
            icon: <ToolIcon name="doc" />,
            label: '文档',
            meta: '2 个 · 380 KB',
            badge: 2,
          },
          {
            id: 'folder',
            icon: <ToolIcon name="folder" />,
            label: '整个文件夹',
            meta: '没有',
            badge: 0,
          },
        ]}
        rows={[
          {
            id: 'one',
            checked: true,
            date: '10月28日',
            icon: <ToolIcon name="image" />,
            meta: '家庭文件夹 › 周末 · 书房 Mac 删除',
            name: '周末野餐-01.jpg',
            size: '5.1 MB',
          },
          {
            id: 'two',
            date: '10月28日',
            icon: <ToolIcon name="image" />,
            meta: '家庭文件夹 › 周末 · 书房 Mac 删除',
            name: '周末野餐-02.jpg',
            size: '4.8 MB',
          },
          {
            id: 'three',
            date: '10月21日',
            icon: <ToolIcon name="image" />,
            meta: '家庭文件夹 › 生日 · 这台 Mac 删除',
            name: '生日蛋糕.heic',
            size: '4.3 MB',
          },
        ]}
        selectedCount="已选 1 个"
        selectedSize="5.1 MB"
        sortLabel="删除时间"
        subtitle="从「家庭文件夹 / 周末」删掉的照片。"
        theme="dark"
        title="找回文件"
      />
    </ToolWindow>
  ),
};

export const AttendantLanding: Story = {
  render: () => (
    <Landing
      action={<RoundAction promise="No website is opened">Add</RoundAction>}
      app="Attendant"
      art="key"
      features={[
        {
          id: 'account',
          icon: <Icon icon="user" />,
          title: 'Add one website account',
          description: 'About a minute',
        },
        {
          id: 'ask',
          icon: <Icon icon="chat" />,
          title: 'Ask it back',
          description: '“Which email does Paddle use?”',
        },
        {
          id: 'recovery',
          icon: <Icon icon="lock" />,
          title: 'Set a recovery code',
          description: 'Before you save anything important',
        },
      ]}
      items={attendantItems}
      lead="Remembers where each account lives: the official site, the email, the phone and how you sign in. Never the password."
      title="Your Account Steward"
      world="indigo"
    />
  ),
};

export const AutoContinuePopup: Story = {
  render: () => (
    <ToolWindow style={{ width: 380, height: 600 }} title="AutoContinue" world="magenta">
      <div
        style={{
          display: 'flex',
          minHeight: '100%',
          flexDirection: 'column',
          padding: 18,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: 'var(--swimmer-tool-text)',
            fontWeight: 600,
          }}
        >
          AutoContinue{' '}
          <span style={{ color: 'var(--swimmer-tool-muted)', fontSize: 12 }}>EN · 中</span>
        </div>
        <div
          style={{
            display: 'grid',
            margin: '16px auto 4px',
            width: 112,
            height: 112,
            placeItems: 'center',
            borderRadius: 30,
            background:
              'linear-gradient(150deg, var(--swimmer-tool-gem1), var(--swimmer-tool-gem2))',
            color: 'white',
          }}
        >
          <ToolIcon name="play" size={52} />
        </div>
        <h1
          style={{
            margin: '10px 0 4px',
            color: 'var(--swimmer-tool-text)',
            fontSize: 26,
            fontWeight: 300,
          }}
        >
          Keep AI chats moving
        </h1>
        <p style={{ margin: '0 24px 16px', color: 'var(--swimmer-tool-muted)', fontSize: 12.5 }}>
          Clicks Retry when a reply fails, and approves safe reads in one folder.
        </p>
        <div className="game-ui-glass-card" style={{ margin: '0 0 8px', padding: '4px 14px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '26px 1fr auto',
              gap: 10,
              alignItems: 'center',
              padding: '11px 0',
              textAlign: 'left',
            }}
          >
            <Gem>
              <Icon icon="undo" />
            </Gem>
            <span>
              <strong style={{ display: 'block' }}>ChatGPT retry</strong>
              <small style={{ color: 'var(--swimmer-tool-muted)' }}>
                Clicks “Retry” on a failed reply
              </small>
            </span>
            <Switch aria-label="ChatGPT retry" defaultChecked />
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '26px 1fr auto',
              gap: 10,
              alignItems: 'center',
              padding: '11px 0',
              textAlign: 'left',
            }}
          >
            <Gem>
              <Icon icon="check" />
            </Gem>
            <span>
              <strong style={{ display: 'block' }}>Gemini allow</strong>
              <small style={{ color: 'var(--swimmer-tool-muted)' }}>
                Only reads inside the folder below
              </small>
            </span>
            <Switch aria-label="Gemini allow" defaultChecked />
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '26px 1fr auto',
              gap: 10,
              alignItems: 'center',
              padding: '11px 0',
              textAlign: 'left',
            }}
          >
            <Gem>
              <ToolIcon name="folder" />
            </Gem>
            <span>
              <strong style={{ display: 'block' }}>Allowed folder</strong>
              <code>/Users/demo/Work/</code>
            </span>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: 'var(--swimmer-tool-muted)',
            fontSize: 11.5,
          }}
        >
          <span>Last action · none yet</span>
          <span>Needs review · 0</span>
        </div>
        <RoundAction promise="">Save</RoundAction>
      </div>
    </ToolWindow>
  ),
};
