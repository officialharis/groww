import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? '/api'
  : 'http://localhost:5001/api';

const PortfolioContext = createContext();

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

export const PortfolioProvider = ({ children }) => {
  const { user, refreshUser } = useAuth();
  const [holdings, setHoldings] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (user) {
      loadPortfolioData();
    } else {
      // Clear data when user logs out
      setHoldings([]);
      setWatchlist([]);
      setTransactions([]);
    }
  }, [user]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('groww_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const loadPortfolioData = async () => {
    try {
      const token = localStorage.getItem('groww_token');
      if (!token) return;

      // Load holdings
      const holdingsResponse = await fetch(`${API_BASE_URL}/portfolio`, {
        headers: getAuthHeaders()
      });
      if (holdingsResponse.ok) {
        const holdingsData = await holdingsResponse.json();
        setHoldings(holdingsData);
      }

      // Load watchlist
      const watchlistResponse = await fetch(`${API_BASE_URL}/watchlist`, {
        headers: getAuthHeaders()
      });
      if (watchlistResponse.ok) {
        const watchlistData = await watchlistResponse.json();

        // Transform watchlist data to include stock information
        const { stocksData } = await import('../data/stocksData');
        const enrichedWatchlist = watchlistData.map(item => {
          const stockInfo = stocksData.find(stock => stock.symbol === item.symbol);
          return stockInfo ? {
            ...stockInfo,
            watchlistId: item._id || item.id,
            addedDate: item.createdAt || item.addedDate
          } : {
            symbol: item.symbol,
            name: item.name,
            price: 0,
            change: 0,
            changePercent: 0,
            watchlistId: item._id || item.id,
            addedDate: item.createdAt || item.addedDate
          };
        });

        setWatchlist(enrichedWatchlist);
      }

      // Load transactions
      const transactionsResponse = await fetch(`${API_BASE_URL}/transactions`, {
        headers: getAuthHeaders()
      });
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        const transactions = transactionsData.transactions || transactionsData;

        // Transform transaction data to match frontend expectations
        const transformedTransactions = transactions.map(txn => ({
          ...txn,
          id: txn._id || txn.id,
          date: txn.createdAt || txn.date || txn.executedAt,
          amount: txn.total || txn.amount
        }));

        setTransactions(transformedTransactions);
      }
    } catch (error) {
      console.error('Error loading portfolio data:', error);
      // Fallback to localStorage (only if user exists and has an ID)
      if (user && user.id) {
        const savedHoldings = localStorage.getItem(`holdings_${user.id}`);
        const savedWatchlist = localStorage.getItem(`watchlist_${user.id}`);
        const savedTransactions = localStorage.getItem(`transactions_${user.id}`);

        if (savedHoldings) setHoldings(JSON.parse(savedHoldings));
        if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
        if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
      } else {
        // If no user or user ID, clear all data
        setHoldings([]);
        setWatchlist([]);
        setTransactions([]);
      }
    }
  };

  const addToWatchlist = async (stock) => {
    try {
      const response = await fetch(`${API_BASE_URL}/watchlist`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          symbol: stock.symbol,
          name: stock.name
        })
      });

      if (response.ok) {
        const newWatchlist = [...watchlist];
        if (!newWatchlist.find(item => item.symbol === stock.symbol)) {
          newWatchlist.push(stock);
          setWatchlist(newWatchlist);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to add to watchlist:', errorData.message);
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      // Fallback to local storage
      const newWatchlist = [...watchlist];
      if (!newWatchlist.find(item => item.symbol === stock.symbol)) {
        newWatchlist.push(stock);
        setWatchlist(newWatchlist);
        if (user) {
          localStorage.setItem(`watchlist_${user.id}`, JSON.stringify(newWatchlist));
        }
      }
    }
  };

  const removeFromWatchlist = async (symbol) => {
    try {
      const response = await fetch(`${API_BASE_URL}/watchlist/${symbol}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const newWatchlist = watchlist.filter(item => item.symbol !== symbol);
        setWatchlist(newWatchlist);
      } else {
        console.error('Failed to remove from watchlist');
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      // Fallback to local storage
      const newWatchlist = watchlist.filter(item => item.symbol !== symbol);
      setWatchlist(newWatchlist);
      if (user) {
        localStorage.setItem(`watchlist_${user.id}`, JSON.stringify(newWatchlist));
      }
    }
  };

  const buyStock = async (stock, quantity, price) => {
    try {
      const response = await fetch(`${API_BASE_URL}/portfolio/buy`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          symbol: stock.symbol,
          name: stock.name,
          quantity: quantity,
          price: price
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Reload portfolio data to get updated holdings and balance
        await loadPortfolioData();

        // Refresh user data to get updated balance
        await refreshUser();

        return { success: true, transaction: data.transaction };
      } else {
        throw new Error(data.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Error buying stock:', error);
      return { success: false, error: error.message };
    }
  };

  const sellStock = async (symbol, quantity, price) => {
    try {
      const response = await fetch(`${API_BASE_URL}/portfolio/sell`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          symbol: symbol,
          quantity: quantity,
          price: price
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Reload portfolio data to get updated holdings and balance
        await loadPortfolioData();

        // Refresh user data to get updated balance
        await refreshUser();

        return { success: true, transaction: data.transaction };
      } else {
        throw new Error(data.message || 'Sale failed');
      }
    } catch (error) {
      console.error('Error selling stock:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    holdings,
    watchlist,
    transactions,
    addToWatchlist,
    removeFromWatchlist,
    buyStock,
    sellStock
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};