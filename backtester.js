/**
 * Run a backtest for a trading strategy on historical data
 * @param {Array} data - Historical price data
 * @param {Object} strategy - Trading strategy instance
 * @returns {Object} - Backtest results
 */
export function runBacktest(data, strategy) {
  // Initialize strategy with data
  strategy.init(data);
  
  // Initialize results object
  const results = {
    strategy: strategy.name,
    params: strategy.params,
    initialCapital: strategy.cash,
    equity: [],
    trades: [],
    positions: []
  };
  
  // Run strategy on each candle
  for (let i = 0; i < data.length; i++) {
    const candle = data[i];
    
    // Generate signal
    const signal = strategy.analyze(candle, strategy.position);
    
    // Execute trade based on signal
    strategy.executeTrade(candle, signal);
    
    // Record equity and position
    results.equity.push({
      date: candle.date,
      equity: strategy.equity,
      cash: strategy.cash,
      position: strategy.position
    });
    
    results.positions.push({
      date: candle.date,
      position: strategy.position,
      price: candle.close
    });
  }
  
  // Record trades
  results.trades = strategy.trades;
  
  // Calculate final equity
  results.finalCapital = strategy.equity;
  results.totalReturn = (results.finalCapital / results.initialCapital) - 1;
  
  return results;
}
