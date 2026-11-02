# vitor.run · [![CI](https://github.com/vitorsalgado/vitor.run/actions/workflows/ci.yml/badge.svg)](https://github.com/vitorsalgado/vitor.run/actions/workflows/ci.yml)

Personal website and blog: [vitor.run](https://vitor.run/).

## Local development

Use Node.js 24 and install dependencies:

```sh
npm ci
npm run dev
```

Open <http://127.0.0.1:5174>. This server displays published posts only.

To include drafts, run `npm run dev:drafts` and open
<http://127.0.0.1:5178/blog/>. The preview displays a banner and labels draft
posts. Sharing and comments are hidden on drafts. Content edits and changes to
the draft flag refresh the generated routes automatically.

## Writing a post

Create a Markdown file with a quoted title:

```sh
npm run new:post -- "My new post"
```

The command creates `blog/YYYY-MM-DD-my-new-post.md` using the local calendar
date, with `draft: true` and an empty body. Existing files and slugs are reserved
and cannot be overwritten. Review the generated slug before publishing. For an
explicit slug, including titles without Latin characters:

```sh
npm run new:post -- "日本語" --slug japanese-article
```

Posts use YAML frontmatter:

```yaml
---
title: My new post
slug: my-new-post
date: 2026-11-01
language: en
description: A short summary for search results and link previews.
tags:
  - tech
draft: true
---
```

`title`, `slug`, `date`, and `language` are required. `description`, `tags`, and
`draft` are optional.

- Dates must be real calendar dates in `YYYY-MM-DD` format.
- Slugs use lowercase letters, digits, and single hyphens and must be unique.
- Language tags normalize to BCP 47 form, such as `en` and `pt-BR`.
- Tags normalize case, surrounding whitespace, and Unicode; duplicates are removed.
  Spaces are supported, but path and URL delimiters are rejected.
- Unknown fields, empty published bodies, and `TODO` or `TBD` titles/descriptions
  fail publication validation.
- `draft` must be a boolean. A future date does not schedule publication.

Write and preview the post, then set `draft: false` when it is ready. Omitting
`draft` also publishes the post. To unpublish, set it back to `true` and rebuild.
Published builds exclude draft bodies, metadata, routes, tags, and imported
images, even when the draft-preview environment flag is inherited.

Draft YAML must be valid. The normal build permits incomplete draft metadata and
missing draft images. Draft preview validates the required metadata and images
of every post it displays; empty bodies and placeholder titles are allowed there.

## Markdown and images

Markdown supports tables, task lists, strikethrough, automatic URL links, heading
anchors, and highlighted code blocks. Use public route URLs such as `/contact/`
or `/blog/my-new-post/` for internal links.

VitePress treats Markdown as a trusted Vue template. Use backticks, fenced code
blocks, or a `::: v-pre` block for examples containing literal `{{ braces }}`.
See the [Markdown guide](https://vitepress.dev/guide/markdown) and
[Vue-in-Markdown guide](https://vitepress.dev/guide/using-vue).

Relative Markdown images resolve from the original post file and enter Vite's
asset pipeline. Local images must exist and remain inside the project. Images
whose URLs start with `/` resolve from `site/public`; everything in that directory
is public, so keep draft-only images elsewhere. Remote images are not checked
over the network.

## Validate and preview a build

```sh
npm run content:check
npm run build
npm run preview
```

The build writes static HTML and assets to `dist`. Preview them
at <http://127.0.0.1:4176>. The preview binds to localhost, serves new assets after a rebuild, and returns
real directory redirects and HTTP 404 responses.

Builds are indexable production artifacts; development is non-indexable.
For a non-indexable build, use `VITOR_PRODUCTION=0 npm run build`. Analytics and
comments remain disabled when a production artifact is served locally.

Each page includes its title, description, canonical URL, social metadata, and
JSON-LD before JavaScript runs. Posts also include publication date, language,
author, and tags. Error pages remain non-indexable.

The build generates `/rss.xml`, `/sitemap.xml`, and `/robots.txt` from published
content. Development servers provide the same endpoints, excluding drafts even
in draft preview. RSS item links use canonical trailing slashes; existing GUIDs
retain their original form for subscribers. Do not maintain copies of these
generated files or `/avatar.jpeg` in `site/public`.

## Tests

Install the browser once, then run the complete verification:

```sh
npm run e2e:install
npm test
```

This checks formatting, lint, content tests, types, a production build, and
browser tests. It verifies that browser tests leave the deployment artifact
unchanged. Fixture builds use separate output directories. Content and browser
tests run sequentially because they create temporary posts.

To use an installed Google Chrome instead of Playwright's Chromium, run
`PLAYWRIGHT_CHANNEL=chrome npm test`. Individual checks are available through
`format:check`, `lint`, `content:test`, `typecheck`, `build`, and `e2e`.
Use `npm run format` to format source code and documentation; blog Markdown is
not included.

Tests cover content validation, post creation, publishing and unpublishing,
draft exclusion, images, static rendering, metadata, feeds, navigation, keyboard
interactions, and integration failures. Vendor scripts are intercepted during
integration tests so tests do not send live analytics events or comments.

## Configuration

- `site/.vitepress/config.ts`: VitePress, navigation, Markdown, and build settings.
- `site/.vitepress/theme/`: Layout components and styles extending the default theme.
- `src/lib/site.ts`: Site identity, canonical origin, language, contact details,
  social image, Disqus shortname, and GA4 measurement ID.
- `src/lib/social.ts`: Social links.
- `src/lib/post-icon-names.ts`: Icons selected by the first post tag.
- `site/about/index.md`: About content.
- `site/contact/index.md`: Contact page, using the shared email and links.
- `public/CNAME`: GitHub Pages custom domain; keep it aligned with the canonical origin.
- `.github/workflows/ci.yml`: CI and GitHub Pages deployment.

Disqus uses the post slug as its thread identifier. Preserve a published slug to
retain its thread. An empty `disqusShortname` disables comments. Comments load
only at the configured production origin and reset on post or theme changes.

GA4 loads only for a production build at the configured production origin. An
empty measurement ID disables it. Enable enhanced-measurement page views for
browser history changes in GA4 so client navigation is tracked automatically.

## Deployment

GitHub Actions verifies pushes and pull requests. A successful push to `main`
automatically deploys the exact verified `dist` artifact to GitHub Pages, without
rebuilding it. Configure Pages to use GitHub Actions and retain the custom domain
`vitor.run`.

Deployment artifacts are retained for 30 days. To roll back to a retained,
previously verified artifact, rerun that successful run's deployment job. Otherwise,
restore a verified VitePress revision on `main` and let CI build and verify it.
