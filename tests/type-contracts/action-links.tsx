import { createRef, forwardRef, type ComponentProps } from 'react';
import { Button, IconButton, Progress } from '../../src/index';
import { LiquidPopover } from '../../src/liquid-presence';

const router = forwardRef<HTMLAnchorElement, ComponentProps<'a'>>((props, ref) => (
  <a {...props} ref={ref} />
));
// Auth/form libraries pass native button props as a whole. React's global HTML
// metadata (including rel) must not turn that button into an impossible type.
export const InjectedButton = forwardRef<HTMLButtonElement, ComponentProps<'button'>>(
  (props, ref) => (
    <Button {...props} ref={ref}>
      {props.children}
    </Button>
  ),
);
export const InjectedIcon = forwardRef<HTMLButtonElement, ComponentProps<'button'>>(
  (props, ref) => (
    <IconButton {...props} ref={ref} label="Account">
      {props.children}
    </IconButton>
  ),
);
export const metadataButton = (
  <InjectedButton rel="tag" type="submit">
    Save
  </InjectedButton>
);

const source = createRef<HTMLButtonElement>();
export const action = (
  <Button ref={source} type="submit" size="sm">
    Save
  </Button>
);
export const anchor = (
  <Button href="/learn" ref={createRef<HTMLAnchorElement>()} target="_blank" download>
    Start
  </Button>
);
export const routed = (
  <IconButton href="/learn" linkComponent={router} label="Read" size="sm">
    →
  </IconButton>
);
export const popover = (
  <LiquidPopover open source={source} onOpenChange={() => {}} title="Help">
    Help
  </LiquidPopover>
);
// @ts-expect-error Native buttons cannot declare link-only targets without href.
export const wrongTarget = <Button target="_blank">Wrong</Button>;
export const wrongType = (
  // @ts-expect-error Links do not submit the enclosing form.
  <Button href="/learn" type="submit">
    Wrong
  </Button>
);
// @ts-expect-error An icon-only action always requires its accessible label.
export const unnamedIcon = <IconButton href="/learn">→</IconButton>;

// @ts-expect-error The S12 progress liquid has one tide recipe, no tone switch.
export const oldProgressTone = <Progress value={40} label="Progress" tone="success" />;
