# Project: August's Personal Website

Next.js 16 (App Router) personal portfolio with animated project demo cards.

## Tech Stack
- **Next.js 16** — App Router, `src/` dir, TypeScript strict
- **Tailwind CSS v4** — `@theme inline` CSS-first config in `globals.css`
- **Framer Motion** — all animations (spring physics, AnimatePresence, useInView)
- **next-mdx-remote-client/rsc** + **gray-matter** — MDX content pipeline

## Design Tokens (defined in `src/app/globals.css`)
Two themes, toggled via `.dark` / `.light` class on `<html>` (default: light).
- **Dark**: bg `#0f0e17`, fg `#fffffe`, accent `#ff8906` (orange), surface `#171625`, border `#2a293d`
- **Light** ("warm paper"): bg `#faf1e0` cream + radial atmosphere washes + grain overlay, fg `#001858` navy, accent `#d6336c` raspberry, surface `#fffdf8`
- Depth: `shadow-card` / `shadow-card-hover` utilities (layered warm shadows in light, hover-lift only in dark)
- Demo windows follow the active theme (the user prefers light-toned demos in light mode — do not force-dark them)
- Fonts: Inter (sans), Geist Mono (mono), EB Garamond (serif) — variables are attached to `<html>` in `layout.tsx`; theme switching must use `classList`, never overwrite `className`

## Key Architecture

### Projects Page (`src/app/projects/page.tsx`)
- **FeaturedBento** — large cards with animated mock-UI demos for featured projects
- **TerminalList** — `$ ls -la` style list for non-featured projects

### Demo System (`src/components/demos/`)
Each featured project has an animated demo component that plays inside its Bento card.
See `.claude/skills/create-demo-animation.md` for the full guide on creating new demos.

### MDX Content (`content/projects/*.mdx`)
- Frontmatter: `title`, `description`, `date`, `tags`, `featured`, `url`, `github`, `image`
- `src/lib/projects.ts` reads and parses all MDX files

### tsconfig.json
- Excludes `YouWoAI-Frontend` and `OpenBrowser-AI` directories (sibling projects in the repo root)
