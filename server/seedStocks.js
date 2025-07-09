import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

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

const sampleStocks = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    price: 2450.50,
    change: 45.30,
    changePercent: 1.88,
    marketCap: '₹16.58L Cr',
    sector: 'Oil & Gas',
    pe: 24.5,
    logo: 'https://logo.clearbit.com/ril.com',
    volume: 2500000,
    high52w: 2856.15,
    low52w: 2220.30,
    dividend: 8.0,
    eps: 99.85,
    bookValue: 1456.20
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    price: 3650.75,
    change: -25.80,
    changePercent: -0.70,
    marketCap: '₹13.32L Cr',
    sector: 'IT Services',
    pe: 28.3,
    logo: 'https://logo.clearbit.com/tcs.com',
    volume: 1800000,
    high52w: 4043.90,
    low52w: 3056.65,
    dividend: 22.0,
    eps: 129.05,
    bookValue: 456.80
  },
  {
    symbol: 'INFY',
    name: 'Infosys Limited',
    price: 1420.30,
    change: 18.45,
    changePercent: 1.32,
    marketCap: '₹5.89L Cr',
    sector: 'IT Services',
    pe: 25.8,
    logo: 'https://logo.clearbit.com/infosys.com',
    volume: 3200000,
    high52w: 1729.05,
    low52w: 1234.50,
    dividend: 17.0,
    eps: 55.12,
    bookValue: 312.45
  },
  {
    symbol: 'HDFC',
    name: 'HDFC Bank Limited',
    price: 1580.90,
    change: 12.60,
    changePercent: 0.80,
    marketCap: '₹8.75L Cr',
    sector: 'Banking',
    pe: 18.5,
    logo: 'https://logo.clearbit.com/hdfcbank.com',
    volume: 2100000,
    high52w: 1725.00,
    low52w: 1363.55,
    dividend: 19.0,
    eps: 85.40,
    bookValue: 456.78
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Limited',
    price: 945.25,
    change: -8.75,
    changePercent: -0.92,
    marketCap: '₹6.58L Cr',
    sector: 'Banking',
    pe: 16.2,
    logo: 'https://logo.clearbit.com/icicibank.com',
    volume: 4500000,
    high52w: 1036.40,
    low52w: 756.25,
    dividend: 5.0,
    eps: 58.35,
    bookValue: 234.56
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Limited',
    price: 865.40,
    change: 22.15,
    changePercent: 2.63,
    marketCap: '₹4.89L Cr',
    sector: 'Telecom',
    pe: 32.1,
    logo: 'https://logo.clearbit.com/airtel.in',
    volume: 1900000,
    high52w: 938.40,
    low52w: 695.50,
    dividend: 2.75,
    eps: 26.95,
    bookValue: 156.78
  },
  {
    symbol: 'ITC',
    name: 'ITC Limited',
    price: 425.80,
    change: 5.30,
    changePercent: 1.26,
    marketCap: '₹5.28L Cr',
    sector: 'FMCG',
    pe: 22.8,
    logo: 'https://logo.clearbit.com/itcportal.com',
    volume: 3800000,
    high52w: 462.35,
    low52w: 385.60,
    dividend: 10.75,
    eps: 18.65,
    bookValue: 189.45
  },
  {
    symbol: 'HCLTECH',
    name: 'HCL Technologies Limited',
    price: 1245.60,
    change: -15.40,
    changePercent: -1.22,
    marketCap: '₹3.38L Cr',
    sector: 'IT Services',
    pe: 21.5,
    logo: 'https://logo.clearbit.com/hcltech.com',
    volume: 1600000,
    high52w: 1356.90,
    low52w: 1055.25,
    dividend: 18.0,
    eps: 57.85,
    bookValue: 245.67
  },
  {
    symbol: 'WIPRO',
    name: 'Wipro Limited',
    price: 485.25,
    change: 8.90,
    changePercent: 1.87,
    marketCap: '₹2.65L Cr',
    sector: 'IT Services',
    pe: 24.3,
    logo: 'https://logo.clearbit.com/wipro.com',
    volume: 2200000,
    high52w: 567.80,
    low52w: 385.50,
    dividend: 5.0,
    eps: 19.95,
    bookValue: 178.90
  },
  {
    symbol: 'MARUTI',
    name: 'Maruti Suzuki India Limited',
    price: 9850.30,
    change: 125.70,
    changePercent: 1.29,
    marketCap: '₹2.98L Cr',
    sector: 'Automobile',
    pe: 28.9,
    logo: 'https://logo.clearbit.com/marutisuzuki.com',
    volume: 450000,
    high52w: 11235.00,
    low52w: 8756.25,
    dividend: 60.0,
    eps: 340.85,
    bookValue: 2456.78
  }
];

async function seedStocks() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/groww-clone');
    console.log('Connected to MongoDB');

    // Clear existing stocks
    await Stock.deleteMany({});
    console.log('Cleared existing stocks');

    // Insert sample stocks
    await Stock.insertMany(sampleStocks);
    console.log('Sample stocks inserted successfully');

    console.log('Stock seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding stocks:', error);
    process.exit(1);
  }
}

seedStocks();
