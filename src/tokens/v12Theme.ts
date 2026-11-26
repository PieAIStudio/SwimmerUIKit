export const V12_THEMES = ['lagoon', 'lagoon-light', 'blossom', 'graphite', 'paper'] as const;

export type V12Theme = (typeof V12_THEMES)[number];
