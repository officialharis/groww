import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PortfolioProvider } from './contexts/PortfolioContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Stocks from './pages/Stocks';
import StockDetail from './pages/StockDetail';
import Portfolio from './pages/Portfolio';
import Watchlist from './pages/Watchlist';
import Wallet from './pages/Wallet';
import Transactions from './pages/Transactions';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PortfolioProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="stocks" element={<Stocks />} />
              <Route path="stocks/:symbol" element={<StockDetail />} />
              <Route path="portfolio" element={<Portfolio />} />
              <Route path="watchlist" element={<Watchlist />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="transactions" element={<Transactions />} />
            </Route>
          </Routes>
        </PortfolioProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;