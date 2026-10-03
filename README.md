# Internet Time Machine

A playable interactive museum of the **fictional** internet. Pick a year (1995–2025), sit down at an era-accurate virtual computer, and explore a fully simulated web. All content is fictional and generated locally — no backend, no external sites.

**Live demo:** `https://USERNAME.github.io/REPOSITORY/` (after GitHub Pages deploy)

## Quick start

```bash
npm install
npm run dev
npm run build
```

## GitHub Pages deployment

1. Push this folder's contents to a GitHub repo (as the repo root, or adjust paths).
2. The workflow in `.github/workflows/deploy.yml` builds with Vite and deploys `dist/` to Pages.
3. In repo settings → Pages → Source: **GitHub Actions**.
4. `vite.config.ts` uses `base: './'` so it works at any `USERNAME.github.io/REPOSITORY/` without hard-coding the name.

No API keys. No backend. All simulation, filesystem, mail, chat, search index, games, music (Web Audio), and mysteries run locally. Persistence uses `localStorage`.
