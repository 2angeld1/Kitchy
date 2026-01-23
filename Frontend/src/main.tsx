import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Clean up any stale service workers from previous runs/templates
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      console.log('Unregistering stale service worker:', registration);
      registration.unregister();
    }
  });
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);