import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  GameButton,
  GameCollectibleCard,
  GameCollectibleCardSlot,
  useGameCardOrientation,
} from '../../index';

const meta = {
  title: 'Swimmer/Display/GameCollectibleCard',
  component: GameCollectibleCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '收集卡：鼠标（或手指拖动）让它倾斜、高光跟着走，点一下翻面。按稀有度换边框：普通是银框，稀有是紫框镶宝石，传说是金框、皇冠和随倾斜变化的闪膜；揭晓最稀有的那张时加 spotlight，背后转一圈柔光。系统开了「减少动态」时不倾斜、不闪、不转。文字和插画都由产品传入。',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 200, padding: 24, perspective: 1000 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    rarity: 'common',
    title: 'Prompt',
    caption: 'What you ask the model to do.',
    setLabel: 'AI basics',
    rarityLabel: 'New',
    pips: { filled: 1, total: 3 },
    label: 'Prompt: just collected. Tap to turn over',
  },
} satisfies Meta<typeof GameCollectibleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Common: Story = { args: { sticker: 'NEW!' } };
export const Rare: Story = {
  args: {
    rarity: 'rare',
    title: 'Hallucination',
    caption: 'Sounds true, is made up.',
    rarityLabel: 'Known',
    pips: { filled: 2, total: 3 },
    label: 'Hallucination: remembered. Tap to turn over',
  },
};
export const Legendary: Story = {
  args: {
    rarity: 'legendary',
    title: 'Multimodal',
    caption: 'Reads pictures and sound, not only words.',
    rarityLabel: 'Shining',
    pips: { filled: 3, total: 3 },
    spotlight: true,
    label: 'Multimodal: remembered three weeks on. Tap to turn over',
  },
};
export const FaceDown: Story = { args: { defaultFaceDown: true } };
export const Uncollected: Story = {
  render: () => <GameCollectibleCardSlot label="Unlocks at lesson 9" />,
};

function OptionalOrientationCard() {
  const orientation = useGameCardOrientation();
  return (
    <>
      <GameCollectibleCard
        rarity="legendary"
        title="Optional tilt"
        label="Optional tilt: tap to turn"
        tilt={orientation.tilt}
      />
      <p role="status">{orientation.status}</p>
      <GameButton
        disabled={
          orientation.reducedMotion ||
          orientation.status === 'unavailable' ||
          orientation.status === 'requesting'
        }
        onClick={() =>
          orientation.status === 'enabled' ? orientation.disable() : void orientation.enable()
        }
      >
        {orientation.status === 'enabled' ? 'Turn off device tilt' : 'Enable device tilt'}
      </GameButton>
    </>
  );
}
export const OptionalDeviceTilt: Story = { render: () => <OptionalOrientationCard /> };
