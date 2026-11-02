// Real activity, fetched client-side from public APIs (no keys). Falls back quietly if rate-limited.
const USER = 'Rudrasamadhiya';
const PACKAGES = ['android-agent-bridge', 'expo-mcp-bridge', 'expo-launch-video'];

const ago = (iso) => {
  const s = (Date.now() - new Date(iso)) / 1000;
  if (s < 3600) return `${Math.max(1, (s / 60) | 0)}m ago`;
  if (s < 86400) return `${(s / 3600) | 0}h ago`;
  return `${(s / 86400) | 0}d ago`;
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

async function json(url) {
  const r = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error(r.status);
  return r.json();
}

export function initLive() {
  const section = document.getElementById('live');
  let started = false;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !started) { started = true; load(); }
  }, { rootMargin: '400px' }).observe(section);
}

async function load() {
  loadCommits();
  loadNpm();
}

async function loadCommits() {
  const list = document.getElementById('gitlog');
  const bars = document.getElementById('activity');
  const meta = document.getElementById('activityMeta');
  try {
    const events = await json(`https://api.github.com/users/${USER}/events/public?per_page=100`);
    const pushes = events.filter((e) => e.type === 'PushEvent');
    const commits = pushes.flatMap((e) => (e.payload.commits || []).map((c) => ({
      sha: c.sha.slice(0, 7), msg: c.message.split('\n')[0], repo: e.repo.name.split('/')[1], at: e.created_at,
    })));
    let rows = commits;
    if (!rows.length) {
      // the events feed often omits commit messages, so read them from the most recently pushed repos
      const repos = [...new Set(pushes.map((e) => e.repo.name))].slice(0, 3);
      const lists = await Promise.all(repos.map((r) =>
        json(`https://api.github.com/repos/${r}/commits?per_page=5`).then((cs) => cs.map((c) => ({
          sha: c.sha.slice(0, 7), msg: c.commit.message.split('\n')[0], repo: r.split('/')[1], at: c.commit.author?.date || c.commit.committer?.date,
        }))).catch(() => [])));
      rows = lists.flat().sort((x, y) => new Date(y.at) - new Date(x.at));
    }
    if (!rows.length) rows = pushes.map((e) => ({ sha: (e.payload.head || '').slice(0, 7), msg: `push to ${e.payload.ref?.replace('refs/heads/', '') || 'main'}`, repo: e.repo.name.split('/')[1], at: e.created_at }));
    rows = rows.slice(0, 9);
    if (!rows.length) throw new Error('empty');
    list.innerHTML = rows.map((c, i) => `
      <li style="--i:${i}">
        <span class="g-sha">${esc(c.sha)}</span>
        <span class="g-msg">${esc(c.msg).slice(0, 90)}</span>
        <a class="g-repo" href="https://github.com/${USER}/${esc(c.repo)}" target="_blank" rel="noopener">${esc(c.repo)}</a>
        <span class="g-ago">${ago(c.at)}</span>
      </li>`).join('');

    // activity per day, last 30 days, from all public events
    const days = Array.from({ length: 30 }, () => 0);
    events.forEach((e) => {
      const d = Math.floor((Date.now() - new Date(e.created_at)) / 86400000);
      if (d < 30) days[29 - d] += e.type === 'PushEvent' ? Math.max(1, e.payload.size || e.payload.commits?.length || 1) : 1;
    });
    const max = Math.max(...days, 1);
    bars.innerHTML = days.map((n, i) => `<i style="--h:${(n / max) * 100}%;--d:${i * 18}ms" title="${n} events"></i>`).join('');
    const total = days.reduce((a, b) => a + b, 0);
    const active = days.filter(Boolean).length;
    meta.innerHTML = `<b>${total}</b> events · active <b>${active}</b>/30 days · latest ${ago(events[0].created_at)}`;
  } catch {
    list.innerHTML = `<li class="muted">GitHub's public API is rate-limited right now. See everything at <a href="https://github.com/${USER}" target="_blank" rel="noopener">github.com/${USER}</a></li>`;
    bars.innerHTML = Array.from({ length: 30 }, (_, i) => `<i style="--h:${12 + ((i * 37) % 70)}%;opacity:.25"></i>`).join('');
    meta.textContent = 'offline preview';
  }
}

async function loadNpm() {
  const box = document.getElementById('npmRows');
  try {
    const data = await json(`https://api.npmjs.org/downloads/point/last-month/${PACKAGES.join(',')}`);
    const rows = PACKAGES.map((p) => ({ p, n: data[p]?.downloads ?? 0 }));
    const max = Math.max(...rows.map((r) => r.n), 1);
    box.innerHTML = rows.map(({ p, n }) => `
      <a class="npm__row" href="https://www.npmjs.com/package/${p}" target="_blank" rel="noopener">
        <span class="npm__name">${p}</span>
        <span class="npm__bar"><i style="--w:${Math.max(4, (n / max) * 100)}%"></i></span>
        <b class="npm__n" data-n="${n}">0</b>
      </a>`).join('');
    box.querySelectorAll('.npm__n').forEach((el) => {
      const to = +el.dataset.n, t0 = performance.now();
      const step = (t) => { const k = Math.min((t - t0) / 1400, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))).toLocaleString(); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  } catch {
    box.innerHTML = PACKAGES.map((p) => `<a class="npm__row" href="https://www.npmjs.com/package/${p}" target="_blank" rel="noopener"><span class="npm__name">${p}</span><span class="npm__bar"><i style="--w:30%"></i></span><b class="npm__n">npm ↗</b></a>`).join('');
  }
}
