import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { GameAssetIcon, GameBadge, GameCardFan, GameHud, GameLanguageMenu, GameLoadingState, GameOrientationGate, GameStageTile } from './ClayComponents';
import { FirstSessionHud, FirstSessionOnboarding } from './FirstSessionGameShell';
import { GameAvatar, GameEmptyState, GameProgress } from './GameDisplay';
import { GameButton } from './GameButton';
import { GameCheckbox, GameField, GameInput, GameTextArea } from './GameForms';
import { GameDialog } from './GameDialog';
import { GameHistoryPanel } from './GameHistoryPanel';
import { GameHudActions } from './GameHudActions';
import { GameIconButton, GamePanel, GameRadialMenu, GameSegmentedControl, GameSlider, GameTabs, GameToast, GameToggle, GameTooltip } from './GameSurfaces';
import {
  CLAY_ASSETS,
  CLAY_GAME_SPRITES,
  CLAY_GAME_SPRITE_NAMES,
  CLAY_ICON_NAMES,
  getClayIconStyles,
  type ClayIconName,
  type ClayIconStyle,
} from './clay/assets';
import { CLAY_ASSET_SIZE_TOKENS, CLAY_COLOR_TOKENS, CLAY_ELEVATION_TOKENS, CLAY_LAYER_TOKENS, CLAY_MOTION_TOKENS, CLAY_RADIUS_TOKENS, CLAY_SEMANTIC_TOKENS, CLAY_SPACE_TOKENS, CLAY_TARGET_TOKENS, CLAY_TYPE_TOKENS } from './clay/tokens';
import type { GameUiHistoryEntry } from './GameHistoryPanel';
import { GAME_UI_PREVIEW_MESSAGES } from './previewStates';

const ZH_HISTORY_MESSAGES: readonly GameUiHistoryEntry[] = [
  { id: 'history-human-long', kind: 'human', meta: '第 2 局 · 公开桌', speaker: 'Mika', text: '这个回答像背稿——把每种可能都点了一遍,却从不押一个真实的偏好。' },
  { id: 'history-zh-long', kind: 'mystery', meta: '第 2 局 · 桌边发言', speaker: 'Noa', text: '这段回答太顺了,像是在把所有安全选项都摆出来,却故意不留下能被追问的破绽。' },
  { id: 'history-system', kind: 'system', meta: '即将揭晓', speaker: '牌桌', text: '三票已锁定。再读一轮,仍可能改写这份密约。' },
];

// ---------------------------------------------------------------------------
// Localization. The showcase flips its product-facing copy between EN and 中文
// so reviewers can judge the real Chinese-font layout. NOTE: token keys
// (ink, parchment) and icon names (crown, portal) deliberately stay English —
// they are CODE identifiers you type in your editor, not UI copy.
// ---------------------------------------------------------------------------

type PreviewLang = 'en' | 'zh-CN';

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
interface IconGalleryCopy {
  gameLabel: string;
  gameHint: string;
  lineLabel: string;
  lineHint: string;
  spriteLabel: string;
  spriteHint: string;
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
  guestName: string;
}

interface PreviewCopy {
  triggerLabel: string;
  langMenuLabel: string;
  heroTitle: string;
  heroBody: string;
  sections: { tokens: string; icons: string; typography: string; components: string; forms: string; firstSession: string; orientation: string; responsive: string };
  tokenGroups: Record<string, string>;
  iconsIntro: string;
  gallery: IconGalleryCopy;
  tiles: StageTilesCopy;
  forms: FormsCopy;
  type: { kicker: string; h1: string; h2: string; body: string; small: string };
  buttons: {
    panelTitle: string; openTable: string; useCode: string; continueHost: string; readyUp: string; leaveTable: string; waiting: string;
    settingsTip: string; copyInvite: string; aiBadge: string; readyBadge: string; hostGateBadge: string;
    segmentedLabel: string; segDaily: string; segLive: string; segTokens: string;
    tabsPortal: string; tabsVote: string; tabsHistory: string;
    radialLabel: string; wave: string; think: string; doubt: string;
    sliderLabel: string; toggleLabel: string;
  };
  hud: { label: string; youAre: string; roleValue: string; rolePrivate: string; room: string; reveal: string; tools: string; history: string; settings: string; calloutA: string; calloutB: string; emote: string; sendRead: string };
  modals: { dialogTitle: string; dialogBody: string; actionsLabel: string; confirm: string; back: string; panelTitle: string; toastOk: string; toastErr: string; loading: string; loadingErr: string };
  cards: { fanTitle: string; fanLabel: string; human: string; ai: string; sympathizer: string; assetTitle: string; assetNote: string };
  firstSession: {
    controls: string; emote: string; goalLabel: string; goalValue: string; streak: string; guest: string; history: string; hud: string; input: string; moveBadge: string; move: string;
    roomLabel: string; roomValue: string; roleLabel: string; roleValue: string; settings: string; shell: string; timerLabel: string; tools: string; wardrobe: string; playerName: string;
    obBadge: string; obBody: string; obSkip: string; obStart: string; obTitle: string;
    obMoveT: string; obMoveB: string; obReadT: string; obReadB: string; obVoteT: string; obVoteB: string;
  };
  responsive: { desktop: string; mobileLandscape: string };
  orientation: { title: string; body: string; cta: string; badge: string; hint: string };
  historyLabel: string;
  history: readonly GameUiHistoryEntry[];
}

