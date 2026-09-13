# abhinav.app

Personal site of Abhinav Karthik. Next.js 16, React 19, TypeScript, Tailwind v4, react-three-fiber.

## Run

```bash
npm install        # .npmrc sets legacy-peer-deps for r3f's optional Expo peers
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint && npm run typecheck
```

## Where things live

| Path | What |
| --- | --- |
| `src/content/*.ts` | All copy and data: profile, experience, projects, research, skills. Edit these, not the components. |
| `src/content/work/*.mdx` | Long-form case studies, keyed by project slug in `index.ts`. GFM tables supported. |
| `src/app/` | Routes: `/`, `/work/[slug]`, `/research`, `/resume`, sitemap, robots, OG image. |
| `src/components/sections/` | Home-page sections in order: hero, now, work, research, experience, skills, about. |
| `src/components/three/` | WebGL: hero particle field, skills constellation. Both fall back to static markup. |
| `src/components/demos/` | Live canvas demos. Read `demos/README.md` before adding one; register it in `demo-embed.tsx`. |
| `public/work/<slug>/` | Screenshots (WebP) referenced from `projects.ts`. |
| `public/Abhinav_Karthik_Resume.pdf` | Generated from `/resume` with print styles (Playwright `page.pdf`). Regenerate after editing content. |

## Conventions

- One accent colour (`--color-accent`, lime). Everything else is the grey ramp in `globals.css`.
- `prefers-reduced-motion` disables the WebGL hero, demo loops and reveals.
- Papers under review are listed by topic, not title, until decisions land (`revealTitle` in `research.ts`).
- No usage-based AI on the site. The chat bubble is Voiceflow's free tier.

## Deploy

Vercel builds the GitHub default branch to abhinav.app and every other branch to a protected preview.
