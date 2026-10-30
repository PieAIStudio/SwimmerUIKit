'use client';

import { useEffect, useRef, useState } from 'react';
import { createHeroScene, registerHeroScene, type ToolHero3DScene } from './renderer';
import { registerToolHero3DRenderer, type ToolHero3DRenderer } from './registry';
import type { ToolHero3DProps, ToolHero3DThree } from './types';

let threeModule: Promise<ToolHero3DThree> | undefined;

function loadThree(): Promise<ToolHero3DThree> {
  threeModule ??= import('three');
  return threeModule;
}

async function loadModel(model: ToolHero3DProps['model']): Promise<{
  THREE: ToolHero3DThree;
  group: import('three').Group;
}> {
  const THREE = await loadThree();
  if ('build' in model) return { THREE, group: model.build(THREE) };

  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
  const gltf = await new GLTFLoader().loadAsync(model.url);
  return { THREE, group: gltf.scene };
}

function disposeScene(scene: ToolHero3DScene): void {
  scene.root.traverse((object) => {
    if (!('isMesh' in object) || !object.isMesh) return;
    const mesh = object as import('three').Mesh;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) material?.dispose();
  });
}

/**
 * A shared-renderer, optional Three.js hero. The fallback stays in the DOM for
 * SSR, reduced motion, missing WebGL and failed model loads.
 */
export function ToolHero3D({ className, model, onMetrics, reducedMotion }: ToolHero3DProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<ReturnType<typeof registerHeroScene> | null>(null);
  const metricsRef = useRef(onMetrics);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const [state, setState] = useState<'loading' | 'ready' | 'fallback'>('loading');
  metricsRef.current = onMetrics;

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setSystemReducedMotion(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let scene: ToolHero3DScene | undefined;
    let unregister: (() => void) | undefined;
    const still = reducedMotion ?? systemReducedMotion;
    const observer =
      'IntersectionObserver' in window
        ? new IntersectionObserver(
            (entries) => {
              const visible = entries[0]?.isIntersecting ?? true;
              controlsRef.current?.setVisible(visible);
            },
            { threshold: 0.01 },
          )
        : undefined;
    observer?.observe(host);

    setState('loading');
    controlsRef.current = null;
    loadModel(model)
      .then(({ THREE, group }) => {
        if (cancelled) return;
        if (!group || typeof group.traverse !== 'function')
          throw new Error('Hero model is not a THREE.Group');
        scene = createHeroScene(THREE, group, host);
        const controls = registerHeroScene(THREE, scene, host, still, (metrics) => {
          host.dataset.frameTimeMs = metrics.frameTimeMs.toFixed(2);
          host.dataset.triangles = String(metrics.triangles);
          host.dataset.rendererCount = String(metrics.rendererCount);
          metricsRef.current?.(metrics);
        });
        controlsRef.current = controls;
        unregister = controls.unregister;
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('fallback');
      });

    return () => {
      cancelled = true;
      observer?.disconnect();
      controlsRef.current = null;
      unregister?.();
      if (scene && !unregister) disposeScene(scene);
    };
  }, [model, reducedMotion, systemReducedMotion]);

  const accessibleProps = model.alt
    ? { 'aria-label': model.alt, role: 'img' as const }
    : { 'aria-hidden': true as const };

  return (
    <div
      {...accessibleProps}
      className={['game-ui-tool-hero3d', className].filter(Boolean).join(' ')}
      data-hero-state={state}
      data-tool-hero-3d="true"
      ref={hostRef}
      onPointerLeave={() => controlsRef.current?.setPointer(0, 0)}
      onPointerMove={(event) => {
        const host = hostRef.current;
        if (!host) return;
        const rect = host.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) return;
        controlsRef.current?.setPointer(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -(((event.clientY - rect.top) / rect.height) * 2 - 1),
        );
      }}
    >
      <img
        alt={model.alt ?? ''}
        className="game-ui-tool-hero3d-fallback"
        draggable="false"
        src={model.fallback}
      />
    </div>
  );
}

registerToolHero3DRenderer(ToolHero3D as unknown as ToolHero3DRenderer);

export type {
  ToolHero3DBuilder,
  ToolHero3DFrameMetrics,
  ToolHero3DModel,
  ToolHero3DProps,
  ToolHero3DThree,
} from './types';
