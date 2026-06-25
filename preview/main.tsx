import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { GameUiPreview } from '../src/GameUiPreview';
import '../src/styles.css';

// Top switcher bar: the same site hosts the visual showcase at "/" and the
// interactive Storybook at "/storybook/". This bar lets you jump between them.
function ShowcaseNav() {
  return (
    <nav
      aria-label="Swimmer UI Kit views"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        padding: '10px 20px',
        background: 'rgba(74,47,31,.94)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        color: '#fff',
        boxShadow: '0 2px 14px rgba(58,37,24,.25)',
      }}
    >
      <span style={{ fontWeight: 700, marginRight: 'auto', letterSpacing: '.02em' }}>
        🟤 Swimmer UI Kit
      </span>
      <a
        aria-current="page"
        href="/"
        style={{
          padding: '6px 14px',
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 600,
          textDecoration: 'none',
          background: '#f28d50',
          color: '#3a2518',
        }}
      >
        组件总览
      </a>
      <a
        href="/storybook/"
        style={{
          padding: '6px 14px',
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 600,
          textDecoration: 'none',
          background: 'rgba(255,255,255,.16)',
          color: '#fff',
        }}
      >
        Storybook →
      </a>
    </nav>
  );
}

const root = document.getElementById('root');

if (!root) {
  throw new Error('Preview root element was not found.');
}

createRoot(root).render(
  <StrictMode>
    <ShowcaseNav />
    <GameUiPreview />
  </StrictMode>,
);
