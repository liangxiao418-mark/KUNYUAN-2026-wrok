// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Calendar, Users, DollarSign, School, Star, Settings, RotateCcw } from 'lucide-react';

export default function Sidebar({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  holidayVisitors,
  setHolidayVisitors,
  vacationVisitors,
  setVacationVisitors,
  normalVisitors,
  setNormalVisitors,
  avgTicketPrice,
  setAvgTicketPrice,
  winterVacationStart,
  setWinterVacationStart,
  winterVacationEnd,
  setWinterVacationEnd,
  summerVacationStart,
  setSummerVacationStart,
  summerVacationEnd,
  setSummerVacationEnd,
  holidays,
  setHolidays,
  onResetHolidays,
  earlyBirdEnabled,
  setEarlyBirdEnabled,
  earlyBirdPrice,
  setEarlyBirdPrice,
  earlyBirdStartDate,
  setEarlyBirdStartDate,
  earlyBirdEndDate,
  setEarlyBirdEndDate,
  earlyBirdDailySales,
  setEarlyBirdDailySales
}) {
  return <aside className="w-80 bg-white shadow-xl min-h-screen p-6 border-r border-slate-200">
      <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
        <Settings className="w-5 h-5 mr-2 text-blue-600" />
        参数配置
      </h2>
      
      {/* 展期设置 */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          展期设置
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">开始日期</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">结束日期</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
          </div>
        </div>
      </div>
      
      {/* 客流模型 */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center">
          <Users className="w-4 h-4 mr-2" />
          客流模型（人次/天）
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              <span className="text-amber-600">★</span> 节日客流
            </label>
            <input type="number" value={holidayVisitors} onChange={e => setHolidayVisitors(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm font-mono" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              <span className="text-emerald-600">📚</span> 寒暑假客流
            </label>
            <input type="number" value={vacationVisitors} onChange={e => setVacationVisitors(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-mono" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              <span className="text-blue-600">📅</span> 平日客流
            </label>
            <input type="number" value={normalVisitors} onChange={e => setNormalVisitors(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono" />
          </div>
        </div>
      </div>
      
      {/* 票价设置 */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center">
          <DollarSign className="w-4 h-4 mr-2" />
          票价设置
        </h3>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">平均票价（元）</label>
          <input type="number" value={avgTicketPrice} onChange={e => setAvgTicketPrice(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono" />
        </div>
      </div>
      
      {/* 早鸟票设置 */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center">
          <Star className="w-4 h-4 mr-2" />
          早鸟票设置
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="earlyBirdEnabled" checked={earlyBirdEnabled} onChange={e => setEarlyBirdEnabled(e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
            <label htmlFor="earlyBirdEnabled" className="text-xs font-medium text-slate-600">启用早鸟票</label>
          </div>
          
          {earlyBirdEnabled && <>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">早鸟票单价（元）</label>
                <input type="number" value={earlyBirdPrice} onChange={e => setEarlyBirdPrice(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono" />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">早鸟票销售开始日期</label>
                <input type="date" value={earlyBirdStartDate} onChange={e => setEarlyBirdStartDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">早鸟票销售结束日期</label>
                <input type="date" value={earlyBirdEndDate} onChange={e => setEarlyBirdEndDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">日均销售量（张/天）</label>
                <input type="number" value={earlyBirdDailySales} onChange={e => setEarlyBirdDailySales(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono" />
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-700">
                  💡 早鸟票早于展览发售，单独计算票房，最终并入总票房。早鸟票销售不受周一闭馆限制。
                </p>
              </div>
            </>}
        </div>
      </div>
      
      {/* 寒暑假范围 */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center">
          <School className="w-4 h-4 mr-2" />
          寒暑假范围
        </h3>
        <div className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg">
            <label className="block text-xs font-medium text-slate-500 mb-2">寒假</label>
            <div className="space-y-2">
              <input type="date" value={winterVacationStart} onChange={e => setWinterVacationStart(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs" />
              <input type="date" value={winterVacationEnd} onChange={e => setWinterVacationEnd(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs" />
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <label className="block text-xs font-medium text-slate-500 mb-2">暑假</label>
            <div className="space-y-2">
              <input type="date" value={summerVacationStart} onChange={e => setSummerVacationStart(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs" />
              <input type="date" value={summerVacationEnd} onChange={e => setSummerVacationEnd(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs" />
            </div>
          </div>
        </div>
      </div>
      
      {/* 节日管理 */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center justify-between">
          <div className="flex items-center">
            <Star className="w-4 h-4 mr-2" />
            节日管理
          </div>
          <button onClick={onResetHolidays} className="flex items-center space-x-1 px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors" title="恢复到初始状态">
            <RotateCcw className="w-3 h-3" />
            <span>恢复</span>
          </button>
        </h3>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            格式：YYYY-MM-DD 节日名称（每行一个）
          </label>
          <textarea value={holidays} onChange={e => setHolidays(e.target.value)} rows={12} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs font-mono resize-none" placeholder="2026-01-01 元旦\n2026-01-28 春节" />
        </div>
      </div>
    </aside>;
}