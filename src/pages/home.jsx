// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { Download, Upload, Calendar, Users, DollarSign, AlertCircle, CheckCircle, FileSpreadsheet, FileText } from 'lucide-react';

import Sidebar from '@/components/Sidebar';
import KPICards from '@/components/KPICards';
import Charts from '@/components/Charts';
import DataTable from '@/components/DataTable';
import ExportPanel from '@/components/ExportPanel';
export default function Home(props) {
  const {
    toast
  } = useToast();

  // 基础参数
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [holidayVisitors, setHolidayVisitors] = useState(5000);
  const [vacationVisitors, setVacationVisitors] = useState(3000);
  const [normalVisitors, setNormalVisitors] = useState(1500);
  const [avgTicketPrice, setAvgTicketPrice] = useState(80);

  // 早鸟票设置
  const [earlyBirdEnabled, setEarlyBirdEnabled] = useState(false);
  const [earlyBirdPrice, setEarlyBirdPrice] = useState(60);
  const [earlyBirdStartDate, setEarlyBirdStartDate] = useState('');
  const [earlyBirdEndDate, setEarlyBirdEndDate] = useState('');
  const [earlyBirdDailySales, setEarlyBirdDailySales] = useState(500);

  // 寒暑假范围
  const [winterVacationStart, setWinterVacationStart] = useState('2026-01-15');
  const [winterVacationEnd, setWinterVacationEnd] = useState('2026-02-25');
  const [summerVacationStart, setSummerVacationStart] = useState('2026-07-01');
  const [summerVacationEnd, setSummerVacationEnd] = useState('2026-08-31');

  // 初始节日列表（2026年主要节日）
  const INITIAL_HOLIDAYS = `2026-01-01 元旦
2026-01-28 春节
2026-01-29 春节
2026-01-30 春节
2026-01-31 春节
2026-02-01 春节
2026-02-02 春节
2026-02-03 春节
2026-04-04 清明节
2026-04-05 清明节
2026-04-06 清明节
2026-05-01 劳动节
2026-05-02 劳动节
2026-05-03 劳动节
2026-05-04 劳动节
2026-05-05 劳动节
2026-06-01 儿童节
2026-10-01 国庆节
2026-10-02 国庆节
2026-10-03 国庆节
2026-10-04 国庆节
2026-10-05 国庆节
2026-10-06 国庆节
2026-10-07 国庆节`;

  // 节日列表（2026年主要节日）
  const [holidays, setHolidays] = useState(INITIAL_HOLIDAYS);

  // 计算结果
  const [dailyData, setDailyData] = useState([]);
  const [earlyBirdData, setEarlyBirdData] = useState([]);
  const [kpiData, setKpiData] = useState({
    totalRevenue: 0,
    totalVisitors: 0,
    operatingDays: 0,
    holidayDays: 0,
    vacationDays: 0,
    normalDays: 0,
    closedDays: 0,
    earlyBirdRevenue: 0,
    earlyBirdVisitors: 0
  });

  // 解析节日列表
  const parseHolidays = useCallback(() => {
    const holidaySet = new Set();
    const lines = holidays.split('\n').filter(line => line.trim());
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 1) {
        holidaySet.add(parts[0]);
      }
    });
    return holidaySet;
  }, [holidays]);

  // 判断日期类型
  const getDateType = useCallback((dateStr, holidaySet) => {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay(); // 0=周日, 1=周一, ..., 6=周六

    // 优先级1: 节日
    if (holidaySet.has(dateStr)) {
      return {
        type: 'holiday',
        visitors: holidayVisitors,
        isOpen: true
      };
    }

    // 优先级2: 周一闭馆
    if (dayOfWeek === 1) {
      return {
        type: 'closed',
        visitors: 0,
        isOpen: false
      };
    }

    // 优先级3: 寒暑假
    if (dateStr >= winterVacationStart && dateStr <= winterVacationEnd || dateStr >= summerVacationStart && dateStr <= summerVacationEnd) {
      return {
        type: 'vacation',
        visitors: vacationVisitors,
        isOpen: true
      };
    }

    // 优先级4: 平日
    return {
      type: 'normal',
      visitors: normalVisitors,
      isOpen: true
    };
  }, [holidayVisitors, vacationVisitors, normalVisitors, winterVacationStart, winterVacationEnd, summerVacationStart, summerVacationEnd]);

  // 计算早鸟票数据
  const calculateEarlyBirdData = useCallback(() => {
    if (!earlyBirdEnabled || !earlyBirdStartDate || !earlyBirdEndDate) {
      setEarlyBirdData([]);
      return;
    }
    const data = [];
    const start = new Date(earlyBirdStartDate);
    const end = new Date(earlyBirdEndDate);
    let earlyBirdRevenue = 0;
    let earlyBirdVisitors = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();

      // 早鸟票不受周一闭馆限制
      const revenue = earlyBirdDailySales * earlyBirdPrice;
      earlyBirdRevenue += revenue;
      earlyBirdVisitors += earlyBirdDailySales;
      data.push({
        date: dateStr,
        type: 'earlybird',
        typeLabel: '早鸟票',
        visitors: earlyBirdDailySales,
        revenue: revenue,
        isOpen: true,
        dayOfWeek
      });
    }
    setEarlyBirdData(data);
  }, [earlyBirdEnabled, earlyBirdStartDate, earlyBirdEndDate, earlyBirdPrice, earlyBirdDailySales]);

  // 计算每日数据
  const calculateDailyData = useCallback(() => {
    const holidaySet = parseHolidays();
    const data = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    let totalRevenue = 0;
    let totalVisitors = 0;
    let operatingDays = 0;
    let holidayDays = 0;
    let vacationDays = 0;
    let normalDays = 0;
    let closedDays = 0;

    // 计算早鸟票数据
    let earlyBirdRevenue = 0;
    let earlyBirdVisitors = 0;
    if (earlyBirdEnabled && earlyBirdStartDate && earlyBirdEndDate) {
      const ebStart = new Date(earlyBirdStartDate);
      const ebEnd = new Date(earlyBirdEndDate);
      for (let d = new Date(ebStart); d <= ebEnd; d.setDate(d.getDate() + 1)) {
        earlyBirdRevenue += earlyBirdDailySales * earlyBirdPrice;
        earlyBirdVisitors += earlyBirdDailySales;
      }
    }
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const {
        type,
        visitors,
        isOpen
      } = getDateType(dateStr, holidaySet);
      const revenue = isOpen ? visitors * avgTicketPrice : 0;
      data.push({
        date: dateStr,
        type,
        typeLabel: {
          holiday: '节日',
          vacation: '寒暑假',
          normal: '平日',
          closed: '闭馆'
        }[type],
        visitors,
        revenue,
        isOpen
      });
      totalRevenue += revenue;
      totalVisitors += visitors;
      if (isOpen) {
        operatingDays++;
        if (type === 'holiday') holidayDays++;else if (type === 'vacation') vacationDays++;else normalDays++;
      } else {
        closedDays++;
      }
    }

    // 总票房 = 展览票房 + 早鸟票票房
    setDailyData(data);
    setKpiData({
      totalRevenue: totalRevenue + earlyBirdRevenue,
      totalVisitors: totalVisitors + earlyBirdVisitors,
      operatingDays,
      holidayDays,
      vacationDays,
      normalDays,
      closedDays,
      earlyBirdRevenue,
      earlyBirdVisitors
    });
  }, [startDate, endDate, holidayVisitors, vacationVisitors, normalVisitors, avgTicketPrice, winterVacationStart, winterVacationEnd, summerVacationStart, summerVacationEnd, parseHolidays, getDateType, earlyBirdEnabled, earlyBirdStartDate, earlyBirdEndDate, earlyBirdPrice, earlyBirdDailySales]);

  // 自动计算
  useEffect(() => {
    calculateEarlyBirdData();
  }, [calculateEarlyBirdData]);
  useEffect(() => {
    calculateDailyData();
  }, [calculateDailyData]);

  // 下载配置
  const downloadConfig = () => {
    const config = {
      startDate,
      endDate,
      holidayVisitors,
      vacationVisitors,
      normalVisitors,
      avgTicketPrice,
      winterVacationStart,
      winterVacationEnd,
      summerVacationStart,
      summerVacationEnd,
      holidays
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `坤远展览测算配置_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: '配置已导出',
      description: '项目配置文件已成功下载'
    });
  };

  // 上传配置
  const uploadConfig = event => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const config = JSON.parse(e.target.result);
        if (config.startDate) setStartDate(config.startDate);
        if (config.endDate) setEndDate(config.endDate);
        if (config.holidayVisitors) setHolidayVisitors(config.holidayVisitors);
        if (config.vacationVisitors) setVacationVisitors(config.vacationVisitors);
        if (config.normalVisitors) setNormalVisitors(config.normalVisitors);
        if (config.avgTicketPrice) setAvgTicketPrice(config.avgTicketPrice);
        if (config.winterVacationStart) setWinterVacationStart(config.winterVacationStart);
        if (config.winterVacationEnd) setWinterVacationEnd(config.winterVacationEnd);
        if (config.summerVacationStart) setSummerVacationStart(config.summerVacationStart);
        if (config.summerVacationEnd) setSummerVacationEnd(config.summerVacationEnd);
        if (config.holidays) setHolidays(config.holidays);
        toast({
          title: '配置已加载',
          description: '项目配置已成功导入'
        });
      } catch (error) {
        toast({
          title: '导入失败',
          description: '配置文件格式错误，请检查文件内容',
          variant: 'destructive'
        });
      }
    };
    reader.readAsText(file);
  };

  // 恢复节日列表到初始状态
  const resetHolidays = () => {
    setHolidays(INITIAL_HOLIDAYS);
    toast({
      title: '节日列表已恢复',
      description: '节日列表已恢复到初始状态'
    });
  };

  // 逻辑自检
  const logicCheck = () => {
    const totalDays = kpiData.holidayDays + kpiData.vacationDays + kpiData.normalDays + kpiData.closedDays;
    const calculatedTotal = dailyData.length;
    const isMatch = totalDays === calculatedTotal;
    return {
      isMatch,
      totalDays,
      calculatedTotal,
      breakdown: {
        holiday: kpiData.holidayDays,
        vacation: kpiData.vacationDays,
        normal: kpiData.normalDays,
        closed: kpiData.closedDays
      }
    };
  };
  const checkResult = logicCheck();
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
      {/* 顶部导航栏 */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">坤远展览票房精准测算沙盘</h1>
              <p className="text-blue-200 text-sm">2026年版</p>
            </div>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">导入配置</span>
                <input type="file" accept=".json" onChange={uploadConfig} className="hidden" />
              </label>
              <button onClick={downloadConfig} className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">导出配置</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* 主内容区 */}
      <div className="flex">
        {/* 侧边栏 */}
        <Sidebar startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} holidayVisitors={holidayVisitors} setHolidayVisitors={setHolidayVisitors} vacationVisitors={vacationVisitors} setVacationVisitors={setVacationVisitors} normalVisitors={normalVisitors} setNormalVisitors={setNormalVisitors} avgTicketPrice={avgTicketPrice} setAvgTicketPrice={setAvgTicketPrice} winterVacationStart={winterVacationStart} setWinterVacationStart={setWinterVacationStart} winterVacationEnd={winterVacationEnd} setWinterVacationEnd={setWinterVacationEnd} summerVacationStart={summerVacationStart} setSummerVacationStart={setSummerVacationStart} summerVacationEnd={summerVacationEnd} setSummerVacationEnd={setSummerVacationEnd} holidays={holidays} setHolidays={setHolidays} onResetHolidays={resetHolidays} earlyBirdEnabled={earlyBirdEnabled} setEarlyBirdEnabled={setEarlyBirdEnabled} earlyBirdPrice={earlyBirdPrice} setEarlyBirdPrice={setEarlyBirdPrice} earlyBirdStartDate={earlyBirdStartDate} setEarlyBirdStartDate={setEarlyBirdStartDate} earlyBirdEndDate={earlyBirdEndDate} setEarlyBirdEndDate={setEarlyBirdEndDate} earlyBirdDailySales={earlyBirdDailySales} setEarlyBirdDailySales={setEarlyBirdDailySales} />
        
        {/* 右侧内容区 */}
        <main className="flex-1 p-6">
          {/* KPI 卡片 */}
          <KPICards kpiData={kpiData} />
          
          {/* 逻辑自检栏 */}
          <div className={`mt-6 p-4 rounded-lg border-2 ${checkResult.isMatch ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center space-x-3">
              {checkResult.isMatch ? <CheckCircle className="w-6 h-6 text-emerald-600" /> : <AlertCircle className="w-6 h-6 text-red-600" />}
              <div>
                <h3 className={`font-bold ${checkResult.isMatch ? 'text-emerald-800' : 'text-red-800'}`}>
                  逻辑自检结果
                </h3>
                <p className={`text-sm ${checkResult.isMatch ? 'text-emerald-700' : 'text-red-700'}`}>
                  {checkResult.isMatch ? `✓ 计算正确：总天数 ${checkResult.calculatedTotal} = 节日(${checkResult.breakdown.holiday}) + 寒暑假(${checkResult.breakdown.vacation}) + 平日(${checkResult.breakdown.normal}) + 闭馆(${checkResult.breakdown.closed})` : `✗ 计算异常：总天数 ${checkResult.calculatedTotal} ≠ 分类天数之和 ${checkResult.totalDays}`}
                </p>
              </div>
            </div>
          </div>
          
          {/* 图表区域 */}
          <Charts dailyData={dailyData} kpiData={kpiData} />
          
          {/* 导出面板 */}
          <ExportPanel dailyData={dailyData} kpiData={kpiData} startDate={startDate} endDate={endDate} />
          
          {/* 明细表格 */}
          <DataTable dailyData={dailyData} />
        </main>
      </div>
    </div>;
}