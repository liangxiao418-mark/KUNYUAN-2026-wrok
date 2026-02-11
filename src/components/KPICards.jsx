// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';

export default function KPICards({
  kpiData
}) {
  const formatNumber = num => {
    return new Intl.NumberFormat('zh-CN').format(Math.round(num));
  };
  return <div className="grid grid-cols-4 gap-4">
      {/* 总票房 */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white shadow-lg transform hover:scale-105 transition-transform">
        <div className="flex items-center justify-between mb-3">
          <DollarSign className="w-8 h-8 opacity-80" />
          <span className="text-xs bg-blue-500/30 px-2 py-1 rounded-full">KPI</span>
        </div>
        <p className="text-sm text-blue-100 mb-1">总票房</p>
        <p className="text-3xl font-bold font-mono">¥{formatNumber(kpiData.totalRevenue)}</p>
      </div>
      
      {/* 总人次 */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-5 text-white shadow-lg transform hover:scale-105 transition-transform">
        <div className="flex items-center justify-between mb-3">
          <Users className="w-8 h-8 opacity-80" />
          <span className="text-xs bg-emerald-500/30 px-2 py-1 rounded-full">KPI</span>
        </div>
        <p className="text-sm text-emerald-100 mb-1">总人次</p>
        <p className="text-3xl font-bold font-mono">{formatNumber(kpiData.totalVisitors)}</p>
      </div>
      
      {/* 运营天数 */}
      <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl p-5 text-white shadow-lg transform hover:scale-105 transition-transform">
        <div className="flex items-center justify-between mb-3">
          <Calendar className="w-8 h-8 opacity-80" />
          <span className="text-xs bg-amber-500/30 px-2 py-1 rounded-full">KPI</span>
        </div>
        <p className="text-sm text-amber-100 mb-1">运营天数</p>
        <p className="text-3xl font-bold font-mono">{formatNumber(kpiData.operatingDays)}</p>
      </div>
      
      {/* 日均票房 */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-5 text-white shadow-lg transform hover:scale-105 transition-transform">
        <div className="flex items-center justify-between mb-3">
          <TrendingUp className="w-8 h-8 opacity-80" />
          <span className="text-xs bg-purple-500/30 px-2 py-1 rounded-full">KPI</span>
        </div>
        <p className="text-sm text-purple-100 mb-1">日均票房</p>
        <p className="text-3xl font-bold font-mono">
          ¥{kpiData.operatingDays > 0 ? formatNumber(kpiData.totalRevenue / kpiData.operatingDays) : 0}
        </p>
      </div>
    </div>;
}