/* Configuración general de Kairos.
   Cambia aquí el nombre, el precio o los símbolos de TradingView sin tocar el resto del código. */
window.KAIROS = {
  brand: "KAIROS",
  price: { amount: 77, currency: "€", period: "mes" },

  // Enlace de pago de Whop (producto "Kairos – Membresía", 77 €/mes).
  checkout: "https://whop.com/kairos-web-steel/kairos-membresia",

  // Curso exclusivo (Academia): pago único con acceso de por vida.
  // Pega aquí el enlace de pago del producto del curso en Whop.
  coursePrice: 299,
  checkoutCourse: "https://whop.com/kairos-web-steel/kairos-curso-exclusivo",

  // Invitación al servidor de Discord (no caduca).
  discord: "https://discord.gg/TAtJn24562",

  // Perfil de Instagram
  instagram: "https://www.instagram.com/kairos.desk/",

  // Fuente de los precios que muestran los widgets de TradingView:
  //  - "cfd":     CFD de OANDA y spot de cripto. En los widgets gratuitos suelen ir en tiempo real.
  //  - "futures": futuros de CME (MNQ1!, GC1!…). En los widgets gratuitos de TradingView van con unos 10 min de retraso.
  feed: "cfd",

  // s: código que ve el usuario. cfd/futures: símbolo de TradingView para cada fuente.
  instruments: [
    { s: "MNQ",     n: "Micro Nasdaq",   cfd: "OANDA:NAS100USD", futures: "CME_MINI:MNQ1!" },
    { s: "NQ",      n: "Nasdaq 100",     cfd: "OANDA:NAS100USD", futures: "CME_MINI:NQ1!" },
    { s: "USTEC",   n: "US Tech 100 Index", cfd: "ICMARKETS:USTEC", futures: "ICMARKETS:USTEC" },
    { s: "MES",     n: "Micro S&P 500",  cfd: "OANDA:SPX500USD", futures: "CME_MINI:MES1!" },
    { s: "ES",      n: "S&P 500",        cfd: "OANDA:SPX500USD", futures: "CME_MINI:ES1!" },
    { s: "MYM",     n: "Micro Dow",      cfd: "OANDA:US30USD",   futures: "CBOT_MINI:MYM1!" },
    { s: "YM",      n: "Dow",            cfd: "OANDA:US30USD",   futures: "CBOT_MINI:YM1!" },
    { s: "GC",      n: "Oro",            cfd: "OANDA:XAUUSD",    futures: "COMEX:GC1!" },
    { s: "MGC",     n: "Micro Oro",      cfd: "OANDA:XAUUSD",    futures: "COMEX:MGC1!" },
    { s: "CL",      n: "Crudo WTI",      cfd: "OANDA:WTICOUSD",  futures: "NYMEX:CL1!" },
    { s: "EUR/USD", n: "Euro / Dólar",   cfd: "OANDA:EURUSD",    futures: "CME:6E1!" },
    { s: "GBP/USD", n: "Libra / Dólar",  cfd: "OANDA:GBPUSD",    futures: "CME:6B1!" },
    { s: "USD/JPY", n: "Dólar / Yen",    cfd: "OANDA:USDJPY",    futures: "OANDA:USDJPY" },
    { s: "BTC/USD", n: "Bitcoin",        cfd: "BITSTAMP:BTCUSD", futures: "CME:BTC1!" },
    { s: "ETH/USD", n: "Ethereum",       cfd: "BITSTAMP:ETHUSD", futures: "CME:ETH1!" },
    { s: "SOL/USD", n: "Solana",         cfd: "COINBASE:SOLUSD", futures: "COINBASE:SOLUSD" },
  ],

  // Indicadores macro en vivo (pestaña Macro).
  // Los símbolos TVC (DXY, US10Y, VIX) no se pueden mostrar en los widgets gratuitos; se usan CFD equivalentes.
  macroQuotes: [
    { s: "Índice dólar (DXY)", tv: "CAPITALCOM:DXY" },
    { s: "Bono EE. UU. 10 años (precio)", tv: "OANDA:USB10YUSD" },
    { s: "Volatilidad (VIX)", tv: "CAPITALCOM:VIX" },
    { s: "Oro", tv: "OANDA:XAUUSD" },
    { s: "Crudo WTI", tv: "OANDA:WTICOUSD" },
  ],
};

window.KAIROS.tv = s => {
  const i = window.KAIROS.instruments.find(x => x.s === s);
  return i ? i[window.KAIROS.feed] : s;
};
