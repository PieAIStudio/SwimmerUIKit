import {
  forwardRef,
  useCallback,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ComponentType,
  type Ref,
  type RefObject,
} from 'react';

export type ActionElement = HTMLButtonElement | HTMLAnchorElement;
type LinkAttributes = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'type' | 'download'> & {
  href: string;
  download?: string | boolean;
  ref?: Ref<HTMLAnchorElement>;
};
export type LinkComponent = ComponentType<LinkAttributes>;
type ButtonAction = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: undefined;
  linkComponent?: undefined;
  target?: never;
  // rel is also React HTML/RDFa metadata. Keep the native button attribute;
  // href alone selects link behavior, while target/download remain link-only.
  download?: never;
};
type LinkAction = Omit<LinkAttributes, 'ref'> & {
  disabled?: boolean;
  type?: never;
  linkComponent?: LinkComponent;
};
export type ActionProps = ButtonAction | LinkAction;
type NativeActionProps = ActionProps & { onActivate?: () => void };

/** Forward the actual DOM identity, including React 19 ref cleanups. A parent
 * rerender must not look like replacing a registered navigation target. */
export function useActionRef(ref: Ref<ActionElement>, control?: RefObject<ActionElement | null>) {
  return useCallback(
    (element: ActionElement | null) => {
      if (control) control.current = element;
      const cleanup = typeof ref === 'function' ? ref(element) : undefined;
      if (ref && typeof ref !== 'function') ref.current = element;
      if (!element) return;
      return () => {
        if (control) control.current = null;
        if (typeof cleanup === 'function') cleanup();
        else if (typeof ref === 'function') ref(null);
        else if (ref) ref.current = null;
      };
    },
    [ref, control],
  );
}

/** One semantic decision shared by both finished controls. No skin or router. */
export const NativeAction = forwardRef<ActionElement, NativeActionProps>(
  function NativeAction(props, ref) {
    const nativeRef = useActionRef(ref);
    if (props.href !== undefined) {
      const {
        href,
        linkComponent: Link,
        disabled = false,
        target,
        rel,
        tabIndex,
        onClick,
        onKeyDown,
        onActivate,
        ...attributes
      } = props;
      const link = {
        ...attributes,
        target,
        rel:
          target === '_blank'
            ? [...new Set(`${rel ?? ''} noopener noreferrer`.trim().split(/\s+/))].join(' ')
            : rel,
        'aria-disabled': disabled ? (true as const) : attributes['aria-disabled'],
        role: disabled ? 'link' : attributes.role,
        tabIndex: disabled ? undefined : tabIndex,
        onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
          if (disabled) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          onActivate?.();
          onClick?.(event);
        },
        onKeyDown: (event: React.KeyboardEvent<HTMLAnchorElement>) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          onKeyDown?.(event);
        },
      };
      // A router Link normally requires href. A disabled link is always native,
      // with neither a destination nor a focusable tabIndex, never a fake route.
      return Link && !disabled ? (
        <Link {...link} href={href} ref={nativeRef} />
      ) : (
        <a {...link} href={disabled ? undefined : href} ref={nativeRef} />
      );
    }
    const {
      href: _href,
      linkComponent: _link,
      onActivate,
      onClick,
      type = 'button',
      ...attributes
    } = props;
    void _href;
    void _link;
    return (
      <button
        {...attributes}
        type={type}
        ref={nativeRef}
        onClick={(event) => {
          if (!attributes.disabled) {
            onActivate?.();
            onClick?.(event);
          }
        }}
      />
    );
  },
);
