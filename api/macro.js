/* GET /api/macro — Inteligencia macro real de Kairos.
   1) Descarga datos de FRED y calcula los motores (api/_lib/macro-core.js).
   2) Claude redacta el sesgo, la convicción y el resumen de cada activo.
   La respuesta se guarda en la caché de Vercel 6 horas: como mucho unas 4 llamadas a Claude al día.

   Variables de entorno (en Vercel → Settings → Environment Variables):
     FRED_API_KEY       obligatoria, gratuita: https://fred.stlouisfed.org/docs/api/api_key.html
     ANTHROPIC_API_KEY  opcional: con ella redacta Claude; sin ella se usa el análisis por reglas (gratis)                                   */

const sdk = require("@anthropic-ai/sdk");
const Anthropic = sdk.default || sdk;
const { fetchAll, computeFeatures, dirOf } = require("./_lib/macro-core");
const { analyzeByRules } = require("./_lib/macro-rules");

const MODEL = "claude-opus-5-5";
const ASSET_KEYS = ["NASDAQ", "DOW", "SP500", "GOLD", "OIL", "EURUSD", "GBPUSD", "USDJPY"];
// Activo de la web → clave del análisis
const UI_ASSETS = { MNQ: "NASDAQ", NQ: "NASDAQ", USTEC: "NASDAQ", MYM: "DOW", ES: "SP500", GC: "GOLD", CL: "OIL", "EUR/USD": "EURUSD", "GBP/USD": "GBPUSD", "USD/JPY": "USDJPY" };
const DRIVER_NAMES = ["Rendimientos EE. UU.", "Dólar (USD)", "Liquidez", "Crecimiento", "Inflación"];

const driverSchema = {
  type: "object",
  properties: {
    name: { type: "string", enum: DRIVER_NAMES },
    state: { type: "string" },
    impact: { type: "string", enum: ["Positivo", "Negativo", "Neutral"] },
    note: { type: "string" },
  },
  required: ["name", "state", "impact", "note"],
  additionalProperties: false,
};
const assetSchema = {
  type: "object",
  properties: {
    bias: { type: "string", enum: ["Alcista", "Bajista", "Neutral"] },
    conviction: { type: "integer" },
    key_driver: { type: "string" },
    drivers: { type: "array", items: driverSchema },
    brief: { type: "string" },
  },
  required: ["bias", "conviction", "key_driver", "drivers", "brief"],
  additionalProperties: false,
};
const outputSchema = {
  type: "object",
  properties: {
    regime: { type: "string", enum: ["RISK-ON", "RISK-OFF", "NEUTRAL"] },
    conviction: { type: "integer" },
    primary_driver: { type: "string" },
    macro_bias: { type: "string" },
    risk_window: { type: "string" },
    brief: { type: "string" },
    assets: {
      type: "object",
      properties: Object.fromEntries(ASSET_KEYS.map(k => [k, assetSchema])),
      required: ASSET_KEYS,
      additionalProperties: false,
    },
  },
  required: ["regime", "conviction", "primary_driver", "macro_bias", "risk_window", "brief", "assets"],
  additionalProperties: false,
};

const SYSTEM = `Eres el analista macro de Kairos, una plataforma en español para traders de futuros del Nasdaq, S&P 500, Dow, oro, crudo y forex.
Recibes datos reales de la Reserva Federal (FRED) ya resumidos y el estado de cinco motores macro calculado con reglas fijas.
Tu trabajo es decidir, para cada activo, el sesgo macro (Alcista, Bajista o Neutral), la convicción (entero de 0 a 100) y el impacto de cada motor en ESE activo.

Reglas:
- Basa todo en los datos recibidos. No inventes cifras, eventos ni noticias que no estén en los datos.
- Para cada activo devuelve exactamente los cinco motores, en este orden: ${DRIVER_NAMES.join(", ")}. Copia el campo "state" tal como viene en los datos.
- El impacto depende del activo: por ejemplo, un dólar que se fortalece es negativo para EUR/USD y para el oro, pero positivo para USD/JPY.
- Convicción: 0-39 baja, 40-59 media, 60-100 alta. Si los motores se contradicen, baja la convicción y considera Neutral.
- El oro no tiene serie de precio en los datos: su "tendencia" es el rendimiento real a 10 años invertido.
- Escribe en español de España, claro y directo, sin promesas de ganancias ni recomendaciones de compra o venta. Es información, no asesoramiento.
- "brief" de cada activo: 2-3 frases. "brief" global: 3-4 frases. "note" de cada motor: una frase corta.
- "risk_window" describe en pocas palabras cuándo hay más riesgo (por ejemplo "Apertura de Nueva York" o "Datos de inflación").`;

