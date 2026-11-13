'use client';

import { StrictMode, createElement, useEffect, useState, type ComponentType } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ShowcaseShell } from './showcase/ShowcaseShell';
import type { KitManifest, ShowcaseLanguage, ShowcaseTheme } from './showcase/types';

export { ShowcaseShell, type ShowcaseShellProps } from './showcase/ShowcaseShell';
export { DemoPanel, type DemoPanelProps, type DemoPanelVariant } from './showcase/DemoPanel';
export { FlowStrip, type FlowStripProps, type FlowStep } from './showcase/FlowStrip';
export { CodeSample, type CodeSampleProps } from './showcase/CodeSample';
export { StatusList, type StatusListProps } from './showcase/StatusList';
export { KitCard, type KitCardProps } from './showcase/KitCard';
export type {
  KitManifest,
  Localized,
  ShowcaseDemo,
  ShowcaseLanguage,
  ShowcaseTheme,
  StatusItem,
  UpdateItem,
} from './showcase/types';

export interface MountShowcaseOptions {
  kit: KitManifest;
  Demo: ComponentType;
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
    createElement(ShowcaseShell, {
      kit,
      language,
      theme,
      onLanguageChange: () => setLanguage((value) => (value === 'en' ? 'zh' : 'en')),
      onThemeChange: () => setTheme((value) => (value === 'light' ? 'dark' : 'light')),
      demo: createElement(Demo),
    }),
  );
}
