# Crypto Arbitrage Scanner - Documentation

## Overview
This application is a web-based cryptocurrency arbitrage scanner that monitors price differences across multiple exchanges and identifies potential arbitrage opportunities. The system fetches real-time price data for selected cryptocurrencies (BTC, ETH, SOL) from multiple exchanges (Binance, Coinbase, KuCoin, Kraken) and displays profitable trading opportunities.

## Features
- Real-time price data fetching from multiple cryptocurrency exchanges
- Automatic arbitrage opportunity calculation
- Sorting by highest profit percentage
- Color-coded profit/loss highlighting (green for profit, red for loss)
- Automatic data refresh every 30 seconds
- Filtering by coin and exchange
- Timestamp display of the latest price check

## Project Structure
The project consists of two main components:

### Backend (Flask)
- Located in `/backend` directory
- Provides API endpoints for fetching exchange data, coin data, and arbitrage opportunities
- Uses CCXT library to interact with cryptocurrency exchanges
- Implements CORS support for frontend communication

### Frontend (React)
- Located in `/frontend` directory
- Provides a responsive dashboard for displaying arbitrage opportunities
- Implements automatic data refresh and filtering
- Uses Tailwind CSS and shadcn/ui for styling

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd crypto-arbitrage-scanner/backend
   ```

2. Activate the virtual environment:
   ```
   source venv/bin/activate
   ```

3. Start the Flask server:
   ```
   python src/main.py
   ```
   The backend will run on http://localhost:5000

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd crypto-arbitrage-scanner/frontend
   ```

2. Install dependencies (if not already installed):
   ```
   pnpm install
   ```

3. Start the development server:
   ```
   pnpm run dev
   ```
   The frontend will run on http://localhost:5173

## API Endpoints

### GET /api/crypto/exchanges
Returns a list of supported exchanges.

### GET /api/crypto/coins
Returns a list of supported coins.

### GET /api/crypto/arbitrage
Returns arbitrage opportunities across exchanges.

Query parameters:
- `coin`: Filter by specific coin (optional)
- `exchange`: Filter by specific exchange (optional)

## Usage
1. Start both the backend and frontend servers as described in the setup instructions.
2. Open your browser and navigate to http://localhost:5173
3. The dashboard will display arbitrage opportunities sorted by profit percentage.
4. Use the filters to narrow down results by coin or exchange.
5. Data refreshes automatically every 30 seconds, or you can click the "Refresh Now" button.

## Extending the Application
- Add more cryptocurrencies by updating the `SUPPORTED_COINS` array in `backend/src/routes/crypto.py`
- Add more exchanges by updating the `SUPPORTED_EXCHANGES` array in `backend/src/routes/crypto.py`
- Implement user authentication for personalized settings
- Add historical data tracking and visualization

## Troubleshooting
- If the frontend cannot connect to the backend, ensure the backend server is running and CORS is properly configured.
- If no data appears, check the browser console for errors and verify that the exchanges' APIs are accessible.
- For exchange-specific issues, refer to the CCXT documentation for that exchange.
