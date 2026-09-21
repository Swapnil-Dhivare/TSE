# TSE Agency Website

A static marketing site for TSE Agency — digital growth infrastructure for growing businesses.
No backend, no database: content lives in code and the contact form posts straight to a
third-party form service.

## Stack

- Vite + React 19 + TypeScript
- React Router for multi-page routing
- Tailwind CSS v4 (CSS-first `@theme` config in `src/index.css`)
- `@react-three/fiber` + `@react-three/drei` for the interactive 3D hero accent
- Framer Motion for restrained entrance/scroll-reveal animation

## Getting started

This repo pins a Node version via `.nvmrc`. If you use [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm use
```

Then:

```bash
npm install
npm run dev
```

## Contact form

The contact form (`src/components/marketing/ContactForm.tsx`) posts to whatever URL is set in
`VITE_FORM_ENDPOINT`. To wire it up:

1. Copy `.env.example` to `.env`
2. Create a free form at [Formspree](https://formspree.io) (or a similar service)
3. Paste the endpoint into `VITE_FORM_ENDPOINT` in `.env`

Until that's set, the form will show a clear "not connected yet" message instead of failing
silently.

## Content

Services, case studies and testimonials are static data, not pulled from an API:

- `src/content/services.ts`
- `src/content/case-studies.ts`
- `src/content/testimonials.ts`

All current case studies/testimonials are placeholders — swap them for real client work whenever
it's available.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and produce a production build in `dist/`
- `npm run preview` — preview the production build
- `npm run lint` — run Oxlint

## Deployment (Vercel)

The app lives in `tse-website/` inside the repo, so in the Vercel project settings set
**Root Directory → `tse-website`**. Vercel then picks up `vercel.json` from this folder.

`vercel.json` provides the SPA rewrite (`/(.*)` → `/index.html`). This is required: without it
any deep link — `/case-studies/:slug`, and later `/auth/callback` for OAuth — returns 404 in
production even though it works fine under `vite dev`, because those paths are not real files.
