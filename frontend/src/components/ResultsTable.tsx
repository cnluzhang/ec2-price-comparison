import React from 'react';
import { EC2Price } from '../services/api';

interface ResultsTableProps {
  prices: EC2Price[];
  priceType: string;
  currency: 'USD' | 'CNY';
  exchangeRate: number;
  formatPrice: (price: number | null, sourceCurrency?: string) => string;
  getRegionFullName: (regionCode: string) => string;
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  prices,
  priceType,
  currency,
  exchangeRate,
  formatPrice,
  getRegionFullName
}) => {
  if (prices.length === 0) return null;

  // Find the lowest on-demand price region for highlighting
  let lowestOnDemandRegion = '';
  
  if (priceType !== 'OnDemand') {
    let lowestOnDemandUsdPrice = Number.MAX_VALUE;
    
    // Find lowest on-demand price region
    prices.forEach(p => {
      if (p.onDemandPrice !== null && p.onDemandPrice > 0) {
        const onDemandUsdPrice = p.onDemandCurrency === 'CNY' ? 
          p.onDemandPrice / exchangeRate : p.onDemandPrice;
          
        if (onDemandUsdPrice < lowestOnDemandUsdPrice) {
          lowestOnDemandUsdPrice = onDemandUsdPrice;
          lowestOnDemandRegion = p.region;
        }
      }
    });
  }
  
  // Sort prices
  const sortedPrices = [...prices]
    .sort((a, b) => {
      // Handle null prices - put them at the end
      if (a.price === null && b.price === null) return 0;
      if (a.price === null) return 1;
      if (b.price === null) return -1;
      
      // 将价格为0的排在最后 (Put prices of 0 at the end)
      if (a.price === 0 && b.price === 0) return 0;
      if (a.price === 0) return 1;
      if (b.price === 0) return -1;
      
      // Convert to display currency for consistent sorting
      const aPrice = currency === 'USD' ?
        (a.currency === 'CNY' ? a.price / exchangeRate : a.price) :
        (a.currency === 'USD' ? a.price * exchangeRate : a.price);
        
      const bPrice = currency === 'USD' ?
        (b.currency === 'CNY' ? b.price / exchangeRate : b.price) :
        (b.currency === 'USD' ? b.price * exchangeRate : b.price);
        
      return aPrice - bPrice;
    });

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed">
        <thead>
          <tr className="bg-[#1a1a1a]">
            <th className="w-1/4 px-6 py-4 text-center text-sm font-medium text-gray-400 uppercase tracking-wider">
              区域代码
            </th>
            <th className="w-1/4 px-6 py-4 text-center text-sm font-medium text-gray-400 uppercase tracking-wider">
              区域名称
            </th>
            <th className="w-1/4 px-6 py-4 text-right text-sm font-medium text-gray-400 uppercase tracking-wider">
              价格 ({currency}/小时)
            </th>
            {priceType !== 'OnDemand' && (
              <>
                <th className="w-1/4 px-6 py-4 text-right text-sm font-medium text-gray-400 uppercase tracking-wider">
                  按需价格 ({currency}/小时)
                </th>
                <th className="w-1/4 px-6 py-4 text-right text-sm font-medium text-gray-400 uppercase tracking-wider">
                  节省百分比
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {sortedPrices.map((price) => (
            <tr 
              key={price.region} 
              className="transition-colors duration-200 hover:bg-[#1a1a1a]">
              <td className="px-6 py-4 text-sm text-gray-300 text-center">
                {price.region}
              </td>
              <td className="px-6 py-4 text-sm text-gray-300 text-center">
                {getRegionFullName(price.region)}
              </td>
              <td className="px-6 py-4 text-sm text-right">
                {price.price === null ? (
                  <span className="text-red-400">未找到价格信息</span>
                ) : price.price === 0 ? (
                  <span className="text-gray-500">不支持</span>
                ) : (
                  <span className="text-emerald-400 font-medium">
                    {formatPrice(price.price, price.currency)}
                  </span>
                )}
              </td>
              {priceType !== 'OnDemand' && (
                <>
                  <td className="px-6 py-4 text-sm text-right">
                    {price.onDemandPrice === null ? (
                      <span className="text-red-400">未找到价格信息</span>
                    ) : price.onDemandPrice === 0 ? (
                      <span className="text-gray-500">不支持</span>
                    ) : (
                      <span className={`${price.region === lowestOnDemandRegion ? 'text-blue-400 font-medium' : 'text-gray-400'}`}>
                        {formatPrice(price.onDemandPrice, price.onDemandCurrency || 'USD')}
                        {price.region === lowestOnDemandRegion && 
                          <span className="ml-1 text-blue-400">★</span>}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    {(() => {
                      // Calculate savings percentage here to handle currency differences
                      if (price.price === null || price.onDemandPrice === null) {
                        return <span className="text-gray-500">-</span>;
                      }
                      
                      // Convert both prices to the same currency (USD) for comparison
                      const reservedUsdPrice = price.currency === 'CNY' ? price.price / exchangeRate : price.price;
                      const onDemandUsdPrice = price.onDemandCurrency === 'CNY' ? price.onDemandPrice / exchangeRate : price.onDemandPrice;
                      
                      if (onDemandUsdPrice <= 0) {
                        return <span className="text-gray-500">-</span>;
                      }
                      
                      const savingsPercentage = ((onDemandUsdPrice - reservedUsdPrice) / onDemandUsdPrice * 100);
                      return <span className="text-emerald-400 font-medium">{savingsPercentage.toFixed(1)}%</span>;
                    })()}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;