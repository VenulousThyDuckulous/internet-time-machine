import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { SimProvider } from './store';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SimProvider>
      <App />
    </SimProvider>
  </React.StrictMode>
);
