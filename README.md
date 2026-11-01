# vitor.run · [![CI](https://github.com/vitorsalgado/vitor.run/actions/workflows/ci.yml/badge.svg)](https://github.com/vitorsalgado/vitor.run/actions/workflows/ci.yml)

My personal web-site with a blog.  

## VitePress migration

The proof in `site/` extends the default VitePress theme and reads the existing
`blog/*.md` files at build time. It contains a homepage, published posts, a blog
list, tag archives, About, Contact, and a 404 page. Drafts are excluded before routes and page
data are generated. The current React build and deployment remain the default.

```sh
npm run site:dev
npm run site:dev:drafts
npm run content:check
npm run content:test
npm run site:build
npm run site:preview
npm run site:test
```

Development uses <http://127.0.0.1:5174>; draft preview uses
<http://127.0.0.1:5178>; production preview uses <http://127.0.0.1:4176>.
The build writes to `site/.vitepress/dist` and uses
trailing-slash directory routes. The proof intentionally emits `noindex,
nofollow`; it is not the production cutover.

Run `site:build` before `site:test`. Tests use Python 3's static HTTP server to
verify directory redirects and real 404 responses, plus a separate development
server to verify content watching. For an existing Google Chrome installation,
run `PLAYWRIGHT_CHANNEL=chrome npm run site:test`; otherwise install Playwright's
Chromium with `npm run e2e:install`. Screenshots are saved under
`.local/milestone1/`, `.local/milestone3/`, and `.local/milestone4/`.

Still to migrate: production analytics, complete SEO metadata and feeds,
and CI/deployment.

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

### Pages and interactions — milestone 3

Edit About in `site/about/index.md`. The legacy React page reads that same file
until cutover. Contact reuses the email and links from `src/lib/site.ts`; the
home and navigation social icons use the existing social-link configuration.
Post icons keep the original first-tag mapping shared by both themes in
`src/lib/post-icon-names.ts`.

Posts include canonical link copying, a keyboard-accessible share disclosure
with LinkedIn and X links, native VitePress code copying, and tag links. About,
Contact, posts, and archives render without JavaScript; the share links also work
without it. The mobile navigation focuses its first link when opened and closes
on Escape, returning focus to its toggle.

Disqus retains the `vitor-run` shortname and the post slug as its thread
identifier. It receives the production URL, title, and language, and resets on
client navigation and theme changes. It loads only at `https://vitor.run`, so
local previews do not send visits to the live forum. An empty `disqusShortname`
disables it. Browser tests intercept the production origin and use a stub vendor
script; real account/thread verification remains a release check in milestone 5.

Markdown supports tables, task lists, strikethrough, automatic URL links, heading
anchors, and highlighted code. Relative images follow the content rules above.
VitePress also treats Markdown as a trusted Vue template: use backticks for inline
code, fenced code blocks for examples, or a `::: v-pre` block for prose containing
literal `{{ braces }}`. Raw HTML/Vue is supported; it is not escaped as text like
the previous React renderer. See the
[VitePress Markdown guide](https://vuejs.github.io/vitepress/v1/guide/markdown)
and [Vue-in-Markdown guide](https://vuejs.github.io/vitepress/v1/guide/using-vue).
Use public route URLs such as `/contact/` or `/blog/my-slug/` for internal links.

RSS navigation will return with the generated feed in milestone 5. The migration
still emits `noindex, nofollow`, and production analytics remains disabled here.

### Writing and publishing — milestone 4

Use Node.js 24. Create a post with a quoted title:

```sh
npm run new:post -- "My new post"
# Optional explicit slug, including for titles without Latin characters:
npm run new:post -- "日本語" --slug japanese-article
npm run new:post -- --help
```

The command creates `blog/YYYY-MM-DD-my-new-post.md`, using the computer's local
calendar date. It fills the required metadata, defaults the language to `en`,
sets `draft: true`, and leaves the body empty for you to write. Titles are safely
serialized as YAML. Automatic slugs normalize accents and punctuation; review
the slug before publication. Existing slugs in both drafts and published posts
are reserved by the command. Existing files are never overwritten, including
when two commands run at the same time. Running the command without a title
prints usage and creates nothing.

1. **Write and preview.** Run `npm run site:dev:drafts` and open
   <http://127.0.0.1:5178/blog/>. The localhost server includes drafts in the blog,
   tag archives, and article routes. A banner marks the whole preview, and draft
   posts carry their own label. Sharing and comments are hidden on drafts.
   Changes to content, tags, and the draft flag refresh the routes automatically.
2. **Prepare publication.** Edit the body, date, language, optional description,
   and tags in the Markdown file. Keep `draft: true` until the post is ready.
   Draft preview validates the required metadata and local images of everything
   it displays; hand-written drafts need a valid title, slug, date, and language
   before previewing. Empty bodies and `TODO` titles/descriptions are allowed in
   this preview. An invalid draft does not block the normal build or ordinary
   development server, provided its YAML and boolean draft flag are valid.
3. **Validate the published result.** Set `draft: false`, then run:

   ```sh
   npm run content:check
   npm run site:build
   npm run site:preview
   ```

   Review the article, blog entry, tags, images, and copied code at
   <http://127.0.0.1:4176>. An empty body or `TODO`/`TBD` title or description
   fails publication validation. Description remains optional. VitePress preview
   should be restarted after rebuilding so it serves the current asset names.

`npm run site:dev` includes only published posts. `site:build` and direct
`vitepress build site` also exclude drafts, even if the draft-preview environment
flag is inherited. `content:check` always checks published posts and ignores
draft bodies and incomplete draft metadata. A future date does not schedule a
post; the draft flag controls publication. Set it back to `true` to unpublish,
then rebuild to remove the route, draft-only tags, and imported assets.

These steps prepare the VitePress artifact for review. CI/deployment still uses
the legacy React build until milestone 6; its existing bundle and feed generators
still include draft source/metadata. VitePress's draft exclusion does not change
that legacy output. Deployment instructions will be finalized with the cutover.

`content:test` includes isolated CLI tests for slug/file collisions, concurrent
creation, YAML escaping, and publication validation. Browser tests cover creating,
previewing, editing, publishing, and unpublishing a post; production build tests
verify draft exclusion with the preview flag deliberately enabled.
