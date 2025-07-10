import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// MongoDB Connection with better error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/groww-clone', {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️  Server will continue without database functionality');
  }
};

// Connect to database but don't block server startup
connectDB();

// Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 1000 },
  joinedDate: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: true },
  profile: {
    phone: String,
    address: String,
    panCard: String,
    bankAccount: String
  }
}, { timestamps: true });

const portfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  avgPrice: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now }
}, { timestamps: true });

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['BUY', 'SELL', 'CREDIT', 'DEBIT'], required: true },
  symbol: { type: String },
  name: { type: String },
  description: { type: String },
  quantity: { type: Number },
  price: { type: Number },
  total: { type: Number, required: true },
  method: { type: String },
  status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'COMPLETED' }
}, { timestamps: true });

// Models
const User = mongoose.model('User', userSchema);
const Portfolio = mongoose.model('Portfolio', portfolioSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      console.log('❌ Token verification failed:', err.message);
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    port: PORT.toString()
  });
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('🔐 Registration attempt for:', email);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('✅ User registered successfully:', email);
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, balance: user.balance }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt for:', email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('✅ User logged in successfully:', email);
    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, balance: user.balance }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User Routes
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    console.log('👤 Get user profile request:', { userId: req.user.userId });
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('✅ User profile retrieved successfully');
    res.json(user);
  } catch (error) {
    console.error('❌ Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { name, balance } = req.body;
    console.log('👤 Update user profile request:', { userId: req.user.userId, name, balance });

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (balance !== undefined) updateData.balance = balance;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ User profile updated successfully');
    res.json(user);
  } catch (error) {
    console.error('❌ Update user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Wallet Routes
app.post('/api/wallet/add-funds', authenticateToken, async (req, res) => {
  try {
    const { amount, method = 'UPI', description = 'Funds Added' } = req.body;
    console.log('💰 Add funds request:', { userId: req.user.userId, amount, method });

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Create wallet transaction
    const transaction = new Transaction({
      userId: req.user.userId,
      type: 'CREDIT',
      description: description,
      total: amount,
      method: method,
      status: 'COMPLETED'
    });

    await transaction.save();
    console.log('✅ Transaction created:', transaction._id);

    // Update user balance
    const user = await User.findById(req.user.userId);
    user.balance += amount;
    await user.save();

    console.log('✅ Funds added successfully. New balance:', user.balance);
    res.json({
      message: 'Funds added successfully',
      transaction,
      newBalance: user.balance
    });
  } catch (error) {
    console.error('❌ Add funds error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/wallet/withdraw', authenticateToken, async (req, res) => {
  try {
    const { amount, description = 'Funds Withdrawn to Bank' } = req.body;
    console.log('💸 Withdraw funds request:', { userId: req.user.userId, amount });

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Check if user has sufficient balance
    const user = await User.findById(req.user.userId);
    if (user.balance < amount) {
      console.log('❌ Insufficient balance:', user.balance, 'requested:', amount);
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Create wallet transaction
    const transaction = new Transaction({
      userId: req.user.userId,
      type: 'DEBIT',
      description: description,
      total: amount,
      status: 'COMPLETED'
    });

    await transaction.save();
    console.log('✅ Withdrawal transaction created:', transaction._id);

    // Update user balance
    user.balance -= amount;
    await user.save();

    console.log('✅ Funds withdrawn successfully. New balance:', user.balance);
    res.json({
      message: 'Funds withdrawn successfully',
      transaction,
      newBalance: user.balance
    });
  } catch (error) {
    console.error('❌ Withdraw funds error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Portfolio Routes
app.get('/api/portfolio', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Get portfolio request:', { userId: req.user.userId });
    const holdings = await Portfolio.find({ userId: req.user.userId });
    console.log('✅ Portfolio retrieved successfully:', holdings.length, 'holdings');
    res.json(holdings);
  } catch (error) {
    console.error('❌ Portfolio fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/portfolio/buy', authenticateToken, async (req, res) => {
  try {
    const { symbol, name, quantity, price } = req.body;
    const totalCost = quantity * price;
    console.log('📈 Buy order request:', { userId: req.user.userId, symbol, quantity, price, totalCost });

    // Check user balance
    const user = await User.findById(req.user.userId);
    if (user.balance < totalCost) {
      console.log('❌ Insufficient balance:', user.balance, 'required:', totalCost);
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Check if stock exists in portfolio
    const existingHolding = await Portfolio.findOne({
      userId: req.user.userId,
      symbol
    });

    if (existingHolding) {
      // Update existing holding
      const totalQuantity = existingHolding.quantity + quantity;
      const avgPrice = ((existingHolding.avgPrice * existingHolding.quantity) + totalCost) / totalQuantity;
      
      existingHolding.quantity = totalQuantity;
      existingHolding.avgPrice = avgPrice;
      await existingHolding.save();
      console.log('✅ Updated existing holding:', existingHolding._id);
    } else {
      // Create new holding
      const newHolding = new Portfolio({
        userId: req.user.userId,
        symbol,
        name,
        quantity,
        avgPrice: price
      });
      await newHolding.save();
      console.log('✅ Created new holding:', newHolding._id);
    }

    // Update user balance
    user.balance -= totalCost;
    await user.save();

    // Create transaction record
    const transaction = new Transaction({
      userId: req.user.userId,
      type: 'BUY',
      symbol,
      name,
      description: `Stock Purchase - ${symbol}`,
      quantity,
      price,
      total: totalCost
    });
    await transaction.save();

    console.log('✅ Buy order completed. Transaction ID:', transaction._id);
    res.json({ message: 'Stock purchased successfully', transaction });
  } catch (error) {
    console.error('❌ Buy stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/portfolio/sell', authenticateToken, async (req, res) => {
  try {
    const { symbol, quantity, price } = req.body;
    const totalRevenue = quantity * price;
    console.log('📉 Sell order request:', { userId: req.user.userId, symbol, quantity, price, totalRevenue });

    // Find holding
    const holding = await Portfolio.findOne({
      userId: req.user.userId,
      symbol
    });

    if (!holding || holding.quantity < quantity) {
      console.log('❌ Insufficient shares:', holding ? holding.quantity : 0, 'requested:', quantity);
      return res.status(400).json({ message: 'Insufficient shares to sell' });
    }

    // Update holding
    if (holding.quantity === quantity) {
      // Remove holding completely
      await Portfolio.deleteOne({ _id: holding._id });
      console.log('✅ Holding removed completely');
    } else {
      // Reduce quantity
      holding.quantity -= quantity;
      await holding.save();
      console.log('✅ Holding quantity reduced to:', holding.quantity);
    }

    // Update user balance
    const user = await User.findById(req.user.userId);
    user.balance += totalRevenue;
    await user.save();

    // Create transaction record
    const transaction = new Transaction({
      userId: req.user.userId,
      type: 'SELL',
      symbol,
      name: holding.name,
      description: `Stock Sale - ${symbol}`,
      quantity,
      price,
      total: totalRevenue
    });
    await transaction.save();

    console.log('✅ Sell order completed. Transaction ID:', transaction._id);
    res.json({ message: 'Stock sold successfully', transaction });
  } catch (error) {
    console.error('❌ Sell stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Watchlist Schema
const watchlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  addedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

// Watchlist Routes
app.get('/api/watchlist', authenticateToken, async (req, res) => {
  try {
    console.log('⭐ Get watchlist request:', { userId: req.user.userId });
    const watchlistItems = await Watchlist.find({ userId: req.user.userId }).sort({ addedAt: -1 });
    console.log('✅ Watchlist retrieved successfully:', watchlistItems.length, 'items');
    res.json(watchlistItems);
  } catch (error) {
    console.error('❌ Watchlist fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/watchlist', authenticateToken, async (req, res) => {
  try {
    const { symbol, name } = req.body;
    console.log('⭐ Add to watchlist request:', { userId: req.user.userId, symbol, name });

    if (!symbol || !name) {
      return res.status(400).json({ message: 'Symbol and name are required' });
    }

    // Check if already in watchlist
    const existingItem = await Watchlist.findOne({
      userId: req.user.userId,
      symbol: symbol
    });

    if (existingItem) {
      return res.status(400).json({ message: 'Stock already in watchlist' });
    }

    // Add to watchlist
    const watchlistItem = new Watchlist({
      userId: req.user.userId,
      symbol: symbol,
      name: name
    });

    await watchlistItem.save();
    console.log('✅ Added to watchlist successfully:', watchlistItem._id);

    res.status(201).json({
      message: 'Stock added to watchlist',
      watchlistItem
    });
  } catch (error) {
    console.error('❌ Add to watchlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/watchlist/:symbol', authenticateToken, async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log('⭐ Remove from watchlist request:', { userId: req.user.userId, symbol });

    const result = await Watchlist.deleteOne({
      userId: req.user.userId,
      symbol: symbol
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Stock not found in watchlist' });
    }

    console.log('✅ Removed from watchlist successfully');
    res.json({ message: 'Stock removed from watchlist' });
  } catch (error) {
    console.error('❌ Remove from watchlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Stocks Routes
app.get('/api/stocks', async (req, res) => {
  try {
    console.log('📈 Get stocks request');

    const sampleStocks = getStockData();

    console.log('✅ Stocks retrieved successfully:', sampleStocks.length, 'stocks');
    res.json(sampleStocks);
  } catch (error) {
    console.error('❌ Stocks fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


const getStockData = () => [
  { _id: '1', symbol: 'RELIANCE', name: 'Reliance Industries Ltd', price: 2500.75, change: 45.25, changePercent: 1.84, volume: 1250000, marketCap: 1689000000000, sector: 'Oil & Gas', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Reliance_Industries_Logo.svg/200px-Reliance_Industries_Logo.svg.png', isActive: true },
  { _id: '2', symbol: 'TCS', name: 'Tata Consultancy Services Ltd', price: 3650.50, change: -25.75, changePercent: -0.70, volume: 890000, marketCap: 1325000000000, sector: 'Information Technology', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Tata_Consultancy_Services_Logo.svg/200px-Tata_Consultancy_Services_Logo.svg.png', isActive: true },
  { _id: '3', symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1580.25, change: 12.50, changePercent: 0.80, volume: 2100000, marketCap: 1200000000000, sector: 'Banking', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/HDFC_Bank_Logo.svg/200px-HDFC_Bank_Logo.svg.png', isActive: true },
  { _id: '4', symbol: 'INFY', name: 'Infosys Ltd', price: 1450.80, change: 18.30, changePercent: 1.28, volume: 1560000, marketCap: 615000000000, sector: 'Information Technology', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Infosys_logo.svg/200px-Infosys_logo.svg.png', isActive: true },
  { _id: '5', symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 950.40, change: -8.60, changePercent: -0.90, volume: 1890000, marketCap: 665000000000, sector: 'Banking', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/ICICI_Bank_Logo.svg/200px-ICICI_Bank_Logo.svg.png', isActive: true },
  { _id: '6', symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', price: 2350.90, change: 35.40, changePercent: 1.53, volume: 780000, marketCap: 550000000000, sector: 'FMCG', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/Hindustan_Unilever_Logo.svg/200px-Hindustan_Unilever_Logo.svg.png', isActive: true },
  { _id: '7', symbol: 'ITC', name: 'ITC Ltd', price: 420.15, change: -2.85, changePercent: -0.67, volume: 3200000, marketCap: 525000000000, sector: 'FMCG', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/ITC_Limited_Logo.svg/200px-ITC_Limited_Logo.svg.png', isActive: true },
  { _id: '8', symbol: 'SBIN', name: 'State Bank of India', price: 580.75, change: 15.25, changePercent: 2.70, volume: 2850000, marketCap: 518000000000, sector: 'Banking', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/SBI-logo.svg/200px-SBI-logo.svg.png', isActive: true },
  { _id: '9', symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', price: 850.30, change: 22.10, changePercent: 2.67, volume: 1450000, marketCap: 485000000000, sector: 'Telecom', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Airtel_logo_logotype.svg/200px-Airtel_logo_logotype.svg.png', isActive: true },
  { _id: '10', symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd', price: 1750.60, change: -12.40, changePercent: -0.70, volume: 920000, marketCap: 348000000000, sector: 'Banking', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Kotak_Mahindra_Bank_logo.svg/200px-Kotak_Mahindra_Bank_logo.svg.png', isActive: true }
];

app.get('/api/stocks/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;
    console.log('🔍 Stock search request:', { query, limit });

    const sampleStocks = getStockData();


    const filteredStocks = sampleStocks.filter(stock =>
      stock.name.toLowerCase().includes(query.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.sector.toLowerCase().includes(query.toLowerCase())
    ).slice(0, parseInt(limit));

    console.log('✅ Stock search completed:', filteredStocks.length, 'results');
    res.json(filteredStocks);
  } catch (error) {
    console.error('❌ Stock search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/stocks/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log('📊 Get stock by symbol:', symbol);

    const sampleStocks = getStockData();

    const stock = sampleStocks.find(s => s.symbol.toLowerCase() === symbol.toLowerCase());

    if (stock) {
      console.log('✅ Stock found:', stock.symbol);
      res.json(stock);
    } else {
      console.log('❌ Stock not found:', symbol);
      res.status(404).json({ message: 'Stock not found' });
    }
  } catch (error) {
    console.error('❌ Get stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    console.log('📋 Get transactions request:', { userId: req.user.userId, limit, page });

    const transactions = await Transaction.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments({ userId: req.user.userId });

    console.log('✅ Found transactions:', transactions.length);
    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Transactions fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❓ Route not found:', req.method, req.originalUrl);
  res.status(404).json({ message: 'Route not found' });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints:`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/login`);
  console.log(`� User endpoints:`);
  console.log(`   - GET http://localhost:${PORT}/api/user/profile`);
  console.log(`   - PUT http://localhost:${PORT}/api/user/profile`);
  console.log(`�💰 Wallet endpoints:`);
  console.log(`   - POST http://localhost:${PORT}/api/wallet/add-funds`);
  console.log(`   - POST http://localhost:${PORT}/api/wallet/withdraw`);
  console.log(`📈 Portfolio endpoints:`);
  console.log(`   - GET http://localhost:${PORT}/api/portfolio`);
  console.log(`   - POST http://localhost:${PORT}/api/portfolio/buy`);
  console.log(`   - POST http://localhost:${PORT}/api/portfolio/sell`);
  console.log(`📊 Other endpoints:`);
  console.log(`   - GET http://localhost:${PORT}/api/transactions`);
  console.log(`   - GET http://localhost:${PORT}/api/watchlist`);
  console.log(`   - POST http://localhost:${PORT}/api/watchlist`);
  console.log(`   - DELETE http://localhost:${PORT}/api/watchlist/:symbol`);
  console.log(`   - GET http://localhost:${PORT}/api/stocks`);
  console.log(`   - GET http://localhost:${PORT}/api/stocks/search/:query`);
  console.log(`   - GET http://localhost:${PORT}/api/stocks/:symbol`);
  console.log(`✅ Server is ready to accept connections!`);
}).on('error', (error) => {
  console.error('❌ Server startup error:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.log(`⚠️  Port ${PORT} is already in use. Please kill the existing process or use a different port.`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;
