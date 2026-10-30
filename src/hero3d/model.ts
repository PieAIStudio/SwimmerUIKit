export type ToolLandingHero3DModel =
  | {
      /** A route-v0 primitive builder. The renderer supplies the Three namespace at runtime. */
      build: (...args: never[]) => unknown;
      fallback: string;
      alt?: string;
      id?: string;
    }
  | {
      /** A GLB URL resolved by the optional hero leaf. */
      url: string;
      fallback: string;
      alt?: string;
      id?: string;
    };
