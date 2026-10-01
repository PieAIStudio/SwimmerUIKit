import { type ReactNode } from 'react';

import { GameAssetIcon } from '../../../icons/GameAssetIcon/GameAssetIcon';

import { GameBadge } from '../../../feedback/GameBadge/GameBadge';

import {
  CLAY_GAME_SPRITES,
  CLAY_GAME_SPRITE_NAMES,
  CLAY_ICON_NAMES,
  getClayIconStyles,
  type ClayIconName,
  type ClayIconStyle,
} from '../../../icons/assets';
import { useCopy } from '../context';

const GAME_ICON_NAMES = CLAY_ICON_NAMES.filter((name) => getClayIconStyles(name).includes('game'));

const LINE_ICON_NAMES = CLAY_ICON_NAMES.filter((name) => getClayIconStyles(name).includes('line'));

function IconFamilyGrid({
  names,
  style,
}: {
  names: readonly ClayIconName[];
  style: ClayIconStyle;
}): ReactNode {
  return (
    <div className="game-ui-icon-grid">
      {names.map((name) => (
        <figure className="game-ui-icon-cell" key={`${style}-${name}`}>
          <GameAssetIcon icon={name} size="lg" style={style} />
          <figcaption>{name}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function SpriteGrid(): ReactNode {
  return (
    <div className="game-ui-icon-grid">
      {CLAY_GAME_SPRITE_NAMES.map((name) => (
        <figure className="game-ui-icon-cell" key={`sprite-${name}`}>
          <span
            className="game-ui-asset-icon"
            data-icon-size="lg"
            data-icon-style="game"
            aria-hidden
          >
            <img alt="" src={CLAY_GAME_SPRITES[name]} />
          </span>
          <figcaption>{name}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export function IconGallery(): ReactNode {
  const { gallery } = useCopy();
  return (
    <div className="game-ui-icon-gallery">
      <section className="game-ui-icon-family">
        <header className="game-ui-icon-family-head">
          <GameBadge tone="success">{gallery.gameLabel}</GameBadge>
          <p className="game-ui-small-copy">{gallery.gameHint}</p>
        </header>
        <IconFamilyGrid names={GAME_ICON_NAMES} style="game" />
      </section>
      <section className="game-ui-icon-family">
        <header className="game-ui-icon-family-head">
          <GameBadge>{gallery.lineLabel}</GameBadge>
          <p className="game-ui-small-copy">{gallery.lineHint}</p>
        </header>
        <IconFamilyGrid names={LINE_ICON_NAMES} style="line" />
      </section>
      <section className="game-ui-icon-family">
        <header className="game-ui-icon-family-head">
          <GameBadge tone="warning">{gallery.spriteLabel}</GameBadge>
          <p className="game-ui-small-copy">{gallery.spriteHint}</p>
        </header>
        <SpriteGrid />
      </section>
    </div>
  );
}
