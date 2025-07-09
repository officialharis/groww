import React, { useState, useEffect } from 'react';
import { 
  Wallet as WalletIcon, 
  Plus, 
  Minus, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft,
  History,
  DollarSign,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePortfolio } from '../contexts/PortfolioContext';

const Wallet = () => {
  const { user, updateBalance } = useAuth();
  const { transactions: portfolioTransactions } = usePortfolio();
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [transactions, setTransactions] = useState([]);

  // Load user-specific transactions from portfolio context
  useEffect(() => {
    if (user && portfolioTransactions) {
      // For now, show all transactions but format them for wallet display
      // Later we can filter for wallet-specific transactions when they exist
      const walletTransactions = portfolioTransactions.map(txn => ({
        ...txn,
        // Convert stock transactions to wallet-friendly format
        description: txn.description ||
          (txn.type === 'BUY' ? `Stock Purchase - ${txn.symbol}` :
           txn.type === 'SELL' ? `Stock Sale - ${txn.symbol}` :
           `${txn.type} Transaction`),
        // Map transaction types for wallet display
        type: txn.type === 'BUY' ? 'DEBIT' :
              txn.type === 'SELL' ? 'CREDIT' :
              txn.type
      }));
      setTransactions(walletTransactions);
    } else {
      // If no transactions, show empty array
      setTransactions([]);
    }
  }, [user, portfolioTransactions]);

  const handleAddFunds = async () => {
    const amount = parseFloat(addFundsAmount);
    if (amount > 0) {
      try {
        // Create wallet transaction for fund addition
        const token = localStorage.getItem('groww_token');
        const response = await fetch('http://localhost:5000/api/wallet/add-funds', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: amount,
            method: 'UPI', // or 'CARD', 'NETBANKING'
            description: 'Funds Added via UPI'
          })
        });

        if (response.ok) {
          const data = await response.json();
          // Update user balance
          updateBalance(user.balance + amount);
          setAddFundsAmount('');
          setShowAddFunds(false);
          alert('Funds added successfully!');

          // Refresh transactions to show the new transaction
          window.location.reload(); // Simple refresh for now
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Add funds error:', error);
        // Fallback to demo mode
        updateBalance(user.balance + amount);
        setAddFundsAmount('');
        setShowAddFunds(false);
        alert('Funds added successfully! (Demo mode)');
      }
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (amount > 0 && amount <= user.balance) {
      try {
        // Create wallet transaction for withdrawal
        const token = localStorage.getItem('groww_token');
        const response = await fetch('http://localhost:5000/api/wallet/withdraw', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: amount,
            description: 'Funds Withdrawn to Bank'
          })
        });

        if (response.ok) {
          const data = await response.json();
          // Update user balance
          updateBalance(user.balance - amount);
          setWithdrawAmount('');
          setShowWithdraw(false);
          alert('Withdrawal request submitted!');

          // Refresh transactions to show the new transaction
          window.location.reload(); // Simple refresh for now
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Withdraw error:', error);
        // Fallback to demo mode
        updateBalance(user.balance - amount);
        setWithdrawAmount('');
        setShowWithdraw(false);
        alert('Withdrawal request submitted! (Demo mode)');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Wallet</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your funds and transactions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddFunds(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-groww-primary text-white rounded-lg hover:bg-groww-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Funds</span>
          </button>
          <button
            onClick={() => setShowWithdraw(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Minus className="w-4 h-4" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-groww-primary to-groww-secondary rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <WalletIcon className="w-8 h-8" />
            <h2 className="text-xl font-semibold">Available Balance</h2>
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <div className="space-y-2">
          <p className="text-3xl font-bold">
            {showBalance ? formatCurrency(user?.balance || 0) : '••••••'}
          </p>
          <p className="text-groww-light">Ready to invest</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <ArrowDownLeft className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Add Money</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Add funds instantly via UPI, Net Banking, or Cards
          </p>
          <button
            onClick={() => setShowAddFunds(true)}
            className="w-full py-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            Add Funds
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ArrowUpRight className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Withdraw</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Withdraw funds to your linked bank account
          </p>
          <button
            onClick={() => setShowWithdraw(true)}
            className="w-full py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            Withdraw
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <History className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">History</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            View all your wallet transactions
          </p>
          <button
            onClick={() => setActiveTab('history')}
            className="w-full py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            View History
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {['overview', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-groww-primary text-groww-primary'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <History className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mb-2">No transactions yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Add funds or start trading to see your transaction history
                    </p>
                  </div>
                ) : (
                  transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'CREDIT' 
                          ? 'bg-green-100 dark:bg-green-900/30' 
                          : 'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        {transaction.type === 'CREDIT' ? (
                          <ArrowDownLeft className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'CREDIT' ? '+' : '-'}{formatCurrency(transaction.amount || transaction.total)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.status}</p>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h3>
              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                      <History className="w-10 h-10 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transaction history</h4>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      Your wallet transactions will appear here once you start adding funds or trading stocks.
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => setShowAddFunds(true)}
                        className="px-4 py-2 bg-groww-primary text-white rounded-lg hover:bg-groww-dark transition-colors"
                      >
                        Add Funds
                      </button>
                    </div>
                  </div>
                ) : (
                  transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'CREDIT' 
                          ? 'bg-green-100 dark:bg-green-900/30' 
                          : 'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        {transaction.type === 'CREDIT' ? (
                          <ArrowDownLeft className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'CREDIT' ? '+' : '-'}{formatCurrency(transaction.amount || transaction.total)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.status}</p>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Funds Modal */}
      {showAddFunds && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Funds</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={addFundsAmount}
                  onChange={(e) => setAddFundsAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-groww-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter amount"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddFunds(false)}
                  className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFunds}
                  className="flex-1 py-2 bg-groww-primary text-white rounded-lg hover:bg-groww-dark transition-colors"
                >
                  Add Funds
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Withdraw Funds</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={user?.balance}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-groww-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter amount"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Available: {formatCurrency(user?.balance || 0)}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowWithdraw(false)}
                  className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
