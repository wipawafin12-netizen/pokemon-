# Deployment Guide

## Local development

```bash
npm install
npm run dev          # http://localhost:3000 (Turbopack)
```

Quality gates:

```bash
npx tsc --noEmit                      # types
npx tsx scripts/validate-data.ts      # data integrity (counts, refs, map walkability)
npx tsx scripts/smoke-battle.ts       # engine balance simulation
npm run build                         # production build
node scripts/verify-boot.mjs          # Playwright: boot → save → starter → world (needs dev server)
node scripts/verify-battle.mjs        # Playwright: encounter → skill → capture → end
```

## Vercel (recommended)

1. Push to GitHub:
   ```bash
   git add -A && git commit -m "Eternal Monsters v1.0" && git push
   ```
2. [vercel.com/new](https://vercel.com/new) → import the repo. Framework auto-detects **Next.js**; no env vars, no config needed (the game is fully client-side; the only route is statically prerendered).
3. Deploy. Done — saves live in each player's browser LocalStorage.

CLI alternative: `npx vercel --prod`.

### Notes

- **Next.js 16**: Turbopack is the default for `next dev`/`next build` — do not add a webpack config.
- Phaser (~1.2 MB gz) is code-split and lazy-loaded only when a save is opened; the landing route ships only the menu shell.
- Static media in `public/assets/**` is CDN-cached by Vercel automatically.
- No server state: scaling, regions and preview deployments all work with zero configuration.

## Self-hosting

```bash
npm run build
npm start            # node server on :3000
```
Or containerize: `FROM node:20-alpine`, copy, `npm ci && npm run build`, `CMD ["npm","start"]`. Behind any static-capable proxy (nginx/caddy) no special headers are required; the game uses no cookies and no APIs.

## Release checklist

- [ ] `validate-data` + `smoke-battle` + `tsc` + `build` all green
- [ ] Playwright boot & battle scripts pass against a local prod build (`npm start`)
- [ ] Bump `version` in `package.json`; if `PlayerSave` shape changed, add a migration in `SaveManager.migrate` and bump `SAVE_VERSION`
- [ ] Lighthouse mobile: LCP < 2.5s on the menu route
