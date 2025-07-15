from flask import Blueprint, jsonify, request
import ccxt
import time
from datetime import datetime

crypto_bp = Blueprint('crypto', __name__)

# List of supported exchanges and coins
SUPPORTED_EXCHANGES = [
    'binance', 'coinbase', 'kucoin', 'kraken', 'bybit', 'bingx', 'bitfinex', 'htx', 'bitstamp', 'gateio', 'bitget', 'okx'
]
SUPPORTED_COINS = [
    # Major cryptocurrencies
    'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'DOGE/USDT', 'XRP/USDT', 'ADA/USDT', 'TRX/USDT',
    'LTC/USDT', 'BCH/USDT', 'ATOM/USDT', 'MATIC/USDT', 'AVAX/USDT', 'LINK/USDT', 'UNI/USDT',
    'XLM/USDT', 'ALGO/USDT', 'EOS/USDT', 'XTZ/USDT', 'FIL/USDT', 'AAVE/USDT', 'SAND/USDT', 'CHZ/USDT'
]

# Initialize exchange instances
exchange_instances = {}

def initialize_exchanges():
    """Initialize exchange instances with CCXT"""
    for exchange_id in SUPPORTED_EXCHANGES:
        try:
            # Create exchange instance with rate limiting enabled
            exchange_class = getattr(ccxt, exchange_id)
            exchange_instances[exchange_id] = exchange_class({
                'enableRateLimit': True,
            })
            print(f"Initialized {exchange_id} exchange")
        except Exception as e:
            print(f"Error initializing {exchange_id}: {str(e)}")

# Initialize exchanges on module import
initialize_exchanges()

@crypto_bp.route('/exchanges', methods=['GET'])
def get_exchanges():
    """Return list of supported exchanges"""
    return jsonify({
        'exchanges': SUPPORTED_EXCHANGES
    })

@crypto_bp.route('/coins', methods=['GET'])
def get_coins():
    """Return list of supported coins"""
    return jsonify({
        'coins': [coin.split('/')[0] for coin in SUPPORTED_COINS]  # Return base symbols only
    })

def calculate_arbitrage(prices_data):
    """
    Calculate arbitrage opportunities between exchanges
    
    Args:
        prices_data: Dictionary with price data for each coin and exchange
        
    Returns:
        List of arbitrage opportunities sorted by profit percentage (highest first)
    """
    opportunities = []
    
    # Process each coin
    for coin, exchanges in prices_data.items():
        # Find all valid exchanges with price data for this coin
        valid_exchanges = {}
        for exchange, data in exchanges.items():
            if 'error' not in data and data.get('ask') and data.get('bid'):
                valid_exchanges[exchange] = data
        
        # Need at least 2 exchanges to calculate arbitrage
        if len(valid_exchanges) < 2:
            continue
            
        # Calculate arbitrage between each pair of exchanges
        for buy_exchange, buy_data in valid_exchanges.items():
            for sell_exchange, sell_data in valid_exchanges.items():
                # Skip same exchange
                if buy_exchange == sell_exchange:
                    continue
                
                # Calculate profit
                buy_price = buy_data['ask']  # Buy at ask price
                sell_price = sell_data['bid']  # Sell at bid price
                
                # Calculate profit percentage and absolute value
                profit_percentage = ((sell_price - buy_price) / buy_price) * 100
                profit_absolute = sell_price - buy_price
                
                # Only include if there's a profit (or include all for completeness)
                opportunities.append({
                    'coin': coin,
                    'buy_exchange': buy_exchange,
                    'buy_price': buy_price,
                    'sell_exchange': sell_exchange,
                    'sell_price': sell_price,
                    'profit_percentage': profit_percentage,
                    'profit_absolute': profit_absolute,
                    'timestamp': datetime.now().isoformat()
                })
    
    # Sort by profit percentage (highest first)
    opportunities.sort(key=lambda x: x['profit_percentage'], reverse=True)
    return opportunities

@crypto_bp.route('/arbitrage', methods=['GET'])
def get_arbitrage():
    """
    Calculate and return arbitrage opportunities
    
    Query parameters:
    - coin: Filter by specific coin (optional)
    - exchange: Filter by specific exchange (optional)
    """
    # Get filter parameters
    coin_filter = request.args.get('coin')
    exchange_filter = request.args.get('exchange')
    
    result = {
        'timestamp': datetime.now().isoformat(),
        'data': {}
    }
    
    # Fetch prices for each coin from each exchange
    for coin in SUPPORTED_COINS:
        base_coin = coin.split('/')[0]  # Use base symbol (BTC, ETH, etc.) as key
        result['data'][base_coin] = {}
        
        # Skip if coin filter is applied and doesn't match
        if coin_filter and coin_filter.upper() != base_coin:
            continue
        
        for exchange_id, exchange in exchange_instances.items():
            # Skip if exchange filter is applied and doesn't match
            if exchange_filter and exchange_filter.lower() != exchange_id.lower():
                continue
                
            try:
                # Skip if exchange doesn't support this coin
                if not exchange.has['fetchTicker']:
                    continue
                
                # Fetch ticker data
                ticker = exchange.fetch_ticker(coin)
                
                # Add null checks before storing data
                if ticker and all(ticker.get(k) is not None for k in ['last', 'bid', 'ask', 'timestamp']):
                    result['data'][base_coin][exchange_id] = {
                        'last': float(ticker['last']),
                        'bid': float(ticker['bid']),
                        'ask': float(ticker['ask']),
                        'timestamp': int(ticker['timestamp'])
                    }
                else:
                    result['data'][base_coin][exchange_id] = {
                        'error': f'Invalid ticker data returned for {coin}'
                    }
            except Exception as e:
                result['data'][base_coin][exchange_id] = {
                    'error': str(e)
                }
    
    # Calculate arbitrage opportunities
    opportunities = calculate_arbitrage(result['data'])
    
    # Return both raw price data and calculated opportunities
    return jsonify({
        'timestamp': result['timestamp'],
        'prices': result['data'],
        'opportunities': opportunities
    })
