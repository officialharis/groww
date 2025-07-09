const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? '/api'
  : 'http://localhost:5000/api';

// Fallback stock data in case backend is not available
const fallbackStocks = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    price: 2456.75,
    change: 45.30,
    changePercent: 1.88,
    marketCap: "16,65,432",
    sector: "Oil & Gas",
    pe: 24.5,
    logo: "https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services Ltd",
    price: 3678.90,
    change: -23.45,
    changePercent: -0.63,
    marketCap: "13,42,567",
    sector: "IT Services",
    pe: 28.3,
    logo: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
  },
  {
    symbol: "HDFC",
    name: "HDFC Bank Ltd",
    price: 1543.20,
    change: 12.85,
    changePercent: 0.84,
    marketCap: "11,78,943",
    sector: "Banking",
    pe: 18.7,
    logo: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
  },
  {
    symbol: "BHARTIARTL",
    name: "Bharti Airtel Ltd",
    price: 876.90,
    change: 23.45,
    changePercent: 2.75,
    marketCap: "4,98,765",
    sector: "Telecom",
    pe: 35.6,
    logo: "https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
  },
  {
    symbol: "ASIANPAINT",
    name: "Asian Paints Ltd",
    price: 3234.50,
    change: -89.60,
    changePercent: -2.70,
    marketCap: "3,10,987",
    sector: "Paints",
    pe: 67.4,
    logo: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
  },
  {
    symbol: "INFY",
    name: "Infosys Ltd",
    price: 1432.60,
    change: 34.50,
    changePercent: 2.47,
    marketCap: "5,98,432",
    sector: "IT Services",
    pe: 24.8,
    logo: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
  },
  {
    symbol: "HINDUNILVR",
    name: "Hindustan Unilever Ltd",
    price: 2567.80,
    change: 67.30,
    changePercent: 2.69,
    marketCap: "6,02,145",
    sector: "FMCG",
    pe: 58.9,
    logo: "https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
  },
  {
    symbol: "SBIN",
    name: "State Bank of India",
    price: 623.75,
    change: -15.40,
    changePercent: -2.41,
    marketCap: "5,56,789",
    sector: "Banking",
    pe: 12.3,
    logo: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank Ltd",
    price: 987.45,
    change: -8.25,
    changePercent: -0.83,
    marketCap: "6,89,234",
    sector: "Banking",
    pe: 16.7,
    logo: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
  }
];

export const stocksService = {
  // Get all stocks
  async getStocks(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/stocks?${queryParams}`);
      
      if (response.ok) {
        const stocks = await response.json();
        return stocks;
      } else {
        console.warn('Failed to fetch stocks from backend, using fallback data');
        return fallbackStocks;
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
      return fallbackStocks;
    }
  },

  // Get single stock by symbol
  async getStock(symbol) {
    try {
      const response = await fetch(`${API_BASE_URL}/stocks/${symbol}`);

      if (response.ok) {
        const stock = await response.json();
        return stock;
      } else if (response.status === 404) {
        // Stock not found in backend, try fallback data
        console.warn(`Stock ${symbol} not found in backend, checking fallback data`);
        const fallbackStock = fallbackStocks.find(s => s.symbol === symbol);
        return fallbackStock || null;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
      // Try fallback data as last resort
      const fallbackStock = fallbackStocks.find(s => s.symbol === symbol);
      if (fallbackStock) {
        console.warn(`Using fallback data for stock ${symbol}`);
        return fallbackStock;
      }
      return null;
    }
  },

  // Get stock chart data
  async getStockChart(symbol, period = '1M') {
    try {
      const response = await fetch(`${API_BASE_URL}/stocks/${symbol}/chart?period=${period}`);
      
      if (response.ok) {
        const chartData = await response.json();
        return chartData;
      } else {
        // Generate fallback chart data
        return this.generateFallbackChartData();
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      return this.generateFallbackChartData();
    }
  },

  // Generate fallback chart data
  generateFallbackChartData(basePrice = 2500) {
    const data = [];
    const days = 30;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate random price variation
      const variation = (Math.random() - 0.5) * 100;
      const price = basePrice + variation + (Math.random() * 50 - 25);
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(price * 100) / 100
      });
    }
    
    return data;
  },

  // Get market indices
  async getMarketIndices() {
    try {
      const response = await fetch(`${API_BASE_URL}/market/indices`);
      
      if (response.ok) {
        const indices = await response.json();
        return indices;
      } else {
        return this.getFallbackIndices();
      }
    } catch (error) {
      console.error('Error fetching market indices:', error);
      return this.getFallbackIndices();
    }
  },

  // Get trending stocks
  async getTrendingStocks(type = 'gainers', limit = 10) {
    try {
      const response = await fetch(`${API_BASE_URL}/market/trending?type=${type}&limit=${limit}`);
      
      if (response.ok) {
        const stocks = await response.json();
        return stocks;
      } else {
        return fallbackStocks.slice(0, limit);
      }
    } catch (error) {
      console.error('Error fetching trending stocks:', error);
      return fallbackStocks.slice(0, limit);
    }
  },

  // Fallback market indices
  getFallbackIndices() {
    return [
      {
        name: "NIFTY 50",
        value: 19865.20,
        change: 245.30,
        changePercent: 1.25
      },
      {
        name: "SENSEX",
        value: 66589.93,
        change: 503.27,
        changePercent: 0.76
      },
      {
        name: "NIFTY BANK",
        value: 44732.85,
        change: -123.45,
        changePercent: -0.28
      },
      {
        name: "NIFTY IT",
        value: 30456.70,
        change: 892.15,
        changePercent: 3.02
      }
    ];
  }
};

// For backward compatibility, export the fallback data as stocksData
export const stocksData = fallbackStocks;

// Export market indices for backward compatibility
export const marketIndices = stocksService.getFallbackIndices();

// Generate chart data function for backward compatibility
export const generateChartData = (basePrice = 2500) => {
  return stocksService.generateFallbackChartData(basePrice);
};
