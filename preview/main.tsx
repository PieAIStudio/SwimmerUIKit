import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { GameUiPreview } from '../src/GameUiPreview';
import { setClayAssetMode } from '../src/clay/assets';
import { ShowcaseNav } from './ShowcaseNav';
import { ComponentCatalog } from './catalog/ComponentCatalog';
import '../src/styles.css';
import '../src/preview.css';
import '../src/fonts.css';

// The showcase serves the real clay game-icon PNGs from public/assets, so
// render every component with the source assets instead of the inline SVG
// placeholders. (Consumers of the package keep the inline default.)
setClayAssetMode('source');

const root = document.getElementById('root');

if (!root) {
  throw new Error('Preview root element was not found.');
}

createRoot(root).render(
  <StrictMode>
    <ShowcaseNav current="components" />
    {new URLSearchParams(window.location.search).get('view') === 'reference' ||
    window.location.hash.startsWith('#game-ui-preview-') ? (
      <GameUiPreview />
    ) : (
      <ComponentCatalog />
    )}
  </StrictMode>,
);
