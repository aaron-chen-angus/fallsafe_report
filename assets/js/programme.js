/* FallSafe+ Report Generator — 4-week supplementary balance programme builder
 * Gap-weighted exercise selection + linear/block periodisation:
 *   W1 Familiarisation  →  W2 Accumulation  →  W3 Intensification (level progression)  →  W4 Consolidation & re-test
 */
(function (root) {
  'use strict';
  const FS = (root.FS = root.FS || {});

  const TARGET = 75;                 // domain score the programme aims for
  const N_STATIC = 3, N_DYNAMIC = 3;

  // Dose templates per unit and week: [sets, reps/passes multiplier]
  const DOSE = {
    hold:   [{ sets: 2, reps: 3 }, { sets: 3, reps: 3 }, { sets: 3, reps: 4 }, { sets: 2, reps: 4 }],
    reps:   [{ sets: 2, k: 1 },    { sets: 3, k: 1 },    { sets: 3, k: 1.25 }, { sets: 2, k: 1.25 }],
    passes: [{ sets: 2, k: 1 },    { sets: 3, k: 1 },    { sets: 3, k: 1.34 }, { sets: 2, k: 1.34 }]
  };
  FS.WEEKS = [
    { key: 'w1', rpe: '3–4', rest: '60 s', sessions: 3, minutes: '20–25' },
    { key: 'w2', rpe: '4–5', rest: '45–60 s', sessions: 3, minutes: '25' },
    { key: 'w3', rpe: '5–6', rest: '45 s', sessions: 3, minutes: '25–30' },
    { key: 'w4', rpe: '4–5', rest: '45–60 s', sessions: 3, minutes: '20–25' }
  ];

  FS.buildProgramme = function (m) {
    const D = m.domains;
    const need = {};
    for (const k of FS.DOMAINS) {
      const s = D[k].score;
      need[k] = s === null ? 0.35 : Math.max(0.05, Math.min(1, (TARGET - s) / TARGET));
    }
    const highRisk = m.tier === 'high';
    const nearFall = !!(m.stations.FSST && m.stations.FSST.data.nearFall);
    const cog = m.support.cognition;
    const dualTaskOK = !cog || (cog.valid && cog.category === 'normal');   // an invalid MMSE withholds dual-task work until repeated

    // eligibility (safety gating)
    const eligible = FS.EXERCISES.filter(e => {
      if (e.advanced) return !highRisk && (D.DB.score ?? 0) >= 50 && (D.CO.score ?? 0) >= 50;
      return true;
    });
    const scored = eligible.map(e => {
      const pr = FS.DOMAINS.reduce((s, k) => s + need[k] * (e.w[k] || 0), 0);
      const primary = FS.DOMAINS.slice().sort((a, b) => (e.w[b] || 0) * need[b] - (e.w[a] || 0) * need[a])[0];
      return { e, pr, primary };
    }).sort((a, b) => b.pr - a.pr);

    let pick = [
      ...scored.filter(x => x.e.type === 'static').slice(0, N_STATIC),
      ...scored.filter(x => x.e.type === 'dynamic').slice(0, N_DYNAMIC)
    ];
    // coverage guarantee: every moderate/priority domain gets ≥2 exercises loading it ≥0.6
    for (const k of FS.DOMAINS) {
      if (!['moderate', 'priority'].includes(D[k].band)) continue;
      const covered = pick.filter(x => (x.e.w[k] || 0) >= 0.6).length;
      if (covered >= 2) continue;
      const cand = scored.find(x => !pick.includes(x) && (x.e.w[k] || 0) >= 0.6);
      if (!cand) continue;
      const sameType = pick.filter(x => x.e.type === cand.e.type).sort((a, b) => a.pr - b.pr);
      const drop = sameType.find(x => FS.DOMAINS.every(dk => !['moderate', 'priority'].includes(D[dk].band) || dk === k || (x.e.w[dk] || 0) < 0.6 || pick.filter(y => (y.e.w[dk] || 0) >= 0.6).length > 2));
      if (drop) pick = pick.map(x => (x === drop ? cand : x));
    }
    // order: static block first (postural set), then dynamic, each by priority
    pick.sort((a, b) => (a.e.type === b.e.type ? b.pr - a.pr : a.e.type === 'static' ? -1 : 1));

    const items = pick.map(({ e, pr, primary }) => {
      const pScore = D[primary].score ?? 50;
      let start = (highRisk || pScore < 50) ? 1 : 2;
      const cap = 3;
      const levels = [start, start, Math.min(cap, start + 1), Math.min(cap, start + 1)];
      const weeks = levels.map((lv, wi) => {
        const t = DOSE[e.unit][wi];
        if (e.unit === 'hold') return { level: lv, sets: t.sets, reps: t.reps, hold: e.base };
        return { level: lv, sets: t.sets, reps: Math.round(e.base * t.k) };
      });
      const reasonDomains = FS.DOMAINS.filter(k => (e.w[k] || 0) >= 0.6 && ['moderate', 'priority', 'monitor'].includes(D[k].band));
      return { id: e.id, type: e.type, unit: e.unit, priority: Math.round(pr * 100) / 100, primary, reasonDomains: reasonDomains.length ? reasonDomains : [primary], weeks, supervised: highRisk || nearFall };
    });

    // weekly load summary for charting
    const load = FS.WEEKS.map((w, wi) => ({
      week: wi + 1,
      sets: items.reduce((s, it) => s + it.weeks[wi].sets, 0),
      volume: items.reduce((s, it) => s + it.weeks[wi].sets * it.weeks[wi].reps, 0),
      level: Math.round(items.reduce((s, it) => s + it.weeks[wi].level, 0) / items.length * 10) / 10
    }));

    return {
      items, load, need,
      sessionsPerWeek: 3, days: ['mon', 'wed', 'fri'],
      dualTask: dualTaskOK, supervised: highRisk || nearFall, highRisk, nearFall,
      excludedAdvanced: FS.EXERCISES.filter(e => e.advanced && !eligible.includes(e)).map(e => e.id)
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
