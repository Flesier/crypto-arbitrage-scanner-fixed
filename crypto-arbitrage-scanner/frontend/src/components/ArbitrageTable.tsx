import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

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

interface ArbitrageTableProps {
  opportunities: ArbitrageOpportunity[];
  lastUpdated: string;
}

const ArbitrageTable: React.FC<ArbitrageTableProps> = ({ opportunities, lastUpdated }) => {
  // Format currency with 2 decimal places
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format percentage with 2 decimal places
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>
          Crypto Arbitrage Opportunities | Last Updated: {new Date(lastUpdated).toLocaleString()}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Coin</TableHead>
            <TableHead>Buy Exchange</TableHead>
            <TableHead>Buy Price</TableHead>
            <TableHead>Sell Exchange</TableHead>
            <TableHead>Sell Price</TableHead>
            <TableHead>Profit (%)</TableHead>
            <TableHead>Profit (USD)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {opportunities.length > 0 ? (
            opportunities.map((opportunity, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{opportunity.coin}</TableCell>
                <TableCell>{opportunity.buy_exchange}</TableCell>
                <TableCell>{formatCurrency(opportunity.buy_price)}</TableCell>
                <TableCell>{opportunity.sell_exchange}</TableCell>
                <TableCell>{formatCurrency(opportunity.sell_price)}</TableCell>
                <TableCell 
                  className={
                    opportunity.profit_percentage > 0 
                      ? 'text-green-600 font-bold' 
                      : opportunity.profit_percentage < 0 
                        ? 'text-red-600 font-bold' 
                        : ''
                  }
                >
                  {formatPercentage(opportunity.profit_percentage)}
                </TableCell>
                <TableCell 
                  className={
                    opportunity.profit_absolute > 0 
                      ? 'text-green-600 font-bold' 
                      : opportunity.profit_absolute < 0 
                        ? 'text-red-600 font-bold' 
                        : ''
                  }
                >
                  {formatCurrency(opportunity.profit_absolute)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center">No arbitrage opportunities found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ArbitrageTable;
