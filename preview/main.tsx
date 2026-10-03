import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { GameUiPreview } from '../src/preview/GameUiPreview/GameUiPreview';
import { ShowcaseNav } from './ShowcaseNav';
import { ComponentCatalog } from './catalog/ComponentCatalog';
import { ThemeReviewPage } from './review/ThemeReview';
import { CompletionControls } from './review/CompletionReview';
import '../src/styles.css';
import '../src/preview/preview.css';
import '../src/tokens/fonts.css';

// Icons are inline SVG; no copied public assets or initialization.

const root = document.getElementById('root');

if (!root) {
  throw new Error('Preview root element was not found.');
}

createRoot(root).render(
  <StrictMode>
    {new URLSearchParams(window.location.search).get('view') === 'completion' ? (
      <CompletionControls />
    ) : new URLSearchParams(window.location.search).get('view') === 'theme-review' ? (
      <ThemeReviewPage />
    ) : (
      <>
        <ShowcaseNav current="components" />
        {new URLSearchParams(window.location.search).get('view') === 'reference' ||
        window.location.hash.startsWith('#game-ui-preview-') ? (
          <GameUiPreview />
        ) : (
          <ComponentCatalog />
        )}
      </>
    )}
  </StrictMode>,
);
