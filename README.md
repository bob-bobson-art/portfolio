# Art Portfolio (static preview)

Dark, minimal art portfolio built with Astro. This is **Phase 1 only** — a local preview with sample placeholder art. No CMS or GitHub Pages deploy yet.

## Preview locally

```bash
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

Live site (after GitHub Pages is enabled): [https://bob-bobson-art.github.io/portfolio/](https://bob-bobson-art.github.io/portfolio/)

## Pages

- **Home** — portfolio intro + full gallery
- **Tattoos** — tattoo designs (`category: "tattoo"` in gallery.json)
- **Commissions** — commission work (`category: "commission"` in gallery.json)
- **About** — bio and contact info

## Add a piece manually (for now)

1. Drop an image into `public/images/` (`.webp`, `.jpg`, or `.svg`)
2. Add an entry to `src/data/gallery.json`:

```json
{
  "id": "my-new-piece",
  "title": "My New Piece",
  "date": "2026-06-12",
  "category": "gallery",
  "tags": ["digital"],
  "image": "/images/my-new-piece.webp",
  "caption": "Optional description",
  "published": true
}
```

Use `"category": "gallery"` for the home page, `"tattoo"` for Tattoos, or `"commission"` for Commissions.

3. Edit artist info in `src/data/site.json`

## Next steps (later)

- GitHub Pages deploy
- Browser admin, Discord bot, or folder sync for easy uploads
