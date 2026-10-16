/* =========================================================
   KAIROS · Landing futurista
   - Widgets de TradingView (cinta y gráfico del hero)
   - Tilt 3D con el ratón ([data-tilt])
   - Partículas en los botones ([data-particles])
   - Animaciones 3D con scroll (GSAP + ScrollTrigger)
   - Túnel 3D del showroom ([data-tunnel])
   ========================================================= */
(() => {
  const K = window.KAIROS;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);

  // Ajustes rápidos del 3D
  const CFG = {
    tiltMax: 10,          // grados de inclinación máxima con el ratón
    tunnelSpacing: 1400,  // distancia en Z entre paneles del túnel (px)
    tunnelScroll: 90,     // % de pantalla de scroll por panel (más = más lento)
    ringGap: 520,         // distancia en Z entre anillos del túnel
  };

  /* ---------- Widgets de TradingView ---------- */
  const tape = ["USTEC", "NQ", "ES", "YM", "GC", "CL", "EUR/USD", "GBP/USD", "USD/JPY", "BTC/USD", "ETH/USD"];
  tvWidget("tvTape", "ticker-tape", { symbols: tape.map(s => ({ proName: K.tv(s), title: s })), showSymbolLogo: false, displayMode: "adaptive" });
  tvWidget("tvHero", "mini-symbol-overview", {
    symbol: K.tv("USTEC"), width: "100%", height: "100%", dateRange: "1D", chartOnly: false, noTimeScale: false,
    trendLineColor: "rgba(0, 240, 255, 1)", underLineColor: "rgba(0, 240, 255, 0.18)", underLineBottomColor: "rgba(112, 0, 255, 0)",
  });

  /* ---------- Enlaces de Discord (desde config.js) ---------- */
  if (K.discord) document.querySelectorAll("[data-discord]").forEach(a => { a.href = K.discord; });

  /* ---------- Navegación y reloj ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const clock = document.querySelector("[data-clock]");
  const tick = () => { clock.textContent = new Date().toLocaleTimeString("es-ES", { timeZone: "Europe/Madrid" }); };
  tick(); setInterval(tick, 1000);

  /* ---------- Tilt 3D con el ratón ---------- */
  if (finePointer && !reduce) {
    document.querySelectorAll("[data-tilt]").forEach(el => {
      let raf = 0;
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.setProperty("--ry", ((x - .5) * 2 * CFG.tiltMax).toFixed(2) + "deg");
          el.style.setProperty("--rx", ((.5 - y) * 2 * CFG.tiltMax).toFixed(2) + "deg");
          el.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
          el.style.setProperty("--my", (y * 100).toFixed(1) + "%");
        });
      });
      el.addEventListener("pointerleave", () => { cancelAnimationFrame(raf); el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
    });
  }

  /* ---------- Partículas en los botones ---------- */
  if (finePointer && !reduce) {
    let live = 0, last = 0;
    document.querySelectorAll("[data-particles]").forEach(btn => btn.addEventListener("pointermove", e => {
      const now = performance.now(); if (now - last < 35 || live > 40) return; last = now;
      const p = document.createElement("span"); p.className = "spark-dot";
      p.style.left = e.clientX + "px"; p.style.top = e.clientY + "px";
      if (Math.random() > .5) { p.style.background = "#8b5cff"; p.style.boxShadow = "0 0 8px #8b5cff"; }
      document.body.appendChild(p); live++;
      const a = Math.random() * Math.PI * 2, d = 30 + Math.random() * 50;
      p.animate([{ transform: "translate(-50%,-50%) scale(1)", opacity: 1 }, { transform: `translate(${Math.cos(a) * d - 2}px, ${Math.sin(a) * d - 2}px) scale(0)`, opacity: 0 }],
        { duration: 600 + Math.random() * 400, easing: "cubic-bezier(.2,.7,.3,1)" }).onfinish = () => { p.remove(); live--; };
    }));
  }

  /* ---------- Contadores ---------- */
  function countUp(el) {
    const to = +el.dataset.count, t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  /* ---------- Sin GSAP o con movimiento reducido: versión estática ---------- */
  const showroom = document.getElementById("showroom");
  if (!hasGsap || reduce) { showroom.classList.add("no-tunnel"); return; }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  // Entrada del hero
  gsap.from(".hero-line", { yPercent: 60, rotateX: -70, opacity: 0, duration: 1.1, ease: "power4.out", stagger: .12, transformOrigin: "50% 100%" });
  gsap.from([".hero-copy .eyebrow", ".lead", ".ctas", ".stats"], { y: 24, opacity: 0, duration: .9, ease: "power3.out", stagger: .08, delay: .35 });
  gsap.from(".holo", { z: -400, rotateY: -50, opacity: 0, duration: 1.4, ease: "power3.out", delay: .2, clearProps: "transform,opacity" });
  document.querySelectorAll("[data-count]").forEach(countUp);

  // Al bajar, el título se aleja en Z y se inclina; el holograma gira
  gsap.to("[data-hero-copy]", { rotateX: 28, z: -260, opacity: .15, ease: "none", transformOrigin: "50% 0%",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero-visual", { rotateY: 25, z: -200, y: 120, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  // Cabeceras y bloques que aparecen
  gsap.utils.toArray("[data-reveal]").forEach(el => gsap.from(el, {
    y: 50, opacity: 0, rotateX: -18, transformPerspective: 900, duration: 1, ease: "power3.out",
    scrollTrigger: { trigger: el, start: "top 85%", once: true }, clearProps: "transform,opacity" }));

  // Tarjetas: se despliegan desde el fondo del eje Z
  gsap.from(".card3d", { y: 90, z: -320, rotateX: -55, opacity: 0, duration: 1.1, ease: "power3.out",
    stagger: { each: .09, grid: "auto", from: "start" }, transformPerspective: 1000,
    scrollTrigger: { trigger: "[data-cards]", start: "top 80%", once: true },
    clearProps: "transform" });

  // Pasos: línea que se llena y tarjetas que giran
  gsap.fromTo("[data-steps-line]", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: "[data-steps]", start: "top 80%", end: "bottom 60%", scrub: true } });
  gsap.from(".step", { rotateY: -70, x: -40, opacity: 0, transformPerspective: 900, transformOrigin: "0% 50%", duration: 1, ease: "power3.out", stagger: .15,
    scrollTrigger: { trigger: "[data-steps]", start: "top 80%", once: true } });

  /* ---------- Túnel 3D del showroom ---------- */
  const tunnel = document.querySelector("[data-tunnel]");
  const panels = [...tunnel.querySelectorAll("[data-panel]")];
  const title = document.querySelector("[data-tunnel-title]");
  const bar = document.querySelector("[data-tunnel-bar]");
  const mobile = window.innerWidth < 700;
  const S = CFG.tunnelSpacing, START = 900;
  const travel = START + (panels.length - 1) * S + 700;

  const depth = panels.map((p, i) => -(START + i * S));
  panels.forEach((p, i) => { p.style.transform = `translate3d(${mobile ? 0 : (i % 2 ? 14 : -14)}vw, 0, ${depth[i]}px)`; });

  const rings = [];
  const ringCount = Math.ceil((travel + 3000) / CFG.ringGap / (mobile ? 1.6 : 1));
  for (let i = 0; i < ringCount; i++) {
    const r = document.createElement("div"); r.className = "ring";
    const z = -300 - i * CFG.ringGap * (mobile ? 1.6 : 1);
    r.style.transform = `translateZ(${z}px) rotate(${i * 7}deg)`; r.dataset.z = z;
    tunnel.insertBefore(r, tunnel.firstChild); rings.push(r);
  }

  const state = { z: 0 };
  let active = -1;
  function renderTunnel() {
    const z = state.z;
    tunnel.style.transform = `translate3d(0,0,${z.toFixed(1)}px)`;
    let best = 0, bestD = Infinity;
    panels.forEach((p, i) => {
      const rel = depth[i] + z; // 0 = plano de la pantalla, > 0 = detrás de la cámara
      let o = 0;
      if (rel > -2600 && rel < -1600) o = (rel + 2600) / 1000;
      else if (rel >= -1600 && rel <= 120) o = 1;
      else if (rel > 120 && rel < 520) o = 1 - (rel - 120) / 400;
      p.style.opacity = o.toFixed(3);
      p.style.visibility = o > 0 ? "visible" : "hidden";
      const d = Math.abs(rel + 350); if (d < bestD) { bestD = d; best = i; }
    });
    rings.forEach(r => {
      const rel = +r.dataset.z + z;
      const o = rel > 200 ? 0 : rel < -4200 ? 0 : rel < -3000 ? (rel + 4200) / 1200 : rel > -100 ? (200 - rel) / 300 : 1;
      r.style.opacity = o.toFixed(3);
    });
    if (best !== active) { active = best; title.textContent = panels[best].dataset.title; }
  }

  gsap.to(state, {
    z: travel, ease: "none", onUpdate: () => { renderTunnel(); },
    scrollTrigger: {
      trigger: "[data-tunnel-stage]", start: "top top", end: () => "+=" + (panels.length * CFG.tunnelScroll / 100 * window.innerHeight),
      pin: true, scrub: .8, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: self => { bar.style.transform = `scaleX(${self.progress.toFixed(3)})`; },
    },
  });
  renderTunnel();
})();
