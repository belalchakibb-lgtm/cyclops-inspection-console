/* CYCLOPS voice choice, shared by the 3D videos, the course slides, the video guide and the study guide.
   Uses the voices already on the device (free). Natural / neural voices are ranked first, and the voice a person
   picks is remembered per language on that device. On Windows, Microsoft Edge offers very natural free voices.
   window.CYVOICE = { list(code), pick(code), choose(code, name), chosen(code) }  code: 'en' or 'fr' */
(function () {
  'use strict';
  const KEY = 'cyclops-voice-';
  const synth = () => (typeof speechSynthesis !== 'undefined' ? speechSynthesis : null);
  const score = (v, code) => {
    const n = v.name || '';
    let s = 0;
    if (/natural/i.test(n)) s += 50;
    else if (/neural|online|premium|enhanced/i.test(n)) s += 40;
    else if (/google/i.test(n)) s += 30;
    const lang = String(v.lang || '').toLowerCase();
    if (lang === (code === 'fr' ? 'fr-fr' : 'en-us') || (code === 'en' && lang === 'en-gb')) s += 5;
    if (v.localService === false) s += 1; // online voices are usually the more natural ones
    return s;
  };
  function list(code) {
    const s = synth(); if (!s) return [];
    const all = (s.getVoices() || []).filter((v) => v.lang && String(v.lang).toLowerCase().startsWith(code));
    return all.sort((a, b) => score(b, code) - score(a, code) || String(a.name).localeCompare(String(b.name)));
  }
  function chosen(code) { try { return localStorage.getItem(KEY + code) || ''; } catch { return ''; } }
  function choose(code, name) { try { if (name) localStorage.setItem(KEY + code, name); else localStorage.removeItem(KEY + code); } catch { /* storage unavailable */ } }
  function pick(code) {
    const l = list(code), want = chosen(code);
    return (want && l.find((v) => v.name === want)) || l[0] || null;
  }
  const label = (v) => `${/natural|neural|online|premium|enhanced/i.test(v.name) ? '★ ' : ''}${v.name} (${v.lang})`;
  window.CYVOICE = { list, pick, choose, chosen, label, score };
}());
