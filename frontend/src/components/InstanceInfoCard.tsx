import React from 'react';
import { EC2Price, InstanceType } from '../services/api';

interface InstanceInfoCardProps {
  prices: EC2Price[];
  priceType: string;
  isCustomType: boolean;
  customInstanceType: string;
  instanceType: string;
  instanceTypes: InstanceType[];
}

const InstanceInfoCard: React.FC<InstanceInfoCardProps> = ({
  prices,
  priceType,
  isCustomType,
  customInstanceType,
  instanceType,
  instanceTypes
}) => {
  if (prices.length === 0) return null;
  
  return (
    <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800/50">
      <h3 className="text-lg font-medium text-gray-300 mb-4">实例类型信息</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-400">实例类型</p>
          <p className="text-lg font-medium text-emerald-400">{isCustomType ? customInstanceType : instanceType}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">价格类型</p>
          <p className="text-lg font-medium text-emerald-400">
            {priceType === 'OnDemand' ? '按需付费' : 
             priceType === 'Reserved1Year' ? '一年期可转换无预付预留实例' : '三年期可转换无预付预留实例'}
          </p>
        </div>
      </div>
      
      {/* 显示从API返回的实例规格信息 - 紧凑版 */}
      {prices[0]?.specifications && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <h4 className="text-sm font-medium text-gray-400 mb-2">规格详情</h4>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {prices[0].specifications.vcpu && (
              <span className="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-300 ring-1 ring-inset ring-blue-400/20">
                {prices[0].specifications.vcpu} vCPU
              </span>
            )}
            {prices[0].specifications.memory && (
              <span className="inline-flex items-center rounded-md bg-green-400/10 px-2 py-1 text-xs font-medium text-green-300 ring-1 ring-inset ring-green-400/20">
                {prices[0].specifications.memory}
              </span>
            )}
            {prices[0].specifications.storage && (
              <span className="inline-flex items-center rounded-md bg-yellow-400/10 px-2 py-1 text-xs font-medium text-yellow-300 ring-1 ring-inset ring-yellow-400/20">
                {prices[0].specifications.storage}
              </span>
            )}
            {prices[0].specifications.networkPerformance && (
              <span className="inline-flex items-center rounded-md bg-purple-400/10 px-2 py-1 text-xs font-medium text-purple-300 ring-1 ring-inset ring-purple-400/20">
                网络: {prices[0].specifications.networkPerformance}
              </span>
            )}
            {prices[0].specifications.physicalProcessor && (
              <span className="inline-flex items-center rounded-md bg-indigo-400/10 px-2 py-1 text-xs font-medium text-indigo-300 ring-1 ring-inset ring-indigo-400/20">
                处理器: {prices[0].specifications.physicalProcessor}
              </span>
            )}
            {prices[0].specifications.clockSpeed && (
              <span className="inline-flex items-center rounded-md bg-pink-400/10 px-2 py-1 text-xs font-medium text-pink-300 ring-1 ring-inset ring-pink-400/20">
                {prices[0].specifications.clockSpeed}
              </span>
            )}
            {prices[0].specifications.dedicatedEbsThroughput && (
              <span className="inline-flex items-center rounded-md bg-cyan-400/10 px-2 py-1 text-xs font-medium text-cyan-300 ring-1 ring-inset ring-cyan-400/20">
                EBS: {prices[0].specifications.dedicatedEbsThroughput}
              </span>
            )}
            {prices[0].specifications.instanceFamily && (
              <span className="inline-flex items-center rounded-md bg-amber-400/10 px-2 py-1 text-xs font-medium text-amber-300 ring-1 ring-inset ring-amber-400/20">
                系列: {prices[0].specifications.instanceFamily}
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* 当没有规格信息时显示的备用信息 */}
      {!prices[0]?.specifications && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <h4 className="text-sm font-medium text-gray-400 mb-2">规格详情</h4>
          <p className="text-gray-300">
            {isCustomType 
              ? '无法获取此自定义类型的规格信息。请确认实例类型名称是否正确。'
              : instanceTypes.find(it => it.instanceType === instanceType)?.description || '无法获取规格信息'}
          </p>
        </div>
      )}
    </div>
  );
};

export default InstanceInfoCard;