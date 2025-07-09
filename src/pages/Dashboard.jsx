import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Eye, Plus, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePortfolio } from '../contexts/PortfolioContext';
import { stocksData, marketIndices } from '../data/stocksData';
import { stocksService } from '../services/stocksService';
import StockCard from '../components/StockCard';

const Dashboard = () => {
  const { user } = useAuth();
  const { holdings, watchlist } = usePortfolio();
  const navigate = useNavigate();
  const [allStocks, setAllStocks] = useState(stocksData); // Start with static data as fallback

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    try {
      const stocks = await stocksService.getStocks();
      if (stocks && stocks.length > 0) {
        setAllStocks(stocks);
      }
    } catch (error) {
      console.error('Error loading stocks for dashboard:', error);
      // Keep using static data as fallback
    }
  };

  const portfolioValue = holdings.reduce((total, holding) => {
    const currentStock = allStocks.find(s => s.symbol === holding.symbol);
    return total + (currentStock ? currentStock.price * holding.quantity : 0);
  }, 0);

  const totalInvestment = holdings.reduce((total, holding) => {
    return total + (holding.avgPrice * holding.quantity);
  }, 0);

  const totalGain = portfolioValue - totalInvestment;
  const gainPercentage = totalInvestment > 0 ? (totalGain / totalInvestment) * 100 : 0;

  const topGainers = allStocks
    .filter(stock => stock.changePercent > 0)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 3);

  const topLosers = allStocks
    .filter(stock => stock.changePercent < 0)
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-groww-primary to-groww-secondary rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Good morning, {user?.name}! 👋</h1>
        <p className="text-groww-light">Here's what's happening with your investments today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div
          onClick={() => navigate('/portfolio')}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:border-groww-primary transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Portfolio Value</h3>
            <Eye className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{portfolioValue.toLocaleString()}</p>
            <div className={`flex items-center space-x-1 text-sm ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalGain >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>
                {totalGain >= 0 ? '+' : ''}₹{Math.abs(totalGain).toLocaleString()} ({totalGain >= 0 ? '+' : ''}{gainPercentage.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/wallet')}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:border-groww-primary transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Balance</h3>
            <Plus className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{user?.balance?.toLocaleString()}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ready to invest</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/portfolio')}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:border-groww-primary transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Holdings</h3>
            <ArrowUpRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{holdings.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active positions</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/watchlist')}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:border-groww-primary transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Watchlist</h3>
            <Eye className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{watchlist.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Stocks tracked</p>
          </div>
        </div>
      </div>

      {/* Market Indices */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          Market Indices
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Click to explore</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {marketIndices.map((index) => (
            <div
              key={index.name}
              onClick={() => navigate('/stocks')}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow-md transition-all duration-200"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">{index.name}</h3>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {index.value.toLocaleString()}
              </p>
              <div className={`flex items-center space-x-1 text-sm mt-1 ${
                index.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {index.changePercent >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>
                  {index.changePercent >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Gainers and Losers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            Top Gainers
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Click to view</span>
          </h2>
          <div className="space-y-3">
            {topGainers.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => navigate(`/stocks/${stock.symbol}`)}
                className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <img src={stock.logo} alt={stock.name} className="w-8 h-8 rounded" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{stock.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">₹{stock.price}</p>
                  <p className="text-sm text-green-600">+{stock.changePercent.toFixed(2)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            Top Losers
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Click to view</span>
          </h2>
          <div className="space-y-3">
            {topLosers.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => navigate(`/stocks/${stock.symbol}`)}
                className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <img src={stock.logo} alt={stock.name} className="w-8 h-8 rounded" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{stock.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">₹{stock.price}</p>
                  <p className="text-sm text-red-600">{stock.changePercent.toFixed(2)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;