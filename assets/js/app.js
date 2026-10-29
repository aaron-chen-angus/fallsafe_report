/* FallSafe+ Report Generator — UI controller */
(function () {
  'use strict';
  const FS = window.FS;
  const $ = s => document.querySelector(s);
  const pdfjsLib = window['pdfjs-dist/build/pdf'];
  if (pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  const STATION_META = {
    FSST: { code: 'FSST', name: 'Four Square Step Test', doms: ['DB', 'CO'] },
    EMG_DB: { code: 'EMG · DB', name: 'Dynamic Balance Challenge', doms: ['DB', 'PR'] },
    EMG_TTT: { code: 'EMG · TTT', name: 'Terrain Trek Challenge', doms: ['PR', 'DB'] },
    BLAZEPOD: { code: 'BLAZEPOD', name: 'BlazePod Reaction', doms: ['CO'] },
    STS: { code: 'STS-30', name: '30-s Sit-to-Stand', doms: ['DB', 'SB'] },
    TUG: { code: 'TUG', name: 'Timed Up and Go', doms: ['DB', 'CO'] },
    MVC: { code: 'MVC', name: 'MVC Leg Strength', doms: ['STR'] },
    MMSE: { code: 'MMSE', name: 'MMSE Cognitive Screen', doms: ['COG'] }
  };

  const state = { parsed: {}, log: [], model: null, lang: 'en' };

  function renderSlots() {
    const n = Object.keys(state.parsed).length;
    $('#slots').innerHTML = FS.STATION_KEYS.map(k => {
      const p = state.parsed[k]; const meta = STATION_META[k];
      const cls = p ? 'ok' : (n ? 'miss' : '');
      const sub = p ? `${p.meta.name || ''} · ${p.meta.date || ''}${p.meta.time ? ' ' + p.meta.time : ''}` : (n ? 'Not provided' : 'Awaiting file');
      return `<div class="slot ${cls}"><span class="s-led"></span><div><div class="s-code">${meta.code}</div><div class="s-name">${meta.name}</div><div class="s-meta">${sub}</div></div>
        <div class="s-doms">${meta.doms.map(d => `<i>${d}</i>`).join('')}</div></div>`;
    }).join('');
    $('#slotCount').textContent = `${n} / 8 loaded`;
    $('#slotBar').style.width = (n / 8 * 100) + '%';
    $('#fileLog').innerHTML = state.log.map(l => `<li class="${l.ok ? '' : 'err'}"><b>${l.ok ? l.station : 'SKIPPED'}</b><span>${l.name}${l.msg ? ' — ' + l.msg : ''}</span></li>`).join('');
    $('#btnClear').disabled = !n && !state.log.length;
  }

  async function handleFiles(files) {
    if (!pdfjsLib) { toast('PDF engine failed to load — check your internet connection.'); return; }
    const list = [...files].filter(f => /\.pdf$/i.test(f.name) || f.type === 'application/pdf');
    if (!list.length) { toast('Please select FallSafe+ station PDF files.'); return; }
    for (const f of list) {
      try {
        const r = await FS.parsePdfFile(f, pdfjsLib);
        if (!r.ok) { state.log.unshift({ ok: false, name: f.name, msg: r.error === 'unrecognised' ? 'not recognised as a FallSafe+ station report' : r.error }); continue; }
        const replaced = !!state.parsed[r.station];
        state.parsed[r.station] = r;
        state.log.unshift({ ok: true, station: r.station, name: f.name, msg: replaced ? 'replaced previous file' : '' });
      } catch (e) {
        console.error(e); state.log.unshift({ ok: false, name: f.name, msg: 'could not read PDF' });
      }
    }
    renderSlots();
    analyse();
  }

  function analyse() {
    const parsed = Object.values(state.parsed);
    if (!parsed.length) { state.model = null; $('#report').innerHTML = ''; $('#toolbar').classList.add('hidden'); $('#empty').classList.remove('hidden'); return; }
    state.model = FS.analyse(parsed);
    $('#toolbar').classList.remove('hidden'); $('#empty').classList.add('hidden');
    renderReport();
  }

  async function renderReport() {
    const host = $('#report');
    host.className = `rpt dark lang-${state.lang}`;
    host.setAttribute('lang', { en: 'en', zh: 'zh-Hans', ms: 'ms', ta: 'ta' }[state.lang]);
    const { blocks, jobs } = FS.buildReport(state.model, state.lang, 'dark');
    host.innerHTML = blocks.map(b => `<div class="r-blk ${b.cls || ''}">${b.html}</div>`).join('');
    if (document.fonts) { try { await FS.ensureFonts(state.lang); } catch (e) { /* ignore */ } }
    FS.drawJobs(jobs);
  }

  $('#langSeg').addEventListener('click', e => {
    const b = e.target.closest('button[data-lang]'); if (!b) return;
    state.lang = b.dataset.lang;
    [...$('#langSeg').children].forEach(x => x.classList.toggle('on', x === b));
    if (state.model) renderReport();
  });

  $('#btnPdf').addEventListener('click', async () => {
    if (!state.model) return;
    if (!window.jspdf || !window.html2canvas) { toast('PDF libraries failed to load — check your internet connection.'); return; }
    const ov = $('#overlay'); ov.classList.remove('hidden');
    $('#ovTitle').textContent = 'Rendering PDF · ' + FS.LANGS[state.lang].langName;
    $('#ovMsg').textContent = 'Composing A4 pages…'; $('#ovBar').style.width = '0%';
    try {
      const fn = await FS.exportPdf(state.model, state.lang, $('#pdfHost'), p => {
        $('#ovBar').style.width = Math.round(p * 100) + '%';
        $('#ovMsg').textContent = p < 0.4 ? 'Composing A4 pages…' : 'Rasterising pages…';
      });
      toast('Saved ' + fn);
    } catch (e) { console.error(e); toast('PDF export failed: ' + e.message); }
    finally { ov.classList.add('hidden'); }
  });

  $('#btnJson').addEventListener('click', () => {
    if (!state.model) return;
    const blob = new Blob([JSON.stringify(state.model, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `FallSafe_Analysis_${(state.model.client.subjectId || 'client').replace(/[^\w-]+/g, '_')}.json`;
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });

  $('#btnClear').addEventListener('click', () => { state.parsed = {}; state.log = []; $('#fileInput').value = ''; renderSlots(); analyse(); });

  const drop = $('#drop');
  ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', e => handleFiles(e.dataTransfer.files));
  $('#fileInput').addEventListener('change', e => handleFiles(e.target.files));

  function toast(msg) {
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
    setTimeout(() => t.remove(), 3800);
  }

  renderSlots();
})();
