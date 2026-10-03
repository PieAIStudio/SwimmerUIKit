import type { GameUiHistoryEntry } from '../../../containers/GameHistoryPanel/GameHistoryPanel';

// ---------------------------------------------------------------------------
// Localization. The showcase flips its product-facing copy between EN and 中文
// so reviewers can judge the real Chinese-font layout. NOTE: token keys
// (ink, parchment) and icon names (crown, portal) deliberately stay English —
// they are CODE identifiers you type in your editor, not UI copy.
// ---------------------------------------------------------------------------

export type PreviewLang = 'en' | 'zh-CN';

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

export interface PreviewCopy {
  triggerLabel: string;
  langMenuLabel: string;
  heroTitle: string;
  heroBody: string;
  sections: {
    tokens: string;
    icons: string;
    typography: string;
    components: string;
    forms: string;
    overlayGlass: string;
    liquid: string;
    liquidMetal: string;
    firstSession: string;
    responsive: string;
  };
  tokenGroups: Record<string, string>;
  iconsIntro: string;
  tiles: StageTilesCopy;
  forms: FormsCopy;
  type: { kicker: string; h1: string; h2: string; body: string; small: string };
  buttons: {
    panelTitle: string;
    openTable: string;
    useCode: string;
    continueHost: string;
    readyUp: string;
    leaveTable: string;
    waiting: string;
    settingsTip: string;
    copyInvite: string;
    aiBadge: string;
    readyBadge: string;
    hostGateBadge: string;
    segmentedLabel: string;
    segDaily: string;
    segLive: string;
    segTokens: string;
    tabsPortal: string;
    tabsVote: string;
    tabsHistory: string;
    radialLabel: string;
    wave: string;
    think: string;
    doubt: string;
    sliderLabel: string;
    toggleLabel: string;
  };
  liquid: {
    body: string;
    surfacesTitle: string;
    disabledTitle: string;
    disabledBody: string;
    moreTitle: string;
    moreBody: string;
    moreLink: string;
    press: string;
  };
  liquidMetal: {
    body: string;
    cssTitle: string;
    webglTitle: string;
    cta: string;
  };
  hud: {
    label: string;
    youAre: string;
    roleValue: string;
    rolePrivate: string;
    room: string;
    reveal: string;
    tools: string;
    history: string;
    settings: string;
    calloutA: string;
    calloutB: string;
    emote: string;
    sendRead: string;
  };
  modals: {
    dialogTitle: string;
    dialogBody: string;
    actionsLabel: string;
    confirm: string;
    back: string;
    panelTitle: string;
    toastOk: string;
    toastErr: string;
    loading: string;
    loadingErr: string;
  };
  firstSession: {
    controls: string;
    emote: string;
    goalLabel: string;
    goalValue: string;
    streak: string;
    guest: string;
    history: string;
    hud: string;
    input: string;
    moveBadge: string;
    move: string;
    roomLabel: string;
    roomValue: string;
    roleLabel: string;
    roleValue: string;
    settings: string;
    shell: string;
    timerLabel: string;
    tools: string;
    wardrobe: string;
    playerName: string;
    obBadge: string;
    obBody: string;
    obSkip: string;
    obStart: string;
    obTitle: string;
    obMoveT: string;
    obMoveB: string;
    obReadT: string;
    obReadB: string;
    obVoteT: string;
    obVoteB: string;
  };
  responsive: { desktop: string; mobileLandscape: string };
  historyLabel: string;
  history: readonly GameUiHistoryEntry[];
}
