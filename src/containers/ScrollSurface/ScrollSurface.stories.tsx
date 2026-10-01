import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Clay/Utilities/ScrollSurface',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The opt-in scroll-surface hook gives a product-owned overflow container the same semantic clay scrollbar treatment as kit-owned panels.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const LongForm: Story = {
  render: () => (
    <div
      aria-label="Long-form scroll surface"
      className="game-ui-scroll-surface"
      role="region"
      tabIndex={0}
      style={{
        maxHeight: '180px',
        overflow: 'auto',
        border: '1px solid var(--game-ui-border-strong)',
        borderRadius: 'var(--game-ui-radius-card)',
        background: 'var(--game-ui-panel)',
        padding: 'var(--game-ui-space-12)',
      }}
    >
      {Array.from({ length: 12 }, (_, index) => (
        <p key={index} style={{ margin: index === 0 ? 0 : 'var(--game-ui-space-12) 0 0' }}>
          A long-form scroll surface keeps the track quiet and the thumb legible. Entry {index + 1}.
        </p>
      ))}
    </div>
  ),
};
