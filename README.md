# Ben Drusinsky — portfolio

One page: the work as a 3D cloud. Every image and every sentence of project
text is one item. Drag to turn, scroll to zoom, click an item to open its
project. The search box ranks items against a query and pulls the matches
together.

It looks like an embedding but is not a learned one. Each item gets a small
hand-made feature vector — its project's tag weights (`tags` in
`src/projects.js`) plus the topics its own sentence mentions (`AXIS_WORDS` in
`src/embedding.js`) — and a small UMAP (`src/umap.js`) lays them out in 3D in
the browser. Search is keyword matching widened by a table of related words
(`RELATED` in `src/embedding.js`).

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in dist/
```

Upload the contents of `dist/` to any static host (Netlify, Cloudflare Pages,
GitHub Pages, or plain FTP to your domain). Paths are relative, so it also
works from a sub-folder.

## Edit

- **Text, meta, tags:** `src/projects.js`. Change a project's `tags` to move it
  in the cloud.
- **Images:** `public/img/<slug>-<n>.webp` (full, max 1600px) and
  `<slug>-<n>-t.webp` (thumbnail, max 384px), listed in `src/images.json` with
  width, height and caption. They were cut from the Figma file "portfolio-1".
- **Related words for search:** `RELATED` in `src/embedding.js`.
- **Look:** `styles/main.css`. Type is ABC Areal where installed, else Arial.

Links like `/#nolligan` open a project directly.
