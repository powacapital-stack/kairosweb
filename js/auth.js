/* Acceso al área de miembros: consulta /api/me y muestra la pantalla de acceso cuando hace falta.
   - Sin sesión: iniciar sesión con Whop o hacerse miembro.
   - Con sesión pero sin compras: hacerse miembro o actualizar el acceso.
   - Solo con el curso: entra únicamente en la Academia.
   La protección real del curso está en el servidor (/api/academia); esta pantalla solo ordena la experiencia. */
(() => {
  const K = window.KAIROS;
  const $ = id => document.getElementById(id);
  const here = () => location.pathname + location.hash;
  const loginUrl = () => "/api/auth/login?next=" + encodeURIComponent(here());
  const LOGIN_ERRORS = {
    cancelado: "Has cancelado el inicio de sesión.",
    caducado: "El inicio de sesión ha caducado. Vuelve a intentarlo.",
    error: "No hemos podido iniciar sesión con Whop. Vuelve a intentarlo en unos minutos.",
  };
  let user = null; // null mientras se comprueba

  const btn = (label, href, primary, extra = "") => `<a class="btn ${primary ? "primary" : ""}" href="${href}" ${extra}>${label}</a>`;
  const join = `${K.price.amount} ${K.price.currency}/${K.price.period}`;

  function gate(title, text, actions) {
    $("gateTitle").textContent = title;
    $("gateText").textContent = text;
    $("gateActions").innerHTML = actions.join("");
    $("gate").hidden = false;
    document.body.classList.add("gated");
  }
  function ungate() { $("gate").hidden = true; document.body.classList.remove("gated"); }

  // Lo llama app.js antes de cambiar de sección. Devuelve false si el usuario no puede verla.
  window.KairosGuard = view => {
    if (!user || !user.logged) return true;
    if (user.member || view === "academy") { if (user.member || user.course) ungate(); return true; }
    if (user.course) {
      gate("La Sala de Mando es para miembros", "Tu curso exclusivo incluye la Academia. Para usar la Sala de Mando, el calendario, la macro y el resto de herramientas necesitas la membresía mensual.",
        [btn(`Hazte miembro · ${join}`, K.checkout, true, 'target="_blank" rel="noopener"'), btn("Ir a la Academia", "#academy", false, 'data-close')]);
    }
    return false;
  };
  $("gateActions").addEventListener("click", e => { if (e.target.closest("[data-close]")) ungate(); });

  function render() {
    const err = new URLSearchParams(location.search).get("login");
    if (err) history.replaceState(null, "", location.pathname + location.hash);
    $("gateMsg").textContent = LOGIN_ERRORS[err] || "";

    if (!user.logged) {
      return gate("Accede a la Sala de Mando", "Inicia sesión con la cuenta de Whop con la que compraste tu membresía o el curso.",
        [btn("Iniciar sesión con Whop", loginUrl(), true), btn(`Hazte miembro · ${join}`, K.checkout, false, 'target="_blank" rel="noopener"'),
         '<a class="gate-back" href="index.html">← Volver a la web</a>']);
    }

    $("userChip").hidden = false;
    $("userName").textContent = user.name;
    if (user.picture) $("userPic").src = user.picture; else $("userPic").remove();

    if (!user.member && !user.course) {
      return gate(`Hola, ${user.name}`, "Tu cuenta de Whop todavía no tiene una membresía activa de Kairos. Si acabas de pagar, actualiza tu acceso.",
        [btn(`Hazte miembro · ${join}`, K.checkout, true, 'target="_blank" rel="noopener"'), btn("Ya pagué · actualizar acceso", loginUrl()),
         '<a class="gate-back" href="/api/auth/logout">Cerrar sesión</a>']);
    }

    ungate();
    // Solo con el curso: se le lleva a la Academia
    if (!user.member) {
      if (!location.hash) history.replaceState(null, "", location.pathname + "#academy");
      window.KairosShow?.(location.hash.slice(1));
    }
    else if (location.hash === "#academy") window.KairosViews?.academy?.();
  }

  fetch("/api/me", { cache: "no-store", credentials: "same-origin" })
    .then(r => (r.ok ? r.json() : { logged: false }))
    .catch(() => ({ logged: false }))
    .then(me => { user = me; window.KairosUser = me; render(); });
})();
