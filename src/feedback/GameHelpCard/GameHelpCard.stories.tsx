import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, type ReactNode } from 'react';
import { GameHelpCard, type GameHelpCardTopic, type GameHelpMedia } from './GameHelpCard';
import { GameButton } from '../../controls/GameButton/GameButton';
import { GameIconButton } from '../../controls/GameIconButton/GameIconButton';
import { GameIcon } from '../../icons/GameIcon/GameIcon';
import helpDemoWebm from './assets/help-demo.webm';
import helpDemoMp4 from './assets/help-demo.mp4';
import helpDemoPoster from './assets/help-demo-poster.png';
import helpDemoStill from './assets/help-demo-still.png';

const demoVideo: GameHelpMedia = {
  kind: 'video',
  sources: [
    { src: helpDemoWebm, type: 'video/webm' },
    { src: helpDemoMp4, type: 'video/mp4' },
  ],
  poster: helpDemoPoster,
  alt: '点一下保存按钮，右上角出现对勾。',
  width: 480,
  height: 270,
};

const demoImage: GameHelpMedia = {
  kind: 'image',
  src: helpDemoStill,
  alt: '按钮被按下的瞬间。',
  width: 480,
  height: 270,
};

const oneTopic: GameHelpCardTopic = {
  id: 'save',
  label: '保存',
  title: '点一下就保存',
  body: '作品会保存在这台设备上。\n之后可以随时继续编辑。',
  media: demoVideo,
};

const meta = {
  title: 'Swimmer/Feedback/GameHelpCard',
  component: GameHelpCard,
  tags: ['autodocs'],
  args: {
    label: '怎么用',
    topics: [oneTopic],
    children: (
      <GameButton>
        <GameIcon icon="scroll" />
        怎么用
      </GameButton>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '96px 24px 300px' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '悬停、键盘焦点或触摸时打开的小卡片，用来解释一个操作。卡片可以包含一到四个主题（多于一个时显示页签）、一段可选的循环短演示和一个“完整指南”链接。媒体在第一次打开时才加载；减少动态时不自动播放。必要信息、错误和价格不要只放在这里。',
      },
    },
  },
} satisfies Meta<typeof GameHelpCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One topic with a short looping demo. Hover, focus or tap the button. */
export const SingleTopicWithVideo: Story = {
  name: 'Single topic with video / 单主题与短演示',
};

/** Several topics show tabs; each tab has its own real tabpanel. */
export const ThreeTopicsWithTabs: Story = {
  name: 'Three topics with tabs / 三个主题用页签',
  args: {
    label: '怎么用',
    topics: [
      oneTopic,
      {
        id: 'restore',
        label: '恢复',
        title: '从备份恢复',
        body: '选择一个备份后恢复。\n当前作品会先保存为副本。',
        media: demoImage,
      },
      {
        id: 'share',
        label: '分享',
        title: '分享前先检查',
        body: '分享的是当前版本。\n分享后仍可以继续修改。',
      },
    ],
  },
};

/** The product's three Chinese topic labels: they must share one row at 340 px. */
export const TopicTabsZh: Story = {
  name: 'Topic tabs on one row, zh / 页签一行（中文）',
  args: {
    label: '怎么用',
    topics: [
      {
        id: 'guide',
        label: '懒人包',
        title: '先看这一页',
        body: '按顺序完成三步。\n不确定时可以先保存。',
      },
      { id: 'sheet', label: '设定图', title: '看懂设定图', body: '设定图列出角色的服装与配色。' },
      {
        id: 'cast',
        label: '选角单',
        title: '选角前先检查',
        body: '选角单里的每个角色都可以替换。',
      },
    ],
  },
};

/** The same three topics in English, for the label-width check in the other language. */
export const TopicTabsEn: Story = {
  name: 'Topic tabs on one row, en / 页签一行（英文）',
  args: {
    label: 'How to use',
    topics: [
      {
        id: 'guide',
        label: 'Starter pack',
        title: 'Start here',
        body: 'Follow the three steps in order.\nSave at any time if unsure.',
      },
      {
        id: 'sheet',
        label: 'Sheet',
        title: 'Read the sheet',
        body: 'The sheet lists each cast member’s outfit and colours.',
      },
      {
        id: 'cast',
        label: 'Cast',
        title: 'Check before casting',
        body: 'Every role in the cast list can be replaced.',
      },
    ],
  },
};

/** Image media with a fixed box, so opening the card never shifts the layout. */
export const ImageMedia: Story = {
  name: 'Image media / 图片',
  args: {
    topics: [{ ...oneTopic, id: 'image', media: demoImage, title: '按下这里' }],
  },
};

/** No media, plus an optional link to the full guide. */
export const LinkOnly: Story = {
  name: 'No media with guide link / 无媒体与完整指南链接',
  args: {
    topics: [
      {
        id: 'guide',
        label: '说明',
        title: '作品与副本',
        body: '副本只会在你点击保存时生成。\n删除副本前会再次确认。',
      },
    ],
    link: { href: '#guide', label: '查看完整指南' },
  },
};

/** The trigger is a link. A first tap opens the card; a second tap follows the link. */
export const TriggerAsLink: Story = {
  name: 'Trigger as a link / 触发器是链接',
  args: {
    children: (
      <GameIconButton href="#guide" label="怎么用">
        <GameIcon icon="scroll" />
      </GameIconButton>
    ),
    link: { href: '#guide', label: '查看完整指南' },
  },
};

/** The platform asks for reduced motion: the video never autoplays and shows its poster. */
export const ReducedMotion: Story = {
  name: 'Reduced motion / 减少动态',
  decorators: [
    (Story) => (
      <ReducedMotionFrame>
        <Story />
      </ReducedMotionFrame>
    ),
  ],
};

/** A 390 px column for phone-width review; the page viewport decides the real width. */
export const Narrow390: Story = {
  name: 'Narrow 390 px / 窄屏 390 像素',
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 390, padding: '96px 0 300px', boxSizing: 'border-box' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    topics: [
      oneTopic,
      {
        id: 'restore',
        label: '恢复',
        title: '从备份恢复',
        body: '选择一个备份后恢复。\n当前作品会先保存为副本。',
        media: demoImage,
      },
    ],
  },
};

/**
 * Makes the page report reduced motion while mounted, so the story shows the same
 * path a user with that system setting sees. The real query is restored on unmount.
 */
function ReducedMotionFrame({ children }: { children: ReactNode }) {
  useEffect(() => {
    const original = window.matchMedia.bind(window);
    window.matchMedia = (query: string) =>
      query.includes('prefers-reduced-motion')
        ? ({
            matches: true,
            media: query,
            onchange: null,
            addEventListener: () => undefined,
            removeEventListener: () => undefined,
            addListener: () => undefined,
            removeListener: () => undefined,
            dispatchEvent: () => false,
          } as MediaQueryList)
        : original(query);
    return () => {
      window.matchMedia = original;
    };
  }, []);
  return <>{children}</>;
}
