import React from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext';
import StockCard from '../components/StockCard';

const Watchlist = () => {
  const { watchlist, removeFromWatchlist } = usePortfolio();



  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Watchlist</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Keep track of stocks you're interested in</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Heart className="w-4 h-4 text-red-500 fill-current" />
          <span>{watchlist.length} stocks</span>
        </div>
      </div>

      {/* Watchlist Items */}
      {watchlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {watchlist.map((stock) => (
            <div key={stock.symbol} className="relative">
              <StockCard stock={stock} showWatchlistButton={false} />
              <button
                onClick={() => removeFromWatchlist(stock.symbol)}
                className="absolute top-2 sm:top-4 right-2 sm:right-4 p-2 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Remove from watchlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">Your watchlist is empty</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
            Add stocks to your watchlist to keep track of companies you're interested in
          </p>
          <a
            href="/stocks"
            className="inline-flex items-center px-4 sm:px-6 py-3 bg-groww-primary text-white rounded-lg font-semibold hover:bg-groww-dark transition-colors min-h-[44px]"
          >
            Browse Stocks
          </a>
        </div>
      )}
    </div>
  );
};

export default Watchlist;