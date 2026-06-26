import { useEffect, useState, type ReactNode } from 'react';

import { GameAssetIcon, GameBadge, GameCardFan, GameHud, GameLanguageMenu, GameLoadingState, GameOrientationGate, GameStageTile } from './ClayComponents';
import { FirstSessionHud, FirstSessionOnboarding } from './FirstSessionGameShell';
import { GameAvatar, GameEmptyState, GameProgress } from './GameDisplay';
import { GameButton } from './GameButton';
import { GameCheckbox, GameField, GameInput, GameTextArea } from './GameForms';
import { GameDialog } from './GameDialog';
import { GameHistoryPanel } from './GameHistoryPanel';
import { GameHudActions } from './GameHudActions';
import { GameIconButton, GamePanel, GameRadialMenu, GameSegmentedControl, GameSlider, GameTabs, GameToast, GameToggle, GameTooltip } from './GameSurfaces';
import { CLAY_ASSETS, CLAY_ICON_NAMES, getClayIconStyles, type ClayIconName, type ClayIconStyle } from './clay/assets';
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

interface StageTileCopy {
  kicker: string;
  title: string;
  summary: string;
}

interface BadgedStageTileCopy extends StageTileCopy {
  badge: string;
}

interface StageTilesCopy {
  daily: BadgedStageTileCopy;
  portal: BadgedStageTileCopy;
  host: StageTileCopy;
}

const DEFAULT_STAGE_TILES: StageTilesCopy = {
  daily: { badge: 'solo', kicker: 'Daily', title: 'Daily Turing Challenge', summary: 'Read one case, pick the AI, share the result.' },
  portal: { badge: 'free guests', kicker: 'Portal', title: 'Tavern Portal', summary: 'Enter a code, resume a table, or open your own.' },
  host: { kicker: 'Host Gate', title: 'Open my own table', summary: 'Only hosts see account and battery checks. Guests never do.' },
};

