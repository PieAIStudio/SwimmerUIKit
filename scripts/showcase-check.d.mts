export interface ShowcasePageMetrics {
  viewportWidth: number;
  scrollWidth: number;
  stageWiderThanPanel: boolean;
  hasFlowStrip: boolean;
  kitType: string;
  stageCount: number;
  stageMissingOptionRow: boolean;
  stageFixedHeightAtPhone?: boolean;
  stageClipsAtPhone?: boolean;
  columnEdgesDiffer?: boolean;
  headingFontFamily?: string;
  expectedHeadingFontFamily?: string;
  codeToRailGap?: number;
  updatesClipped?: boolean;
  codeWrapUnsafe?: boolean;
  codeFadeMissing?: boolean;
  headerActionsNotAtEdge?: boolean;
  toggleTargetsTooSmall?: boolean;
  toggleStylesInconsistent?: boolean;
  codeCornerUnclipped?: boolean;
}
export declare function validateShowcaseCode(input: {
  packageName?: string;
  code?: readonly string[];
}): string[];
export declare function validateShowcaseOutputCopy(input: {
  text: string;
  file?: string;
}): string[];
export declare function validateShowcaseMetrics(metrics: ShowcasePageMetrics): string[];
export declare function runShowcaseCheck(root?: string): Promise<string[]>;
