import { type ReactNode } from 'react';

import { getClayIconPath, type ClayIconName, type ClayIconStyle } from '../assets';

export interface GameAssetIconProps {
  className?: string;
  icon: ClayIconName;
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Visual family. 'game' (default) is the colorful sculpted clay object;
   * 'line' is the flat white glyph alternate. Falls back automatically when an
   * icon only ships one family.
   */
  style?: ClayIconStyle;
  useSourceAsset?: boolean;
}

export function GameAssetIcon({
  className,
  icon,
  label,
  size = 'md',
  style,
  useSourceAsset = false,
}: GameAssetIconProps): ReactNode {
  const classes = ['game-ui-asset-icon', className].filter(Boolean).join(' ');
  const accessibilityProps = label ? { 'aria-label': label } : { 'aria-hidden': true };
  const src = getClayIconPath(icon, {
    ...(style ? { style } : {}),
    ...(useSourceAsset ? { inline: false } : {}),
  });
  return (
    <span
      className={classes}
      data-icon-size={size}
      data-icon-style={style ?? 'game'}
      {...accessibilityProps}
    >
      <img alt="" src={src} />
    </span>
  );
}
