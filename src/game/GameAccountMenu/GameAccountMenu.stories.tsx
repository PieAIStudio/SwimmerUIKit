import type { Meta, StoryObj } from '@storybook/react-vite';
// Public path: @pieai/swimmer-ui-kit/liquid-presence (the repo's source equivalent).
import { GameAccountMenu, type GameAccountMenuProps } from '../../liquid-presence';
// The popover is liquid-presence UI: consumers import this sheet next to styles.css.
import '../../presence/presence.css';

const labels: GameAccountMenuProps['labels'] = {
  trigger: '账号：小鱼',
  siteTab: '小鱼的作品',
  productsTab: '全部产品',
  accountTab: '账号',
  current: '当前',
  manage: '管理账号与安全',
  signOut: '退出登录',
};

const products: GameAccountMenuProps['products'] = [
  {
    id: 'party',
    name: 'SwimmerParty',
    description: '派对与房间',
    href: '#party',
    current: true,
  },
  { id: 'university', name: 'Swimmer University', description: '学习与课程', href: '#university' },
  { id: 'studio', name: 'Swimmer Studio', href: '#studio' },
];

function SiteContent() {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <strong>我的作品</strong>
      <span>已保存 3 件作品，最近一次保存在今天上午。</span>
    </div>
  );
}

const meta = {
  title: 'Swimmer/Account/GameAccountMenu',
  component: GameAccountMenu,
  tags: ['autodocs'],
  args: {
    user: { name: '小鱼', email: 'xiaoyu@example.com' },
    labels,
    site: <SiteContent />,
    products,
    accountHref: '#account',
    onSignOut: () => {},
  },
  parameters: {
    docs: {
      description: {
        component:
          '登录后的账号菜单：头像与名字位于头部，点击打开同一个账号面板。产品提供用户、产品列表和本站内容；登录、退出由产品或 AuthKit 执行，组件不联网、不存储。从 `@pieai/swimmer-ui-kit/liquid-presence` 导入（不在根入口），并同时引入 `@pieai/swimmer-ui-kit/liquid-presence.css`。',
      },
    },
  },
} satisfies Meta<typeof GameAccountMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedIn: Story = {
  name: 'Signed in, all tabs / 三个页签',
};

export const WithAvatarImage: Story = {
  name: 'Avatar image / 头像图片',
  args: {
    user: {
      name: '小鱼',
      email: 'xiaoyu@example.com',
      avatarUrl: 'https://placehold.co/96x96/png?text=XY',
    },
  },
};

export const LongNameAndEmail: Story = {
  name: 'Long name and email / 很长的名字与邮箱',
  args: {
    user: {
      name: '一个非常非常长的昵称用来检查截断与省略号效果是否正常显示',
      email: 'a.very.long.address.used.to.check.truncation@students.example.edu.cn',
    },
  },
};

export const AccountOnly: Story = {
  name: 'Account tab only / 仅账号',
  args: { site: undefined, products: [] },
};

export const Narrow390: Story = {
  name: 'Narrow 390px / 窄屏 390px',
  decorators: [
    (Story) => (
      <div style={{ width: 390, maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
};
