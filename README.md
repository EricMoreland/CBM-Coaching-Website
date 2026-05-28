# Coaching Website

A polished, responsive marketing page for a fitness coaching brand built with semantic HTML, modern CSS, and lightweight JavaScript.

**GitHub repo description:** Responsive fitness coaching landing page with clean mobile navigation and modern black/green styling.

## Features

- Responsive desktop, tablet, and mobile layout
- Sidebar navigation with mobile toggle menu
- Hero section optimized for clean spacing and readable text
- FAQ accordion interaction
- Clean content stacking with grid/flex layouts
- Preserves the existing black/green brand styling

## Project structure

**All edits go in `src/`.** This is the only source of truth for the site.

- `src/index.html` — markup (entry point)
- `src/css/main.css` — styles
- `src/js/main.js` — scripts (menu, smooth scrolling, FAQ, CTA wiring)
- `index.html` (root) — thin redirect to `src/index.html` so double-clicking the project root still loads the site
- `backup/legacy/` — previous standalone copies of `index.html` / `styles.css` / `script.js`, kept only for reference. **Do not edit these.**
- `dist/` — build output produced by `npm run build` (do not edit by hand)

## Local preview

Either:

- Double-click `src/index.html` (the root `index.html` will also redirect there), or
- Run a local server for live updates:
  ```
  npx serve src -p 5173
  ```
  then open <http://localhost:5173>.

## Notes

- The site is intentionally simple and professional.
- Colors and fonts are kept consistent with the original black/green theme.
- No major redesign or extra animations were added.

---
