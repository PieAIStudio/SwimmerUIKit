import { renderToStaticMarkup } from 'react-dom/server';
import * as THREE from 'three';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToolHero3D } from './ToolHero3D';
import { registerHeroScene, type ToolHero3DScene } from './renderer';
import type { ToolHero3DThree } from './types';

const model = {
  build: () => {
    throw new Error('The builder must stay client-side during SSR');
  },
  fallback: '/placeholder.png',
};

afterEach(() => vi.unstubAllGlobals());

describe('SharedHeroRenderer coordinates', () => {
  it.each([1, 2])('draws an upper-right hero in CSS pixels at DPR %i', (dpr) => {
    const renderer = {
      domElement: { style: {}, setAttribute: vi.fn(), remove: vi.fn() },
      info: { reset: vi.fn() },
      setClearColor: vi.fn(),
      setPixelRatio: vi.fn(),
      setSize: vi.fn(),
      setScissorTest: vi.fn(),
      clear: vi.fn(),
      setViewport: vi.fn(),
      setScissor: vi.fn(),
      render: vi.fn(),
      dispose: vi.fn(),
    };
    const three = {
      ...THREE,
      WebGLRenderer: class {
        constructor() {
          return renderer;
        }
      },
    } as unknown as ToolHero3DThree;
    vi.stubGlobal('window', {
      innerWidth: 1000,
      innerHeight: 800,
      devicePixelRatio: dpr,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal('document', {
      visibilityState: 'visible',
      body: { append: vi.fn() },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    const element = {
      getBoundingClientRect: () => ({ left: 700, bottom: 200, width: 160, height: 120 }),
    } as unknown as HTMLElement;
    const scene: ToolHero3DScene = {
      camera: new THREE.PerspectiveCamera(),
      root: new THREE.Group(),
      scene: new THREE.Scene(),
      sweep: new THREE.PointLight(),
      triangles: 0,
    };
    const registration = registerHeroScene(three, scene, element, true);
    try {
      expect(renderer.setPixelRatio).toHaveBeenCalledExactlyOnceWith(dpr);
      expect(renderer.setSize).toHaveBeenCalledExactlyOnceWith(1000, 800, false);
      expect(renderer.setViewport).toHaveBeenCalledExactlyOnceWith(700, 600, 160, 120);
      expect(renderer.setScissor).toHaveBeenCalledExactlyOnceWith(700, 600, 160, 120);
      expect(renderer.render).toHaveBeenCalledExactlyOnceWith(scene.scene, scene.camera);
    } finally {
      registration.unregister();
    }
  });
});

describe('ToolHero3D fallback contract', () => {
  it('renders a visible PNG fallback without touching Three.js during SSR', () => {
    const html = renderToStaticMarkup(<ToolHero3D model={model} />);
    expect(html).toContain('data-tool-hero-3d="true"');
    expect(html).toContain('data-hero-state="loading"');
    expect(html).toContain('src="/placeholder.png"');
    expect(html).toContain('game-ui-tool-hero3d-fallback');
  });
});
