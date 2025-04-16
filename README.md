# Algo Trader

A modular algorithmic trading system for backtesting and strategy development.

## Features

- 📈 Fetch historical market data from Alpha Vantage API
- 📊 Implement and backtest trading strategies
- 🧮 Calculate performance metrics (returns, drawdown, Sharpe ratio)
- 📉 Visualize backtest results
- 🔄 Extensible architecture for adding custom strategies

## Included Strategies

- Moving Average Crossover
- RSI Mean Reversion

## Getting Started

1. Clone this repository
2. Install dependencies: `npm install`
3. Add your Alpha Vantage API key to `.env` file
4. Run a backtest: `npm run backtest`
5. Start the web interface: `npm run dev`

## Project Structure

```
/
├── src/
│   ├── data/         # Data fetching and management
│   ├── strategies/   # Trading strategies
│   ├── backtest/     # Backtesting engine
│   ├── risk/         # Risk management
│   ├── utils/        # Utility functions
│   └── index.js      # Main entry point
├── examples/         # Example scripts
└── config/           # Configuration
```

## Extending the System

### Adding a New Strategy

Create a new file in the `src/strategies` directory that extends the `StrategyBase` class:

```javascript
import StrategyBase from './strategyBase.js';

class MyCustomStrategy extends StrategyBase {
  constructor(params) {
    super(params);
    // Initialize strategy-specific parameters
  }

  analyze(candle, position) {
    // Implement your strategy logic here
    // Return signal: 1 (buy), -1 (sell), or 0 (hold)
  }
}

export default MyCustomStrategy;
```

## Disclaimer

This software is for educational purposes only. Use at your own risk. Trading financial instruments involves significant risk of loss.
