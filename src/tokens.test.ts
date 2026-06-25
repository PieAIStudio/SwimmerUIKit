import { describe, expect, it } from 'vitest';

import { CLAY_TARGET_TOKENS, CLAY_UI_TOKENS, GAME_UI_TOKENS } from './tokens';

describe('clay token exports', () => {
  it('exports CSS variable tokens for cross-stack integration', () => {
    expect(CLAY_UI_TOKENS.semantic.background).toBe('var(--game-ui-bg)');
    expect(CLAY_UI_TOKENS.typography.familyBody).toBe('var(--game-ui-font-body)');
    expect(GAME_UI_TOKENS.surface).toBe('var(--game-ui-surface)');
  });

  it('keeps proof viewport targets in code tokens', () => {
    expect(CLAY_TARGET_TOKENS.desktopProofWidthPx).toBe(1440);
    expect(CLAY_TARGET_TOKENS.desktopProofHeightPx).toBe(900);
    expect(CLAY_TARGET_TOKENS.mobileLandscapeProofWidthPx).toBe(844);
    expect(CLAY_TARGET_TOKENS.mobileLandscapeProofHeightPx).toBe(390);
  });
});
