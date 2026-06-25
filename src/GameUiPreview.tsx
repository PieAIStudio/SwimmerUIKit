import { useEffect, type ReactNode } from 'react';

import { GameAssetIcon, GameBadge, GameCardFan, GameHud, GameLanguageMenu, GameLoadingState, GameOrientationGate, GameStageTile } from './ClayComponents';
import { FirstSessionHud, FirstSessionOnboarding } from './FirstSessionGameShell';
import { GameButton } from './GameButton';
import { GameDialog } from './GameDialog';
import { GameHistoryPanel } from './GameHistoryPanel';
import { GameHudActions } from './GameHudActions';
import { GameIconButton, GamePanel, GameRadialMenu, GameSegmentedControl, GameSlider, GameTabs, GameToast, GameToggle, GameTooltip } from './GameSurfaces';
import { CLAY_ASSETS } from './clay/assets';
import { CLAY_ASSET_SIZE_TOKENS, CLAY_COLOR_TOKENS, CLAY_ELEVATION_TOKENS, CLAY_LAYER_TOKENS, CLAY_MOTION_TOKENS, CLAY_RADIUS_TOKENS, CLAY_SEMANTIC_TOKENS, CLAY_SPACE_TOKENS, CLAY_TARGET_TOKENS, CLAY_TYPE_TOKENS } from './clay/tokens';
import { GAME_UI_PREVIEW_MESSAGES } from './previewStates';

const tokenGroups = [
  { id: 'colors', tokens: CLAY_COLOR_TOKENS },
  { id: 'semantic', tokens: CLAY_SEMANTIC_TOKENS },
  { id: 'typography', tokens: CLAY_TYPE_TOKENS },
  { id: 'spacing', tokens: CLAY_SPACE_TOKENS },
  { id: 'radius', tokens: CLAY_RADIUS_TOKENS },
  { id: 'elevation', tokens: CLAY_ELEVATION_TOKENS },
  { id: 'motion', tokens: CLAY_MOTION_TOKENS },
  { id: 'layers', tokens: CLAY_LAYER_TOKENS },
  { id: 'targets', tokens: CLAY_TARGET_TOKENS },
  { id: 'assetSizing', tokens: CLAY_ASSET_SIZE_TOKENS },
] as const;

function TokenGroup({ id, tokens }: { id: string; tokens: Readonly<Record<string, string | number>> }): ReactNode {
  return (
    <article className="game-ui-token-card">
      <h3>{id}</h3>
      <div className="game-ui-token-grid">
        {Object.entries(tokens).map(([name, value]) => (
          <div className="game-ui-token-row" key={name}>
            <span>{name}</span>
            <code>{String(value)}</code>
          </div>
        ))}
      </div>
    </article>
  );
}

