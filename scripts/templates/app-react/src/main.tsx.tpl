import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@portfolio/shared/tokens.css';
import '@portfolio/shared/base.css';
import './styles.css';
import App from './App';

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
