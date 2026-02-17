# Skill: Write Project Description

Write or rewrite the MDX content for a project page (`content/projects/<slug>.mdx`).

## When to Use

When the user asks to write, rewrite, or improve a project's description/简介 on the portfolio site.

## Process

### 1. Gather Context — Ask, Don't Assume

Before writing, ask the user 3–4 targeted questions. Use `AskUserQuestion` with multiple-choice + "Other" so it's fast to answer:

| Question | Why |
|----------|-----|
| **Core features** — what does the project actually do beyond the one-liner? | Avoids generic descriptions |
| **Motivation / "Why I built this"** — what problem triggered the project? | Personal story makes it memorable |
| **Your role** — solo, lead, or contributor? | Determines voice & credit framing |
| **Tech highlights** — what's the most interesting engineering decision? | Gives the Tech Stack section substance |

Optional follow-ups based on answers:
- If they mention an algorithm → ask what kind (genetic, greedy, CSP, etc.)
- If they mention users → ask if they want to include numbers
- If they mention social/sharing → ask for specifics

### 2. Write the MDX

**Structure** (follow the pattern in `youwoai.mdx`):

```mdx
## Why I Built This        ← Optional but recommended. 2–3 sentences, first person.
## Overview                 ← One paragraph. What it does + how it works at a high level.
## Key Features             ← 3–5 bullet points. Bold lead phrase + one-sentence explanation.
## Tech Stack               ← 3–5 bullet points. Framework + what it's used for.
```

**Writing rules:**
- First person is OK for "Why I Built This", third person for everything else
- Lead with the project's **differentiator** (what makes it not just another X)
- Feature bullets: bold the *what*, then explain the *how* or *why it matters*
- Don't inflate — if the user says "don't mention user numbers", respect that
- Keep it scannable: no walls of text, no filler adjectives ("cutting-edge", "powerful")
- Tech Stack bullets should say *what the tech does in this project*, not just list names

### 3. Update Frontmatter If Needed

Common frontmatter fields in `content/projects/*.mdx`:
```yaml
title: "Project Name"
description: "One-liner for cards and meta tags (keep under 160 chars)"
date: "YYYY-MM-DD"
tags: ["React", "Node.js", ...]
featured: true/false
highlight: 1-10         # sort priority
url: "https://..."      # live site
github: "https://..."   # repo link
```

- `description` is shown on project cards — keep it concise and compelling
- `tags` should match the actual tech stack discussed
- Only set `featured: true` if the project has a demo component in `FeaturedBento.tsx`

## Reference Files

| File | Purpose |
|------|---------|
| `content/projects/youwoai.mdx` | Good reference for structure & tone |
| `content/projects/uoft-timetable.mdx` | Example with "Why I Built This" section |
| `src/lib/projects.ts` | Frontmatter schema & parser |
