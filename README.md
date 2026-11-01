# vitor.run · [![CI](https://github.com/vitorsalgado/vitor.run/actions/workflows/ci.yml/badge.svg)](https://github.com/vitorsalgado/vitor.run/actions/workflows/ci.yml)

My personal web-site with a blog.  

## VitePress migration

The proof in `site/` extends the default VitePress theme and reads the existing
`blog/*.md` files at build time. It contains a homepage, published posts, a blog
list, tag archives, and a 404 page. Drafts are excluded before routes and page
data are generated. The current React build and deployment remain the default.

```sh
npm run site:dev
npm run content:check
npm run content:test
npm run site:build
npm run site:preview
npm run site:test
```

Development uses <http://127.0.0.1:5174>; production preview uses
<http://127.0.0.1:4176>. The build writes to `site/.vitepress/dist` and uses
trailing-slash directory routes. The proof intentionally emits `noindex,
nofollow`; it is not the production cutover.

Run `site:build` before `site:test`. Tests use Python 3's static HTTP server to
verify directory redirects and real 404 responses, plus a separate development
server to verify content watching. For an existing Google Chrome installation,
run `PLAYWRIGHT_CHANNEL=chrome npm run site:test`; otherwise install Playwright's
Chromium with `npm run e2e:install`. Screenshots are saved under
`.local/milestone1/`.

Still to migrate: About and Contact, remaining post controls and icons, Disqus,
analytics, complete SEO metadata and feeds, publishing commands, and CI/deployment.

Dependency review remains open: `npm audit` reports 15 advisory package entries at
this checkpoint, including VitePress 1's Vite/esbuild development dependencies.
Resolve the dependency choice before the production cutover.

### Content model — milestone 2

Use Node.js 24 for the VitePress and content commands. `site:build` validates
content before type checking and generation. The VitePress configuration also
validates content when invoked directly, so invalid route data fails the build.

Keep posts in `blog/*.md` with YAML frontmatter:

- Required: `title`, `slug`, `date`, and `language`.
- Optional: `description`, `tags`, and `draft`.
- Dates must be real calendar dates in `YYYY-MM-DD` format, quoted or unquoted.
- Slugs use lowercase letters, digits, and single hyphens, and must be unique
  across published posts.
- Language tags such as `EN` and `pt-br` normalize to `en` and `pt-BR`.
- Tags normalize whitespace, case, and Unicode, with duplicates removed. Spaces
  are supported; path/URL delimiters such as `/`, `?`, `#`, and `%` are rejected.
- Unknown published fields and `TODO`/`TBD` titles or descriptions fail validation.

`draft` must be an unquoted boolean. `draft: true` excludes the post before
metadata, body, images, listings, and routes are generated. Drafts may have
incomplete metadata and missing images, but their YAML must still be valid.
Omitting `draft` or setting it to `false` publishes the post. A future date does
not schedule publication; keep unpublished work marked as a draft.

Relative Markdown images, including reference-style images, resolve from the
original post file and enter Vite's asset pipeline. Local files must exist and
stay inside the project directory. Root-relative images resolve from
`site/public`, whose contents are always public; keep draft-only images outside
that directory. Remote images are not checked over the network.

`content:test` covers metadata validation and isolated production builds that
publish and unpublish fixture posts, verify images and tag URLs, and reject
invalid publication data. Fixtures and generated artifacts are cleaned up.
Full RSS, sitemap, and SEO integration remains milestone 5; the current React
build and its legacy generators have not been switched over.
