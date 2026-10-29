/* FallSafe+ Report Generator — report renderer
 * Produces an ordered list of self-contained blocks (HTML + chart jobs). The same blocks are
 * flowed continuously on screen (TRON theme) and paginated onto A4 pages for PDF (print theme).
 */
(function (root) {
  'use strict';
  const FS = (root.FS = root.FS || {});
  const SEV_ORDER = { high: 0, mod: 1, low: 2, info: 3, pos: 4 };
  let UID = 0;

  const esc = s => String(s === null || s === undefined ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const f = (v, d = 1) => (v === null || v === undefined || isNaN(v) ? '—' : (+v).toFixed(d));

  FS.REFERENCES = [
    'Dite, W., & Temple, V. A. (2002). A clinical test of stepping and change of direction to identify multiple falling older adults. Archives of Physical Medicine and Rehabilitation, 83(11), 1566–1571.',
    'Horak, F. B. (2006). Postural orientation and equilibrium: What do we need to know about neural control of balance to prevent falls? Age and Ageing, 35(Suppl. 2), ii7–ii11.',
    'Okubo, Y., Schoene, D., & Lord, S. R. (2017). Step training improves reaction time, gait and balance and reduces falls in older people: A systematic review and meta-analysis. British Journal of Sports Medicine, 51(7), 586–593.',
    'Peterka, R. J. (2002). Sensorimotor integration in human postural control. Journal of Neurophysiology, 88(3), 1097–1118.',
    'Podsiadlo, D., & Richardson, S. (1991). The timed "Up & Go": A test of basic functional mobility for frail elderly persons. Journal of the American Geriatrics Society, 39(2), 142–148.',
    'Rikli, R. E., & Jones, C. J. (1999). Functional fitness normative scores for community-residing older adults, ages 60–94. Journal of Aging and Physical Activity, 7(2), 162–181.',
    'Sherrington, C., Fairhall, N. J., Wallbank, G. K., Tiedemann, A., Michaleff, Z. A., Howard, K., Clemson, L., Hopewell, S., & Lamb, S. E. (2019). Exercise for preventing falls in older people living in the community. Cochrane Database of Systematic Reviews, 2019(1), CD012424.',
    'Sherrington, C., Michaleff, Z. A., Fairhall, N., Paul, S. S., Tiedemann, A., Whitney, J., Cumming, R. G., Herbert, R. D., Close, J. C. T., & Lord, S. R. (2017). Exercise to prevent falls in older adults: An updated systematic review and meta-analysis. British Journal of Sports Medicine, 51(24), 1750–1758.',
    'Shumway-Cook, A., Brauer, S., & Woollacott, M. (2000). Predicting the probability for falls in community-dwelling older adults using the Timed Up & Go Test. Physical Therapy, 80(9), 896–903.',
    'Folstein, M. F., Folstein, S. E., & McHugh, P. R. (1975). "Mini-mental state": A practical method for grading the cognitive state of patients for the clinician. Journal of Psychiatric Research, 12(3), 189–198.',
    'Halvarsson, A., Dohrn, I.-M., & Ståhle, A. (2015). Taking balance training for older adults one step further: The rationale for and a description of a proven balance training programme. Clinical Rehabilitation, 29(5), 417–425.',
    'Wollesen, B., & Voelcker-Rehage, C. (2014). Training effects on motor–cognitive dual-task performance in older adults: A systematic review. European Review of Aging and Physical Activity, 11(1), 5–24.',
    'Montero-Odasso, M., Verghese, J., Beauchet, O., & Hausdorff, J. M. (2012). Gait and cognition: A complementary approach to understanding brain function and the risk of falling. Journal of the American Geriatrics Society, 60(11), 2127–2136.'
  ];

  FS.buildReport = function (m, lang, theme) {
    const t = FS.makeT(lang);
    const blocks = [];
    const jobs = [];
    const id = () => 'cv' + (++UID);
    const chart = (type, opts, cls = '') => { const k = id(); jobs.push({ id: k, type, opts: Object.assign({ theme }, opts) }); return `<canvas id="${k}" class="r-chart ${cls}"></canvas>`; };
    const push = (html, o = {}) => blocks.push(Object.assign({ html }, o));
    const head = (key, num) => push(`<div class="r-sec"><span class="r-sec-n">${String(num).padStart(2, '0')}</span><h2>${esc(t(key))}</h2><span class="r-sec-line"></span></div>`, { keep: true });
    const sevChip = s => `<span class="r-chip sev-${s}">${esc(t('sev_' + s))}</span>`;
    const bandChip = b => `<span class="r-chip band-${b}">${esc(t('b_' + b))}</span>`;
    const domName = d => t(d);
    const findingText = fd => {
      const p = Object.assign({}, fd.p);
      if ('lowconf' in p) p.lc = p.lowconf ? t('lowconf') : '';
      if ('ext' in p) p.ext = p.ext ? t('ext_note') : '';
      if ('valid' in p) p.inv = p.valid ? '' : t('invalid');
      if ('task' in p) { p.task = t('st_' + p.task); p.m = t('mus_' + p.m); p.side = t(p.side === 'L' ? 'left' : 'right').toLowerCase(); }
      return t(fd.id, p);
    };
    const dqText = q => {
      const p = Object.assign({}, q.p);
      if (q.id === 'dq_missing') p.list = q.p.list.map(k => t('st_' + k)).join(', ');
      if (q.id === 'dq_emg_snr') p.list = q.p.list.map(x => `${t('ch_' + x.k)} (${f(x.snr)} dB)`).join(', ');
      if (q.id === 'dq_emg_mvcpct') p.list = q.p.list.map(x => `${t('ch_' + x.k)} ${f(x.v)}%`).join(', ');
      if (q.id === 'dq_emg_flat') p.list = q.p.list.map(k => cap(t('ch_' + k))).join(', ');
      if (q.id === 'dq_mmse_domain') p.list = q.p.list.map(x => `${t(x.k)} ${x.s}/${x.m}`).join(', ');
      return t(q.id, p);
    };
    const wk = i => (lang === 'zh' ? `第${i}周` : `${t('week')} ${i}`);
    const c = m.client;
    const sexT = c.sex ? t(c.sex) : '—';
    let sec = 0;

    /* ===== Title / client ===== */
    const tierCol = { low: 'strength', moderate: 'moderate', high: 'priority' }[m.tier];
    push(`
      <div class="r-title">
        <div class="r-title-l">
          <div class="r-kicker">FallSafe+ · NeuroCore</div>
          <h1>${esc(t('reportTitle'))}</h1>
          <div class="r-subtitle">${esc(t('reportSub'))}</div>
          <div class="r-gen">${esc(t('c_generated'))}: ${esc(new Date(m.generatedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }))}</div>
        </div>
        <div class="r-title-r">
          <div class="r-index band-${m.indexBand}"><div class="r-index-v">${f(m.index)}</div><div class="r-index-l">${esc(t('index'))}</div></div>
          <div class="r-tier band-${tierCol}"><div class="r-tier-l">${esc(t('tier'))}</div><div class="r-tier-v">${esc(t('tier_' + m.tier))}</div></div>
        </div>
      </div>
      <div class="r-client">
        ${[['c_name', c.name], ['c_id', c.subjectId], ['c_age', c.age ? c.age + ' ' + t('yrs') : '—'], ['c_sex', sexT],
           ['c_height', c.heightCm ? f(c.heightCm) + ' cm' : '—'], ['c_weight', c.weightKg ? f(c.weightKg) + ' kg' : '—'], ['c_bmi', c.bmi ? f(c.bmi) + ' kg/m²' : '—'],
           ['c_date', (c.date || '—') + (c.timeRange ? ' · ' + c.timeRange : '')], ['c_stations', m.present.length + ' / 8']]
          .map(([k, v]) => `<div class="r-kv${k === 'c_id' ? ' wide' : ''}"><span>${esc(t(k))}</span><b>${esc(v || '—')}</b></div>`).join('')}
      </div>`, { cls: 'b-title' });

    /* ===== 1. Executive summary ===== */
    head('s_summary', ++sec);
    const best = m.ranked[m.ranked.length - 1], worst = m.ranked[0];
    const P = [];
    P.push(t('sum_intro', { name: c.name || '—', age: c.age || '—', sex: sexT.toLowerCase(), n: m.present.length, date: c.date || '—' }));
    P.push(t('sum_index', { v: f(m.index), band: t('b_' + m.indexBand), tier: t('tier_' + m.tier) }) + (m.triggers.length ? ' ' + t('sum_triggers', { list: m.triggers.map(x => t(x)).join('; ') }) : ''));
    if (best && worst && best !== worst) P.push(t('sum_best', { d: domName(best), v: f(m.domains[best].score) }) + ' ' + t('sum_worst', { d: domName(worst), v: f(m.domains[worst].score) }));
    const ins = [];
    const S = m.stations;
    if (S.TUG && S.FSST && S.EMG_TTT && S.TUG.parts.timeScore >= 70 && S.FSST.data.timeS > 15 && S.EMG_TTT.data.composite < 50) ins.push(t('ins_taskspecific'));
    if (S.STS) { const r = S.STS.data.reps, n = S.STS.parts.norm; if (r !== null) ins.push(r >= n.lo ? t('ins_strength_ok') : t('ins_strength_low')); }
    const dqN = m.dq.filter(q => ['high', 'mod'].includes(q.sev)).length; if (dqN) ins.push(t('ins_dq', { n: dqN }));
    if (m.missing.length) ins.push(t('ins_missing', { n: m.missing.length }));
    const pd = m.programme ? [...new Set(m.programme.items.map(i => i.primary))].map(domName) : [];
    const progLine = m.programme ? t('sum_programme', { domains: pd.length > 1 ? pd.slice(0, -1).join(', ') + ' ' + t('and') + ' ' + pd[pd.length - 1] : pd[0], n: m.programme.items.length }) : '';
    push(`<div class="r-summary">
        <div class="r-summary-txt">${P.map(p => `<p>${esc(p)}</p>`).join('')}
          <ul class="r-insights">${ins.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
          ${progLine ? `<p class="r-prog-line">${esc(progLine)}</p>` : ''}
        </div>
        <div class="r-tier-box band-${tierCol}"><div class="r-tier-box-h">${esc(t('tier'))}: ${esc(t('tier_' + m.tier))}</div><p>${esc(t('tier_' + m.tier + '_d'))}</p><p class="r-tier-basis">${esc(t('tier_basis', { n: m.flagStations.length, list: m.flagStations.length ? m.flagStations.map(k => t('st_' + k)).join(', ') : t('none'), v: f(m.index) }))}</p></div>
      </div>`);
    push(`<div class="r-legend"><div class="r-legend-h">${esc(t('legend_h'))}</div><p>${esc(t('legend_d'))}</p>
        <div class="r-legend-chips">${[['strength', '≥ 65'], ['monitor', '50 – 64'], ['moderate', '35 – 49'], ['priority', '< 35']].map(([b, r]) => `<span>${bandChip(b)}<i>${r}</i></span>`).join('')}</div></div>`);

    /* ===== Top priorities ===== */
    const D = m.domains;
    head('s_priorities', ++sec);
    const prio = m.ranked.filter(k => D[k].score !== null && D[k].band !== 'strength').slice(0, 3);
    if (!prio.length) push(`<p class="r-muted">${esc(t('pri_none'))}</p>`);
    else {
      push(`<p class="r-pri-intro">${esc(t('pri_intro'))}</p>`, { keep: true });
      prio.forEach((k, i) => {
        const ev = m.findings.filter(x => x.dom.includes(k) && ['high', 'mod', 'low'].includes(x.sev)).sort((a, b) => SEV_ORDER[a.sev] - SEV_ORDER[b.sev]).slice(0, 2);
        const exs = m.programme ? m.programme.items.filter(it => it.reasonDomains.includes(k) || it.primary === k).map(it => `<b>${it.id}</b> ${esc(t.ex(it.id).name)}`) : [];
        push(`<div class="r-pri band-${D[k].band}"><div class="r-pri-n">${i + 1}</div>
          <div class="r-pri-b"><div class="r-pri-h"><span>${esc(domName(k))}</span><b>${f(D[k].score)}<small>/100</small></b>${bandChip(D[k].band)}</div>
            ${ev.length ? `<ul>${ev.map(g => `<li>${sevChip(g.sev)}<span>${esc(findingText(g))}</span></li>`).join('')}</ul>` : ''}
            ${exs.length ? `<div class="r-pri-t"><i>${esc(t('pri_train'))}</i> ${exs.join(' · ')}</div>` : ''}</div></div>`);
      });
    }

    /* ===== 2. Domain profile ===== */
    head('s_domains', ++sec);
    push(`<div class="r-domain-wrap">
        <div class="r-radar">${chart('radar', { labels: FS.DOMAINS.map(domName), values: FS.DOMAINS.map(k => D[k].score), bands: FS.DOMAINS.map(k => D[k].band), peerLabel: t('peerAvg'), targetLabel: t('target'), w: 400, h: 390 })}</div>
        <div class="r-dcards">${FS.DOMAINS.map(k => `
          <div class="r-dcard band-${D[k].band}">
            <div class="r-dcard-ring">${chart('ring', { value: D[k].score, band: D[k].band, size: 96 })}</div>
            <div class="r-dcard-body"><div class="r-dcard-h">${esc(domName(k))}</div>${bandChip(D[k].band)}
              <div class="r-dcard-meta">${esc(t('conf'))}: <b>${esc(t('conf_' + D[k].confidence))}</b> · ${esc(t('cov'))}: <b>${D[k].coverage}%</b></div>
              <div class="r-dcard-d">${esc(t(k + '_d'))}</div></div>
          </div>`).join('')}</div>
      </div>`);

    push(`<div class="r-card"><div class="r-card-h">${esc(t('heat_h'))}</div>${chart('heatmap', {
        cols: FS.DOMAINS.map(domName), totalLabel: t('heat_total'), total: FS.DOMAINS.map(k => D[k].score), w: 720,
        rows: ['FSST', 'EMG_DB', 'EMG_TTT', 'BLAZEPOD', 'STS', 'TUG'].map(k => ({ label: t('st_' + k), cells: FS.DOMAINS.map(d => m.stations[k] ? { v: m.stations[k].ind[d] === null || m.stations[k].ind[d] === undefined ? null : FS.util.r1(m.stations[k].ind[d]), w: FS.STATION_DOMAIN_WEIGHTS[k][d] || 0 } : null) }))
      })}<div class="r-foot">${esc(t('heat_d'))}</div></div>`);

    /* ===== 3. Key gaps by domain ===== */
    head('s_gaps', ++sec);
    for (const k of FS.DOMAINS) {
      const fs = m.findings.filter(x => x.dom.includes(k));
      const gaps = fs.filter(x => ['high', 'mod', 'low'].includes(x.sev)).sort((a, b) => SEV_ORDER[a.sev] - SEV_ORDER[b.sev]).slice(0, 4);
      const pos = fs.filter(x => x.sev === 'pos').slice(0, 2);
      const contrib = D[k].contrib.map(cc => `${t('st_' + cc.station)} <b>${f(cc.score)}</b><i>×${cc.weight}%${cc.q < 1 ? ' · q' + cc.q : ''}</i>`).join(' · ');
      push(`<div class="r-gap band-${D[k].band}">
          <div class="r-gap-h"><div class="r-gap-name">${esc(domName(k))}</div><div class="r-gap-score">${f(D[k].score)}<small>/100</small></div>${bandChip(D[k].band)}</div>
          ${D[k].score === null ? `<p class="r-muted">${esc(t('notAssessed'))}</p>` : ''}
          <ul class="r-gap-list">${gaps.length ? gaps.map(g => `<li>${sevChip(g.sev)}<span>${esc(findingText(g))}</span></li>`).join('') : `<li class="r-muted">${esc(t('noGaps'))}</li>`}
            ${pos.map(g => `<li>${sevChip('pos')}<span>${esc(findingText(g))}</span></li>`).join('')}</ul>
          ${contrib ? `<div class="r-contrib"><span>${esc(t('contrib'))}:</span> ${contrib}</div>` : ''}
        </div>`);
    }

    /* ===== 4. Station results ===== */
    head('s_stations', ++sec);
    const stItems = ['FSST', 'EMG_DB', 'EMG_TTT', 'BLAZEPOD', 'STS', 'TUG'].map(k => ({ label: t('st_' + k), value: S[k] ? FS.util.r1(S[k].station) : null, band: S[k] ? FS.band(S[k].station) : 'na' }));
    push(`<div class="r-card"><div class="r-card-h">${esc(t('stationScore'))} (0–100)</div>${chart('hbars', { items: stItems, w: 720, labelW: 240 })}</div>`);
    // reference bullets
    const bl = [];
    if (S.FSST && S.FSST.data.timeS !== null) bl.push([t('st_FSST'), chart('bullet', { min: 0, max: 30, value: S.FSST.data.timeS, label: f(S.FSST.data.timeS) + ' s', bands: [[0, 10, 'strength'], [10, 15, 'moderate'], [15, 30, 'priority']], ticks: [0, 10, 15, 20, 30], unit: 's', w: 400 })]);
    if (S.TUG && S.TUG.data.timeS !== null) bl.push([t('st_TUG'), chart('bullet', { min: 0, max: 30, value: S.TUG.data.timeS, label: f(S.TUG.data.timeS) + ' s', bands: [[0, 10, 'strength'], [10, 13.5, 'monitor'], [13.5, 20, 'moderate'], [20, 30, 'priority']], ticks: [0, 10, 13.5, 20, 30], unit: 's', w: 400 })]);
    if (S.BLAZEPOD && S.BLAZEPOD.data.medianRtMs !== null) { const nm = S.BLAZEPOD.data.peerNormMs || 830; bl.push([t('st_BLAZEPOD') + ' · ' + t('m_medianRT'), chart('bullet', { min: 400, max: 1600, value: S.BLAZEPOD.data.medianRtMs, label: f(S.BLAZEPOD.data.medianRtMs, 0) + ' ms', bands: [[400, nm - 125, 'strength'], [nm - 125, nm + 125, 'monitor'], [nm + 125, nm + 375, 'moderate'], [nm + 375, 1600, 'priority']], ticks: [400, nm, 1600], unit: 'ms', w: 400 })]); }
    if (S.STS && S.STS.data.reps !== null) { const n = S.STS.parts.norm; bl.push([t('st_STS'), chart('bullet', { min: 0, max: 35, value: S.STS.data.reps, label: S.STS.data.reps + '', bands: [[0, n.lo, 'priority'], [n.lo, n.hi, 'monitor'], [n.hi, 35, 'strength']], ticks: [0, n.lo, n.hi, 35], unit: t('m_reps'), w: 400 })]); }
    if (S.TUG && S.TUG.data.gaitVel !== null) bl.push([t('m_gaitVel'), chart('bullet', { min: 0.4, max: 1.8, value: S.TUG.data.gaitVel, label: f(S.TUG.data.gaitVel, 2) + ' m/s', bands: [[0.4, 0.8, 'priority'], [0.8, 1.0, 'moderate'], [1.0, 1.8, 'strength']], ticks: [0.4, 0.8, 1.0, 1.4, 1.8], unit: 'm/s', w: 400 })]);
    if (S.FSST && S.FSST.data.stepCVpct !== null) bl.push([t('m_stepCV'), chart('bullet', { min: 0, max: 100, value: S.FSST.data.stepCVpct, label: f(S.FSST.data.stepCVpct) + '%', bands: [[0, 20, 'strength'], [20, 40, 'moderate'], [40, 100, 'priority']], ticks: [0, 20, 40, 100], unit: '%', w: 400 })]);
    for (let i = 0; i < bl.length; i += 2) push(`<div class="r-bullets">${bl.slice(i, i + 2).map(([l, cv]) => `<div class="r-bullet"><div class="r-bullet-h">${esc(l)}</div>${cv}</div>`).join('')}</div>`);


    /* ---- station deep-dive charts ---- */
    const ddHead = k => push(`<div class="r-dd-h"><span>${esc(t('st_' + k))}</span><p>${esc(t('dd_' + k))}</p></div>`, { keep: true });
    const card = (h, inner, cls = '') => `<div class="r-card ${cls}">${h ? `<div class="r-card-h">${esc(h)}</div>` : ''}${inner}</div>`;
    const FD0 = S.FSST && S.FSST.data;
    if (FD0) {
      ddHead('FSST');
      const pt = S.FSST.parts;
      const items = [['pf_time', pt.timeScore], ['pf_err', pt.errScore], ['pf_cv', pt.cvScore], ['pf_place', pt.placement], ['pf_agi', pt.agility], ['pf_stab', pt.stability]]
        .map(([k, v]) => ({ label: t(k), value: v === null || v === undefined ? null : FS.util.r1(v), band: v === null || v === undefined ? 'na' : FS.band(v) }));
      push(card(t('pf_h') + ' (0–100)', chart('hbars', { items, w: 720, labelW: 200 })));
      const two = [];
      if (FD0.lineTouches !== null || FD0.seqErrors !== null || FD0.hesitations !== null)
        two.push(card(t('m_errors'), chart('vbars', { items: [[t('err_touch'), FD0.lineTouches], [t('err_seq'), FD0.seqErrors], [t('err_hes'), FD0.hesitations]].map(([label, value]) => ({ label, value: value || 0, flag: (value || 0) > 0 })), max: Math.max(6, (FD0.lineTouches || 0) + 1), w: 340, h: 190 })));
      if (FD0.cwS && FD0.acwS) two.push(card(t('dir_h'), chart('vbars', { items: [{ label: t('dir_cw'), value: FD0.cwS }, { label: t('dir_acw'), value: FD0.acwS, flag: Math.abs(FD0.cwS - FD0.acwS) / Math.max(FD0.cwS, FD0.acwS) > 0.1 }], unit: ' s', dec: 1, w: 340, h: 190 })));
      if (two.length) push(`<div class="r-two">${two.join('')}</div>`);
    }
    const TD0 = S.TUG && S.TUG.data;
    if (TD0 && TD0.timeS) {
      const parts = [[t('ph_sts'), TD0.sitToStandS], [t('ph_walk'), null], [t('ph_cone'), TD0.aroundConeS], [t('ph_turn'), TD0.turnToSitS], [t('ph_sit'), TD0.toSitS]];
      const known = parts.reduce((a, [, v]) => a + (v || 0), 0), walk = TD0.timeS - known;
      parts[1][1] = walk > 0.05 ? walk : null;
      const segs = parts.filter(([, v]) => v !== null && v !== undefined && v > 0).map(([label, v]) => ({ label, v }));
      if (segs.length >= 3) { ddHead('TUG'); push(card(t('ph_h'), chart('phases', { segs, totalLabel: f(TD0.timeS, 1) + ' s', w: 720 }))); }
    }
    const SD0 = S.STS && S.STS.data;
    if (SD0 && SD0.trans && SD0.trans.avg) {
      ddHead('STS');
      const c3 = [];
      c3.push(card(t('sts_tempo_h'), chart('range', { min: SD0.trans.min, max: SD0.trans.max, avg: SD0.trans.avg, sd: SD0.trans.sd || 0, unit: 's', w: 300 }) + `<div class="r-foot">${esc(t('sts_tempo_l'))}</div>`));
      const ang = (o) => o && o.seated !== null && o.transition !== null && o.standing !== null ? [{ label: t('ang_seated'), value: o.seated }, { label: t('ang_trans'), value: o.transition }, { label: t('ang_stand'), value: o.standing }] : null;
      const hip = ang(SD0.hip), trk = ang(SD0.trunk);
      if (hip) c3.push(card(t('ang_hip') + ' (°)', chart('vbars', { items: hip, max: 180, unit: '°', w: 300, h: 190 })));
      if (trk) c3.push(card(t('ang_trunk') + ' (°)', chart('vbars', { items: trk.map(x => ({ ...x, flag: x.label === t('ang_trans') && x.value > 40 })), max: 60, unit: '°', w: 300, h: 190 })));
      push(`<div class="r-three">${c3.join('')}</div>`);
    }

    // station tiles
    const tile = (k, rows, score) => `<div class="r-tile ${S[k] || (k === 'MVC' && m.support.strength) || (k === 'MMSE' && m.support.cognition) ? '' : 'missing'}">
        <div class="r-tile-h"><span>${esc(t('st_' + k))}</span>${score !== undefined && score !== null ? `<b class="band-t-${FS.band(score)}">${f(score)}</b>` : ''}</div>
        ${rows ? `<table>${rows.map(([a, b, sev]) => `<tr><td>${esc(t(a))}</td><td class="${sev ? 'sv-' + sev : ''}">${b}</td></tr>`).join('')}</table>` : `<div class="r-missing">${esc(t('missingStation'))}</div>`}
      </div>`;
    const tiles = [];
    const FD = S.FSST && S.FSST.data;
    tiles.push(tile('FSST', FD ? [['m_time', f(FD.timeS) + ' s', FD.timeS > 15 ? 'high' : FD.timeS >= 10 ? 'mod' : 'pos'], ['m_agility', f(FD.agility, 0) + ' /100'], ['m_stability', f(FD.stability, 0) + ' /100', FD.stability < 35 ? 'high' : null],
      ['m_stepCV', f(FD.stepCVpct) + '%', FD.stepCVpct > 20 ? 'high' : null], ['m_errors', `${FD.lineTouches ?? '—'} / ${FD.seqErrors ?? '—'} / ${FD.hesitations ?? '—'}`], ['m_peakTrunk', f(FD.peakTrunkDeg) + '°'], ['m_nearFall', FD.nearFall ? esc(t('detected')) : esc(t('none')), FD.nearFall ? 'high' : 'pos']] : null, S.FSST && S.FSST.station));
    const emgRows = d => [['m_composite', f(d.composite) + ' /100'], ...(d.sub['Terrain Adaptability'] !== undefined ? [['m_terrain', f(d.sub['Terrain Adaptability']) + ' /100'], ['m_stepHeight', f(d.sub['Step Height']) + ' /100'], ['m_compMov', f(d.sub['Compensatory Movements']) + ' /100']] : []),
      ['m_calfSym', f(d.calfSym, 2), d.calfSym !== null && (d.calfSym < 0.65 || d.calfSym > 1.54) ? 'mod' : null], ['m_coact', f(d.coactL ?? d.coactR, 2), (d.coactL ?? 0) > 0.45 ? 'mod' : null],
      ['m_snr', Object.entries(d.ch).filter(([, x]) => x.snr !== null && x.snr < 10).map(([kk, x]) => `${kk} ${f(x.snr)} dB`).join(', ') || '0', Object.values(d.ch).some(x => x.snr !== null && x.snr < 10) ? 'mod' : 'pos']];
    tiles.push(tile('EMG_DB', S.EMG_DB ? emgRows(S.EMG_DB.data) : null, S.EMG_DB && S.EMG_DB.station));
    tiles.push(tile('EMG_TTT', S.EMG_TTT ? emgRows(S.EMG_TTT.data) : null, S.EMG_TTT && S.EMG_TTT.station));
    const BD = S.BLAZEPOD && S.BLAZEPOD.data;
    tiles.push(tile('BLAZEPOD', BD ? [['m_reaction', f(BD.score) + ' /100'], ['m_medianRT', f(BD.medianRtMs, 0) + ' ms'], ['m_accuracy', f(BD.accuracyPct, 0) + '%', BD.accuracyPct >= 95 ? 'pos' : null], ['m_percentile', BD.percentile !== null ? BD.percentile + '%' : '—']] : null, S.BLAZEPOD && S.BLAZEPOD.station));
    const SD = S.STS && S.STS.data;
    tiles.push(tile('STS', SD ? [['m_reps', SD.reps + '', SD.reps >= S.STS.parts.norm.lo ? 'pos' : 'high'], ['m_norm', `${S.STS.parts.norm.lo}–${S.STS.parts.norm.hi}`], ['m_transCV', S.STS.parts.cvT !== null ? f(S.STS.parts.cvT * 100, 0) + '%' : '—'], ['m_trunkTrans', f(SD.trunk.transition) + '°']] : null, S.STS && S.STS.station));
    const TD = S.TUG && S.TUG.data;
    tiles.push(tile('TUG', TD ? [['m_time', f(TD.timeS, 2) + ' s', TD.timeS > 13.5 ? 'high' : TD.timeS >= 10 ? 'mod' : 'pos'], ['m_gaitVel', f(TD.gaitVel, 2) + ' m/s', TD.gaitVel < 1 ? 'mod' : 'pos'], ['m_strideAsym', f(S.TUG.parts.asym) + '%', S.TUG.parts.asym > 10 ? 'mod' : 'pos'], ['strideLen', `${f(TD.strideLenL, 2)} / ${f(TD.strideLenR, 2)} m`]] : null, S.TUG && S.TUG.station));
    const MS = m.support.strength;
    tiles.push(tile('MVC', MS ? [['m_mvcL', f(MS.mvc.leftKg) + ' kg' + (MS.plausible ? '' : ' *'), MS.plausible ? null : 'mod'], ['m_mvcR', f(MS.mvc.rightKg) + ' kg' + (MS.plausible ? '' : ' *'), MS.plausible ? null : 'mod'], ['m_asym', f(MS.asym) + '%', MS.asym >= 30 ? 'high' : MS.asym >= 15 ? 'mod' : 'pos'], ['m_mvcNorm', MS.norm.mean + ' ± ' + MS.norm.sd + ' kg']] : null));
    const CG = m.support.cognition;
    tiles.push(tile('MMSE', CG ? [['m_mmse', `${CG.mmse.total ?? '—'} / ${CG.mmse.totalMax ?? '—'}` + (CG.valid ? '' : ' *'), CG.valid ? null : 'mod'], ['m_cog', esc(t('cog_' + CG.category)) + (CG.valid ? '' : ' *')],
      ...Object.entries(CG.mmse.domains).filter(([, v]) => v).map(([kk, v]) => [kk, `${v.score} / ${v.max}`, v.score > v.max ? 'high' : null])] : null));
    for (let i = 0; i < tiles.length; i += 2) push(`<div class="r-tiles">${tiles.slice(i, i + 2).join('')}</div>`);


    /* ===== EMG muscle activation ===== */
    const emgKeys = ['EMG_DB', 'EMG_TTT'].filter(k => S[k]);
    const emgWaves = emgKeys.filter(k => S[k].wave);
    if (emgKeys.length) {
      head('s_emg', ++sec);
      if (!emgWaves.length) push(`<p class="r-muted">${esc(t('emg_none'))}</p>`);
      else {
        push(`<p>${esc(t('emg_intro'))}</p><div class="r-note info">${esc(t('emg_read'))}</div>`);
        const chL = k => cap(t('ch_' + k));
        emgWaves.forEach(k => {
          const w = S[k].wave; const dd = S[k].data;
          push(`<div class="r-emg-h"><span>${esc(t(k === 'EMG_DB' ? 'emg_db_h' : 'emg_ttt_h'))}</span><b class="band-t-${FS.band(S[k].station)}">${f(S[k].station)}<small>/100</small></b></div>`, { keep: true });
          const labels = {}; w.keys.forEach(c => labels[c] = chL(c));
          const axisNote = w.tMax && w.durationS && Math.abs(w.tMax - w.durationS) / w.tMax > 0.2 ? `<div class="r-foot">${esc(t('emg_axis', { t: f(w.tMax, 0), d: f(w.durationS, 0) }))}</div>` : '';
          push(card(t('emg_wave_h'), chart('emgWave', { series: w.series, tMax: w.tMax || w.durationS || 1, labels, unit: 'µV', w: 720, h: 250 }) + axisNote));
          const hl = [];
          hl.push(`<li>${esc(t('emg_dom', { ch: chL(w.dom).toLowerCase(), p: f(w.ch[w.dom].share, 0) }))}</li>`);
          if (w.quad) hl.push(`<li>${esc(t('emg_bal_q', { l: w.quad.lShare, r: w.quad.rShare }))}</li>`);
          if (w.calf) hl.push(`<li>${esc(t('emg_bal_c', { l: w.calf.lShare, r: w.calf.rShare }))}</li>`);
          m.findings.filter(x => x.id === 'f_emg_wave' && x.station === k).forEach(g => hl.push(`<li>${sevChip(g.sev)} ${esc(findingText(g))}</li>`));
          m.dq.filter(q => q.station === k && ['dq_emg_flat', 'dq_emg_window'].includes(q.id)).forEach(q => hl.push(`<li class="r-hl-dq"><span class="r-chip dq-${q.sev}">${esc(t('dq_sev_' + q.sev))}</span> ${esc(dqText(q))}</li>`));
          push(`<div class="r-two r-emg-two">${card(t('emg_map_h'), chart('legmap', { ch: w.ch, leftLabel: t('left'), rightLabel: t('right'), quadLabel: cap(t('mus_quad')), calfLabel: cap(t('mus_calf')), w: 300, h: 290 }))}
            ${card('', `<ul class="r-hl">${hl.join('')}</ul>`)}</div>`);
          const rowsE = [];
          if (w.quad) rowsE.push({ label: cap(t('mus_quad')), L: w.quad.l, R: w.quad.r, unit: 'µV', flag: 33, lowconf: w.flat.includes('LQ') || w.flat.includes('RQ') });
          if (w.calf) rowsE.push({ label: cap(t('mus_calf')), L: w.calf.l, R: w.calf.r, unit: 'µV', flag: 33, lowconf: w.flat.includes('LC') || w.flat.includes('RC') });
          if (rowsE.length) push(card(t('emg_lr_h'), chart('symmetry', { rows: rowsE, leftLabel: t('left'), rightLabel: t('right'), w: 640 })));
          push(`<table class="r-table r-emgt"><thead><tr><th>${esc(t('emg_col_muscle'))}</th><th>${esc(t('emg_col_snr'))}</th><th>${esc(t('emg_col_mean'))}</th><th>${esc(t('emg_col_peak'))}</th><th>${esc(t('emg_col_share'))}</th></tr></thead><tbody>
            ${w.keys.map(c => { const x = w.ch[c]; return `<tr><td>${esc(chL(c))}</td><td class="${x.snr !== null && x.snr < 10 ? 'sv-mod' : ''}">${f(x.snr)} dB</td><td>${f(x.mean, 0)} µV</td><td>${f(x.peak, 0)} µV</td><td>${f(x.share, 0)}%</td></tr>`; }).join('')}</tbody></table>`);
        });
      }
    }

    /* ===== BlazePod reaction results ===== */
    if (S.BLAZEPOD && BD) {
      head('s_bp', ++sec);
      const cu = S.BLAZEPOD.cues, band = FS.band(S.BLAZEPOD.station);
      push(`<div class="r-emg-h"><span>${esc(t('st_BLAZEPOD'))}</span><b class="band-t-${band}">${f(S.BLAZEPOD.station)}<small>/100</small></b></div>`, { keep: true });
      push(`<p>${esc(t('dd_BLAZEPOD'))}</p>`);
      const kp = [['m_reaction', f(BD.score) + '<small>/100</small>', band], ['bp_avgrt', f(BD.avgRtMs, 0) + '<small> ms</small>'], ['m_medianRT', f(BD.medianRtMs, 0) + '<small> ms</small>'],
        ['bp_norm', BD.peerNormMs ? f(BD.peerNormMs, 0) + '<small> ms</small>' : '—'], ['m_percentile', BD.percentile !== null && BD.percentile !== undefined ? BD.percentile + '<small>%</small>' : '—'],
        ['m_accuracy', f(BD.accuracyPct, 0) + '<small>%</small>', BD.accuracyPct >= 95 ? 'strength' : 'moderate']];
      if (cu) kp.push(['bp_best', f(cu.best, 0) + '<small> ms</small>'], ['bp_slow', f(cu.worst, 0) + '<small> ms</small>']); else if (BD.rtCV !== null) kp.push(['bp_cv', f(BD.rtCV, 2)]);
      push(`<div class="r-stats">${kp.map(([k, v, b]) => `<div class="r-stat ${b ? 'band-' + b : ''}"><i>${esc(t(k))}</i><b>${v}</b></div>`).join('')}</div>`);
      if (cu) {
        push(card(t('bp_chart_h'), chart('cueline', { raw: cu.raw, env: cu.env, outIdx: cu.outIdx, avg: BD.avgRtMs, norm: BD.peerNormMs, unit: 'ms', labels: { raw: t('bp_raw'), env: t('bp_env'), avg: t('bp_avg'), norm: t('bp_normln'), out: t('bp_out'), cue: t('bp_cue') }, w: 720, h: 270 })));
        push(`<div class="r-note info">${esc(t('bp_read'))}</div>`);
      }
      const acc = BD.accuracyPct;
      const pr = [];
      if (BD.percentile !== null && BD.percentile !== undefined) pr.push(card(t('bp_pct_h'), chart('bullet', { min: 0, max: 100, value: BD.percentile, label: BD.percentile + '%', bands: [[0, 25, 'priority'], [25, 50, 'moderate'], [50, 75, 'monitor'], [75, 100, 'strength']], ticks: [0, 25, 50, 75, 100], unit: '%', w: 340 })));
      pr.push(card(t('m_accuracy'), `<div class="r-ringrow">${chart('ring', { value: acc, band: acc === null ? 'na' : acc >= 95 ? 'strength' : acc >= 85 ? 'monitor' : 'moderate', size: 96 })}<div class="r-ringtxt">${esc(t('bp_hits', { h: BD.hits ?? '—', m: BD.misses ?? '—', a: f(acc, 0) }))}</div></div>`));
      push(`<div class="r-two">${pr.join('')}</div>`);
      const bf = m.findings.filter(x => x.station === 'BLAZEPOD').sort((a, b) => SEV_ORDER[a.sev] - SEV_ORDER[b.sev]);
      if (bf.length) push(card('', `<ul class="r-hl">${bf.map(g => `<li>${sevChip(g.sev)} ${esc(findingText(g))}</li>`).join('')}</ul>`));
    }

    /* ===== MMSE / cognition ===== */
    if (CG) {
      head('s_mmse', ++sec);
      const cm = CG.mmse, cat = CG.category;
      const secs = cm.timeMs ? Math.round(cm.timeMs / 1000) : null, mmss = secs === null ? '—' : Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
      const cb = !CG.valid ? 'moderate' : cat === 'normal' ? 'strength' : cat === 'mild' ? 'moderate' : 'priority';
      push(`<div class="r-emg-h"><span>${esc(t('st_MMSE'))}</span><b class="band-t-${cb}">${cm.total ?? '—'}<small>/${cm.totalMax ?? '—'}${CG.valid ? '' : ' *'}</small></b></div>`, { keep: true });
      push(`<p>${esc(t('dd_MMSE'))}</p>`);
      const dualOK = !!(m.programme && m.programme.dualTask);
      push(`<div class="r-stats">${[['m_mmse', `${cm.total ?? '—'}<small>/${cm.totalMax ?? '—'}${CG.valid ? '' : ' *'}</small>`, cb], ['m_cog', cat ? esc(t('cog_' + cat)) + (CG.valid ? '' : ' *') : '—', cb], ['mm_time', mmss + '<small> min</small>'], ['mm_dual', esc(t(dualOK ? 'mm_dual_y' : 'mm_dual_n')), dualOK ? 'strength' : 'moderate']]
        .map(([k, v, b]) => `<div class="r-stat ${b ? 'band-' + b : ''}"><i>${esc(t(k))}</i><b class="r-stat-sm">${v}</b></div>`).join('')}</div>`);
      const ents = Object.entries(cm.domains).filter(([, v]) => v);
      if (ents.length) {
        const mi = ents.map(([k, v]) => { const pc = 100 * v.score / v.max; return { label: `${t(k)} ${v.score}/${v.max}`, value: FS.util.r1(Math.min(100, pc)), band: v.score > v.max ? 'priority' : pc >= 80 ? 'strength' : pc >= 60 ? 'monitor' : pc >= 40 ? 'moderate' : 'priority' }; });
        push(card(t('mm_domains_h'), chart('hbars', { items: mi, w: 720, labelW: 230 })));
        push(`<table class="r-table r-mmt"><thead><tr><th>${esc(t('mm_col_domain'))}</th><th>${esc(t('mm_col_score'))}</th><th>${esc(t('mm_col_status'))}</th></tr></thead><tbody>${ents.map(([k, v]) => `<tr><td>${esc(t(k))}</td><td>${v.score} / ${v.max}</td><td class="${v.score > v.max ? 'sv-high' : 'sv-pos'}">${esc(t(v.score > v.max ? 'mm_over' : 'mm_ok'))}</td></tr>`).join('')}</tbody></table>`);
      }
      if (!CG.valid) push(`<div class="r-note warn">${esc(t('mm_invalid', { m: cm.totalMax ?? '—' }))}</div>`);
      if (cat && CG.valid) push(`<div class="r-note info">${esc(t('mm_i_' + cat))}</div>`);
      push(`<p class="r-muted">${esc(t('mm_why'))}</p>`);
    }

    /* ===== 5. Limb symmetry ===== */
    const rows = [];
    if (TD && TD.strideLenL && TD.strideLenR) rows.push({ label: t('strideLen'), L: TD.strideLenL, R: TD.strideLenR, unit: 'm' });
    if (TD && TD.strideTimeL && TD.strideTimeR) rows.push({ label: t('strideTime'), L: TD.strideTimeL, R: TD.strideTimeR, unit: 's' });
    if (MS && MS.mvc.leftKg && MS.mvc.rightKg) rows.push({ label: t('legMVC'), L: MS.mvc.leftKg, R: MS.mvc.rightKg, unit: 'kg', flag: 15, lowconf: !MS.plausible });
    if (FD && FD.stepLenL && FD.stepLenR) rows.push({ label: t('stepLen'), L: FD.stepLenL, R: FD.stepLenR, unit: 'm', lowconf: true });
    if (rows.length) {
      head('s_limb', ++sec);
      push(`<div class="r-card">${chart('symmetry', { rows, leftLabel: t('left'), rightLabel: t('right'), w: 640 })}<div class="r-foot">* ${esc(t('lowconf').replace(/^ — /, ''))}</div></div>`);
    }

    /* ===== 6. Supporting factors ===== */
    if (MS || CG || S.STS) {
      head('s_support', ++sec);
      const strengthTxt = [];
      if (S.STS) strengthTxt.push(findingText(m.findings.find(x => x.id === 'f_sts_reps')));
      if (MS) { const fm = m.findings.find(x => x.id === 'f_mvc_asym'); if (fm) strengthTxt.push(findingText(fm)); }
      const cogTxt = CG ? findingText(m.findings.find(x => x.id === 'f_mmse')) : null;
      push(`<div class="r-two">
          <div class="r-card"><div class="r-card-h">${esc(t('sup_strength'))}</div>${strengthTxt.map(x => `<p>${esc(x)}</p>`).join('') || `<p class="r-muted">${esc(t('notAssessed'))}</p>`}</div>
          <div class="r-card"><div class="r-card-h">${esc(t('sup_cog'))}</div>${cogTxt ? `<p>${esc(cogTxt)}</p><p>${esc(m.programme && m.programme.dualTask ? t('dualOK') : t('dualNo'))}</p>` : `<p class="r-muted">${esc(t('notAssessed'))}</p>`}</div>
        </div>`);

      const supC = [];
      if (MS && MS.plausible) {
        const mu = MS.norm.mean, sd = MS.norm.sd, hi = Math.round(mu + 2.2 * sd);
        const bandsM = [[0, mu - 1.5 * sd, 'priority'], [mu - 1.5 * sd, mu - 0.5 * sd, 'moderate'], [mu - 0.5 * sd, mu + 0.5 * sd, 'monitor'], [mu + 0.5 * sd, hi, 'strength']];
        [['m_mvcL', MS.mvc.leftKg], ['m_mvcR', MS.mvc.rightKg]].forEach(([k, v]) => { if (v !== null && v !== undefined) supC.push(card(t(k), chart('bullet', { min: 0, max: hi, value: v, label: f(v) + ' kg', bands: bandsM, ticks: [0, Math.round(mu), hi], unit: 'kg', w: 340 }))); });
      }
      if (supC.length) { push(`<div class="r-dd-h"><span>${esc(t('st_MVC'))}</span><p>${esc(t('dd_MVC'))}</p></div>`, { keep: true }); push(`<div class="r-two">${supC.join('')}</div>`); }
    }

    /* ===== 7. Detailed findings ===== */
    head('s_findings', ++sec);
    const allF = m.findings.slice().sort((a, b) => SEV_ORDER[a.sev] - SEV_ORDER[b.sev]);
    for (let i = 0; i < allF.length; i += 6) {
      push(`<table class="r-table r-find"><colgroup><col style="width:12%"><col style="width:21%"><col style="width:15%"><col></colgroup><thead>${i === 0 ? `<tr><th></th><th>${esc(t('col_station'))}</th><th>${esc(t('targets'))}</th><th>${esc(t('col_finding'))}</th></tr>` : ''}</thead><tbody>${allF.slice(i, i + 6).map(fd => `
        <tr><td>${sevChip(fd.sev)}</td><td class="r-nowrap">${esc(t('st_' + fd.station))}</td><td class="r-nowrap">${fd.dom.map(d => esc(domName(d))).join('<br>')}</td><td>${esc(findingText(fd))}</td></tr>`).join('')}</tbody></table>`);
    }

    /* ===== 8. Data quality ===== */
    head('s_dq', ++sec);
    const dqs = m.dq.slice().sort((a, b) => SEV_ORDER[a.sev] - SEV_ORDER[b.sev]);
    if (!dqs.length) push(`<p class="r-muted">${esc(t('dq_none'))}</p>`);
    for (let i = 0; i < dqs.length; i += 6) {
      push(`<table class="r-table r-dq"><colgroup><col style="width:12%"><col style="width:21%"><col></colgroup><tbody>${dqs.slice(i, i + 6).map(q => `
        <tr><td><span class="r-chip dq-${q.sev}">${esc(t('dq_sev_' + q.sev))}</span></td><td class="r-nowrap">${q.station ? esc(t('st_' + q.station)) : '—'}</td><td>${esc(dqText(q))}</td></tr>`).join('')}</tbody></table>`);
    }

    /* ===== 9. Programme ===== */
    const pg = m.programme;
    if (pg) {
      head('s_programme', ++sec);
      const notes = [];
      if (pg.supervised) notes.push(['warn', t('supervised', { why: [pg.highRisk ? t('sup_high') : null, pg.nearFall ? t('sup_nearfall') : null].filter(Boolean).join(' / ') })]);
      notes.push(['info', pg.dualTask ? t('dualOK') : t('dualNo')]);
      if (pg.excludedAdvanced.length) notes.push(['info', t('advExcluded', { list: pg.excludedAdvanced.map(x => t.ex(x).name).join(', ') })]);
      push(`<div class="r-prog-intro">
          <p>${esc(t('supplement'))}</p>
          <div class="r-session">
            <div><b>${esc(t('sessions'))}</b><span>3</span></div><div><b>${esc(t('duration'))}</b><span>20–30 ${esc(t('min'))}</span></div>
            <div><b>${esc(t('rpe'))}</b><span>3 → 6 /10</span></div><div><b>${esc(t('rest'))}</b><span>45–60 s</span></div>
          </div>
          <ol class="r-structure"><li>${esc(t('warmup'))}</li><li>${esc(t('mainblock'))}</li><li>${esc(t('cooldown'))}</li></ol>
          ${notes.map(([k, x]) => `<div class="r-note ${k}">${esc(x)}</div>`).join('')}
        </div>`);

      // periodisation
      push(`<div class="r-period">
          <div class="r-card">${chart('load', { data: pg.load, weekLabel: wk, phase: FS.WEEKS.map(w => t(w.key)), setsLabel: t('load_sets'), levelLabel: t('load_level'), w: 420 })}</div>
          <div class="r-phases">${FS.WEEKS.map((w, i) => `<div class="r-phase"><div class="r-phase-h"><span>${esc(wk(i + 1))}</span><b>${esc(t(w.key))}</b><i>RPE ${w.rpe}</i></div><p>${esc(t(w.key + '_d'))}</p></div>`).join('')}</div>
        </div>`, { keepPrev: false });

      // calendar
      const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      push(`<div class="r-cal"><div class="r-cal-row r-cal-hd"><div></div>${days.map(d => `<div>${esc(t(d))}</div>`).join('')}</div>
        ${[1, 2, 3, 4].map(w => `<div class="r-cal-row"><div class="r-cal-w">${esc(wk(w))}</div>${days.map(d => pg.days.includes(d)
          ? `<div class="r-cal-on"><b>L${Math.round(pg.load[w - 1].level)}</b><span>${esc(t('sessionDay'))}</span></div>` : `<div class="r-cal-off">${esc(t('restDay'))}</div>`).join('')}</div>`).join('')}</div>`);

      // exercise cards
      head('s_selected', ++sec);
      const card = it => {
        const ex = t.ex(it.id); const E = FS.exById(it.id);
        const lv = [...new Set(it.weeks.map(w => w.level))];
        return `<div class="r-ex ${it.type}">
          <div class="r-ex-h"><span class="r-ex-id">${it.id}</span><div><div class="r-ex-name">${esc(ex.name)}</div><div class="r-ex-type">${esc(t(it.type))} · ${esc(t('selectedFor'))}: ${it.reasonDomains.map(d => esc(domName(d))).join(', ')}</div></div></div>
          <p class="r-ex-p">${esc(ex.purpose)}</p>
          ${lv.map(l => `<div class="r-ex-lv"><b>${esc(t('level'))} ${l} · ${esc(ex.levels[l - 1][0])}</b><span>${esc(ex.levels[l - 1][1])}</span></div>`).join('')}
          <div class="r-ex-meta"><div><i>${esc(t('adl'))}</i>${esc(ex.adl)}</div><div><i>${esc(t('muscles'))}</i>${esc(E.muscles)}</div></div>
        </div>`;
      };
      for (let i = 0; i < pg.items.length; i += 2) push(`<div class="r-exs">${pg.items.slice(i, i + 2).map(card).join('')}</div>`);

      // dose table
      head('s_schedule', ++sec);
      const dose = (it, w) => { const W = it.weeks[w]; return t('u_' + it.unit, { sets: W.sets, reps: W.reps, hold: W.hold }); };
      push(`<table class="r-table r-dose"><thead><tr><th>${esc(t('col_ex'))}</th>${[1, 2, 3, 4].map(w => `<th>${esc(wk(w))}<small>${esc(t(FS.WEEKS[w - 1].key))}</small></th>`).join('')}</tr></thead>
        <tbody>${pg.items.map(it => `<tr><td><b>${it.id}</b> ${esc(t.ex(it.id).name)}</td>${it.weeks.map((W, wi) => `<td><span class="r-lv">L${W.level}</span> ${esc(dose(it, wi))}</td>`).join('')}</tr>`).join('')}
        <tr class="r-dose-foot"><td>${esc(t('rpe'))} · ${esc(t('rest'))}</td>${FS.WEEKS.map(w => `<td>RPE ${w.rpe} · ${w.rest}</td>`).join('')}</tr></tbody></table>`);


      // re-test targets
      const T = [];
      m.ranked.filter(k => D[k].score !== null && D[k].score < 65).slice(0, 2).forEach(k => T.push([t('tg_domain', { d: domName(k) }), f(D[k].score), '≥ ' + f(Math.min(65, D[k].score + 8))]));
      if (FD && FD.timeS > 12) T.push([`${t('st_FSST')} · ${t('m_time')}`, f(FD.timeS) + ' s', '≤ ' + f(FD.timeS * 0.9) + ' s' + (FD.timeS > 15 ? ' (' + t('tg_ultimate', { v: '15 s' }) + ')' : '')]);
      if (FD) { const er = (FD.lineTouches || 0) + (FD.seqErrors || 0) + (FD.hesitations || 0); if (er >= 2) T.push([`${t('st_FSST')} · ${t('m_errors')}`, String(er), '≤ ' + Math.ceil(er / 2)]); }
      if (FD && FD.stepCVpct > 20) T.push([`${t('st_FSST')} · ${t('m_stepCV')}`, f(FD.stepCVpct) + '%', '≤ ' + f(Math.max(20, FD.stepCVpct * 0.8)) + '%']);
      const taT = S.EMG_TTT && S.EMG_TTT.parts.terrain; if (taT !== null && taT !== undefined && taT < 65) T.push([`${t('st_EMG_TTT')} · ${t('m_terrain')}`, f(taT) + ' /100', '≥ ' + f(Math.min(65, taT + 10))]);
      ['EMG_DB', 'EMG_TTT'].forEach(k => { const w = S[k] && S[k].wave; if (w && w.quad && w.quad.ratio >= 1.5 && !w.flat.includes('LQ') && !w.flat.includes('RQ')) T.push([`${t('st_' + k)} · ${cap(t('mus_quad'))} ${t('left')}/${t('right')}`, f(w.quad.l / w.quad.r, 2), t('tg_balance')]); });
      if (TD && TD.timeS >= 10) T.push([`${t('st_TUG')} · ${t('m_time')}`, f(TD.timeS) + ' s', '≤ ' + f(TD.timeS - 0.5) + ' s']);
      if (SD && SD.reps !== null && SD.reps < S.STS.parts.norm.hi) T.push([`${t('st_STS')} · ${t('m_reps')}`, String(SD.reps), '≥ ' + (SD.reps + 2)]);
      if (BD && BD.medianRtMs && BD.peerNormMs && BD.medianRtMs > BD.peerNormMs) T.push([`${t('st_BLAZEPOD')} · ${t('m_medianRT')}`, f(BD.medianRtMs, 0) + ' ms', '≤ ' + f(BD.medianRtMs * 0.95, 0) + ' ms']);
      if (T.length) {
        head('s_targets', ++sec);
        push(`<table class="r-table r-targets"><colgroup><col style="width:52%"><col style="width:20%"><col></colgroup><thead><tr><th>${esc(t('tg_col_metric'))}</th><th>${esc(t('tg_col_base'))}</th><th>${esc(t('tg_col_target'))}</th></tr></thead><tbody>
          ${T.slice(0, 8).map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td class="r-tg">${esc(r[2])}</td></tr>`).join('')}</tbody></table><div class="r-foot">${esc(t('tg_note'))}</div>`);
      }

      // progression / safety
      head('s_progression', ++sec);
      push(`<div class="r-three">
          <div class="r-card ok"><div class="r-card-h">${esc(t('prog_title'))}</div><ul>${['prog1', 'prog2', 'prog3', 'prog4'].map(k => `<li>${esc(t(k))}</li>`).join('')}</ul></div>
          <div class="r-card warn"><div class="r-card-h">${esc(t('reg_title'))}</div><ul>${['reg1', 'reg2'].map(k => `<li>${esc(t(k))}</li>`).join('')}</ul></div>
          <div class="r-card"><div class="r-card-h">${esc(t('safe_title'))}</div><ul>${['safe1', 'safe2'].map(k => `<li>${esc(t(k))}</li>`).join('')}</ul></div>
        </div>`);
    }

    /* ===== 10. Methodology & references ===== */
    head('s_method', ++sec);
    push(`<div class="r-method">${['m1', 'm2', 'm3', 'm4'].map(k => `<p>${esc(t(k))}</p>`).join('')}
      <table class="r-table r-wt"><thead><tr><th></th>${FS.DOMAINS.map(d => `<th>${esc(domName(d))}</th>`).join('')}</tr></thead><tbody>
      ${Object.entries(FS.STATION_DOMAIN_WEIGHTS).map(([k, w]) => `<tr><td>${esc(t('st_' + k))}</td>${FS.DOMAINS.map(d => `<td>${w[d] ? w[d] + '%' : '—'}</td>`).join('')}</tr>`).join('')}
      </tbody></table></div>`);
    head('s_refs', ++sec);
    for (let i = 0; i < FS.REFERENCES.length; i += 6) push(`<ol class="r-refs" start="${i + 1}">${FS.REFERENCES.slice(i, i + 6).map(r => `<li>${esc(r)}</li>`).join('')}</ol>`);
    push(`<div class="r-disclaimer">${esc(t('disclaimer'))}</div>`);

    return { blocks, jobs, t };
  };

  /* Draw all chart jobs that exist in the DOM */
  FS.drawJobs = function (jobs, scale) {
    for (const j of jobs) {
      const cv = document.getElementById(j.id); if (!cv) continue;
      FS.charts[j.type](cv, Object.assign({}, j.opts, scale ? { scale } : {}));
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
