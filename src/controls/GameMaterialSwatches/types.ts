export type GameMaterialLayout = 'desktop' | 'dense' | 'mobile' | 'small-mobile';

export type GameMaterialPattern = 'solid' | 'speckled' | 'hatched' | 'grid';

export interface GameMaterialSwatch {
  color: string;
  compactLabel?: string;
  disabled?: boolean;
  id: string;
  label: string;
  meta?: string;
  pattern?: GameMaterialPattern;
  secondaryColor?: string;
}
