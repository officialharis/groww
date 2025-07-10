import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Plus, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../contexts/PortfolioContext';

const StockCard = ({ stock, showWatchlistButton = true }) => {
  const navigate = useNavigate();
  const { addToWatchlist, watchlist } = usePortfolio();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Add safety checks for stock data
  if (!stock || !stock.symbol) {
    console.error('Invalid stock data:', stock);
    return <div className="bg-red-50 p-4 rounded-lg text-red-600">Invalid stock data</div>;
  }

  const isPositive = (stock.change || 0) >= 0;
  const isInWatchlist = watchlist.some(item => item.symbol === stock.symbol);

  // Generate fallback image with better styling and caching
  const generateFallbackImage = (symbol) => {
    const colors = [
      '6366f1', '8b5cf6', 'ec4899', 'ef4444', 'f97316',
      '10b981', '06b6d4', '3b82f6', '6366f1', '8b5cf6'
    ];
    const colorIndex = symbol.charCodeAt(0) % colors.length;
    const color = colors[colorIndex];
    const initials = symbol.substring(0, 2).toUpperCase();
    return `https://ui-avatars.com/api/?name=${initials}&background=${color}&color=ffffff&size=48&font-size=0.6&bold=true&format=svg`;
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  // Preload image for better performance
  useEffect(() => {
    if (stock.logo) {
      const img = new Image();
      img.onload = () => {
        // Image is preloaded and cached
      };
      img.onerror = () => {
        setImageError(true);
      };
      img.src = stock.logo;
    }
  }, [stock.logo]);

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
      className="stock-card bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="stock-image-container flex-shrink-0">
            {imageLoading && (
              <div className="image-loading-spinner">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-groww-primary rounded-full animate-spin"></div>
              </div>
            )}
            <img
              src={imageError ? generateFallbackImage(stock.symbol) : (stock.logo || generateFallbackImage(stock.symbol))}
              alt={stock.name || stock.symbol}
              className={`stock-image w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-contain bg-white p-1 ${
                imageLoading ? 'stock-image-loading' : 'stock-image-loaded'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-groww-primary transition-colors truncate">
              {stock.symbol}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{stock.name}</p>
          </div>
        </div>
        
        {showWatchlistButton && (
          <button
            onClick={handleWatchlistClick}
            className={`p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
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
          <div className="min-w-0 flex-1">
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">₹{(stock.price || 0).toLocaleString()}</p>
            <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              <span className="text-xs sm:text-sm font-medium truncate">
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