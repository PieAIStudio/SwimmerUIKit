import type { ReactNode } from 'react';

export type Localized = { en: string; zh: string };
export type StatusItem = {
  label: Localized;
  value: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'ai';
};
export type UpdateItem = { date: string; text: Localized };
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
};
export type ShowcaseLanguage = 'en' | 'zh';
export type ShowcaseTheme = 'light' | 'dark';
export type ShowcaseDemo = ReactNode;
