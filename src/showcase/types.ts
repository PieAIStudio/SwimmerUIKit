import type { ReactNode } from 'react';

export type ShowcaseLanguage = 'en' | 'zh';
export type ShowcaseTheme = 'light' | 'dark';
export type Localized = { en: string; zh: string };
export type StatusItem = {
  label: Localized;
  value: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'ai';
};
export type UpdateItem = { date: string; text: Localized };
export type ShowcaseDemoCopy = {
  stageLabel: Localized;
  surfaceLabel: Localized;
  badge: Localized;
  controlsOption: Localized;
  tokensOption: Localized;
  buttonLabel: Localized;
  progressLabel: Localized;
  flowLabel: Localized;
  flow: readonly { label: Localized; detail: Localized }[];
};
export type KitManifest = {
  name: string;
  shortName?: string;
  tagline: Localized;
  consumers: Localized;
  type: 'visual' | 'interactive' | 'code';
  version: string;
  status: StatusItem;
  lastRelease: string;
  what: Localized;
  updates: readonly UpdateItem[];
  code: readonly string[];
  demo?: ShowcaseDemoCopy;
};
export type ShowcaseDemoProps = { kit: KitManifest; language: ShowcaseLanguage };
export type ShowcaseDemo = ReactNode;
