import type * as THREE from 'three';
import type { ToolHero3DFrameMetrics, ToolHero3DThree } from './types';

const IDLE_PERIOD_MS = 7000;
const MAX_DPR = 2;
const YAW_SWAY = (10 * Math.PI) / 180;
const CAMERA_PARALLAX_X = 0.22;
const CAMERA_PARALLAX_Y = 0.16;

export interface ToolHero3DScene {
  camera: THREE.PerspectiveCamera;
  root: THREE.Group;
  scene: THREE.Scene;
  sweep: THREE.PointLight;
  triangles: number;
}

interface HeroSlot {
  element: HTMLElement;
  metrics?: (metrics: ToolHero3DFrameMetrics) => void;
  pointerX: number;
  pointerY: number;
  reducedMotion: boolean;
  scene: ToolHero3DScene;
  startedAt: number;
  visible: boolean;
}

let sharedRenderer: SharedHeroRenderer | undefined;

function readWorldColor(
  THREE: ToolHero3DThree,
  element: HTMLElement,
  name: string,
  fallback: string,
): THREE.Color {
  const color = new THREE.Color(fallback);
  const value = window.getComputedStyle(element).getPropertyValue(name).trim();
  if (!value) return color;
  try {
    color.setStyle(value);
  } catch {
    // A host may provide a custom color function that Three does not parse.
    // The world fallback keeps the object lit instead of failing the hero.
  }
  return color;
}

function countTriangles(root: THREE.Object3D): number {
  let triangles = 0;
  root.traverse((object) => {
    if (!('isMesh' in object) || !object.isMesh) return;
    const mesh = object as THREE.Mesh;
    const geometry = mesh.geometry;
    if (!geometry) return;
    const index = geometry.getIndex();
    const position = geometry.getAttribute('position');
    triangles += Math.floor((index?.count ?? position?.count ?? 0) / 3);
  });
  return triangles;
}

function normalizeModel(THREE: ToolHero3DThree, model: THREE.Group): void {
  const bounds = new THREE.Box3().setFromObject(model);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const largest = Math.max(size.x, size.y, size.z, 0.001);
  model.position.sub(center);
  model.scale.setScalar(1.55 / largest);
}

function disposeObject(root: THREE.Object3D): void {
  root.traverse((object) => {
    if (!('isMesh' in object) || !object.isMesh) return;
    const mesh = object as THREE.Mesh;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) material?.dispose();
  });
}

export function createHeroScene(
  THREE: ToolHero3DThree,
  model: THREE.Group,
  element: HTMLElement,
): ToolHero3DScene {
  normalizeModel(THREE, model);

  const scene = new THREE.Scene();
  const root = new THREE.Group();
  root.add(model);
  scene.add(root);

  const c1 = readWorldColor(THREE, element, '--swimmer-tool-c1', '#b25bff');
  const c2 = readWorldColor(THREE, element, '--swimmer-tool-c2', '#6a1fd6');
  const c3 = readWorldColor(THREE, element, '--swimmer-tool-c3', '#1d0a5c');
  scene.add(new THREE.AmbientLight(c3, 0.45));
  scene.add(new THREE.HemisphereLight(c1, c3, 1.3));

  const key = new THREE.DirectionalLight('#ffffff', 2.2);
  key.position.set(-2.5, 3.5, 4.5);
  scene.add(key);

  const rim = new THREE.PointLight(c1, 2.1, 7);
  rim.position.set(2.2, 0.8, 2.5);
  scene.add(rim);

  const fill = new THREE.PointLight(c2, 0.65, 6);
  fill.position.set(-2, -1, 1.8);
  scene.add(fill);

  const sweep = new THREE.PointLight('#ffffff', 1.5, 5);
  sweep.position.set(-1.8, 0.65, 2.6);
  scene.add(sweep);

  const camera = new THREE.PerspectiveCamera(23, 1, 0.01, 100);
  camera.position.set(0, 0, 3.35);
  camera.lookAt(0, 0, 0);

  return {
    camera,
    root,
    scene,
    sweep,
    triangles: countTriangles(root),
  };
}

class SharedHeroRenderer {
  readonly canvas: HTMLCanvasElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly slots = new Set<HeroSlot>();
  private frameId: number | undefined;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private readonly onVisibilityChange = () => this.wake();
  private readonly onResize = () => this.wake();

  constructor(private readonly THREE: ToolHero3DThree) {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.canvas = this.renderer.domElement;
    this.canvas.className = 'game-ui-tool-hero3d-shared-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.canvas.style.cssText =
      'position:fixed;inset:0;width:100%;height:100%;display:block;pointer-events:none;z-index:1;';
    document.body.append(this.canvas);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    window.addEventListener('resize', this.onResize, { passive: true });
  }

  add(slot: HeroSlot): () => void {
    this.slots.add(slot);
    this.wake();
    return () => {
      if (!this.slots.delete(slot)) return;
      disposeObject(slot.scene.root);
      if (this.slots.size === 0) this.dispose();
    };
  }

  setVisible(element: HTMLElement, visible: boolean): void {
    const slot = this.find(element);
    if (!slot || slot.visible === visible) return;
    slot.visible = visible;
    this.wake();
  }

