/* FallSafe+ Report Generator — analysis engine
 * Station data  ->  station indicator scores  ->  4 balance domains
 * (Static Balance, Dynamic Balance, Proprioception, Coordination)
 * + findings, data-quality audit and supporting factors (strength, cognition).
 */
(function (root) {
  'use strict';
  const FS = (root.FS = root.FS || {});

  FS.DOMAINS = ['SB', 'DB', 'PR', 'CO'];

  /* Station → domain weightage (FallSafe+ Assessment Exercise Science Documentation).
   * BlazePod's 10% dual-tasking share is reported under cognition, not a balance domain. */
  FS.STATION_DOMAIN_WEIGHTS = {
    FSST:     { DB: 45, CO: 30, PR: 15, SB: 10 },
    EMG_DB:   { DB: 45, PR: 30, SB: 20, CO: 5 },
    BLAZEPOD: { CO: 65, DB: 15, SB: 5,  PR: 5 },
    EMG_TTT:  { PR: 50, DB: 30, SB: 10, CO: 10 },
    STS:      { DB: 50, SB: 20, CO: 20, PR: 10 },
    TUG:      { DB: 45, CO: 25, PR: 20, SB: 10 }
  };

  /* ---------- Reference data ---------- */
  // Rikli & Jones (1999) 30-s chair stand: [lower, upper] of the "normal" (middle 50%) band.
  const RIKLI = {
    Male:   [[60, 14, 19], [65, 12, 18], [70, 12, 17], [75, 11, 17], [80, 10, 15], [85, 8, 14], [90, 7, 12]],
    Female: [[60, 12, 17], [65, 11, 16], [70, 10, 15], [75, 10, 15], [80, 9, 14], [85, 8, 13], [90, 4, 11]]
  };
  // Unilateral isometric leg press norms (kg) — FallSafe+ Scoring Norms v2.1 §3.6
  const MVC_NORMS = {
    Male:   [[18, 112, 22], [30, 107, 21], [50, 94, 20], [60, 80, 19], [75, 63, 18]],
    Female: [[18, 80, 16], [30, 75, 15.5], [50, 66, 14.5], [60, 57, 14], [75, 46, 13]]
  };
  // BlazePod choice reach-and-touch norms (ms) — §5.3
  const BP_NORMS = {
    Male:   [[18, 650], [30, 700], [40, 760], [50, 830], [60, 920], [70, 1020], [80, 1150], [90, 1300]],
    Female: [[18, 690], [30, 740], [40, 800], [50, 875], [60, 965], [70, 1070], [80, 1200], [90, 1350]]
  };
  const pickBand = (tbl, age) => { let r = tbl[0]; for (const row of tbl) if (age >= row[0]) r = row; return r; };

  /* ---------- Maths helpers ---------- */
  const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
  const mean = arr => { const a = arr.filter(v => v !== null && v !== undefined && !isNaN(v)); return a.length ? a.reduce((s, v) => s + v, 0) / a.length : null; };
  const lerp = (pts, x) => { // piecewise-linear anchor mapping
    if (x === null || x === undefined || isNaN(x)) return null;
    if (x <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
    }
    return pts[pts.length - 1][1];
  };
  const zScore = z => clamp((clamp(z, -3, 3) + 3) / 6 * 100);
  const r1 = v => v === null || v === undefined ? null : Math.round(v * 10) / 10;
  FS.util = { clamp, mean, lerp, zScore, r1 };

  // Clinical anchor curves (documented in README §6)
  FS.CURVES = {
    fsstTime: [[6, 100], [8, 90], [10, 75], [12, 62], [15, 45], [20, 25], [25, 12], [30, 0]],
    tugTime:  [[5, 100], [7, 92], [8.5, 85], [10, 72], [12, 58], [13.5, 45], [20, 22], [30, 0]],
    gaitVel:  [[0.4, 0], [0.6, 12], [0.8, 30], [1.0, 55], [1.2, 75], [1.4, 90], [1.6, 100]]
  };

  FS.band = s => s === null ? 'na' : s >= 65 ? 'strength' : s >= 50 ? 'monitor' : s >= 35 ? 'moderate' : 'priority';

  /* ---------- Station indicator scoring ---------- */
  function scoreFSST(d) {
    const errs = (d.lineTouches || 0) + (d.hesitations || 0) + (d.seqErrors || 0);
    const timeScore = lerp(FS.CURVES.fsstTime, d.timeS);
    const errScore = clamp(100 - 12.5 * errs);
    const cvScore = d.stepCVpct === null ? 50 : clamp(100 * (1 - d.stepCVpct / 40));
    const placement = clamp(100 - 15 * ((d.lineTouches || 0) + (d.seqErrors || 0)));
    const agility = d.agility ?? null, stability = d.stability ?? null;
    return {
      parts: { timeScore, errScore, cvScore, placement, agility, stability },
      ind: { DB: mean([agility, stability, timeScore]), SB: stability ?? timeScore, CO: mean([errScore, cvScore, timeScore]), PR: placement },
      station: mean([agility, stability])
    };
  }
  function scoreEMG(d, kind) {
    const C = d.composite;
    if (kind === 'DB') return { parts: { composite: C }, ind: { DB: C, SB: C, PR: C, CO: C }, station: C };
    const s = d.sub || {};
    const TA = s['Terrain Adaptability'] ?? null, SH = s['Step Height'] ?? null, CM = s['Compensatory Movements'] ?? null;
    return {
      parts: { composite: C, terrain: TA, stepHeight: SH, compensatory: CM },
      ind: { PR: mean([C, TA]), DB: mean([C, SH, CM]), SB: C, CO: mean([C, CM]) },
      station: C
    };
  }
  function scoreBlaze(d) { const S = d.score; return { parts: { score: S }, ind: { CO: S, DB: S, SB: S, PR: S }, station: S }; }
  function stsNorm(meta, reps) {
    const tbl = RIKLI[meta.sex === 'Female' ? 'Female' : 'Male'];
    const row = pickBand(tbl, Math.max(60, Math.min(94, meta.age || 60)));
    const [ageFrom, lo, hi] = row; const mu = (lo + hi) / 2, sd = (hi - lo) / 1.349;
    return { ageFrom, lo, hi, mu, sd, z: reps === null ? null : (reps - mu) / sd, extrapolated: (meta.age || 60) < 60 };
  }
  function scoreSTS(d, meta) {
    const n = stsNorm(meta, d.reps);
    const repsScore = n.z === null ? null : zScore(n.z);
    const cvT = d.trans && d.trans.avg ? d.trans.sd / d.trans.avg : null;
    const consScore = cvT === null ? null : clamp(100 - cvT * 75);
    const standScore = d.trunk && d.trunk.standing !== null ? clamp(100 - Math.max(0, d.trunk.standing - 5) * 5) : null;
    return {
      parts: { repsScore, consScore, standScore, cvT, norm: n },
      ind: { DB: repsScore, SB: mean([repsScore, standScore]), CO: mean([repsScore, consScore]), PR: repsScore },
      station: repsScore
    };
  }
  function scoreTUG(d) {
    const timeScore = lerp(FS.CURVES.tugTime, d.timeS);
    const velScore = lerp(FS.CURVES.gaitVel, d.gaitVel);
    const asymLen = d.strideLenL && d.strideLenR ? Math.abs(d.strideLenL - d.strideLenR) / Math.max(d.strideLenL, d.strideLenR) * 100 : null;
    const asymTime = d.strideTimeL && d.strideTimeR ? Math.abs(d.strideTimeL - d.strideTimeR) / Math.max(d.strideTimeL, d.strideTimeR) * 100 : null;
    const asym = asymLen === null && asymTime === null ? null : Math.max(asymLen || 0, asymTime || 0);
    const symScore = asym === null ? null : clamp(100 - 3 * asym);
    const DB = timeScore === null ? null : (timeScore * 0.5 + (velScore ?? timeScore) * 0.3 + (symScore ?? timeScore) * 0.2);
    return {
      parts: { timeScore, velScore, symScore, asymLen, asymTime, asym },
      ind: { DB, SB: timeScore, CO: mean([timeScore, symScore]), PR: mean([symScore, velScore]) },
      station: DB
    };
  }


  /* ---------- EMG waveform summary (envelope statistics from the station PDF graph) ---------- */
  function waveStats(w, d) {
    if (!w || !w.ch) return null;
    const keys = ['LQ', 'RQ', 'LC', 'RC'].filter(k => w.ch[k]);
    if (!keys.length) return null;
    const ch = {};
    for (const k of keys) {
      const a = w.ch[k]; const mu = a.reduce((s, v) => s + v, 0) / a.length;
      const sd = Math.sqrt(a.reduce((s, v) => s + (v - mu) * (v - mu), 0) / a.length);
      ch[k] = { mean: r1(mu), peak: r1(Math.max(...a)), sd: r1(sd), snr: d && d.ch && d.ch[k] ? d.ch[k].snr : null };
    }
    const tot = keys.reduce((s, k) => s + ch[k].mean, 0) || 1;
    const top = Math.max(...keys.map(k => ch[k].mean));
    for (const k of keys) { ch[k].share = r1(100 * ch[k].mean / tot); ch[k].rel = top ? ch[k].mean / top : 0; }
    const flat = keys.filter(k => ch[k].mean < 0.05 * top);
    const dom = keys.slice().sort((a, b) => ch[b].mean - ch[a].mean)[0];
    const pair = (L, R) => (ch[L] && ch[R] && ch[L].mean > 0 && ch[R].mean > 0) ? { l: ch[L].mean, r: ch[R].mean, ratio: r1(Math.max(ch[L].mean, ch[R].mean) / Math.min(ch[L].mean, ch[R].mean)), side: ch[L].mean > ch[R].mean ? 'L' : 'R',
      lShare: Math.round(100 * ch[L].mean / (ch[L].mean + ch[R].mean)), rShare: Math.round(100 * ch[R].mean / (ch[L].mean + ch[R].mean)) } : null;
    return { n: w.n, tMax: w.tMax, durationS: d ? d.durationS : null, ch, keys, dom, flat, quad: pair('LQ', 'RQ'), calf: pair('LC', 'RC'), series: w.ch };
  }

  /* ---------- Main analysis ---------- */
  FS.analyse = function (parsed) {
    const S = {};          // station key -> parsed result
    parsed.filter(p => p.ok).forEach(p => { if (!S[p.station]) S[p.station] = p; });
    const present = FS.STATION_KEYS.filter(k => S[k]);
    const missing = FS.STATION_KEYS.filter(k => !S[k]);

    // client meta: most complete record wins
    const metas = present.map(k => S[k].meta);
    const pickMeta = f => { const c = {}; metas.forEach(m => { if (m[f] !== null && m[f] !== undefined) c[m[f]] = (c[m[f]] || 0) + 1; }); const e = Object.entries(c).sort((a, b) => b[1] - a[1]); return e.length ? e[0][0] : null; };
    const client = {
      name: pickMeta('name'), age: +pickMeta('age') || null, sex: pickMeta('sex'),
      heightCm: +pickMeta('heightCm') || null, weightKg: +pickMeta('weightKg') || null,
      subjectId: pickMeta('subjectId'), date: pickMeta('date')
    };
    client.bmi = client.heightCm && client.weightKg ? r1(client.weightKg / Math.pow(client.heightCm / 100, 2)) : null;
    const times = metas.map(m => m.time).filter(Boolean).sort();
    client.timeRange = times.length ? (times[0] === times[times.length - 1] ? times[0] : times[0] + '–' + times[times.length - 1]) : null;

    const dq = [];        // data-quality / integrity notes  {id, station, sev, p}
    const F = [];         // findings {id, station, dom[], sev:'high'|'mod'|'low'|'pos', p}
    const add = (id, station, dom, sev, p = {}) => F.push({ id, station, dom, sev, p });
    const flag = (id, station, sev, p = {}) => dq.push({ id, station, sev, p });

    // cross-file consistency
    const ids = [...new Set(metas.map(m => m.subjectId).filter(Boolean))];
    if (ids.length > 1) flag('dq_mixed_subjects', null, 'high', { ids: ids.join(', ') });
    const dates = [...new Set(metas.map(m => m.date).filter(Boolean))];
    if (dates.length > 1) flag('dq_mixed_dates', null, 'mod', { dates: dates.join(', ') });
    if (missing.length) flag('dq_missing', null, 'info', { list: missing });

    const st = {};  // station results
    const q = {};   // quality factor per station

    /* --- FSST --- */
    if (S.FSST) {
      const d = S.FSST.data; const sc = scoreFSST(d); st.FSST = { data: d, ...sc }; q.FSST = 1;
      if (d.timeS !== null) add('f_fsst_time', 'FSST', ['DB', 'CO'], d.timeS > 15 ? 'high' : d.timeS >= 10 ? 'mod' : 'pos', { v: d.timeS });
      if (d.nearFall) add('f_fsst_nearfall', 'FSST', ['SB', 'DB'], 'high', { a: d.peakTrunkDeg, w: d.meanTrunkVel });
      else if (d.peakTrunkDeg >= 20) add('f_fsst_trunk', 'FSST', ['SB'], 'mod', { a: d.peakTrunkDeg });
      if (d.stepCVpct !== null) add('f_fsst_cv', 'FSST', ['CO'], d.stepCVpct > 40 ? 'high' : d.stepCVpct > 20 ? 'mod' : 'pos', { v: d.stepCVpct });
      const errs = (d.lineTouches || 0) + (d.seqErrors || 0) + (d.hesitations || 0);
      add('f_fsst_errors', 'FSST', ['PR', 'CO'], errs >= 3 ? 'high' : errs >= 1 ? 'mod' : 'pos', { lt: d.lineTouches || 0, se: d.seqErrors || 0, h: d.hesitations || 0 });
      if (d.doubleSupportPct !== null && d.doubleSupportPct > 45) add('f_fsst_ds', 'FSST', ['DB', 'SB'], 'low', { v: d.doubleSupportPct });
      if (d.phaseRatio !== null && Math.abs(d.phaseRatio - 1) > 0.15) add('f_fsst_phase', 'FSST', ['CO'], 'mod', { v: d.phaseRatio });
      // quality
      if (d.doubleSupportPct >= 95) flag('dq_fsst_ds', 'FSST', 'low', { v: d.doubleSupportPct });
      if (d.nearFall && d.peakTrunkDeg !== null && d.peakTrunkDeg < 30 && (d.meanTrunkVel || 0) < 50) flag('dq_fsst_nearfall', 'FSST', 'low', { a: d.peakTrunkDeg, w: d.meanTrunkVel });
      if (d.stepLenMean !== null && d.stepLenMean < 0.3) flag('dq_fsst_steplen', 'FSST', 'info', { v: d.stepLenMean });
      if (d.riskLabel && d.timeS !== null) {
        const exp = d.timeS > 15 ? 'High' : d.timeS >= 10 ? 'Moderate' : 'Low';
        if (!new RegExp(exp, 'i').test(d.riskLabel)) flag('dq_fsst_label', 'FSST', 'mod', { label: d.riskLabel, v: d.timeS });
      }
    }

    /* --- EMG stations --- */
    const emgQuality = (key, d) => {
      const low = Object.entries(d.ch).filter(([, c]) => c.snr !== null && c.snr < 10).map(([k, c]) => ({ k, snr: c.snr }));
      if (low.length) flag('dq_emg_snr', key, low.length >= 2 ? 'mod' : 'low', { list: low });
      const bad = Object.entries(d.mvcPct || {}).filter(([, v]) => v !== null && v > 150).map(([k, v]) => ({ k, v }));
      if (bad.length) flag('dq_emg_mvcpct', key, 'mod', { list: bad });
      if (d.mvcNotCollected && S.MVC) flag('dq_emg_mvclink', key, 'mod', {});
      const lq = d.ch.LQ.rms, rq = d.ch.RQ.rms;
      if (lq && rq && Math.max(lq, rq) / Math.min(lq, rq) > 5) flag('dq_emg_rms', key, 'mod', { l: lq, r: rq, ratio: r1(Math.max(lq, rq) / Math.min(lq, rq)) });
      return low.length === 0 ? 1 : low.length === 1 ? 0.75 : 0.5;
    };
    const symFinding = (id, key, v, dom, calfLow) => {
      if (v === null) return;
      const sev = (v < 0.65 || v > 1.54) ? 'mod' : (v < 0.75 || v > 1.33) ? 'low' : 'pos';
      add(id, key, dom, sev, { v, lowconf: !!calfLow });
    };
    const coactFinding = (id, key, v) => {
      if (v === null) return;
      add(id, key, ['CO', 'SB'], v > 0.65 ? 'high' : v > 0.45 ? 'mod' : 'pos', { v });
    };
    // waveform-derived checks (channel dropout, window mismatch, left/right amplitude imbalance)
    const waveChecks = (key, w, calfDom, quadDom) => {
      if (!w) return;
      if (w.flat.length) flag('dq_emg_flat', key, w.flat.length >= 2 ? 'mod' : 'low', { list: w.flat });
      if (w.tMax && w.durationS && Math.abs(w.tMax - w.durationS) / w.tMax > 0.2) flag('dq_emg_window', key, 'low', { t: w.tMax, d: w.durationS });
      const lowconf = side => w.flat.includes(side + 'Q') || w.flat.includes(side + 'C');
      const one = (pair, m, dom, L, R) => { if (!pair || pair.ratio < 1.5) return; add('f_emg_wave', key, dom, pair.ratio >= 3 ? 'mod' : 'low', { task: key, m, side: pair.side, x: pair.ratio, a: Math.max(pair.l, pair.r), b: Math.min(pair.l, pair.r), lowconf: w.flat.includes(L) || w.flat.includes(R) || pair.ratio >= 5 }); };
      one(w.quad, 'quad', quadDom, 'LQ', 'RQ'); one(w.calf, 'calf', calfDom, 'LC', 'RC');
    };
    if (S.EMG_DB) {
      const d = S.EMG_DB.data; const sc = scoreEMG(d, 'DB'); st.EMG_DB = { data: d, ...sc }; q.EMG_DB = emgQuality('EMG_DB', d);
      if (d.composite !== null) add('f_db_comp', 'EMG_DB', ['DB', 'PR'], { priority: 'high', moderate: 'mod', monitor: 'low', strength: 'pos' }[FS.band(d.composite)], { v: d.composite });
      const calfLow = (d.ch.LC.snr ?? 99) < 10 || (d.ch.RC.snr ?? 99) < 10;
      symFinding('f_db_calfsym', 'EMG_DB', d.calfSym, ['PR', 'SB'], calfLow);
      symFinding('f_db_quadsym', 'EMG_DB', d.quadSym, ['DB', 'SB'], false);
      coactFinding('f_db_coact', 'EMG_DB', d.coactL ?? d.coactR);
      if (d.domainLabel && !/dynamic/i.test(d.domainLabel)) flag('dq_emg_label', 'EMG_DB', 'low', { label: d.domainLabel, exp: 'Dynamic Balance' });
      st.EMG_DB.wave = waveStats(S.EMG_DB.wave, d); waveChecks('EMG_DB', st.EMG_DB.wave, ['PR', 'SB'], ['DB', 'SB']);
    }
    if (S.EMG_TTT) {
      const d = S.EMG_TTT.data; const sc = scoreEMG(d, 'TTT'); st.EMG_TTT = { data: d, ...sc }; q.EMG_TTT = emgQuality('EMG_TTT', d);
      if (d.composite !== null) add('f_ttt_comp', 'EMG_TTT', ['PR', 'DB'], { priority: 'high', moderate: 'mod', monitor: 'low', strength: 'pos' }[FS.band(d.composite)], { v: d.composite });
      const ta = sc.parts.terrain; if (ta !== null) add('f_ttt_terrain', 'EMG_TTT', ['PR'], ta < 35 ? 'high' : ta < 50 ? 'mod' : ta < 65 ? 'low' : 'pos', { v: ta });
      const sh = sc.parts.stepHeight; if (sh !== null && sh >= 65) add('f_ttt_step', 'EMG_TTT', ['DB'], 'pos', { v: sh });
      const cm = sc.parts.compensatory; if (cm !== null && cm < 50) add('f_ttt_comp_mov', 'EMG_TTT', ['SB', 'CO'], cm < 35 ? 'high' : 'mod', { v: cm });
      const calfLow = (d.ch.LC.snr ?? 99) < 10 || (d.ch.RC.snr ?? 99) < 10;
      symFinding('f_ttt_calfsym', 'EMG_TTT', d.calfSym, ['PR', 'SB'], calfLow);
      coactFinding('f_ttt_coact', 'EMG_TTT', d.coactL ?? d.coactR);
      if (d.domainLabel && /static/i.test(d.domainLabel)) flag('dq_emg_label', 'EMG_TTT', 'low', { label: d.domainLabel, exp: 'Terrain Trek / Proprioception' });
      st.EMG_TTT.wave = waveStats(S.EMG_TTT.wave, d); waveChecks('EMG_TTT', st.EMG_TTT.wave, ['PR', 'SB'], ['PR', 'DB']);
    }

    /* --- BlazePod --- */
    if (S.BLAZEPOD) {
      const d = S.BLAZEPOD.data; const sc = scoreBlaze(d); st.BLAZEPOD = { data: d, ...sc }; q.BLAZEPOD = 1;
      if (d.score !== null) add('f_bp_score', 'BLAZEPOD', ['CO'], d.score < 40 ? 'high' : d.score < 65 ? 'mod' : 'pos', { v: d.score, rt: d.medianRtMs, pc: d.percentile });
      if (d.accuracyPct !== null) add('f_bp_acc', 'BLAZEPOD', ['CO'], d.accuracyPct >= 95 ? 'pos' : d.accuracyPct >= 85 ? 'low' : 'mod', { v: d.accuracyPct });
      if (d.rtCV !== null && d.rtCV > 0.25) add('f_bp_cv', 'BLAZEPOD', ['CO'], 'low', { v: d.rtCV });
      const bw = S.BLAZEPOD.wave;
      if (bw && bw.ch && bw.ch.RAW && bw.ch.RAW.length >= 6) {
        const raw = bw.ch.RAW, srt = raw.slice().sort((x, y) => x - y), med = srt[Math.floor(srt.length / 2)];
        const outIdx = raw.map((v, i) => (v > 2 * med ? i : -1)).filter(i => i >= 0);
        const clean = raw.filter((v, i) => !outIdx.includes(i)), th3 = Math.max(2, Math.floor(clean.length / 3));
        const first = mean(clean.slice(0, th3)), last = mean(clean.slice(-th3)), trendPct = first ? (last - first) / first * 100 : 0;
        st.BLAZEPOD.cues = { raw, env: bw.ch.ENV || null, outIdx, best: Math.min(...clean), worst: Math.max(...clean), median: med, mean: mean(raw), trendPct: r1(trendPct), avgLine: d.avgRtMs };
        if (trendPct <= -10) add('f_bp_improve', 'BLAZEPOD', ['CO'], 'pos', { v: Math.round(-trendPct) });
        else if (trendPct >= 10) add('f_bp_slow', 'BLAZEPOD', ['CO'], 'low', { v: Math.round(trendPct) });
      }
      const totalCues = (d.cuesAfter || 0) + (d.outliers || 0);
      if (totalCues && d.outliers / totalCues > 0.15) flag('dq_bp_outliers', 'BLAZEPOD', 'low', { v: d.outliers, n: totalCues });
      if (client.age && d.peerNormMs) {
        const ref = pickBand(BP_NORMS[client.sex === 'Female' ? 'Female' : 'Male'], client.age)[1];
        if (Math.abs(ref - d.peerNormMs) / ref > 0.04) flag('dq_bp_norm', 'BLAZEPOD', 'info', { rep: d.peerNormMs, doc: ref });
      }
    }

    /* --- STS --- */
    if (S.STS) {
      const d = S.STS.data; const sc = scoreSTS(d, client); st.STS = { data: d, ...sc }; q.STS = 1;
      const n = sc.parts.norm;
      if (d.reps !== null) add('f_sts_reps', 'STS', ['DB', 'SB'], d.reps < n.lo ? 'high' : d.reps <= n.hi ? 'low' : 'pos', { v: d.reps, lo: n.lo, hi: n.hi, ext: n.extrapolated });
      if (sc.parts.cvT !== null && sc.parts.cvT > 0.5) add('f_sts_var', 'STS', ['CO'], 'low', { v: Math.round(sc.parts.cvT * 100) });
      if (d.trunk && d.trunk.transition !== null && d.trunk.transition > 40) add('f_sts_trunk', 'STS', ['SB'], 'mod', { v: d.trunk.transition });
      if (n.extrapolated) flag('dq_sts_age', 'STS', 'info', { age: client.age });
    }

    /* --- TUG --- */
    if (S.TUG) {
      const d = S.TUG.data; const sc = scoreTUG(d); st.TUG = { data: d, ...sc }; q.TUG = 1;
      if (d.timeS !== null) add('f_tug_time', 'TUG', ['DB'], d.timeS > 13.5 ? 'high' : d.timeS >= 10 ? 'mod' : 'pos', { v: d.timeS });
      if (d.gaitVel !== null) add('f_tug_vel', 'TUG', ['DB'], d.gaitVel < 0.8 ? 'high' : d.gaitVel < 1.0 ? 'mod' : 'pos', { v: d.gaitVel });
      if (sc.parts.asym !== null) add('f_tug_asym', 'TUG', ['PR', 'CO'], sc.parts.asym > 20 ? 'high' : sc.parts.asym > 10 ? 'mod' : 'pos', { len: r1(sc.parts.asymLen), time: r1(sc.parts.asymTime), l: d.strideLenL, r: d.strideLenR });
      if (d.riskLabel && d.timeS !== null) {
        const exp = d.timeS > 12 ? 'High' : 'Low';
        if (!new RegExp(exp, 'i').test(d.riskLabel)) flag('dq_tug_label', 'TUG', 'mod', { label: d.riskLabel, v: d.timeS, p: d.probabilityPct });
      }
    }

    /* --- Supporting: strength (MVC + STS) --- */
    const support = { strength: null, cognition: null };
    if (S.MVC) {
      const d = S.MVC.data; const sex = client.sex === 'Female' ? 'Female' : 'Male';
      const nrm = pickBand(MVC_NORMS[sex], client.age || 50);
      const plausible = !(d.leftKg !== null && d.rightKg !== null && Math.max(d.leftKg, d.rightKg) < 0.25 * nrm[1]);
      const pct = kg => kg === null ? null : r1(100 * 0.5 * (1 + erf(((kg - nrm[1]) / nrm[2]) / Math.SQRT2)));
      const asym = d.asymPct ?? (d.leftKg && d.rightKg ? Math.abs(d.leftKg - d.rightKg) / Math.max(d.leftKg, d.rightKg) * 100 : null);
      support.strength = { mvc: d, norm: { mean: nrm[1], sd: nrm[2] }, plausible, asym, leftPct: pct(d.leftKg), rightPct: pct(d.rightKg) };
      if (!plausible) flag('dq_mvc_implausible', 'MVC', 'high', { l: d.leftKg, r: d.rightKg, m: nrm[1] });
      if ((d.leftTrials || '').trim() === '-' || (d.rightTrials || '').trim() === '-') flag('dq_mvc_trials', 'MVC', 'low', {});
      if (asym !== null) add('f_mvc_asym', 'MVC', ['ST'], asym >= 30 ? (plausible ? 'high' : 'mod') : asym >= 15 ? 'mod' : 'pos', { v: r1(asym), l: d.leftKg, r: d.rightKg, lowconf: !plausible });
      if (d.calfAsymPct !== null && d.calfAsymPct >= 15) add('f_mvc_calf', 'MVC', ['ST'], d.calfAsymPct >= 30 ? 'high' : 'mod', { v: d.calfAsymPct });
    }
    if (st.STS) support.strengthSTS = { repsScore: st.STS.parts.repsScore, reps: st.STS.data.reps, norm: st.STS.parts.norm };

    /* --- Supporting: cognition (MMSE) --- */
    if (S.MMSE) {
      const d = S.MMSE.data;
      const over = Object.entries(d.domains).filter(([, v]) => v && v.score > v.max).map(([k, v]) => ({ k, s: v.score, m: v.max }));
      const domSumMax = Object.values(d.domains).reduce((s, v) => s + (v ? v.max : 0), 0);
      const valid = over.length === 0 && d.totalMax === 30;
      if (over.length) flag('dq_mmse_domain', 'MMSE', 'high', { list: over });
      if (d.totalMax !== null && d.totalMax !== 30) flag('dq_mmse_scale', 'MMSE', 'high', { v: d.total, m: d.totalMax, dm: domSumMax });
      const cat = d.total === null ? null : d.total >= 24 ? 'normal' : d.total >= 18 ? 'mild' : 'severe';
      support.cognition = { mmse: d, valid, category: cat };
      if (d.total !== null) add('f_mmse', 'MMSE', ['CG'], cat === 'normal' ? (valid ? 'pos' : 'low') : cat === 'mild' ? 'mod' : 'high', { v: d.total, m: d.totalMax, valid });
    }

    /* --- Domain aggregation --- */
    const domains = {};
    for (const D of FS.DOMAINS) {
      let num = 0, den = 0, avail = 0, all = 0; const contrib = [];
      for (const [k, w] of Object.entries(FS.STATION_DOMAIN_WEIGHTS)) {
        if (!w[D]) continue; all += w[D];
        const s = st[k]; const v = s ? s.ind[D] : null;
        if (v === null || v === undefined) continue;
        const qq = q[k] ?? 1; avail += w[D];
        num += v * w[D] * qq; den += w[D] * qq;
        contrib.push({ station: k, score: r1(v), weight: w[D], q: qq });
      }
      const score = den ? r1(num / den) : null;
      const coverage = all ? avail / all : 0;
      const meanQ = contrib.length ? contrib.reduce((s, c) => s + c.q * c.weight, 0) / contrib.reduce((s, c) => s + c.weight, 0) : 0;
      const conf = coverage * meanQ;
      domains[D] = { score, band: FS.band(score), coverage: Math.round(coverage * 100), confidence: conf >= 0.75 ? 'high' : conf >= 0.5 ? 'moderate' : 'low', contrib: contrib.sort((a, b) => b.weight - a.weight) };
    }
    const dScores = FS.DOMAINS.map(D => domains[D].score).filter(v => v !== null);
    const index = dScores.length ? r1(mean(dScores)) : null;

    /* --- Fall-risk screening tier --- */
    const sevCount = s => F.filter(f => f.sev === s && !['ST', 'CG'].includes(f.dom[0])).length;
    // Single-test cut-offs have modest specificity (and were derived in adults ≥65), so one flag raises the
    // tier to Moderate only. HIGH needs converging evidence: flags from ≥2 independent stations AND a
    // below-average Balance Index (<50), or a severe peer-relative deficit (Index <35).
    const triggers = [], flagStations = new Set();
    const trig = (id, stn) => { triggers.push(id); flagStations.add(stn); };
    if (st.FSST && st.FSST.data.timeS > 15) trig('t_fsst', 'FSST');
    if (st.FSST && st.FSST.data.nearFall) trig('t_nearfall', 'FSST');
    if (st.TUG && st.TUG.data.timeS > 13.5) trig('t_tug', 'TUG');
    if (st.TUG && st.TUG.data.gaitVel !== null && st.TUG.data.gaitVel < 0.8) trig('t_vel', 'TUG');
    const severe = index !== null && index < 35;
    if (severe) triggers.push('t_index');
    let tier = 'low';
    if (severe || (flagStations.size >= 2 && index !== null && index < 50)) tier = 'high';
    else if (triggers.length || (index !== null && index < 55) || sevCount('mod') >= 3 || sevCount('high') >= 1) tier = 'moderate';

    // ranking of gaps
    const ranked = FS.DOMAINS.filter(D => domains[D].score !== null).sort((a, b) => domains[a].score - domains[b].score);

    const model = {
      generatedAt: new Date().toISOString(),
      client, present, missing, stations: st, quality: q, domains, index, indexBand: FS.band(index),
      tier, triggers, findings: F, dq, support, ranked,
      files: parsed.map(p => ({ name: p.filename, station: p.station || null, ok: p.ok, error: p.error || null }))
    };
    model.programme = FS.buildProgramme ? FS.buildProgramme(model) : null;
    return model;
  };

  // Abramowitz–Stegun erf approximation (for MVC percentiles)
  function erf(x) {
    const s = Math.sign(x); x = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  }
})(typeof window !== 'undefined' ? window : globalThis);
