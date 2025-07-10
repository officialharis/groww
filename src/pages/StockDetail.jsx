import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, TrendingUp, TrendingDown, Plus, Minus } from 'lucide-react';
import { stocksData, generateChartData } from '../data/stocksData';
import { stocksService } from '../services/stocksService';
import { usePortfolio } from '../contexts/PortfolioContext';
import StockChart from '../components/StockChart';

const StockDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { buyStock, sellStock, addToWatchlist, watchlist, holdings } = usePortfolio();

  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('1D');
  const [orderType, setOrderType] = useState('BUY');
  const [quantity, setQuantity] = useState(1);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    loadStock();
  }, [symbol]);

  const loadStock = async () => {
    setLoading(true);
    setError(null);
    try {
      let stockData = await stocksService.getStock(symbol);

      if (!stockData) {
        stockData = stocksData.find(s => s.symbol === symbol);
      }

      if (stockData) {
        setStock(stockData);
      } else {
        setError('Stock not found');
      }
    } catch (err) {
      console.error('Error loading stock:', err);
      setError('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-groww-primary"></div>
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Stock Not Found</h2>
          <p className="text-gray-500 mb-4">
            {error || `The stock "${symbol}" could not be found.`}
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate('/stocks')}
              className="px-4 py-2 bg-groww-primary text-white rounded-lg hover:bg-groww-dark transition-colors"
            >
              Browse Stocks
            </button>
          </div>
        </div>
      </div>
    );
  }

  const chartData = generateChartData(stock.price);
  const isPositive = stock.change >= 0;
  const isInWatchlist = watchlist.some(item => item.symbol === stock.symbol);
  const holding = holdings.find(h => h.symbol === stock.symbol);

  const handleOrder = async () => {
    try {
      let result;
      if (orderType === 'BUY') {
        result = await buyStock(stock, quantity, stock.price);
      } else {
        result = await sellStock(stock.symbol, quantity, stock.price);
      }

      if (result && result.success) {
        setShowOrderModal(false);
        setQuantity(1);
        // Show success message
        alert(`${orderType} order completed successfully!`);
      } else {
        alert(`${orderType} order failed: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Order error:', error);
      alert(`${orderType} order failed: ${error.message}`);
    }
  };

  const tabs = ['1D', '1W', '1M', '3M', '1Y'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{stock.name}</h1>
          <p className="text-gray-600">{stock.symbol} • {stock.sector}</p>
        </div>
        <button
          onClick={() => addToWatchlist(stock)}
          className={`p-2 rounded-lg transition-colors ${
            isInWatchlist 
              ? 'bg-red-50 text-red-500' 
              : 'bg-gray-50 text-gray-400 hover:bg-groww-light hover:text-groww-primary'
          }`}
        >
          <Heart className={`w-5 h-5 ${isInWatchlist ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-3xl font-bold text-gray-900">₹{stock.price.toLocaleString()}</p>
                <div className={`flex items-center space-x-1 mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  <span className="font-medium">
                    {isPositive ? '+' : ''}₹{Math.abs(stock.change).toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-groww-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            
            <StockChart data={chartData} color={isPositive ? '#00b386' : '#ef4444'} />
          </div>

          {/* Stock Info */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600">Market Cap</p>
                <p className="font-semibold text-gray-900">₹{stock.marketCap}Cr</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">P/E Ratio</p>
                <p className="font-semibold text-gray-900">{stock.pe}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sector</p>
                <p className="font-semibold text-gray-900">{stock.sector}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">52W High</p>
                <p className="font-semibold text-gray-900">₹{(stock.price * 1.2).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Panel */}
        <div className="space-y-6">
          {/* Current Holding */}
          {holding && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Holding</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity</span>
                  <span className="font-semibold">{holding.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Price</span>
                  <span className="font-semibold">₹{holding.avgPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Value</span>
                  <span className="font-semibold">₹{(stock.price * holding.quantity).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">P&L</span>
                  <span className={`font-semibold ${
                    (stock.price - holding.avgPrice) * holding.quantity >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ₹{((stock.price - holding.avgPrice) * holding.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Trading Actions */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => { setOrderType('BUY'); setShowOrderModal(true); }}
                className="flex-1 bg-groww-primary text-white py-3 rounded-lg font-semibold hover:bg-groww-dark transition-colors"
              >
                Buy
              </button>
              {holding && (
                <button
                  onClick={() => { setOrderType('SELL'); setShowOrderModal(true); }}
                  className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  Sell
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {orderType} {stock.symbol}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-groww-primary focus:border-transparent text-center"
                    min="1"
                    max={orderType === 'SELL' ? holding?.quantity : undefined}
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                    disabled={orderType === 'SELL' && holding && quantity >= holding.quantity}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Price per share</span>
                  <span className="font-semibold">₹{stock.price}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Quantity</span>
                  <span className="font-semibold">{quantity}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">₹{(stock.price * quantity).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOrder}
                  className={`flex-1 px-4 py-2 rounded-lg text-white font-semibold transition-colors ${
                    orderType === 'BUY' 
                      ? 'bg-groww-primary hover:bg-groww-dark' 
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {orderType} Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockDetail;