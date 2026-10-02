// Shared scripts for protikmukherjee.com
// ----------------------------------------

// =============== Theme toggle ===============
(() => {
  const KEY = 'pm-theme';
  // Wire click handler (init script in <head> sets initial theme to avoid flash)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-theme-toggle]');
    if (!btn) return;
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(KEY, next);
  });
})();

// Mouse-follow ambient glow
(() => {
  const glow = document.querySelector('.glow');
  if (!glow) return;
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    glow.style.setProperty('--mx', x + '%');
    glow.style.setProperty('--my', y + '%');
  });
})();

// Project card hover spotlight
document.querySelectorAll('.pcard').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--cx', ((e.clientX - rect.left) / rect.width * 100) + '%');
    card.style.setProperty('--cy', ((e.clientY - rect.top) / rect.height * 100) + '%');
  });
});

// Live clock (contact page)
(() => {
  const el = document.getElementById('liveclock');
  if (!el) return;
  function tick() {
    const now = new Date();
    // Format Toronto time (America/Toronto)
    const fmt = new Intl.DateTimeFormat('en-CA', {
      hour: '2-digit', minute: '2-digit', hour12: false,
      timeZone: 'America/Toronto'
    });
    el.textContent = fmt.format(now);
  }
  tick();
  setInterval(tick, 30 * 1000);
})();

// Mobile menu toggle
(() => {
  const btn = document.querySelector('.menu-toggle button');
  const links = document.querySelector('.nav-links');
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    links.classList.toggle('open');
  });
})();

// =============== Federated / edge network animation ===============
(() => {
  const wrap = document.getElementById('fedviz');
  if (!wrap) return;

  const NS = 'http://www.w3.org/2000/svg';

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 400 400');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.classList.add('viz-svg');

  // defs
  const defs = document.createElementNS(NS, 'defs');
  defs.innerHTML = `
    <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" class="viz-glow-stop-in"/>
      <stop offset="60%" class="viz-glow-stop-mid"/>
      <stop offset="100%" class="viz-glow-stop-out"/>
    </radialGradient>`;
  svg.appendChild(defs);

  // orbit rings
  [80, 130, 180].forEach((r, i) => {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', 200); c.setAttribute('cy', 200); c.setAttribute('r', r);
    c.classList.add('viz-ring');
    if (i < 2) c.setAttribute('stroke-dasharray', '2 4');
    svg.appendChild(c);
  });

  // center glow
  const glowC = document.createElementNS(NS, 'circle');
  glowC.setAttribute('cx', 200); glowC.setAttribute('cy', 200); glowC.setAttribute('r', 60);
  glowC.setAttribute('fill', 'url(#centerGlow)');
  svg.appendChild(glowC);

  // edges + nodes
  const edgesG   = document.createElementNS(NS, 'g');
  const packetsG = document.createElementNS(NS, 'g');
  const nodesG   = document.createElementNS(NS, 'g');
  svg.appendChild(edgesG); svg.appendChild(packetsG); svg.appendChild(nodesG);

  const NODE_COUNT = 8;
  const R = 155;
  const nodes = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const angle = (i / NODE_COUNT) * Math.PI * 2 - Math.PI / 2;
    const x = 200 + Math.cos(angle) * R;
    const y = 200 + Math.sin(angle) * R;
    nodes.push({ x, y });

    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', 200); line.setAttribute('y1', 200);
    line.setAttribute('x2', x);   line.setAttribute('y2', y);
    line.classList.add('viz-edge');
    edgesG.appendChild(line);

    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 7);
    c.classList.add('viz-node');
    nodesG.appendChild(c);
    nodes[i].circle = c;
  }

  // hub
  const hub = document.createElementNS(NS, 'rect');
  hub.setAttribute('x', 184); hub.setAttribute('y', 184);
  hub.setAttribute('width', 32); hub.setAttribute('height', 32); hub.setAttribute('rx', 4);
  hub.classList.add('viz-hub');
  svg.appendChild(hub);
  const hubT = document.createElementNS(NS, 'text');
  hubT.setAttribute('x', 200); hubT.setAttribute('y', 206); hubT.setAttribute('text-anchor', 'middle');
  hubT.setAttribute('font-family', 'JetBrains Mono'); hubT.setAttribute('font-size', '9');
  hubT.classList.add('viz-hub-text');
  hubT.textContent = 'HUB';
  svg.appendChild(hubT);

  // corner brackets
  const cb = document.createElementNS(NS, 'g');
  cb.classList.add('viz-brackets');
  cb.innerHTML = `
    <path d="M 8 30 L 8 8 L 30 8"/>
    <path d="M 370 8 L 392 8 L 392 30"/>
    <path d="M 8 370 L 8 392 L 30 392"/>
    <path d="M 370 392 L 392 392 L 392 370"/>`;
  svg.appendChild(cb);

  // labels
  const mklabel = (x, y, text, klass, anchor='start') => {
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', x); t.setAttribute('y', y); t.setAttribute('text-anchor', anchor);
    t.setAttribute('font-family', 'JetBrains Mono'); t.setAttribute('font-size', '8');
    t.classList.add(klass); t.textContent = text;
    svg.appendChild(t);
  };
  mklabel(12, 22, 'EDGE.MESH', 'viz-label');
  mklabel(388, 22, 'v0.4.2', 'viz-label', 'end');
  mklabel(12, 388, 'NODES: 08', 'viz-label');
  mklabel(388, 388, 'SYNC OK', 'viz-label-accent', 'end');

  wrap.appendChild(svg);

  // packet animation
  function emitPacket(toCenter, nodeIdx) {
    const n = nodes[nodeIdx];
    const start = toCenter ? n : { x: 200, y: 200 };
    const end   = toCenter ? { x: 200, y: 200 } : n;
    const p = document.createElementNS(NS, 'circle');
    p.setAttribute('r', 2.6);
    p.setAttribute('cx', start.x); p.setAttribute('cy', start.y);
    p.classList.add('viz-packet');
    packetsG.appendChild(p);

    const duration = 700 + Math.random() * 400;
    const t0 = performance.now();
    function step(now) {
      const t = Math.min(1, (now - t0) / duration);
      p.setAttribute('cx', start.x + (end.x - start.x) * t);
      p.setAttribute('cy', start.y + (end.y - start.y) * t);
      p.setAttribute('opacity', 1 - t * 0.7);
      if (t < 1) requestAnimationFrame(step);
      else {
        if (!toCenter) {
          n.circle.classList.add('hot');
          setTimeout(() => n.circle.classList.remove('hot'), 220);
        }
        p.remove();
      }
    }
    requestAnimationFrame(step);
  }

  let tick = 0;
  setInterval(() => {
    tick++;
    if (tick % 2 === 0) {
      const idx = Math.floor(Math.random() * NODE_COUNT);
      emitPacket(true, idx);
      nodes[idx].circle.classList.add('warm');
      setTimeout(() => nodes[idx].circle.classList.remove('warm'), 200);
    }
    if (tick % 6 === 0) {
      for (let i = 0; i < NODE_COUNT; i++) {
        setTimeout(() => emitPacket(false, i), i * 60);
      }
    }
  }, 350);
})();