function HudAndStage({ tiles = DEFAULT_STAGE_TILES }: { tiles?: StageTilesCopy } = {}): ReactNode {
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
        <GameStageTile badge={tiles.daily.badge} icon="scroll" kicker={tiles.daily.kicker} selected summary={tiles.daily.summary} title={tiles.daily.title} tone="daily" />
        <GameStageTile badge={tiles.portal.badge} icon="portal" kicker={tiles.portal.kicker} summary={tiles.portal.summary} title={tiles.portal.title} tone="portal" />
        <GameStageTile icon="energy" kicker={tiles.host.kicker} summary={tiles.host.summary} title={tiles.host.title} tone="host" />
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

interface FormsCopy {
  formsTitle: string;
  roomCodeLabel: string;
  roomCodeHint: string;
  roomCodePlaceholder: string;
  nameLabel: string;
  namePlaceholder: string;
  readLabel: string;
  readPlaceholder: string;
  readError: string;
  rememberLabel: string;
  displayTitle: string;
  revealLabel: string;
  batteryLabel: string;
  emptyTitle: string;
  emptyBody: string;
  emptyCta: string;
}

function FormsAndDisplay({ copy }: { copy: FormsCopy }): ReactNode {
  return (
    <div className="game-ui-preview-two-up">
      <GamePanel title={copy.formsTitle} tone="strong">
        <GameField hint={copy.roomCodeHint} label={copy.roomCodeLabel}>
          <GameInput placeholder={copy.roomCodePlaceholder} />
        </GameField>
        <GameField label={copy.nameLabel} required>
          <GameInput placeholder={copy.namePlaceholder} />
        </GameField>
        <GameField error={copy.readError} label={copy.readLabel}>
          <GameTextArea invalid placeholder={copy.readPlaceholder} />
        </GameField>
        <GameCheckbox defaultChecked label={copy.rememberLabel} />
      </GamePanel>
      <GamePanel title={copy.displayTitle} tone="strong">
        <div className="game-ui-component-row">
          <GameAvatar name="Mika Ono" status="online" />
          <GameAvatar name="River" size="lg" status="busy" />
          <GameAvatar name="Noa" status="away" />
          <GameAvatar name="Guest 74" size="sm" />
        </div>
        <GameProgress label={copy.revealLabel} showValue value={64} />
        <GameProgress label={copy.batteryLabel} max={20} showValue tone="success" value={14} />
        <GameEmptyState
          action={<GameButton variant="primary">{copy.emptyCta}</GameButton>}
          description={copy.emptyBody}
          icon="scroll"
          title={copy.emptyTitle}
        />
      </GamePanel>
    </div>
  );
}

interface IconGalleryCopy {
  gameLabel: string;
  gameHint: string;
  lineLabel: string;
  lineHint: string;
}

// Split the catalog once: which semantic icons exist as sculpted game objects,
// and which as flat line glyphs. Some icons live in only one family.
const GAME_ICON_NAMES = CLAY_ICON_NAMES.filter((name) => getClayIconStyles(name).includes('game'));
const LINE_ICON_NAMES = CLAY_ICON_NAMES.filter((name) => getClayIconStyles(name).includes('line'));

function IconFamilyGrid({ names, style }: { names: readonly ClayIconName[]; style: ClayIconStyle }): ReactNode {
  return (
    <div className="game-ui-icon-grid">
      {names.map((name) => (
        <figure className="game-ui-icon-cell" key={`${style}-${name}`}>
          <GameAssetIcon icon={name} size="lg" style={style} />
          <figcaption>{name}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function IconGallery({ copy }: { copy: IconGalleryCopy }): ReactNode {
  return (
    <div className="game-ui-icon-gallery">
      <section className="game-ui-icon-family">
        <header className="game-ui-icon-family-head">
          <GameBadge tone="success">{copy.gameLabel}</GameBadge>
          <p className="game-ui-small-copy">{copy.gameHint}</p>
        </header>
        <IconFamilyGrid names={GAME_ICON_NAMES} style="game" />
      </section>
      <section className="game-ui-icon-family">
        <header className="game-ui-icon-family-head">
          <GameBadge>{copy.lineLabel}</GameBadge>
          <p className="game-ui-small-copy">{copy.lineHint}</p>
        </header>
        <IconFamilyGrid names={LINE_ICON_NAMES} style="line" />
      </section>
    </div>
  );
}

type PreviewLang = 'en' | 'zh-CN';

interface PreviewCopy {
  triggerLabel: string;
  langMenuLabel: string;
  heroTitle: string;
  heroBody: string;
  iconsTitle: string;
  iconsIntro: string;
  componentsTitle: string;
  formsSectionTitle: string;
  gallery: IconGalleryCopy;
  tiles: StageTilesCopy;
  forms: FormsCopy;
}

const PREVIEW_COPY: Record<PreviewLang, PreviewCopy> = {
  en: {
    triggerLabel: 'EN',
    langMenuLabel: 'Preview language',
    heroTitle: 'Clay game UI kit',
    heroBody:
      'Self-contained React 19 + TypeScript + Tailwind v4 token surface extracted from TuringPact. Tokens are CSS variables and the components do not depend on TuringPact stores or i18n.',
    iconsTitle: 'Icon families',
    iconsIntro: 'Every icon ships in two families. Cards default to the sculpted game family; the flat line family is the utility alternate.',
    componentsTitle: 'Component surface',
    formsSectionTitle: 'Forms, inputs and status',
    gallery: {
      gameLabel: 'Game · primary',
      gameHint: 'Sculpted, colorful clay objects — the default, on-brand look for anything a player sees.',
      lineLabel: 'Line · alternate',
      lineHint: 'Flat white glyphs for dense toolbars or when a sculpted object would feel too heavy.',
    },
    tiles: DEFAULT_STAGE_TILES,
    forms: {
      formsTitle: 'Join a table',
      roomCodeLabel: 'Room code',
      roomCodeHint: 'Ask the host for the 6-character code.',
      roomCodePlaceholder: '74X8VB',
      nameLabel: 'Display name',
      namePlaceholder: 'How should the table see you?',
      readLabel: 'Your read',
      readPlaceholder: 'Type why this one feels human…',
      readError: 'A read needs at least a few words.',
      rememberLabel: 'Remember me on this device',
      displayTitle: 'Players and status',
      revealLabel: 'Reveal countdown',
      batteryLabel: 'Batteries',
      emptyTitle: 'No open tables yet',
      emptyBody: 'Be the first to host. Guests join free through your invite.',
      emptyCta: 'Open my own table',
    },
  },
  'zh-CN': {
    triggerLabel: '中',
    langMenuLabel: '预览语言',
    heroTitle: '黏土游戏 UI 套件',
    heroBody:
      '从图灵密约抽取的自包含 React 19 + TypeScript + Tailwind v4 设计令牌层。令牌即 CSS 变量,组件不依赖图灵密约的状态库或 i18n。',
    iconsTitle: '图标双族',
    iconsIntro: '每个图标都有两族。卡片默认用立体游戏风,扁平线性风是工具型备选。',
    componentsTitle: '组件总览',
    formsSectionTitle: '表单、输入与状态',
    gallery: {
      gameLabel: '游戏风 · 主用',
      gameHint: '立体、彩色的黏土实物。玩家能看到的地方默认都用这一族,最贴合品牌。',
      lineLabel: '线性 · 备选',
      lineHint: '扁平白色线条图标,适合密集工具栏,或立体图标显得太重的场合。',
    },
    tiles: {
      daily: { badge: '单人', kicker: '每日', title: '每日图灵挑战', summary: '读一个案例,指认 AI,分享结果。' },
      portal: { badge: '免费加入', kicker: '传送门', title: '酒馆传送门', summary: '输入房号、恢复牌桌,或自己开一桌。' },
      host: { kicker: '房主门槛', title: '开我自己的牌桌', summary: '只有房主看到账号与电量校验,客人永远看不到。' },
    },
    forms: {
      formsTitle: '加入牌桌',
      roomCodeLabel: '房间号',
      roomCodeHint: '向房主要 6 位房间号。',
      roomCodePlaceholder: '74X8VB',
      nameLabel: '显示昵称',
      namePlaceholder: '牌桌上别人怎么称呼你?',
      readLabel: '你的判断',
      readPlaceholder: '说说为什么觉得这个是真人…',
      readError: '判断至少要写几个字。',
      rememberLabel: '在此设备上记住我',
      displayTitle: '玩家与状态',
      revealLabel: '揭晓倒计时',
      batteryLabel: '电量',
      emptyTitle: '还没有开放的牌桌',
      emptyBody: '来当第一个房主吧。客人通过你的邀请免费加入。',
      emptyCta: '开我自己的牌桌',
    },
  },
};

export interface GameUiPreviewProps {
  title?: string;
  body?: string;
}

export function GameUiPreview({ title, body }: GameUiPreviewProps): ReactNode {
  const [lang, setLang] = useState<PreviewLang>('en');
  const copy = PREVIEW_COPY[lang];
  const heroTitle = title && lang === 'en' ? title : copy.heroTitle;
  const heroBody = body && lang === 'en' ? body : copy.heroBody;

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
        <GameLanguageMenu
          currentLabel={copy.triggerLabel}
          label={copy.langMenuLabel}
          onSelect={(id) => setLang(id as PreviewLang)}
          options={[{ id: 'en', label: 'English', meta: 'DOM UI labels' }, { id: 'zh-CN', label: '简体中文', meta: 'Host app owned copy' }]}
          value={lang}
        />
        <h1>{heroTitle}</h1>
        <p>{heroBody}</p>
      </header>

      <section aria-labelledby="game-ui-preview-token-title" className="game-ui-preview-section">
        <h2 id="game-ui-preview-token-title">Tokens</h2>
        <TokenSwatches />
        <div className="game-ui-token-ledger">{tokenGroups.map((group) => <TokenGroup key={group.id} id={group.id} tokens={group.tokens} />)}</div>
      </section>

      <section aria-labelledby="game-ui-preview-icons-title" className="game-ui-preview-section">
        <h2 id="game-ui-preview-icons-title">{copy.iconsTitle}</h2>
        <p className="game-ui-small-copy">{copy.iconsIntro}</p>
        <IconGallery copy={copy.gallery} />
      </section>

      <section aria-labelledby="game-ui-preview-type-title" className="game-ui-preview-section">
        <h2 id="game-ui-preview-type-title">Typography scale</h2>
        <TypographyScale />
      </section>

      <section aria-labelledby="game-ui-preview-components-title" className="game-ui-preview-section">
        <h2 id="game-ui-preview-components-title">{copy.componentsTitle}</h2>
        <ButtonStates />
        <HudAndStage tiles={copy.tiles} />
        <ModalAndStates />
        <CardAndAssetSamples />
        <GameHistoryPanel entries={GAME_UI_PREVIEW_MESSAGES} label="Round history" />
      </section>

      <section aria-labelledby="game-ui-preview-forms-title" className="game-ui-preview-section">
        <h2 id="game-ui-preview-forms-title">{copy.formsSectionTitle}</h2>
        <FormsAndDisplay copy={copy.forms} />
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
