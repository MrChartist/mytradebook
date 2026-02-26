/**
 * Trading Calculations Utilities
 *
 * Helper functions for common trading calculations.
 */

import type { TradeTargets } from '@/types/trade';

/**
 * Calculate P&L for a trade
 *
 * @param entryPrice - Entry price per unit
 * @param exitPrice - Exit price per unit (or current price for open trades)
 * @param quantity - Number of units
 * @param tradeType - 'LONG' or 'SHORT'
 * @returns P&L amount
 *
 * @example
 * calculatePnL(100, 110, 10, 'LONG') // 100 (profit)
 * calculatePnL(100, 90, 10, 'SHORT') // 100 (profit)
 */
export function calculatePnL(
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  tradeType: 'BUY' | 'SELL'
): number {
  if (tradeType === 'BUY') {
    return (exitPrice - entryPrice) * quantity;
  } else {
    return (entryPrice - exitPrice) * quantity;
  }
}

/**
 * Calculate P&L percentage
 *
 * @param entryPrice - Entry price per unit
 * @param exitPrice - Exit price per unit
 * @param tradeType - 'LONG' or 'SHORT'
 * @returns P&L percentage
 *
 * @example
 * calculatePnLPercent(100, 110, 'LONG') // 10.0
 * calculatePnLPercent(100, 90, 'SHORT') // 10.0
 */
export function calculatePnLPercent(
  entryPrice: number,
  exitPrice: number,
  tradeType: 'BUY' | 'SELL'
): number {
  if (entryPrice === 0) return 0;

  if (tradeType === 'BUY') {
    return ((exitPrice - entryPrice) / entryPrice) * 100;
  } else {
    return ((entryPrice - exitPrice) / entryPrice) * 100;
  }
}

/**
 * Calculate stop loss price from percentage
 *
 * @param entryPrice - Entry price
 * @param slPercent - Stop loss percentage (positive number)
 * @param tradeType - 'LONG' or 'SHORT'
 * @returns Stop loss price
 *
 * @example
 * calculateStopLoss(100, 5, 'LONG') // 95
 * calculateStopLoss(100, 5, 'SHORT') // 105
 */
export function calculateStopLoss(
  entryPrice: number,
  slPercent: number,
  tradeType: 'BUY' | 'SELL'
): number {
  const slAmount = (entryPrice * slPercent) / 100;

  if (tradeType === 'BUY') {
    return entryPrice - slAmount;
  } else {
    return entryPrice + slAmount;
  }
}

/**
 * Calculate target price from R:R ratio
 *
 * @param entryPrice - Entry price
 * @param stopLoss - Stop loss price
 * @param riskRewardRatio - Risk to reward ratio (e.g., 2 for 1:2)
 * @param tradeType - 'LONG' or 'SHORT'
 * @returns Target price
 *
 * @example
 * calculateTarget(100, 95, 2, 'LONG') // 110 (risk 5, reward 10)
 * calculateTarget(100, 105, 2, 'SHORT') // 90
 */
export function calculateTarget(
  entryPrice: number,
  stopLoss: number,
  riskRewardRatio: number,
  tradeType: 'BUY' | 'SELL'
): number {
  const risk = Math.abs(entryPrice - stopLoss);
  const reward = risk * riskRewardRatio;

  if (tradeType === 'BUY') {
    return entryPrice + reward;
  } else {
    return entryPrice - reward;
  }
}

/**
 * Calculate position size based on risk
 *
 * @param capital - Total capital available
 * @param riskPercent - Risk percentage of capital (e.g., 2 for 2%)
 * @param entryPrice - Entry price per unit
 * @param stopLoss - Stop loss price
 * @returns Quantity to trade
 *
 * @example
 * calculatePositionSize(100000, 2, 100, 95) // 400 units
 * // Risk: 2% of 100000 = 2000
 * // Risk per unit: 100 - 95 = 5
 * // Quantity: 2000 / 5 = 400
 */
export function calculatePositionSize(
  capital: number,
  riskPercent: number,
  entryPrice: number,
  stopLoss: number
): number {
  const riskAmount = (capital * riskPercent) / 100;
  const riskPerUnit = Math.abs(entryPrice - stopLoss);

  if (riskPerUnit === 0) return 0;

  return Math.floor(riskAmount / riskPerUnit);
}

