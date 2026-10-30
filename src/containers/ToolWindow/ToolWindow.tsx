import type { HTMLAttributes, ReactNode } from 'react';
import { joinClasses } from '../shared/classes';
import { TOOL_WORLDS, type ToolSidebarMode, type ToolWorld } from '../toolWorlds';

export { TOOL_WORLDS } from '../toolWorlds';
export type { ToolSidebarMode, ToolWorld } from '../toolWorlds';

export interface ToolWindowProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'> {
  children: ReactNode;
  className?: string;
  reducedMotion?: boolean;
  sidebar?: ReactNode;
  sidebarMode?: ToolSidebarMode;
  title: string;
  world?: ToolWorld;
}

/** The Colour Worlds window: one saturated world with a transparent sidebar. */
export function ToolWindow({
  children,
  className,
  reducedMotion = false,
  sidebar,
  sidebarMode = 'normal',
  title,
  world = 'violet',
  ...props
}: ToolWindowProps): ReactNode {
  const classes = joinClasses('game-ui-tool-window', className);
  return (
    <section
      {...props}
      aria-label={title}
      className={classes}
      data-reduced-motion={reducedMotion ? 'true' : undefined}
      data-tool-sidebar-mode={sidebarMode}
      data-tool-world={world}
      data-tool-world-known={TOOL_WORLDS.includes(world) ? 'true' : undefined}
    >
      {sidebar ? (
        <aside aria-label={`${title} navigation`} className="game-ui-tool-window-sidebar">
          {sidebar}
        </aside>
      ) : null}
      <div className="game-ui-tool-window-main">{children}</div>
    </section>
  );
}
