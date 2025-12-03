import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { getAllBahan, getAllProduk, getAllTransaksi, getSummaryBulanan, getSummaryHarian, getPengeluaranByKategori } from './lib/database'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register service worker in production
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js').catch((e) => console.warn('SW registration failed', e));
}

// When coming back online, refresh cached API data
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    try {
      // refetch commonly used data to update localStorage via database wrappers
      await Promise.all([
        getAllBahan(),
        getAllProduk(),
        getAllTransaksi(),
        getSummaryBulanan(),
        getSummaryHarian(),
        getPengeluaranByKategori(),
      ]);
      console.info('Offline caches refreshed');
    } catch (e) {
      console.warn('Failed to refresh caches on online', e);
    }
  });
}
