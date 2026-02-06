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
src/
  components/     # Layout, Navbar, PageMeta, Breadcrumbs, Tags, SocialLinks, ThemeToggle, ReadTime
  content/
    posts/        # Blog posts (*.md)
    about.md      # About page content
  lib/            # posts.ts, post-icons.tsx, site.ts, social.ts, about.ts, read-time.ts
  pages/          # Home, About, Blog, BlogPost, Contact, NotFound
```

## Blog

- **Content**: Add `.md` files in `src/content/posts/` with required frontmatter: `title`, `slug`, `date`, `language`, and optional `description`, `tags`.
- **Loading**: Posts are loaded at build time via `import.meta.glob` — no runtime fetch.
- **API**: `getPosts()`, `getPost(slug)`, `getAllTags(posts)`, `filterPostsByTag(posts, tag)` from `src/lib/posts.ts`.
- **Routes**: `/blog` (list), `/blog/:slug` (post), `/tags/:tag` (filtered list).

## Site Config

- `src/lib/site.ts`: Site name, author, email, avatar, social links. Used by PageMeta, Contact, etc.
- `src/lib/social.ts`: Social links config for SocialLinks component.

## Styling & Theming

- **Tailwind**: `src/index.css` imports Tailwind and defines `@theme` variables.
- **Dark mode**: Class-based (add `.dark` to `<html>`). ThemeToggle persists to localStorage.
- **Navbar**: Styles use `--nav-link-color`, `--nav-link-active-color`, `--nav-link-hover-bg`, `--nav-link-active-underline`.
- **Accent**: `--color-accent`, `--color-accent-link` for links and focus states.

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
