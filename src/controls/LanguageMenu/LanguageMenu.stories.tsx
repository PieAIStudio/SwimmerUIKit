import type { Meta, StoryObj } from '@storybook/react-vite';

import { LanguageMenu } from '../../index';

const englishRoutes = [
  {
    id: 'en',
    label: 'English',
    meta: 'English',
    href: '/en',
    hrefLang: 'en',
    lang: 'en',
    dir: 'ltr' as const,
    current: true,
  },
  {
    id: 'zh',
    label: '简体中文',
    meta: 'Chinese (Simplified)',
    href: '/zh',
    hrefLang: 'zh-Hans',
    lang: 'zh-Hans',
    dir: 'ltr' as const,
  },
];

const chineseRoutes = [
  {
    id: 'en',
    label: 'English',
    meta: 'English',
    href: '/en',
    hrefLang: 'en',
    lang: 'en',
    dir: 'ltr' as const,
  },
  {
    id: 'zh',
    label: '简体中文',
    meta: 'Chinese (Simplified)',
    href: '/zh',
    hrefLang: 'zh-Hans',
    lang: 'zh-Hans',
    dir: 'ltr' as const,
    current: true,
  },
];

const longRoutes = [
  ...englishRoutes,
  ...Array.from({ length: 28 }, (_, index) => ({
    id: `locale-${index + 1}`,
    label: `Language ${index + 1}`,
    meta: `Locale ${index + 1}`,
    href: `/locale-${index + 1}`,
    hrefLang: `x-locale-${index + 1}`,
    lang: 'en',
    dir: 'ltr' as const,
  })),
];

const meta = {
  title: 'Swimmer/Controls/LanguageMenu',
  component: LanguageMenu,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '语言选择的共享交互。没有 href 时保留回调按钮模式；提供 href 时输出带 hrefLang、lang、dir、current 和新标签页属性的原生路由链接。宿主拥有路由、cookie 和翻译。',
      },
    },
  },
} satisfies Meta<typeof LanguageMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RoutedEnglish: Story = {
  name: 'Routed links · English',
  args: {
    currentLabel: 'English',
    label: 'Choose a language',
    options: englishRoutes,
  },
};

export const RoutedChinese: Story = {
  name: 'Routed links · 简体中文',
  globals: { theme: 'dark' },
  args: {
    currentLabel: '简体中文',
    label: '选择语言',
    options: chineseRoutes,
  },
};

export const CallbackButtons: Story = {
  name: 'Callback buttons · backwards-compatible',
  args: {
    currentLabel: 'English',
    label: 'Choose a language',
    options: [
      { id: 'en', label: 'English', meta: 'EN' },
      { id: 'zh', label: '简体中文', meta: '中文' },
    ],
  },
};

export const LongRouteList: Story = {
  name: 'Long route list · 30 options',
  args: {
    currentLabel: 'English',
    label: 'Choose a language',
    options: longRoutes,
  },
};
