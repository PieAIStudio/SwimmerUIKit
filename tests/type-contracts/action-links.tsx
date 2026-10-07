import { createRef, forwardRef, type ComponentProps } from 'react';
import { GameButton, GameIconButton, GameProgress } from '../../src/index';
import { LiquidPopover } from '../../src/liquid-presence';

const router = forwardRef<HTMLAnchorElement, ComponentProps<'a'>>((props, ref) => (
  <a {...props} ref={ref} />
));
// Auth/form libraries pass native button props as a whole. React's global HTML
// metadata (including rel) must not turn that button into an impossible type.
export const InjectedButton = forwardRef<HTMLButtonElement, ComponentProps<'button'>>(
  (props, ref) => (
    <GameButton {...props} ref={ref}>
      {props.children}
    </GameButton>
  ),
);
export const InjectedIcon = forwardRef<HTMLButtonElement, ComponentProps<'button'>>(
  (props, ref) => (
    <GameIconButton {...props} ref={ref} label="Account">
      {props.children}
    </GameIconButton>
  ),
);
export const metadataButton = (
  <InjectedButton rel="tag" type="submit">
    Save
  </InjectedButton>
);

const source = createRef<HTMLButtonElement>();
export const action = (
  <GameButton ref={source} type="submit" size="sm">
    Save
  </GameButton>
);
export const anchor = (
  <GameButton href="/learn" ref={createRef<HTMLAnchorElement>()} target="_blank" download>
    Start
  </GameButton>
);
export const routed = (
  <GameIconButton href="/learn" linkComponent={router} label="Read" size="sm">
    →
  </GameIconButton>
);
export const popover = (
  <LiquidPopover open source={source} onOpenChange={() => {}} title="Help">
    Help
  </LiquidPopover>
);
// @ts-expect-error Native buttons cannot declare link-only targets without href.
export const wrongTarget = <GameButton target="_blank">Wrong</GameButton>;
export const wrongType = (
  // @ts-expect-error Links do not submit the enclosing form.
  <GameButton href="/learn" type="submit">
    Wrong
  </GameButton>
);
// @ts-expect-error An icon-only action always requires its accessible label.
export const unnamedIcon = <GameIconButton href="/learn">→</GameIconButton>;

// @ts-expect-error The S12 progress liquid has one tide recipe, no tone switch.
export const oldProgressTone = <GameProgress value={40} label="Progress" tone="success" />;
