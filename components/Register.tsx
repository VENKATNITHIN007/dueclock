// components/RegisterSW.tsx
'use client'
import { useEffect } from 'react'

export default function RegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('✅ Service Worker registered:', reg);

          // Optional: detect a waiting worker and prompt user
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker?.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('⚡ New content available — please refresh.');
                } else {
                  console.log('🏁 Content cached for offline use.');
                }
              }
            });
          });
        })
        .catch((err) => console.error('❌ SW registration failed:', err));
    }
  }, []);

  return null;
}