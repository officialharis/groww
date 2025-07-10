import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Shield, Smartphone, Users, ArrowRight, Star, CheckCircle } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <TrendingUp className="w-8 h-8 text-groww-primary" />,
      title: "Smart Investing",
      description: "Make informed investment decisions with our advanced analytics and real-time market data."
    },
    {
      icon: <Shield className="w-8 h-8 text-groww-primary" />,
      title: "Secure & Safe",
      description: "Your investments are protected with bank-grade security and regulatory compliance."
    },
    {
      icon: <Smartphone className="w-8 h-8 text-groww-primary" />,
      title: "Mobile First",
      description: "Trade on the go with our intuitive mobile-first platform designed for modern investors."
    },
    {
      icon: <Users className="w-8 h-8 text-groww-primary" />,
      title: "Expert Support",
      description: "Get guidance from our team of investment experts and financial advisors."
    }
  ];

  const stats = [
    { number: "10M+", label: "Active Users" },
    { number: "₹50,000Cr+", label: "Assets Under Management" },
    { number: "99.9%", label: "Uptime" },
    { number: "4.8★", label: "App Rating" }
  ];

  const benefits = [
    "Zero brokerage on equity delivery trades",
    "Real-time market data and analytics",
    "Easy portfolio tracking and management",
    "Expert research and recommendations",
    "24/7 customer support",
    "Secure and regulated platform"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-groww-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Groww</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                to="/login"
                className="text-gray-600 dark:text-gray-300 hover:text-groww-primary transition-colors px-2 py-2 sm:px-3 min-h-[44px] flex items-center"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-groww-primary text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-groww-primary/90 transition-colors min-h-[44px] flex items-center text-sm sm:text-base"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Invest in Your
                <span className="text-groww-primary block">Future Today</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mt-4 sm:mt-6 leading-relaxed">
                Start your investment journey with India's most trusted platform.
                Trade stocks, mutual funds, and more with zero brokerage.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-6 sm:mt-8 justify-center lg:justify-start">
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-groww-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-groww-primary/90 transition-all duration-200 flex items-center justify-center group min-h-[44px]"
                >
                  Start Investing
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="border-2 border-groww-primary text-groww-primary px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-groww-primary hover:text-white transition-all duration-200 min-h-[44px]"
                >
                  Login to Account
                </button>
              </div>
            </div>
            <div className="relative mt-8 lg:mt-0">
              <div className="bg-gradient-to-r from-groww-primary to-blue-600 rounded-2xl p-6 sm:p-8 text-white">
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{stat.number}</div>
                      <div className="text-xs sm:text-sm opacity-90">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Groww?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience the future of investing with our cutting-edge platform designed for both beginners and experts.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-groww-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-groww-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Everything You Need to Succeed
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-groww-primary flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
              <div className="text-center mb-6">
                <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Join Millions of Investors
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Start your investment journey today with just ₹100
                </p>
              </div>
              <button
                onClick={() => navigate('/signup')}
                className="w-full bg-groww-primary text-white py-4 rounded-xl font-semibold hover:bg-groww-primary/90 transition-colors"
              >
                Create Free Account
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
                No hidden charges • SEBI Registered • 100% Secure
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-groww-primary rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Groww</span>
              </div>
              <p className="text-gray-400">
                Making investing simple and accessible for everyone.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Stocks</li>
                <li>Mutual Funds</li>
                <li>IPOs</li>
                <li>Gold</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Press</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Security</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Groww. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
