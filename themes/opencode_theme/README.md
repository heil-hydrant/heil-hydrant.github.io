# opencode_theme

A terminal-native, monospace-first Zola theme inspired by OpenCode and modern developer platforms.

## Features

- **Typography:** IBM Plex Mono for code/body text and Space Grotesk for headings.
- **Palette:** Warm dark surfaces (`#0e0e0c`, `#111110`, `#0b0b0a`) and crisp borders (`#262624`).
- **Switchable Accent Colors:**
  - **Red:** `#ff0000` (default)
  - **Green:** `#00ff00` (hacker terminal neon green)
- **Visuals:** 48px engineering grid pattern (`.grid-bg`), ambient radial glow (`.glow`), and terminal window chrome with traffic dots.
- **Interactive:** Blinking prompt cursor (`.caret`), 70s marquee ticker (`.ticker`), smooth scroll reveal (`[data-reveal]`), and live accent color toggle button in navigation.
- **Components:** `<figure>` shortcode component with lazy-loading and responsive window frame, install command blocks with clipboard copy, callouts, and tags.
- **Built for Zola 0.23+** and Cloudflare Pages / GitHub Pages.

## How to Switch Colors

### 1. In `zola.toml` or `config.toml`

Change the `accent_color` field under `[extra]`:

```toml
[extra]
# Choose either "red" (#ff0000) or "green" (#00ff00)
accent_color = "green"
```

### 2. Live in the Browser

Click the accent badge (`[● red]` / `[● green]`) in the top navigation bar to toggle between red and green instantly. The choice is persisted in `localStorage`.
