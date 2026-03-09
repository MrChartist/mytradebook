/**
 * Indian Market Brokerage & Charges Calculator
 * 
 * Calculates all regulatory charges for Indian stock market trades:
 * - Brokerage
 * - STT (Securities Transaction Tax)
 * - Exchange Transaction Charges
 * - GST (on brokerage + exchange charges)
 * - SEBI Charges
 * - Stamp Duty
 */

export type BrokerType = "zerodha" | "groww" | "dhan" | "angelone" | "flat20";

export interface BrokerageConfig {
  label: string;
  equityDeliveryPct: number;     // % of turnover
  equityIntradayFlat: number;    // flat per order (₹)
  futuresFlat: number;           // flat per order (₹)
  optionsFlat: number;           // flat per order (₹)
  commodityFlat: number;         // flat per order (₹)
}

const BROKER_CONFIGS: Record<BrokerType, BrokerageConfig> = {
  zerodha: {
    label: "Zerodha",
    equityDeliveryPct: 0,
    equityIntradayFlat: 20,
    futuresFlat: 20,
    optionsFlat: 20,
    commodityFlat: 20,
  },
  dhan: {
    label: "Dhan",
    equityDeliveryPct: 0,
    equityIntradayFlat: 20,
    futuresFlat: 20,
    optionsFlat: 20,
    commodityFlat: 20,
  },
  groww: {
    label: "Groww",
    equityDeliveryPct: 0,
    equityIntradayFlat: 20,
    futuresFlat: 20,
    optionsFlat: 20,
    commodityFlat: 20,
  },
  angelone: {
    label: "Angel One",
    equityDeliveryPct: 0,
    equityIntradayFlat: 20,
    futuresFlat: 20,
    optionsFlat: 20,
    commodityFlat: 20,
  },
  flat20: {
    label: "Flat ₹20",
    equityDeliveryPct: 0,
    equityIntradayFlat: 20,
    futuresFlat: 20,
    optionsFlat: 20,
    commodityFlat: 20,
  },
};

export type TradeSegment = "Equity_Intraday" | "Equity_Positional" | "Futures" | "Options" | "Commodities";

export interface ChargesInput {
  segment: TradeSegment;
  tradeType: "BUY" | "SELL";
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  broker?: BrokerType;
  lotSize?: number; // For F&O
}

export interface ChargesBreakdown {
  turnover: number;
  brokerage: number;
  stt: number;
  exchangeCharges: number;
  gst: number;
  sebiCharges: number;
  stampDuty: number;
  totalCharges: number;
  netPnl: number;
  grossPnl: number;
  chargesPercentOfTurnover: number;
  breakeven: number;
}

// STT rates (as of FY 2024-25)
const STT_RATES = {
  Equity_Intraday: { buy: 0, sell: 0.025 },       // 0.025% on sell side
  Equity_Positional: { buy: 0.1, sell: 0.1 },     // 0.1% on both sides
  Futures: { buy: 0, sell: 0.0125 },               // 0.0125% on sell side
  Options: { buy: 0, sell: 0.0625 },               // 0.0625% on sell side (on premium)
  Commodities: { buy: 0.01, sell: 0.01 },          // CTT 0.01% on non-agri sell
};

// Exchange transaction charges (NSE)
const EXCHANGE_CHARGES = {
  Equity_Intraday: 0.00345,     // % of turnover
  Equity_Positional: 0.00345,
  Futures: 0.0019,
  Options: 0.05,                 // % of premium turnover
  Commodities: 0.0026,
};

// SEBI charges: ₹10 per crore of turnover
const SEBI_PER_CRORE = 10;

// Stamp duty (varies by state, using Maharashtra as default)
const STAMP_DUTY = {
  Equity_Intraday: { buy: 0.003, sell: 0 },     // 0.003% on buy
  Equity_Positional: { buy: 0.015, sell: 0 },   // 0.015% on buy
  Futures: { buy: 0.002, sell: 0 },
  Options: { buy: 0.003, sell: 0 },
  Commodities: { buy: 0.002, sell: 0 },
};

