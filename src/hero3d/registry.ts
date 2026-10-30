import type { ComponentType } from 'react';
import type { ToolLandingHero3DModel } from './model';

export type ToolHero3DRenderer = ComponentType<{ model: ToolLandingHero3DModel }>;

const REGISTRY_KEY = '__swimmer_ui_tool_hero_3d_renderer__';
type RendererGlobal = typeof globalThis & { [REGISTRY_KEY]?: ToolHero3DRenderer };

export function registerToolHero3DRenderer(renderer: ToolHero3DRenderer): void {
  (globalThis as RendererGlobal)[REGISTRY_KEY] = renderer;
}

export function getToolHero3DRenderer(): ToolHero3DRenderer | undefined {
  return (globalThis as RendererGlobal)[REGISTRY_KEY];
}
