export type MaterialLayout = 'desktop' | 'dense' | 'mobile' | 'small-mobile';

export type MaterialPattern = 'solid' | 'speckled' | 'hatched' | 'grid';

export interface MaterialSwatch {
  color: string;
  compactLabel?: string;
  disabled?: boolean;
  id: string;
  label: string;
  meta?: string;
  pattern?: MaterialPattern;
  secondaryColor?: string;
}
