export interface ShowcasePageMetrics {
  viewportWidth: number;
  scrollWidth: number;
  stageWiderThanPanel: boolean;
  hasFlowStrip: boolean;
  kitType: string;
  stageCount: number;
  stageMissingOptionRow: boolean;
  headingFontFamily?: string;
  expectedHeadingFontFamily?: string;
}
export declare function validateShowcaseMetrics(metrics: ShowcasePageMetrics): string[];
export declare function runShowcaseCheck(root?: string): Promise<string[]>;
