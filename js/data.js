/* Estado de datos compartido de Kairos (se carga antes que app.js, sections.js y sesion.js).
   Una sola fuente para todas las vistas:
     macro  → /api/macro, una única petición compartida; se refresca cada 10 min y al volver a la pestaña.
     levels → precio y niveles reales (/api/niveles), los publica la Sala de Mando cada 60 s.
     flow   → orderflow de cada instrumento (hoy de ejemplo), lo publica la Sala de Mando cada 3 s.
   Uso: KairosData.on("macro", fn) se ejecuta ya si hay dato y en cada actualización; KairosData.get("flow"). */
window.KairosData = (() => {
  const state = { macro: null, levels: {}, flow: {} }, subs = {};
  const MACRO_EVERY = 10 * 60 * 1000;
  let macroReq = null, macroTimer = null, macroAt = 0;

  const emit = k => (subs[k] || []).forEach(fn => { try { fn(state[k]); } catch (e) { console.error("[KairosData]", k, e); } });
  const has = k => (k === "macro" ? !!state.macro : Object.keys(state[k] || {}).length > 0);

  function on(k, fn) { (subs[k] ||= []).push(fn); if (has(k)) { try { fn(state[k]); } catch (e) { console.error(e); } } }
  const get = k => state[k];
  function set(k, v) { state[k] = v; emit(k); }

  // Petición única: si dos vistas la piden a la vez, comparten la misma promesa
  function loadMacro(force) {
    if (macroReq) return macroReq;
    if (!force && state.macro && Date.now() - macroAt < MACRO_EVERY) return Promise.resolve(state.macro);
    macroReq = fetch("/api/macro")
      .then(r => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))))
      .then(j => {
        if (!j?.assets || !j?.global) throw new Error("respuesta incompleta");
        // Solo se publica si es igual o más reciente que lo que ya hay
        if (!state.macro || j.generatedAt >= state.macro.generatedAt) { state.macro = j; macroAt = Date.now(); emit("macro"); }
        return state.macro;
      })
      .catch(e => { console.info("Macro en modo ejemplo:", e.message); return state.macro; })
      .finally(() => {
        macroReq = null;
        clearTimeout(macroTimer); macroTimer = setTimeout(() => loadMacro(true), state.macro ? MACRO_EVERY : 60000);
      });
    return macroReq;
  }
  document.addEventListener("visibilitychange", () => { if (!document.hidden) loadMacro(); });
  loadMacro();

  return { on, get, set, loadMacro };
})();