const PREVIEW_COPY: Record<PreviewLang, PreviewCopy> = {
  en: {
    triggerLabel: 'EN',
    langMenuLabel: 'Preview language',
    heroTitle: 'Clay game UI kit',
    heroBody:
      'Self-contained React 19 + TypeScript + Tailwind v4 token surface extracted from TuringPact. Tokens are CSS variables and the components do not depend on TuringPact stores or i18n.',
    sections: { tokens: 'Tokens', icons: 'Icon families', typography: 'Typography scale', components: 'Component surface', forms: 'Forms, inputs and status', firstSession: 'First-session shell', orientation: 'Orientation gate preview', responsive: 'Responsive proof targets' },
    tokenGroups: { colors: 'colors', semantic: 'semantic', typography: 'typography', spacing: 'spacing', radius: 'radius', elevation: 'elevation', motion: 'motion', layers: 'layers', targets: 'targets', assetSizing: 'asset sizing' },
    iconsIntro: 'Every icon ships in two families. Cards default to the sculpted game family; the flat line family is the utility alternate.',
    gallery: {
      gameLabel: 'Game · primary',
      gameHint: 'Sculpted, colorful clay objects — the default, on-brand look for anything a player sees.',
      lineLabel: 'Line · alternate',
      lineHint: 'Flat white glyphs for dense toolbars or when a sculpted object would feel too heavy.',
      spriteLabel: 'Game sprites · decorative',
      spriteHint: 'Loot, weapons, currency and rewards from the same clay pack. For popups, inventories and win screens — not buttons or toolbars. Kept out of the UI icon set on purpose.',
    },
    tiles: {
      daily: { badge: 'solo', kicker: 'Daily', title: 'Daily Turing Challenge', summary: 'Read one case, pick the AI, share the result.' },
      portal: { badge: 'free guests', kicker: 'Portal', title: 'Tavern Portal', summary: 'Enter a code, resume a table, or open your own.' },
      host: { kicker: 'Host Gate', title: 'Open my own table', summary: 'Only hosts see account and battery checks. Guests never do.' },
    },
    forms: {
      formsTitle: 'Join a table', roomCodeLabel: 'Room code', roomCodeHint: 'Ask the host for the 6-character code.', roomCodePlaceholder: '74X8VB',
      nameLabel: 'Display name', namePlaceholder: 'How should the table see you?', readLabel: 'Your read', readPlaceholder: 'Type why this one feels human…',
      readError: 'A read needs at least a few words.', rememberLabel: 'Remember me on this device', displayTitle: 'Players and status',
      revealLabel: 'Reveal countdown', batteryLabel: 'Batteries', emptyTitle: 'No open tables yet', emptyBody: 'Be the first to host. Guests join free through your invite.', emptyCta: 'Open my own table', guestName: 'Guest 74',
    },
    type: { kicker: 'Round status', h1: 'One of us isn’t.', h2: 'Read the table, vote, reveal.', body: 'Clay UI text remains DOM-rendered for localization and accessibility while the game world stays visible underneath.', small: 'Reduced-motion keeps texture, shadow, and hierarchy but removes non-essential movement.' },
    buttons: {
      panelTitle: 'Buttons and controls', openTable: 'Open my own table', useCode: 'Use room code', continueHost: 'Continue as host', readyUp: 'Ready up', leaveTable: 'Leave table', waiting: 'Waiting',
      settingsTip: 'Compact settings affordance', copyInvite: 'Copy invite', aiBadge: 'AI?', readyBadge: 'Ready', hostGateBadge: 'Host gate',
      segmentedLabel: 'Preview mode', segDaily: 'Daily', segLive: 'Live room', segTokens: 'Tokens',
      tabsPortal: 'Portal', tabsVote: 'Vote', tabsHistory: 'History', radialLabel: 'Emote wheel', wave: 'Wave', think: 'Think', doubt: 'Doubt',
      sliderLabel: 'Effects volume', toggleLabel: 'Sound on',
    },
    hud: { label: 'Persistent HUD cluster', youAre: 'You are', roleValue: 'Resistance', rolePrivate: 'private', room: 'Room', reveal: 'Reveal', tools: 'HUD tools', history: 'History', settings: 'Settings', calloutA: 'Too perfect.', calloutB: 'Maybe.', emote: '😀 Emote', sendRead: 'Send read' },
    modals: { dialogTitle: 'Host Gate', dialogBody: 'Open your own table as host. Guests join free through your invite link or code.', actionsLabel: 'Host gate actions', confirm: 'Confirm host table', back: 'Back to Portal', panelTitle: 'Toast / loading / error', toastOk: 'Seat confirmed. Waiting for the table host.', toastErr: 'That room code expired. Ask for a fresh Portal link.', loading: 'Opening the tavern portal…', loadingErr: 'The portal could not reach the tavern.' },
    cards: { fanTitle: 'Card fan', fanLabel: 'Reveal card fan', human: 'Human', ai: 'AI', sympathizer: 'Sympathizer', assetTitle: 'Asset inventory reference', assetNote: 'The kit exports source asset paths and inline SVG fallbacks. Source inventory includes:' },
    firstSession: {
      controls: 'First session controls', emote: 'Emote', goalLabel: 'Goal', goalValue: 'Find the AI', streak: 'Daily', guest: 'guest', history: 'History', hud: 'First session HUD', input: 'Type a read', moveBadge: 'Move', move: 'Drag to inspect the table',
      roomLabel: 'Room', roomValue: 'Portal', roleLabel: 'Role', roleValue: 'Guest', settings: 'Settings', shell: 'First session shell', timerLabel: 'Timer', tools: 'Player tools', wardrobe: 'Wardrobe', playerName: 'Guest 74',
      obBadge: 'First table', obBody: 'The package keeps onboarding copy injectable so the host app owns product language and routing.', obSkip: 'Skip', obStart: 'Start playing', obTitle: 'Learn the table in 30 seconds',
      obMoveT: 'Move', obMoveB: 'Look around the clay table.', obReadT: 'Read', obReadB: 'Notice who sounds too clean.', obVoteT: 'Vote', obVoteB: 'Lock your guess before reveal.',
    },
    responsive: { desktop: 'desktop', mobileLandscape: 'mobile landscape' },
    orientation: { title: 'Please rotate your device', body: 'Clay game surfaces are tuned for a landscape table. Rotate before live chat so keyboard, emotes, and vote rail do not crush the playfield.', cta: 'Try landscape', badge: 'Landscape only', hint: 'Rotate manually if this browser blocks automatic landscape lock.' },
    historyLabel: 'Round history',
    history: GAME_UI_PREVIEW_MESSAGES,
  },
  'zh-CN': {
    triggerLabel: '中',
    langMenuLabel: '预览语言',
    heroTitle: '黏土游戏 UI 套件',
    heroBody: '从图灵密约抽取的自包含 React 19 + TypeScript + Tailwind v4 设计令牌层。令牌即 CSS 变量,组件不依赖图灵密约的状态库或 i18n。',
    sections: { tokens: '设计令牌', icons: '图标双族', typography: '字号层级', components: '组件总览', forms: '表单、输入与状态', firstSession: '首次会话外壳', orientation: '横屏门预览', responsive: '响应式验证目标' },
    tokenGroups: { colors: '颜色', semantic: '语义', typography: '字体', spacing: '间距', radius: '圆角', elevation: '阴影', motion: '动效', layers: '层级', targets: '触控目标', assetSizing: '资源尺寸' },
    iconsIntro: '每个图标都有两族。卡片默认用立体游戏风,扁平线性风是工具型备选。',
    gallery: {
      gameLabel: '游戏风 · 主用',
      gameHint: '立体、彩色的黏土实物。玩家能看到的地方默认都用这一族,最贴合品牌。',
      lineLabel: '线性 · 备选',
      lineHint: '扁平白色线条图标,适合密集工具栏,或立体图标显得太重的场合。',
      spriteLabel: '游戏素材 · 装饰',
      spriteHint: '同一套黏土包里的战利品、武器、货币与奖励。用于奖励弹窗、背包、胜利结算等场景,不用于按钮或工具栏。刻意不放进 UI 图标集,以免污染界面词汇。',
    },
    tiles: {
      daily: { badge: '单人', kicker: '每日', title: '每日图灵挑战', summary: '读一个案例,指认 AI,分享结果。' },
      portal: { badge: '免费加入', kicker: '传送门', title: '酒馆传送门', summary: '输入房号、恢复牌桌,或自己开一桌。' },
      host: { kicker: '房主门槛', title: '开我自己的牌桌', summary: '只有房主看到账号与电量校验,客人永远看不到。' },
    },
    forms: {
      formsTitle: '加入牌桌', roomCodeLabel: '房间号', roomCodeHint: '向房主要 6 位房间号。', roomCodePlaceholder: '74X8VB',
      nameLabel: '显示昵称', namePlaceholder: '牌桌上别人怎么称呼你?', readLabel: '你的判断', readPlaceholder: '说说为什么觉得这个是真人…',
      readError: '判断至少要写几个字。', rememberLabel: '在此设备上记住我', displayTitle: '玩家与状态',
      revealLabel: '揭晓倒计时', batteryLabel: '电量', emptyTitle: '还没有开放的牌桌', emptyBody: '来当第一个房主吧。客人通过你的邀请免费加入。', emptyCta: '开我自己的牌桌', guestName: '访客 74',
    },
    type: { kicker: '回合状态', h1: '我们之中有"假"的。', h2: '读牌桌、投票、揭晓。', body: '黏土 UI 文字始终由 DOM 渲染,方便本地化与无障碍,而游戏世界仍透在下方可见。', small: '降低动效会保留质感、阴影与层次,只去掉非必要的运动。' },
    buttons: {
      panelTitle: '按钮与控件', openTable: '开我自己的牌桌', useCode: '用房间号', continueHost: '以房主继续', readyUp: '准备就绪', leaveTable: '离开牌桌', waiting: '等待中',
      settingsTip: '紧凑的设置入口', copyInvite: '复制邀请', aiBadge: 'AI?', readyBadge: '就绪', hostGateBadge: '房主门槛',
      segmentedLabel: '预览模式', segDaily: '每日', segLive: '在线房', segTokens: '令牌',
      tabsPortal: '传送门', tabsVote: '投票', tabsHistory: '历史', radialLabel: '表情轮盘', wave: '挥手', think: '思考', doubt: '怀疑',
      sliderLabel: '音效音量', toggleLabel: '声音开',
    },
    hud: { label: '常驻 HUD 集群', youAre: '你的身份', roleValue: '反抗军', rolePrivate: '私密', room: '房间', reveal: '揭晓', tools: 'HUD 工具', history: '历史', settings: '设置', calloutA: '太完美了。', calloutB: '也许吧。', emote: '😀 表情', sendRead: '发送判断' },
    modals: { dialogTitle: '房主门槛', dialogBody: '以房主身份开自己的牌桌。客人通过你的邀请链接或房号免费加入。', actionsLabel: '房主门槛操作', confirm: '确认开桌', back: '返回传送门', panelTitle: '提示 / 加载 / 错误', toastOk: '座位已确认,正在等待房主。', toastErr: '该房号已过期,请向房主要新的传送门链接。', loading: '正在开启酒馆传送门…', loadingErr: '传送门无法连到酒馆。' },
    cards: { fanTitle: '卡牌扇', fanLabel: '揭晓卡牌扇', human: '真人', ai: 'AI', sympathizer: '同情者', assetTitle: '资源清单参考', assetNote: '套件导出源资源路径与内联 SVG 兜底。源清单包含:' },
    firstSession: {
      controls: '首次会话控件', emote: '表情', goalLabel: '目标', goalValue: '找出 AI', streak: '连续', guest: '访客', history: '历史', hud: '首次会话 HUD', input: '输入判断', moveBadge: '移动', move: '拖动以查看牌桌',
      roomLabel: '房间', roomValue: '传送门', roleLabel: '身份', roleValue: '客人', settings: '设置', shell: '首次会话外壳', timerLabel: '计时', tools: '玩家工具', wardrobe: '衣橱', playerName: '访客 74',
      obBadge: '第一桌', obBody: '套件让引导文案可注入,所以由宿主 App 掌管产品语言与路由。', obSkip: '跳过', obStart: '开始游戏', obTitle: '30 秒学会这一桌',
      obMoveT: '移动', obMoveB: '环顾这张黏土牌桌。', obReadT: '研判', obReadB: '留意谁说得太干净。', obVoteT: '投票', obVoteB: '揭晓前锁定你的判断。',
    },
    responsive: { desktop: '桌面', mobileLandscape: '手机横屏' },
    orientation: { title: '请旋转你的设备', body: '黏土游戏界面是为横屏牌桌调校的。开聊前请先横屏,以免键盘、表情与投票栏挤压牌面。', cta: '试试横屏', badge: '仅限横屏', hint: '若浏览器拦截了自动横屏锁定,请手动旋转。' },
    historyLabel: '回合历史',
    history: ZH_HISTORY_MESSAGES,
  },
};

