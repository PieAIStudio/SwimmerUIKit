import type { Meta, StoryObj } from '@storybook/react-vite';
import type { BufferGeometry, Material } from 'three';
import { ToolLanding, ToolSidebar, ToolWindow, type ToolWorld } from '../../tool-worlds';
import { ToolHero3D, type ToolHero3DBuilder, type ToolHero3DModel } from '../../tool-hero-3d';
import { ToolIcon, type ToolIconName } from '../../icons/ToolIcon/ToolIcon';
import autoContinueFallback from '../../hero3d/fallbacks/auto-continue.png';
import attendantFallback from '../../hero3d/fallbacks/attendant.png';
import claudeSyncFallback from '../../hero3d/fallbacks/claude-sync.png';
import mailWardFallback from '../../hero3d/fallbacks/mail-ward.png';
import onePlaceFallback from '../../hero3d/fallbacks/one-place.png';
import './component.css';

type MatrixWorld = {
  appName: string;
  builder: ToolHero3DBuilder;
  fallback: string;
  icon: ToolIconName;
  lead: string;
  title: string;
  world: Extract<ToolWorld, 'teal' | 'coral' | 'violet' | 'indigo' | 'magenta'>;
};

const material = (THREE: Parameters<ToolHero3DBuilder>[0], color: string) =>
  new THREE.MeshStandardMaterial({ color, metalness: 0.04, roughness: 0.54 });

const mesh = (
  THREE: Parameters<ToolHero3DBuilder>[0],
  geometry: BufferGeometry,
  materialValue: Material,
) => new THREE.Mesh(geometry, materialValue);

const buildOnePlace: ToolHero3DBuilder = (THREE) => {
  const group = new THREE.Group();
  const folder = mesh(THREE, new THREE.BoxGeometry(1.55, 1.02, 0.28), material(THREE, '#39e0c4'));
  folder.position.y = -0.08;
  group.add(folder);
  const tab = mesh(THREE, new THREE.BoxGeometry(0.58, 0.25, 0.28), material(THREE, '#6af0d8'));
  tab.position.set(-0.42, 0.57, 0);
  group.add(tab);
  const paper = mesh(THREE, new THREE.BoxGeometry(1.2, 0.78, 0.08), material(THREE, '#effaf5'));
  paper.position.set(0, 0.04, 0.18);
  group.add(paper);
  return group;
};

const buildMailWard: ToolHero3DBuilder = (THREE) => {
  const group = new THREE.Group();
  const envelope = mesh(THREE, new THREE.BoxGeometry(1.55, 1.02, 0.25), material(THREE, '#e0442f'));
  group.add(envelope);
  const seamMaterial = material(THREE, '#ffd7c5');
  for (const [rotation, x] of [
    [-0.58, -0.27],
    [0.58, 0.27],
  ] as const) {
    const seam = mesh(THREE, new THREE.BoxGeometry(1.2, 0.07, 0.28), seamMaterial);
    seam.rotation.z = rotation;
    seam.position.set(x, 0.02, 0.17);
    group.add(seam);
  }
  const flap = mesh(THREE, new THREE.CylinderGeometry(0.66, 0.66, 0.1, 4), seamMaterial);
  flap.rotation.x = Math.PI / 2;
  flap.rotation.z = Math.PI / 4;
  flap.position.set(0, 0.32, 0.19);
  flap.scale.set(1.1, 0.7, 1);
  group.add(flap);
  return group;
};

const buildClaudeSync: ToolHero3DBuilder = (THREE) => {
  const group = new THREE.Group();
  const violet = material(THREE, '#b25bff');
  const highlight = material(THREE, '#c78bff');
  const first = mesh(THREE, new THREE.TorusGeometry(0.48, 0.14, 14, 28), violet);
  first.position.set(-0.28, 0.12, 0);
  first.rotation.z = -0.3;
  group.add(first);
  const second = mesh(THREE, new THREE.TorusGeometry(0.48, 0.14, 14, 28), highlight);
  second.position.set(0.28, -0.12, 0.03);
  second.rotation.z = 0.3;
  group.add(second);
  return group;
};

const buildAttendant: ToolHero3DBuilder = (THREE) => {
  const group = new THREE.Group();
  const indigo = material(THREE, '#7b7bff');
  const soft = material(THREE, '#a3a3ff');
  const band = mesh(THREE, new THREE.TorusGeometry(0.56, 0.13, 14, 28), indigo);
  band.position.y = 0.12;
  group.add(band);
  const face = mesh(THREE, new THREE.SphereGeometry(0.38, 20, 14), soft);
  face.position.set(0, -0.08, 0.08);
  face.scale.set(1, 0.94, 0.7);
  group.add(face);
  for (const x of [-0.56, 0.56]) {
    const ear = mesh(THREE, new THREE.CylinderGeometry(0.16, 0.16, 0.28, 16), indigo);
    ear.rotation.x = Math.PI / 2;
    ear.position.set(x, -0.03, 0);
    group.add(ear);
  }
  return group;
};

const buildAutoContinue: ToolHero3DBuilder = (THREE) => {
  const group = new THREE.Group();
  const magenta = material(THREE, '#ff5fd0');
  const highlight = material(THREE, '#ff8fe0');
  const button = mesh(THREE, new THREE.CylinderGeometry(0.68, 0.68, 0.24, 32), magenta);
  button.rotation.x = Math.PI / 2;
  group.add(button);
  const play = mesh(THREE, new THREE.CylinderGeometry(0.34, 0.34, 0.12, 3), highlight);
  play.rotation.x = Math.PI / 2;
  play.rotation.z = -Math.PI / 2;
  play.position.z = 0.18;
  play.position.x = 0.08;
  group.add(play);
  return group;
};

