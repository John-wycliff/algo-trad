import { SMA, EMA, RSI, MACD, BollingerBands, StochasticRSI } from 'technicalindicators';

/**
 * Calculate Simple Moving Average
 * @param {Array} prices - Array of price values
 * @param {number} period - Period for calculation
 * @returns {Array} - Array of SMA values
 */
export function calculateSMA(prices, period) {
  return SMA.calculate({
    period,
    values: prices
  });
}

/**
 * Calculate Exponential Moving Average
 * @param {Array} prices - Array of price values
 * @param {number} period - Period for calculation
 * @returns {Array} - Array of EMA values
 */
export function calculateEMA(prices, period) {
  return EMA.calculate({
    period,
    values: prices
  });
}

/**
 * Calculate Relative Strength Index
 * @param {Array} prices - Array of price values
 * @param {number} period - Period for calculation
 * @returns {Array} - Array of RSI values
 */
export function calculateRSI(prices, period) {
  return RSI.calculate({
    period,
    values: prices
  });
}

/**
 * Calculate Moving Average Convergence Divergence
 * @param {Array} prices - Array of price values
 * @param {number} fastPeriod - Fast period
 * @param {number} slowPeriod - Slow period
 * @param {number} signalPeriod - Signal period
 * @returns {Array} - Array of MACD values
 */
export function calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  return MACD.calculate({
    fastPeriod,
    slowPeriod,
    signalPeriod,
    values: prices
  });
}

/**
 * Calculate Bollinger Bands
 * @param {Array} prices - Array of price values
 * @param {number} period - Period for calculation
 * @param {number} stdDev - Standard deviation multiplier
 * @returns {Array} - Array of Bollinger Bands values
 */
export function calculateBollingerBands(prices, period = 20, stdDev = 2) {
  return BollingerBands.calculate({
    period,
    values: prices,
    stdDev
  });
}

/**
 * Calculate Stochastic RSI
 * @param {Array} prices - Array of price values
 * @param {number} rsiPeriod - RSI period
 * @param {number} stochasticPeriod - Stochastic period
 * @param {number} kPeriod - K period
 * @param {number} dPeriod - D period
 * @returns {Array} - Array of Stochastic RSI values
 */
export function calculateStochasticRSI(prices, rsiPeriod = 14, stochasticPeriod = 14, kPeriod = 3, dPeriod = 3) {
  return StochasticRSI.calculate({
    rsiPeriod,
    stochasticPeriod,
    kPeriod,
    dPeriod,
    values: prices
  });
}
