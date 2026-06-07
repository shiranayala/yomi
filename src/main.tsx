import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(<App />);

if ('serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller;

  navigator.serviceWorker.register('/sw.js').then(reg => {
    reg.update();

    reg.addEventListener('updatefound', () => {
      const newSW = reg.installing;
      if (!newSW) return;
      newSW.addEventListener('statechange', () => {
        if (newSW.state === 'activated' && hadController) {
          window.location.reload();
        }
      });
    });
  });
}
