/* Inserta widgets gratuitos de TradingView.
   Documentación de cada widget: https://www.tradingview.com/widget-docs/ */
window.tvWidget = function (target, name, config) {
  const el = typeof target === "string" ? document.getElementById(target) : target;
  if (!el) return;
  el.innerHTML = "";
  const box = document.createElement("div");
  box.className = "tradingview-widget-container";
  box.style.height = "100%";
  box.style.width = "100%";
  const inner = document.createElement("div");
  inner.className = "tradingview-widget-container__widget";
  inner.style.height = "100%";
  box.appendChild(inner);
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.async = true;
  script.src = `https://s3.tradingview.com/external-embedding/embed-widget-${name}.js`;
  script.textContent = JSON.stringify({ colorTheme: "dark", isTransparent: true, locale: "es", ...config });
  box.appendChild(script);
  el.appendChild(box);
};
