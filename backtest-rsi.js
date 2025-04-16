import dotenv from 'dotenv';
import { fetchHistoricalData } from '../src/data/dataFetcher.js';
import { runBacktest } from '../src/backtest/backtester.js';
import { calculatePerformanceMetrics } from '../src/backtest/performance.js';
import RSIStrategy from '../src/strategies/rsiStrategy.js';

// Load environment variables
dotenv.config();

async function runRSIBacktest() {
  try {
    console.log('Running RSI Mean Reversion Backtest');
    
    // Get parameters from command line or use defaults
    const ticker = process.argv[2] || process.env.DEFAULT_TICKER || 'AAPL';
    const startDate = process.argv[3] || process.env.DEFAULT_START_DATE || '2020-01-01';
    const endDate = process.argv[4] || process.env.DEFAULT_END_DATE || '2023-01-01';
    const period = parseInt(process.argv[5]) || 14;
    const overbought = parseInt(process.argv[6]) || 70;
    const oversold = parseInt(process.argv[7]) || 30;
    
    console.log(`Parameters:`);
    console.log(`- Ticker: ${ticker}`);
    console.log(`- Date Range: ${startDate} to ${endDate}`);
    console.log(`- RSI Period: ${period}`);
    console.log(`- Overbought Level: ${overbought}`);
    console.log(`- Oversold Level: ${oversold}`);
    
    // Fetch historical data
    console.log(`\nFetching historical data for ${ticker}...`);
    const data = await fetchHistoricalData(ticker, startDate, endDate);
    console.log(`Fetched ${data.length} candles`);
    
    // Create strategy
    const strategy = new RSIStrategy({
      period,
      overbought,
      oversold,
      initialCapital: 10000
    });
    
    // Run backtest
    console.log(`\nRunning backtest...`);
    const results = runBacktest(data, strategy);
    
    // Calculate performance metrics
    const metrics = calculatePerformanceMetrics(results);
    
    // Display results
    console.log(`\nBacktest Results:`);
    console.log(`- Initial Capital: $${results.initialCapital.toFixed(2)}`);
    console.log(`- Final Capital: $${results.finalCapital.toFixed(2)}`);
    console.log(`- Total Return: ${(metrics.totalReturn * 100).toFixed(2)}%`);
    console.log(`- Annualized Return: ${(metrics.annualizedReturn * 100).toFixed(2)}%`);
    console.log(`- Sharpe Ratio: ${metrics.sharpeRatio.toFixed(2)}`);
    console.log(`- Max Drawdown: ${(metrics.maxDrawdown * 100).toFixed(2)}%`);
    console.log(`- Win Rate: ${(metrics.winRate * 100).toFixed(2)}%`);
    console.log(`- Profit Factor: ${metrics.profitFactor.toFixed(2)}`);
    console.log(`- Number of Trades: ${results.trades.length}`);
    
    // Display last few trades
    console.log(`\nLast 5 Trades:`);
    const lastTrades = results.trades.slice(-5);
    lastTrades.forEach((trade, i) => {
      console.log(`${i + 1}. ${trade.type.toUpperCase()} on ${trade.date} at $${trade.price.toFixed(2)} | P&L: ${trade.pnl ? '$' + trade.pnl.toFixed(2) : 'N/A'}`);
    });
    
    return { results, metrics };
  } catch (error) {
    console.error('Error running backtest:', error);
    throw error;
  }
}

// Run the backtest if this file is executed directly
if (process.argv[1].includes('backtest-rsi.js')) {
  runRSIBacktest()
    .then(() => console.log('\nBacktest completed successfully'))
    .catch(err => console.error('\nBacktest failed:', err));
}

export default runRSIBacktest;
