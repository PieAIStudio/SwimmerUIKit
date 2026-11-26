import { useEffect, useState, type ReactNode } from 'react';

import { FadeDivider } from '../controls/FadeDivider/FadeDivider';
import {
  RadialLiquidMenu,
  type RadialLiquidMenuItem,
} from '../game/RadialLiquidMenu/RadialLiquidMenu';
import { OrbTabBar, type OrbTabSlots } from '../game/OrbTabBar/OrbTabBar';
import { V12_THEMES, type V12Theme } from '../tokens/v12Theme';

type ShowcaseLanguage = 'en' | 'zh';
type PreviewMode = 'desktop' | 'phone';

export interface V12PartsShowcaseProps {
  language?: ShowcaseLanguage;
}

interface PreviewConfig {
  theme: V12Theme;
  view: PreviewMode;
  open: boolean;
  fromQuery: boolean;
}

function SvgIcon({ d }: { d: string }): ReactNode {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d={d} />
    </svg>
  );
}

const RADIAL_ITEMS: readonly RadialLiquidMenuItem[] = [
  {
    id: 'add-files',
    label: 'Add files',
    icon: (
      <SvgIcon d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Zm0 0v5h5M12 11v6M9 14h6" />
    ),
  },
  {
    id: 'new-folder',
    label: 'New folder',
    icon: (
      <SvgIcon d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm9 4v6M9 14h6" />
    ),
  },
  {
    id: 'add-photos',
    label: 'Add photos',
    icon: (
      <SvgIcon d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Zm4.5 4.5a1.5 1.5 0 1 0 0-.01M20 15l-4.5-4.5L7 19" />
    ),
  },
];

const ORB_TABS: OrbTabSlots = [
  {
    id: 'files',
    label: 'Files',
    icon: <SvgIcon d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />,
  },
  {
    id: 'clipboard',
    label: 'Clipboard',
    icon: (
      <SvgIcon d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1ZM7 6H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-1" />
    ),
  },
  {
    id: 'send',
    label: 'Send',
    icon: <SvgIcon d="M21 3 10 14M21 3l-6 18-5-7-7-5Z" />,
  },
  {
    id: 'tidy',
    label: 'AI Tidy',
    icon: (
      <SvgIcon d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8ZM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9Z" />
    ),
  },
];

const SIDE_COUNTS: Record<string, string> = {
  files: '110',
  clipboard: 'On',
  send: '3',
  tidy: '',
};

const SIDE_FOOTER = [
  {
    id: 'devices',
    label: 'Devices',
    meta: '2/2',
    icon: (
      <SvgIcon d="M4 6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10H4Zm12 4h3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-3M2 19h14" />
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    meta: '',
    icon: (
      <SvgIcon d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm0-5v2m0 13v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M3.5 12h2m13 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
    ),
  },
  {
    id: 'help',
    label: 'Help',
    meta: '',
    icon: (
      <SvgIcon d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-2.4-11.4a2.6 2.6 0 0 1 5 .8c0 1.8-2.6 2.1-2.6 3.6m0 3.2h.01" />
    ),
  },
] as const;

const SAMPLE_ROWS = [
  {
    name: 'Home papers',
    sub: '14 files',
    status: 'On all devices',
    size: '10 MB',
    changed: '4 days ago',
    busy: false,
    folder: true,
  },
  {
    name: 'Lisbon trip',
    sub: '22 files',
    status: 'On all devices',
    size: '404 MB',
    changed: 'Oct 27',
    busy: false,
    folder: true,
  },
  {
    name: 'Music practice',
    sub: '8 files',
    status: 'On all devices',
    size: '24 MB',
    changed: '19 hours ago',
    busy: false,
    folder: true,
  },
  {
    name: 'Photos 2026',
    sub: '34 files',
    status: '3 syncing now',
    size: '565 MB',
    changed: '1 minute ago',
    busy: true,
    folder: true,
  },
  {
    name: 'Recipes',
    sub: '10 files',
    status: 'On all devices',
    size: '2.3 MB',
    changed: 'Oct 30',
    busy: false,
    folder: true,
  },
  {
    name: 'School',
    sub: '12 files',
    status: 'On all devices',
    size: '10 MB',
    changed: 'Yesterday',
    busy: false,
    folder: true,
  },
  {
    name: 'Birthday ideas.txt',
    sub: 'On all devices · 4.6 KB',
    status: 'On all devices',
    size: '4.6 KB',
    changed: '2 days ago',
    busy: false,
    folder: false,
  },
  {
    name: 'Book list.txt',
    sub: 'On all devices · 11 KB',
    status: 'On all devices',
    size: '11 KB',
    changed: '2 days ago',
    busy: false,
    folder: false,
  },
  {
    name: 'Family budget 2026.xlsx',
    sub: 'On all devices · 155 KB',
    status: 'On all devices',
    size: '155 KB',
    changed: 'Nov 13',
    busy: false,
    folder: false,
  },
  {
    name: 'Garden plan.jpg',
    sub: 'On all devices · 3.4 MB',
    status: 'On all devices',
    size: '3.4 MB',
    changed: '9 hours ago',
    busy: false,
    folder: false,
  },
  {
    name: 'Holiday video.mov',
    sub: 'On all devices · 4.3 MB',
    status: 'On all devices',
    size: '4.3 MB',
    changed: '3 hours ago',
    busy: false,
    folder: false,
  },
  {
    name: 'Old phone backup.zip',
    sub: 'On all devices · 36 MB',
    status: 'On all devices',
    size: '36 MB',
    changed: 'Nov 13',
    busy: false,
    folder: false,
  },
] as const;

const FILTER_CHIPS = ['All', 'Photos', 'Videos', 'Docs', 'Other'] as const;

const THEME_LABELS: Record<V12Theme, string> = {
  lagoon: 'Lagoon',
  'lagoon-light': 'Lagoon light',
  blossom: 'Blossom',
  graphite: 'Graphite',
  paper: 'Paper',
};

function isV12Theme(value: string | null): value is V12Theme {
  return value !== null && (V12_THEMES as readonly string[]).includes(value);
}

function readQueryPreview(): PreviewConfig | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const rawTheme = params.get('v12-theme');
  if (!isV12Theme(rawTheme)) return null;
  const rawView = params.get('v12-view');
  const view: PreviewMode = rawView === 'phone' ? 'phone' : 'desktop';
  const openParam = params.get('v12-open');
  const open = openParam === null ? view === 'desktop' : openParam === '1' || openParam === 'true';
  return { theme: rawTheme, view, open, fromQuery: true };
}

