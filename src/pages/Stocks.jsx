import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp } from 'lucide-react';
import { stocksService } from '../services/stocksService';
import StockCard from '../components/StockCard';

const Stocks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    setLoading(true);
    try {
      const stocksData = await stocksService.getStocks();
      setStocks(stocksData);

      // Preload stock images for better performance
      stocksData.forEach(stock => {
        if (stock.logo) {
          const img = new Image();
          img.src = stock.logo;
        }
      });
    } catch (error) {
      console.error('Error loading stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const sectors = ['All', ...new Set(stocks.map(stock => stock.sector))];

  const filteredStocks = stocks
    .filter(stock => {
      const matchesSearch = stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           stock.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector = selectedSector === 'All' || stock.sector === selectedSector;
      return matchesSearch && matchesSector;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return b.price - a.price;
        case 'change':
          return b.changePercent - a.changePercent;
        case 'marketCap':
          return parseFloat(b.marketCap.replace(',', '')) - parseFloat(a.marketCap.replace(',', ''));
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Stocks</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Discover and invest in your favorite companies</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <TrendingUp className="w-4 h-4" />
          <span className="hidden sm:inline">Market is Open</span>
          <span className="sm:hidden">Open</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search - Full Width on Mobile */}
          <div className="relative col-span-full sm:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-groww-primary focus:border-transparent min-h-[44px]"
            />
          </div>

          {/* Sector Filter */}
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-groww-primary focus:border-transparent min-h-[44px] text-sm sm:text-base"
          >
            {sectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-groww-primary focus:border-transparent min-h-[44px] text-sm sm:text-base"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="change">Sort by Change</option>
            <option value="marketCap">Sort by Market Cap</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredStocks.length} stock{filteredStocks.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-groww-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredStocks.map((stock) => (
                <StockCard key={stock.symbol} stock={stock} />
              ))}
            </div>

            {filteredStocks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No stocks found matching your criteria</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Stocks;