/**
 * Base class for all trading strategies
 */
class StrategyBase {
  /**
   * Create a new strategy
   * @param {Object} params - Strategy parameters
   */
  constructor(params = {}) {
    this.name = 'Base Strategy';
    this.description = 'Base strategy class - not meant to be used directly';
    this.params = params;
    this.position = 0; // Current position: 0 = no position, 1 = long, -1 = short
    this.entryPrice = 0; // Price at which position was entered
    this.cash = params.initialCapital || 10000; // Starting cash
    this.equity = this.cash; // Current portfolio value
    this.trades = []; // Array to store trade history
  }
  
  /**
   * Initialize the strategy with historical data
   * @param {Array} data - Historical price data
   */
  init(data) {
    this.data = data;
    this.reset();
  }
  
  /**
   * Reset the strategy to initial state
   */
  reset() {
    this.position = 0;
    this.entryPrice = 0;
    this.cash = this.params.initialCapital || 10000;
    this.equity = this.cash;
    this.trades = [];
  }
  
  /**
   * Analyze current market conditions and generate trading signal
   * @param {Object} candle - Current price candle
   * @param {number} position - Current position
   * @returns {number} - Trading signal: 1 (buy), -1 (sell), 0 (hold)
   */
  analyze(candle, position) {
    // To be implemented by subclasses
    return 0;
  }
  
  /**
   * Execute a trade based on the signal
   * @param {Object} candle - Current price candle
   * @param {number} signal - Trading signal
   */
  executeTrade(candle, signal) {
    const price = candle.close;
    const date = candle.date;
    
    // Exit existing position if signal is opposite to current position
    if (this.position !== 0 && signal !== 0 && signal !== this.position) {
      // Calculate profit/loss
      const pnl = this.position * (price - this.entryPrice) * this.getPositionSize();
      this.cash += this.getPositionValue(price) + pnl;
      
      // Record the trade
      this.trades.push({
        type: this.position > 0 ? 'sell' : 'buy',
        date,
        price,
        size: this.getPositionSize(),
        pnl,
        cash: this.cash
      });
      
      // Reset position
      this.position = 0;
      this.entryPrice = 0;
    }
    
    // Enter new position if no current position and signal is not zero
    if (this.position === 0 && signal !== 0) {
      this.position = signal;
      this.entryPrice = price;
      
      // Calculate position size based on available cash
      const positionValue = this.getPositionSize() * price;
      this.cash -= positionValue;
      
      // Record the trade
      this.trades.push({
        type: signal > 0 ? 'buy' : 'sell',
        date,
        price,
        size: this.getPositionSize(),
        cash: this.cash
      });
    }
    
    // Update equity
    this.equity = this.cash + this.getPositionValue(price);
  }
  
  /**
   * Get the size of the current position
   * @returns {number} - Position size in units
   */
  getPositionSize() {
    // Simple position sizing: use all available cash
    // In a real system, this would be more sophisticated
    return Math.floor(this.params.initialCapital / this.entryPrice);
  }
  
  /**
   * Get the current value of the position
   * @param {number} currentPrice - Current market price
   * @returns {number} - Position value
   */
  getPositionValue(currentPrice) {
    if (this.position === 0) return 0;
    return this.getPositionSize() * currentPrice;
  }
}

export default StrategyBase;
