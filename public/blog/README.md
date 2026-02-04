# Blog posts

- Add one `.md` file per post (with frontmatter: `title`, `date`, optional `description`).
- Update `index.json` with an entry for each post so it appears on the /blog page.

Example `index.json`:

```json
[
  {
    "slug": "hello-world",
    "title": "Hello World",
    "date": "2025-02-03",
    "description": "Optional short summary."
  }
]
```

The `slug` must match the filename (without .md).
