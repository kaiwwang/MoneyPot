# MoneyPot Frontend - Portfolio Trading Platform

## 📊 Project Overview

MoneyPot is a comprehensive stock trading platform with a Vue.js frontend and Node.js backend. This repository contains the **frontend application** built with Vue 3 + Vite.

### 🎯 Key Features

- **Real-time European Stock Trading** (GLE FP, KPN NA, NK FP, ROVI SM, AALB NA)
- **Live Portfolio Management** with instant P&L calculations
- **Interactive Trading Interface** for buying and selling stocks
- **Real-time Data Updates** every 30 seconds
- **Professional Charts** powered by ECharts
- **Responsive Design** optimized for all devices

### 🚀 Technology Stack

- **Frontend Framework**: Vue 3 with Composition API
- **Build Tool**: Vite
- **Charts**: ECharts 5.6.0
- **Styling**: Scoped CSS with modern design
- **API Integration**: RESTful API with local backend
- **Real-time Updates**: Automatic data refresh

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Local MoneyPot backend running on port 3000

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/kaiwwang/MoneyPot.git
   cd MoneyPot
   git checkout front_end
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5176
   - Ensure backend API is running on http://localhost:3000

## 📡 API Integration

The frontend integrates with the MoneyPot backend API:

- **Account Management**: Real-time balance and asset tracking
- **Portfolio Data**: Live holdings with profit/loss calculations
- **Market Data**: European stock prices and trading info
- **Trading Operations**: Buy/sell execution with instant updates

### API Endpoints Used
- `GET /api/account` - Account information
- `GET /api/portfolio` - Portfolio holdings
- `GET /api/market` - Available stocks
- `POST /api/trade/buy` - Execute buy orders
- `POST /api/trade/sell` - Execute sell orders

## 🎨 User Interface

### Main Features
- **Holdings Dashboard**: Overview of all investments
- **Trading Panel**: Interactive buy/sell interface
- **Profile Management**: User account details
- **Real-time Updates**: Live data refresh indicators

### Navigation
- Holdings: View current portfolio and performance
- Trading: Execute buy/sell transactions
- Profile: Account management and settings

## 📊 Available Stocks

The platform supports trading of 5 European stocks:

1. **GLE FP** - Societe Generale (France) 🇫🇷
2. **KPN NA** - Koninklijke KPN (Netherlands) 🇳🇱
3. **NK FP** - Natixis (France) 🇫🇷
4. **ROVI SM** - Laboratorios Rovi (Spain) 🇪🇸
5. **AALB NA** - ASML Holding (Netherlands) 🇳🇱

## 🔧 Development

### Project Structure
```
src/
├── components/       # Vue components
├── services/        # API services
├── composables/     # Vue composition functions
├── assets/          # Static assets
└── portfolio.vue    # Main application component
```

### Key Files
- `src/portfolio.vue` - Main trading interface
- `src/services/api.js` - API client
- `src/services/dataService.js` - Data management
- `src/composables/usePortfolio.js` - Portfolio logic

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🧪 Testing

### API Integration Testing
Use the included test files:
- `test-frontend-api.html` - Frontend API connection tests
- `integration-verification.html` - Complete integration validation

## 📱 Features in Detail

### Real-time Portfolio Tracking
- Live balance updates (€95,160 initial)
- Total assets calculation (€100,698+)
- Profit/loss tracking with percentages
- Individual stock performance

### Interactive Trading
- Stock search and selection
- Quantity input with validation
- Real-time price display
- Instant trade execution
- Balance verification

### Data Visualization
- ECharts integration for price charts
- Portfolio performance graphs
- Market trend visualization
- Responsive chart scaling

## 🌐 Deployment

The application is designed to work with:
- Local development (localhost:5176)
- Production deployment with proper API endpoints
- CORS-enabled backend integration

## 👥 Contributors

- **Kiwang** - Project Owner
- **Development Team** - Frontend Implementation

## 📄 License

This project is part of the MoneyPot trading platform.

---

**Note**: This frontend requires the MoneyPot backend to be running for full functionality. Ensure the backend API is accessible at `http://localhost:3000` before starting the frontend application.
