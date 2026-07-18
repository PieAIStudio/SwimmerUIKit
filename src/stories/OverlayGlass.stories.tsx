import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';

import {
  GameAssetIcon,
  GameBadge,
  GameButton,
  GameHud,
  GameHudActions,
  GameIconButton,
  GamePanel,
  GameProgress,
  GAME_UI_OVERLAY,
} from '../index';

/**
 * Official overlay-glass HUD tone for controls that float over a live scene.
 * Compare default clay vs glass (+ compact density) on a busy stage backdrop.
 */
const meta = {
  title: 'Clay/Themes/OverlayGlass',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '场景叠加 HUD 的官方 glass 语气。在任意容器上挂 `data-game-ui-tone="glass"`（或 class `game-ui-overlay-scope`），可选再加 `data-game-ui-density="compact"` 收紧触控高度。',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const busyStageStyle: CSSProperties = {
  position: 'relative',
  minHeight: 420,
  overflow: 'hidden',
  padding: 16,
  display: 'grid',
  gap: 12,
  alignContent: 'space-between',
  background: `
    radial-gradient(ellipse at 18% 22%, rgba(240, 164, 106, 0.45), transparent 28%),
    radial-gradient(circle at 78% 18%, rgba(126, 224, 182, 0.35), transparent 26%),
    radial-gradient(circle at 62% 72%, rgba(91, 140, 220, 0.4), transparent 30%),
    linear-gradient(160deg, #40543c 0%, #2d3a2d 42%, #1a1410 100%),
    repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.05) 0 1px,
      transparent 1px 48px
    ),
    repeating-linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.04) 0 1px,
      transparent 1px 48px
    )
  `,
};

function HudCluster({
  title,
  tone,
  density,
  className,
  toolsLabel = 'Tools',
}: {
  title: string;
  tone?: 'glass';
  density?: 'compact';
  className?: string;
  /** Unique accessible name when multiple clusters share a page. */
  toolsLabel?: string;
}): ReactNode {
  const attrs: Record<string, string> = {};
  if (tone) attrs[GAME_UI_OVERLAY.toneAttr] = tone;
  if (density) attrs[GAME_UI_OVERLAY.densityAttr] = density;

  return (
    <div
      className={[className, tone ? GAME_UI_OVERLAY.scopeClass : undefined]
        .filter(Boolean)
        .join(' ')}
      style={busyStageStyle}
      {...attrs}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <GameHud
          label={title}
          items={[
            {
              id: 'role',
              icon: 'lock',
              label: 'You are',
              value: 'Host',
              meta: 'private',
            },
            { id: 'room', icon: 'copy', label: 'Room', value: '74X8VB' },
            { id: 'timer', icon: 'timer', label: 'Reveal', value: '02:46' },
          ]}
          actions={
            <GameHudActions label={toolsLabel}>
              <GameIconButton label={`${title} history`}>
                <GameAssetIcon icon="scroll" size="sm" />
              </GameIconButton>
              <GameIconButton label={`${title} settings`}>
                <GameAssetIcon icon="settings" size="sm" />
              </GameIconButton>
            </GameHudActions>
          }
        />
      </div>

      <GamePanel title={`${title} dialogue`}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <GameBadge tone="ai">LIVE</GameBadge>
          <GameBadge tone="success">READY</GameBadge>
          <GameBadge tone="warning">GATE</GameBadge>
          <GameProgress label={`${title} affinity`} value={68} />
        </div>
        <p style={{ margin: 0, maxWidth: '52ch' }}>
          The scene stays visible through the glass chrome — no heavy clay parchment blocking the
          playfield.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <GameButton variant="primary">Continue</GameButton>
          <GameButton variant="secondary">Emote</GameButton>
          <GameButton variant="ghost">Skip</GameButton>
          <GameButton variant="danger">Leave</GameButton>
        </div>
      </GamePanel>
    </div>
  );
}

export const ClayDefault: Story = {
  name: 'Default clay (control)',
  render: () => <HudCluster title="Default clay HUD" />,
};

export const OverlayGlass: Story = {
  name: 'Overlay glass + compact',
  render: () => <HudCluster title="Glass HUD" tone="glass" density="compact" />,
};

export const OverlayGlassOnNightTheme: Story = {
  name: 'Glass nested in night theme',
  render: () => (
    <div data-game-ui-theme="night" style={{ padding: 16, background: '#221812' }}>
      <HudCluster title="Glass over night" tone="glass" density="compact" />
    </div>
  ),
};

export const SideBySide: Story = {
  name: 'Clay vs glass side-by-side',
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 16,
        padding: 16,
        background: 'var(--game-ui-bg, #f3e8d8)',
      }}
    >
      <div>
        <p style={{ margin: '0 0 8px', fontWeight: 800 }}>Default clay</p>
        <HudCluster title="Clay control HUD" toolsLabel="Clay tools" />
      </div>
      <div>
        <p style={{ margin: '0 0 8px', fontWeight: 800 }}>
          data-game-ui-tone=&quot;glass&quot; + compact
        </p>
        <HudCluster title="Glass HUD" tone="glass" density="compact" toolsLabel="Glass tools" />
      </div>
    </div>
  ),
};
