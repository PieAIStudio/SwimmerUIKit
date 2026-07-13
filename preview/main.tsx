import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { GameUiPreview } from '../src/GameUiPreview';
import { setClayAssetMode } from '../src/clay/assets';
import '../src/styles.css';
import '../src/preview.css';
import '../src/fonts.css';

// The showcase serves the real clay game-icon PNGs from public/assets, so
// render every component with the source assets instead of the inline SVG
// placeholders. (Consumers of the package keep the inline default.)
setClayAssetMode('source');

const THEME_STORAGE_KEY = 'swimmer-ui-preview-theme';

function readStoredTheme(): 'light' | 'night' {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'night' ? 'night' : 'light';
  } catch {
    return 'light';
  }
}

// The kit's flagship theming feature (full dark reskin via one data
// attribute) had no way to demo itself — you had to know to poke devtools.
// This flips the same data-game-ui-theme the design-system-guide documents,
// on the same element (<html>) a real host app would use.
function useThemeToggle(): [theme: 'light' | 'night', toggle: () => void] {
  const [theme, setTheme] = useState<'light' | 'night'>(() => readStoredTheme());

  useEffect(() => {
    if (theme === 'night') {
      document.documentElement.setAttribute('data-game-ui-theme', 'night');
    } else {
      document.documentElement.removeAttribute('data-game-ui-theme');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage may be unavailable (private mode, disabled) — theme still
      // applies for this session, it just won't persist across reloads.
    }
  }, [theme]);

  return [theme, () => setTheme((current) => (current === 'night' ? 'light' : 'night'))];
}

// Top switcher bar: the same site hosts the visual showcase at "/" and the
// interactive Storybook at "/storybook/". This bar lets you jump between them.
function ShowcaseNav() {
  const [theme, toggleTheme] = useThemeToggle();
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
      <button
        aria-pressed={theme === 'night'}
        onClick={toggleTheme}
        type="button"
        style={{
          padding: '6px 14px',
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 600,
          border: 'none',
          cursor: 'pointer',
          background: 'rgba(255,255,255,.16)',
          color: '#fff',
        }}
      >
        {theme === 'night' ? '🌙 Night' : '☀️ Light'}
      </button>
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
        href="https://swimmer-ui-storybook.pieaistudio.com/"
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
