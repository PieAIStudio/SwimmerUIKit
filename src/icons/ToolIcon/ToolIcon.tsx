import type { SVGProps } from 'react';
import type { IconName } from '../registry';
import { GAME_ICONS } from '../registry';
import type { IconData } from '../types';

const TOOL_GLYPHS = {
  back: ['M15 5l-7 7 7 7'],
  bell: ['M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 21h4'],
  box: ['M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10'],
  chev: ['M9 5l7 7-7 7'],
  cloud: ['M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 9.2 4.5 4.5 0 0 0 7 18z'],
  doc: ['M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6'],
  down: ['M12 3v12M7 10l5 5 5-5M5 21h14'],
  folder: ['M3 6h6l2 2h10v11H3z'],
  gear: [
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 13a7.5 7.5 0 0 0 0-2l2-1.5-2-3.5-2.4 1a7.6 7.6 0 0 0-1.7-1L15 3h-4l-.4 2.5a7.6 7.6 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7.5 7.5 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7.6 7.6 0 0 0 1.7-1L11 21h4l.4-2.5a7.6 7.6 0 0 0 1.7-1l2.4 1 2-3.5z',
  ],
  image: ['M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15.5 9.5h.01'],
  inbox: ['M3 13l3-8h12l3 8v6H3zM3 13h5l1 3h6l1-3h5'],
  key: ['M8 15a4 4 0 1 1 3.4-6.1L21 9v4h-3v3h-3v-3h-3.6A4 4 0 0 1 8 15z'],
  laptop: ['M5 5h14v10H5zM2 19h20'],
  list: ['M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01'],
  mail: ['M3 6h18v12H3zM3 7l9 6 9-6'],
  phone: ['M8 2h8a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM11 18h2'],
  play: ['M7 4l13 8-13 8z'],
  pulse: ['M3 12h4l3-8 4 16 3-8h4'],
  shield: ['M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z'],
  spark: ['M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z'],
  sync: ['M20 8a8 8 0 0 0-14.5-2M4 4v4h4M4 16a8 8 0 0 0 14.5 2M20 20v-4h-4'],
  tag: ['M3 12V4h8l10 10-8 8zM7.5 8.5h.01'],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0'],
  wifi: ['M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01'],
} as const satisfies Record<string, readonly string[]>;

export type ToolIconName = keyof typeof TOOL_GLYPHS;

export interface ToolIconProps extends Omit<SVGProps<SVGSVGElement>, 'children' | 'aria-label'> {
  label?: string;
  name: IconName | ToolIconName;
  size?: number;
}

/** Existing kit icons are preferred; these contract glyphs fill the tool-only gaps. */
export function ToolIcon({ label, name, size = 18, ...props }: ToolIconProps) {
  const data: IconData | undefined =
    typeof name === 'string' && name in GAME_ICONS
      ? GAME_ICONS[name as IconName]
      : { name, paths: TOOL_GLYPHS[name as ToolIconName] ?? [] };
  return (
    <svg
      {...props}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={['game-ui-tool-icon', props.className].filter(Boolean).join(' ')}
      focusable="false"
      height={size}
      role={label ? 'img' : undefined}
      viewBox="0 0 24 24"
      width={size}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {data.paths.map((path) => (
        <path d={path} key={path} />
      ))}
    </svg>
  );
}
