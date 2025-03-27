import { useState, useEffect, useCallback } from 'react'
import { api, EC2Price, Region, InstanceType } from './services/api'
import { allRegions } from './config/regions'
// Import components
import InputSection from './components/InputSection'
import ErrorDisplay from './components/ErrorDisplay'
import InstanceInfoCard from './components/InstanceInfoCard'
import ResultsTable from './components/ResultsTable'
import PriceChart from './components/PriceChart'

function App() {
  const [instanceType, setInstanceType] = useState('')
  const [customInstanceType, setCustomInstanceType] = useState('')
  const [isCustomType, setIsCustomType] = useState(false)
  const [selectedRegions, setSelectedRegions] = useState<Region[]>([])
  const [availableRegions, setAvailableRegions] = useState<Region[]>([])
  const [instanceTypes, setInstanceTypes] = useState<InstanceType[]>([])
  const [prices, setPrices] = useState<EC2Price[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exchangeRate, setExchangeRate] = useState<number>(7.3)
  const [priceType, setPriceType] = useState<string>('OnDemand')
  const [currency, setCurrency] = useState<'USD' | 'CNY'>('USD')

  // Format and convert currency values
  const formatPrice = (price: number | null, sourceCurrency: string = 'USD'): string => {
    if (price === null) return '-';
    
    // First convert to the target display currency
    let displayPrice = price;
    
    // Handle USD -> CNY or CNY -> USD conversion
    if (sourceCurrency === 'USD' && currency === 'CNY') {
      // Convert USD to CNY
      displayPrice = price * exchangeRate;
    } else if (sourceCurrency === 'CNY' && currency === 'USD') {
      // Convert CNY to USD
      displayPrice = price / exchangeRate;
    }
    
    // Format with appropriate currency symbol
    const symbol = currency === 'CNY' ? '¥' : '$';
    return `${symbol}${displayPrice.toFixed(4)}`;
  };
  
  // 获取区域完整名称的函数 - 使用regions.ts文件中的数据
  const getRegionFullName = (regionCode: string): string => {
    const region = allRegions.find(r => r.code === regionCode);
    return region ? region.name : regionCode;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [regions, types] = await Promise.all([
          api.getAvailableRegions(),
          api.getInstanceTypes()
        ]);
        setAvailableRegions(regions);
        setInstanceTypes(types);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data. Please refresh and try again.');
      }
    };

    fetchData();
  }, []);
  
  // Fetch exchange rate on component mount
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const data = await api.getExchangeRate();
        if (data && data.rate) {
          setExchangeRate(data.rate);
          console.log(`Updated exchange rate: 1 USD = ${data.rate} CNY`);
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
      }
    };
    
    fetchExchangeRate();
  }, []);

  // Function to fetch pricing data
  const fetchPrices = useCallback(async (type: string) => {
    const effectiveInstanceType = isCustomType ? customInstanceType : instanceType;
    
    if (!effectiveInstanceType || selectedRegions.length === 0) return null;
    
    try {
      console.log(`Querying ${type} prices...`);
      const regionCodes = selectedRegions.map(r => r.code);
      const data = await api.getEC2Prices(effectiveInstanceType, regionCodes, type);
      console.log(`Received ${type} price data:`, data);
      
      if (!data || data.length === 0) {
        return null;
      }
      
      // Check if we got all null prices
      const allNullPrices = data.every(item => item.price === null);
      if (allNullPrices) {
        return null;
      }
      
      return data;
    } catch (err) {
      console.error(`${type} query failed:`, err);
      return null;
    }
  }, [customInstanceType, instanceType, isCustomType, selectedRegions]);

  const handleSearch = async () => {
    const effectiveInstanceType = isCustomType ? customInstanceType : instanceType;
    
    if (!effectiveInstanceType || selectedRegions.length === 0) return;
    
    setLoading(true);
    setError('');
    setPrices([]); // Clear previous data
    
    try {
      console.log('Querying prices...');
      let data;
      
      // Always fetch the requested price type
      data = await fetchPrices(priceType);

      if (!data || data.length === 0) {
        setError(`未找到价格数据。${priceType !== 'OnDemand' ? '预留实例价格可能在所选区域不可用。' : ''}`);
        return;
      }
      
      setPrices(data);
    } catch (err) {
      console.error('Query failed:', err);
      setError('Failed to get price data. Please check instance type.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a1a1a] to-black text-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-4 px-4 py-2 bg-gray-800/50 rounded-md text-amber-300 text-xs text-center">
          ⚠️ 免责声明：本工具仅供开发和教育目的使用。与 AWS 无关联。价格数据可能不准确，请勿用于决策。
        </div>
        
        {/* Input Section */}
        <InputSection 
          instanceType={instanceType}
          setInstanceType={setInstanceType}
          customInstanceType={customInstanceType}
          setCustomInstanceType={setCustomInstanceType}
          isCustomType={isCustomType}
          setIsCustomType={setIsCustomType}
          selectedRegions={selectedRegions}
          setSelectedRegions={setSelectedRegions}
          availableRegions={availableRegions}
          instanceTypes={instanceTypes}
          priceType={priceType}
          setPriceType={setPriceType}
          handleSearch={handleSearch}
          loading={loading}
          exchangeRate={exchangeRate}
          currency={currency}
          setCurrency={setCurrency}
          getRegionFullName={getRegionFullName}
        />

        {/* Error Display */}
        <ErrorDisplay error={error} />

        {/* Results Section */}
        {prices.length > 0 && (
          <div className="mt-12 space-y-8">
            {/* Instance Info Card */}
            <InstanceInfoCard 
              prices={prices}
              priceType={priceType}
              isCustomType={isCustomType}
              customInstanceType={customInstanceType}
              instanceType={instanceType}
              instanceTypes={instanceTypes}
            />

            <h2 className="text-2xl font-semibold text-center bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              价格比较结果
            </h2>
            
            {/* Results Table */}
            <div className="mt-8">
              <ResultsTable
                prices={prices}
                priceType={priceType}
                currency={currency}
                exchangeRate={exchangeRate}
                formatPrice={formatPrice}
                getRegionFullName={getRegionFullName}
              />
            </div>

            {/* Price Chart */}
            <div className="mt-8">
              <PriceChart
                prices={prices}
                priceType={priceType}
                currency={currency}
                exchangeRate={exchangeRate}
                formatPrice={formatPrice}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App