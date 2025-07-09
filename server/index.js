import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/groww-clone');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 1000 }, // ₹1,000 starting balance
  joinedDate: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: true },
  profile: {
    phone: String,
    address: String,
    panCard: String,
    bankAccount: String
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Stock Schema
const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  change: { type: Number, required: true },
  changePercent: { type: Number, required: true },
  marketCap: { type: String, required: true },
  sector: { type: String, required: true },
  pe: { type: Number, required: true },
  logo: { type: String, required: true },
  volume: { type: Number, default: 0 },
  high52w: Number,
  low52w: Number,
  dividend: Number,
  eps: Number,
  bookValue: Number
}, { timestamps: true });

const Stock = mongoose.model('Stock', stockSchema);

// Portfolio Schema
const portfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  avgPrice: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now }
}, { timestamps: true });

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

// Transaction Schema (Updated to support wallet transactions)
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['BUY', 'SELL', 'CREDIT', 'DEBIT'], required: true },
  symbol: { type: String }, // Optional for wallet transactions
  name: { type: String }, // Optional for wallet transactions
  description: { type: String }, // For wallet transaction descriptions
  quantity: { type: Number }, // Optional for wallet transactions
  price: { type: Number }, // Optional for wallet transactions
  total: { type: Number, required: true }, // Amount for all transactions
  method: { type: String }, // Payment method for wallet transactions
  status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'COMPLETED' }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

// Watchlist Schema
const watchlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  addedDate: { type: Date, default: Date.now }
}, { timestamps: true });

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

// Market Data Schema
const marketDataSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  date: { type: Date, required: true },
  open: { type: Number, required: true },
  high: { type: Number, required: true },
  low: { type: Number, required: true },
  close: { type: Number, required: true },
  volume: { type: Number, required: true }
}, { timestamps: true });

const MarketData = mongoose.model('MarketData', marketDataSchema);

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
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
    port: PORT
  });
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        joinedDate: user.joinedDate
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        joinedDate: user.joinedDate
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User Routes
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { name, profile, balance } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (profile !== undefined) updateData.profile = profile;
    if (balance !== undefined) updateData.balance = balance;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Stock Routes
