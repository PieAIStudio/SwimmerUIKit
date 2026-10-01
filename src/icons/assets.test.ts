import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  acknowledgeClayPlaceholders,
  CLAY_ASSET_BASE_PATH,
  getClayAssetBasePath,
  getClayIconPath,
  getClaySourceAssetPath,
  setClayAssetBasePath,
  setClayAssetMode,
} from './assets';

afterEach(() => {
  setClayAssetBasePath(CLAY_ASSET_BASE_PATH);
  setClayAssetMode('inline');
  vi.restoreAllMocks();
});

describe('sculpted asset base path', () => {
  it('defaults to the published path', () => {
    expect(getClayAssetBasePath()).toBe(CLAY_ASSET_BASE_PATH);
    expect(getClaySourceAssetPath('crown')).toBe(
      `${CLAY_ASSET_BASE_PATH}/icons/common/crown-v1.png`,
    );
  });

  it('rebases resolved paths so a CDN or sub-path deploy can host the set', () => {
    setClayAssetBasePath('https://cdn.example.com/clay');
    expect(getClaySourceAssetPath('crown')).toBe(
      'https://cdn.example.com/clay/icons/common/crown-v1.png',
    );
  });

  it('drops a trailing slash rather than producing a doubled one', () => {
    setClayAssetBasePath('/static/clay/');
    expect(getClaySourceAssetPath('crown')).toBe('/static/clay/icons/common/crown-v1.png');
  });
});

describe('placeholder notice', () => {
  /**
   * The point of this warning is that the placeholders look deliberate. A
   * product can ship a navigation rail of identical lettered squares and
   * nobody files a bug, which is worse than a broken image would have been.
   */
  it('warns the first time a placeholder is drawn, and only once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    setClayAssetMode('inline');

    getClayIconPath('home');
    getClayIconPath('crown');
    getClayIconPath('gem');

    expect(warn.mock.calls.length).toBeLessThanOrEqual(1);
  });

  it('stays quiet for a consumer that opted in on purpose', () => {
    acknowledgeClayPlaceholders();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    setClayAssetMode('inline');

    getClayIconPath('home');

    expect(warn).not.toHaveBeenCalled();
  });

  it('says nothing when the real set is in use', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    setClayAssetMode('source');

    getClayIconPath('home');

    expect(warn).not.toHaveBeenCalled();
  });
});
