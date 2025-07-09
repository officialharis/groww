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

  // Load user-specific transactions from backend
  useEffect(() => {
    if (user && portfolioTransactions) {
      // Use actual transactions from portfolio context
      setTransactions(portfolioTransactions);
    } else {
      // If no transactions, show empty array
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

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const exportTransactions = () => {
    // In a real app, this would generate and download a CSV/PDF
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transaction History</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage all your trading and wallet transactions
          </p>
        </div>
        <button
          onClick={exportTransactions}
          className="flex items-center space-x-2 px-4 py-2 bg-groww-primary text-white rounded-lg hover:bg-groww-dark transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-groww-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-groww-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-groww-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-groww-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Transactions ({filteredTransactions.length})
            </h3>
          </div>

          {currentTransactions.length > 0 ? (
            <div className="space-y-3">
              {currentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transaction.symbol ? `${transaction.symbol} - ${transaction.name}` : transaction.description}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span>{formatDate(transaction.date)}</span>
                        <span>ID: {transaction.id}</span>
                        {transaction.quantity && (
                          <span>Qty: {transaction.quantity}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
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
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of{' '}
                {filteredTransactions.length} results
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                  {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