  setPointer(element: HTMLElement, x: number, y: number): void {
    const slot = this.find(element);
    if (!slot) return;
    slot.pointerX = slot.reducedMotion ? 0 : Math.max(-1, Math.min(1, x));
    slot.pointerY = slot.reducedMotion ? 0 : Math.max(-1, Math.min(1, y));
    this.wake();
  }

  wake(): void {
    if (document.visibilityState === 'hidden') return;
    this.render(performance.now());
    if (this.shouldAnimate() && this.frameId === undefined)
      this.frameId = window.requestAnimationFrame((time) => {
        this.frameId = undefined;
        this.wakeAt(time);
      });
  }

  private wakeAt(time: number): void {
    if (document.visibilityState === 'hidden') return;
    this.render(time);
    if (this.shouldAnimate())
      this.frameId = window.requestAnimationFrame((next) => {
        this.frameId = undefined;
        this.wakeAt(next);
      });
  }

  private render(time: number): void {
    const started = performance.now();
    this.resize();
    this.renderer.info.reset();
    this.renderer.setScissorTest(false);
    this.renderer.clear(true, true, true);
    this.renderer.setScissorTest(true);

    const viewportHeight = window.innerHeight;
    for (const slot of this.slots) {
      if (!slot.visible) continue;
      const rect = slot.element.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) continue;

      const width = Math.max(1, Math.round(rect.width * this.dpr));
      const height = Math.max(1, Math.round(rect.height * this.dpr));
      const left = Math.max(0, Math.round(rect.left * this.dpr));
      const bottom = Math.max(0, Math.round((viewportHeight - rect.bottom) * this.dpr));
      if (left >= this.width || bottom >= this.height) continue;

      this.updateMotion(slot, time);
      slot.scene.camera.aspect = rect.width / rect.height;
      slot.scene.camera.updateProjectionMatrix();
      this.renderer.setViewport(
        left,
        bottom,
        Math.min(width, this.width - left),
        Math.min(height, this.height - bottom),
      );
      this.renderer.setScissor(
        left,
        bottom,
        Math.min(width, this.width - left),
        Math.min(height, this.height - bottom),
      );
      this.renderer.render(slot.scene.scene, slot.scene.camera);
    }

    this.renderer.setScissorTest(false);
    const frameTimeMs = performance.now() - started;
    const rendererCount = 1;
    for (const slot of this.slots) {
      if (!slot.visible) continue;
      slot.metrics?.({
        frameTimeMs,
        rendererCount,
        triangles: slot.scene.triangles,
      });
    }
  }

  private updateMotion(slot: HeroSlot, time: number): void {
    const phase = ((time - slot.startedAt) / IDLE_PERIOD_MS) * Math.PI * 2;
    const sway = slot.reducedMotion ? 0 : Math.sin(phase) * YAW_SWAY;
    const float = slot.reducedMotion ? 0 : Math.sin(phase + Math.PI / 2) * 0.045;
    slot.scene.root.rotation.y = sway;
    slot.scene.root.position.y = float;
    slot.scene.sweep.position.x = slot.reducedMotion ? 0 : Math.sin(phase * 0.82) * 1.9;
    slot.scene.sweep.position.y = slot.reducedMotion ? 0.65 : 0.65 + Math.cos(phase * 0.82) * 0.32;

    const pointerX = slot.reducedMotion ? 0 : slot.pointerX;
    const pointerY = slot.reducedMotion ? 0 : slot.pointerY;
    slot.scene.camera.position.x = pointerX * CAMERA_PARALLAX_X;
    slot.scene.camera.position.y = pointerY * CAMERA_PARALLAX_Y;
    slot.scene.camera.position.z = 3.35;
    slot.scene.camera.lookAt(0, float, 0);
  }

  private resize(): void {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    if (width === this.width && height === this.height && dpr === this.dpr) return;
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);
  }

  private shouldAnimate(): boolean {
    return (
      document.visibilityState !== 'hidden' &&
      [...this.slots].some((slot) => slot.visible && !slot.reducedMotion)
    );
  }

  private find(element: HTMLElement): HeroSlot | undefined {
    return [...this.slots].find((slot) => slot.element === element);
  }

  dispose(): void {
    if (this.frameId !== undefined) window.cancelAnimationFrame(this.frameId);
    this.frameId = undefined;
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    this.canvas.remove();
    if (sharedRenderer === this) sharedRenderer = undefined;
  }
}

export function getSharedHeroRenderer(THREE: ToolHero3DThree): SharedHeroRenderer {
  if (!sharedRenderer) sharedRenderer = new SharedHeroRenderer(THREE);
  return sharedRenderer;
}

export function registerHeroScene(
  THREE: ToolHero3DThree,
  scene: ToolHero3DScene,
  element: HTMLElement,
  reducedMotion: boolean,
  metrics?: (metrics: ToolHero3DFrameMetrics) => void,
): {
  setPointer: (x: number, y: number) => void;
  setVisible: (visible: boolean) => void;
  unregister: () => void;
} {
  const renderer = getSharedHeroRenderer(THREE);
  const slot: HeroSlot = {
    element,
    ...(metrics ? { metrics } : {}),
    pointerX: 0,
    pointerY: 0,
    reducedMotion,
    scene,
    startedAt: performance.now(),
    visible: true,
  };
  const unregister = renderer.add(slot);
  return {
    setPointer: (x, y) => renderer.setPointer(element, x, y),
    setVisible: (visible) => renderer.setVisible(element, visible),
    unregister,
  };
}
