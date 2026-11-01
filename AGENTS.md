# AGENTS.md

Guidance for AI agents working on this project.

## Tech Stack

- **Build**: Vite (rolldown), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **Content**: Markdown with YAML frontmatter, parsed at build time via gray-matter
- **Markdown**: react-markdown + remark-gfm

## Project Structure

```
blog/            # Blog posts (*.md)
src/
  components/    # Layout, Navbar, PageMeta, Breadcrumbs, Tags, SocialLinks, ThemeToggle, ReadTime
  content/
    about.md     # About page content
  lib/           # posts.ts, post-icons.tsx, site.ts, social.ts, about.ts, read-time.ts
  pages/         # Home, About, Blog, BlogPost, Contact, NotFound
```

## Blog

- **Content**: Add `.md` files in `blog/` (project root) with required frontmatter: `title`, `slug`, `date`, `language`, and optional `description`, `tags`.
- **Loading**: Posts are loaded at build time via `import.meta.glob` — no runtime fetch.
- **API**: `getPosts()`, `getPost(slug)`, `getAllTags(posts)`, `filterPostsByTag(posts, tag)` from `src/lib/posts.ts`.
- **Routes**: `/blog` (list), `/blog/:slug` (post), `/tags/:tag` (filtered list).

## Site Config

- `src/lib/site.ts`: Site name, author, email, avatar, social links, `disqusShortname`. Used by PageMeta, Contact, DisqusComments, etc.
- `src/lib/social.ts`: Social links config for SocialLinks component.

## Styling & Theming

- **Tailwind**: `src/index.css` imports Tailwind and defines `@theme` variables.
- **Dark mode**: Class-based (add `.dark` to `<html>`). ThemeToggle persists to localStorage.
- **Navbar**: Styles use `--nav-link-color`, `--nav-link-active-color`, `--nav-link-hover-bg`, `--nav-link-active-underline`.
- **Accent**: `--color-accent`, `--color-accent-link` for links and focus states.

## Disqus

- **DisqusComments** (`src/components/DisqusComments.tsx`): Renders Disqus thread on blog posts. Uses `SITE.disqusShortname` from `site.ts`. Set to empty string to disable. Uses `disqus-react` package.

## Post Icons

- `PostIcon` in `src/lib/post-icons.tsx` maps the **first tag** (lowercase) to a Lucide icon via `TAG_ICON_MAP`.
- Add new tag→icon mappings in `TAG_ICON_MAP`. Use `createElement` to avoid "components during render" lint errors.

## SEO & Meta

- **PageMeta**: Sets title, description, canonical, OG, Twitter, keywords, JSON-LD. Supports breadcrumb list.
- **Breadcrumbs**: Optional UI + BreadcrumbList JSON-LD.

## Build & Scripts

- `npm run build`: TypeScript, Vite build, then `scripts/generate-static-paths.mjs`, `scripts/rss.mjs`, `scripts/sitemap.mjs`.
- **generate-static-paths**: Creates `dist/<path>/index.html` for each route (about, blog, blog/:slug, tags/:tag, contact) so GitHub Pages serves 200 OK and SEO is preserved.
- **Buffer**: gray-matter uses `Buffer`; polyfill is applied in `main.tsx` and aliased in `vite.config.ts`.

## E2E

- Playwright tests in `e2e/`. CI runs `npm run e2e` after build.
- SPA fallback in Vite ensures routes like `/blog/my-post` serve `index.html` for client-side routing.

## Conventions

- Use `aria-label` for icon-only links.
- Prose styles in `index.css` for blog post content.
- Keep files that need Fast Refresh exporting only React components — move shared constants/functions to separate files.

## Rules

### Rule 1 — Think Before Coding

State assumptions explicitly. If uncertain, ask rather than guess.
Present multiple interpretations when ambiguity exists.
Push back when a simpler approach exists.
Ask only what the code and these files cannot answer. An option states a choice, never a requirement the user did not give; recommend one.
Stop when confused. Name what is unclear.

### Rule 2 — Simplicity First

Minimum code that solves the problem. Nothing speculative.
No features beyond what was asked. No abstractions for single-use code.
Test: would a senior engineer say this is overcomplicated? If yes, simplify.

### Rule 3 — Surgical Changes

Touch only what you must. Clean up only your own mess.
Do not “improve” adjacent code, comments, or formatting.
Do not refactor what is not broken. Match existing style unless it contradicts these files (Rule 11).

### Rule 4 — Goal-Driven Execution

Define success criteria. Loop until verified.
Do not follow steps blindly. Define success and iterate.
Strong success criteria let you loop independently.

### Rule 5 — Use the model only for judgment calls

Use the model for: classification, drafting, summarization, extraction.
Do not use the model for: routing, retries, deterministic transforms.
If code can answer or produce it, code does: count, search, check, convert and generate with a command, because a command's output is exact and can be rerun, and reasoning that imitates it is neither.

### Rule 6 — Do not spiral

Do not loop on the same failure. If repeated attempts fail, stop and ask.
Say so when you are looping. Do not silently retry.

### Rule 7 — Surface conflicts, do not average them

If two patterns contradict, follow these files and the Skills precedence; where they are silent, the more recent and better-tested one.
Explain why. Flag the other for cleanup.
Do not blend conflicting patterns.
When a rule blocks what the task needs, stop and name the rule; do not work around it.

### Rule 8 — Read before you write

Before adding code, read exports, immediate callers, shared utilities.
Before adding a type, a helper or an option, find the one that exists and use it, because two names for one concept split every caller. A new one needs the reason none fits.
“Looks orthogonal” is dangerous. If unsure why code is structured a way, ask.

### Rule 9 — Tests verify intent, not just behavior

Tests must encode why behavior matters, not just what it does.
A test that cannot fail when business logic changes is wrong.

### Rule 10 — Checkpoint after every significant step

Summarize what was done, what is verified, what is left.
Do not continue from a state you cannot describe back.
If you lose track, stop and restate.

### Rule 11 — Fail loud

“Completed” is wrong if anything was skipped silently.
“Tests pass” is wrong if any were skipped.
Default to surfacing uncertainty, not hiding it.
