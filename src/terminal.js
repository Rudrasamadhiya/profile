// rudra-sh: a tiny shell that lives in the portfolio. ⌘K / Ctrl+K / ` to open.

const SECTIONS = { home: '#top', about: '#about', agents: '#agents', work: '#work', systems: '#systems', live: '#live', wins: '#wins', skills: '#skills', contact: '#contact' };

const PROJECTS = {
  prepsharp: {
    title: 'PrepSharp.in',
    url: 'https://prepsharp.in',
    lines: [
      'JEE prep on the real NTA TCS iON CBT interface — web + Android.',
      'scoring engine · answer review · PDF question-extraction pipeline · KaTeX',
      '133K+ questions · 241 JEE papers · founder & sole engineer',
      'stack: Next.js, React Native, Firestore',
    ],
  },
  kirana: {
    title: 'Instant Kirana',
    url: 'https://github.com/Rudrasamadhiya/instant-kirana',
    lines: [
      'Blinkit-style quick commerce for Tier-2/3 India.',
      '3 React Native apps + admin → API gateway → 7 NestJS microservices',
      'Socket.IO live GPS with 5s REST fallback · Redis + edge caching · SDUI',
      'tip: `open systems` to explore the architecture in 3D',
    ],
  },
  'android-agent-bridge': {
    title: 'Android Agent Bridge',
    url: 'https://rudrasamadhiya.github.io/android-agent-bridge/',
    lines: ['MCP server + Android app: AI agents drive a real phone.', '27 tools · 6 prompts · on-device OCR · Android 5.0+', 'Kotlin · TypeScript · published on npm'],
  },
  'expo-mcp-bridge': {
    title: 'expo-mcp-bridge',
    url: 'https://github.com/Rudrasamadhiya/expo-mcp-bridge',
    lines: ['Agents see, tap, type and debug your Expo app on a real phone.', 'reads console errors + failed network requests after every action'],
  },
  'expo-launch-video': {
    title: 'expo-launch-video',
    url: 'https://github.com/Rudrasamadhiya/expo-launch-video',
    lines: ['Agent records your live app and cuts a 1080p launch video.', 'promptable studio · in-browser MP4 render · no After Effects'],
  },
  flowlink: { title: 'FlowLink', url: 'https://github.com/Rudrasamadhiya', lines: ['Knowledge platform with enterprise RBAC — HackXios 2K25, Team DRONA.'] },
  pos: { title: 'Multi-Store POS', url: 'https://possystem-pvup.onrender.com/', lines: ['Pure-Java multi-tenant POS. Transactional billing, PBKDF2, CSV/Postgres.'] },
};

