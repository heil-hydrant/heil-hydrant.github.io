/**
 * Terminal Live Interactive Terminal Engine
 * Inspired by tmux, zsh & modern cybernetic aesthetic
 */
(function () {
  'use strict';

  function initTerminal() {
    const termWindow = document.getElementById('terminal-window');
    const termBody = document.getElementById('terminal-body');
    const termOutput = document.getElementById('terminal-output');
    const hiddenInput = document.getElementById('terminal-input');
    const displaySpan = document.getElementById('terminal-input-display');
    const fullscreenBtn = document.getElementById('term-fullscreen-btn');
    const clearBtn = document.getElementById('term-clear-btn');

    if (!termWindow || !termBody || !hiddenInput) return;

    // Dynamic Site & Terminal Configuration
    const siteData = window.__TERMINAL_DATA__ || {
      author: 'user',
      title: 'Terminal',
      desc: 'Interactive Terminal Interface',
      user: 'user',
      host: 'terminal',
      session: 'session',
      shell: 'zsh',
      prompt_char: '$',
      blur: '20%',
      darkness: '35%',
      status: 'Online',
      welcome_tip: "Type <span class=\"term-accent\">'help'</span> for manual.",
      banner: '',
      whoami_bio: '',
      kernel: 'Linux terminal 6.12.0 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux',
      tmux_version: 'tmux 3.4',
      contact: {
        email: '',
        email_label: 'Email',
        socials: []
      },
      windows: [
        { id: 'zsh', name: 'zsh', type: 'shell' }
      ],
      virtual_files: [],
      posts: []
    };

    // Parse and apply configured blur & darkness for frosted glass when focused
    function applyGlassConfig() {
      const b = siteData.blur;
      const d = siteData.darkness;
      if (b !== undefined && b !== null && b !== '') {
        let blurPx = '10px';
        if (typeof b === 'number') {
          if (b === 0) {
            blurPx = '0px';
          } else if (b <= 1) {
            blurPx = Math.round(b * 50) + 'px';
          } else if (b <= 100) {
            blurPx = Math.round(b * 0.5) + 'px';
          } else {
            blurPx = b + 'px';
          }
        } else if (typeof b === 'string') {
          const str = b.trim().toLowerCase();
          if (str === 'none' || str === 'off' || str === '0' || str === '0%' || str === '0px') {
            blurPx = '0px';
          } else if (str.endsWith('%')) {
            const pct = parseFloat(str);
            blurPx = Math.round(pct * 0.5) + 'px'; // 20% -> 10px, 100% -> 50px
          } else if (str.endsWith('px')) {
            blurPx = str;
          } else {
            const num = parseFloat(str);
            if (!isNaN(num)) {
              if (num === 0) blurPx = '0px';
              else if (num <= 1) blurPx = Math.round(num * 50) + 'px';
              else if (num <= 100) blurPx = Math.round(num * 0.5) + 'px';
              else blurPx = num + 'px';
            } else {
              blurPx = str;
            }
          }
        }
        document.documentElement.style.setProperty('--terminal-blur', blurPx);
        if (blurPx === '0px' || blurPx === '0') {
          document.documentElement.style.setProperty('--terminal-backdrop-filter', 'none');
        } else {
          document.documentElement.style.setProperty('--terminal-backdrop-filter', `blur(${blurPx}) saturate(180%)`);
        }
      }

      if (d !== undefined && d !== null && d !== '') {
        let alpha = 0.35;
        if (typeof d === 'number') {
          alpha = d <= 1 ? d : (d / 100);
        } else if (typeof d === 'string') {
          const str = d.trim().toLowerCase();
          const num = parseFloat(str);
          if (!isNaN(num)) {
            alpha = str.endsWith('%') || num > 1 ? (num / 100) : num;
          }
        }
        alpha = Math.max(0, Math.min(1, alpha));
        document.documentElement.style.setProperty('--terminal-bg-alpha', alpha.toString());
      }
    }
    applyGlassConfig();

    function setTerminalFocus(focused) {
      if (focused) {
        termWindow.classList.add('terminal-window--focused');
        if (currentTmuxWindow === 'zsh') {
          if (hiddenInput && document.activeElement !== hiddenInput) {
            hiddenInput.focus({ preventScroll: true });
          }
        }
      } else {
        termWindow.classList.remove('terminal-window--focused');
        if (document.activeElement && termWindow.contains(document.activeElement)) {
          document.activeElement.blur();
        }
      }
    }

    // Command History
    const history = [];
    let historyIndex = -1;

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


    // Virtual Filesystem & Directory State
    let currentDir = '~';
    const files = Object.create(null);
    const articleFiles = Object.create(null);

    function updatePromptPath() {
      const pathEl = document.querySelector('.terminal-input-line .prompt-path');
      if (pathEl) {
        pathEl.textContent = currentDir;
      }
    }

    // 1. Populate virtual files from windows with markdown summaries (e.g. page.md)
    if (siteData.windows && Array.isArray(siteData.windows)) {
      siteData.windows.forEach((win) => {
        if (win.id !== 'zsh' && win.summary) {
          files[`${win.id}.md`] = {
            type: 'file',
            size: '1.2K',
            date: 'Nov 05 2026',
            content: win.summary
          };
        }
      });
    }

    // 2. Populate virtual files from config.extra.virtual_files (.profile, flag.txt, etc.)
    if (siteData.virtual_files && Array.isArray(siteData.virtual_files)) {
      siteData.virtual_files.forEach((vf) => {
        if (vf.name) {
          files[vf.name] = {
            type: 'file',
            size: vf.size || '1K',
            date: vf.date || 'Jan 01 2026',
            content: vf.content || ''
          };
        }
      });
    }

    // 3. Fallback virtual files if empty
    if (!files['.profile']) {
      files['.profile'] = {
        type: 'file',
        size: '120B',
        date: 'Jan 01 2026',
        content: `export EDITOR="vim"\nexport SHELL="/bin/zsh"`
      };
    }

    if (!files['mail.txt']) {
      const email = (siteData.contact && siteData.contact.email) || siteData.email || 'user@localhost';
      const usr = siteData.user || 'user';
      const hst = siteData.host || 'localhost';
      files['mail.txt'] = {
        type: 'file',
        size: '180B',
        date: 'Jan 01 2026',
        content: `From: ${email}\nTo: ${usr}@${hst}\nSubject: Direct Dispatch & Encrypted Comms\n\nReach out directly via: ${email}\nTip: Run 'contact' or 'contact --send' to launch your mail client.`
      };
    }

    // 4. Virtual directory for articles/posts & population of articleFiles
    if (siteData.posts && siteData.posts.length > 0) {
      files['articles'] = {
        type: 'dir',
        size: '160B',
        date: 'Jan 01 2026'
      };

      siteData.posts.forEach((p) => {
        const slug = (p.url || '').split('/').filter(Boolean).pop() || 'post';
        const fileName = slug.endsWith('.md') ? slug : `${slug}.md`;
        const content = `# ${p.title || slug}\nDate: ${p.date || '2026-01-01'}\nURL: ${p.url || ''}\n\n${p.desc || ''}`;
        articleFiles[fileName] = {
          type: 'file',
          size: '1.2K',
          date: p.date ? p.date.slice(0, 10) : 'Jan 01 2026',
          content: content
        };
      });
    }

    // Helper functions
    function escapeHtml(str) {
      if (typeof str !== 'string') return '';
      return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
      );
    }

    function copyToClipboard(text) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text).catch(() => {
          fallbackCopyText(text);
        });
      } else {
        fallbackCopyText(text);
        return Promise.resolve();
      }
    }

    function fallbackCopyText(text) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {}
      document.body.removeChild(textArea);
    }

    function renderContact(args) {
      const contact = siteData.contact || {};
      const email = contact.email || siteData.email || '';
      const emailLabel = contact.email_label || 'Email';
      const socials = contact.socials || [];

      if (args && (args.includes('--copy') || args.includes('copy'))) {
        if (email) {
          copyToClipboard(email);
          return `<span class="term-good">[✓] Copied '${escapeHtml(email)}' to clipboard.</span>`;
        }
        return `<span class="term-warn">No email address configured.</span>`;
      }

      if (args && (args.includes('--send') || args.includes('send'))) {
        if (email) {
          window.location.href = `mailto:${email}`;
          return `<span class="term-good">[✓] Launching default mail client for '${escapeHtml(email)}'...</span>`;
        }
        return `<span class="term-warn">No email address configured.</span>`;
      }

      let out = `<div style="margin: 4px 0 8px; font-family: var(--font-mono); font-size: 13px; line-height: 1.6;">\n`;
      out += `<span class="term-accent" style="font-weight: 700;"># Contact</span>\n\n`;
      if (email) {
        const mailtoUrl = `mailto:${escapeHtml(email)}`;
        out += `<span class="term-heading">[${escapeHtml(emailLabel)}]</span>\n`;
        out += `<div style="display: flex; align-items: center; gap: 8px;">• <span class="term-accent" style="font-weight: 600;">${escapeHtml(email)}</span>\n`;
        out += `  <button type="button" class="terminal-action-btn term-copy-btn" data-copy="${escapeHtml(email)}" style="border: 1px solid var(--accent-border); padding: 2px 8px; border-radius: var(--radius-sm); color: var(--fg); background: rgba(255, 255, 255, 0.05); cursor: pointer; margin-left: 8px;">📋 Copy</button>\n`;
        out += `  <a href="${mailtoUrl}" class="terminal-action-btn" style="border: 1px solid var(--accent-border); padding: 2px 8px; border-radius: var(--radius-sm); color: var(--fg); background: rgba(255, 255, 255, 0.05); text-decoration: none; display: inline-flex; align-items: center;">✉️ Send Mail</a>\n`;
        out += `</div>\n\n`;
      }
      if (socials && socials.length > 0) {
        out += `<span class="term-heading">[SOCIAL]</span>\n`;
        socials.forEach(s => {
          out += '• <a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener" class="term-link">' + escapeHtml((s.name || s.url || 'link').toLowerCase()) + '</a>\n';
        });
      }
      out += `</div>\n`;
      if (email) {
        out += `<span class="term-muted">Tip: Run 'contact --copy' to copy email address, or 'contact --send' to open your mail app.</span>`;
      }
      return out;
    }

    // Tmux Window System
    const TMUX_WINDOWS = (siteData.windows && siteData.windows.length > 0)
      ? siteData.windows.map(w => w.id)
      : ['zsh'];
    let currentTmuxWindow = TMUX_WINDOWS[0] || 'zsh';

    function normalizeWindowName(target) {
      if (target === undefined || target === null) return TMUX_WINDOWS[0] || 'zsh';
      const str = String(target).trim().toLowerCase();
      const num = parseInt(str, 10);
      if (!isNaN(num) && num >= 0 && num < TMUX_WINDOWS.length && String(num) === str) {
        return TMUX_WINDOWS[num];
      }
      if (['mail', 'email', 'smtp'].includes(str) && TMUX_WINDOWS.includes('contact')) {
        return 'contact';
      }
      if (TMUX_WINDOWS.includes(str)) return str;
      if (siteData.windows) {
        const found = siteData.windows.find(w => w.name && w.name.toLowerCase() === str);
        if (found) return found.id;
      }
      return str;
    }

    function cycleTmuxWindow(direction) {
      const currentIndex = TMUX_WINDOWS.indexOf(currentTmuxWindow);
      const baseIndex = currentIndex >= 0 ? currentIndex : 0;
      const nextIndex = (baseIndex + direction + TMUX_WINDOWS.length) % TMUX_WINDOWS.length;
      switchTmuxWindow(TMUX_WINDOWS[nextIndex]);
    }

    function switchTmuxWindow(targetWindow) {
      if (!targetWindow) return false;
      const target = normalizeWindowName(targetWindow);

      // Verify that the target pane actually exists in DOM before switching
      let targetPane = null;
      try {
        targetPane = document.querySelector(`.tmux-pane[data-pane="${CSS.escape(target)}"]`);
      } catch (err) {
        return false;
      }
      if (!targetPane) {
        return false;
      }

      currentTmuxWindow = target;

      // 1. Show only the pane matching data-pane="<target>"
      const panes = document.querySelectorAll('.tmux-pane, [data-pane]');
      panes.forEach(pane => {
        const paneName = normalizeWindowName(pane.getAttribute('data-pane'));
        const isTarget = (paneName === target);
        if (isTarget) {
          pane.classList.add('tmux-pane--active');
          pane.style.display = 'flex';
        } else {
          pane.classList.remove('tmux-pane--active');
          pane.style.display = 'none';
        }
      });

      // 2. Update .tmux-tab active state and asterisk '*'
      const tabs = document.querySelectorAll('.tmux-tab');
      tabs.forEach(tab => {
        const tabName = normalizeWindowName(tab.getAttribute('data-tab-name') || tab.getAttribute('data-tmux-cmd'));
        const isTarget = (tabName === target);
        tab.classList.toggle('tmux-tab--active', isTarget);

        const labelSpan = tab.querySelector('.tmux-tab-label');
        if (labelSpan) {
          const clean = labelSpan.textContent.replace(/\*+$/, '').trim();
          labelSpan.textContent = isTarget ? (clean + '*') : clean;
        }
      });

      // 3. Scroll & focus management
      if (target === 'zsh') {
        if (termBody) {
          termBody.scrollTop = termBody.scrollHeight;
        }
        setTerminalFocus(true);
      } else {
        if (termBody) {
          termBody.scrollTop = 0;
        }
        const paneContent = targetPane.querySelector('.tmux-pane-content');
        if (paneContent) {
          paneContent.scrollTop = 0;
        }
        if (document.activeElement && termWindow.contains(document.activeElement)) {
          document.activeElement.blur();
        }
      }

      return true;
    }

    function getActiveScrollContainer() {
      return termBody;
    }

    // Alias for backwards-compatibility
    function updateTmuxTab(tabName) {
      switchTmuxWindow(tabName);
    }

    // Expose globally for testing & external hooks
    window.switchTmuxWindow = switchTmuxWindow;

    // Commands dictionary
    const commands = {
      help: {
        desc: 'List all available terminal commands',
        run: () => {
          let rows = `<div class="term-tr"><div class="term-td term-accent">whoami</div><div class="term-td">Display operator identity, credentials &amp; status</div></div>\n`;

          // Dynamic window switching commands
          if (siteData.windows && siteData.windows.length > 0) {
            siteData.windows.forEach((w, idx) => {
              if (w.id !== 'zsh') {
                rows += `<div class="term-tr"><div class="term-td term-accent">${escapeHtml(w.id)}</div><div class="term-td">Switch to Window ${idx} (${escapeHtml(w.name)} static view)</div></div>\n`;
              }
            });
          }

          rows += `  <div class="term-tr"><div class="term-td term-accent">ls [-la]</div><div class="term-td">List directory contents and files</div></div>
  <div class="term-tr"><div class="term-td term-accent">cat &lt;file&gt;</div><div class="term-td">Read a file (e.g. 'cat .profile')</div></div>
  <div class="term-tr"><div class="term-td term-accent">open &lt;page&gt;</div><div class="term-td">Navigate directly to an article or page</div></div>
  <div class="term-tr"><div class="term-td term-accent">theme [color]</div><div class="term-td">Select accent color (red, green, blue, gold) or view help</div></div>
  <div class="term-tr"><div class="term-td term-accent">uname</div><div class="term-td">Print operating system kernel architecture</div></div>
  <div class="term-tr"><div class="term-td term-accent">id</div><div class="term-td">Print real and effective user / group IDs</div></div>
  <div class="term-tr"><div class="term-td term-accent">history</div><div class="term-td">Show command execution history</div></div>
  <div class="term-tr"><div class="term-td term-accent">clear / cls</div><div class="term-td">Clear terminal buffer screen (or Ctrl+L)</div></div>
  <div class="term-tr"><div class="term-td term-accent">echo &lt;text&gt;</div><div class="term-td">Print arguments to terminal output</div></div>
  <div class="term-tr"><div class="term-td term-accent">date</div><div class="term-td">Display current system date and time</div></div>
  <div class="term-tr"><div class="term-td term-accent">uptime</div><div class="term-td">Display total time spent on the site &amp; session uptime</div></div>
  <div class="term-tr"><div class="term-td term-accent">sudo &lt;cmd&gt;</div><div class="term-td">Attempt privilege escalation</div></div>`;

          return `<span class="term-heading" style="display: inline-block; font-weight: 700; text-decoration: underline; text-underline-offset: 4px; margin-bottom: 6px;">AVAILABLE COMMANDS &amp; MANUAL</span>
<div class="term-table">
${rows}
</div>
<span class="term-muted">Tip: Press [Tab] to autocomplete commands or filenames. Use [↑] / [↓] for history.</span>`;
        }
      },

      whoami: {
        desc: 'Print current user identity',
        run: () => {
          if (siteData.whoami_bio) {
            return siteData.whoami_bio;
          }
          const u = escapeHtml(siteData.user || 'user');
          const d = escapeHtml(siteData.desc || 'Interactive Terminal Operator');
          const st = escapeHtml(siteData.status || 'Active');
          const sh = escapeHtml(siteData.shell || 'zsh');
          return `<span class="term-good">${u}</span> &middot; ${d}\nStatus:       <span class="term-good">${st}</span>\nShell:        ${sh}`;
        }
      },

      contact: {
        desc: 'Contact operator channels',
        run: (args) => renderContact(args)
      },

      mail: {
        desc: 'Alias for contact',
        run: (args) => commands.contact.run(args)
      },

      email: {
        desc: 'Alias for contact',
        run: (args) => commands.contact.run(args)
      },

      smtp: {
        desc: 'Alias for contact',
        run: (args) => commands.contact.run(args)
      },

      zsh: {
        desc: 'Switch to Window 0 (interactive shell)',
        run: () => {
          switchTmuxWindow('zsh');
          return null;
        }
      },

      tmux: {
        desc: 'Tmux window manager (switch with tmux select-window -t <target> or Ctrl+b <0-9|n|p>)',
        run: (args) => {
          const ver = siteData.tmux_version || 'tmux 3.4';
          const sess = siteData.session || 'session';
          if (!args.length) {
            const lines = TMUX_WINDOWS.map((wId, i) => {
              const obj = (siteData.windows || []).find(w => w.id === wId) || { name: wId };
              return `  ${i}: ${wId} (${obj.name || wId})`;
            }).join('\n');
            const shortcuts = TMUX_WINDOWS.map((_, i) => `<span class="term-good">${i}</span>`).join(', ');
            return `${escapeHtml(ver)} — session [${escapeHtml(sess)}]\nActive windows:\n${lines}\n\nShortcuts: Press <span class="term-accent">Ctrl+b</span> followed by ${shortcuts}, <span class="term-good">n</span> (next), or <span class="term-good">p</span> (prev).`;
          }
          const sub = (args[0] || '').toLowerCase();
          if (sub === 'select-window' || sub === 'selectw') {
            const tIdx = args.indexOf('-t');
            const target = tIdx !== -1 ? args[tIdx + 1] : args[1];
            if (target) {
              if (!switchTmuxWindow(target)) {
                return `<span class="term-error">can't find window: ${escapeHtml(target)}</span>`;
              }
              return null;
            }
            return `<span class="term-error">tmux: specify a window target (-t &lt;name|index&gt;)</span>`;
          }
          if (sub === 'next-window' || sub === 'next' || sub === 'n') {
            cycleTmuxWindow(1);
            return null;
          }
          if (sub === 'previous-window' || sub === 'prev-window' || sub === 'prev' || sub === 'p') {
            cycleTmuxWindow(-1);
            return null;
          }
          if (args.length === 1) {
            if (!switchTmuxWindow(args[0])) {
              return `<span class="term-error">can't find window: ${escapeHtml(args[0])}</span>`;
            }
            return null;
          }
          return `<span class="term-error">tmux: unknown action '${escapeHtml(args.join(' '))}'</span>`;
        }
      },

      ls: {
        desc: 'List directory contents',
        run: (args) => {
          const isLong = args.includes('-l') || args.includes('-la') || args.includes('-al');
          const usr = escapeHtml(siteData.user || 'user');
          const isArticlesArg = args.includes('articles') || args.includes('articles/') || args.includes('~/articles');
          const currentFiles = (currentDir === '~/articles' || isArticlesArg) ? articleFiles : files;

          if (isLong) {
            let out = `<div class="term-table"><div class="term-tr term-muted"><div class="term-td">Permissions</div><div class="term-td">User</div><div class="term-td">Size</div><div class="term-td">Date</div><div class="term-td">Name</div></div>`;
            Object.keys(currentFiles).forEach((name) => {
              const f = currentFiles[name];
              const perm = f.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--';
              const nameClass = f.type === 'dir' ? 'term-good' : (name.startsWith('flag') ? 'term-warn' : 'term-fg');
              out += `<div class="term-tr"><div class="term-td term-muted">${perm}</div><div class="term-td">${usr}</div><div class="term-td term-muted">${f.size}</div><div class="term-td term-muted">${f.date}</div><div class="term-td ${nameClass}">${name}${f.type === 'dir' ? '/' : ''}</div></div>`;
            });
            out += `</div>`;
            return out;
          }

          let names = Object.keys(currentFiles).map((name) => {
            const f = currentFiles[name];
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
          const rawTarget = args[0].replace(/^\.\//, '');
          let target = rawTarget;
          let raw = null;

          const currentFiles = currentDir === '~/articles' ? articleFiles : files;

          if (target === '~/.profile' || target === '.profile') {
            raw = (files['.profile'] && files['.profile'].content) || null;
            if (raw === null) return `<span class="term-error">cat: .profile not found</span>`;
          } else if (currentDir === '~' && target.startsWith('articles/')) {
            const sub = target.replace(/^articles\//, '');
            if (Object.hasOwn(articleFiles, sub)) {
              raw = articleFiles[sub].content;
            } else if (Object.hasOwn(articleFiles, sub + '.md')) {
              raw = articleFiles[sub + '.md'].content;
            } else {
              return `<span class="term-error">cat: ${escapeHtml(target)}: No such file or directory</span>`;
            }
          } else if (Object.hasOwn(currentFiles, target)) {
            if (currentFiles[target].type === 'dir') return `<span class="term-error">cat: ${escapeHtml(target)}: Is a directory</span>`;
            raw = currentFiles[target].content;
          } else if (Object.hasOwn(currentFiles, target + '.md')) {
            raw = currentFiles[target + '.md'].content;
          } else if (Object.hasOwn(currentFiles, target + '.txt')) {
            raw = currentFiles[target + '.txt'].content;
          } else {
            return `<span class="term-error">cat: ${escapeHtml(target)}: No such file or directory</span>`;
          }

          if (raw === null || raw === undefined) return '';

          if (typeof raw === 'string') {
            let str = raw.trim();
            // If the content is HTML (contains <div or <p blocks)
            if (str.includes('<div') || str.includes('<p')) {
              // Remove newlines between HTML tags so pre-wrap does not add extra blank lines
              str = str.replace(/>\s*\n+\s*</g, '><');
              // Collapse consecutive &nbsp; spacer lines to a single spacer
              str = str.replace(/(<div[^>]*>&nbsp;<\/div>)+/g, '<div class="terminal-line">&nbsp;</div>');
              return `<div class="term-cat-output">${str}</div>`;
            } else {
              // Plain text file: collapse 3+ consecutive newlines to at most 2 (single empty line)
              str = str.replace(/\n{3,}/g, '\n\n');
              return str;
            }
          }
          return raw;
        }
      },

      open: {
        desc: 'Navigate to article or page',
        run: (args) => {
          if (!args.length) return `<span class="term-error">open: specify a page (e.g. 'open about')</span>`;
          const target = args[0].toLowerCase().replace(/\.md$/, '').replace(/^\//, '').replace(/\/$/, '');
          
          // Check configured windows
          if (siteData.windows) {
            const win = siteData.windows.find(w => w.id === target || (w.name && w.name.toLowerCase() === target));
            if (win && win.url) {
              window.location.href = win.url;
              return `Navigating to ${escapeHtml(win.url)}...`;
            }
          }
          // Check posts/pages
          if (siteData.posts) {
            const post = siteData.posts.find(p => {
              const slug = (p.url || '').split('/').filter(Boolean).pop();
              return slug === target || (p.title && p.title.toLowerCase() === target);
            });
            if (post && post.url) {
              window.location.href = post.url;
              return `Navigating to ${escapeHtml(post.url)}...`;
            }
          }
          // Fallback direct path navigation
          if (target === 'about') {
            window.location.href = '/about/';
            return 'Navigating to /about/...';
          }
          return `<span class="term-error">open: page '${escapeHtml(target)}' not found. Try 'ls' to list files.</span>`;
        }
      },

      cd: {
        desc: 'Change directory',
        run: (args) => {
          if (!args.length || args[0] === '~' || args[0] === '/') {
            currentDir = '~';
            updatePromptPath();
            return '';
          }
          const target = args[0].trim();
          if (target === '.' || target === './') {
            return '';
          }
          if (target === '..' || target === '../') {
            currentDir = '~';
            updatePromptPath();
            return '';
          }
          if (target === 'articles' || target === 'articles/' || target === '~/articles' || target === '~/articles/') {
            if (files['articles'] && files['articles'].type === 'dir') {
              currentDir = '~/articles';
              updatePromptPath();
              return '';
            }
            return `<span class="term-error">cd: no such file or directory: ${escapeHtml(target)}</span>`;
          }
          return `<span class="term-error">cd: no such file or directory: ${escapeHtml(target)}</span>`;
        }
      },

      pwd: {
        desc: 'Print working directory',
        run: () => {
          const usr = escapeHtml(siteData.user || 'user');
          const base = `/home/${usr}`;
          if (currentDir === '~' || currentDir === '') return base;
          return `${base}/${currentDir.replace(/^~\/?/, '')}`;
        }
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
          return history.map((cmd, i) => `<span class="term-muted">${String(i + 1).padStart(4, ' ')}</span>  ${escapeHtml(cmd)}`).join('\n');
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
        run: () => siteData.kernel || `Linux ${siteData.host || 'terminal'} 6.12.0 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux`
      },

      id: {
        desc: 'Print user identity and groups',
        run: () => {
          const u = siteData.user || 'user';
          return `uid=1000(${u}) gid=1000(${u}) groups=1000(${u}),27(sudo),1337(hacker)`;
        }
      },

      echo: {
        desc: 'Print text',
        run: (args) => escapeHtml(args.join(' '))
      },

      sudo: {
        desc: 'Execute command with elevated privileges',
        run: () => {
          const u = escapeHtml(siteData.user || 'user');
          return `<span class="term-error">[!] ${u} is not in the sudoers file. This incident will be reported.</span>`;
        }
      },

      curl: {
        desc: 'Simulate HTTP request',
        run: (args) => {
          if (!args.length) return `<span class="term-error">curl: try 'curl --help' for more information</span>`;
          const url = args[0];
          return `<span class="term-good">HTTP/1.1 200 OK</span>
<span class="term-muted">Server: terminal/1.0 (Zola)</span>
<span class="term-muted">Content-Type: text/plain; charset=utf-8</span>
<span class="term-muted">Connection: keep-alive</span>

{"status": "intercepted", "target": "${escapeHtml(url)}", "proxy": "127.0.0.1:8080"}`;
        }
      },

      banner: {
        desc: 'Print welcome header banner',
        run: () => getWelcomeBanner()
      },

      exit: {
        desc: 'Close terminal session',
        run: () => {
          const h = escapeHtml(siteData.host || 'terminal');
          return `<span class="term-warn">Session terminated? There is no escape from ${h}.</span>`;
        }
      },

      quit: {
        desc: 'Alias for exit',
        run: () => commands.exit.run()
      }
    };

    // Dynamically register commands for every configured tmux window
    if (siteData.windows && Array.isArray(siteData.windows)) {
      siteData.windows.forEach((win) => {
        if (win.id !== 'zsh' && !Object.hasOwn(commands, win.id)) {
          commands[win.id] = {
            desc: `Switch to Window (${escapeHtml(win.name)} static view)`,
            run: (args) => {
              if (args && (args.includes('open') || args.includes('--open') || args.includes('-o')) && win.url) {
                window.location.href = win.url;
                return `Navigating to ${escapeHtml(win.url)}...`;
              }
              switchTmuxWindow(win.id);
              return null;
            }
          };
        }
      });
    }

    function getWelcomeBanner() {
      const u = escapeHtml(siteData.user || 'user');
      const h = escapeHtml(siteData.host || 'terminal');
      const kernelInfo = siteData.kernel ? `(${siteData.kernel.split(' ')[2] || 'x86_64'})` : '(x86_64-linux)';
      const stat = siteData.status || siteData.desc || 'Interactive Terminal';
      const welcomeTip = siteData.welcome_tip || "Type <span class=\"term-accent\">'help'</span> to inspect manual.";
      const bannerArt = siteData.banner ? `<div class="terminal-line--banner"><span class="term-accent">${siteData.banner}</span></div>\n` : '';

      return `${bannerArt}<span class="term-good">Session:</span> <span class="prompt-user">${u}</span><span class="term-muted">@</span><span class="prompt-host">${h}</span> ${escapeHtml(kernelInfo)}
<span class="term-good">Status:</span>  ${stat}
${welcomeTip}\n`;
    }

    // Append a line to terminal output
    function appendOutput(html) {
      if (html === null || html === undefined || html === '') return;
      const cleaned = typeof html === 'string' ? html.trim() : html;
      if (!cleaned) return;
      const div = document.createElement('div');
      div.className = 'terminal-line terminal-output-line';
      if (typeof cleaned === 'string' && (cleaned.includes('class="term-cat-output"') || cleaned.includes('class="terminal-line"'))) {
        div.classList.add('terminal-output--rich');
      }
      div.innerHTML = cleaned;
      termOutput.appendChild(div);
      termBody.scrollTop = termBody.scrollHeight;
    }

    // Append executed command line
    function appendCommandLine(cmdText) {
      const line = document.createElement('div');
      line.className = 'terminal-line terminal-cmd-line';
      const u = escapeHtml(siteData.user || 'user');
      const h = escapeHtml(siteData.host || 'terminal');
      const pchar = escapeHtml(siteData.prompt_char || '$');
      line.innerHTML = `<span class="terminal-prompt"><span class="prompt-user">${u}</span><span class="prompt-at">@</span><span class="prompt-host">${h}</span><span class="prompt-colon">:</span><span class="prompt-path">${escapeHtml(currentDir || '~')}</span><span class="prompt-char">${pchar}</span></span> <span class="term-bright">${escapeHtml(cmdText)}</span>`;
      termOutput.appendChild(line);
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

        // Static tmux window switching from shell input
        if (TMUX_WINDOWS.includes(cmdName) || ['mail', 'email', 'smtp'].includes(cmdName)) {
          const targetWinObj = (siteData.windows || []).find(w => w.id === cmdName);
          if (targetWinObj && targetWinObj.url && args && (args.includes('open') || args.includes('--open') || args.includes('-o'))) {
            window.location.href = targetWinObj.url;
            return;
          }
          if ((cmdName === 'contact' || ['mail', 'email', 'smtp'].includes(cmdName)) &&
              args && (args.includes('--copy') || args.includes('copy') || args.includes('--send') || args.includes('send'))) {
            const res = renderContact(args);
            if (res) appendOutput(res);
            return;
          }
          switchTmuxWindow(cmdName);
          return;
        }

        if (cmdName === 'tmux') {
          const sub = (args[0] || '').toLowerCase();
          if (sub === 'select-window' || sub === 'selectw') {
            const tIdx = args.indexOf('-t');
            const target = tIdx !== -1 ? args[tIdx + 1] : args[1];
            if (target) {
              if (!switchTmuxWindow(target)) {
                appendOutput(`<span class="term-error">can't find window: ${escapeHtml(target)}</span>`);
              }
              return;
            }
          } else if (sub === 'next-window' || sub === 'next' || sub === 'n') {
            cycleTmuxWindow(1);
            return;
          } else if (sub === 'previous-window' || sub === 'prev-window' || sub === 'prev' || sub === 'p') {
            cycleTmuxWindow(-1);
            return;
          } else if (args.length === 1) {
            if (!switchTmuxWindow(args[0])) {
              appendOutput(`<span class="term-error">can't find window: ${escapeHtml(args[0])}</span>`);
            }
            return;
          }
        }

        if (cmdName === 'select-window' || cmdName === 'selectw') {
          const tIdx = args.indexOf('-t');
          const target = tIdx !== -1 ? args[tIdx + 1] : args[0];
          if (target) {
            if (!switchTmuxWindow(target)) {
              appendOutput(`<span class="term-error">can't find window: ${escapeHtml(target)}</span>`);
            }
            return;
          }
        }

        if (Object.hasOwn(commands, cmdName) && typeof commands[cmdName]?.run === 'function') {
          try {
            const res = commands[cmdName].run(args);
            if (res !== null && res !== undefined && res !== '') appendOutput(res);
          } catch (err) {
            appendOutput(`<span class="term-error">Error executing '${escapeHtml(cmdName)}': ${escapeHtml(err.message)}</span>`);
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
          appendOutput(matches.map(m => `<span class="term-accent">${escapeHtml(m)}</span>`).join('    '));
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
            appendOutput(matches.map(m => `<span class="term-accent">${escapeHtml(m)}</span>`).join('    '));
          }
          return;
        }

        if (cmd === 'contact' || cmd === 'mail' || cmd === 'email' || cmd === 'smtp') {
          const contactFlags = ['--copy', '--send'];
          const prefix = (parts[parts.length - 1] || '').toLowerCase();
          const matches = contactFlags.filter(m => m.startsWith(prefix));
          if (matches.length === 1) {
            parts[parts.length - 1] = matches[0];
            hiddenInput.value = parts.join(' ') + ' ';
            displaySpan.textContent = hiddenInput.value;
          } else if (matches.length > 1) {
            appendCommandLine(val);
            appendOutput(matches.map(m => `<span class="term-accent">${escapeHtml(m)}</span>`).join('    '));
          }
          return;
        }

        // Autocomplete file names for 'cat', 'open', etc.
        const prefix = parts[parts.length - 1].toLowerCase();
        const fileList = Object.keys(currentDir === '~/articles' ? articleFiles : files);
        const matches = fileList.filter(f => f.startsWith(prefix));

        if (matches.length === 1) {
          parts[parts.length - 1] = matches[0];
          hiddenInput.value = parts.join(' ') + ' ';
          displaySpan.textContent = hiddenInput.value;
        } else if (matches.length > 1) {
          appendCommandLine(val);
          appendOutput(matches.map(m => `<span class="term-good">${escapeHtml(m)}</span>`).join('    '));
        }
      }
    }

    // Event Listeners for Input & Keystrokes
    hiddenInput.addEventListener('input', () => {
      displaySpan.textContent = hiddenInput.value;
      termBody.scrollTop = termBody.scrollHeight;
    });

    hiddenInput.addEventListener('keydown', (e) => {
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
        const scrollTarget = getActiveScrollContainer();
        scrollTarget.scrollTop -= Math.round(scrollTarget.clientHeight * 0.75);
        return;
      }
      if (e.key === 'PageDown') {
        e.preventDefault();
        const scrollTarget = getActiveScrollContainer();
        scrollTarget.scrollTop += Math.round(scrollTarget.clientHeight * 0.75);
        return;
      }
      if (e.shiftKey && e.key === 'ArrowUp') {
        e.preventDefault();
        const scrollTarget = getActiveScrollContainer();
        scrollTarget.scrollTop -= 45;
        return;
      }
      if (e.shiftKey && e.key === 'ArrowDown') {
        e.preventDefault();
        const scrollTarget = getActiveScrollContainer();
        scrollTarget.scrollTop += 45;
        return;
      }
      if (e.shiftKey && e.key === 'Home') {
        e.preventDefault();
        const scrollTarget = getActiveScrollContainer();
        scrollTarget.scrollTop = 0;
        return;
      }
      if (e.shiftKey && e.key === 'End') {
        e.preventDefault();
        const scrollTarget = getActiveScrollContainer();
        scrollTarget.scrollTop = scrollTarget.scrollHeight;
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

      // Ctrl + C (cancel line or allow native copy if text is selected)
      if (e.ctrlKey && e.key === 'c') {
        const sel = window.getSelection();
        if (sel && sel.toString().length > 0) {
          return;
        }
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

    // Keep focus inside terminal on click anywhere in terminal, handle copy buttons
    termWindow.addEventListener('click', (e) => {
      const copyBtn = e.target.closest('[data-copy]');
      if (copyBtn) {
        e.preventDefault();
        e.stopPropagation();
        const textToCopy = copyBtn.getAttribute('data-copy');
        if (textToCopy) {
          copyToClipboard(textToCopy);
          const origHtml = copyBtn.innerHTML;
          copyBtn.innerHTML = '✓ Copied!';
          copyBtn.style.borderColor = 'var(--good)';
          copyBtn.style.color = 'var(--good)';
          setTimeout(() => {
            copyBtn.innerHTML = origHtml;
            copyBtn.style.borderColor = '';
            copyBtn.style.color = '';
          }, 2000);
        }
        setTerminalFocus(true);
        return;
      }

      // Handle command chips / action buttons inside terminal output
      const termCmdEl = e.target.closest('[data-term-cmd]');
      if (termCmdEl) {
        e.preventDefault();
        e.stopPropagation();
        const cmd = termCmdEl.getAttribute('data-term-cmd');
        if (cmd) executeCommand(cmd);
        setTerminalFocus(true);
        return;
      }

      // Don't steal focus if clicking switch buttons, tabs, links, or action buttons
      if (e.target.closest('a') || e.target.closest('[data-switch-pane], [data-target-tab], .tmux-switch-btn, .tmux-tab, button')) return;

      // Don't collapse text selection
      try {
        const sel = window.getSelection();
        if (sel && sel.toString().length > 0) return;
      } catch (err) {}

      setTerminalFocus(true);
    });

    // Window focus & blur management: Frosted glass when focused, opaque black when unfocused
    document.addEventListener('pointerdown', (e) => {
      if (!termWindow.contains(e.target)) {
        setTerminalFocus(false);
      } else {
        setTerminalFocus(true);
      }
    });

    window.addEventListener('focus', () => {
      setTerminalFocus(true);
    });

    window.addEventListener('blur', () => {
      setTerminalFocus(false);
    });

    // Allow mousewheel scrolling anywhere over the terminal window (chrome, hints, body)
    termWindow.addEventListener('wheel', (e) => {
      termBody.scrollTop += e.deltaY;
      e.preventDefault();
    }, { passive: false });

    // Action buttons in window chrome
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        termWindow.classList.toggle('terminal-window--fullscreen');
        const isFull = termWindow.classList.contains('terminal-window--fullscreen');
        fullscreenBtn.textContent = isFull ? 'Exit [Esc]' : 'Fullscreen';
        setTerminalFocus(true);
      });
    }

    // Keyboard Shortcuts: Tmux Prefix (Ctrl+b), Static Pane Navigation, and Scrolling
    let tmuxPrefixActive = false;
    let tmuxPrefixTimeout = null;

    document.addEventListener('keydown', (e) => {
      // Escape or 'q' key: return to zsh if currently on a static pane
      if (e.key === 'Escape' || (e.key === 'q' && currentTmuxWindow !== 'zsh' && !e.ctrlKey && !e.metaKey)) {
        if (currentTmuxWindow !== 'zsh') {
          e.preventDefault();
          switchTmuxWindow('zsh');
          return;
        }
        if (termWindow.classList.contains('terminal-window--fullscreen')) {
          termWindow.classList.remove('terminal-window--fullscreen');
          if (fullscreenBtn) fullscreenBtn.textContent = 'Fullscreen';
          return;
        }
      }

      // Tmux prefix key: Ctrl+b (or Cmd+b)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        tmuxPrefixActive = true;
        clearTimeout(tmuxPrefixTimeout);
        tmuxPrefixTimeout = setTimeout(() => {
          tmuxPrefixActive = false;
        }, 3000);
        return;
      }

      // If Tmux prefix was activated, process subsequent window command
      if (tmuxPrefixActive) {
        tmuxPrefixActive = false;
        clearTimeout(tmuxPrefixTimeout);

        const k = e.key.toLowerCase();
        const digit = parseInt(k, 10);
        if (!isNaN(digit) && digit >= 0 && digit < TMUX_WINDOWS.length) {
          e.preventDefault();
          switchTmuxWindow(TMUX_WINDOWS[digit]);
          return;
        }
        if (k === 'n') {
          e.preventDefault();
          cycleTmuxWindow(1);
          return;
        }
        if (k === 'p') {
          e.preventDefault();
          cycleTmuxWindow(-1);
          return;
        }
      }

      // Keyboard scrolling for static panes or when hiddenInput is not focused
      const isInputFocused = (document.activeElement === hiddenInput);
      if (!isInputFocused || currentTmuxWindow !== 'zsh') {
        if (e.key === 'PageUp') {
          e.preventDefault();
          termBody.scrollTop -= Math.round(termBody.clientHeight * 0.75);
          return;
        }
        if (e.key === 'PageDown' || (e.key === ' ' && currentTmuxWindow !== 'zsh')) {
          e.preventDefault();
          termBody.scrollTop += Math.round(termBody.clientHeight * 0.75);
          return;
        }
        if (e.key === 'ArrowUp' && (currentTmuxWindow !== 'zsh' || e.shiftKey)) {
          e.preventDefault();
          termBody.scrollTop -= 45;
          return;
        }
        if (e.key === 'ArrowDown' && (currentTmuxWindow !== 'zsh' || e.shiftKey)) {
          e.preventDefault();
          termBody.scrollTop += 45;
          return;
        }
        if ((e.key === 'k' || e.key === 'K') && currentTmuxWindow !== 'zsh' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          termBody.scrollTop -= 45;
          return;
        }
        if ((e.key === 'j' || e.key === 'J') && currentTmuxWindow !== 'zsh' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          termBody.scrollTop += 45;
          return;
        }
        if (e.key === 'Home' && (currentTmuxWindow !== 'zsh' || e.shiftKey)) {
          e.preventDefault();
          termBody.scrollTop = 0;
          return;
        }
        if (e.key === 'End' && (currentTmuxWindow !== 'zsh' || e.shiftKey)) {
          e.preventDefault();
          termBody.scrollTop = termBody.scrollHeight;
          return;
        }
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        switchTmuxWindow('zsh');
        commands.clear.run();
        setTerminalFocus(true);
      });
    }

    // Tmux Statusline Tab Clicks (switch static window without running commands)
    document.querySelectorAll('.tmux-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const tabName = tab.getAttribute('data-tab-name') || tab.getAttribute('data-tmux-cmd') || 'zsh';
        switchTmuxWindow(tabName);
      });
    });

    // Quick Command Chip Clicks
    document.querySelectorAll('[data-term-cmd]').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const cmd = chip.getAttribute('data-term-cmd');
        if (!cmd) return;
        const lowerCmd = cmd.trim().toLowerCase();
        if (TMUX_WINDOWS.includes(lowerCmd) || ['contact', 'mail', 'email', 'smtp'].includes(lowerCmd)) {
          switchTmuxWindow(lowerCmd);
        } else if (lowerCmd === 'clear' || lowerCmd === 'cls') {
          switchTmuxWindow('zsh');
          commands.clear.run();
          setTerminalFocus(true);
        } else {
          switchTmuxWindow('zsh');
          executeCommand(cmd);
          setTerminalFocus(true);
        }
      });
    });

    // Switch-pane buttons (e.g. "Return to 0:zsh" inside static panes)
    document.addEventListener('click', (e) => {
      const switchBtn = e.target.closest('[data-switch-pane], [data-target-tab], .tmux-switch-btn');
      if (switchBtn) {
        e.preventDefault();
        e.stopPropagation();
        const target = switchBtn.getAttribute('data-switch-pane') ||
                       switchBtn.getAttribute('data-target-tab') ||
                       'zsh';
        switchTmuxWindow(target);
      }
    });

    // Deep-link initial window/command support (e.g. ?window=about, ?cmd=about, ?cmd=help)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const initialWin = urlParams.get('window') || urlParams.get('tab');
      const initialCmd = urlParams.get('cmd');

      if (initialWin) {
        if (!switchTmuxWindow(initialWin)) {
          switchTmuxWindow('zsh');
        }
      } else if (initialCmd) {
        const lowerCmd = initialCmd.trim().toLowerCase();
        if (TMUX_WINDOWS.includes(lowerCmd) || ['mail', 'email', 'smtp'].includes(lowerCmd)) {
          if (!switchTmuxWindow(lowerCmd)) {
            switchTmuxWindow('zsh');
          }
        } else {
          switchTmuxWindow('zsh');
          executeCommand(initialCmd);
        }
      } else {
        switchTmuxWindow('zsh');
      }
    } catch (e) {
      switchTmuxWindow('zsh');
    }

    // Auto-focus input on page load (only on desktop devices)
    setTimeout(() => {
      const isTouch = window.matchMedia('(pointer: coarse)').matches;
      if (!isTouch) {
        setTerminalFocus(true);
      }
    }, 100);
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTerminal);
  } else {
    initTerminal();
  }
})();
