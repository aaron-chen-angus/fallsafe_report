/* FallSafe+ Report Generator — dependency-free canvas charts (screen TRON theme + print theme) */
(function (root) {
  'use strict';
  const FS = (root.FS = root.FS || {});

  const THEMES = {
    dark: {
      text: '#d8ecff', sub: '#7f9cbf', grid: 'rgba(0,229,255,0.16)', axis: 'rgba(0,229,255,0.35)',
      cyan: '#18f0ff', orange: '#ff9a1f', blue: '#2f7bff', fillA: 'rgba(24,240,255,0.18)', fillB: 'rgba(255,154,31,0.16)',
      band: { strength: '#18f0ff', monitor: '#8fb4ff', moderate: '#ff9a1f', priority: '#ff4d6d', na: '#4a5a72' },
      track: 'rgba(255,255,255,0.07)', glow: 12
    },
    light: {
      text: '#14213d', sub: '#5b6b85', grid: '#dbe3ef', axis: '#9fb0c8',
      cyan: '#0a8fbf', orange: '#e2720b', blue: '#1f5fd1', fillA: 'rgba(10,143,191,0.16)', fillB: 'rgba(226,114,11,0.14)',
      band: { strength: '#0a8fbf', monitor: '#5578d8', moderate: '#e2720b', priority: '#d4344f', na: '#a4b0c2' },
      track: '#eef2f8', glow: 0
    }
  };
  FS.THEMES = THEMES;
  const FONT_NUM = "Orbitron, 'Noto Sans SC', 'Noto Sans Tamil', sans-serif";
  const FONT_TXT = "Inter, 'Noto Sans SC', 'Noto Sans Tamil', 'Noto Sans', sans-serif";

  function setup(cv, w, h, scale) {
    const s = scale || Math.max(2, root.devicePixelRatio || 1);
    cv.width = Math.round(w * s); cv.height = Math.round(h * s);
    cv.style.width = '100%'; cv.style.maxWidth = w + 'px'; cv.style.aspectRatio = w + ' / ' + h; cv.style.height = 'auto';
    const ctx = cv.getContext('2d'); ctx.setTransform(s, 0, 0, s, 0, 0); ctx.clearRect(0, 0, w, h);
    return ctx;
  }
  const glow = (ctx, th, color) => { if (th.glow) { ctx.shadowColor = color; ctx.shadowBlur = th.glow; } };
  const noGlow = ctx => { ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; };
  function wrap(ctx, text, maxW) {
    const words = /[　-鿿]/.test(text) ? text.split('') : text.split(' ');
    const sep = /[　-鿿]/.test(text) ? '' : ' ';
    const lines = []; let cur = '';
    for (const w of words) { const t = cur ? cur + sep + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
    if (cur) lines.push(cur); return lines;
  }

  /* Radar: 4 domains */
  function radar(cv, o) {
    const W = o.w || 420, H = o.h || 380, th = THEMES[o.theme || 'dark'];
    const ctx = setup(cv, W, H, o.scale);
    const cx = W / 2, cy = (H - 30) / 2 + 8, R = Math.min(W, H - 30) / 2 - 58, n = o.labels.length;
    const ang = i => -Math.PI / 2 + i * 2 * Math.PI / n;
    const pt = (i, v) => [cx + Math.cos(ang(i)) * R * v / 100, cy + Math.sin(ang(i)) * R * v / 100];
    // rings
    ctx.lineWidth = 1;
    [20, 40, 60, 80, 100].forEach(v => {
      ctx.beginPath(); for (let i = 0; i < n; i++) { const [x, y] = pt(i, v); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath();
      ctx.strokeStyle = th.grid; ctx.stroke();
    });
    for (let i = 0; i < n; i++) { const [x, y] = pt(i, 100); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.strokeStyle = th.grid; ctx.stroke(); }
    // reference rings
    const ring = (v, col, dash) => { ctx.beginPath(); for (let i = 0; i < n; i++) { const [x, y] = pt(i, v); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); ctx.setLineDash(dash); ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.stroke(); ctx.setLineDash([]); };
    ring(50, th.sub, [4, 4]); ring(65, th.orange, [2, 3]);
    // data
    const vals = o.values.map(v => v === null ? 0 : v);
    ctx.beginPath(); vals.forEach((v, i) => { const [x, y] = pt(i, v); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath();
    ctx.fillStyle = th.fillA; ctx.fill(); glow(ctx, th, th.cyan); ctx.strokeStyle = th.cyan; ctx.lineWidth = 2.4; ctx.stroke(); noGlow(ctx);
    vals.forEach((v, i) => {
      const [x, y] = pt(i, v); const col = th.band[o.bands[i]] || th.cyan;
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); glow(ctx, th, col); ctx.fillStyle = col; ctx.fill(); noGlow(ctx);
    });
    // labels
    ctx.textAlign = 'center';
    o.labels.forEach((lab, i) => {
      const [x, y] = pt(i, i % 2 ? 112 : 128);
      ctx.font = `600 12px ${FONT_TXT}`; ctx.fillStyle = th.text;
      const ls = wrap(ctx, lab, 120);
      const yy = y - (ls.length - 1) * 7 - (i === 0 ? 8 : 0) + (i === 2 ? 4 : 0);
      ls.forEach((l, k) => ctx.fillText(l, x, yy + k * 14));
      ctx.font = `700 13px ${FONT_NUM}`; ctx.fillStyle = th.band[o.bands[i]] || th.cyan;
      ctx.fillText(o.values[i] === null ? '—' : o.values[i].toFixed(1), x, yy + ls.length * 14 + 2);
    });
    // legend
    ctx.textAlign = 'left'; ctx.font = `500 10px ${FONT_TXT}`;
    const ly = H - 6; ctx.setLineDash([4, 4]); ctx.strokeStyle = th.sub; ctx.beginPath(); ctx.moveTo(12, ly - 3); ctx.lineTo(32, ly - 3); ctx.stroke();
    ctx.setLineDash([2, 3]); ctx.strokeStyle = th.orange; ctx.beginPath(); ctx.moveTo(W / 2 + 8, ly - 3); ctx.lineTo(W / 2 + 28, ly - 3); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = th.sub; ctx.fillText(o.peerLabel, 38, ly); ctx.fillText(o.targetLabel, W / 2 + 34, ly);
  }

  /* Horizontal score bars (0–100) with 50 / 65 reference lines */
  function hbars(cv, o) {
    const th = THEMES[o.theme || 'dark']; const rowH = 30, top = 14, W = o.w || 520, lab = o.labelW || 190;
    const H = top + o.items.length * rowH + 22; const ctx = setup(cv, W, H, o.scale);
    const x0 = lab, x1 = W - 48, X = v => x0 + (x1 - x0) * v / 100;
    // reference lines
    [[50, th.sub, [4, 4]], [65, th.orange, [2, 3]]].forEach(([v, c, d]) => { ctx.setLineDash(d); ctx.strokeStyle = c; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(v), top - 6); ctx.lineTo(X(v), H - 18); ctx.stroke(); });
    ctx.setLineDash([]);
    ctx.font = `500 9px ${FONT_NUM}`; ctx.fillStyle = th.sub; ctx.textAlign = 'center';
    [0, 25, 50, 75, 100].forEach(v => ctx.fillText(v, X(v), H - 5));
    o.items.forEach((it, i) => {
      const y = top + i * rowH; const col = th.band[it.band] || th.cyan;
      ctx.textAlign = 'right'; ctx.font = `600 11.5px ${FONT_TXT}`; ctx.fillStyle = it.value === null ? th.sub : th.text;
      ctx.fillText(it.label, lab - 10, y + 15);
      ctx.fillStyle = th.track; roundRect(ctx, x0, y + 5, x1 - x0, 14, 7); ctx.fill();
      if (it.value !== null) {
        const grd = ctx.createLinearGradient(x0, 0, X(it.value), 0); grd.addColorStop(0, th.blue); grd.addColorStop(1, col);
        glow(ctx, th, col); ctx.fillStyle = grd; roundRect(ctx, x0, y + 5, Math.max(8, X(it.value) - x0), 14, 7); ctx.fill(); noGlow(ctx);
        ctx.textAlign = 'left'; ctx.font = `700 11px ${FONT_NUM}`; ctx.fillStyle = col; ctx.fillText(it.value.toFixed(1), x1 + 8, y + 16);
      } else { ctx.textAlign = 'left'; ctx.font = `600 11px ${FONT_NUM}`; ctx.fillStyle = th.sub; ctx.fillText('—', x1 + 8, y + 16); }
    });
  }

  /* Bullet / reference-band chart for a single clinical metric */
  function bullet(cv, o) {
    const th = THEMES[o.theme || 'dark']; const W = o.w || 340, H = 64; const ctx = setup(cv, W, H, o.scale);
    const x0 = 10, x1 = W - 10, X = v => x0 + (x1 - x0) * (Math.max(o.min, Math.min(o.max, v)) - o.min) / (o.max - o.min);
    o.bands.forEach(([a, b, key]) => { ctx.fillStyle = hexA(th.band[key] || key, o.theme === 'light' ? 0.28 : 0.30); ctx.fillRect(X(a), 22, X(b) - X(a), 14); });
    ctx.strokeStyle = th.axis; ctx.lineWidth = 1; ctx.strokeRect(x0 + 0.5, 22.5, x1 - x0 - 1, 13);
    ctx.font = `500 9px ${FONT_NUM}`; ctx.fillStyle = th.sub; ctx.textAlign = 'center';
    (o.ticks || []).forEach(v => { ctx.fillText(v, X(v), 50); ctx.beginPath(); ctx.moveTo(X(v), 36); ctx.lineTo(X(v), 40); ctx.strokeStyle = th.axis; ctx.stroke(); });
    if (o.value !== null && o.value !== undefined) {
      const x = X(o.value); glow(ctx, th, th.text);
      ctx.fillStyle = o.theme === 'light' ? '#14213d' : '#ffffff'; ctx.fillRect(x - 2, 16, 4, 26); noGlow(ctx);
      ctx.beginPath(); ctx.moveTo(x - 6, 10); ctx.lineTo(x + 6, 10); ctx.lineTo(x, 17); ctx.closePath(); ctx.fillStyle = th.orange; ctx.fill();
      ctx.font = `700 11px ${FONT_NUM}`; ctx.fillStyle = th.orange;
      ctx.textAlign = x > W - 60 ? 'right' : x < 60 ? 'left' : 'center'; ctx.fillText(o.label, x + (ctx.textAlign === 'right' ? 8 : ctx.textAlign === 'left' ? -8 : 0), 7);
    }
    if (o.unit) { ctx.textAlign = 'right'; ctx.font = `500 9px ${FONT_TXT}`; ctx.fillStyle = th.sub; ctx.fillText(o.unit, x1, 62); }
  }

  /* Butterfly chart: left vs right limb */
  function symmetry(cv, o) {
    const th = THEMES[o.theme || 'dark']; const W = o.w || 520, rowH = 34, top = 28; const H = top + o.rows.length * rowH + 8;
    const ctx = setup(cv, W, H, o.scale); const labW = 130, pctW = 64; const cx = labW + (W - pctW - labW) / 2, half = (W - pctW - labW) / 2 - 62;
    ctx.font = `700 10px ${FONT_NUM}`; ctx.textAlign = 'center'; ctx.fillStyle = th.cyan; ctx.fillText(o.leftLabel.toUpperCase(), cx - half / 2, 14);
    ctx.fillStyle = th.orange; ctx.fillText(o.rightLabel.toUpperCase(), cx + half / 2, 14);
    o.rows.forEach((r, i) => {
      const y = top + i * rowH; const m = Math.max(r.L, r.R) || 1;
      const wl = half * r.L / m, wr = half * r.R / m;
      glow(ctx, th, th.cyan); ctx.fillStyle = th.cyan; roundRect(ctx, cx - 4 - wl, y + 6, wl, 13, 4); ctx.fill();
      glow(ctx, th, th.orange); ctx.fillStyle = th.orange; roundRect(ctx, cx + 4, y + 6, wr, 13, 4); ctx.fill(); noGlow(ctx);
      ctx.font = `600 10px ${FONT_NUM}`; ctx.fillStyle = th.text;
      ctx.textAlign = 'right'; ctx.fillText(fmt(r.L) + ' ' + r.unit, cx - 10 - wl, y + 17);
      ctx.textAlign = 'left'; ctx.fillText(fmt(r.R) + ' ' + r.unit, cx + 10 + wr, y + 17);
      ctx.font = `500 9.5px ${FONT_TXT}`; ctx.fillStyle = th.sub; ctx.textAlign = 'left';
      ctx.fillText(r.label, 4, y + 17);
      const a = Math.abs(r.L - r.R) / m * 100; ctx.textAlign = 'right';
      ctx.fillStyle = a > (r.flag || 10) ? th.band.priority : th.band.strength; ctx.font = `700 10px ${FONT_NUM}`;
      ctx.fillText(a.toFixed(1) + '%' + (r.lowconf ? '*' : ''), W - 4, y + 17);
    });
    ctx.strokeStyle = th.axis; ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx, H - 6); ctx.stroke();
  }

  /* Weekly load (sets bars + mean level line) */
  function load(cv, o) {
    const th = THEMES[o.theme || 'dark']; const W = o.w || 460, H = 210; const ctx = setup(cv, W, H, o.scale);
    const x0 = 40, x1 = W - 40, y0 = H - 44, y1 = 22; const n = o.data.length; const bw = (x1 - x0) / n;
    const maxS = Math.max(...o.data.map(d => d.sets)) * 1.2;
    ctx.strokeStyle = th.grid; ctx.lineWidth = 1;
    for (let k = 0; k <= 4; k++) { const y = y0 - (y0 - y1) * k / 4; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); }
    o.data.forEach((d, i) => {
      const x = x0 + i * bw + bw * 0.22, w = bw * 0.56, h = (y0 - y1) * d.sets / maxS;
      const grd = ctx.createLinearGradient(0, y0 - h, 0, y0); grd.addColorStop(0, th.cyan); grd.addColorStop(1, th.blue);
      glow(ctx, th, th.cyan); ctx.fillStyle = grd; roundRect(ctx, x, y0 - h, w, h, 4); ctx.fill(); noGlow(ctx);
      ctx.font = `700 11px ${FONT_NUM}`; ctx.fillStyle = th.text; ctx.textAlign = 'center'; ctx.fillText(d.sets, x + w / 2, y0 - h - 6);
      ctx.font = `600 10px ${FONT_TXT}`; ctx.fillStyle = th.sub; ctx.fillText(o.weekLabel(i + 1), x + w / 2, y0 + 15);
      ctx.font = `500 9px ${FONT_TXT}`; wrap(ctx, o.phase[i], bw * 0.92).slice(0, 2).forEach((ln, k) => ctx.fillText(ln, x + w / 2, y0 + 27 + k * 10));
    });
    // level line (right axis 0-3)
    const Y = v => y0 - (y0 - y1) * v / 3.4;
    ctx.beginPath(); o.data.forEach((d, i) => { const x = x0 + i * bw + bw / 2; i ? ctx.lineTo(x, Y(d.level)) : ctx.moveTo(x, Y(d.level)); });
    glow(ctx, th, th.orange); ctx.strokeStyle = th.orange; ctx.lineWidth = 2.5; ctx.stroke();
    o.data.forEach((d, i) => { const x = x0 + i * bw + bw / 2; ctx.beginPath(); ctx.arc(x, Y(d.level), 4.5, 0, 7); ctx.fillStyle = th.orange; ctx.fill(); });
    noGlow(ctx);
    ctx.font = `600 9px ${FONT_NUM}`; ctx.textAlign = 'left'; ctx.fillStyle = th.cyan; ctx.fillText(o.setsLabel, 6, 12);
    ctx.textAlign = 'right'; ctx.fillStyle = th.orange; ctx.fillText(o.levelLabel, W - 4, 12);
    [1, 2, 3].forEach(v => { ctx.fillStyle = th.orange; ctx.font = `600 9px ${FONT_NUM}`; ctx.fillText('L' + v, x1 + 6, Y(v) + 3); });
  }

  /* Domain gauge ring */
  function ring(cv, o) {
    const th = THEMES[o.theme || 'dark']; const S = o.size || 120; const ctx = setup(cv, S, S, o.scale);
    const c = S / 2, r = S / 2 - 10, col = th.band[o.band] || th.cyan;
    ctx.lineWidth = 9; ctx.strokeStyle = th.track; ctx.beginPath(); ctx.arc(c, c, r, 0.75 * Math.PI, 2.25 * Math.PI); ctx.stroke();
    if (o.value !== null) {
      ctx.lineCap = 'round'; glow(ctx, th, col); ctx.strokeStyle = col;
      ctx.beginPath(); ctx.arc(c, c, r, 0.75 * Math.PI, 0.75 * Math.PI + 1.5 * Math.PI * o.value / 100); ctx.stroke(); noGlow(ctx);
      // 50 tick
      const a = 0.75 * Math.PI + 1.5 * Math.PI * 0.5; ctx.lineWidth = 2; ctx.strokeStyle = th.sub; ctx.lineCap = 'butt';
      ctx.beginPath(); ctx.moveTo(c + Math.cos(a) * (r - 8), c + Math.sin(a) * (r - 8)); ctx.lineTo(c + Math.cos(a) * (r + 8), c + Math.sin(a) * (r + 8)); ctx.stroke();
    }
    ctx.textAlign = 'center'; ctx.font = `800 ${Math.round(S * 0.22)}px ${FONT_NUM}`; ctx.fillStyle = col;
    ctx.fillText(o.value === null ? '—' : Math.round(o.value), c, c + S * 0.07);
    ctx.font = `600 ${Math.round(S * 0.075)}px ${FONT_NUM}`; ctx.fillStyle = th.sub; ctx.fillText('/100', c, c + S * 0.2);
  }

  function roundRect(ctx, x, y, w, h, r) { r = Math.min(r, h / 2, Math.abs(w) / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function hexA(hex, a) { if (!/^#/.test(hex)) return hex; const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }
  const fmt = v => (Math.abs(v) >= 100 ? v.toFixed(0) : Math.abs(v) >= 10 ? v.toFixed(1) : v.toFixed(2));


  /* ---------- v1.1 charts: EMG waveform, activation map, station×domain heatmap, TUG phases, bars, range ---------- */
  const CHCOL = {
    dark:  { LQ: '#18f0ff', RQ: '#ff9a1f', LC: '#2f7bff', RC: '#ffd23f' },
    light: { LQ: '#0a8fbf', RQ: '#e2720b', LC: '#1f5fd1', RC: '#b88a00' }
  };
  const niceMax = v => { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))); const m = v / p; return ([1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find(x => m <= x + 1e-9) || 10) * p; };

  /* 4-channel EMG envelope over time */
  function emgWave(cv, o) {
    const th = THEMES[o.theme || 'dark'], cc = CHCOL[o.theme || 'dark']; const W = o.w || 720, H = o.h || 260;
    const ctx = setup(cv, W, H, o.scale); const x0 = 52, x1 = W - 14, y1 = 34, y0 = H - 34;
    const keys = ['LQ', 'RQ', 'LC', 'RC'].filter(k => o.series[k]);
    const peak = Math.max(...keys.map(k => Math.max(...o.series[k]))); const ymax = niceMax(peak * 1.05);
    const X = (i, n) => x0 + (x1 - x0) * i / (n - 1), Y = v => y0 - (y0 - y1) * v / ymax;
    // grid + y ticks
    ctx.font = `500 9px ${FONT_NUM}`; ctx.textAlign = 'right'; ctx.lineWidth = 1;
    for (let k = 0; k <= 4; k++) { const v = ymax * k / 4, y = Y(v); ctx.strokeStyle = th.grid; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.fillStyle = th.sub; ctx.fillText(Math.round(v), x0 - 6, y + 3); }
    ctx.save(); ctx.translate(11, (y0 + y1) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillStyle = th.sub; ctx.font = `600 9px ${FONT_TXT}`; ctx.fillText(o.unit || 'µV', 0, 0); ctx.restore();
    // x ticks
    ctx.textAlign = 'center'; ctx.font = `500 9px ${FONT_NUM}`; ctx.fillStyle = th.sub;
    for (let k = 0; k <= 5; k++) { const x = x0 + (x1 - x0) * k / 5; ctx.strokeStyle = th.grid; ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y0); ctx.stroke(); ctx.fillText((o.tMax * k / 5).toFixed(o.tMax >= 20 ? 0 : 1) + ' s', x, y0 + 14); }
    ctx.strokeStyle = th.axis; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
    // series (calves first so quads sit on top)
    const order = ['LC', 'RC', 'LQ', 'RQ'].filter(k => o.series[k]);
    order.forEach(k => {
      const a = o.series[k], n = a.length, col = cc[k], quad = k.endsWith('Q');
      if (quad) { ctx.beginPath(); a.forEach((v, i) => { i ? ctx.lineTo(X(i, n), Y(v)) : ctx.moveTo(X(i, n), Y(v)); }); ctx.lineTo(X(n - 1, n), y0); ctx.lineTo(X(0, n), y0); ctx.closePath(); ctx.fillStyle = hexA(col, o.theme === 'light' ? 0.10 : 0.12); ctx.fill(); }
      ctx.beginPath(); a.forEach((v, i) => { i ? ctx.lineTo(X(i, n), Y(v)) : ctx.moveTo(X(i, n), Y(v)); });
      ctx.setLineDash(quad ? [] : [5, 3]); ctx.lineWidth = quad ? 2 : 1.8; glow(ctx, th, col); ctx.strokeStyle = col; ctx.lineJoin = 'round'; ctx.stroke(); noGlow(ctx); ctx.setLineDash([]);
    });
    // legend
    ctx.textAlign = 'left'; ctx.font = `600 10.5px ${FONT_TXT}`;
    const cw = (x1 - x0) / keys.length;
    keys.forEach((k, i) => { const x = x0 + i * cw; ctx.strokeStyle = cc[k]; ctx.lineWidth = 2.4; ctx.setLineDash(k.endsWith('Q') ? [] : [5, 3]); ctx.beginPath(); ctx.moveTo(x, 14); ctx.lineTo(x + 22, 14); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = th.text; ctx.fillText(o.labels[k], x + 28, 18); });
  }

  /* Leg activation map: thighs = quadriceps, calves = gastrocnemius, colour intensity = share of the strongest channel */
  function legmap(cv, o) {
    const th = THEMES[o.theme || 'dark'], cc = CHCOL[o.theme || 'dark']; const W = o.w || 340, H = o.h || 300;
    const ctx = setup(cv, W, H, o.scale); const cx = W / 2, dx = 74;
    const leg = (x, side) => {
      const Q = o.ch[side + 'Q'], C = o.ch[side + 'C'];
      const fillFor = (c, col) => { ctx.fillStyle = th.track; ctx.fill(); if (c) { ctx.fillStyle = hexA(col, 0.14 + 0.78 * Math.min(1, c.rel)); glow(ctx, th, col); ctx.fill(); noGlow(ctx); } ctx.strokeStyle = th.axis; ctx.lineWidth = 1.3; ctx.stroke(); };
      // thigh
      roundRect(ctx, x - 33, 34, 66, 110, 18); fillFor(Q, cc[side + 'Q']);
      // knee
      ctx.beginPath(); ctx.arc(x, 152, 11, 0, Math.PI * 2); ctx.fillStyle = th.track; ctx.fill(); ctx.strokeStyle = th.axis; ctx.stroke();
      // calf (tapered)
      ctx.beginPath(); ctx.moveTo(x - 25, 166); ctx.quadraticCurveTo(x - 31, 200, x - 13, 262); ctx.lineTo(x + 13, 262); ctx.quadraticCurveTo(x + 31, 200, x + 25, 166); ctx.closePath(); fillFor(C, cc[side + 'C']);
      // foot
      ctx.beginPath(); ctx.ellipse(x + (side === 'L' ? -4 : 4), 276, 20, 7, 0, 0, Math.PI * 2); ctx.fillStyle = th.track; ctx.fill(); ctx.strokeStyle = th.axis; ctx.stroke();
      const txt = (c, y) => { if (!c) return; ctx.textAlign = 'center'; ctx.font = `800 14px ${FONT_NUM}`; ctx.fillStyle = th.text; ctx.fillText(c.share.toFixed(0) + '%', x, y); ctx.font = `500 9px ${FONT_NUM}`; ctx.fillStyle = th.sub; ctx.fillText(Math.round(c.mean) + ' µV', x, y + 13); };
      txt(Q, 92); txt(C, 214);
      ctx.font = `700 11px ${FONT_NUM}`; ctx.fillStyle = side === 'L' ? th.cyan : th.orange; ctx.textAlign = 'center'; ctx.fillText(side === 'L' ? o.leftLabel : o.rightLabel, x, 18);
    };
    leg(cx - dx, 'L'); leg(cx + dx, 'R');
    ctx.textAlign = 'center'; ctx.font = `600 10px ${FONT_TXT}`; ctx.fillStyle = th.sub;
    ctx.fillText(o.quadLabel, cx, 92); ctx.fillText(o.calfLabel, cx, 214);
  }

  /* Station × domain heatmap with domain totals */
  function heatmap(cv, o) {
    const th = THEMES[o.theme || 'dark']; const W = o.w || 720, labW = o.labelW || 210, rowH = 38, top = 46;
    const H = top + (o.rows.length + 1) * rowH + 8; const ctx = setup(cv, W, H, o.scale);
    const cw = (W - labW - 6) / o.cols.length;
    ctx.textAlign = 'center'; ctx.font = `700 11px ${FONT_TXT}`; ctx.fillStyle = th.text;
    o.cols.forEach((c, j) => { const ls = wrap(ctx, c, cw - 8); ls.slice(0, 2).forEach((l, k) => ctx.fillText(l, labW + j * cw + cw / 2, 18 + k * 13)); });
    const cell = (x, y, c, bold) => {
      const col = th.band[c && c.v !== null && c.v !== undefined ? FS.band(c.v) : 'na'];
      ctx.fillStyle = hexA(col, c && c.v !== null && c.v !== undefined ? (o.theme === 'light' ? 0.24 : 0.26) : 0.06); roundRect(ctx, x + 3, y + 3, cw - 6, rowH - 6, 7); ctx.fill();
      ctx.strokeStyle = hexA(col, bold ? 0.95 : 0.55); ctx.lineWidth = bold ? 1.8 : 1; roundRect(ctx, x + 3, y + 3, cw - 6, rowH - 6, 7); ctx.stroke();
      ctx.textAlign = 'center'; ctx.fillStyle = c && c.v !== null && c.v !== undefined ? col : th.sub; ctx.font = `800 ${bold ? 14 : 13}px ${FONT_NUM}`;
      ctx.fillText(c && c.v !== null && c.v !== undefined ? c.v.toFixed(0) : '—', x + cw / 2, y + rowH / 2 + 5);
      if (c && c.w) { ctx.font = `500 8px ${FONT_NUM}`; ctx.fillStyle = th.sub; ctx.textAlign = 'right'; ctx.fillText(c.w + '%', x + cw - 8, y + 14); }
    };
    o.rows.forEach((r, i) => { const y = top + i * rowH; ctx.textAlign = 'right'; ctx.font = `600 11.5px ${FONT_TXT}`; ctx.fillStyle = r.cells.some(c => c) ? th.text : th.sub; ctx.fillText(r.label, labW - 10, y + rowH / 2 + 4); r.cells.forEach((c, j) => cell(labW + j * cw, y, c, false)); });
    const y = top + o.rows.length * rowH + 2; ctx.strokeStyle = th.axis; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(8, y); ctx.lineTo(W - 6, y); ctx.stroke();
    ctx.textAlign = 'right'; ctx.font = `800 11.5px ${FONT_TXT}`; ctx.fillStyle = th.cyan; ctx.fillText(o.totalLabel, labW - 10, y + rowH / 2 + 6);
    o.total.forEach((v, j) => cell(labW + j * cw, y + 2, { v }, true));
  }

  /* Single stacked bar split into phases with a legend grid */
  function phases(cv, o) {
    const th = THEMES[o.theme || 'dark']; const W = o.w || 720; const tot = o.segs.reduce((s, x) => s + x.v, 0) || 1;
    const cols = [th.blue, th.cyan, th.orange, '#a56bff', o.theme === 'light' ? '#b88a00' : '#ffd23f'];
    const perRow = 3, rows = Math.ceil(o.segs.length / perRow), H = 70 + rows * 22; const ctx = setup(cv, W, H, o.scale);
    const x0 = 6, x1 = W - 6; let x = x0;
    ctx.textAlign = 'right'; ctx.font = `700 12px ${FONT_NUM}`; ctx.fillStyle = th.orange; ctx.fillText(o.totalLabel, x1, 14);
    o.segs.forEach((sg, i) => {
      const w = (x1 - x0) * sg.v / tot; const col = cols[i % cols.length];
      glow(ctx, th, col); ctx.fillStyle = col; ctx.fillRect(x, 24, Math.max(1, w - 2), 30); noGlow(ctx);
      if (w > 38) { ctx.textAlign = 'center'; ctx.font = `800 11px ${FONT_NUM}`; ctx.fillStyle = o.theme === 'light' ? '#fff' : '#06101f'; ctx.fillText(sg.v.toFixed(1), x + w / 2 - 1, 43); }
      x += w;
    });
    const cwid = (x1 - x0) / perRow;
    o.segs.forEach((sg, i) => { const col = cols[i % cols.length]; const gx = x0 + (i % perRow) * cwid, gy = 72 + Math.floor(i / perRow) * 22;
      ctx.fillStyle = col; roundRect(ctx, gx, gy - 9, 11, 11, 3); ctx.fill(); ctx.textAlign = 'left'; ctx.font = `600 10.5px ${FONT_TXT}`; ctx.fillStyle = th.text;
      ctx.fillText(`${sg.label} · ${sg.v.toFixed(1)} s (${Math.round(100 * sg.v / tot)}%)`, gx + 17, gy); });
  }

  /* Small vertical bar chart */
  function vbars(cv, o) {
    const th = THEMES[o.theme || 'dark']; const W = o.w || 340, H = o.h || 190; const ctx = setup(cv, W, H, o.scale);
    const x0 = 30, x1 = W - 10, y0 = H - 32, y1 = 26, max = o.max || niceMax(Math.max(...o.items.map(i => i.value)) * 1.1); const n = o.items.length, bw = (x1 - x0) / n;
    ctx.font = `500 9px ${FONT_NUM}`; ctx.textAlign = 'right'; ctx.lineWidth = 1;
    for (let k = 0; k <= 4; k++) { const y = y0 - (y0 - y1) * k / 4; ctx.strokeStyle = th.grid; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.fillStyle = th.sub; ctx.fillText(Math.round(max * k / 4), x0 - 5, y + 3); }
    o.items.forEach((it, i) => {
      const x = x0 + i * bw + bw * 0.22, w = bw * 0.56, h = (y0 - y1) * Math.min(1, it.value / max); const col = it.flag ? th.band.moderate : th.cyan;
      const g = ctx.createLinearGradient(0, y0 - h, 0, y0); g.addColorStop(0, col); g.addColorStop(1, th.blue); glow(ctx, th, col); ctx.fillStyle = g; roundRect(ctx, x, y0 - h, w, h, 4); ctx.fill(); noGlow(ctx);
      ctx.textAlign = 'center'; ctx.font = `700 11px ${FONT_NUM}`; ctx.fillStyle = th.text; ctx.fillText(it.value.toFixed(o.dec || 0) + (o.unit || ''), x + w / 2, y0 - h - 5);
      ctx.font = `600 10px ${FONT_TXT}`; ctx.fillStyle = th.sub; ctx.fillText(it.label, x + w / 2, y0 + 15);
    });
    ctx.strokeStyle = th.axis; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
  }

  /* Min–average–max range with ±1 SD bar */
  function range(cv, o) {
    const th = THEMES[o.theme || 'dark']; const W = o.w || 400, H = 78; const ctx = setup(cv, W, H, o.scale);
    const x0 = 14, x1 = W - 14, hi = o.axisMax || niceMax(o.max * 1.15), X = v => x0 + (x1 - x0) * Math.min(v, hi) / hi;
    ctx.strokeStyle = th.grid; ctx.lineWidth = 1; for (let k = 0; k <= 4; k++) { const x = x0 + (x1 - x0) * k / 4; ctx.beginPath(); ctx.moveTo(x, 18); ctx.lineTo(x, 44); ctx.stroke(); ctx.fillStyle = th.sub; ctx.font = `500 9px ${FONT_NUM}`; ctx.textAlign = 'center'; ctx.fillText((hi * k / 4).toFixed(hi < 4 ? 2 : 1), x, 58); }
    ctx.strokeStyle = th.axis; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(o.min), 31); ctx.lineTo(X(o.max), 31); ctx.stroke();
    [o.min, o.max].forEach(v => { ctx.beginPath(); ctx.moveTo(X(v), 24); ctx.lineTo(X(v), 38); ctx.stroke(); });
    const a = Math.max(o.min, o.avg - o.sd), b = Math.min(o.max, o.avg + o.sd); glow(ctx, th, th.cyan); ctx.fillStyle = hexA(th.cyan, 0.45); roundRect(ctx, X(a), 24, Math.max(4, X(b) - X(a)), 14, 5); ctx.fill(); noGlow(ctx);
    glow(ctx, th, th.orange); ctx.fillStyle = th.orange; ctx.beginPath(); ctx.arc(X(o.avg), 31, 6, 0, Math.PI * 2); ctx.fill(); noGlow(ctx);
    ctx.font = `700 10px ${FONT_NUM}`; ctx.textAlign = 'center'; ctx.fillStyle = th.text;
    ctx.fillText(o.min.toFixed(2), X(o.min), 14); ctx.fillStyle = th.orange; ctx.fillText(o.avg.toFixed(2), X(o.avg), 14); ctx.fillStyle = th.text; ctx.fillText(o.max.toFixed(2), X(o.max), 14);
    if (o.unit) { ctx.textAlign = 'right'; ctx.font = `500 9px ${FONT_TXT}`; ctx.fillStyle = th.sub; ctx.fillText(o.unit, x1, 74); }
  }


  /* Per-cue reaction-time chart (BlazePod): dots + moving average + own average + peer norm */
  function cueline(cv, o) {
    const th = THEMES[o.theme || 'dark']; const W = o.w || 720, H = o.h || 270; const ctx = setup(cv, W, H, o.scale);
    const x0 = 52, x1 = W - 16, y0 = H - 36; const n = o.raw.length;
    const colNorm = o.theme === 'light' ? '#b88a00' : '#ffd23f';
    const L = [['dot', th.cyan, o.labels.raw], ['line', th.orange, o.labels.env], ['dash', th.blue, o.labels.avg + (o.avg ? ' ' + Math.round(o.avg) : '')], ['dot2', colNorm, o.labels.norm + (o.norm ? ' ' + Math.round(o.norm) : '')]];
    if ((o.outIdx || []).length) L.push(['ring', th.band.priority, o.labels.out]);
    ctx.font = `600 10px ${FONT_TXT}`; const widths = L.map(l => ctx.measureText(l[2]).width + 34); const totalW = widths.reduce((s, v) => s + v, 0);
    const twoRow = totalW + 8 * (L.length - 1) > x1 - x0, y1 = twoRow ? 62 : 40;
    const top = Math.max(...o.raw, o.norm || 0, o.avg || 0); const ymax = niceMax(top * 1.06);
    const X = i => x0 + (x1 - x0) * (n === 1 ? 0.5 : i / (n - 1)), Y = v => y0 - (y0 - y1) * v / ymax;
    ctx.lineWidth = 1; ctx.font = `500 9px ${FONT_NUM}`; ctx.textAlign = 'right';
    for (let k = 0; k <= 4; k++) { const v = ymax * k / 4, y = Y(v); ctx.strokeStyle = th.grid; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.fillStyle = th.sub; ctx.fillText(Math.round(v), x0 - 6, y + 3); }
    ctx.save(); ctx.translate(11, (y0 + y1) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillStyle = th.sub; ctx.font = `600 9px ${FONT_TXT}`; ctx.fillText(o.unit || 'ms', 0, 0); ctx.restore();
    ctx.textAlign = 'center'; ctx.font = `500 9px ${FONT_NUM}`; ctx.fillStyle = th.sub;
    const step = n > 16 ? 4 : 2; for (let i = 0; i < n; i++) if (i === 0 || (i + 1) % step === 0 || i === n - 1) ctx.fillText(i + 1, X(i), y0 + 14);
    ctx.font = `600 9px ${FONT_TXT}`; ctx.fillText(o.labels.cue, (x0 + x1) / 2, H - 6);
    ctx.strokeStyle = th.axis; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
    const hline = (v, col, dash) => { if (!v) return; ctx.setLineDash(dash); ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x0, Y(v)); ctx.lineTo(x1, Y(v)); ctx.stroke(); ctx.setLineDash([]); };
    hline(o.norm, colNorm, [3, 4]); hline(o.avg, th.blue, [7, 4]);
    if (o.env) { ctx.beginPath(); o.env.forEach((v, i) => { i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v)); }); glow(ctx, th, th.orange); ctx.strokeStyle = th.orange; ctx.lineWidth = 2.6; ctx.lineJoin = 'round'; ctx.stroke(); noGlow(ctx); }
    ctx.beginPath(); o.raw.forEach((v, i) => { i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v)); }); ctx.strokeStyle = hexA(th.cyan, 0.75); ctx.lineWidth = 1.4; ctx.stroke();
    o.raw.forEach((v, i) => { const out = (o.outIdx || []).includes(i); ctx.beginPath(); ctx.arc(X(i), Y(v), out ? 5.5 : 3.6, 0, Math.PI * 2);
      if (out) { ctx.strokeStyle = th.band.priority; ctx.lineWidth = 2; ctx.stroke(); } else { glow(ctx, th, th.cyan); ctx.fillStyle = th.cyan; ctx.fill(); noGlow(ctx); } });
    // legend
    ctx.font = `600 10px ${FONT_TXT}`; ctx.textAlign = 'left';
    const rows = twoRow ? [L.slice(0, 3), L.slice(3)] : [L];
    let idx = 0;
    rows.forEach((row, ri) => { const rw = row.map((_, j) => widths[idx + j]); const tot = rw.reduce((s, v) => s + v, 0); const gap = row.length > 1 ? Math.max(8, Math.min(40, (x1 - x0 - tot) / (row.length - 1))) : 0; let lx = x0; const ly = 16 + ri * 18;
      row.forEach((l, j) => { const [kk, col, txt] = l; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.2;
        if (kk === 'dot') { ctx.beginPath(); ctx.arc(lx + 8, ly, 3.6, 0, 7); ctx.fill(); } else if (kk === 'ring') { ctx.beginPath(); ctx.arc(lx + 8, ly, 5, 0, 7); ctx.stroke(); }
        else { ctx.setLineDash(kk === 'dash' ? [6, 3] : kk === 'dot2' ? [3, 3] : []); ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 18, ly); ctx.stroke(); ctx.setLineDash([]); }
        ctx.fillStyle = th.text; ctx.fillText(txt, lx + 24, ly + 4); lx += rw[j] + gap; });
      idx += row.length; });
  }

  FS.charts = { cueline, radar, hbars, bullet, symmetry, load, ring, emgWave, legmap, heatmap, phases, vbars, range };
})(typeof window !== 'undefined' ? window : globalThis);
