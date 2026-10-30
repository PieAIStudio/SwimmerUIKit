import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type RoundActionState = 'go' | 'stop';

export interface RoundActionProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  children: ReactNode;
  promise?: ReactNode;
  state?: RoundActionState;
}

/** The one primary tool action: a 92px circle with an optional safety promise. */
export function RoundAction({
  children,
  className,
  promise,
  state = 'go',
  type = 'button',
  ...props
}: RoundActionProps): ReactNode {
  return (
    <div className="game-ui-round-action-wrap">
      <button
        {...props}
        className={['game-ui-round-action', className].filter(Boolean).join(' ')}
        data-tool-main-action="true"
        data-tool-round-state={state}
        type={type}
      >
        {children}
      </button>
      {promise ? <p className="game-ui-round-action-promise">{promise}</p> : null}
    </div>
  );
}
