import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';
import './input.css';

// 1) import your provider
import { NavProvider } from './contexts/NavContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      {/* 2) wrap your entire app with NavProvider */}
      <NavProvider>
        <App />
      </NavProvider>
    </HelmetProvider>
  </StrictMode>
);
