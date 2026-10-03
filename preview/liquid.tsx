import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { LiquidPreview } from '../src/preview/LiquidPreview/LiquidPreview';
import { ShowcaseNav } from './ShowcaseNav';
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
    <ShowcaseNav current="liquid" />
    <LiquidPreview />
  </StrictMode>,
);
