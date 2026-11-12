# terminal - Cybernetic Tmux & Zsh Terminal Theme for Zola

**terminal** is a high-performance, full-screen interactive terminal theme for [Zola](https://www.getzola.org/). Inspired by classic UNIX terminals, `tmux` multiplexers, and modern cybernetic aesthetics, `terminal` turns your static site into a responsive, keyboard-driven workstation.

---

## ✨ Features

- **Tmux Multiplexer Window System**:
  - **Window 0 (`zsh`)**: Fully interactive command-line environment with prompt, history, Tab autocomplete, virtual filesystem (`ls`, `cat`, `open`), and simulated utilities (`whoami`, `uname`, `sudo`, `curl`).
  - **Windows 1..N (Static Panes)**: Seamless static content views for articles, project writeups, bio/about pages, and communication channels.
  - **Intuitive Navigation**: Switch panes via top statusline tabs, bottom return button, direct commands (`about`, `contact`), `tmux select-window -t <target>`, or native `tmux` shortcuts:
    - `Ctrl+b` then `0..9`: Switch to window by index
    - `Ctrl+b` then `n` / `p`: Next / Previous window
    - `Esc`: Instantly return to shell `0:zsh`
- **Dynamic Zola Configuration (`config.toml`)**:
  - 100% customizable via standard TOML tables without modifying theme source files.
  - Custom ASCII banner, operator identity, hostname, prompt character, and kernel telemetry.
  - Dynamically configured `[[extra.tmux.windows]]` mapping directly to Zola markdown files.
  - Configurable quick command chips, contact dispatch channels, and virtual files (`.profile`, `flag.txt`).
- **4 Cybernetic Accent Colorways**:
  - Red (`#ff0000`), Green (`#00ff00`), Blue (`#0000FF`), and Gold (`#ffd700`).
  - Switchable at runtime via the `theme <color>` command or the top titlebar chip, persisted in `localStorage`.
- **Cybernetic Visuals & Effects**:
  - Adaptive frosted black glass terminal chrome with configurable `blur` and `darkness` when focused, switching to solid opaque black when unfocused.
  - Active window state indicators (`*`).
  - Dedicated article reader view with clean syntax highlighting and collapsible sidebars.

---

## 🚀 Quick Start

### 1. Install Theme

In your Zola site repository:

```bash
git submodule add https://github.com/darkseid-is/terminal.git themes/terminal
```

### 2. Enable in `config.toml`

Add or update the following in your `config.toml`:

```toml
theme = "terminal"
title = "My Terminal Station"
base_url = "https://example.com"
compile_sass = true
build_search_index = false

[extra]
accent_color = "red" # Options: "red", "green", "blue", "gold"
```

### 3. Test with the Bundled Example Site

To preview the theme immediately:

```bash
cd themes/terminal/exampleSite
zola serve
```

---

## ⚙️ Configuration Reference

### Terminal & Shell Settings (`[extra.terminal]`)

Customize the interactive shell prompt, operator identity, frosted glass options, banner, and quick action chips:

```toml
[extra.terminal]
user = "operator"
host = "workstation"
shell = "zsh"
prompt_char = "$"
blur = "20%"                                      # Frosted glass blur (e.g. "20%" or "10px")
darkness = "35%"                                  # Frosted glass background darkness/opacity (e.g. "35%" or "0.35")
status = "Online · Systems Engineer"
welcome_tip = "Type <span class=\"term-accent\">'help'</span> for manual."

banner = """
   ___      __                  _             __
  / _ \\____/ /____ ______ _  (_)__  ___ ____/ /
 / // /___/ __/ -_) __/  ' \\/ / _ \\/ _ `/ _  / 
/____/    \\__/\\__/_/ /_/_/_/_/_//_/\\_,_/\\_,_/  
"""

whoami_bio = """<span class="term-good">operator</span> · Systems & Security Engineer
Status:       <span class="term-good">Online & Operational</span>
Specialties:  Distributed Systems · Terminal Ergonomics · Rust & C
Primary:      Rust, Python, Bash, Go
Shell:        zsh 5.9 / tmux 3.4 / Neovim 0.10"""

kernel = "Linux workstation 6.12.0-generic #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux"
security_status = "SEC: ENCRYPTED"
quick_commands = ["help", "whoami", "projects", "about", "ls", "contact", "theme", "clear"]
```

#### Frosted Glass Window Focus Behavior

The terminal window features an adaptive frosted glass aesthetic:
- **Focused State**: When the terminal window is focused, it renders frosted black glass with configurable blur radius/percentage (`blur`) and background darkness (`darkness`).
- **Unfocused State**: When unfocused, it becomes completely opaque solid black with blur disabled for zero background distraction and maximum contrast.

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `blur` | String / Number | `"20%"` | Frosted glass backdrop blur radius/percentage when focused (e.g. `"20%"` or `"10px"`). |
| `darkness` | String / Number | `"35%"` | Frosted glass background opacity/darkness level when focused (e.g. `"35%"` or `"0.35"`). |

---

### Tmux Window System (`[extra.tmux]`)

Configure the session name and define static content windows:

```toml
[extra.tmux]
session = "main"
version = "tmux 3.4"

# Window 1: Dynamic Markdown Page Pane
[[extra.tmux.windows]]
id = "projects"
name = "projects"
type = "page"
page = "projects.md"             # Path relative to content/
footer_left = "[Window 1: projects] [RO]"
footer_right = "target: rust · open-source"
actions = [
    { label = "View Full Project Article →", url = "/projects/" }
]

# Window 2: About Me Page Pane
[[extra.tmux.windows]]
id = "about"
name = "about"
type = "page"
page = "pages/about.md"          # Path relative to content/
footer_left = "[Window 2: about] [RO]"
footer_right = "mode: static-view"
actions = [
    { label = "Dedicated Web View →", url = "/about/" }
]

# Window 3: Built-in Contact Dispatch Pane
[[extra.tmux.windows]]
id = "contact"
name = "contact"
type = "contact"
footer_left = "[Window 3: contact] [RO]"
footer_right = "direct channels"
```

---

### Contact & Social Channels (`[extra.contact]`)

Configure communication methods displayed in the `contact` pane and shell command:

```toml
[extra.contact]
email = "contact@example.com"
email_label = "SMTP"

[[extra.contact.socials]]
name = "GitHub"
url = "https://github.com/example"
handle = "example"

[[extra.contact.socials]]
name = "X.com"
url = "https://x.com/example"
handle = "@example"
```

> [!TIP]
> The `handle` is displayed as the link text in the contact pane and shell command (e.g. `@example`). Clicking it opens the account in a new tab. If omitted, it falls back to the full URL.

---

### Virtual Filesystem (`[[extra.virtual_files]]`)

Add virtual files that users can explore in the shell using `ls`, `cat`, or Tab autocomplete:

```toml
[[extra.virtual_files]]
name = ".profile"
size = "180B"
date = "Jan 01 2026"
content = """export EDITOR="nvim"
export SHELL="/bin/zsh"
export ARCH="x86_64"
alias build="cargo build --release\""""

[[extra.virtual_files]]
name = "flag.txt"
size = "32B"
date = "Jan 01 2026"
content = "<span class=\"term-accent\">FLAG{cybernetic_terminal_ready}</span>"

[[extra.virtual_files]]
name = "mail.txt"
size = "160B"
date = "Jan 01 2026"
content = """From: operator@example.com
To: operator@workstation
Subject: Encrypted Comms & Direct Dispatch

Reach out directly at operator@example.com.
Tip: Run 'contact' to view channels or 'contact --copy' to copy email."""
```

---

## 📝 Designing Markdown Content for Terminal Panes

In addition to full markdown rendering, you can provide an optional `terminal_summary` in your page's frontmatter (`content/<page>.md`). When present, `terminal` will render this clean, terminal-formatted summary inside the static tmux pane and the shell's `cat <page>.md` command:

```markdown
+++
title = "My Project"
date = 2026-01-01
description = "A high-performance system utility."

[extra]
terminal_summary = """
<div class="terminal-line"><span class="term-accent font-bold"># My Project</span></div>
<div class="terminal-line">High-performance system utility written in <span class="term-accent">Rust</span>.</div>
<div class="terminal-line">&nbsp;</div>
<div class="terminal-line"><span class="term-heading">[KEY FEATURES]</span></div>
<div class="terminal-line">&bull; Blazing fast multi-threaded execution</div>
<div class="terminal-line">&bull; Zero runtime dependencies</div>
"""
+++

# Full Article Content
This markdown body is displayed when navigating to the full article URL.
```

---

## ⌨️ Terminal Commands Reference

| Command | Description |
| :--- | :--- |
| `help` | Display manual of available commands |
| `whoami` | Print operator credentials, bio, and operational status |
| `<window_id>` | Switch directly to a configured tmux window (e.g. `about`, `projects`, `contact`) |
| `ls [-la]` | List virtual filesystem files and directories |
| `cat <file>` | Output file content (e.g. `cat .profile`, `cat flag.txt`) |
| `open <slug>` | Navigate browser to an article or page (e.g. `open projects`) |
| `theme [color]`| Switch accent color (`red`, `green`, `blue`, `gold`) |
| `tmux` | Inspect tmux session, active windows, and keyboard shortcuts |
| `tmux select-window -t <target>` | Switch window via tmux command syntax |
| `uname` | Print kernel architecture string |
| `id` | Print real and effective user / group IDs |
| `history` | List previously executed commands |
| `clear` / `cls` | Clear terminal output buffer (or `Ctrl+L`) |
| `echo <text>` | Print formatted arguments to output |
| `date` | Display current system timestamp |
| `uptime` | Display session duration and site uptime counter |
| `sudo <cmd>` | Attempt privilege escalation |

---

## 📄 License

MIT License. Designed and built for cybernetic terminal enthusiasts.
