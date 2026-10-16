/* Landing pública: widgets de TradingView en la cinta de cotizaciones y en el panel de la portada. */
(() => {
  const K = window.KAIROS;
  const tape = ["USTEC", "NQ", "ES", "YM", "GC", "CL", "EUR/USD", "GBP/USD", "USD/JPY", "BTC/USD", "ETH/USD"];

  tvWidget("tvTape", "ticker-tape", {
    symbols: tape.map(s => ({ proName: K.tv(s), title: s })),
    showSymbolLogo: false,
    displayMode: "adaptive",
  });

  tvWidget("tvHero", "mini-symbol-overview", {
    symbol: K.tv("NQ"),
    width: "100%",
    height: "100%",
    dateRange: "1D",
    trendLineColor: "rgba(227, 166, 64, 1)",
    underLineColor: "rgba(227, 166, 64, 0.15)",
    underLineBottomColor: "rgba(227, 166, 64, 0)",
    chartOnly: false,
    noTimeScale: false,
  });
})();
