import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge, Button, HudActions, LanguageMenu, Panel } from '../../index';

const PRODUCTS = [
  {
    id: 'break',
    name: 'BREAK',
    href: 'https://break.swiminai.com',
    action: { en: 'Watch the build', zh: '观看建设' },
    status: { en: 'In development', zh: '建设中' },
  },
  {
    id: 'university',
    name: 'University',
    href: 'https://university.swiminai.com',
    action: { en: 'Explore lessons', zh: '探索课程' },
    status: { en: 'Listed', zh: '已列出' },
  },
  {
    id: 'directing',
    name: 'Directing',
    href: 'https://directing.swiminai.com',
    action: { en: 'Explore filmmaking', zh: '探索拍摄' },
    status: { en: 'Alpha', zh: 'Alpha' },
  },
  {
    id: 'swimmerparty',
    name: 'SWIMMER PARTY',
    href: 'https://swimmerparty.swiminai.com',
    action: { en: 'Meet the actors', zh: '认识演员' },
    status: { en: 'Listed', zh: '已列出' },
  },
] as const;

const meta = {
  title: 'Swimmer/Patterns/Official product entry',
  component: HudActions,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '官网四入口的共享组合夹具。只组合 HudActions、Button、Badge、Panel 和 LanguageMenu；产品仍拥有目录、路由、文案和状态。',
      },
    },
  },
} satisfies Meta<typeof HudActions>;

export default meta;
type Story = StoryObj<typeof meta>;
type DemoLocale = 'en' | 'zh';

function ProductEntryDemo({ locale }: { locale: DemoLocale }) {
  const chinese = locale === 'zh';
  const languageOptions = chinese
    ? [
        {
          id: 'en',
          label: 'English',
          meta: 'English',
          href: '#english',
          hrefLang: 'en',
          lang: 'en',
          dir: 'ltr' as const,
        },
        {
          id: 'zh',
          label: '简体中文',
          meta: 'Chinese (Simplified)',
          href: '#zh',
          hrefLang: 'zh-Hans',
          lang: 'zh-Hans',
          dir: 'ltr' as const,
          current: true,
        },
      ]
    : [
        {
          id: 'en',
          label: 'English',
          meta: 'English',
          href: '#english',
          hrefLang: 'en',
          lang: 'en',
          dir: 'ltr' as const,
          current: true,
        },
        {
          id: 'zh',
          label: '简体中文',
          meta: 'Chinese (Simplified)',
          href: '#zh',
          hrefLang: 'zh-Hans',
          lang: 'zh-Hans',
          dir: 'ltr' as const,
        },
      ];
  const copy = chinese
    ? {
        eyebrow: 'SwimInAI · 四个入口',
        title: '探索 Swimmer 产品',
        description: '一个清楚的动作区，产品目录和目的地仍由官网拥有。',
        language: '选择语言',
        products: '产品入口',
      }
    : {
        eyebrow: 'SwimInAI · Four entries',
        title: 'Explore Swimmer products',
        description:
          'One clear action group; the product catalog and destinations stay host-owned.',
        language: 'Choose a language',
        products: 'Product entries',
      };

  return (
    <main
      lang={chinese ? 'zh-Hans' : 'en'}
      style={{
        display: 'grid',
        gap: 'var(--swimmer-space-8)',
        width: 'min(100%, 1280px)',
        margin: '0 auto',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 'var(--swimmer-space-4)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'grid', gap: 'var(--swimmer-space-2)', minWidth: 0 }}>
          <span
            style={{
              color: 'var(--swimmer-game-text-muted)',
              fontSize: 'var(--swimmer-font-xs)',
              fontWeight: 800,
              letterSpacing: '0.12em',
            }}
          >
            {copy.eyebrow}
          </span>
          <h1
            style={{
              margin: 0,
              color: 'var(--swimmer-game-text)',
              fontFamily: 'var(--swimmer-game-font-display)',
              fontSize: 'clamp(2rem, 5vw, 4.5rem)',
              lineHeight: 1,
              textWrap: 'balance',
            }}
          >
            {copy.title}
          </h1>
        </div>
        <LanguageMenu
          currentLabel={chinese ? '简体中文' : 'English'}
          label={copy.language}
          options={languageOptions}
        />
      </header>

      <Panel>
        <h2
          style={{
            margin: 0,
            color: 'var(--swimmer-game-text)',
            fontFamily: 'var(--swimmer-game-font-display)',
            fontSize: 'var(--swimmer-tool-font-title)',
          }}
        >
          {copy.products}
        </h2>
        <p style={{ margin: 0, color: 'var(--swimmer-game-text-muted)', lineHeight: 1.5 }}>
          {copy.description}
        </p>
        <HudActions
          label={copy.products}
          style={{ alignItems: 'stretch', gap: 'var(--swimmer-space-3)' }}
        >
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              style={{
                display: 'grid',
                flex: '1 1 250px',
                minWidth: 0,
                gap: 'var(--swimmer-space-2)',
              }}
            >
              <Button
                aria-label={`${product.name} — ${product.action[locale]}`}
                className="official-product-entry"
                data-product-id={product.id}
                href={product.href}
                id={`product-entry-${product.id}`}
                lang={chinese ? 'zh-Hans' : 'en'}
                dir="ltr"
                style={{
                  width: '100%',
                  justifyContent: 'space-between',
                  minWidth: 0,
                  textAlign: 'start',
                }}
              >
                <span
                  style={{
                    display: 'grid',
                    flex: '1 1 auto',
                    minWidth: 0,
                    gap: '4px',
                    textAlign: 'start',
                  }}
                >
                  <strong style={{ overflowWrap: 'anywhere' }}>{product.name}</strong>
                  <span
                    style={{
                      color: 'var(--swimmer-game-text-muted)',
                      fontSize: 'var(--swimmer-font-sm)',
                      fontWeight: 600,
                      lineHeight: 1.3,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {product.action[locale]}
                  </span>
                </span>
              </Button>
              <Badge tone="neutral">{product.status[locale]}</Badge>
            </div>
          ))}
        </HudActions>
      </Panel>
    </main>
  );
}

export const EnglishLight: Story = {
  name: 'English · light · desktop/mobile',
  globals: { theme: 'light' },
  args: { children: null, label: 'Product entries' },
  render: () => <ProductEntryDemo locale="en" />,
};

export const EnglishDark: Story = {
  name: 'English · dark',
  globals: { theme: 'dark' },
  args: { children: null, label: 'Product entries' },
  render: () => <ProductEntryDemo locale="en" />,
};

export const ChineseLight: Story = {
  name: '简体中文 · light',
  globals: { theme: 'light' },
  args: { children: null, label: '产品入口' },
  render: () => <ProductEntryDemo locale="zh" />,
};

export const ChineseDark: Story = {
  name: '简体中文 · dark',
  globals: { theme: 'dark' },
  args: { children: null, label: '产品入口' },
  render: () => <ProductEntryDemo locale="zh" />,
};
