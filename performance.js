/**
 * Calculate performance metrics for backtest results
 * @param {Object} results - Backtest results
 * @returns {Object} - Performance metrics
 */
export function calculatePerformanceMetrics(results) {
  const metrics = {
    totalReturn: 0,
    annualizedReturn: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    winRate: 0,
    profitFactor: 0,
    averageWin: 0,
    averageLoss: 0
  };
  
  // Calculate total return
  metrics.totalReturn = (results.finalCapital / results.initialCapital) - 1;
  
  // Calculate annualized return
  const firstDate = new Date(results.equity[0].date);
  const lastDate = new Date(results.equity[results.equity.length - 1].date);
  const yearFraction = (lastDate - firstDate) / (365 * 24 * 60 * 60 * 1000);
  metrics.annualizedReturn = Math.pow(1 + metrics.totalReturn, 1 / yearFraction) - 1;
  
  // Calculate daily returns
  const dailyReturns = [];
  for (let i = 1; i < results.equity.length; i++) {
    const prevEquity = results.equity[i - 1].equity;
    const currEquity = results.equity[i].equity;
    const dailyReturn = (currEquity / prevEquity) - 1;
    dailyReturns.push(dailyReturn);
  }
  
  // Calculate Sharpe ratio (assuming risk-free rate of 0)
  const meanDailyReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length;
  const stdDailyReturn = Math.sqrt(
    dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - meanDailyReturn, 2), 0) / dailyReturns.length
  );
  metrics.sharpeRatio = meanDailyReturn / stdDailyReturn * Math.sqrt(252); // Annualized
  
  // Calculate maximum drawdown
  let peak = results.equity[0].equity;
  let maxDrawdown = 0;
  
  for (const point of results.equity) {
    if (point.equity > peak) {
      peak = point.equity;
    }
    
    const drawdown = (peak - point.equity) / peak;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }
  
  metrics.maxDrawdown = maxDrawdown;
  
  // Calculate win rate and profit factor
  const profitableTrades = results.trades.filter(trade => trade.pnl > 0);
  const unprofitableTrades = results.trades.filter(trade => trade.pnl < 0);
  
  metrics.winRate = profitableTrades.length / results.trades.length;
  
  const totalProfit = profitableTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const totalLoss = Math.abs(unprofitableTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0));
  
  metrics.profitFactor = totalLoss === 0 ? Infinity : totalProfit / totalLoss;
  
  // Calculate average win and loss
  metrics.averageWin = profitableTrades.length > 0 
    ? totalProfit / profitableTrades.length 
    : 0;
    
  metrics.averageLoss = unprofitableTrades.length > 0 
    ? totalLoss / unprofitableTrades.length 
    : 0;
  
  return metrics;
}
