# Gordon's picture gallery

The Coloring game saves snapshots in IndexedDB first. This Worker backs them up to a private R2 bucket and makes them available on another device after a grown-up pairs it with the family key in the Gallery.

The deployed endpoint is `https://gordon-picture-gallery.99redder.workers.dev`. It requires the `FAMILY_KEY` secret for every picture request and accepts browser requests only from the origins in `wrangler.jsonc`. The key is never included in this repository or the static site.

For local development, run `npm ci` here, create a `.dev.vars` file containing `FAMILY_KEY=...`, then run `npm run dev`. Use `npm test` for the Worker tests and `npm run check` for a Wrangler dry run. Run `npm run deploy` after configuring the R2 bucket and production secret. Keep `.dev.vars`, `.private/`, and any family keys out of Git.

The Gallery's grown-up section accepts the endpoint and family key. Pair each iPad or laptop once; existing local snapshots then upload automatically, and cloud snapshots download to that device for offline viewing. The site must be served over HTTPS to use the deployed endpoint.
