import StrategyBase from './strategyBase.js';
import { RSI } from 'technicalindicators';

/**
 * RSI Mean Reversion Strategy
 * Generates buy signals when RSI is oversold
 * Generates sell signals when RSI is overbought
 */
class RSIStrategy extends StrategyBase {
  /**
   * Create a new RSI Mean Reversion strategy
   * @param {Object} params - Strategy parameters
   * @param {number} params.period - RSI period
   * @param {number} params.overbought - Overbought threshold
   * @param {number} params.oversold - Oversold threshold
   */
  constructor(params = {}) {
    super(params);
    this.name = 'RSI Mean Reversion';
    this.description = 'Generates signals based on RSI overbought/oversold conditions';
    
    // Set default parameters if not provided
    this.params.period = params.period || 14;
    this.params.overbought = params.overbought || 70;
    this.params.oversold = params.oversold || 30;
  }
  
  /**
   * Initialize strategy with historical data
   * @param {Array} data - Historical price data
   */
  init(data) {
    super.init(data);
    
    // Calculate RSI for the entire dataset
    const prices = data.map(candle => candle.close);
    
    const rsiValues = RSI.calculate({
      period: this.params.period,
      values: prices
    });
    
    // Add RSI to data
    this.data = data.map((candle, i) => {
      if (i < this.params.period) {
        return { ...candle, rsi: null };
      }
      
      return {
        ...candle,
        rsi: rsiValues[i - this.params.period]
      };
    });
  }
  
  /**
   * Analyze current market conditions and generate trading signal
   * @param {Object} candle - Current price candle with indicators
   * @param {number} position - Current position
   * @returns {number} - Trading signal: 1 (buy), -1 (sell), 0 (hold)
   */
  analyze(candle, position) {
    // Skip if we don't have RSI yet
    if (candle.rsi === null) {
      return 0;
    }
    
    // Check for overbought/oversold conditions
    if (candle.rsi <= this.params.oversold && position <= 0) {
      return 1; // Buy signal
    } else if (candle.rsi >= this.params.overbought && position >= 0) {
      return -1; // Sell signal
    }
    
    return 0; // Hold
  }
}

export default RSIStrategy;
