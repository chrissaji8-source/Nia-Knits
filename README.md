# Nia Knits

## Live likes

Likes are stored in Netlify Blobs through the `netlify/functions/likes.mjs` function. Deploy this project to Netlify for live, shared counts; no database credentials or separate service setup is required. The page refreshes the displayed counts every four seconds and immediately after a visitor likes or unlikes a piece.

Each browser receives a locally stored anonymous visitor ID, which prevents it from adding more than one like to the same piece. This is not an account-based anti-abuse system.

For local testing, run `npm run dev` and open `http://localhost:8888`. It starts Netlify's local runtime alongside Vite, so the live-likes API works locally as well. `npm run dev:vite` is available for frontend-only work, but its likes API is intentionally unavailable.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
