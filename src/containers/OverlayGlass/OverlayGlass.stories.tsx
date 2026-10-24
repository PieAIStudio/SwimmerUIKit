import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';

import { Icon, Badge, Button, HudActions, IconButton, Panel, Progress } from '../../index';
import { GAME_UI_OVERLAY } from '../../tokens/index';

/**
 * Official overlay-glass HUD tone for controls that float over a live scene.
 * Compare default flat vs glass (+ compact density) on a busy stage backdrop.
 */
const meta = {
  title: 'Swimmer/Themes/OverlayGlass',
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
  primaryAction = true,
}: {
  title: string;
  tone?: 'glass';
  density?: 'compact';
  className?: string;
  /** Unique accessible name when multiple clusters share a page. */
  toolsLabel?: string;
  /** A comparison of containers is not two competing next steps. */
  primaryAction?: boolean;
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
        <HudActions label={toolsLabel}>
          <IconButton label={`${title} history`}>
            <Icon icon="scroll" size="sm" />
          </IconButton>
          <IconButton label={`${title} settings`}>
            <Icon icon="settings" size="sm" />
          </IconButton>
        </HudActions>
      </div>

      <Panel title={`${title} dialogue`}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <Badge tone="ai">LIVE</Badge>
          <Badge tone="success">READY</Badge>
          <Badge tone="warning">GATE</Badge>
          <Progress label={`${title} affinity`} value={68} />
        </div>
        <p style={{ margin: 0, maxWidth: '52ch' }}>
          The scene stays visible through the glass chrome — no heavy flat parchment blocking the
          playfield.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Button variant={primaryAction ? 'primary' : 'secondary'}>Continue</Button>
          <Button variant="secondary">Emote</Button>
          <Button variant="ghost">Skip</Button>
          <Button variant="danger">Leave</Button>
        </div>
      </Panel>
    </div>
  );
}

export const FlatDefault: Story = {
  name: 'Default flat (control)',
  render: () => <HudCluster title="Default flat HUD" />,
};

export const OverlayGlass: Story = {
  name: 'Overlay glass + compact',
  render: () => <HudCluster title="Glass HUD" tone="glass" density="compact" />,
};

export const OverlayGlassOnDarkTheme: Story = {
  name: 'Glass nested in dark theme',
  render: () => (
    <div data-game-ui-theme="dark" style={{ padding: 16, background: '#221812' }}>
      {/* Preserve fixture display copy, not the removed theme value, until S4. */}
      <HudCluster title="Glass over dark" tone="glass" density="compact" />
    </div>
  ),
};

export const SideBySide: Story = {
  name: 'Flat vs glass side-by-side',
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 16,
        padding: 16,
        background: 'var(--swimmer-game-bg, #f3e8d8)',
      }}
    >
      <div>
        <p style={{ margin: '0 0 8px', fontWeight: 800 }}>Default flat</p>
        <HudCluster title="Flat control HUD" toolsLabel="Flat tools" primaryAction={false} />
      </div>
      <div>
        <p style={{ margin: '0 0 8px', fontWeight: 800 }}>
          data-game-ui-tone=&quot;glass&quot; + compact
        </p>
        <HudCluster
          title="Glass HUD"
          tone="glass"
          density="compact"
          toolsLabel="Glass tools"
          primaryAction={false}
        />
      </div>
    </div>
  ),
};
