import React from 'react';
import { TrendingUp, TrendingDown, Plus, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../contexts/PortfolioContext';

const StockCard = ({ stock, showWatchlistButton = true }) => {
  const navigate = useNavigate();
  const { addToWatchlist, watchlist } = usePortfolio();

  // Add safety checks for stock data
  if (!stock || !stock.symbol) {
    console.error('Invalid stock data:', stock);
    return <div className="bg-red-50 p-4 rounded-lg text-red-600">Invalid stock data</div>;
  }

  const isPositive = (stock.change || 0) >= 0;
  const isInWatchlist = watchlist.some(item => item.symbol === stock.symbol);

  const handleStockClick = () => {
    navigate(`/stocks/${stock.symbol}`);
  };

  const handleWatchlistClick = (e) => {
    e.stopPropagation();
    if (!isInWatchlist) {
      addToWatchlist(stock);
    }
  };

  return (
    <div
      onClick={handleStockClick}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={stock.logo || `https://via.placeholder.com/48x48/6366f1/ffffff?text=${stock.symbol?.substring(0, 2) || 'ST'}`}
            alt={stock.name || stock.symbol}
            className="w-12 h-12 rounded-lg object-cover"
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/48x48/6366f1/ffffff?text=${stock.symbol?.substring(0, 2) || 'ST'}`;
            }}
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-groww-primary transition-colors">
              {stock.symbol}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{stock.name}</p>
          </div>
        </div>
        
        {showWatchlistButton && (
          <button
            onClick={handleWatchlistClick}
            className={`p-2 rounded-lg transition-colors ${
              isInWatchlist
                ? 'bg-red-50 dark:bg-red-900/30 text-red-500'
                : 'bg-gray-50 dark:bg-gray-700 text-gray-400 hover:bg-groww-light hover:text-groww-primary'
            }`}
          >
            <Heart className={`w-4 h-4 ${isInWatchlist ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{(stock.price || 0).toLocaleString()}</p>
            <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {isPositive ? '+' : ''}₹{Math.abs(stock.change || 0).toFixed(2)} ({isPositive ? '+' : ''}{(stock.changePercent || 0).toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>MCap: ₹{stock.marketCap || 'N/A'}Cr</span>
          <span>P/E: {stock.pe || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export default StockCard;