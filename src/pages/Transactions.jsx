import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Download, 
  Search, 
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePortfolio } from '../contexts/PortfolioContext';

const Transactions = () => {
  const { user } = useAuth();
  const { transactions: portfolioTransactions } = usePortfolio();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [dateRange, setDateRange] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    if (user && portfolioTransactions) {
      setTransactions(portfolioTransactions);
    } else {
      setTransactions([]);
    }
  }, [user, portfolioTransactions]);

  // Filter transactions
  useEffect(() => {
    let filtered = transactions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(txn => 
        (txn.symbol && txn.symbol.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (txn.name && txn.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (txn.description && txn.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (txn.id && txn.id.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Type filter
    if (filterType !== 'ALL') {
      filtered = filtered.filter(txn => txn.type === filterType);
    }

    // Status filter
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(txn => txn.status === filterStatus);
    }

    // Date range filter
    if (dateRange !== 'ALL') {
      const now = new Date();
      let filterDate = new Date();

      switch (dateRange) {
        case '7D':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30D':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '90D':
          filterDate.setDate(now.getDate() - 90);
          break;
        default:
          filterDate = null;
      }

      if (filterDate) {
        filtered = filtered.filter(txn => new Date(txn.date) >= filterDate);
      }
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  }, [transactions, searchTerm, filterType, filterStatus, dateRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'BUY':
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case 'SELL':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'CREDIT':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'WITHDRAWAL':
        return <TrendingDown className="w-4 h-4 text-orange-600" />;
      case 'DIVIDEND':
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
      default:
        return <ArrowUpRight className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const exportTransactions = () => {
    const csvContent = filteredTransactions.map(txn => {
      return [
        txn.id,
        txn.type,
        txn.symbol || '',
        txn.name || txn.description || '',
        txn.quantity || '',
        txn.price || '',
        txn.total || txn.amount || '',
        txn.status,
        formatDate(txn.date)
      ].join(',');
    }).join('\n');

    const header = 'ID,Type,Symbol,Description,Quantity,Price,Amount,Status,Date\n';
    const blob = new Blob([header + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Transaction History</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            View and manage all your trading and wallet transactions
          </p>
        </div>
        <button
          onClick={exportTransactions}
          className="flex items-center space-x-2 px-4 py-2 bg-groww-primary text-white rounded-lg hover:bg-groww-dark transition-colors min-h-[44px] self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm sm:text-base">Export</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search - Full Width on Mobile */}
          <div className="relative col-span-full sm:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-groww-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[44px]"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-groww-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[44px] text-sm sm:text-base"
          >
            <option value="ALL">All Types</option>
            <option value="BUY">Buy Orders</option>
            <option value="SELL">Sell Orders</option>
            <option value="CREDIT">Credits</option>
            <option value="WITHDRAWAL">Withdrawals</option>
            <option value="DIVIDEND">Dividends</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-groww-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[44px] text-sm sm:text-base"
          >
            <option value="ALL">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-groww-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[44px] text-sm sm:text-base"
          >
            <option value="ALL">All Time</option>
            <option value="7D">Last 7 Days</option>
            <option value="30D">Last 30 Days</option>
            <option value="90D">Last 90 Days</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterType('ALL');
              setFilterStatus('ALL');
              setDateRange('ALL');
            }}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-h-[44px] text-sm sm:text-base col-span-full sm:col-span-1"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Transactions ({filteredTransactions.length})
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 sm:hidden">
              Showing {currentTransactions.length} of {filteredTransactions.length}
            </p>
          </div>

          {currentTransactions.length > 0 ? (
            <div className="space-y-3">
              {currentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors space-y-3 sm:space-y-0"
                >
                  {/* Mobile Layout */}
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Title and Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                          {transaction.symbol ? `${transaction.symbol} - ${transaction.name}` : transaction.description}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium self-start ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>

                      {/* Transaction Details */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 space-y-1 sm:space-y-0">
                        <span className="truncate">{formatDate(transaction.date)}</span>
                        <span className="hidden sm:inline">ID: {transaction.id.slice(-8)}</span>
                        <span className="sm:hidden">ID: {transaction.id.slice(-6)}</span>
                        {transaction.quantity && (
                          <span>Qty: {transaction.quantity}</span>
                        )}
                      </div>

                      {/* Amount - Mobile */}
                      <div className="sm:hidden mt-2">
                        <p className={`font-semibold text-lg ${
                          ['BUY', 'WITHDRAWAL'].includes(transaction.type)
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}>
                          {['BUY', 'WITHDRAWAL'].includes(transaction.type) ? '-' : '+'}
                          {formatCurrency(transaction.total || transaction.amount)}
                        </p>
                        {transaction.fees && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Fees: {formatCurrency(transaction.fees)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount - Desktop */}
                  <div className="hidden sm:block text-right flex-shrink-0">
                    <p className={`font-semibold text-lg ${
                      ['BUY', 'WITHDRAWAL'].includes(transaction.type)
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}>
                      {['BUY', 'WITHDRAWAL'].includes(transaction.type) ? '-' : '+'}
                      {formatCurrency(transaction.total || transaction.amount)}
                    </p>
                    {transaction.fees && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Fees: {formatCurrency(transaction.fees)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transactions found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your filters to see more results
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of{' '}
                {filteredTransactions.length} results
              </p>
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 min-h-[44px] flex items-center">
                  {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
