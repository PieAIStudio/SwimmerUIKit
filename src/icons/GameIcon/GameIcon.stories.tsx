import type { Meta, StoryObj } from '@storybook/react-vite';
import { GameIcon } from './GameIcon';
import { GAME_ICON_NAMES } from '../registry';
const meta = {
  title: 'Swimmer/Icons/GameIcon',
  component: GameIcon,
  args: { icon: 'check', label: 'Completed' },
} satisfies Meta<typeof GameIcon>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <GameIcon key={size} icon="crown" size={size} label={size} />
      ))}
    </div>
  ),
};
export const AllIcons: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(100px,1fr))',
        gap: 20,
      }}
    >
      {GAME_ICON_NAMES.map((icon) => (
        <figure key={icon} style={{ margin: 0, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <GameIcon icon={icon} size="lg" />
          <figcaption>{icon}</figcaption>
        </figure>
      ))}
    </div>
  ),
};
