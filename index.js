import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import modules
import { fetchHistoricalData } from './data/dataFetcher.js';
import { runBacktest } from './backtest/backtester.js';
import { calculatePerformanceMetrics } from './backtest/performance.js';
import MovingAverageCrossStrategy from './strategies/movingAverageCross.js';
import RSIStrategy from './strategies/rsiStrategy.js';

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static(join(__dirname, '../public')));

// API routes
app.get('/api/backtest', async (req, res) => {
  try {
    const { 
      ticker = process.env.DEFAULT_TICKER || 'AAPL',
      startDate = process.env.DEFAULT_START_DATE || '2020-01-01',
      endDate = process.env.DEFAULT_END_DATE || '2023-01-01',
      strategy = 'ma-cross',
      params = {}
    } = req.query;
    
    // Fetch historical data
    const data = await fetchHistoricalData(ticker, startDate, endDate);
    
    // Select strategy
    let selectedStrategy;
    if (strategy === 'ma-cross') {
      selectedStrategy = new MovingAverageCrossStrategy({
        shortPeriod: parseInt(params.shortPeriod) || 10,
        longPeriod: parseInt(params.longPeriod) || 50,
        ...params
      });
    } else if (strategy === 'rsi') {
      selectedStrategy = new RSIStrategy({
        period: parseInt(params.period) || 14,
        overbought: parseInt(params.overbought) || 70,
        oversold: parseInt(params.oversold) || 30,
        ...params
      });
    } else {
      return res.status(400).json({ error: 'Invalid strategy' });
    }
    
    // Run backtest
    const results = runBacktest(data, selectedStrategy);
    
    // Calculate performance metrics
    const metrics = calculatePerformanceMetrics(results);
    
    res.json({ results, metrics });
  } catch (error) {
    console.error('Backtest error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Algo Trader server running at http://localhost:${port}`);
});

// Export for direct script usage
export async function runSampleBacktest() {
  try {
    console.log('Running sample backtest...');
    
    // Fetch data for AAPL
    const ticker = process.env.DEFAULT_TICKER || 'AAPL';
    const startDate = process.env.DEFAULT_START_DATE || '2020-01-01';
    const endDate = process.env.DEFAULT_END_DATE || '2023-01-01';
    
    console.log(`Fetching data for ${ticker} from ${startDate} to ${endDate}...`);
    const data = await fetchHistoricalData(ticker, startDate, endDate);
    
    // Run MA Crossover strategy
    console.log('Running Moving Average Crossover strategy...');
    const maStrategy = new MovingAverageCrossStrategy({ shortPeriod: 10, longPeriod: 50 });
    const maResults = runBacktest(data, maStrategy);
    const maMetrics = calculatePerformanceMetrics(maResults);
    
    console.log('\nMoving Average Crossover Results:');
    console.log(`Total Return: ${(maMetrics.totalReturn * 100).toFixed(2)}%`);
    console.log(`Sharpe Ratio: ${maMetrics.sharpeRatio.toFixed(2)}`);
    console.log(`Max Drawdown: ${(maMetrics.maxDrawdown * 100).toFixed(2)}%`);
    console.log(`Win Rate: ${(maMetrics.winRate * 100).toFixed(2)}%`);
    
    // Run RSI strategy
    console.log('\nRunning RSI Mean Reversion strategy...');
    const rsiStrategy = new RSIStrategy({ period: 14, overbought: 70, oversold: 30 });
    const rsiResults = runBacktest(data, rsiStrategy);
    const rsiMetrics = calculatePerformanceMetrics(rsiResults);
    
    console.log('\nRSI Mean Reversion Results:');
    console.log(`Total Return: ${(rsiMetrics.totalReturn * 100).toFixed(2)}%`);
    console.log(`Sharpe Ratio: ${rsiMetrics.sharpeRatio.toFixed(2)}`);
    console.log(`Max Drawdown: ${(rsiMetrics.maxDrawdown * 100).toFixed(2)}%`);
    console.log(`Win Rate: ${(rsiMetrics.winRate * 100).toFixed(2)}%`);
    
    return { maResults, maMetrics, rsiResults, rsiMetrics };
  } catch (error) {
    console.error('Error running sample backtest:', error);
    throw error;
  }
}

// Run sample backtest if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSampleBacktest()
    .then(() => console.log('Sample backtest completed'))
    .catch(err => console.error('Sample backtest failed:', err));
}
