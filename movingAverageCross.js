import StrategyBase from './strategyBase.js';
import { SMA } from 'technicalindicators';

/**
 * Moving Average Crossover Strategy
 * Generates buy signals when short MA crosses above long MA
 * Generates sell signals when short MA crosses below long MA
 */
class MovingAverageCrossStrategy extends StrategyBase {
  /**
   * Create a new Moving Average Crossover strategy
   * @param {Object} params - Strategy parameters
   * @param {number} params.shortPeriod - Short MA period
   * @param {number} params.longPeriod - Long MA period
   */
  constructor(params = {}) {
    super(params);
    this.name = 'Moving Average Crossover';
    this.description = 'Generates signals based on moving average crossovers';
    
    // Set default parameters if not provided
    this.params.shortPeriod = params.shortPeriod || 10;
    this.params.longPeriod = params.longPeriod || 50;
    
    // Validate parameters
    if (this.params.shortPeriod >= this.params.longPeriod) {
      throw new Error('Short period must be less than long period');
    }
  }
  
  /**
   * Initialize strategy with historical data
   * @param {Array} data - Historical price data
   */
  init(data) {
    super.init(data);
    
    // Calculate moving averages for the entire dataset
    const prices = data.map(candle => candle.close);
    
    // Calculate short MA
    const shortMA = SMA.calculate({
      period: this.params.shortPeriod,
      values: prices
    });
    
    // Calculate long MA
    const longMA = SMA.calculate({
      period: this.params.longPeriod,
      values: prices
    });
    
    // Add indicators to data
    const longPeriod = this.params.longPeriod;
    this.data = data.map((candle, i) => {
      if (i < longPeriod - 1) {
        return { ...candle, shortMA: null, longMA: null };
      }
      
      return {
        ...candle,
        shortMA: shortMA[i - (longPeriod - this.params.shortPeriod)],
        longMA: longMA[i - (longPeriod - 1)]
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
    // Skip if we don't have both MAs yet
    if (candle.shortMA === null || candle.longMA === null) {
      return 0;
    }
    
    // Get previous candle
    const index = this.data.findIndex(c => c.date === candle.date);
    if (index <= 0) return 0;
    
    const prevCandle = this.data[index - 1];
    
    // Check for crossover
    const crossedAbove = prevCandle.shortMA <= prevCandle.longMA && candle.shortMA > candle.longMA;
    const crossedBelow = prevCandle.shortMA >= prevCandle.longMA && candle.shortMA < candle.longMA;
    
    if (crossedAbove) {
      return 1; // Buy signal
    } else if (crossedBelow) {
      return -1; // Sell signal
    }
    
    return 0; // Hold
  }
}

export default MovingAverageCrossStrategy;
