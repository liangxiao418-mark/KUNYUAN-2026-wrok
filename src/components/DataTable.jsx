// @ts-ignore;
import React, { useState, useMemo } from 'react';
// @ts-ignore;
import { Search, ArrowUpDown } from 'lucide-react';

export default function DataTable({
  dailyData
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('asc');

  // 过滤和排序数据
  const filteredData = useMemo(() => {
    let data = [...dailyData];

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(item => item.date.includes(term) || item.typeLabel.toLowerCase().includes(term) || item.visitors.toString().includes(term) || item.revenue.toString().includes(term));
    }

    // 排序
    data.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === 'date') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    return data;
  }, [dailyData, searchTerm, sortField, sortDirection]);
  const handleSort = field => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  const formatNumber = num => {
    return new Intl.NumberFormat('zh-CN').format(Math.round(num));
  };
  const getTypeColor = type => {
    switch (type) {
      case 'holiday':
        return 'bg-amber-100 text-amber-800';
      case 'vacation':
        return 'bg-emerald-100 text-emerald-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };
  return <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">每日明细表</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="搜索日期、类型、客流、票房..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-64" />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100" onClick={() => handleSort('date')}>
                <div className="flex items-center space-x-1">
                  <span>日期</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100" onClick={() => handleSort('typeLabel')}>
                <div className="flex items-center space-x-1">
                  <span>类型</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100" onClick={() => handleSort('visitors')}>
                <div className="flex items-center justify-end space-x-1">
                  <span>客流（人次）</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100" onClick={() => handleSort('revenue')}>
                <div className="flex items-center justify-end space-x-1">
                  <span>票房（元）</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                状态
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredData.map((item, index) => <tr key={index} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-900 font-mono">{item.date}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                    {item.typeLabel}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-900 text-right font-mono">
                  {formatNumber(item.visitors)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-900 text-right font-mono">
                  ¥{formatNumber(item.revenue)}
                </td>
                <td className="px-4 py-3 text-center">
                  {item.isOpen ? <span className="text-emerald-600 text-xs font-medium">开馆</span> : <span className="text-red-600 text-xs font-medium">闭馆</span>}
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-sm text-slate-500">
        共 {filteredData.length} 条记录
      </div>
    </div>;
}