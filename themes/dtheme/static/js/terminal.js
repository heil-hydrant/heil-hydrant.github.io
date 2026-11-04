/**
 * DTheme Live Interactive Terminal Engine
 * Inspired by jquery.terminal & opencode_theme aesthetic
 * Author: darkseid (https://darkseid.is)
 */
(function () {
  'use strict';

  function initTerminal() {
    const termWindow = document.getElementById('terminal-window');
    const termBody = document.getElementById('terminal-body');
    const termOutput = document.getElementById('terminal-output');
    const hiddenInput = document.getElementById('terminal-input');
    const displaySpan = document.getElementById('terminal-input-display');
    const matrixCanvas = document.getElementById('terminal-matrix');
    const fullscreenBtn = document.getElementById('term-fullscreen-btn');
    const clearBtn = document.getElementById('term-clear-btn');

    if (!termWindow || !termBody || !hiddenInput) return;

    // Command History
    const history = [];
    let historyIndex = -1;
    let currentInput = '';

    // Site Session Start Time (persisted across page navigation in the same session)
    let siteStartTime = Date.now();
    try {
      const stored = sessionStorage.getItem('site_session_start');
      if (stored && !isNaN(parseInt(stored, 10))) {
        siteStartTime = parseInt(stored, 10);
      } else {
        sessionStorage.setItem('site_session_start', siteStartTime.toString());
      }
    } catch (e) {
      siteStartTime = Date.now();
    }

    function getSiteUptime() {
      const now = Date.now();
      const totalSec = Math.max(0, Math.floor((now - siteStartTime) / 1000));
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;

      const parts = [];
      if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
      if (hours > 0) parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
      if (mins > 0 || (days === 0 && hours === 0)) parts.push(`${mins} min${mins !== 1 ? 's' : ''}`);
      parts.push(`${secs} sec${secs !== 1 ? 's' : ''}`);
      return parts.join(', ');
    }

    // Virtual Filesystem
    const siteData = window.__TERMINAL_DATA__ || {
      author: 'darkseid',
      title: "darkseid's site",
      desc: 'OSCP certified cybersecurity researcher & systems enthusiast.',
      posts: [
        {
          title: 'zxc',
          url: '/zxc/',
          date: '2025-03-20',
          desc: 'Terminal based intercepting proxy written in rust with tmux and vim as user interface.'
        }
      ],
      pages: [
        {
          title: 'About Me',
          url: '/about/',
          desc: 'OSCP certified security researcher, vim coding, Hack The Box CTF player.'
        }
      ]
    };

    const files = {
      'zxc.md': {
        type: 'file',
        size: '3.9K',
        date: 'Mar 20 2025',
        content: `<span class="term-accent"># zxc — Terminal Intercepting Proxy</span>
Terminal based intercepting proxy written in Rust with <span class="term-good">tmux</span> and <span class="term-good">vim</span> as user interface.

<span class="term-heading">[FEATURES]</span>
• tmux and vim as primary user interface
• Disk-based storage for large request histories (100k+ entries)
• Custom HTTP/1.1 parser to craft and send malformed requests
• Full HTTP/1.1 and WebSocket support
• Integrations with ffuf, sqlmap, and custom scripts

<span class="term-heading">[REPOSITORIES]</span>
• Binary:  <a href="https://github.com/heil-hydrant/zxc" target="_blank" rel="noopener" class="term-link">https://github.com/heil-hydrant/zxc</a>
• Plugin:  <a href="https://github.com/heil-hydrant/zxc.vim" target="_blank" rel="noopener" class="term-link">https://github.com/heil-hydrant/zxc.vim</a>

<span class="term-muted">Run 'open zxc' to view the full article with 18 interactive screenshots.</span>`
      },
      'about.md': {
        type: 'file',
        size: '561B',
        date: 'Nov 02 2026',
        content: `<span class="term-accent"># About Me — darkseid</span>
OSCP certified cybersecurity enthusiast who loves breaking systems for fun.
Opened vim just to edit a file, unable to quit, and now stuck coding in Rust.

<span class="term-heading">[SKILLS & WEAPONS]</span>
• Offensive Security: OSCP Certified, Web App Pentesting, Network Pivoting
• Languages:         <span class="term-accent">Rust</span>, <span class="term-warn">Python</span>, <span class="term-good">Bash</span>, <span class="term-bright">C/C++</span>, <span class="term-muted">VimScript 8/9</span>
• CTF & Labs:        Hack The Box Active Player (ID: 256448)
• Environment:       Linux 6.x Hardened, Tmux multiplexer, Vim 8/9 IDE

<span class="term-heading">[SOCIAL & CONTACT]</span>
• Reddit: <a href="https://www.reddit.com/user/ghost_vici/" target="_blank" class="term-link">u/ghost_vici</a>
• X:      <a href="https://x.com/_darkseid_is_" target="_blank" class="term-link">@_darkseid_is_</a>
• GitHub: <a href="https://github.com/heil-hydrant" target="_blank" class="term-link">github.com/heil-hydrant</a>`
      },
      '.profile': {
        type: 'file',
        size: '240B',
        date: 'Nov 03 2026',
        content: `export EDITOR="vim"
export VISUAL="vim"
export PAGER="less"
export SHELL="/bin/zsh"
export RUST_BACKTRACE="1"
export ARCH="x86_64"
alias proxy="zxc --port 8080"
alias htb="open https://app.hackthebox.com/profile/256448"`
      },
      'flag.txt': {
        type: 'file',
        size: '32B',
        date: 'Nov 03 2026',
        content: `<span class="term-accent">FLAG{d4rks31d_h0n3yc0mb_t3rm1n4l_2026}</span>`
      },
      'articles': {
        type: 'dir',
        size: '160B',
        date: 'Mar 20 2025'
      }
    };

    // Commands dictionary
    const commands = {
      help: {
        desc: 'List all available terminal commands',
        run: () => {
          return `<span class="term-heading" style="display: inline-block; font-weight: 700; text-decoration: underline; text-underline-offset: 4px; margin-bottom: 6px;">AVAILABLE COMMANDS &amp; MANUAL</span>
<div class="term-table">
  <div class="term-tr"><div class="term-td term-accent">whoami</div><div class="term-td">Display operator identity, credentials & certifications</div></div>
  <div class="term-tr"><div class="term-td term-accent">zxc</div><div class="term-td">Inspect the terminal-based intercepting proxy project</div></div>
  <div class="term-tr"><div class="term-td term-accent">ls [-la]</div><div class="term-td">List directory contents and files</div></div>
  <div class="term-tr"><div class="term-td term-accent">cat &lt;file&gt;</div><div class="term-td">Read a file (e.g. 'cat zxc.md', 'cat about.md', 'cat flag.txt')</div></div>
  <div class="term-tr"><div class="term-td term-accent">open &lt;page&gt;</div><div class="term-td">Navigate directly to a page ('open zxc', 'open about')</div></div>
  <div class="term-tr"><div class="term-td term-accent">theme [color]</div><div class="term-td">Select accent color (red, green, blue, gold) or view help</div></div>
  <div class="term-tr"><div class="term-td term-accent">matrix</div><div class="term-td">Toggle full-terminal cybernetic matrix rain</div></div>
  <div class="term-tr"><div class="term-td term-accent">uname</div><div class="term-td">Print operating system kernel architecture</div></div>
  <div class="term-tr"><div class="term-td term-accent">id</div><div class="term-td">Print real and effective user / group IDs</div></div>
  <div class="term-tr"><div class="term-td term-accent">history</div><div class="term-td">Show command execution history</div></div>
  <div class="term-tr"><div class="term-td term-accent">clear / cls</div><div class="term-td">Clear terminal buffer screen (or Ctrl+L)</div></div>
  <div class="term-tr"><div class="term-td term-accent">echo &lt;text&gt;</div><div class="term-td">Print arguments to terminal output</div></div>
  <div class="term-tr"><div class="term-td term-accent">date</div><div class="term-td">Display current system date and time</div></div>
  <div class="term-tr"><div class="term-td term-accent">uptime</div><div class="term-td">Display total time spent on the site &amp; session uptime</div></div>
  <div class="term-tr"><div class="term-td term-accent">sudo &lt;cmd&gt;</div><div class="term-td">Attempt privilege escalation</div></div>
</div>
<span class="term-muted">Tip: Press [Tab] to autocomplete commands or filenames. Use [↑] / [↓] for history.</span>`;
        }
      },

      whoami: {
        desc: 'Print current user identity',
        run: () => {
          return `<span class="term-good">darkseid</span> &middot; OSCP Certified Security Researcher &middot; Systems &amp; Low-Level Engineer
Status:       <span class="term-good">Online &amp; Hacking</span>
Specialties:  Offensive Security &middot; Terminal Ergonomics &middot; Reverse Engineering
Primary:      Rust, Python, Bash, C/C++, VimScript
Shell:        zsh 5.9 / tmux 3.4 / Neovim 0.10`;
        }
      },

      zxc: {
        desc: 'Inspect zxc intercepting proxy project',
        run: () => files['zxc.md'].content
      },

      ls: {
        desc: 'List directory contents',
        run: (args) => {
          const isLong = args.includes('-l') || args.includes('-la') || args.includes('-al');
          if (isLong) {
            let out = `<div class="term-table"><div class="term-tr term-muted"><div class="term-td">Permissions</div><div class="term-td">User</div><div class="term-td">Size</div><div class="term-td">Date</div><div class="term-td">Name</div></div>`;
            Object.keys(files).forEach((name) => {
              const f = files[name];
              const perm = f.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--';
              const nameClass = f.type === 'dir' ? 'term-good' : (name === 'flag.txt' ? 'term-warn' : 'term-fg');
              out += `<div class="term-tr"><div class="term-td term-muted">${perm}</div><div class="term-td">darkseid</div><div class="term-td term-muted">${f.size}</div><div class="term-td term-muted">${f.date}</div><div class="term-td ${nameClass}">${name}${f.type === 'dir' ? '/' : ''}</div></div>`;
            });
            out += `</div>`;
            return out;
          }

          let names = Object.keys(files).map((name) => {
            const f = files[name];
            return f.type === 'dir' ? `<span class="term-good">${name}/</span>` : `<span class="term-fg">${name}</span>`;
          });
          return names.join('    ');
        }
      },

      ll: {
        desc: 'Alias for ls -la',
        run: () => commands.ls.run(['-la'])
      },

      dir: {
        desc: 'Alias for ls',
        run: (args) => commands.ls.run(args)
      },

      cat: {
        desc: 'Read a file',
        run: (args) => {
          if (!args.length) return `<span class="term-error">cat: missing file operand</span>`;
          const target = args[0].replace(/^\.\//, '');
          if (target === '~/.profile' || target === '.profile') return files['.profile'].content;
          if (files[target]) {
            if (files[target].type === 'dir') return `<span class="term-error">cat: ${target}: Is a directory</span>`;
            return files[target].content;
          }
          return `<span class="term-error">cat: ${target}: No such file or directory</span>`;
        }
      },

      open: {
        desc: 'Navigate to article or page',
        run: (args) => {
          if (!args.length) return `<span class="term-error">open: specify a page (e.g. 'open zxc' or 'open about')</span>`;
          const page = args[0].toLowerCase().replace(/\.md$/, '').replace(/^\//, '');
          if (page === 'zxc') {
            window.location.href = '/zxc/';
            return `Navigating to /zxc/...`;
          }
          if (page === 'about' || page === 'about-me') {
            window.location.href = '/about/';
            return `Navigating to /about/...`;
          }
          return `<span class="term-error">open: page '${page}' not found. Try 'ls' to list files.</span>`;
        }
      },

      cd: {
        desc: 'Change directory',
        run: (args) => {
          if (!args.length || args[0] === '~' || args[0] === '/') return '';
          if (args[0] === '..' || args[0] === '.') return '';
          if (args[0] === 'articles' || args[0] === 'articles/') {
            return `<span class="term-muted">Entered ~/articles.</span>`;
          }
          return `<span class="term-error">cd: no such file or directory: ${args[0]}</span>`;
        }
      },

      pwd: {
        desc: 'Print working directory',
        run: () => `/home/darkseid`
      },

      theme: {
        desc: 'Select or inspect theme accent color (red, green, blue, gold)',
        run: (args) => {
          const root = document.documentElement;
          const current = (root.getAttribute('data-accent') || 'red').toLowerCase();
          const validThemes = ['red', 'green', 'blue', 'gold'];
          const themeMeta = {
            red:   { hex: '#ff0000', label: 'RED' },
            green: { hex: '#00ff00', label: 'GREEN' },
            blue:  { hex: '#0000FF', label: 'BLUE' },
            gold:  { hex: '#ffd700', label: 'GOLD' }
          };

          function renderHelp(prefixMsg) {
            let out = '';
            if (prefixMsg) {
              out += prefixMsg + '\n';
            }
            out += `<span class="term-heading">[THEME ACCENT COLOR SWITCHER]</span>\n`;
            out += `Usage: <span class="term-accent">theme &lt;color&gt;</span>\n\n`;
            out += `Available colors:\n`;
            validThemes.forEach(t => {
              const meta = themeMeta[t];
              const isActive = t === current;
              const activeBadge = isActive ? ` <span class="term-good">[active]</span>` : '';
              out += `  • <span style="color: ${meta.hex}; font-weight: bold;">${t.padEnd(6, ' ')}</span> <span class="term-muted">${meta.hex}</span>${activeBadge}\n`;
            });
            out += `\nExample: Run '<span class="term-accent">theme gold</span>' to select gold color.`;
            return out;
          }

          if (!args.length || args[0] === 'help' || args[0] === '-h' || args[0] === '--help') {
            return renderHelp();
          }

          const rawTarget = args[0].toLowerCase();
          let target = rawTarget;

          if (rawTarget === 'toggle') {
            const idx = validThemes.indexOf(current);
            target = idx === -1 ? 'red' : validThemes[(idx + 1) % validThemes.length];
          } else if (!validThemes.includes(rawTarget)) {
            return renderHelp(`<span class="term-error">theme: unknown color '${escapeHtml(args[0])}'.</span>`);
          }

          root.setAttribute('data-accent', target);
          root.className = 'accent-' + target;
          try { localStorage.setItem('theme_accent', target); } catch (e) {}

          const label = document.getElementById('accent-label');
          if (label) label.textContent = target;

          const meta = themeMeta[target];
          return `<span class="term-good">[✓] Switched accent theme to:</span> <span class="term-accent" style="color: ${meta.hex}; font-weight: bold;">${meta.label}</span> <span class="term-muted">(${meta.hex})</span>`;
        }
      },

      matrix: {
        desc: 'Toggle Matrix digital rain effect',
        run: () => {
          return toggleMatrix();
        }
      },

      clear: {
        desc: 'Clear terminal screen',
        run: () => {
          termOutput.innerHTML = '';
          return null;
        }
      },

      cls: {
        desc: 'Alias for clear',
        run: () => commands.clear.run()
      },

      history: {
        desc: 'Show executed command history',
        run: () => {
          if (!history.length) return `<span class="term-muted">No commands in history yet.</span>`;
          return history.map((cmd, i) => `<span class="term-muted">${String(i + 1).padStart(4, ' ')}</span>  ${cmd}`).join('\n');
        }
      },

      date: {
        desc: 'Display current system date and time',
        run: () => new Date().toString()
      },

      uptime: {
        desc: 'Display time spent on the site and session uptime',
        run: () => {
          const duration = getSiteUptime();
          const timeStr = new Date().toTimeString().split(' ')[0];
          return `${timeStr} up ${duration},  1 user,  load average: 0.08, 0.04, 0.01\n<span class="term-muted">Time spent on site:</span> <span class="term-accent">${duration}</span>`;
        }
      },

      uname: {
        desc: 'Print system information',
        run: () => `Linux apokolips 6.12.0-hardened #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux`
      },

      id: {
        desc: 'Print user identity and groups',
        run: () => `uid=1000(darkseid) gid=1000(darkseid) groups=1000(darkseid),27(sudo),1337(hacker)`
      },

      echo: {
        desc: 'Print text',
        run: (args) => args.join(' ')
      },

      sudo: {
        desc: 'Execute command with elevated privileges',
        run: (args) => {
          return `<span class="term-error">[!] darkseid is not in the sudoers file. This incident will be reported to the Highfather.</span>`;
        }
      },

      curl: {
        desc: 'Simulate HTTP request',
        run: (args) => {
          if (!args.length) return `<span class="term-error">curl: try 'curl --help' for more information</span>`;
          const url = args[0];
          return `<span class="term-good">HTTP/1.1 200 OK</span>
<span class="term-muted">Server: zxc/0.1.0 (Rust)</span>
<span class="term-muted">Content-Type: text/plain; charset=utf-8</span>
<span class="term-muted">Connection: keep-alive</span>

{"status": "intercepted", "target": "${url}", "proxy": "127.0.0.1:8080"}`;
        }
      },

      banner: {
        desc: 'Print welcome header banner',
        run: () => getWelcomeBanner()
      },

      exit: {
        desc: 'Close terminal session',
        run: () => {
          return `<span class="term-warn">There is no escape from Apokolips.</span>`;
        }
      },

      quit: {
        desc: 'Alias for exit',
        run: () => commands.exit.run()
      }
    };

    function getWelcomeBanner() {
      return `<span class="term-accent">  ██████╗  █████╗ ██████╗ ██╗  ██╗███████╗███████╗██╗██████╗ 
  ██╔══██╗██╔══██╗██╔══██╗██║ ██╔╝██╔════╝██╔════╝██║██╔══██╗
  ██║  ██║███████║██████╔╝█████═╝ ███████╗█████╗  ██║██║  ██║
  ██║  ██║██╔══██║██╔══██╗██╔═██╗ ╚════██║██╔══╝  ██║██║  ██║
  ██████╔╝██║  ██║██║  ██║██║ ╚██╗███████║███████╗██║██████╔╝
  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝╚═════╝</span>
<span class="term-good">Session:</span> <span class="prompt-user">darkseid</span><span class="term-muted">@</span><span class="prompt-host">apokolips</span> (x86_64-linux-hardened)
<span class="term-good">Status:</span>  OSCP Certified Security Researcher &middot; Systems &amp; Terminal Fu
Type <span class="term-accent">'help'</span> to inspect manual or <span class="term-accent">'zxc'</span> to view project.`;
    }

    // Append a line to terminal output
    function appendOutput(html) {
      if (html === null || html === undefined || html === '') return;
      const cleaned = typeof html === 'string' ? html.trim() : html;
      if (!cleaned) return;
      const div = document.createElement('div');
      div.className = 'terminal-line terminal-output-line';
      div.innerHTML = cleaned;
      termOutput.appendChild(div);
      termBody.scrollTop = termBody.scrollHeight;
    }

    // Append executed command line
    function appendCommandLine(cmdText) {
      const line = document.createElement('div');
      line.className = 'terminal-line terminal-cmd-line';
      line.innerHTML = `<span class="terminal-prompt"><span class="prompt-user">darkseid</span><span class="prompt-at">@</span><span class="prompt-host">apokolips</span><span class="prompt-colon">:</span><span class="prompt-path">~</span><span class="prompt-char">$</span></span> <span class="term-bright">${escapeHtml(cmdText)}</span>`;
      termOutput.appendChild(line);
    }

    function escapeHtml(str) {
      return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
      );
    }

    // Execute input command
    function executeCommand(raw) {
      const trimmed = raw.trim();
      appendCommandLine(raw);

      if (trimmed.length > 0) {
        history.push(trimmed);
        historyIndex = history.length;

        const parts = trimmed.split(/\s+/);
        const cmdName = parts[0].toLowerCase();
        const args = parts.slice(1);

        if (commands[cmdName]) {
          try {
            const res = commands[cmdName].run(args);
            if (res !== null && res !== undefined && res !== '') appendOutput(res);
          } catch (err) {
            appendOutput(`<span class="term-error">Error executing '${cmdName}': ${err.message}</span>`);
          }
        } else {
          appendOutput(`<span class="term-error">zsh: command not found: ${escapeHtml(cmdName)}. Type '<span class="term-accent">help</span>' for available commands.</span>`);
        }
      }

      termBody.scrollTop = termBody.scrollHeight;
    }

    // Autocomplete logic
    function handleAutocomplete() {
      const val = hiddenInput.value;
      const parts = val.split(/\s+/);
      
      // If typing first command
      if (parts.length <= 1) {
        const prefix = (parts[0] || '').toLowerCase();
        const cmdList = Object.keys(commands);
        const matches = cmdList.filter(c => c.startsWith(prefix));

        if (matches.length === 1) {
          hiddenInput.value = matches[0] + ' ';
          displaySpan.textContent = hiddenInput.value;
        } else if (matches.length > 1) {
          appendCommandLine(val);
          appendOutput(matches.map(m => `<span class="term-accent">${m}</span>`).join('    '));
        }
      } else {
        const cmd = (parts[0] || '').toLowerCase();
        if (cmd === 'theme') {
          const themeList = ['red', 'green', 'blue', 'gold'];
          const prefix = (parts[parts.length - 1] || '').toLowerCase();
          const matches = themeList.filter(t => t.startsWith(prefix));

          if (matches.length === 1) {
            parts[parts.length - 1] = matches[0];
            hiddenInput.value = parts.join(' ') + ' ';
            displaySpan.textContent = hiddenInput.value;
          } else if (matches.length > 1) {
            appendCommandLine(val);
            appendOutput(matches.map(m => `<span class="term-accent">${m}</span>`).join('    '));
          }
          return;
        }

        // Autocomplete file names for 'cat', 'open', etc.
        const prefix = parts[parts.length - 1].toLowerCase();
        const fileList = Object.keys(files);
        const matches = fileList.filter(f => f.startsWith(prefix));

        if (matches.length === 1) {
          parts[parts.length - 1] = matches[0];
          hiddenInput.value = parts.join(' ') + ' ';
          displaySpan.textContent = hiddenInput.value;
        } else if (matches.length > 1) {
          appendCommandLine(val);
          appendOutput(matches.map(m => `<span class="term-good">${m}</span>`).join('    '));
        }
      }
    }

    // Matrix Rain Effect
    let matrixInterval = null;
    function toggleMatrix() {
      if (!matrixCanvas) return 'Matrix canvas unavailable.';
      if (matrixInterval) {
        clearInterval(matrixInterval);
        matrixInterval = null;
        matrixCanvas.style.display = 'none';
        return `<span class="term-warn">Matrix simulation terminated.</span>`;
      }

      matrixCanvas.style.display = 'block';
      matrixCanvas.width = termWindow.clientWidth;
      matrixCanvas.height = termWindow.clientHeight;

      const ctx = matrixCanvas.getContext('2d');
      const rootAccent = document.documentElement.getAttribute('data-accent') || 'red';
      const rainColors = {
        red: '#ff0000',
        green: '#00ff00',
        blue: '#0000FF',
        gold: '#ffd700'
      };
      const rainColor = rainColors[rootAccent] || '#ff0000';

      const chars = '0123456789ABCDEF0x$%#@!&*~+-=<>{}[]/\\|;:,.~';
      const fontSize = 13;
      const columns = Math.floor(matrixCanvas.width / fontSize);
      const drops = Array(columns).fill(1);

      function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

        ctx.fillStyle = rainColor;
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
          const text = chars.charAt(Math.floor(Math.random() * chars.length));
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);

          if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      }

      matrixInterval = setInterval(drawMatrix, 40);
      return `<span class="term-good">[+] Matrix protocol activated. Run 'matrix' again or press any key to stop.</span>`;
    }

    // Event Listeners for Input & Keystrokes
    hiddenInput.addEventListener('input', () => {
      displaySpan.textContent = hiddenInput.value;
      termBody.scrollTop = termBody.scrollHeight;
    });

    hiddenInput.addEventListener('keydown', (e) => {
      // If matrix is running, any key cancels it
      if (matrixInterval) {
        toggleMatrix();
        e.preventDefault();
        return;
      }

      // Enter
      if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = hiddenInput.value;
        hiddenInput.value = '';
        displaySpan.textContent = '';
        executeCommand(cmd);
        return;
      }

      // Tab Autocomplete
      if (e.key === 'Tab') {
        e.preventDefault();
        handleAutocomplete();
        return;
      }

      // Terminal scrolling via keyboard
      if (e.key === 'PageUp') {
        e.preventDefault();
        termBody.scrollTop -= Math.round(termBody.clientHeight * 0.75);
        return;
      }
      if (e.key === 'PageDown') {
        e.preventDefault();
        termBody.scrollTop += Math.round(termBody.clientHeight * 0.75);
        return;
      }
      if (e.shiftKey && e.key === 'ArrowUp') {
        e.preventDefault();
        termBody.scrollTop -= 45;
        return;
      }
      if (e.shiftKey && e.key === 'ArrowDown') {
        e.preventDefault();
        termBody.scrollTop += 45;
        return;
      }
      if (e.shiftKey && e.key === 'Home') {
        e.preventDefault();
        termBody.scrollTop = 0;
        return;
      }
      if (e.shiftKey && e.key === 'End') {
        e.preventDefault();
        termBody.scrollTop = termBody.scrollHeight;
        return;
      }

      // Up Arrow (history prev)
      if (e.key === 'ArrowUp' && !e.shiftKey) {
        e.preventDefault();
        if (history.length > 0) {
          if (historyIndex > 0) historyIndex--;
          hiddenInput.value = history[historyIndex] || '';
          displaySpan.textContent = hiddenInput.value;
        }
        return;
      }

      // Down Arrow (history next)
      if (e.key === 'ArrowDown' && !e.shiftKey) {
        e.preventDefault();
        if (historyIndex < history.length - 1) {
          historyIndex++;
          hiddenInput.value = history[historyIndex] || '';
        } else {
          historyIndex = history.length;
          hiddenInput.value = '';
        }
        displaySpan.textContent = hiddenInput.value;
        return;
      }

      // Ctrl + L (clear)
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        commands.clear.run();
        return;
      }

      // Ctrl + C (cancel line)
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        appendCommandLine(hiddenInput.value + '^C');
        hiddenInput.value = '';
        displaySpan.textContent = '';
        return;
      }

      // Ctrl + U (clear input)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        hiddenInput.value = '';
        displaySpan.textContent = '';
        return;
      }
    });

    // Keep focus inside terminal on click anywhere in terminal
    termWindow.addEventListener('click', (e) => {
      // Don't steal focus if clicking external links
      if (e.target.tagName.toLowerCase() === 'a') return;
      hiddenInput.focus();
    });

    // Allow mousewheel scrolling anywhere over the terminal window (chrome, hints, body)
    termWindow.addEventListener('wheel', (e) => {
      if (e.target !== termBody && !termBody.contains(e.target)) {
        termBody.scrollTop += e.deltaY;
        e.preventDefault();
      }
    }, { passive: false });

    // Action buttons in window chrome
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        termWindow.classList.toggle('terminal-window--fullscreen');
        const isFull = termWindow.classList.contains('terminal-window--fullscreen');
        fullscreenBtn.textContent = isFull ? 'Exit [Esc]' : 'Fullscreen';
        hiddenInput.focus();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && termWindow.classList.contains('terminal-window--fullscreen')) {
          termWindow.classList.remove('terminal-window--fullscreen');
          fullscreenBtn.textContent = 'Fullscreen';
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        commands.clear.run();
        hiddenInput.focus();
      });
    }

    // Quick Command Chip Clicks
    document.querySelectorAll('[data-term-cmd]').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const cmd = chip.getAttribute('data-term-cmd');
        if (cmd) {
          executeCommand(cmd);
          hiddenInput.focus();
        }
      });
    });

    // Auto-focus input on page load
    setTimeout(() => {
      hiddenInput.focus();
    }, 100);
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTerminal);
  } else {
    initTerminal();
  }
})();