function FullStagePreview({
  config,
  onClose,
}: {
  config: PreviewConfig;
  onClose: () => void;
}): ReactNode {
  const [activeId, setActiveId] = useState('files');
  const [menuOpen, setMenuOpen] = useState(config.open);

  useEffect(() => {
    setMenuOpen(config.open);
  }, [config.open, config.theme, config.view]);

  const isPhone = config.view === 'phone';
  const rows = isPhone ? SAMPLE_ROWS.slice(0, 10) : SAMPLE_ROWS;

  return (
    <div
      className={[
        'kit-v12-stage',
        isPhone ? 'kit-v12-stage--phone' : 'kit-v12-stage--desktop',
      ].join(' ')}
      data-v12-theme={config.theme}
    >
      {!config.fromQuery ? (
        <button className="kit-v12-stage__close" onClick={onClose} type="button">
          Close preview
        </button>
      ) : null}

      {isPhone ? (
        <div className="kit-v12-stage__phone-shell">
          <header className="kit-v12-stage__phead">
            <span className="kit-v12-stage__brand">
              <span className="kit-v12-stage__brand-dot" aria-hidden="true" />
              <strong>OnePlace</strong>
            </span>
            <span className="kit-v12-stage__net-pill">
              <i className="kit-v12-stage__dot" aria-hidden="true" />
              Devices · 2/2 ›
            </span>
            <span className="kit-v12-stage__phead-more" aria-hidden="true">
              ⋯
            </span>
          </header>
          <FadeDivider className="kit-v12-stage__phead-divider" theme={config.theme} />

          <div className="kit-v12-stage__phone-body">
            <div className="kit-v12-stage__head">
              <div className="kit-v12-stage__head-copy">
                <h1>Files</h1>
                <span className="kit-v12-stage__meta">
                  110 files · <i className="kit-v12-stage__dot kit-v12-stage__dot--busy" /> 3
                  syncing now
                </span>
              </div>
              <span className="kit-v12-stage__chip-btn">Slideshow</span>
            </div>

            <div className="kit-v12-stage__toolbar">
              <span className="kit-v12-stage__search">Search files</span>
              <span className="kit-v12-stage__sort">Name ▾</span>
            </div>

            <div className="kit-v12-stage__filters">
              {FILTER_CHIPS.map((chip, index) => (
                <span
                  className={[
                    'kit-v12-stage__filter',
                    index === 0 ? 'kit-v12-stage__filter--active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  key={chip}
                >
                  {chip}
                </span>
              ))}
            </div>

            <div className="kit-v12-stage__list">
              {rows.map((row, index) => (
                <div className="kit-v12-stage__row-wrap" key={row.name}>
                  {index > 0 ? (
                    <FadeDivider className="kit-v12-stage__row-divider" theme={config.theme} />
                  ) : null}
                  <div className="kit-v12-stage__row kit-v12-stage__row--phone">
                    <span className="kit-v12-stage__row-icon" aria-hidden="true">
                      <SvgIcon
                        d={
                          row.folder
                            ? 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z'
                            : 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Zm0 0v5h5'
                        }
                      />
                    </span>
                    <div className="kit-v12-stage__row-main">
                      <strong>{row.name}</strong>
                      <span>
                        {row.folder ? row.sub + ' · ' : ''}
                        <i
                          className={[
                            'kit-v12-stage__dot',
                            row.busy ? 'kit-v12-stage__dot--busy' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        />{' '}
                        {row.folder ? row.status : row.sub}
                      </span>
                    </div>
                    <span className="kit-v12-stage__row-more" aria-hidden="true">
                      ⋯
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="kit-v12-stage__phone-bar">
            <OrbTabBar
              activeId={activeId}
              label="Primary navigation"
              onSelect={setActiveId}
              orb="+"
              orbLabel="Open quick actions"
              orbMenu={
                <RadialLiquidMenu
                  floating
                  items={RADIAL_ITEMS}
                  label="Quick actions"
                  onOpenChange={setMenuOpen}
                  open={menuOpen}
                  orbSpeed={2.0}
                  theme={config.theme}
                  trigger="+"
                  triggerLabel="Open quick actions"
                />
              }
              orbSpeed={2.0}
              tabs={ORB_TABS}
              theme={config.theme}
            />
          </div>
        </div>
      ) : (
        <div className="kit-v12-stage__desktop-shell">
          <aside className="kit-v12-stage__sidebar">
            <div className="kit-v12-stage__brand">
              <span className="kit-v12-stage__brand-dot" aria-hidden="true" />
              <strong>OnePlace</strong>
            </div>
            <nav className="kit-v12-stage__side-nav" aria-label="Workspace sections">
              {ORB_TABS.map((tab) => (
                <button
                  aria-current={tab.id === activeId ? 'page' : undefined}
                  className="kit-v12-stage__side-item"
                  key={tab.id}
                  onClick={() => setActiveId(tab.id)}
                  type="button"
                >
                  <span className="kit-v12-stage__side-icon" aria-hidden="true">
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  {SIDE_COUNTS[tab.id] ? (
                    <span className="kit-v12-stage__side-count">{SIDE_COUNTS[tab.id]}</span>
                  ) : null}
                </button>
              ))}
            </nav>
            <div className="kit-v12-stage__side-spacer" />
            <div className="kit-v12-stage__side-foot">
              {SIDE_FOOTER.map((item) => (
                <div className="kit-v12-stage__side-item" key={item.id}>
                  <span className="kit-v12-stage__side-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.meta ? (
                    <span className="kit-v12-stage__side-count">{item.meta}</span>
                  ) : null}
                </div>
              ))}
            </div>
            <FadeDivider
              className="kit-v12-stage__side-divider"
              orientation="vertical"
              theme={config.theme}
            />
          </aside>

          <main className="kit-v12-stage__main">
            <div className="kit-v12-stage__content">
              <div className="kit-v12-stage__head">
                <div className="kit-v12-stage__head-copy">
                  <h1>Files</h1>
                  <span className="kit-v12-stage__meta">
                    110 files · <i className="kit-v12-stage__dot kit-v12-stage__dot--busy" /> 3
                    syncing now
                  </span>
                </div>
                <span className="kit-v12-stage__chip-btn">Slideshow</span>
              </div>

              <div className="kit-v12-stage__toolbar">
                <span className="kit-v12-stage__search">Search files</span>
                <span className="kit-v12-stage__sort">Name ▾</span>
              </div>

              <div className="kit-v12-stage__filters">
                {FILTER_CHIPS.map((chip, index) => (
                  <span
                    className={[
                      'kit-v12-stage__filter',
                      index === 0 ? 'kit-v12-stage__filter--active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    key={chip}
                  >
                    {chip}
                  </span>
                ))}
              </div>

              <div className="kit-v12-stage__list">
                <div className="kit-v12-stage__list-head">
                  <span>Name</span>
                  <span>Status</span>
                  <span>Size</span>
                  <span>Changed</span>
                  <span />
                </div>
                {rows.map((row) => (
                  <div className="kit-v12-stage__row-wrap" key={row.name}>
                    <FadeDivider className="kit-v12-stage__row-divider" theme={config.theme} />
                    <div className="kit-v12-stage__row">
                      <span className="kit-v12-stage__row-icon" aria-hidden="true">
                        <SvgIcon
                          d={
                            row.folder
                              ? 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z'
                              : 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Zm0 0v5h5'
                          }
                        />
                      </span>
                      <div className="kit-v12-stage__row-main">
                        <strong>{row.name}</strong>
                        {row.folder ? <span>{row.sub}</span> : null}
                      </div>
                      <span className="kit-v12-stage__row-status">
                        <i
                          className={[
                            'kit-v12-stage__dot',
                            row.busy ? 'kit-v12-stage__dot--busy' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        />
                        {row.status}
                      </span>
                      <span className="kit-v12-stage__row-meta">{row.size}</span>
                      <span className="kit-v12-stage__row-meta">{row.changed}</span>
                      <span className="kit-v12-stage__row-more" aria-hidden="true">
                        ⋯
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="kit-v12-stage__dock">
              <RadialLiquidMenu
                floating
                items={RADIAL_ITEMS}
                label="Quick actions"
                onOpenChange={setMenuOpen}
                open={menuOpen}
                orbSpeed={2.0}
                theme={config.theme}
                trigger="+"
                triggerLabel="Open quick actions"
              />
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export function V12PartsShowcase({ language = 'en' }: V12PartsShowcaseProps): ReactNode {
  const [activeId, setActiveId] = useState('files');
  const [preview, setPreview] = useState<PreviewConfig | null>(() => readQueryPreview());
  const isZh = language === 'zh';

  if (preview) {
    return <FullStagePreview config={preview} onClose={() => setPreview(null)} />;
  }

  return (
    <section className="kit-v12-parts" aria-labelledby="kit-v12-parts-title">
      <div className="kit-v12-parts__heading">
        <p className="kit-v12-parts__eyebrow">{isZh ? 'OnePlace v12' : 'OnePlace v12'}</p>
        <h2 id="kit-v12-parts-title">
          {isZh ? '真实 Kit 部件' : 'UIKit parts from the prototype'}
        </h2>
        <p>
          {isZh
            ? '五套主题、桌面径向液体菜单与 390px 手机 OrbTabBar，共用烘焙霜面令牌。'
            : 'Five themes, a desktop radial liquid menu, and a 390px phone OrbTabBar share baked frost tokens.'}
        </p>
      </div>
      <div className="kit-v12-parts__grid">
        {V12_THEMES.map((theme) => (
          <article className="kit-v12-theme-card" data-v12-theme={theme} key={theme}>
            <header className="kit-v12-theme-card__header">
              <div className="kit-v12-theme-card__title">
                <h3>{THEME_LABELS[theme]}</h3>
                <span>{theme}</span>
              </div>
              <div className="kit-v12-theme-card__actions">
                <button
                  className="kit-v12-theme-card__preview-btn"
                  onClick={() =>
                    setPreview({ theme, view: 'desktop', open: true, fromQuery: false })
                  }
                  type="button"
                >
                  {isZh ? '桌面' : '1440'}
                </button>
                <button
                  className="kit-v12-theme-card__preview-btn"
                  onClick={() =>
                    setPreview({ theme, view: 'phone', open: false, fromQuery: false })
                  }
                  type="button"
                >
                  {isZh ? '手机' : '390'}
                </button>
              </div>
            </header>
            <div className="kit-v12-theme-card__desktop">
              <p className="kit-v12-theme-card__label">
                {isZh ? '桌面 · RadialLiquidMenu' : 'Desktop · RadialLiquidMenu'}
              </p>
              <RadialLiquidMenu
                defaultOpen
                items={RADIAL_ITEMS}
                label={isZh ? '快速操作' : 'Quick actions'}
                orbSpeed={2.0}
                theme={theme}
                trigger="+"
                triggerLabel={isZh ? '打开快速操作' : 'Open quick actions'}
              />
              <FadeDivider theme={theme} />
              <div className="kit-v12-frost-panel">
                <div className="kit-v12-frost-panel__copy">
                  <strong>{isZh ? '烘焙霜面面板' : 'Baked frost panel'}</strong>
                  <span>{isZh ? '不使用实时模糊' : 'Opaque surface, no live blur'}</span>
                </div>
                <FadeDivider orientation="vertical" theme={theme} />
                <span className="kit-v12-frost-panel__meta">14 files</span>
              </div>
            </div>
            <div className="kit-v12-theme-card__phone">
              <p className="kit-v12-theme-card__label">{isZh ? '手机 · 390px' : 'Phone · 390px'}</p>
              <OrbTabBar
                activeId={activeId}
                label={isZh ? '主导航' : 'Primary navigation'}
                onOrbClick={() => setActiveId('files')}
                onSelect={setActiveId}
                orb="+"
                orbLabel={isZh ? '打开快捷菜单' : 'Open quick menu'}
                orbSpeed={2.0}
                tabs={ORB_TABS}
                theme={theme}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default V12PartsShowcase;
