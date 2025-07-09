// Centralized API configuration
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? '/api'
  : 'http://localhost:5001/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('groww_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: (email, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  register: (name, email, password) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    }),

  getProfile: () => apiRequest('/user/profile'),

  verifyToken: () => apiRequest('/user/profile')
};

// Stocks API
export const stocksAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiRequest(`/stocks?${queryParams}`);
  },

  getBySymbol: (symbol) => apiRequest(`/stocks/${symbol}`),

  getChart: (symbol, period = '1M') => 
    apiRequest(`/stocks/${symbol}/chart?period=${period}`),

  search: (query, limit = 10) => 
    apiRequest(`/stocks/search/${query}?limit=${limit}`),

  getTrending: (type = 'gainers', limit = 10) => 
    apiRequest(`/market/trending?type=${type}&limit=${limit}`),

  getMarketIndices: () => apiRequest('/market/indices'),

  getSectors: () => apiRequest('/stocks/meta/sectors')
};

// Portfolio API
export const portfolioAPI = {
  getHoldings: () => apiRequest('/portfolio'),

  buyStock: (symbol, name, quantity, price) => 
    apiRequest('/portfolio/buy', {
      method: 'POST',
      body: JSON.stringify({ symbol, name, quantity, price })
    }),

  sellStock: (symbol, quantity, price) => 
    apiRequest('/portfolio/sell', {
      method: 'POST',
      body: JSON.stringify({ symbol, quantity, price })
    }),

  getTransactions: () => apiRequest('/transactions')
};

// Watchlist API
export const watchlistAPI = {
  get: () => apiRequest('/watchlist'),

  add: (symbol, name) => 
    apiRequest('/watchlist', {
      method: 'POST',
      body: JSON.stringify({ symbol, name })
    }),

  remove: (symbol) => 
    apiRequest(`/watchlist/${symbol}`, {
      method: 'DELETE'
    })
};

// Payment API (for future Razorpay integration)
export const paymentAPI = {
  createOrder: (amount) => 
    apiRequest('/payment/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount })
    }),

  verifyPayment: (paymentData) => 
    apiRequest('/payment/verify', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    }),

  addFunds: (amount, paymentId) => 
    apiRequest('/payment/add-funds', {
      method: 'POST',
      body: JSON.stringify({ amount, paymentId })
    })
};

// Export the base URL for any custom requests
export { API_BASE_URL };