const worlds: readonly MatrixWorld[] = [
  {
    appName: 'OnePlace',
    builder: buildOnePlace,
    fallback: onePlaceFallback,
    icon: 'folder',
    lead: 'Everything in one calm place.',
    title: 'OnePlace',
    world: 'teal',
  },
  {
    appName: 'MailWard',
    builder: buildMailWard,
    fallback: mailWardFallback,
    icon: 'mail',
    lead: 'A lighter way to keep mail tidy.',
    title: 'MailWard',
    world: 'coral',
  },
  {
    appName: 'ClaudeSync',
    builder: buildClaudeSync,
    fallback: claudeSyncFallback,
    icon: 'sync',
    lead: 'Your work, quietly in step.',
    title: 'ClaudeSync',
    world: 'violet',
  },
  {
    appName: 'Attendant',
    builder: buildAttendant,
    fallback: attendantFallback,
    icon: 'bell',
    lead: 'A thoughtful hand when you need it.',
    title: 'Attendant',
    world: 'indigo',
  },
  {
    appName: 'AutoContinue',
    builder: buildAutoContinue,
    fallback: autoContinueFallback,
    icon: 'play',
    lead: 'Keep the next step within reach.',
    title: 'AutoContinue',
    world: 'magenta',
  },
];

function sidebar(world: MatrixWorld, mode: 'normal' | 'rail') {
  return (
    <ToolSidebar
      appIcon={<ToolIcon name={world.icon} />}
      appName={world.appName}
      items={[
        { id: 'home', icon: <ToolIcon name="spark" />, label: 'Overview', selected: true },
        { id: 'items', icon: <ToolIcon name="list" />, label: 'Items', badge: 12 },
        { id: 'settings', icon: <ToolIcon name="gear" />, label: 'Settings' },
      ]}
      mode={mode}
      navLabel={`${world.appName} tool navigation`}
    />
  );
}

function modelFor(world: MatrixWorld): ToolHero3DModel {
  return {
    alt: `${world.appName} placeholder 3D hero`,
    build: world.builder,
    fallback: world.fallback,
    id: `${world.world}-placeholder`,
  };
}

function HeroMotionPairView() {
  return (
    <div className="game-ui-colour-worlds-motion-pair">
      <header className="game-ui-colour-worlds-matrix-heading">
        <span>COLOUR WORLDS / MOTION STUDY</span>
        <h1>Two calm live heroes.</h1>
        <p>
          OnePlace teal and MailWard coral: real 3D geometry, a seven-second idle loop and pointer
          parallax.
        </p>
        <small>PLACEHOLDER MODELS — NOT FINAL PRODUCT ART</small>
      </header>
      <div className="game-ui-colour-worlds-motion-pair-grid">
        {worlds.slice(0, 2).map((world) => (
          <ToolWindow
            className="game-ui-colour-worlds-motion-pair-window"
            key={world.world}
            sidebar={sidebar(world, 'normal')}
            title={world.appName}
            world={world.world}
          >
            <ToolLanding
              art={<span className="game-ui-colour-worlds-matrix-art-fallback" />}
              features={[
                { id: 'one', icon: <ToolIcon name={world.icon} />, title: 'A focused workspace' },
                { id: 'two', icon: <ToolIcon name="spark" />, title: 'Quietly yours' },
              ]}
              lead={world.lead}
              model={modelFor(world)}
              title={world.title}
            />
          </ToolWindow>
        ))}
      </div>
    </div>
  );
}

function WorldMatrix({ mode }: { mode: 'normal' | 'rail' }) {
  return (
    <div className="game-ui-colour-worlds-matrix">
      <header className="game-ui-colour-worlds-matrix-heading">
        <span>COLOUR WORLDS / ROUND 3</span>
        <h1>One app. One colour world.</h1>
        <p>
          Five live Three.js placeholders share one renderer. The object, camera parallax and light
          sweep are deliberately calm; real hero models arrive from the 3D icon route.
        </p>
        <small>PLACEHOLDER MODELS — NOT FINAL PRODUCT ART</small>
      </header>
      <div className="game-ui-colour-worlds-matrix-grid" data-sidebar-mode={mode}>
        {worlds.map((world) => (
          <article
            className="game-ui-colour-worlds-matrix-card"
            data-world-label={world.appName}
            key={world.world}
          >
            <ToolWindow
              className="game-ui-colour-worlds-matrix-window"
              sidebar={sidebar(world, mode)}
              sidebarMode={mode}
              title={world.appName}
              world={world.world}
            >
              <ToolLanding
                art={<span className="game-ui-colour-worlds-matrix-art-fallback" />}
                features={[
                  { id: 'one', icon: <ToolIcon name={world.icon} />, title: 'A focused workspace' },
                  { id: 'two', icon: <ToolIcon name="spark" />, title: 'Quietly yours' },
                ]}
                lead={world.lead}
                model={modelFor(world)}
                title={world.title}
              />
            </ToolWindow>
          </article>
        ))}
      </div>
      <div className="game-ui-colour-worlds-matrix-footnote">
        <ToolHero3D model={modelFor(worlds[0]!)} reducedMotion />
        <span>Static-frame fallback and reduced-motion contract are covered by the hero leaf.</span>
      </div>
    </div>
  );
}

const meta = {
  title: 'Colour Worlds / World matrix',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllFiveWorlds: Story = {
  name: 'All five worlds / normal sidebar',
  render: () => <WorldMatrix mode="normal" />,
};

export const AllFiveWorldsRail: Story = {
  name: 'All five worlds / icon rail',
  render: () => <WorldMatrix mode="rail" />,
};

export const HeroMotionPair: Story = {
  name: 'Two worlds / live hero motion',
  render: () => <HeroMotionPairView />,
};
