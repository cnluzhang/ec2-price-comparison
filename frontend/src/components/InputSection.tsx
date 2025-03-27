import React from 'react';
import { Region, InstanceType } from '../services/api';
import { regionGroups } from '../config/regions';

interface InputSectionProps {
  instanceType: string;
  setInstanceType: (type: string) => void;
  customInstanceType: string;
  setCustomInstanceType: (type: string) => void;
  isCustomType: boolean;
  setIsCustomType: (isCustom: boolean) => void;
  selectedRegions: Region[];
  setSelectedRegions: (regions: Region[]) => void;
  availableRegions: Region[];
  instanceTypes: InstanceType[];
  priceType: string;
  setPriceType: (type: string) => void;
  handleSearch: () => void;
  loading: boolean;
  exchangeRate: number;
  currency: 'USD' | 'CNY';
  setCurrency: (currency: 'USD' | 'CNY') => void;
  getRegionFullName: (regionCode: string) => string;
}

const InputSection: React.FC<InputSectionProps> = ({
  instanceType,
  setInstanceType,
  customInstanceType,
  setCustomInstanceType,
  isCustomType,
  setIsCustomType,
  selectedRegions,
  setSelectedRegions,
  availableRegions,
  instanceTypes,
  priceType,
  setPriceType,
  handleSearch,
  loading,
  exchangeRate,
  currency,
  setCurrency,
  getRegionFullName
}) => {
  
  // Helper function to get regions by continent
  const getRegionsByContinent = (continent: string): string[] => {
    const group = regionGroups.find(g => g.name === continent);
    return group ? group.regions.map(region => region.code) : [];
  };

  // Handle region group selection
  const handleRegionGroupSelect = (continent: string) => {
    const regions = getRegionsByContinent(continent);

    // Check if all regions in this continent are already selected
    const isAllSelected = regions.every(regionCode => 
      selectedRegions.some(selected => selected.code === regionCode)
    );

    if (isAllSelected) {
      // If all selected, deselect all regions in this continent
      setSelectedRegions(prev => 
        prev.filter(region => !regions.includes(region.code))
      );
    } else {
      // If not all selected, add all regions in this continent
      setSelectedRegions(prev => {
        const newRegions = [...prev];
        regions.forEach(regionCode => {
          if (!newRegions.some(r => r.code === regionCode)) {
            // Set custom endpoint for China regions
            const endpoint = regionCode.startsWith('cn-') 
              ? 'https://api.pricing.cn-northwest-1.amazonaws.com.cn'
              : `https://pricing.${regionCode}.amazonaws.com`;

            newRegions.push({
              code: regionCode,
              name: getRegionFullName(regionCode),
              endpoint: endpoint,
              optInStatus: 'opt-in-not-required'
            });
          }
        });
        return newRegions;
      });
    }
  };

  return (
    <>
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500">
          EC2 价格比较工具
        </h1>
        <p className="text-gray-400">快速对比不同区域的 EC2 实例价格</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 左侧：实例类型和过滤条件 */}
        <div className="space-y-8">
          {/* 实例类型选择 */}
          <div className="bg-[#2a2a2a]/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 font-bold">
                1
              </span>
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                选择实例类型
              </span>
            </h2>
            
            {/* 实例类型选择方式切换 */}
            <div className="flex mb-4">
              <button 
                onClick={() => setIsCustomType(false)}
                className={`flex-1 py-2 px-4 text-center rounded-l-lg transition-all ${
                  !isCustomType 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-[#1a1a1a] text-gray-400 hover:text-gray-200'
                }`}
              >
                预设实例类型
              </button>
              <button 
                onClick={() => setIsCustomType(true)}
                className={`flex-1 py-2 px-4 text-center rounded-r-lg transition-all ${
                  isCustomType 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-[#1a1a1a] text-gray-400 hover:text-gray-200'
                }`}
              >
                自定义实例类型
              </button>
            </div>
            
            {/* 预设实例类型下拉选择框 */}
            {!isCustomType && (
              <select
                value={instanceType}
                onChange={(e) => setInstanceType(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700/50 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
              >
                <option value="">请选择实例类型</option>
                {instanceTypes.map(type => (
                  <option key={type.instanceType} value={type.instanceType}>
                    {type.description}
                  </option>
                ))}
              </select>
            )}
            
            {/* 自定义实例类型输入框 */}
            {isCustomType && (
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={customInstanceType}
                    onChange={(e) => {
                      // Allow only valid instance type patterns
                      const value = e.target.value.trim();
                      setCustomInstanceType(value);
                    }}
                    placeholder="输入实例类型（例如: c6g.xlarge）"
                    className={`w-full bg-[#1a1a1a] border rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 ${
                      customInstanceType && !/^[a-z][0-9]?[a-z0-9]*?n?\.[a-z0-9]+([-][a-z0-9]+)*$/i.test(customInstanceType) 
                        ? 'border-red-500/60' 
                        : 'border-gray-700/50'
                    }`}
                  />
                  {customInstanceType && !/^[a-z][0-9]?[a-z0-9]*?n?\.[a-z0-9]+([-][a-z0-9]+)*$/i.test(customInstanceType) && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">
                    输入完整实例类型名称，例如 "t3.xlarge"、"m6g.2xlarge"、"c5.4xlarge" 等。
                  </p>
                  {customInstanceType && !/^[a-z][0-9]?[a-z0-9]*?n?\.[a-z0-9]+([-][a-z0-9]+)*$/i.test(customInstanceType) && (
                    <p className="text-xs text-red-400">
                      实例类型格式不正确。正确格式应为：系列名（例如t3、m6g、p5en）+ 点 + 规格（例如xlarge、48xlarge、metal-24xl）
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 价格类型选择 */}
          <div className="bg-[#2a2a2a]/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 font-bold">
                2
              </span>
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                选择价格类型
              </span>
            </h2>
            <select
              value={priceType}
              onChange={(e) => {
                console.log(`Changing price type to: ${e.target.value}`);
                setPriceType(e.target.value);
              }}
              className="w-full bg-[#1a1a1a] border border-gray-700/50 rounded-xl px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
            >
              <option value="OnDemand">按需付费</option>
              <option value="Reserved1Year">一年期可转换无预付预留实例</option>
              <option value="Reserved3Year">三年期可转换无预付预留实例</option>
            </select>
          </div>


          {/* 过滤条件 */}
          <div className="bg-[#2a2a2a]/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 shadow-xl">
            <h3 className="text-lg font-semibold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              当前过滤条件
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">实例类型过滤</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-500"></span>
                    默认显示中国区域可用实例类型
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">其他过滤条件</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-green-500"></span>
                    操作系统: Linux
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-green-500"></span>
                    租户类型: Shared
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-green-500"></span>
                    容量状态: Used
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-green-500"></span>
                    预装软件: NA
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：区域选择 */}
        <div className="bg-[#2a2a2a]/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 shadow-xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 font-bold">
              3
            </span>
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              选择区域
            </span>
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {['北美', '南美', '欧洲', '亚太', '中东', '非洲', '中国'].map(continent => {
              const regions = getRegionsByContinent(continent);
              const hasSelected = regions.some(regionCode => 
                selectedRegions.some(selected => selected.code === regionCode)
              );

              return (
                <button
                  key={continent}
                  onClick={() => handleRegionGroupSelect(continent)}
                  className={`group relative px-4 py-3 rounded-xl border transition-all duration-200 ${
                    hasSelected
                      ? 'bg-blue-500/20 border-blue-500/30 text-blue-300'
                      : 'bg-[#1a1a1a] border-gray-700/50 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 opacity-0 transition-opacity duration-200 ${hasSelected ? 'opacity-100' : 'group-hover:opacity-100'}`} />
                  <span className="relative z-10">{continent}</span>
                </button>
              );
            })}
          </div>

          {selectedRegions.length > 0 && (
            <div className="mt-6 bg-[#1a1a1a] rounded-xl p-4 border border-gray-800/50">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">已选择区域</h3>
              <div className="flex flex-wrap gap-2">
                {selectedRegions.map(region => (
                  <div
                    key={region.code}
                    className="group flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 text-blue-300 rounded-lg text-sm"
                  >
                    <span>{region.name}</span>
                    <button 
                      onClick={() => setSelectedRegions(prev => prev.filter(r => r.code !== region.code))}
                      className="opacity-50 hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setSelectedRegions([])}
                  className="px-3 py-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  清除所有选择
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 操作栏 - 查询按钮 */}
      <div className="mt-8 flex items-center justify-center gap-4">
        {/* 查询按钮 */}
        <button
          onClick={handleSearch}
          disabled={
            loading || 
            (!isCustomType && !instanceType) || 
            (isCustomType && (!customInstanceType || !/^[a-z][0-9]?[a-z0-9]*?n?\.[a-z0-9]+([-][a-z0-9]+)*$/i.test(customInstanceType))) || 
            selectedRegions.length === 0
          }
          className={`relative group w-48 px-6 py-3 rounded-xl text-white text-base font-medium flex items-center justify-center transition-all duration-200 ${
            loading || 
            (!isCustomType && !instanceType) || 
            (isCustomType && (!customInstanceType || !/^[a-z][0-9]?[a-z0-9]*?n?\.[a-z0-9]+([-][a-z0-9]+)*$/i.test(customInstanceType))) || 
            selectedRegions.length === 0
              ? 'bg-gray-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-lg hover:shadow-blue-500/20'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              加载中...
            </div>
          ) : (
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              开始查询
            </span>
          )}
        </button>
      </div>

      {/* 货币选择 - 放在右侧 */}
      <div className="mt-4 flex justify-end">
        <div className="flex items-center gap-3 bg-[#1a1a1a]/60 rounded-xl py-2 px-3 border border-gray-800/30">
          <div className="text-sm text-gray-400">货币:</div>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2.5 py-1 rounded-md flex items-center text-sm justify-center gap-1 transition-all ${
                currency === 'USD'
                  ? 'bg-emerald-600/20 text-emerald-300 ring-1 ring-emerald-500/30'
                  : 'bg-[#2a2a2a] text-gray-400 hover:text-gray-300'
              }`}
            >
              <span>$</span>
              <span>USD</span>
            </button>
            <button
              onClick={() => setCurrency('CNY')}
              className={`px-2.5 py-1 rounded-md flex items-center text-sm justify-center gap-1 transition-all ${
                currency === 'CNY'
                  ? 'bg-emerald-600/20 text-emerald-300 ring-1 ring-emerald-500/30'
                  : 'bg-[#2a2a2a] text-gray-400 hover:text-gray-300'
              }`}
            >
              <span>¥</span>
              <span>CNY</span>
            </button>
          </div>
          <div className="text-xs text-gray-500">
            1 USD = {exchangeRate.toFixed(2)} CNY
          </div>
        </div>
      </div>
    </>
  );
};

export default InputSection;