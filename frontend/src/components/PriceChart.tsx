import React, { useRef, useEffect } from 'react';
import { EC2Price } from '../services/api';

interface PriceChartProps {
  prices: EC2Price[];
  priceType: string;
  currency: 'USD' | 'CNY';
  exchangeRate: number;
  formatPrice: (price: number | null, sourceCurrency?: string) => string;
}

const PriceChart: React.FC<PriceChartProps> = ({
  prices,
  priceType,
  currency,
  exchangeRate,
  formatPrice
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  
  // Draw modern chart with enhanced styling
  const drawChart = () => {
    if (!chartRef.current || prices.length === 0) return;

    const canvas = chartRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with higher resolution for better quality
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = 500 * 2;
    ctx.scale(2, 2); // Scale everything to maintain proper sizing
    
    const canvasWidth = canvas.width / 2;
    const canvasHeight = canvas.height / 2;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Filter out null/zero prices and convert all to display currency for sorting
    const validPrices = prices
      .filter(p => p.price !== null && p.price !== 0)
      .sort((a, b) => {
        // Since we've filtered out null prices above, we can safely use a.price and b.price directly
        const aUsdPrice = a.currency === 'CNY' ? a.price / exchangeRate : a.price;
        const bUsdPrice = b.currency === 'CNY' ? b.price / exchangeRate : b.price;
        return aUsdPrice - bUsdPrice;
      }) as (EC2Price & { price: number })[];
    
    if (validPrices.length === 0) return;

    // Chart dimensions
    const margin = { 
      top: 60, 
      right: 40, 
      bottom: 80, 
      left: 70 
    };
    const chartWidth = canvasWidth - margin.left - margin.right;
    const chartHeight = canvasHeight - margin.top - margin.bottom;
    
    // Find the maximum price for scaling (converted to display currency)
    const maxPrice = Math.max(...validPrices.map(p => {
      return currency === 'USD' ? 
        (p.currency === 'CNY' ? p.price / exchangeRate : p.price) : 
        (p.currency === 'USD' ? p.price * exchangeRate : p.price);
    })) * 1.1; // Add 10% padding at top
    
    // Bar dimensions
    const barCount = validPrices.length;
    const barPadding = 0.3; // 30% of space for padding
    const barWidth = (chartWidth / barCount) * (1 - barPadding);
    
    // Background styling - add subtle grid
    ctx.save();
    ctx.fillStyle = 'rgba(26, 26, 26, 0.3)';
    ctx.fillRect(margin.left, margin.top, chartWidth, chartHeight);
    
    // Draw background grid
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.15)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    const gridLineCount = 5;
    for (let i = 0; i <= gridLineCount; i++) {
      const y = margin.top + ((gridLineCount - i) / gridLineCount) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
    }
    
    // Add subtle vertical grid lines for each bar
    validPrices.forEach((_, index) => {
      const x = margin.left + (index + 0.5) * (chartWidth / barCount);
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, margin.top + chartHeight);
      ctx.stroke();
    });
    ctx.restore();
    
    // Draw chart axes
    ctx.save();
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + chartHeight);
    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
    ctx.stroke();
    
    // Draw chart title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${priceType === 'OnDemand' ? '按需' : priceType === 'Reserved1Year' ? '一年预留' : '三年预留'}实例价格比较 (${currency})`, canvasWidth / 2, margin.top / 2);
    
    // Draw y-axis title
    ctx.save();
    ctx.translate(margin.left / 3, margin.top + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = 'rgba(156, 163, 175, 0.8)';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`价格 (${currency === 'USD' ? '$' : '¥'}/小时)`, 0, 0);
    ctx.restore();
    
    // Draw x-axis title
    ctx.fillStyle = 'rgba(156, 163, 175, 0.8)';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('区域', margin.left + chartWidth / 2, canvasHeight - margin.bottom / 3);
    
    // Price scale (y-axis)
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(156, 163, 175, 0.9)';
    ctx.font = '12px Inter, sans-serif';
    
    for (let i = 0; i <= gridLineCount; i++) {
      const price = (i / gridLineCount) * maxPrice;
      const y = margin.top + ((gridLineCount - i) / gridLineCount) * chartHeight;
      // Format the price with the correct currency
      const formattedPrice = formatPrice(price, validPrices[0]?.currency || 'USD');
      ctx.fillText(formattedPrice, margin.left - 10, y + 4);
    }
    ctx.restore();
    
    // Draw bars with enhanced styling
    validPrices.forEach((price, index) => {
      const displayPrice = currency === 'USD' ? 
        (price.currency === 'CNY' ? price.price / exchangeRate : price.price) : 
        (price.currency === 'USD' ? price.price * exchangeRate : price.price);
      
      // Calculate bar position and dimensions
      const x = margin.left + (index + barPadding/2) * (chartWidth / barCount);
      const barHeight = (displayPrice / maxPrice) * chartHeight;
      const y = margin.top + chartHeight - barHeight;
      
      // Create gradient based on price type
      const gradient = ctx.createLinearGradient(0, y, 0, margin.top + chartHeight);
      
      if (priceType === 'OnDemand') {
        // Blue gradient for on-demand
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.9)');
        gradient.addColorStop(1, 'rgba(37, 99, 235, 0.9)');
      } else if (priceType === 'Reserved1Year') {
        // Green gradient for 1-year reserved
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.9)');
        gradient.addColorStop(1, 'rgba(5, 150, 105, 0.9)');
      } else {
        // Purple gradient for 3-year reserved
        gradient.addColorStop(0, 'rgba(124, 58, 237, 0.9)');
        gradient.addColorStop(1, 'rgba(109, 40, 217, 0.9)');
      }
      
      // Draw simple bar with rounded corners
      ctx.fillStyle = gradient;
      ctx.beginPath();
      // Use roundRect if supported, otherwise use fallback
      if (typeof ctx.roundRect === 'function') {
        // @ts-ignore - TypeScript may not recognize roundRect yet
        ctx.roundRect(x, y, barWidth, barHeight, 4);
      } else {
        // Fallback for browsers that don't support roundRect
        ctx.rect(x, y, barWidth, barHeight);
      }
      ctx.fill();
      
      // Draw price label above bar
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      
      // Format price display using the existing format function
      const priceDisplay = formatPrice(price.price, price.currency);
      
      // Add a subtle background for the price label
      const textMetrics = ctx.measureText(priceDisplay);
      const labelWidth = textMetrics.width + 16;
      const labelHeight = 20;
      const labelX = x + barWidth/2 - labelWidth/2;
      const labelY = y - labelHeight - 5;
      
      // Only show the label background if there's enough space
      if (y > margin.top + labelHeight + 10) {
        ctx.fillStyle = priceType === 'OnDemand' ? 'rgba(37, 99, 235, 0.9)' : 
                       priceType === 'Reserved1Year' ? 'rgba(5, 150, 105, 0.9)' : 
                       'rgba(109, 40, 217, 0.9)';
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          // @ts-ignore - TypeScript may not recognize roundRect yet
          ctx.roundRect(labelX, labelY, labelWidth, labelHeight, 4);
        } else {
          // Fallback for browsers that don't support roundRect
          ctx.rect(labelX, labelY, labelWidth, labelHeight);
        }
        ctx.fill();
        
        // Draw price text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(priceDisplay, x + barWidth/2, labelY + 14);
      }
      ctx.restore();
      
      // Draw region label on x-axis
      ctx.save();
      ctx.fillStyle = 'rgba(209, 213, 219, 0.9)';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      
      // Rotate region labels for better fit
      ctx.translate(
        x + barWidth/2, 
        margin.top + chartHeight + 15
      );
      ctx.rotate(Math.PI / 4);
      ctx.fillText(price.region, 0, 0);
      ctx.restore();
    });
  };

  // Redraw chart when data changes
  useEffect(() => {
    drawChart();
  }, [prices, currency, exchangeRate, priceType]);

  // Redraw chart on window resize
  useEffect(() => {
    const handleResize = () => {
      drawChart();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [prices, currency, exchangeRate, priceType]);

  if (prices.length === 0) return null;
  
  return (
    <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800/50">
      <canvas
        ref={chartRef}
        className="w-full"
        style={{ height: '500px' }}
      />
    </div>
  );
};

export default PriceChart;