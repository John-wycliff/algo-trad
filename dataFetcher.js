import axios from 'axios';
import dotenv from 'dotenv';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '../../data');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Fetch historical market data from Alpha Vantage API
 * @param {string} symbol - Stock ticker symbol
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Array>} - Array of OHLCV candles
 */
export async function fetchHistoricalData(symbol, startDate, endDate) {
  const cacheFile = join(DATA_DIR, `${symbol}_${startDate}_${endDate}.json`);
  
  // Check if data is cached
  if (existsSync(cacheFile)) {
    console.log(`Using cached data for ${symbol}`);
    const cachedData = JSON.parse(readFileSync(cacheFile, 'utf8'));
    return cachedData;
  }
  
  // If no API key is provided, return mock data
  if (!process.env.ALPHA_VANTAGE_API_KEY || process.env.ALPHA_VANTAGE_API_KEY === 'your_api_key_here') {
    console.log('No API key provided, using mock data');
    return generateMockData(symbol, startDate, endDate);
  }
  
  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=full&apikey=${apiKey}`;
    
    console.log(`Fetching data for ${symbol} from Alpha Vantage...`);
    const response = await axios.get(url);
    
    if (response.data['Error Message']) {
      throw new Error(`Alpha Vantage API error: ${response.data['Error Message']}`);
    }
    
    const timeSeriesData = response.data['Time Series (Daily)'];
    if (!timeSeriesData) {
      throw new Error('No time series data returned from Alpha Vantage');
    }
    
    // Convert to array of candles and filter by date range
    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp = new Date(endDate).getTime();
    
    const candles = Object.entries(timeSeriesData)
      .map(([date, values]) => {
        const timestamp = new Date(date).getTime();
        return {
          date,
          timestamp,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseFloat(values['6. volume']),
          adjustedClose: parseFloat(values['5. adjusted close'])
        };
      })
      .filter(candle => candle.timestamp >= startTimestamp && candle.timestamp <= endTimestamp)
      .sort((a, b) => a.timestamp - b.timestamp); // Sort by date ascending
    
    // Cache the data
    writeFileSync(cacheFile, JSON.stringify(candles));
    
    return candles;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    
    // Fallback to mock data if API fails
    console.log('Falling back to mock data');
    return generateMockData(symbol, startDate, endDate);
  }
}

/**
 * Generate mock market data for testing
 * @param {string} symbol - Stock ticker symbol
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Array} - Array of OHLCV candles
 */
function generateMockData(symbol, startDate, endDate) {
  const candles = [];
  const startTimestamp = new Date(startDate).getTime();
  const endTimestamp = new Date(endDate).getTime();
  
  // Generate a random walk price series
  let currentPrice = 100; // Starting price
  let currentDate = new Date(startTimestamp);
  
  while (currentDate.getTime() <= endTimestamp) {
    // Skip weekends
    const day = currentDate.getDay();
    if (day !== 0 && day !== 6) { // 0 = Sunday, 6 = Saturday
      const dailyVolatility = 0.015; // 1.5% daily volatility
      const dailyReturn = (Math.random() - 0.5) * 2 * dailyVolatility;
      
      // Calculate OHLC based on random walk
      const open = currentPrice;
      const close = open * (1 + dailyReturn);
      const high = Math.max(open, close) * (1 + Math.random() * 0.005);
      const low = Math.min(open, close) * (1 - Math.random() * 0.005);
      const volume = Math.floor(Math.random() * 10000000) + 1000000;
      
      candles.push({
        date: currentDate.toISOString().split('T')[0],
        timestamp: currentDate.getTime(),
        open,
        high,
        low,
        close,
        volume,
        adjustedClose: close
      });
      
      currentPrice = close;
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return candles;
}
