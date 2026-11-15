'use client';

import { StrictMode, createElement, useEffect, useState, type ComponentType } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ShowcaseShell } from './showcase/ShowcaseShell';
import { ShowcaseLanguageProvider } from './showcase/ShowcaseContext';
import type {
  KitManifest,
  ShowcaseDemoProps,
  ShowcaseLanguage,
  ShowcaseTheme,
} from './showcase/types';

export { ShowcaseShell, type ShowcaseShellProps } from './showcase/ShowcaseShell';
export { DemoPanel, type DemoPanelProps, type DemoPanelVariant } from './showcase/DemoPanel';
export { FlowStrip, type FlowStripProps, type FlowStep } from './showcase/FlowStrip';
export { CodeSample, type CodeSampleProps } from './showcase/CodeSample';
export { StatusList, type StatusListProps } from './showcase/StatusList';
export { KitCard, type KitCardLabels, type KitCardProps } from './showcase/KitCard';
export {
  AppBar,
  AppBarAction,
  appBarMenuOrder,
  type AppBarActionProps,
  type AppBarItem,
  type AppBarProps,
} from './showcase/AppBar';
export {
  DisclosureRow,
  type DisclosureRowProps,
  type DisclosureRowTone,
} from './showcase/DisclosureRow';
export { ChipNav, type ChipNavItem, type ChipNavProps } from './showcase/ChipNav';
export { PageHeader, type PageHeaderProps } from './showcase/PageHeader';
export { useShowcaseLanguage } from './showcase/ShowcaseContext';
export type {
  KitManifest,
  Localized,
  ShowcaseDemo,
  ShowcaseDemoCopy,
  ShowcaseDemoProps,
  ShowcaseLanguage,
  ShowcaseTheme,
  StatusItem,
  UpdateItem,
} from './showcase/types';

export interface MountShowcaseOptions {
  kit: KitManifest;
  Demo: ComponentType<ShowcaseDemoProps>;
  root?: HTMLElement;
}

export function mountShowcase({
  Demo,
  kit,
  root = document.getElementById('root') ?? undefined,
}: MountShowcaseOptions): Root {
  if (!root) {
    throw new Error('mountShowcase requires a #root element or an explicit root.');
  }
  const rootApi = createRoot(root);
  rootApi.render(createElement(MountedShowcase, { Demo, kit }));
  return rootApi;
}

function MountedShowcase({ Demo, kit }: Pick<MountShowcaseOptions, 'Demo' | 'kit'>) {
  const [language, setLanguage] = useState<ShowcaseLanguage>('en');
  const [theme, setTheme] = useState<ShowcaseTheme>('light');

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dataset.gameUiTheme = theme;
  }, [language, theme]);

  return createElement(
    StrictMode,
    null,
    createElement(
      ShowcaseLanguageProvider,
      { language },
      createElement(ShowcaseShell, {
        kit,
        language,
        theme,
        onLanguageChange: () => setLanguage((value) => (value === 'en' ? 'zh' : 'en')),
        onThemeChange: () => setTheme((value) => (value === 'light' ? 'dark' : 'light')),
        demo: createElement(Demo, { kit, language }),
      }),
    ),
  );
}
