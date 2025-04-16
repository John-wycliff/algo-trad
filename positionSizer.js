/**
 * Position sizing strategies for risk management
 */

/**
 * Fixed position size
 * @param {number} capital - Available capital
 * @param {number} price - Current price
 * @param {number} fixedSize - Fixed position size in units
 * @returns {number} - Position size in units
 */
export function fixedSize(capital, price, fixedSize) {
  return Math.min(fixedSize, Math.floor(capital / price));
}

/**
 * Fixed fraction of capital
 * @param {number} capital - Available capital
 * @param {number} price - Current price
 * @param {number} fraction - Fraction of capital to use (0-1)
 * @returns {number} - Position size in units
 */
export function fixedFraction(capital, price, fraction) {
  return Math.floor((capital * fraction) / price);
}

/**
 * Fixed risk position sizing
 * @param {number} capital - Available capital
 * @param {number} price - Current price
 * @param {number} stopLoss - Stop loss price
 * @param {number} riskPercent - Percentage of capital to risk (0-100)
 * @returns {number} - Position size in units
 */
export function fixedRisk(capital, price, stopLoss, riskPercent) {
  const riskPerUnit = Math.abs(price - stopLoss);
  if (riskPerUnit === 0) return 0;
  
  const riskAmount = capital * (riskPercent / 100);
  const positionSize = Math.floor(riskAmount / riskPerUnit);
  
  return Math.min(positionSize, Math.floor(capital / price));
}

/**
 * Kelly criterion position sizing
 * @param {number} capital - Available capital
 * @param {number} price - Current price
 * @param {number} winRate - Win rate (0-1)
 * @param {number} winLossRatio - Ratio of average win to average loss
 * @returns {number} - Position size in units
 */
export function kellyCriterion(capital, price, winRate, winLossRatio) {
  const kellyFraction = winRate - ((1 - winRate) / winLossRatio);
  
  // Limit to half Kelly for safety
  const halfKelly = Math.max(0, kellyFraction / 2);
  
  return Math.floor((capital * halfKelly) / price);
}