/**
 * Calculate risk-reward ratio
 *
 * @param entryPrice - Entry price
 * @param stopLoss - Stop loss price
 * @param target - Target price
 * @param tradeType - 'LONG' or 'SHORT'
 * @returns Risk-reward ratio (e.g., 2.5 for 1:2.5)
 *
 * @example
 * calculateRiskReward(100, 95, 110, 'LONG') // 2.0 (risk 5, reward 10)
 */
export function calculateRiskReward(
  entryPrice: number,
  stopLoss: number,
  target: number,
  _tradeType: 'BUY' | 'SELL'
): number {
  const risk = Math.abs(entryPrice - stopLoss);
  const reward = Math.abs(target - entryPrice);

  if (risk === 0) return 0;

  return reward / risk;
}

/**
 * Calculate win rate
 *
 * @param wins - Number of winning trades
 * @param losses - Number of losing trades
 * @returns Win rate percentage
 *
 * @example
 * calculateWinRate(7, 3) // 70.0
 */
export function calculateWinRate(wins: number, losses: number): number {
  const total = wins + losses;
  if (total === 0) return 0;
  return (wins / total) * 100;
}

/**
 * Calculate average trade P&L
 *
 * @param trades - Array of P&L values
 * @returns Average P&L
 */
export function calculateAvgPnL(trades: number[]): number {
  if (trades.length === 0) return 0;
  const sum = trades.reduce((acc, pnl) => acc + pnl, 0);
  return sum / trades.length;
}

/**
 * Calculate profit factor
 *
 * @param grossProfit - Sum of all winning trades
 * @param grossLoss - Sum of all losing trades (absolute value)
 * @returns Profit factor ratio
 *
 * @example
 * calculateProfitFactor(15000, 5000) // 3.0
 */
export function calculateProfitFactor(grossProfit: number, grossLoss: number): number {
  if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0;
  return grossProfit / grossLoss;
}

/**
 * Calculate Sharpe ratio (simplified)
 *
 * @param returns - Array of trade returns (percentages)
 * @param riskFreeRate - Risk-free rate (default: 0)
 * @returns Sharpe ratio
 */
export function calculateSharpeRatio(returns: number[], riskFreeRate: number = 0): number {
  if (returns.length === 0) return 0;

  const avgReturn = calculateAvgPnL(returns);
  const excessReturn = avgReturn - riskFreeRate;

  // Calculate standard deviation
  const variance = returns.reduce((sum, r) => {
    return sum + Math.pow(r - avgReturn, 2);
  }, 0) / returns.length;

  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;

  return excessReturn / stdDev;
}

/**
 * Calculate maximum drawdown
 *
 * @param equityCurve - Array of cumulative P&L values
 * @returns Maximum drawdown percentage
 *
 * @example
 * calculateMaxDrawdown([100, 110, 105, 120, 90]) // ~25% (from 120 to 90)
 */
export function calculateMaxDrawdown(equityCurve: number[]): number {
  if (equityCurve.length === 0) return 0;

  let maxDrawdown = 0;
  let peak = equityCurve[0];

  for (const value of equityCurve) {
    if (value > peak) {
      peak = value;
    }

    const drawdown = peak > 0 ? ((peak - value) / peak) * 100 : 0;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  return maxDrawdown;
}

/**
 * Check if all targets are hit
 *
 * @param targets - Array of trade targets
 * @returns True if all targets have been hit
 */
export function allTargetsHit(targets: TradeTargets | null): boolean {
  if (!targets || targets.length === 0) return false;
  return targets.every(t => t.hit === true);
}

/**
 * Get next unhit target
 *
 * @param targets - Array of trade targets
 * @returns Next target that hasn't been hit, or null
 */
export function getNextTarget(targets: TradeTargets | null): number | null {
  if (!targets || targets.length === 0) return null;

  const unhit = targets.find(t => !t.hit);
  return unhit ? unhit.price : null;
}

/**
 * Calculate breakeven price including charges
 *
 * @param entryPrice - Entry price
 * @param brokerage - Brokerage percentage (e.g., 0.03 for 0.03%)
 * @param tradeType - 'LONG' or 'SHORT'
 * @returns Breakeven price
 */
export function calculateBreakeven(
  entryPrice: number,
  brokerage: number,
  tradeType: 'BUY' | 'SELL'
): number {
  // Assuming charges on both entry and exit
  const totalCharges = brokerage * 2;
  const chargeAmount = (entryPrice * totalCharges) / 100;

  if (tradeType === 'BUY') {
    return entryPrice + chargeAmount;
  } else {
    return entryPrice - chargeAmount;
  }
}
