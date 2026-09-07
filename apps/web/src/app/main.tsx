import '@xyflow/react/dist/style.css';
import '../styles.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('App root element was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
