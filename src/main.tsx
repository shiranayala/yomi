import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(<App />);

// iOS only applies :active (button press feedback) when a touch listener exists
document.addEventListener('touchstart', () => {}, { passive: true });

if ('serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller;

  // A newer version was just fetched in the background. Right after launch,
  // switch to it straight away; later on, leave it for the next launch.
  navigator.serviceWorker.addEventListener('message', e => {
    if (e.data?.type === 'yomi-new-version' && performance.now() < 15000) {
      window.location.reload();
    }
  });

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
