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
      const [x, y] = pt(i, 128);
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
      ctx.beginPath(); ctx.moveTo(x - 6, 8); ctx.lineTo(x + 6, 8); ctx.lineTo(x, 15); ctx.closePath(); ctx.fillStyle = th.orange; ctx.fill();
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

  FS.charts = { radar, hbars, bullet, symmetry, load, ring };
})(typeof window !== 'undefined' ? window : globalThis);