function regimeDir(key, regime) {
  if (regime === "Neutral") return "Neutral";
  const on = regime === "Risk-on";
  if (key === "GOLD") return on ? "Neutral" : "Alcista";
  if (key === "USDJPY") return on ? "Alcista" : "Bajista";
  return on ? "Alcista" : "Bajista"; // índices, crudo y EUR/GBP frente al dólar refugio
}

module.exports = async (req, res) => {
  const fredKey = process.env.FRED_API_KEY;
  if (!fredKey) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(503).json({ error: "not_configured", message: "Falta FRED_API_KEY en Vercel." });
  }
  const useAI = !!process.env.ANTHROPIC_API_KEY;

  try {
    const { data, missing } = await fetchAll(fredKey);
    if (!data.DGS10.length || !data.SP500.length) throw new Error("FRED no devolvió datos (revisa FRED_API_KEY).");
    const f = computeFeatures(data);

    let ai, model = "reglas";
    if (!useAI) {
      ai = analyzeByRules(f);
    } else {
    const client = new Anthropic();
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: { type: "json_schema", schema: outputSchema } },
      system: SYSTEM,
      messages: [{
        role: "user",
        content: `Datos macro a ${f.asOf} (FRED). Analiza y devuelve el JSON.\n\n` + JSON.stringify({
          motores: f.drivers, rendimientos: f.yields, rendimiento_real: f.realYield10y, inflacion_implicita: f.breakeven10y,
          dolar: f.dollar, vix: f.vix, diferencial_high_yield: f.hySpread, balance_fed: f.fedBalance,
          inflacion: f.inflation, empleo: f.labor, politica_monetaria: f.policy, regimen_riesgo_hoy: f.regimeToday,
          tendencias_activos: f.assets,
        }),
      }],
    });

    if (response.stop_reason === "refusal") throw new Error("El modelo rechazó la petición.");
    if (response.stop_reason === "max_tokens") throw new Error("Respuesta incompleta (max_tokens).");
    const text = response.content.filter(b => b.type === "text").map(b => b.text).join("");
    ai = JSON.parse(text);
    model = response.model;
    }

    const alLabels = ["Macro", "Tendencia 20d", "Momento 5d", "Régimen"];
    const assets = {};
    for (const [ui, key] of Object.entries(UI_ASSETS)) {
      const a = ai.assets[key], t = f.assets[key];
      const th = key === "GOLD" ? 10 : /USD/.test(key) ? 0.5 : 1; // umbral: pb para el oro, % para el resto
      assets[ui] = {
        bias: a.bias,
        conv: Math.max(0, Math.min(100, Math.round(a.conviction))),
        key: a.key_driver,
        dr: a.drivers.map(d => [d.name, d.state, d.impact, d.note]),
        brief: a.brief,
        al: [a.bias, dirOf(t.chg20d_pct, th), dirOf(t.chg5d_pct, th / 2), regimeDir(key, f.regimeToday)],
        alLabels,
        trend: t,
      };
    }

    res.setHeader("Cache-Control", "public, s-maxage=21600, stale-while-revalidate=86400");
    return res.status(200).json({
      generatedAt: new Date().toISOString(),
      asOf: f.asOf,
      engine: useAI ? "ia" : "reglas",
      model,
      missingSeries: missing,
      global: {
        regime: ai.regime, conviction: Math.max(0, Math.min(100, Math.round(ai.conviction))),
        primaryDriver: ai.primary_driver, macroBias: ai.macro_bias, riskWindow: ai.risk_window, brief: ai.brief,
        scores: f.globalScores, regimeHistory: f.regimeHistory, policy: f.policy, correlation: f.correlation,
      },
      assets,
    });
  } catch (err) {
    console.error("[api/macro]", err);
    res.setHeader("Cache-Control", "no-store");
    const status = err instanceof Anthropic.RateLimitError ? 429 : 502;
    return res.status(status).json({ error: "macro_failed", message: String(err.message || err) });
  }
};
