# vitor.run · [![CI](https://github.com/vitorsalgado/vitor.run/actions/workflows/ci.yml/badge.svg)](https://github.com/vitorsalgado/vitor.run/actions/workflows/ci.yml)

My personal web-site with a blog.  

## VitePress migration proof — milestone 1

The proof in `site/` extends the default VitePress theme and reads the existing
`blog/*.md` files at build time. It contains a homepage, published posts, a blog
list, tag archives, and a 404 page. Drafts are excluded before routes and page
data are generated. The current React build and deployment remain the default.

```sh
npm run site:dev
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