const CopyContext = createContext<PreviewCopy>(PREVIEW_COPY.en);
const useCopy = (): PreviewCopy => useContext(CopyContext);

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

function TokenGroup({ id, label, tokens }: { id: string; label: string; tokens: Readonly<Record<string, string | number>> }): ReactNode {
  return (
    <article className="game-ui-token-card">
      <h3>{label}</h3>
      <div className="game-ui-token-grid">
        {Object.entries(tokens).map(([name, value]) => (
          <div className="game-ui-token-row" key={`${id}-${name}`}>
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
  const { type } = useCopy();
  return (
    <div className="game-ui-type-scale">
      <p className="game-ui-type-kicker">{type.kicker}</p>
      <h1>{type.h1}</h1>
      <h2>{type.h2}</h2>
      <p>{type.body}</p>
      <small>{type.small}</small>
    </div>
  );
}

function ButtonStates(): ReactNode {
  const { buttons: b } = useCopy();
  return (
    <GamePanel title={b.panelTitle} tone="strong">
      <div className="game-ui-component-row">
        <GameButton variant="primary">{b.openTable}</GameButton>
        <GameButton variant="secondary">{b.useCode}</GameButton>
        <GameButton variant="ghost">{b.continueHost}</GameButton>
        <GameButton variant="success">{b.readyUp}</GameButton>
        <GameButton variant="danger">{b.leaveTable}</GameButton>
        <GameButton disabled variant="secondary">{b.waiting}</GameButton>
      </div>
      <div className="game-ui-component-row">
        <GameTooltip label={b.settingsTip}>
          <GameIconButton label={b.settingsTip}><GameAssetIcon icon="settings" size="sm" /></GameIconButton>
        </GameTooltip>
        <GameIconButton label={b.copyInvite}><GameAssetIcon icon="copy" size="sm" /></GameIconButton>
        <GameBadge tone="ai">{b.aiBadge}</GameBadge>
        <GameBadge tone="success">{b.readyBadge}</GameBadge>
        <GameBadge tone="warning">{b.hostGateBadge}</GameBadge>
      </div>
      <GameSegmentedControl activeId="live" label={b.segmentedLabel} options={[{ id: 'daily', label: b.segDaily }, { id: 'live', label: b.segLive }, { id: 'tokens', label: b.segTokens }]} />
      <GameTabs activeId="portal" tabs={[{ id: 'portal', label: b.tabsPortal }, { id: 'vote', label: b.tabsVote }, { id: 'history', label: b.tabsHistory }]} />
      <GameRadialMenu items={[{ id: 'wave', label: b.wave }, { id: 'think', label: b.think }, { id: 'doubt', label: b.doubt }]} label={b.radialLabel} />
      <GameSlider label={b.sliderLabel} max={100} min={0} value={68} />
      <GameToggle checked label={b.toggleLabel} />
    </GamePanel>
  );
}

function HudAndStage(): ReactNode {
  const { hud, tiles } = useCopy();
  return (
    <div className="game-ui-stage-demo">
      <div aria-label="Clay world HUD preview" className="game-ui-stage-world">
        <GameHud
          label={hud.label}
          items={[{ id: 'role', icon: 'lock', label: hud.youAre, value: hud.roleValue, meta: hud.rolePrivate }, { id: 'room', icon: 'copy', label: hud.room, value: '74X8VB' }, { id: 'timer', icon: 'timer', label: hud.reveal, value: '02:46' }]}
          actions={(
            <GameHudActions label={hud.tools}>
              <GameIconButton label={hud.history}><GameAssetIcon icon="scroll" size="sm" /></GameIconButton>
              <GameIconButton label={hud.settings}><GameAssetIcon icon="settings" size="sm" /></GameIconButton>
            </GameHudActions>
          )}
        />
        <div aria-hidden="true" className="game-ui-table-prop">
          <span className="game-ui-seat is-host" />
          <span className="game-ui-seat is-guest-a" />
          <span className="game-ui-seat is-guest-b" />
          <span className="game-ui-callout is-a">{hud.calloutA}</span>
          <span className="game-ui-callout is-b">{hud.calloutB}</span>
        </div>
        <div className="game-ui-input-strip">
          <GameButton variant="secondary">{hud.emote}</GameButton>
          <GameButton variant="primary">{hud.sendRead}</GameButton>
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
  const { modals: m } = useCopy();
  return (
    <div className="game-ui-preview-two-up">
      <GameDialog title={m.dialogTitle}>
        <p>{m.dialogBody}</p>
        <GameHudActions label={m.actionsLabel}>
          <GameButton variant="primary">{m.confirm}</GameButton>
          <GameButton variant="ghost">{m.back}</GameButton>
        </GameHudActions>
      </GameDialog>
      <GamePanel title={m.panelTitle} tone="strong">
        <GameToast tone="success">{m.toastOk}</GameToast>
        <GameToast tone="danger">{m.toastErr}</GameToast>
        <GameLoadingState label={m.loading} />
        <GameLoadingState label={m.loadingErr} tone="error" />
      </GamePanel>
    </div>
  );
}

function CardAndAssetSamples(): ReactNode {
  const { cards } = useCopy();
  return (
    <div className="game-ui-preview-two-up">
      <GamePanel title={cards.fanTitle} tone="strong">
        <GameCardFan label={cards.fanLabel} cards={[{ id: 'human', icon: 'home', kicker: cards.human, title: 'Mika' }, { id: 'ai', icon: 'ai', kicker: cards.ai, title: 'River' }, { id: 'sympathizer', icon: 'crown', kicker: cards.sympathizer, title: 'Noa' }]} />
      </GamePanel>
      <GamePanel title={cards.assetTitle} tone="strong">
        <p className="game-ui-small-copy">{cards.assetNote}</p>
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
  const { firstSession: fs } = useCopy();
  const labels = {
    controls: fs.controls, emote: fs.emote, goalLabel: fs.goalLabel, goalValue: fs.goalValue, streak: fs.streak, guest: fs.guest, history: fs.history, hud: fs.hud, input: fs.input, moveBadge: fs.moveBadge, move: fs.move,
    roomLabel: fs.roomLabel, roomValue: fs.roomValue, roleLabel: fs.roleLabel, roleValue: fs.roleValue, settings: fs.settings, shell: fs.shell, timerLabel: fs.timerLabel, timerValue: '02:46', tools: fs.tools, wardrobe: fs.wardrobe,
  };
  return (
    <div className="game-ui-first-session-preview">
      <div className="game-ui-first-session-world">
        <FirstSessionHud authenticated batteryCount={5} dailyStreak={3} labels={labels} onHistory={() => undefined} onSettings={() => undefined} onWardrobe={() => undefined} playerName={fs.playerName} />
      </div>
      <div className="game-ui-first-session-modal-slot">
        <FirstSessionOnboarding
          open
          onDismiss={() => undefined}
          labels={{
            badge: fs.obBadge,
            body: fs.obBody,
            skip: fs.obSkip,
            start: fs.obStart,
            title: fs.obTitle,
            steps: [
              { title: fs.obMoveT, body: fs.obMoveB },
              { title: fs.obReadT, body: fs.obReadB },
              { title: fs.obVoteT, body: fs.obVoteB },
            ],
          }}
        />
      </div>
    </div>
  );
}

function ResponsiveProofFrames(): ReactNode {
  const { responsive } = useCopy();
  return (
    <div className="game-ui-proof-frames">
      <article className="game-ui-proof-frame is-desktop">
        <header><GameBadge>{responsive.desktop}</GameBadge><strong>1440×900</strong></header>
        <HudAndStage />
      </article>
      <article className="game-ui-proof-frame is-mobile-landscape">
        <header><GameBadge>{responsive.mobileLandscape}</GameBadge><strong>844×390</strong></header>
        <HudAndStage />
      </article>
    </div>
  );
}

function FormsAndDisplay(): ReactNode {
  const { forms: copy } = useCopy();
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
          <GameAvatar name={copy.guestName} size="sm" />
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

function SpriteGrid(): ReactNode {
  return (
    <div className="game-ui-icon-grid">
      {CLAY_GAME_SPRITE_NAMES.map((name) => (
        <figure className="game-ui-icon-cell" key={`sprite-${name}`}>
          <span className="game-ui-asset-icon" data-icon-size="lg" data-icon-style="game" aria-hidden>
            <img alt="" src={CLAY_GAME_SPRITES[name]} />
          </span>
          <figcaption>{name}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function IconGallery(): ReactNode {
  const { gallery } = useCopy();
  return (
    <div className="game-ui-icon-gallery">
      <section className="game-ui-icon-family">
        <header className="game-ui-icon-family-head">
          <GameBadge tone="success">{gallery.gameLabel}</GameBadge>
          <p className="game-ui-small-copy">{gallery.gameHint}</p>
        </header>
        <IconFamilyGrid names={GAME_ICON_NAMES} style="game" />
      </section>
      <section className="game-ui-icon-family">
        <header className="game-ui-icon-family-head">
          <GameBadge>{gallery.lineLabel}</GameBadge>
          <p className="game-ui-small-copy">{gallery.lineHint}</p>
        </header>
        <IconFamilyGrid names={LINE_ICON_NAMES} style="line" />
      </section>
      <section className="game-ui-icon-family">
        <header className="game-ui-icon-family-head">
          <GameBadge tone="warning">{gallery.spriteLabel}</GameBadge>
          <p className="game-ui-small-copy">{gallery.spriteHint}</p>
        </header>
        <SpriteGrid />
      </section>
    </div>
  );
}

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
    <CopyContext.Provider value={copy}>
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
          <h2 id="game-ui-preview-token-title">{copy.sections.tokens}</h2>
          <TokenSwatches />
          <div className="game-ui-token-ledger">{tokenGroups.map((group) => <TokenGroup key={group.id} id={group.id} label={copy.tokenGroups[group.id] ?? group.id} tokens={group.tokens} />)}</div>
        </section>

        <section aria-labelledby="game-ui-preview-icons-title" className="game-ui-preview-section">
          <h2 id="game-ui-preview-icons-title">{copy.sections.icons}</h2>
          <p className="game-ui-small-copy">{copy.iconsIntro}</p>
          <IconGallery />
        </section>

        <section aria-labelledby="game-ui-preview-type-title" className="game-ui-preview-section">
          <h2 id="game-ui-preview-type-title">{copy.sections.typography}</h2>
          <TypographyScale />
        </section>

        <section aria-labelledby="game-ui-preview-components-title" className="game-ui-preview-section">
          <h2 id="game-ui-preview-components-title">{copy.sections.components}</h2>
          <ButtonStates />
          <HudAndStage />
          <ModalAndStates />
          <CardAndAssetSamples />
          <GameHistoryPanel entries={copy.history} label={copy.historyLabel} />
        </section>

        <section aria-labelledby="game-ui-preview-forms-title" className="game-ui-preview-section">
          <h2 id="game-ui-preview-forms-title">{copy.sections.forms}</h2>
          <FormsAndDisplay />
        </section>

        <section aria-labelledby="game-ui-preview-first-session-title" className="game-ui-preview-section">
          <h2 id="game-ui-preview-first-session-title">{copy.sections.firstSession}</h2>
          <FirstSessionSamples />
        </section>

        <section aria-labelledby="game-ui-preview-orientation-title" className="game-ui-preview-section">
          <h2 id="game-ui-preview-orientation-title">{copy.sections.orientation}</h2>
          <GameOrientationGate badgeLabel={copy.orientation.badge} body={copy.orientation.body} cta={copy.orientation.cta} manualHint={copy.orientation.hint} preview title={copy.orientation.title} />
        </section>

        <section aria-labelledby="game-ui-preview-responsive-title" className="game-ui-preview-section">
          <h2 id="game-ui-preview-responsive-title">{copy.sections.responsive}</h2>
          <ResponsiveProofFrames />
        </section>
      </main>
    </CopyContext.Provider>
  );
}
