import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  PieChart,
  BarChart3,
  Target,
  DollarSign,
  Eye,
  EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { usePortfolio } from '../contexts/PortfolioContext';
import { stocksData } from '../data/stocksData';

const Portfolio = () => {
  const navigate = useNavigate();
  const { holdings, transactions } = usePortfolio();
  const [activeTab, setActiveTab] = useState('overview');
  const [showValues, setShowValues] = useState(true);

  const portfolioValue = holdings.reduce((total, holding) => {
    const currentStock = stocksData.find(s => s.symbol === holding.symbol);
    return total + (currentStock ? currentStock.price * holding.quantity : 0);
  }, 0);

  const totalInvestment = holdings.reduce((total, holding) => {
    return total + (holding.avgPrice * holding.quantity);
  }, 0);

  const totalGain = portfolioValue - totalInvestment;
  const gainPercentage = totalInvestment > 0 ? (totalGain / totalInvestment) * 100 : 0;

  const holdingsWithCurrentPrice = holdings.map(holding => {
    const currentStock = stocksData.find(s => s.symbol === holding.symbol);
    const currentValue = currentStock ? currentStock.price * holding.quantity : 0;
    const investedValue = holding.avgPrice * holding.quantity;
    const pnl = currentValue - investedValue;
    const pnlPercentage = investedValue > 0 ? (pnl / investedValue) * 100 : 0;

    return {
      ...holding,
      currentPrice: currentStock?.price || 0,
      currentValue,
      investedValue,
      pnl,
      pnlPercentage,
      logo: currentStock?.logo,
      sector: currentStock?.sector || 'Unknown'
    };
  });

  // Portfolio analytics
  const sectorAllocation = holdingsWithCurrentPrice.reduce((acc, holding) => {
    const sector = holding.sector;
    if (!acc[sector]) {
      acc[sector] = { value: 0, count: 0 };
    }
    acc[sector].value += holding.currentValue;
    acc[sector].count += 1;
    return acc;
  }, {});

  const sectorData = Object.entries(sectorAllocation).map(([sector, data]) => ({
    name: sector,
    value: data.value,
    count: data.count,
    percentage: portfolioValue > 0 ? (data.value / portfolioValue * 100).toFixed(1) : 0
  }));

  const COLORS = ['#00b386', '#00d09c', '#44d362', '#66e377', '#88f088', '#aaf599'];

  // Performance metrics
  const topPerformers = holdingsWithCurrentPrice
    .filter(h => h.pnlPercentage > 0)
    .sort((a, b) => b.pnlPercentage - a.pnlPercentage)
    .slice(0, 3);

  const bottomPerformers = holdingsWithCurrentPrice
    .filter(h => h.pnlPercentage < 0)
    .sort((a, b) => a.pnlPercentage - b.pnlPercentage)
    .slice(0, 3);

  const formatCurrency = (amount) => {
    if (!showValues) return '••••••';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="portfolio-content space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Track your investments and performance</p>
        </div>
        <button
          onClick={() => setShowValues(!showValues)}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[44px] self-start sm:self-auto"
        >
          {showValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span className="text-sm sm:text-base">{showValues ? 'Hide Values' : 'Show Values'}</span>
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Portfolio Value</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(portfolioValue)}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Investment</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalInvestment)}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-2 rounded-lg ${totalGain >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              {totalGain >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total P&L</h3>
          </div>
          <div className="flex items-center space-x-2">
            <p className={`text-3xl font-bold ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {showValues ? `${totalGain >= 0 ? '+' : ''}${formatCurrency(Math.abs(totalGain))}` : '••••••'}
            </p>
          </div>
          <p className={`text-sm ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {showValues ? `${totalGain >= 0 ? '+' : ''}${gainPercentage.toFixed(2)}%` : '••••'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Holdings</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{holdings.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {sectorData.length} sectors
          </p>
        </div>
      </div>

      {/* Analytics Section */}
      {holdings.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sector Allocation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sector Allocation</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), 'Value']}
                    labelStyle={{ color: '#374151' }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {sectorData.map((sector, index) => (
                <div key={sector.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{sector.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {sector.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Overview</h3>

            {/* Top Performers */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-green-600 mb-3">Top Performers</h4>
              <div className="space-y-2">
                {topPerformers.length > 0 ? topPerformers.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{stock.symbol}</span>
                    <span className="text-sm font-semibold text-green-600">
                      +{stock.pnlPercentage.toFixed(2)}%
                    </span>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No positive performers</p>
                )}
              </div>
            </div>

            {/* Bottom Performers */}
            <div>
              <h4 className="text-sm font-medium text-red-600 mb-3">Needs Attention</h4>
              <div className="space-y-2">
                {bottomPerformers.length > 0 ? bottomPerformers.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{stock.symbol}</span>
                    <span className="text-sm font-semibold text-red-600">
                      {stock.pnlPercentage.toFixed(2)}%
                    </span>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No underperformers</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 relative z-10">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto portfolio-tabs">
            {['overview', 'holdings', 'transactions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm capitalize transition-colors whitespace-nowrap min-h-[44px] flex items-center ${
                  activeTab === tab
                    ? 'border-groww-primary text-groww-primary'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Portfolio Overview</h3>
              {holdings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {holdingsWithCurrentPrice.map((holding) => (
                    <div
                      key={holding.symbol}
                      onClick={() => navigate(`/stocks/${holding.symbol}`)}
                      className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-lg hover:border-groww-primary transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={holding.logo || `https://via.placeholder.com/40x40/6366f1/ffffff?text=${holding.symbol?.substring(0, 2) || 'ST'}`}
                          alt={holding.name || holding.symbol}
                          className="w-10 h-10 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.src = `https://via.placeholder.com/40x40/6366f1/ffffff?text=${holding.symbol?.substring(0, 2) || 'ST'}`;
                          }}
                        />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white group-hover:text-groww-primary transition-colors">
                            {holding.name || holding.symbol}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{holding.symbol}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{holding.quantity} shares</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Current Value</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(holding.currentValue)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">P&L</span>
                          <span className={`text-sm font-medium ${holding.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {showValues ? `${holding.pnl >= 0 ? '+' : ''}${formatCurrency(Math.abs(holding.pnl))}` : '••••••'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PieChart className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No holdings yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">Start investing to see your portfolio here</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'holdings' && (
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Holdings</h3>

              {holdingsWithCurrentPrice.length > 0 ? (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Avg Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Current Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Current Value
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            P&L
                          </th>
                        </tr>
                      </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {holdingsWithCurrentPrice.map((holding) => (
                        <tr
                          key={holding.symbol}
                          onClick={() => navigate(`/stocks/${holding.symbol}`)}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <img
                                src={holding.logo || `https://via.placeholder.com/40x40/6366f1/ffffff?text=${holding.symbol?.substring(0, 2) || 'ST'}`}
                                alt={holding.name || holding.symbol}
                                className="w-10 h-10 rounded-lg object-cover"
                                onError={(e) => {
                                  e.target.src = `https://via.placeholder.com/40x40/6366f1/ffffff?text=${holding.symbol?.substring(0, 2) || 'ST'}`;
                                }}
                              />
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white hover:text-groww-primary transition-colors">
                                  {holding.name || holding.symbol}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{holding.symbol}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {holding.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatCurrency(holding.avgPrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatCurrency(holding.currentPrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(holding.currentValue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${holding.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {showValues ? `${holding.pnl >= 0 ? '+' : ''}${formatCurrency(Math.abs(holding.pnl))}` : '••••••'}
                              <br />
                              <span className="text-xs">
                                ({showValues ? `${holding.pnl >= 0 ? '+' : ''}${holding.pnlPercentage.toFixed(2)}%` : '••••'})
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {holdingsWithCurrentPrice.map((holding) => (
                    <div
                      key={holding.symbol}
                      onClick={() => navigate(`/stocks/${holding.symbol}`)}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-lg hover:border-groww-primary transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={stocksData.find(s => s.symbol === holding.symbol)?.logo}
                            alt={holding.symbol}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{holding.symbol}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{holding.quantity} shares</p>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          holding.pnl >= 0
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {holding.pnl >= 0 ? '+' : ''}{holding.pnlPercentage.toFixed(2)}%
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Avg Price</p>
                          <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(holding.avgPrice)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Current Price</p>
                          <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(holding.currentPrice)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Current Value</p>
                          <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(holding.currentValue)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">P&L</p>
                          <p className={`font-medium ${
                            holding.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {holding.pnl >= 0 ? '+' : ''}{formatCurrency(holding.pnl)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No holdings yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">Start investing to see your portfolio here</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Transactions</h3>

              {transactions.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div key={transaction.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-lg hover:border-groww-primary transition-all duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            transaction.type === 'BUY' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                          }`}>
                            {transaction.type === 'BUY' ? (
                              <TrendingUp className="w-5 h-5 text-green-600" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                              {transaction.type} {transaction.symbol}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              {transaction.quantity} shares at {formatCurrency(transaction.price)}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {new Date(transaction.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Amount - Mobile */}
                        <div className="sm:hidden">
                          <p className={`font-semibold text-lg ${
                            transaction.type === 'BUY' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {transaction.type === 'BUY' ? '-' : '+'}
                            {formatCurrency(transaction.total)}
                          </p>
                        </div>

                        {/* Amount - Desktop */}
                        <div className="hidden sm:block text-right flex-shrink-0">
                          <p className={`font-semibold text-lg ${
                            transaction.type === 'BUY' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {transaction.type === 'BUY' ? '-' : '+'}
                            {formatCurrency(transaction.total)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ArrowUpRight className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transactions yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">Your trading history will appear here</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Portfolio;