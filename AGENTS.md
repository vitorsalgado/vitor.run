# AGENTS.md

Guidance for agents working on this project.

## Tech Stack

- **Runtime**: Node.js 24, npm.
- **Site**: VitePress 2.0.0-alpha.21, Vue 3, TypeScript.
- **Styling**: VitePress default theme extended with components and CSS.
- **Content**: Markdown with strict YAML frontmatter, validated at build time.
- **Markdown**: VitePress with task lists and a Gradle language alias.

## Project Structure

```
blog/                  # Original post Markdown and relative images
site/                  # Static pages and dynamic post/tag routes
  .vitepress/          # Configuration, content model, SEO, publication files, theme
  public/              # Always-public assets
src/
  assets/avatar.jpeg   # Shared author image
  lib/                 # Site/social configuration, post types, read time, icon names
public/                # Existing favicon, 404, domain, and policy files copied by build
scripts/               # Post creation, draft preview, static preview, verification
e2e/                  # Playwright publication and interaction tests
```

## Content and Routes

- Keep posts in `blog/*.md`. Required: `title`, `slug`, `date`, `language`. Optional: `description`, `tags`, `draft`.
- The shared Node-only model is `site/.vitepress/posts.ts`: `getPostSources()`, `getPublishedPosts()`, and `getSitePosts()`.
- `src/lib/posts.ts` contains types only. Never import raw posts into browser code.
- `draft: true` excludes a post before production routes, data, images, SEO, and feeds are generated. A future date does not schedule publication.
- `getPublishedPosts()` always excludes drafts. `getSitePosts()` includes them only in the local draft preview, never in a build.
- Do not bypass strict YAML, date, slug, language, or image validation.
- Routes use trailing slashes: `/blog/`, `/blog/:slug/`, `/tags/:tag/`, `/about/`, `/contact/`.
- Relative post images resolve from the original Markdown file. Root-relative images resolve from `site/public`, which is always public.
- About is authored in `site/about/index.md`; Contact uses the shared site configuration.

## Configuration and Theme

- `src/lib/site.ts` owns the site identity, canonical origin, language, contact details, social image, Disqus shortname, and GA4 ID.
- `src/lib/social.ts` owns social links. `src/lib/post-icon-names.ts` maps the first tag to its icon.
- Extend the public VitePress default-theme API and layout slots. Do not copy or override internal default-theme components.
- Styles are in `site/.vitepress/theme/style.css`. Dark mode uses the native class and the localStorage key `theme`.
- Use accessible names for icon-only controls, keyboard interactions, and navigation.
- Disqus uses stable post slugs as identifiers and loads only on the canonical production origin. Preserve identifiers when editing posts.
- Analytics initializes once on the production origin; GA4 owns automatic page views. Do not add duplicate manual page-view events.

## Build and Verification

- `npm run dev` serves published content; `npm run dev:drafts` serves the explicit local draft preview.
- `npm run new:post -- "Title"` creates an unpublished Markdown file without overwriting existing files or slugs.
- `npm run build` validates content, checks types, and generates a production artifact in `dist/`.
- Development is non-indexable. `VITOR_PRODUCTION=0 npm run build` creates a non-indexable artifact; flags must never make a development server indexable.
- `site/.vitepress/seo.ts` owns metadata/schema. `publication.ts` owns RSS, sitemap, and robots. Do not maintain competing generated copies.
- The static preview binds to localhost and preserves real redirects, HTTP 404s, and fresh assets after rebuilding.
- `npm test` checks formatting, lint, content tests, types/build, and Playwright, then verifies the deployment artifact did not change during browser tests.
- Fixture tests mutate `blog/` and VitePress temporary state: run content and browser suites sequentially. Fixture builds use isolated output directories.
- CI uses Node 24 and deploys the exact verified artifact after a successful push to `main`.
- At each milestone, stop for review and propose a commit message. The owner creates the commits.
- The `minimatch` override pins the patched 11.0.3 release for [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249). ESLint and its TypeScript integrations still request 10.x; verify lint coverage when changing this override and remove it when those dependencies adopt a patched version.
- Keep milestone reports and release history out of README.md; it documents usage and operation.

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
