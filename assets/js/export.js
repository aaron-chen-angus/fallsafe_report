/* FallSafe+ Report Generator — A4 PDF export
 * Blocks are flowed onto fixed 794×1123 px (A4 @96 dpi) pages, then rasterised page-by-page
 * with html2canvas (browser text shaping → correct Chinese and Tamil rendering) and assembled with jsPDF.
 */
(function (root) {
  'use strict';
  const FS = (root.FS = root.FS || {});
  const PAGE_W = 794, PAGE_H = 1123;

  const FONT_SAMPLES = {
    en: [['Orbitron', 'FallSafe+ 0123'], ['Inter', 'Report']],
    zh: [['Orbitron', 'FallSafe+ 0123'], ['Inter', 'Report'], ['Noto Sans SC', '平衡评估报告运动计划']],
    ms: [['Orbitron', 'FallSafe+ 0123'], ['Inter', 'Laporan']],
    ta: [['Orbitron', 'FallSafe+ 0123'], ['Inter', 'Report'], ['Noto Sans Tamil', 'சமநிலை அறிக்கை']]
  };
  FS.ensureFonts = async function (lang) {
    if (!document.fonts) return;
    const list = FONT_SAMPLES[lang] || FONT_SAMPLES.en;
    try {
      await Promise.all(list.flatMap(([fam, txt]) => ['400', '600', '700', '800'].map(w => document.fonts.load(`${w} 16px "${fam}"`, txt))));
      await document.fonts.ready;
    } catch (e) { /* fonts are best-effort; system fallbacks still render */ }
  };

  function pageShell(t, m, n, isFirst) {
    const p = document.createElement('div');
    p.className = 'pdf-page' + (isFirst ? ' first' : '');
    p.innerHTML = `
      <div class="pp-head">
        <div class="pp-logo"><span class="pp-mark"></span>FallSafe<b>+</b></div>
        <div class="pp-head-mid">${t('reportTitle')}</div>
        <div class="pp-head-r">${(m.client.name || '') + (m.client.subjectId ? ' · ' + m.client.subjectId.split('_')[1] : '')}<br>${m.client.date || ''}</div>
      </div>
      <div class="pp-body"></div>
      <div class="pp-foot"><span>${t('confidential')}</span><span class="pp-num"></span><span>fallsafe-plus.hpilab.net</span></div>`;
    return p;
  }

  FS.buildPdfPages = async function (model, lang, host, onProgress) {
    const { blocks, jobs, t } = FS.buildReport(model, lang, 'light');
    host.innerHTML = '';
    host.className = `rpt light lang-${lang} pdf-host`;
    const pages = [];
    let page = pageShell(t, model, 1, true); host.appendChild(page); pages.push(page);
    let body = page.querySelector('.pp-body');
    const drawIn = el => { const ids = [...el.querySelectorAll('canvas')].map(c => c.id); FS.drawJobs(jobs.filter(j => ids.includes(j.id)), 2.5); };
    const overflow = () => body.scrollHeight > body.clientHeight + 1;

    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      const el = document.createElement('div'); el.className = 'r-blk ' + (b.cls || ''); el.innerHTML = b.html;
      if (b.keep) el.dataset.keep = '1';
      body.appendChild(el); drawIn(el);
      if (overflow() && body.children.length > 1) {
        body.removeChild(el);
        // carry trailing section headers to the next page
        const carry = [];
        while (body.lastElementChild && body.lastElementChild.dataset.keep === '1') carry.unshift(body.removeChild(body.lastElementChild));
        page = pageShell(t, model, pages.length + 1, false); host.appendChild(page); pages.push(page);
        body = page.querySelector('.pp-body');
        carry.forEach(c => body.appendChild(c));
        body.appendChild(el);
      }
      if (onProgress) onProgress(0.4 * (i + 1) / blocks.length);
    }
    pages.forEach((p, i) => { p.querySelector('.pp-num').textContent = `${t('page')} ${i + 1} / ${pages.length}`; });
    return { pages, t };
  };

  FS.exportPdf = async function (model, lang, host, onProgress) {
    await FS.ensureFonts(lang);
    const { pages } = await FS.buildPdfPages(model, lang, host, onProgress);
    await new Promise(r => setTimeout(r, 60));
    const { jsPDF } = root.jspdf;
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
    for (let i = 0; i < pages.length; i++) {
      const canvas = await root.html2canvas(pages[i], { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false, width: PAGE_W, height: PAGE_H, windowWidth: PAGE_W });
      const img = canvas.toDataURL('image/jpeg', 0.93);
      if (i) pdf.addPage();
      pdf.addImage(img, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      if (onProgress) onProgress(0.4 + 0.6 * (i + 1) / pages.length);
    }
    const c = model.client;
    pdf.setProperties({ title: `FallSafe+ Assessment Report — ${c.name || ''}`, subject: 'FallSafe+ balance gap analysis and exercise programme', creator: 'FallSafe+ Assessment Report Generator' });
    const fn = `FallSafe_Report_${(c.subjectId || c.name || 'client').replace(/[^\w-]+/g, '_')}_${lang.toUpperCase()}.pdf`;
    pdf.save(fn);
    host.innerHTML = '';
    return fn;
  };
})(typeof window !== 'undefined' ? window : globalThis);
