import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { GameUiPreview } from '../src/GameUiPreview';
import '../src/styles.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Preview root element was not found.');
}

createRoot(root).render(
  <StrictMode>
    <GameUiPreview />
  </StrictMode>,
);
