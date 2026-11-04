# Zola Minimal Black

A complete port of [Hugo Minimal Black](https://gitlab.com/jimchr12/hugo-minimal-black) by Jim Christopoulos to the [Zola](https://www.getzola.org/) (0.23+ / Tera v2) static site generator.

## Features

- **True Black (`#000000`) Dark Mode** & clean Light Mode with `localStorage` persistence and system preference detection
- **Floating Action Dock** (`static/js/dock.js` & `templates/partials/dock.html`)
- **Instant Search Modal (`Ctrl+K` / `Cmd+K`)** compatible with Zola's `build_search_index = true` (`search_index.en.json` / `search_index.json`)
- **Sticky Table of Contents** powered natively by Zola's `page.toc`
- **Modular Homepage Sections** (`hero`, `now`, `tech-marquee`, `projects`, `posts`, `contact`) configured via `config.toml`
- **Two About Layouts** (`templates/about.html` and `templates/about-alternative.html`)
- **Tera v2 Components (`templates/components.html`)**: `figure`, `image`, `img`, `code`, `alert`, `callout`, `note`, `tip`, `warning`, `important`, `caution`, `github`, `gallery`, `mermaid`, `youtube`, `vimeo`, and `gist`

## Installation into an Existing Site

1. Copy `templates/*` into your site's `templates/` directory (or into `themes/zola-minimal-black/templates/` if using `theme = "zola-minimal-black"`).
2. Copy `static/*` into your site's `static/` directory (or into `themes/zola-minimal-black/static/`).
3. Ensure `templates/components.html` is present in your `templates/` folder so Tera v2 registers `<figure ... />` and all other components globally.
4. Run `zola serve` to preview locally at `http://127.0.0.1:1111`.
