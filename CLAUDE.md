# Project: August's Personal Website

Next.js 16 (App Router) personal portfolio with animated project demo cards.

## Tech Stack
- **Next.js 16** — App Router, `src/` dir, TypeScript strict
- **Tailwind CSS v4** — `@theme inline` CSS-first config in `globals.css`
- **Framer Motion** — all animations (spring physics, AnimatePresence, useInView)
- **next-mdx-remote-client/rsc** + **gray-matter** — MDX content pipeline

## Design Tokens (defined in `src/app/globals.css`)
- Background: `#050505`, Foreground: `#f0f0f0`, Muted: `#888888`
- Accent: `#e0ff00` (electric chartreuse), Surface: `#111111`, Border: `#222222`
- Fonts: Inter (sans), Geist Mono (mono), EB Garamond (serif)

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