export function calculateCharges(input: ChargesInput): ChargesBreakdown {
  const { segment, tradeType, entryPrice, exitPrice, quantity, broker = "flat20" } = input;
  const config = BROKER_CONFIGS[broker];

  const buyTurnover = entryPrice * quantity;
  const sellTurnover = exitPrice * quantity;
  const totalTurnover = buyTurnover + sellTurnover;

  // 1. Brokerage
  let brokerage = 0;
  if (segment === "Equity_Positional") {
    // Delivery: percentage based or zero
    brokerage = (totalTurnover * config.equityDeliveryPct) / 100;
  } else if (segment === "Equity_Intraday") {
    brokerage = config.equityIntradayFlat * 2; // buy + sell orders
  } else if (segment === "Futures") {
    brokerage = config.futuresFlat * 2;
  } else if (segment === "Options") {
    brokerage = config.optionsFlat * 2;
  } else if (segment === "Commodities") {
    brokerage = config.commodityFlat * 2;
  }
  // Cap brokerage at 0.03% of turnover per side (SEBI rule for discount brokers)
  const maxBrokeragePerSide = (totalTurnover / 2) * 0.0003;
  brokerage = Math.min(brokerage, maxBrokeragePerSide * 2);

  // 2. STT
  const sttRates = STT_RATES[segment];
  const sttBuy = (buyTurnover * sttRates.buy) / 100;
  const sttSell = (sellTurnover * sttRates.sell) / 100;
  const stt = sttBuy + sttSell;

  // 3. Exchange transaction charges
  const exchangeRate = EXCHANGE_CHARGES[segment];
  const exchangeCharges = (totalTurnover * exchangeRate) / 100;

  // 4. GST (18% on brokerage + exchange charges)
  const gst = (brokerage + exchangeCharges) * 0.18;

  // 5. SEBI charges
  const sebiCharges = (totalTurnover / 10000000) * SEBI_PER_CRORE;

  // 6. Stamp Duty
  const stampRates = STAMP_DUTY[segment];
  const stampBuy = (buyTurnover * stampRates.buy) / 100;
  const stampSell = (sellTurnover * stampRates.sell) / 100;
  const stampDuty = stampBuy + stampSell;

  // Totals
  const totalCharges = brokerage + stt + exchangeCharges + gst + sebiCharges + stampDuty;

  const grossPnl = tradeType === "BUY"
    ? (exitPrice - entryPrice) * quantity
    : (entryPrice - exitPrice) * quantity;
  const netPnl = grossPnl - totalCharges;

  const chargesPercentOfTurnover = totalTurnover > 0 ? (totalCharges / totalTurnover) * 100 : 0;

  // Breakeven: price needed to cover charges
  const chargesPerUnit = totalCharges / quantity;
  const breakeven = tradeType === "BUY"
    ? entryPrice + chargesPerUnit
    : entryPrice - chargesPerUnit;

  return {
    turnover: totalTurnover,
    brokerage: Math.round(brokerage * 100) / 100,
    stt: Math.round(stt * 100) / 100,
    exchangeCharges: Math.round(exchangeCharges * 100) / 100,
    gst: Math.round(gst * 100) / 100,
    sebiCharges: Math.round(sebiCharges * 100) / 100,
    stampDuty: Math.round(stampDuty * 100) / 100,
    totalCharges: Math.round(totalCharges * 100) / 100,
    netPnl: Math.round(netPnl * 100) / 100,
    grossPnl: Math.round(grossPnl * 100) / 100,
    chargesPercentOfTurnover: Math.round(chargesPercentOfTurnover * 10000) / 10000,
    breakeven: Math.round(breakeven * 100) / 100,
  };
}

export function getBrokerOptions(): { value: BrokerType; label: string }[] {
  return Object.entries(BROKER_CONFIGS).map(([key, config]) => ({
    value: key as BrokerType,
    label: config.label,
  }));
}

/**
 * Format charges breakdown for display
 */
export function formatChargesSummary(charges: ChargesBreakdown): string {
  return [
    `Brokerage: ₹${charges.brokerage.toFixed(2)}`,
    `STT: ₹${charges.stt.toFixed(2)}`,
    `Exchange: ₹${charges.exchangeCharges.toFixed(2)}`,
    `GST: ₹${charges.gst.toFixed(2)}`,
    `SEBI: ₹${charges.sebiCharges.toFixed(2)}`,
    `Stamp: ₹${charges.stampDuty.toFixed(2)}`,
    `───────────────`,
    `Total: ₹${charges.totalCharges.toFixed(2)}`,
  ].join("\n");
}
