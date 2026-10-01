import {
  type ImageMeltOptions,
  type ResolvedDissolveOptions,
  type DissolveValue,
  resolveDissolveOptions,
} from './options';

interface MaskSnapshot {
  maskImage: string;
  maskPriority: string;
  webkitMaskImage: string;
  webkitMaskPriority: string;
}

export interface ImageMeltEntry {
  id: string;
  el: HTMLElement;
  target: HTMLImageElement;
  src: string;
  opts: Required<ImageMeltOptions>;
  painted: boolean;
  previousOpacity: string;
}

export interface DissolveEntry {
  id: string;
  el: HTMLElement;
  image: HTMLImageElement | null;
  opts: ResolvedDissolveOptions;
  previousMask: MaskSnapshot | null;
}

export interface DissolveRegistration {
  update(value: DissolveValue): void;
  unregister(): void;
}

export interface ImageMeltRegistry {
  registerMelt(entry: Omit<ImageMeltEntry, 'id' | 'painted' | 'previousOpacity'>): () => void;
  registerDissolve(entry: Omit<DissolveEntry, 'id' | 'previousMask'>): DissolveRegistration;
  subscribe(fn: () => void): () => void;
  entries(): ImageMeltEntry[];
  dissolveEntries(): DissolveEntry[];
}

export function findImage(element: HTMLElement | null): HTMLImageElement | null {
  if (!element) return null;
  if (element instanceof HTMLImageElement) return element;
  return element.querySelector('img');
}

export function sourceOf(image: HTMLImageElement | null): string | null {
  if (!image) return null;
  return image.currentSrc || image.src || null;
}

function readMaskSnapshot(image: HTMLImageElement): MaskSnapshot {
  return {
    maskImage: image.style.getPropertyValue('mask-image'),
    maskPriority: image.style.getPropertyPriority('mask-image'),
    webkitMaskImage: image.style.getPropertyValue('-webkit-mask-image'),
    webkitMaskPriority: image.style.getPropertyPriority('-webkit-mask-image'),
  };
}

export function restoreMask(entry: DissolveEntry): void {
  const image = entry.image;
  const previous = entry.previousMask;
  if (!image || !previous) return;
  if (previous.maskImage) {
    image.style.setProperty('mask-image', previous.maskImage, previous.maskPriority);
  } else {
    image.style.removeProperty('mask-image');
  }
  if (previous.webkitMaskImage) {
    image.style.setProperty(
      '-webkit-mask-image',
      previous.webkitMaskImage,
      previous.webkitMaskPriority,
    );
  } else {
    image.style.removeProperty('-webkit-mask-image');
  }
}

export function createImageMeltRegistry(): ImageMeltRegistry {
  const meltEntries = new Set<ImageMeltEntry>();
  const dissolveEntries = new Set<DissolveEntry>();
  const subscribers = new Set<() => void>();
  let counter = 0;
  const notify = (): void => subscribers.forEach((subscriber) => subscriber());

  return {
    registerMelt(entry) {
      const record: ImageMeltEntry = {
        ...entry,
        id: `image-melt-${++counter}`,
        painted: false,
        previousOpacity: entry.target.style.opacity,
      };
      meltEntries.add(record);
      notify();
      return () => {
        record.target.style.opacity = record.previousOpacity;
        record.painted = false;
        meltEntries.delete(record);
        notify();
      };
    },
    registerDissolve(entry) {
      const record: DissolveEntry = {
        ...entry,
        id: `dissolve-${++counter}`,
        previousMask: entry.image ? readMaskSnapshot(entry.image) : null,
      };
      dissolveEntries.add(record);
      notify();
      return {
        update(value: DissolveValue): void {
          const image = findImage(record.el);
          if (image !== record.image) {
            restoreMask(record);
            record.image = image;
            record.previousMask = image ? readMaskSnapshot(image) : null;
          }
          record.opts = resolveDissolveOptions(record.el, value);
          notify();
        },
        unregister(): void {
          restoreMask(record);
          dissolveEntries.delete(record);
          notify();
        },
      };
    },
    subscribe(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
    entries: () => [...meltEntries],
    dissolveEntries: () => [...dissolveEntries],
  };
}

export function registerDissolveItem(
  registry: ImageMeltRegistry,
  element: HTMLElement,
  value: DissolveValue,
): DissolveRegistration {
  const image = findImage(element);
  // Not gated on a build-mode flag. A library cannot detect the consuming
  // app's build mode: `import.meta.env.DEV` resolves against *this* package's
  // build and is always false downstream, which is how the kit's budget
  // warnings shipped dead. These fire only when the component was wired
  // wrong, once, so they are safe to say in any build.
  if (!image) {
    console.warn(
      '[swimmer-ui] `dissolve` needs an <img> inside the item; text and other DOM content stay unchanged.',
    );
  }
  return registry.registerDissolve({
    el: element,
    image,
    opts: resolveDissolveOptions(element, value),
  });
}