app.get('/api/stocks', async (req, res) => {
  try {
    const { search, sector, sortBy, limit = 50 } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { symbol: { $regex: search, $options: 'i' } }
      ];
    }

    if (sector && sector !== 'All') {
      query.sector = sector;
    }

    let sortOptions = {};
    switch (sortBy) {
      case 'price':
        sortOptions = { price: -1 };
        break;
      case 'change':
        sortOptions = { changePercent: -1 };
        break;
      case 'marketCap':
        sortOptions = { marketCap: -1 };
        break;
      default:
        sortOptions = { name: 1 };
    }

    const stocks = await Stock.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit));

    res.json(stocks);
  } catch (error) {
    console.error('Stocks fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/stocks/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
    
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    res.json(stock);
  } catch (error) {
    console.error('Stock fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/stocks/:symbol/chart', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '1M' } = req.query;

    let days = 30;
    switch (period) {
      case '1D': days = 1; break;
      case '1W': days = 7; break;
      case '1M': days = 30; break;
      case '3M': days = 90; break;
      case '1Y': days = 365; break;
    }

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

    const chartData = await MarketData.find({
      symbol: symbol.toUpperCase(),
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    res.json(chartData);
  } catch (error) {
    console.error('Chart data fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Portfolio Routes
app.get('/api/portfolio', authenticateToken, async (req, res) => {
  try {
    const holdings = await Portfolio.find({ userId: req.user.userId });
    res.json(holdings);
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/portfolio/buy', authenticateToken, async (req, res) => {
  try {
    const { symbol, name, quantity, price } = req.body;
    const totalCost = quantity * price;

    // Check user balance
    const user = await User.findById(req.user.userId);
    if (user.balance < totalCost) {
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

    res.json({ message: 'Stock purchased successfully', transaction });
  } catch (error) {
    console.error('Buy stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/portfolio/sell', authenticateToken, async (req, res) => {
  try {
    const { symbol, quantity, price } = req.body;
    const totalRevenue = quantity * price;

    // Find holding
    const holding = await Portfolio.findOne({
      userId: req.user.userId,
      symbol
    });

    if (!holding || holding.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient shares to sell' });
    }

    // Update holding
    if (holding.quantity === quantity) {
      await Portfolio.deleteOne({ _id: holding._id });
    } else {
      holding.quantity -= quantity;
      await holding.save();
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

    res.json({ message: 'Stock sold successfully', transaction });
  } catch (error) {
    console.error('Sell stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Transaction Routes
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments({ userId: req.user.userId });

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
    console.error('Transactions fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Wallet Routes
app.post('/api/wallet/add-funds', authenticateToken, async (req, res) => {
  try {
    const { amount, method = 'UPI', description = 'Funds Added' } = req.body;

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

    // Update user balance
    const user = await User.findById(req.user.userId);
    user.balance += amount;
    await user.save();

    res.json({
      message: 'Funds added successfully',
      transaction,
      newBalance: user.balance
    });
  } catch (error) {
    console.error('Add funds error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/wallet/withdraw', authenticateToken, async (req, res) => {
  try {
    const { amount, description = 'Funds Withdrawn' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Check if user has sufficient balance
    const user = await User.findById(req.user.userId);
    if (user.balance < amount) {
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

    // Update user balance
    user.balance -= amount;
    await user.save();

    res.json({
      message: 'Withdrawal processed successfully',
      transaction,
      newBalance: user.balance
    });
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Watchlist Routes
app.get('/api/watchlist', authenticateToken, async (req, res) => {
  try {
    const watchlist = await Watchlist.find({ userId: req.user.userId });
    res.json(watchlist);
  } catch (error) {
    console.error('Watchlist fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/watchlist', authenticateToken, async (req, res) => {
  try {
    const { symbol, name } = req.body;

    // Check if already in watchlist
    const existing = await Watchlist.findOne({
      userId: req.user.userId,
      symbol
    });

    if (existing) {
      return res.status(400).json({ message: 'Stock already in watchlist' });
    }

    const watchlistItem = new Watchlist({
      userId: req.user.userId,
      symbol,
      name
    });

    await watchlistItem.save();
    res.json({ message: 'Stock added to watchlist', watchlistItem });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/watchlist/:symbol', authenticateToken, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    await Watchlist.deleteOne({
      userId: req.user.userId,
      symbol: symbol.toUpperCase()
    });

    res.json({ message: 'Stock removed from watchlist' });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Market Data Routes
app.get('/api/market/indices', async (req, res) => {
  try {
    const indices = [
      {
        name: "NIFTY 50",
        value: 19865.20,
        change: 245.30,
        changePercent: 1.25
      },
      {
        name: "SENSEX",
        value: 66589.93,
        change: 503.27,
        changePercent: 0.76
      },
      {
        name: "NIFTY BANK",
        value: 44732.85,
        change: -123.45,
        changePercent: -0.28
      },
      {
        name: "NIFTY IT",
        value: 30456.70,
        change: 892.15,
        changePercent: 3.02
      }
    ];

    res.json(indices);
  } catch (error) {
    console.error('Market indices fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/market/trending', async (req, res) => {
  try {
    const { type = 'gainers', limit = 10 } = req.query;
    
    let sortOptions = {};
    if (type === 'gainers') {
      sortOptions = { changePercent: -1 };
    } else if (type === 'losers') {
      sortOptions = { changePercent: 1 };
    } else {
      sortOptions = { volume: -1 };
    }

    const stocks = await Stock.find({})
      .sort(sortOptions)
      .limit(parseInt(limit));

    res.json(stocks);
  } catch (error) {
    console.error('Trending stocks fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dashboard Routes
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get portfolio holdings
    const holdings = await Portfolio.find({ userId });
    
    // Get user balance
    const user = await User.findById(userId);
    
    // Get recent transactions
    const recentTransactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get watchlist count
    const watchlistCount = await Watchlist.countDocuments({ userId });

    // Calculate portfolio value (would need current stock prices)
    let portfolioValue = 0;
    let totalInvestment = 0;

    for (const holding of holdings) {
      const stock = await Stock.findOne({ symbol: holding.symbol });
      if (stock) {
        portfolioValue += stock.price * holding.quantity;
        totalInvestment += holding.avgPrice * holding.quantity;
      }
    }

    const totalGain = portfolioValue - totalInvestment;
    const gainPercentage = totalInvestment > 0 ? (totalGain / totalInvestment) * 100 : 0;

    res.json({
      portfolioValue,
      totalInvestment,
      totalGain,
      gainPercentage,
      availableBalance: user.balance,
      totalHoldings: holdings.length,
      watchlistCount,
      recentTransactions
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;