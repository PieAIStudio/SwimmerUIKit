import { createContext, useContext, type ReactNode } from 'react';
import type { ShowcaseLanguage } from './types';

export const ShowcaseLanguageContext = createContext<ShowcaseLanguage>('en');

export function useShowcaseLanguage(explicit?: ShowcaseLanguage): ShowcaseLanguage {
  return explicit ?? useContext(ShowcaseLanguageContext);
}

export function ShowcaseLanguageProvider({
  children,
  language,
}: {
  children?: ReactNode;
  language: ShowcaseLanguage;
}): ReactNode {
  return (
    <ShowcaseLanguageContext.Provider value={language}>{children}</ShowcaseLanguageContext.Provider>
  );
}