function TokenSwatches(): ReactNode {
  return (
    <div aria-label="Clay color swatches" className="game-ui-swatch-grid">
      {Object.entries(CLAY_COLOR_TOKENS).map(([name, value]) => (
        <figure className="game-ui-swatch" key={name}>
          <span style={{ background: value }} />
          <figcaption>
            <strong>{name}</strong>
            <code>{value}</code>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function TypographyScale(): ReactNode {
  return (
    <div className="game-ui-type-scale">
      <p className="game-ui-type-kicker">Round status</p>
      <h1>One of us isn’t.</h1>
      <h2>Read the table, vote, reveal.</h2>
      <p>Clay UI text remains DOM-rendered for localization and accessibility while the game world stays visible underneath.</p>
      <small>Reduced-motion keeps texture, shadow, and hierarchy but removes non-essential movement.</small>
    </div>
  );
}

function ButtonStates(): ReactNode {
  return (
    <GamePanel title="Buttons and controls" tone="strong">
      <div className="game-ui-component-row">
        <GameButton variant="primary">Open my own table</GameButton>
        <GameButton variant="secondary">Use room code</GameButton>
        <GameButton variant="ghost">Continue as host</GameButton>
        <GameButton variant="success">Ready up</GameButton>
        <GameButton variant="danger">Leave table</GameButton>
        <GameButton disabled variant="secondary">Waiting</GameButton>
      </div>
      <div className="game-ui-component-row">
        <GameTooltip label="Compact settings affordance">
          <GameIconButton label="Settings"><GameAssetIcon icon="settings" size="sm" /></GameIconButton>
        </GameTooltip>
        <GameIconButton label="Copy invite"><GameAssetIcon icon="copy" size="sm" /></GameIconButton>
        <GameBadge tone="ai">AI?</GameBadge>
        <GameBadge tone="success">Ready</GameBadge>
        <GameBadge tone="warning">Host gate</GameBadge>
      </div>
      <GameSegmentedControl activeId="live" label="Preview mode" options={[{ id: 'daily', label: 'Daily' }, { id: 'live', label: 'Live room' }, { id: 'tokens', label: 'Tokens' }]} />
      <GameTabs activeId="portal" tabs={[{ id: 'portal', label: 'Portal' }, { id: 'vote', label: 'Vote' }, { id: 'history', label: 'History' }]} />
      <GameRadialMenu items={[{ id: 'wave', label: 'Wave' }, { id: 'think', label: 'Think' }, { id: 'doubt', label: 'Doubt' }]} label="Emote wheel" />
      <GameSlider label="Effects volume" max={100} min={0} value={68} />
      <GameToggle checked label="Sound on" />
    </GamePanel>
  );
}

function HudAndStage(): ReactNode {
  return (
    <div className="game-ui-stage-demo">
      <div aria-label="Clay world HUD preview" className="game-ui-stage-world">
        <GameHud
          label="Persistent HUD cluster"
          items={[{ id: 'role', icon: 'lock', label: 'You are', value: 'Resistance', meta: 'private' }, { id: 'room', icon: 'copy', label: 'Room', value: '74X8VB' }, { id: 'timer', icon: 'timer', label: 'Reveal', value: '02:46' }]}
          actions={(
            <GameHudActions label="HUD tools">
              <GameIconButton label="History"><GameAssetIcon icon="scroll" size="sm" /></GameIconButton>
              <GameIconButton label="Settings"><GameAssetIcon icon="settings" size="sm" /></GameIconButton>
            </GameHudActions>
          )}
        />
        <div aria-hidden="true" className="game-ui-table-prop">
          <span className="game-ui-seat is-host" />
          <span className="game-ui-seat is-guest-a" />
          <span className="game-ui-seat is-guest-b" />
          <span className="game-ui-callout is-a">Too perfect.</span>
          <span className="game-ui-callout is-b">Maybe.</span>
        </div>
        <div className="game-ui-input-strip">
          <GameButton variant="secondary">😀 Emote</GameButton>
          <GameButton variant="primary">Send read</GameButton>
        </div>
      </div>
      <div className="game-ui-stage-sidecar">
        <GameStageTile badge="solo" icon="scroll" kicker="Daily" selected summary="Read one case, pick the AI, share the result." title="Daily Turing Challenge" tone="daily" />
        <GameStageTile badge="free guests" icon="portal" kicker="Portal" summary="Enter a code, resume a table, or open your own." title="Tavern Portal" tone="portal" />
        <GameStageTile icon="energy" kicker="Host Gate" summary="Only hosts see account and battery checks. Guests never do." title="Open my own table" tone="host" />
      </div>
    </div>
  );
}

function ModalAndStates(): ReactNode {
  return (
    <div className="game-ui-preview-two-up">
      <GameDialog title="Host Gate">
        <p>Open your own table as host. Guests join free through your invite link or code.</p>
        <GameHudActions label="Host gate actions">
          <GameButton variant="primary">Confirm host table</GameButton>
          <GameButton variant="ghost">Back to Portal</GameButton>
        </GameHudActions>
      </GameDialog>
      <GamePanel title="Toast / loading / error" tone="strong">
        <GameToast tone="success">Seat confirmed. Waiting for the table host.</GameToast>
        <GameToast tone="danger">That room code expired. Ask for a fresh Portal link.</GameToast>
        <GameLoadingState label="Opening the tavern portal..." />
        <GameLoadingState label="The portal could not reach the tavern." tone="error" />
      </GamePanel>
    </div>
  );
}

function CardAndAssetSamples(): ReactNode {
  return (
    <div className="game-ui-preview-two-up">
      <GamePanel title="Card fan" tone="strong">
        <GameCardFan label="Reveal card fan" cards={[{ id: 'human', icon: 'home', kicker: 'Human', title: 'Mika' }, { id: 'ai', icon: 'ai', kicker: 'AI', title: 'River' }, { id: 'sympathizer', icon: 'crown', kicker: 'Sympathizer', title: 'Noa' }]} />
      </GamePanel>
      <GamePanel title="Asset inventory reference" tone="strong">
        <p className="game-ui-small-copy">The kit exports source asset paths and inline SVG fallbacks. Source inventory includes:</p>
        <div className="game-ui-asset-path-grid">
          <code>{CLAY_ASSETS.catalog.manifest}</code>
          <code>{CLAY_ASSETS.catalog.sourceCatalog}</code>
          <code>{CLAY_ASSETS.buttons.primary}</code>
          <code>{CLAY_ASSETS.icons.trophy}</code>
        </div>
      </GamePanel>
    </div>
  );
}

function FirstSessionSamples(): ReactNode {
  const labels = {
    controls: 'First session controls',
    emote: 'Emote',
    goalLabel: 'Goal',
    goalValue: 'Find the AI',
    history: 'History',
    hud: 'First session HUD',
    input: 'Type a read',
    moveBadge: 'Move',
    move: 'Drag to inspect the table',
    roomLabel: 'Room',
    roomValue: 'Portal',
    roleLabel: 'Role',
    roleValue: 'Guest',
    settings: 'Settings',
    shell: 'First session shell',
    timerLabel: 'Timer',
    timerValue: '02:46',
    tools: 'Player tools',
    wardrobe: 'Wardrobe',
  };
  return (
    <div className="game-ui-first-session-preview">
      <div className="game-ui-first-session-world">
        <FirstSessionHud authenticated batteryCount={5} dailyStreak={3} labels={labels} onHistory={() => undefined} onSettings={() => undefined} onWardrobe={() => undefined} playerName="Guest 74" />
      </div>
      <div className="game-ui-first-session-modal-slot">
        <FirstSessionOnboarding
          open
          onDismiss={() => undefined}
          labels={{
            badge: 'First table',
            body: 'The package keeps onboarding copy injectable so the host app owns product language and routing.',
            skip: 'Skip',
            start: 'Start playing',
            title: 'Learn the table in 30 seconds',
            steps: [
              { title: 'Move', body: 'Look around the clay table.' },
              { title: 'Read', body: 'Notice who sounds too clean.' },
              { title: 'Vote', body: 'Lock your guess before reveal.' },
            ],
          }}
        />
      </div>
    </div>
  );
}

function ResponsiveProofFrames(): ReactNode {
  return (
    <div className="game-ui-proof-frames">
      <article className="game-ui-proof-frame is-desktop">
        <header><GameBadge>desktop</GameBadge><strong>1440×900</strong></header>
        <HudAndStage />
      </article>
      <article className="game-ui-proof-frame is-mobile-landscape">
        <header><GameBadge>mobile landscape</GameBadge><strong>844×390</strong></header>
        <HudAndStage />
      </article>
    </div>
  );
}

export interface GameUiPreviewProps {
  title?: string;
  body?: string;
}

export function GameUiPreview({ title = 'Clay game UI kit', body = 'Self-contained React 19 + TypeScript + Tailwind v4 token surface extracted from TuringPact. Tokens are CSS variables and the components do not depend on TuringPact stores or i18n.' }: GameUiPreviewProps): ReactNode {
  useEffect(() => {
    document.documentElement.dataset.gameUiPreview = 'clay';
    return () => {
      delete document.documentElement.dataset.gameUiPreview;
    };
  }, []);

  return (
    <main aria-label="Swimmer UI Kit clay preview" className="game-ui-preview game-ui-clay-preview">
      <header className="game-ui-preview-hero">
        <GameBadge tone="ai">@pieai/swimmer-ui-kit</GameBadge>
        <GameLanguageMenu currentLabel="EN" label="Preview language menu" options={[{ id: 'en', label: 'English', meta: 'DOM UI labels' }, { id: 'zh-CN', label: '简体中文', meta: 'Host app owned copy' }]} />
        <h1>{title}</h1>
        <p>{body}</p>
      </header>

      <section aria-labelledby="game-ui-preview-token-title" className="game-ui-preview-section">
        <h2 id="game-ui-preview-token-title">Tokens</h2>
        <TokenSwatches />
        <div className="game-ui-token-ledger">{tokenGroups.map((group) => <TokenGroup key={group.id} id={group.id} tokens={group.tokens} />)}</div>
      </section>

      <section aria-labelledby="game-ui-preview-type-title" className="game-ui-preview-section">
        <h2 id="game-ui-preview-type-title">Typography scale</h2>
        <TypographyScale />
      </section>

      <section aria-labelledby="game-ui-preview-components-title" className="game-ui-preview-section">
        <h2 id="game-ui-preview-components-title">Component surface</h2>
        <ButtonStates />
        <HudAndStage />
        <ModalAndStates />
        <CardAndAssetSamples />
        <GameHistoryPanel entries={GAME_UI_PREVIEW_MESSAGES} label="Round history" />
      </section>

      <section aria-labelledby="game-ui-preview-first-session-title" className="game-ui-preview-section">
        <h2 id="game-ui-preview-first-session-title">First-session shell</h2>
        <FirstSessionSamples />
      </section>

      <section aria-labelledby="game-ui-preview-orientation-title" className="game-ui-preview-section">
        <h2 id="game-ui-preview-orientation-title">Orientation gate preview</h2>
        <GameOrientationGate body="Clay game surfaces are tuned for a landscape table. Rotate before live chat so keyboard, emotes, and vote rail do not crush the playfield." cta="Try landscape" preview title="Please rotate your device" />
      </section>

      <section aria-labelledby="game-ui-preview-responsive-title" className="game-ui-preview-section">
        <h2 id="game-ui-preview-responsive-title">Responsive proof targets</h2>
        <ResponsiveProofFrames />
      </section>
    </main>
  );
}
