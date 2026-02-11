// @ts-ignore;
import React from 'react';

import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
export default function Charts({
  dailyData,
  kpiData
}) {
  // 准备折线图数据（按月聚合）
  const monthlyData = React.useMemo(() => {
    const monthly = {};
    dailyData.forEach(item => {
      const month = item.date.substring(0, 7);
      if (!monthly[month]) {
        monthly[month] = {
          month,
          revenue: 0,
          visitors: 0
        };
      }
      monthly[month].revenue += item.revenue;
      monthly[month].visitors += item.visitors;
    });
    return Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));
  }, [dailyData]);

  // 准备饼图数据
  const pieData = React.useMemo(() => {
    const data = [];

    // 添加早鸟票（如果有）
    if (kpiData.earlyBirdRevenue > 0) {
      data.push({
        name: '早鸟票',
        value: kpiData.earlyBirdRevenue,
        color: '#EC4899'
      });
    }

    // 添加其他类型
    data.push({
      name: '节日',
      value: kpiData.holidayDays * kpiData.holidayDays > 0 ? kpiData.holidayDays * 5000 * 80 : 0,
      color: '#F59E0B'
    }, {
      name: '寒暑假',
      value: kpiData.vacationDays * kpiData.vacationDays > 0 ? kpiData.vacationDays * 3000 * 80 : 0,
      color: '#059669'
    }, {
      name: '平日',
      value: kpiData.normalDays * kpiData.normalDays > 0 ? kpiData.normalDays * 1500 * 80 : 0,
      color: '#1E40AF'
    });
    return data.filter(item => item.value > 0);
  }, [kpiData]);
  const formatNumber = num => {
    return new Intl.NumberFormat('zh-CN').format(Math.round(num));
  };
  return <div className="mt-6 grid grid-cols-2 gap-6">
      {/* 折线图 - 每月票房趋势 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">每月票房趋势</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="month" tick={{
            fill: '#64748B',
            fontSize: 12
          }} stroke="#64748B" />
            <YAxis tick={{
            fill: '#64748B',
            fontSize: 12
          }} stroke="#64748B" tickFormatter={value => `¥${(value / 10000).toFixed(0)}万`} />
            <Tooltip formatter={value => [`¥${formatNumber(value)}`, '票房']} contentStyle={{
            backgroundColor: '#1E293B',
            border: 'none',
            borderRadius: '8px'
          }} itemStyle={{
            color: '#F1F5F9'
          }} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#1E40AF" strokeWidth={3} dot={{
            fill: '#1E40AF',
            r: 4
          }} activeDot={{
            r: 6
          }} name="票房" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* 饼图 - 各时段票房占比 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">各时段票房贡献占比</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({
            name,
            percent
          }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
              {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
            </Pie>
            <Tooltip formatter={value => [`¥${formatNumber(value)}`, '票房']} contentStyle={{
            backgroundColor: '#1E293B',
            border: 'none',
            borderRadius: '8px'
          }} itemStyle={{
            color: '#F1F5F9'
          }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>;
}