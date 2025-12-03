# Stokify - TA PRakPPB

## Development
## Offline / PWA

- This app includes a simple offline-capable setup:
	- A service worker (`public/sw.js`) caches the app shell and same-origin static assets so the UI can load offline after first visit.
	- API responses (materials, products, finance summaries, profile etc.) are stored in `localStorage` so read views can show the latest fetched data when offline.
	- Create / update / delete operations are blocked while offline. UI buttons are disabled and the API client throws an error if attempted offline.
	- When the device returns online the app will automatically refetch key resources and update the cached data.

To test the PWA behavior, build and serve the app (service worker registers only in production):

```bash
npm run build
npx serve dist
```

Open the site, allow it to load fully, then turn off network in DevTools to test offline.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