export function initTerminal({ scrollTo, onSudoHire } = {}) {
  const overlay = document.getElementById('term-overlay');
  const out = document.getElementById('termOut');
  const input = document.getElementById('termIn');
  const chips = document.getElementById('termChips');
  const history = [];
  let hIdx = 0, booted = false;

  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const print = (html = '', cls = '') => {
    const d = document.createElement('div');
    if (cls) d.className = cls;
    d.innerHTML = html;
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
    return d;
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const link = (href, text = href) => `<a href="${href}" target="_blank" rel="noopener">${esc(text)}</a>`;

  const COMMANDS = {
    help: () => {
      print('<span class="t-dim">available commands</span>');
      [
        ['whoami', 'who is this guy'],
        ['neofetch', 'system info, the fun way'],
        ['ls', 'list projects'],
        ['cat &lt;project&gt;', 'details — try <b>cat prepsharp</b>'],
        ['agents', 'the agent toolkit'],
        ['wins', 'trophies & receipts'],
        ['stack', 'languages, frameworks, infra'],
        ['open &lt;section&gt;', SECTIONS ? Object.keys(SECTIONS).join(' · ') : ''],
        ['npx android-agent-bridge', 'give your agent a phone'],
        ['github · linkedin · email', 'reach out'],
        ['sudo hire rudra', '🙂'],
        ['clear · exit', ''],
      ].forEach(([c, d]) => print(`  <span class="t-cmd">${c.padEnd(28, ' ')}</span><span class="t-dim">${d}</span>`));
    },
    whoami: () => {
      print('<b>Rudra Samadhiya</b> — full-stack engineer, founder of PrepSharp.in');
      print('CSE (Data Science) @ IIIT Bhopal · Bhopal, India');
      print('builds AI agent bridges, mobile apps and distributed backends.');
      print('<span class="t-dim">open to SWE internships & collaborations.</span>');
    },
    neofetch: () => {
      const art = [
        '  ██████╗  ',
        '  ██╔══██╗ ',
        '  ██████╔╝ ',
        '  ██╔══██╗ ',
        '  ██║  ██║ ',
        '  ╚═╝  ╚═╝ ',
      ];
      const info = [
        '<b class="t-red">rudra</b>@<b class="t-red">iiit-bhopal</b>',
        '-----------------------',
        '<span class="t-red">OS</span>: CSE (Data Science)',
        '<span class="t-red">Shell</span>: rudra-sh 1.0',
        '<span class="t-red">Packages</span>: 3 (npm)',
        '<span class="t-red">Products</span>: PrepSharp, Instant Kirana',
        '<span class="t-red">Languages</span>: TS, Java, Kotlin, C++, Python',
        '<span class="t-red">Uptime</span>: shipping since 2025',
        '<span class="t-red">Status</span>: open to work',
      ];
      for (let i = 0; i < Math.max(art.length, info.length); i++) {
        print(`<span class="t-red">${esc(art[i] || ' '.repeat(art[0].length))}</span>  ${info[i] || ''}`);
      }
    },
    ls: () => {
      print('<span class="t-dim">drwxr-xr-x</span>  ' + Object.keys(PROJECTS).map((k) => `<span class="t-cmd" data-run="cat ${k}">${k}/</span>`).join('  '));
      print('<span class="t-dim">tip: click a name, or type cat &lt;name&gt;</span>');
    },
    cat: (args) => {
      const key = (args[0] || '').replace(/\/$/, '').toLowerCase();
      const p = PROJECTS[key] || Object.entries(PROJECTS).find(([k]) => k.startsWith(key))?.[1];
      if (!key) return print('usage: cat &lt;project&gt; — run <b>ls</b> to see them', 't-err');
      if (!p) return print(`cat: ${esc(key)}: No such file or directory`, 't-err');
      print(`<b>${p.title}</b>  ${link(p.url, '↗')}`);
      p.lines.forEach((l) => print('  ' + esc(l).replace(/`(.+?)`/g, '<span class="t-cmd">$1</span>')));
    },
    agents: () => ['android-agent-bridge', 'expo-mcp-bridge', 'expo-launch-video'].forEach((k) => COMMANDS.cat([k])),
    wins: () => {
      print('🥇 <b>Strategy Blitz 2.0</b> — 1st prize, pitched PrepSharp (Shark Tank-style)');
      print('🥇 <b>6-Hour Hackathon</b> — winner');
      print('🥈 <b>RootRush CTF 2026</b> — #2, led Ctrl Alt Defend');
      print('⭐ GSSoC \'26 Power Contributor · HackXios 2K25 · SIH 2026');
    },
    stack: () => {
      [
        ['languages', 'TypeScript JavaScript Java Kotlin C++ Python'],
        ['frontend', 'React Next.js Tailwind Three.js Motion'],
        ['mobile', 'React Native Expo Kotlin Android-SDK'],
        ['backend', 'Node NestJS Socket.IO PostgreSQL MongoDB Redis Firebase'],
        ['infra', 'Docker Nginx Vercel GitHub-Actions Linux'],
        ['ai', 'MCP Claude-Code Cursor RAG OCR'],
      ].forEach(([k, v]) => print(`  <span class="t-red">${k.padEnd(10, ' ')}</span>${v}`));
    },
    open: (args) => {
      const s = SECTIONS[(args[0] || '').toLowerCase()];
      if (!s) return print(`open: unknown section. try: ${Object.keys(SECTIONS).join(', ')}`, 't-err');
      print(`→ jumping to ${esc(args[0])}…`, 't-dim');
      setTimeout(() => { close(); scrollTo?.(s); }, 350);
    },
    cd: (a) => COMMANDS.open(a),
    github: () => { print('opening github.com/Rudrasamadhiya…', 't-dim'); window.open('https://github.com/Rudrasamadhiya', '_blank', 'noopener'); },
    linkedin: () => { print('opening linkedin…', 't-dim'); window.open('https://linkedin.com/in/rudra-samadhiya', '_blank', 'noopener'); },
    email: async () => {
      const mail = 'Samadhiyarudra123@gmail.com';
      try { await navigator.clipboard.writeText(mail); print(`copied <b>${mail}</b> to clipboard ✓`); }
      catch { print(`mail me: ${link('mailto:' + mail, mail)}`); }
    },
    npx: async (args) => {
      if (args[0] !== 'android-agent-bridge') return print(`npx: try <b>npx android-agent-bridge</b>`, 't-err');
      const steps = [
        ['<span class="t-dim">Need to install the following packages: android-agent-bridge@0.1.3</span>', 300],
        ['◇ looking for a phone over USB…', 500],
        ['◇ installing Agent Bridge app (adb)… <span class="t-ok">done</span>', 600],
        ['◇ enabling accessibility service… <span class="t-ok">done</span>', 400],
        ['◇ pairing… <span class="t-ok">paired with Pixel 7 · Android 14</span>', 500],
        ['<span class="t-ok">✓</span> bridge running on <b>localhost:8350</b> — 27 MCP tools ready', 300],
        ['<span class="t-dim">next: claude mcp add phone -- npx -y android-agent-bridge</span>', 0],
      ];
      for (const [l, ms] of steps) { print(l); await sleep(ms); }
    },
    sudo: async (args) => {
      if (args.join(' ') !== 'hire rudra') return print('sudo: permission denied. (did you mean <b>sudo hire rudra</b>?)', 't-err');
      print('[sudo] password for recruiter: ********');
      await sleep(500);
      print('<span class="t-ok">✓ access granted.</span> drafting an email…');
      onSudoHire?.();
      await sleep(700);
      window.location.href = 'mailto:Samadhiyarudra123@gmail.com?subject=Let%27s%20work%20together';
    },
    clear: () => { out.innerHTML = ''; },
    exit: () => close(),
    echo: (a) => print(esc(a.join(' '))),
    date: () => print(new Date().toString()),
    pwd: () => print('/home/rudra/portfolio'),
    rm: () => print('rm: nice try.', 't-err'),
  };

  async function run(raw) {
    const line = raw.trim();
    print(`<span class="term__ps">rudra@portfolio:~$</span> ${esc(line)}`);
    if (!line) return;
    history.push(line); hIdx = history.length;
    const [cmd, ...args] = line.split(/\s+/);
    const fn = COMMANDS[cmd.toLowerCase()];
    if (!fn) return print(`rudra-sh: command not found: ${esc(cmd)} — type <b>help</b>`, 't-err');
    input.disabled = true;
    try { await fn(args); } finally { input.disabled = false; input.focus(); }
  }

  function boot() {
    booted = true;
    print('<span class="t-dim">rudra-sh 1.0 — last login: ' + new Date().toDateString() + ' on ttys001</span>');
    print('welcome. type <b>help</b> to see what this can do, or tap a command below.');
  }

  function open() {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    if (!booted) boot();
    setTimeout(() => input.focus(), 60);
  }
  function close() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    input.blur();
  }

  ['help', 'neofetch', 'ls', 'cat prepsharp', 'npx android-agent-bridge', 'sudo hire rudra'].forEach((c) => {
    const b = document.createElement('button'); b.textContent = c; b.type = 'button';
    b.addEventListener('click', () => run(c));
    chips.appendChild(b);
  });
  out.addEventListener('click', (e) => { const t = e.target.closest('[data-run]'); if (t) run(t.dataset.run); });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { const v = input.value; input.value = ''; run(v); }
    else if (e.key === 'ArrowUp') { if (hIdx > 0) input.value = history[--hIdx]; e.preventDefault(); }
    else if (e.key === 'ArrowDown') { hIdx = Math.min(history.length, hIdx + 1); input.value = history[hIdx] || ''; e.preventDefault(); }
    else if (e.key === 'Tab') {
      e.preventDefault();
      const v = input.value.trim().toLowerCase();
      const pool = [...Object.keys(COMMANDS), ...Object.keys(PROJECTS).map((k) => 'cat ' + k), ...Object.keys(SECTIONS).map((k) => 'open ' + k), 'npx android-agent-bridge', 'sudo hire rudra'];
      const hit = pool.filter((c) => c.startsWith(v));
      if (hit.length === 1) input.value = hit[0];
      else if (hit.length > 1) print(hit.join('   '), 't-dim');
    } else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); out.innerHTML = ''; }
  });

  addEventListener('keydown', (e) => {
    const typing = /input|textarea/i.test(document.activeElement?.tagName || '') && document.activeElement !== input;
    if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '`' && !typing)) {
      e.preventDefault();
      overlay.classList.contains('is-open') ? close() : open();
    } else if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
  });
  overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) close(); });
  document.getElementById('termClose').addEventListener('click', close);
  document.querySelectorAll('#termOpen, [data-term]').forEach((b) => b.addEventListener('click', open));

  return { open, close, run };
}
