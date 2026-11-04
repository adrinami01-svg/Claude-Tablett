/* Paper-Trading-Engine: Indikatoren, Strategien, Konto, Backtest.
   Reine Funktionen ohne DOM – läuft im Browser (window.PT) und in Node (require). */
(function (root) {
  "use strict";

  /* ---------- Indikatoren ---------- */
  function sma(v, n) {
    var out = new Array(v.length).fill(null), s = 0;
    for (var i = 0; i < v.length; i++) {
      s += v[i]; if (i >= n) s -= v[i - n];
      if (i >= n - 1) out[i] = s / n;
    }
    return out;
  }
  function ema(v, n) {
    var out = new Array(v.length).fill(null), k = 2 / (n + 1), e = null;
    for (var i = 0; i < v.length; i++) {
      if (i === n - 1) { var s = 0; for (var j = 0; j < n; j++) s += v[j]; e = s / n; }
      else if (i >= n) e = v[i] * k + e * (1 - k);
      out[i] = e;
    }
    return out;
  }
  function rsi(v, n) {
    var out = new Array(v.length).fill(null), g = 0, l = 0;
    for (var i = 1; i < v.length; i++) {
      var d = v[i] - v[i - 1], up = d > 0 ? d : 0, dn = d < 0 ? -d : 0;
      if (i <= n) { g += up; l += dn; if (i === n) { g /= n; l /= n; } }
      else { g = (g * (n - 1) + up) / n; l = (l * (n - 1) + dn) / n; }
      if (i >= n) out[i] = l === 0 ? 100 : 100 - 100 / (1 + g / l);
    }
    return out;
  }
  function highest(v, n, i) { var m = -Infinity; for (var j = Math.max(0, i - n + 1); j <= i; j++) m = Math.max(m, v[j]); return m; }
  function lowest(v, n, i) { var m = Infinity; for (var j = Math.max(0, i - n + 1); j <= i; j++) m = Math.min(m, v[j]); return m; }

  /* ---------- Strategien ----------
     Jede Strategie bekommt geschlossene Kerzen und ob eine Position offen ist,
     und gibt {action: "buy"|"sell"|"hold", reason} für die LETZTE Kerze zurück. */
  var STRATEGIES = {
    sma: {
      name: "Trendfolge (SMA 20/50 Kreuzung)", warmup: 51,
      fn: function (c, hasPos) {
        var cl = c.map(function (x) { return x.c; }), f = sma(cl, 20), s = sma(cl, 50), i = cl.length - 1;
        if (f[i - 1] == null || s[i - 1] == null) return { action: "hold", reason: "zu wenig Daten" };
        if (!hasPos && f[i - 1] <= s[i - 1] && f[i] > s[i]) return { action: "buy", reason: "SMA20 kreuzt SMA50 nach oben" };
        if (hasPos && f[i - 1] >= s[i - 1] && f[i] < s[i]) return { action: "sell", reason: "SMA20 kreuzt SMA50 nach unten" };
        return { action: "hold", reason: "kein Kreuz" };
      }
    },
    rsi: {
      name: "Rücksetzer kaufen (RSI 14, nur im Aufwärtstrend)", warmup: 201,
      fn: function (c, hasPos) {
        var cl = c.map(function (x) { return x.c; }), r = rsi(cl, 14), t = sma(cl, 200), i = cl.length - 1;
        if (r[i - 1] == null || t[i] == null) return { action: "hold", reason: "zu wenig Daten" };
        if (!hasPos && cl[i] > t[i] && r[i - 1] < 30 && r[i] >= 30) return { action: "buy", reason: "RSI dreht über 30, Kurs über SMA200" };
        if (hasPos && r[i] > 70) return { action: "sell", reason: "RSI über 70" };
        return { action: "hold", reason: "RSI " + r[i].toFixed(0) };
      }
    },
    breakout: {
      name: "Ausbruch (Donchian 20/10)", warmup: 22,
      fn: function (c, hasPos) {
        var hi = c.map(function (x) { return x.h; }), lo = c.map(function (x) { return x.l; }), i = c.length - 1;
        if (i < 21) return { action: "hold", reason: "zu wenig Daten" };
        if (!hasPos && c[i].c > highest(hi, 20, i - 1)) return { action: "buy", reason: "Schluss über 20-Kerzen-Hoch" };
        if (hasPos && c[i].c < lowest(lo, 10, i - 1)) return { action: "sell", reason: "Schluss unter 10-Kerzen-Tief" };
        return { action: "hold", reason: "im Kanal" };
      }
    }
  };

  /* ---------- Konto ---------- */
  var DEFAULT_OPTS = { feePct: 0.1, slipPct: 0.05, riskPct: 1, stopPct: 3, takePct: 6, maxPosPct: 25 };

  function newAccount(capital) {
    return { start: capital, cash: capital, pos: {}, trades: [], equity: [] };
  }
  function equityOf(acc, prices) {
    var e = acc.cash;
    for (var s in acc.pos) e += acc.pos[s].qty * (prices[s] != null ? prices[s] : acc.pos[s].entry);
    return e;
  }
  /* Kauf: Größe so, dass ein Stop-Treffer etwa riskPct vom Konto kostet, gedeckelt auf maxPosPct.
     o.sizePct (0–100) skaliert zusätzlich – nutzt der KI-Agent. */
  function buy(acc, sym, price, t, o, reason, prices) {
    if (acc.pos[sym]) return null;
    var stopPct = Math.max(0.2, o.stopPct), eq = equityOf(acc, prices || {});
    var value = Math.min(eq * o.maxPosPct / 100, eq * (o.riskPct / 100) / (stopPct / 100));
    if (o.sizePct != null) value *= Math.max(0, Math.min(100, o.sizePct)) / 100;
    var fill = price * (1 + o.slipPct / 100), fee = value * o.feePct / 100;
    if (value + fee > acc.cash) { value = acc.cash / (1 + o.feePct / 100); fee = value * o.feePct / 100; }
    if (value < 10) return null; // Mindestgröße 10 USDT
    var qty = value / fill;
    acc.cash -= value + fee;
    acc.pos[sym] = { qty: qty, entry: fill, cost: value + fee, t: t,
      stop: fill * (1 - stopPct / 100), take: o.takePct > 0 ? fill * (1 + o.takePct / 100) : null };
    var tr = { t: t, sym: sym, side: "BUY", price: fill, qty: qty, fee: fee, reason: reason };
    acc.trades.push(tr);
    return tr;
  }
  function sell(acc, sym, price, t, o, reason, noSlip) {
    var p = acc.pos[sym]; if (!p) return null;
    var fill = noSlip ? price : price * (1 - o.slipPct / 100), gross = p.qty * fill, fee = gross * o.feePct / 100;
    acc.cash += gross - fee;
    var pnl = gross - fee - p.cost;
    var tr = { t: t, sym: sym, side: "SELL", price: fill, qty: p.qty, fee: fee, pnl: pnl, pnlPct: pnl / p.cost * 100, reason: reason };
    delete acc.pos[sym];
    acc.trades.push(tr);
    return tr;
  }
  /* Stop/Ziel innerhalb einer Kerze prüfen. Treffen beide, wird vorsichtig der Stop angenommen.
     Öffnet die Kerze schon jenseits des Stops (Kurslücke), wird zum Eröffnungskurs verkauft. */
  function checkExits(acc, sym, k, o) {
    var p = acc.pos[sym]; if (!p) return null;
    if (k.l <= p.stop) return sell(acc, sym, Math.min(k.o, p.stop), k.t, o, "Stop-Loss");
    if (p.take != null && k.h >= p.take) return sell(acc, sym, Math.max(k.o, p.take), k.t, o, "Gewinnziel", true);
    return null;
  }

  /* ---------- Backtest ----------
     Signal auf dem Schluss von Kerze i, Ausführung zum Open von Kerze i+1 (kein Blick in die Zukunft). */
  function backtest(candles, strategyKey, opts, capital) {
    var st = STRATEGIES[strategyKey], o = Object.assign({}, DEFAULT_OPTS, opts), sym = "X";
    var acc = newAccount(capital || 10000), curve = [], bh = [], pending = null;
    var w = Math.min(st.warmup, candles.length - 1), first = candles[w].o;
    for (var i = w; i < candles.length; i++) {
      var k = candles[i];
      if (pending) {
        if (pending.action === "buy") buy(acc, sym, k.o, k.t, o, pending.reason, { X: k.o });
        else sell(acc, sym, k.o, k.t, o, pending.reason);
        pending = null;
      }
      checkExits(acc, sym, k, o);
      var sig = st.fn(candles.slice(Math.max(0, i - 260), i + 1), !!acc.pos[sym]);
      if (sig.action !== "hold" && i < candles.length - 1) pending = sig;
      curve.push({ t: k.t, v: equityOf(acc, { X: k.c }) });
      bh.push({ t: k.t, v: (capital || 10000) * k.c / first });
    }
    if (acc.pos[sym]) sell(acc, sym, candles[candles.length - 1].c, candles[candles.length - 1].t, o, "Ende Backtest");
    return { stats: stats(acc, curve, bh), curve: curve, bh: bh, trades: acc.trades };
  }
  function maxDrawdown(curve) {
    var peak = -Infinity, dd = 0;
    curve.forEach(function (p) { peak = Math.max(peak, p.v); dd = Math.max(dd, (peak - p.v) / peak); });
    return dd * 100;
  }
  function stats(acc, curve, bh) {
    var sells = acc.trades.filter(function (t) { return t.side === "SELL"; });
    var wins = sells.filter(function (t) { return t.pnl > 0; });
    var gw = wins.reduce(function (a, t) { return a + t.pnl; }, 0);
    var gl = sells.filter(function (t) { return t.pnl <= 0; }).reduce(function (a, t) { return a - t.pnl; }, 0);
    var fees = acc.trades.reduce(function (a, t) { return a + t.fee; }, 0);
    return {
      returnPct: (acc.cash / acc.start - 1) * 100,
      buyHoldPct: bh.length ? (bh[bh.length - 1].v / acc.start - 1) * 100 : 0,
      maxDDPct: maxDrawdown(curve), buyHoldDDPct: maxDrawdown(bh),
      trades: sells.length, winRatePct: sells.length ? wins.length / sells.length * 100 : 0,
      profitFactor: gl > 0 ? gw / gl : (gw > 0 ? Infinity : 0), fees: fees
    };
  }

  /* Binance-Kline-Array -> Kerze */
  function parseKlines(raw) {
    return raw.map(function (r) { return { t: r[0], o: +r[1], h: +r[2], l: +r[3], c: +r[4], v: +r[5], ct: r[6] }; });
  }

  var PT = { sma: sma, ema: ema, rsi: rsi, STRATEGIES: STRATEGIES, DEFAULT_OPTS: DEFAULT_OPTS,
    newAccount: newAccount, equityOf: equityOf, buy: buy, sell: sell, checkExits: checkExits,
    backtest: backtest, maxDrawdown: maxDrawdown, parseKlines: parseKlines };
  if (typeof module !== "undefined" && module.exports) module.exports = PT; else root.PT = PT;
})(typeof self !== "undefined" ? self : this);
