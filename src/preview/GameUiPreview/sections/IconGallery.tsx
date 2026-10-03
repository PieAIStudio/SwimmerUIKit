import { GameIcon } from '../../../icons/GameIcon/GameIcon';
import { GAME_ICON_NAMES } from '../../../icons/registry';

export function IconGallery() {
  return (
    <div className="game-ui-icon-grid" aria-label="全部线条图标">
      {GAME_ICON_NAMES.map((icon) => (
        <figure className="game-ui-icon-cell" key={icon}>
          <GameIcon icon={icon} size="lg" />
          <figcaption>{icon}</figcaption>
        </figure>
      ))}
    </div>
  );
}
