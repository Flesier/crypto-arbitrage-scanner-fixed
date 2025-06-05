import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ArbitrageTable from './components/ArbitrageTable';
import { Button } from './components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import './App.css';

// Define the API URL - will need to be updated for production
const API_URL = 'http://localhost:5000/api/crypto';

// Define types for our data
interface ArbitrageOpportunity {
  coin: string;
  buy_exchange: string;
  buy_price: number;
  sell_exchange: string;
  sell_price: number;
  profit_percentage: number;
  profit_absolute: number;
  timestamp: string;
}

interface ApiResponse {
  timestamp: string;
  prices: Record<string, Record<string, any>>;
  opportunities: ArbitrageOpportunity[];
}

function App() {
  // State for our data
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  // State for filters
  const [selectedCoin, setSelectedCoin] = useState<string>('');
  const [selectedExchange, setSelectedExchange] = useState<string>('');
  
  // State for available options
  const [availableCoins, setAvailableCoins] = useState<string[]>([]);
  const [availableExchanges, setAvailableExchanges] = useState<string[]>([]);
  
  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      // Build query parameters for filtering
      let queryParams = '';
      if (selectedCoin) {
        queryParams += `coin=${selectedCoin}`;
      }
      if (selectedExchange) {
        queryParams += queryParams ? `&exchange=${selectedExchange}` : `exchange=${selectedExchange}`;
      }
      
      const url = `${API_URL}/arbitrage${queryParams ? `?${queryParams}` : ''}`;
      const response = await axios.get<ApiResponse>(url);
      
      setData(response.data);
      setLastUpdated(response.data.timestamp);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch arbitrage data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch available coins and exchanges
  const fetchOptions = async () => {
    try {
      const [coinsResponse, exchangesResponse] = await Promise.all([
        axios.get(`${API_URL}/coins`),
        axios.get(`${API_URL}/exchanges`)
      ]);
      
      // Filter out any empty strings or null values
      const validCoins = coinsResponse.data.coins.filter((coin: string) => coin && coin.trim() !== '');
      const validExchanges = exchangesResponse.data.exchanges.filter((exchange: string) => exchange && exchange.trim() !== '');
      
      setAvailableCoins(validCoins);
      setAvailableExchanges(validExchanges);
    } catch (err) {
      console.error('Error fetching options:', err);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchOptions();
    fetchData();
    
    // Set up interval for periodic refresh (every 30 seconds)
    const intervalId = setInterval(() => {
      fetchData();
    }, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Refetch when filters change
  useEffect(() => {
    fetchData();
  }, [selectedCoin, selectedExchange]);
  
  // Handle filter changes
  const handleCoinChange = (value: string) => {
    setSelectedCoin(value);
  };
  
  const handleExchangeChange = (value: string) => {
    setSelectedExchange(value);
  };
  
  // Handle manual refresh
  const handleRefresh = () => {
    fetchData();
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Crypto Arbitrage Scanner</h1>
        <p className="text-gray-500">
          Find arbitrage opportunities across multiple cryptocurrency exchanges
        </p>
      </header>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter arbitrage opportunities</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Coin</label>
              <Select value={selectedCoin} onValueChange={handleCoinChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Coins" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Coins</SelectItem>
                  {availableCoins.map(coin => (
                    coin ? <SelectItem key={coin} value={coin}>{coin}</SelectItem> : null
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Exchange</label>
              <Select value={selectedExchange} onValueChange={handleExchangeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Exchanges" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exchanges</SelectItem>
                  {availableExchanges.map(exchange => (
                    exchange ? <SelectItem key={exchange} value={exchange}>{exchange}</SelectItem> : null
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={handleRefresh} disabled={loading}>
                {loading ? 'Refreshing...' : 'Refresh Now'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      ) : null}
      
      <div className="mb-2 text-sm text-gray-500">
        Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Never'} 
        {loading && <span className="ml-2">(Refreshing...)</span>}
      </div>
      
      {data ? (
        <ArbitrageTable 
          opportunities={data.opportunities} 
          lastUpdated={lastUpdated} 
        />
      ) : loading ? (
        <div className="text-center py-8">Loading arbitrage data...</div>
      ) : (
        <div className="text-center py-8">No data available</div>
      )}
      
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>Data refreshes automatically every 30 seconds</p>
      </footer>
    </div>
  );
}

export default App;
