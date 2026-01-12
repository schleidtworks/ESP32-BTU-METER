import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (rootElement) {
  rootElement.innerHTML = '<div class="boot-status">Loading dashboard...</div>';
}

window.addEventListener('error', (event) => {
  if (rootElement) {
    rootElement.innerHTML = `<div class="boot-status error">App error: ${event.message}</div>`;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (rootElement) {
    rootElement.innerHTML = `<div class="boot-status error">App error: ${String(event.reason)}</div>`;
  }
});

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
