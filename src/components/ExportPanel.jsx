// @ts-ignore;
import React, { useRef } from 'react';
// @ts-ignore;
import { FileSpreadsheet, Download, Image } from 'lucide-react';
// @ts-ignore;
import { useToast } from '@/components/ui';

// 简单的图表绘制函数
const drawCharts = (canvas, dailyData, kpiData) => {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // 清空画布
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // 绘制折线图（每月票房趋势）
  const chartX = 50;
  const chartY = 50;
  const chartWidth = 300;
  const chartHeight = 200;

  // 计算每月数据
  const monthlyData = [];
  for (let i = 0; i < 12; i++) {
    const monthData = dailyData.filter(d => {
      const month = new Date(d.date).getMonth();
      return month === i;
    });
    const monthRevenue = monthData.reduce((sum, d) => sum + d.revenue, 0);
    monthlyData.push({
      month: i + 1,
      revenue: monthRevenue
    });
  }
  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue)) || 1;

  // 绘制坐标轴
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(chartX, chartY);
  ctx.lineTo(chartX, chartY + chartHeight);
  ctx.lineTo(chartX + chartWidth, chartY + chartHeight);
  ctx.stroke();

  // 绘制折线
  ctx.strokeStyle = '#3B82F6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  monthlyData.forEach((d, i) => {
    const x = chartX + i / 11 * chartWidth;
    const y = chartY + chartHeight - d.revenue / maxRevenue * chartHeight;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  // 绘制数据点
  ctx.fillStyle = '#3B82F6';
  monthlyData.forEach((d, i) => {
    const x = chartX + i / 11 * chartWidth;
    const y = chartY + chartHeight - d.revenue / maxRevenue * chartHeight;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // 绘制标题
  ctx.fillStyle = '#1E40AF';
  ctx.font = 'bold 14px Microsoft YaHei';
  ctx.fillText('每月票房趋势', chartX, chartY - 10);

  // 绘制饼图（各时段票房贡献占比）
  const pieX = 400;
  const pieY = 150;
  const pieRadius = 80;
  const pieData = [{
    label: '节日',
    value: kpiData.holidayDays,
    color: '#EF4444'
  }, {
    label: '寒暑假',
    value: kpiData.vacationDays,
    color: '#F59E0B'
  }, {
    label: '平日',
    value: kpiData.normalDays,
    color: '#10B981'
  }];
  const total = pieData.reduce((sum, d) => sum + d.value, 0);
  let startAngle = -Math.PI / 2;
  pieData.forEach(d => {
    const sliceAngle = d.value / total * Math.PI * 2;
    ctx.fillStyle = d.color;
    ctx.beginPath();
    ctx.moveTo(pieX, pieY);
    ctx.arc(pieX, pieY, pieRadius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fill();
    startAngle += sliceAngle;
  });

  // 绘制图例
  ctx.font = '12px Microsoft YaHei';
  pieData.forEach((d, i) => {
    const legendY = pieY + pieRadius + 20 + i * 20;
    ctx.fillStyle = d.color;
    ctx.fillRect(pieX - 60, legendY - 10, 12, 12);
    ctx.fillStyle = '#374151';
    ctx.fillText(`${d.label} (${(d.value / total * 100).toFixed(0)}%)`, pieX - 40, legendY);
  });

  // 绘制标题
  ctx.fillStyle = '#1E40AF';
  ctx.font = 'bold 14px Microsoft YaHei';
  ctx.fillText('各时段票房贡献占比', pieX - 60, pieY - pieRadius - 10);
};
export default function ExportPanel({
  dailyData,
  kpiData,
  startDate,
  endDate,
  checkResult,
  // 参数配置数据
  holidayVisitors,
  vacationVisitors,
  normalVisitors,
  avgTicketPrice,
  winterVacationStart,
  winterVacationEnd,
  summerVacationStart,
  summerVacationEnd,
  earlyBirdEnabled,
  earlyBirdPrice,
  earlyBirdStartDate,
  earlyBirdEndDate,
  earlyBirdDailySales
}) {
  const {
    toast
  } = useToast();
  const lineChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const formatNumber = num => {
    return new Intl.NumberFormat('zh-CN').format(Math.round(num));
  };

  // 导出 Excel
  const exportExcel = () => {
    try {
      // 创建工作簿数据
      const workbookData = {
        sheets: {
          '汇总报告': [],
          '每日明细': []
        }
      };

      // 汇总报告 Sheet
      const summarySheet = [['坤远展览票房精准测算报告'], [''], ['展期', `${startDate} 至 ${endDate}`], [''], ['核心指标', '数值'], ['总票房', `¥${formatNumber(kpiData.totalRevenue)}`], ['总人次', formatNumber(kpiData.totalVisitors)], ['运营天数', formatNumber(kpiData.operatingDays)], ['日均票房', `¥${kpiData.operatingDays > 0 ? formatNumber(kpiData.totalRevenue / kpiData.operatingDays) : 0}`]];

      // 添加早鸟票信息（如果有）
      if (kpiData.earlyBirdRevenue > 0) {
        summarySheet.push([''], ['早鸟票统计', '数值']);
        summarySheet.push(['早鸟票票房', `¥${formatNumber(kpiData.earlyBirdRevenue)}`]);
        summarySheet.push(['早鸟票人次', formatNumber(kpiData.earlyBirdVisitors)]);
        summarySheet.push(['展览票房', `¥${formatNumber(kpiData.totalRevenue - kpiData.earlyBirdRevenue)}`]);
      }
      summarySheet.push([''], ['分类统计', '天数', '占比']);
      summarySheet.push(['节日天数', formatNumber(kpiData.holidayDays), `${(kpiData.holidayDays / dailyData.length * 100).toFixed(1)}%`]);
      summarySheet.push(['寒暑假天数', formatNumber(kpiData.vacationDays), `${(kpiData.vacationDays / dailyData.length * 100).toFixed(1)}%`]);
      summarySheet.push(['平日天数', formatNumber(kpiData.normalDays), `${(kpiData.normalDays / dailyData.length * 100).toFixed(1)}%`]);
      summarySheet.push(['闭馆天数', formatNumber(kpiData.closedDays), `${(kpiData.closedDays / dailyData.length * 100).toFixed(1)}%`]);
      workbookData.sheets['汇总报告'] = summarySheet;

      // 每日明细 Sheet
      workbookData.sheets['每日明细'] = [['日期', '类型', '客流（人次）', '票房（元）', '状态'], ...dailyData.map(item => [item.date, item.typeLabel, formatNumber(item.visitors), formatNumber(item.revenue), item.isOpen ? '开馆' : '闭馆'])];

      // 生成 CSV 文件（简化版 Excel 导出）
      let csvContent = '';

      // 汇总报告
      csvContent += '坤远展览票房精准测算报告\n\n';
      csvContent += `展期,${startDate} 至 ${endDate}\n\n`;
      csvContent += '核心指标,数值\n';
      csvContent += `总票房,¥${formatNumber(kpiData.totalRevenue)}\n`;
      csvContent += `总人次,${formatNumber(kpiData.totalVisitors)}\n`;
      csvContent += `运营天数,${formatNumber(kpiData.operatingDays)}\n`;
      csvContent += `日均票房,¥${kpiData.operatingDays > 0 ? formatNumber(kpiData.totalRevenue / kpiData.operatingDays) : 0}\n\n`;

      // 添加早鸟票信息（如果有）
      if (kpiData.earlyBirdRevenue > 0) {
        csvContent += '早鸟票统计,数值\n';
        csvContent += `早鸟票票房,¥${formatNumber(kpiData.earlyBirdRevenue)}\n`;
        csvContent += `早鸟票人次,${formatNumber(kpiData.earlyBirdVisitors)}\n`;
        csvContent += `展览票房,¥${formatNumber(kpiData.totalRevenue - kpiData.earlyBirdRevenue)}\n\n`;
      }
      csvContent += '分类统计,天数,占比\n';
      csvContent += `节日天数,${formatNumber(kpiData.holidayDays)},${(kpiData.holidayDays / dailyData.length * 100).toFixed(1)}%\n`;
      csvContent += `寒暑假天数,${formatNumber(kpiData.vacationDays)},${(kpiData.vacationDays / dailyData.length * 100).toFixed(1)}%\n`;
      csvContent += `平日天数,${formatNumber(kpiData.normalDays)},${(kpiData.normalDays / dailyData.length * 100).toFixed(1)}%\n`;
      csvContent += `闭馆天数,${formatNumber(kpiData.closedDays)},${(kpiData.closedDays / dailyData.length * 100).toFixed(1)}%\n\n`;
      csvContent += '\n\n每日明细\n';
      csvContent += '日期,类型,客流（人次）,票房（元）,状态\n';
      dailyData.forEach(item => {
        csvContent += `${item.date},${item.typeLabel},${formatNumber(item.visitors)},${formatNumber(item.revenue)},${item.isOpen ? '开馆' : '闭馆'}\n`;
      });

      // 添加 BOM 以支持中文
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], {
        type: 'text/csv;charset=utf-8;'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `坤远展览测算报告_${startDate}_${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: 'Excel 导出成功',
        description: '报告已成功导出为 CSV 文件'
      });
    } catch (error) {
      toast({
        title: '导出失败',
        description: error.message || '导出过程中发生错误',
        variant: 'destructive'
      });
    }
  };

  // 生成报告HTML内容（用于PDF和图片导出）
  const generateReportHTML = chartImageBase64 => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>坤远展览票房精准测算报告</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Microsoft YaHei', 'SimHei', sans-serif;
            color: #333;
            line-height: 1.6;
            background: #fff;
          }
          .container {
            display: flex;
            min-height: 100vh;
          }
          .sidebar {
            width: 320px;
            background: #fff;
            padding: 24px;
            border-right: 1px solid #e2e8f0;
            flex-shrink: 0;
          }
          .main-content {
            flex: 1;
            padding: 24px;
            background: #f8fafc;
          }
          .header { 
            text-align: center; 
            margin-bottom: 24px;
            border-bottom: 3px solid #1E40AF;
            padding-bottom: 16px;
          }
          .header h1 { 
            font-size: 24px;
            color: #1E40AF;
            margin-bottom: 8px;
          }
          .header p { 
            font-size: 12px;
            color: #666;
          }
          .sidebar-section {
            margin-bottom: 20px;
          }
          .sidebar-title {
            font-size: 14px;
            font-weight: 600;
            color: #475569;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
          }
          .sidebar-title-icon {
            width: 16px;
            height: 16px;
            margin-right: 8px;
          }
          .sidebar-item {
            margin-bottom: 8px;
          }
          .sidebar-label {
            display: block;
            font-size: 11px;
            font-weight: 500;
            color: #64748B;
            margin-bottom: 4px;
          }
          .sidebar-value {
            font-size: 12px;
            padding: 6px 10px;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            background: #fff;
            width: 100%;
          }
          .kpi-grid { 
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 24px;
          }
          .kpi-card { 
            background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .kpi-card.green { background: linear-gradient(135deg, #059669 0%, #10B981 100%); }
          .kpi-card.amber { background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%); }
          .kpi-card.purple { background: linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%); }
          .kpi-label { font-size: 12px; opacity: 0.9; margin-bottom: 4px; }
          .kpi-value { font-size: 24px; font-weight: bold; }
          .charts-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
            margin-bottom: 24px;
          }
          .chart-card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .chart-title {
            font-size: 16px;
            font-weight: bold;
            color: #1E293B;
            margin-bottom: 16px;
          }
          .chart-image {
            width: 100%;
            height: auto;
            border-radius: 8px;
          }
          .check-box {
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
            border: 2px solid;
            background: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .check-box.success {
            background-color: #ECFDF5;
            border-color: #10B981;
          }
          .check-box.error {
            background-color: #FEF2F2;
            border-color: #EF4444;
          }
          .check-title {
            font-weight: bold;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .check-box.success .check-title { color: #065F46; }
          .check-box.error .check-title { color: #991B1B; }
          .check-desc {
            font-size: 12px;
          }
          .check-box.success .check-desc { color: #047857; }
          .check-box.error .check-desc { color: #B91C1C; }
          .footer { 
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 12px;
            color: #64748B;
          }
          @media print {
            .container { flex-direction: column; }
            .sidebar { width: 100%; border-right: none; border-bottom: 1px solid #e2e8f0; }
            .kpi-grid { grid-template-columns: repeat(2, 1fr); }
            .charts-grid { grid-template-columns: 1fr; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- 左侧参数栏 -->
          <div class="sidebar">
            <div class="header">
              <h1>坤远展览票房精准测算报告</h1>
              <p>2026年版 | 展期：${startDate} 至 ${endDate}</p>
            </div>
            
            <div class="sidebar-section">
              <div class="sidebar-title">
                <span class="sidebar-title-icon">📅</span>
                展期设置
              </div>
              <div class="sidebar-item">
                <label class="sidebar-label">开始日期</label>
                <div class="sidebar-value">${startDate}</div>
              </div>
              <div class="sidebar-item">
                <label class="sidebar-label">结束日期</label>
                <div class="sidebar-value">${endDate}</div>
              </div>
            </div>
            
            <div class="sidebar-section">
              <div class="sidebar-title">
                <span class="sidebar-title-icon">👥</span>
                客流模型（人次/天）
              </div>
              <div class="sidebar-item">
                <label class="sidebar-label">★ 节日客流</label>
                <div class="sidebar-value">${formatNumber(holidayVisitors)}</div>
              </div>
              <div class="sidebar-item">
                <label class="sidebar-label">📚 寒暑假客流</label>
                <div class="sidebar-value">${formatNumber(vacationVisitors)}</div>
              </div>
              <div class="sidebar-item">
                <label class="sidebar-label">📅 平日客流</label>
                <div class="sidebar-value">${formatNumber(normalVisitors)}</div>
              </div>
            </div>
            
            <div class="sidebar-section">
              <div class="sidebar-title">
                <span class="sidebar-title-icon">💰</span>
                票价设置
              </div>
              <div class="sidebar-item">
                <label class="sidebar-label">平均票价（元）</label>
                <div class="sidebar-value">¥${avgTicketPrice}</div>
              </div>
            </div>
            
            ${earlyBirdEnabled ? `
            <div class="sidebar-section">
              <div class="sidebar-title">
                <span class="sidebar-title-icon">⭐</span>
                早鸟票设置
              </div>
              <div class="sidebar-item">
                <label class="sidebar-label">早鸟票单价（元）</label>
                <div class="sidebar-value">¥${earlyBirdPrice}</div>
              </div>
              <div class="sidebar-item">
                <label class="sidebar-label">销售开始日期</label>
                <div class="sidebar-value">${earlyBirdStartDate}</div>
              </div>
              <div class="sidebar-item">
                <label class="sidebar-label">销售结束日期</label>
                <div class="sidebar-value">${earlyBirdEndDate}</div>
              </div>
              <div class="sidebar-item">
                <label class="sidebar-label">日均销售量（张/天）</label>
                <div class="sidebar-value">${formatNumber(earlyBirdDailySales)}</div>
              </div>
            </div>
            ` : ''}
            
            <div class="sidebar-section">
              <div class="sidebar-title">
                <span class="sidebar-title-icon">🎓</span>
                寒暑假范围
              </div>
              <div class="sidebar-item">
                <label class="sidebar-label">寒假</label>
                <div class="sidebar-value">${winterVacationStart} 至 ${winterVacationEnd}</div>
              </div>
              <div class="sidebar-item">
                <label class="sidebar-label">暑假</label>
                <div class="sidebar-value">${summerVacationStart} 至 ${summerVacationEnd}</div>
              </div>
            </div>
          </div>
          
          <!-- 右侧内容区 -->
          <div class="main-content">
            <!-- KPI卡片 -->
            <div class="kpi-grid">
              <div class="kpi-card">
                <div class="kpi-label">总票房</div>
                <div class="kpi-value">¥${formatNumber(kpiData.totalRevenue)}</div>
                ${kpiData.earlyBirdRevenue > 0 ? `<div style="font-size: 10px; opacity: 0.8; margin-top: 4px;">含早鸟票 ¥${formatNumber(kpiData.earlyBirdRevenue)}</div>` : ''}
              </div>
              <div class="kpi-card green">
                <div class="kpi-label">总人次</div>
                <div class="kpi-value">${formatNumber(kpiData.totalVisitors)}</div>
                ${kpiData.earlyBirdVisitors > 0 ? `<div style="font-size: 10px; opacity: 0.8; margin-top: 4px;">含早鸟票 ${formatNumber(kpiData.earlyBirdVisitors)}人</div>` : ''}
              </div>
              <div class="kpi-card amber">
                <div class="kpi-label">运营天数</div>
                <div class="kpi-value">${formatNumber(kpiData.operatingDays)}</div>
              </div>
              <div class="kpi-card purple">
                <div class="kpi-label">日均票房</div>
                <div class="kpi-value">¥${kpiData.operatingDays > 0 ? formatNumber(kpiData.totalRevenue / kpiData.operatingDays) : 0}</div>
              </div>
            </div>
            
            <!-- 逻辑自检 -->
            <div class="check-box ${checkResult.isMatch ? 'success' : 'error'}">
              <div class="check-title">${checkResult.isMatch ? '✓ 计算正确' : '✗ 计算异常'}</div>
              <div class="check-desc">
                ${checkResult.isMatch ? `总天数 ${checkResult.calculatedTotal} = 节日(${checkResult.breakdown.holiday}) + 寒暑假(${checkResult.breakdown.vacation}) + 平日(${checkResult.breakdown.normal}) + 闭馆(${checkResult.breakdown.closed})` : `总天数 ${checkResult.calculatedTotal} ≠ 分类天数之和 ${checkResult.totalDays}`}
              </div>
            </div>
            
            <!-- 图表 -->
            <div class="charts-grid">
              <div class="chart-card">
                <div class="chart-title">每月票房趋势</div>
                <img src="${chartImageBase64}" alt="每月票房趋势" class="chart-image" />
              </div>
              <div class="chart-card">
                <div class="chart-title">各时段票房贡献占比</div>
                <img src="${chartImageBase64}" alt="各时段票房贡献占比" class="chart-image" />
              </div>
            </div>
            
            <!-- 分类统计 -->
            <div class="chart-card">
              <div class="chart-title">分类统计</div>
              <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
                <thead>
                  <tr style="background-color: #1E40AF; color: white;">
                    <th style="padding: 10px; text-align: left; font-size: 12px;">类型</th>
                    <th style="padding: 10px; text-align: left; font-size: 12px;">天数</th>
                    <th style="padding: 10px; text-align: left; font-size: 12px;">占比</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="background-color: #f9f9f9;">
                    <td style="padding: 10px; font-size: 12px; border: 1px solid #e2e8f0;">节日</td>
                    <td style="padding: 10px; font-size: 12px; border: 1px solid #e2e8f0;">${formatNumber(kpiData.holidayDays)}</td>
                    <td style="padding: 10px; font-size: 12px; border: 1px solid #e2e8f0;">${(kpiData.holidayDays / dailyData.length * 100).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; font-size: 12px; border: 1px solid #e2e8f0;">寒暑假</td>
                    <td style="padding: 10px; font-size: 12px; border: 1px solid #e2e8f0;">${formatNumber(kpiData.vacationDays)}</td>
                    <td style="padding: 10px; font-size: 12px; border: 1px solid #e2e8f0;">${(kpiData.vacationDays / dailyData.length * 100).toFixed(1)}%</td>
                  </tr>
                  <tr style="background-color: #f9f9f9;">
                    <td style="padding: 10px; font-size: 12px; border: 1px solid #e2e8f0;">平日</td>
                    <td style="padding: 10px; font-size: 12px; border: 1px solid #e2e8f0;">${formatNumber(kpiData.normalDays)}</td>
                    <td style="padding: 10px; font-size: 12px; border: 1px solid #e2e8f0;">${(kpiData.normalDays / dailyData.length * 100).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; font-size: 12px; border: 1px solid #e2e8f0;">闭馆</td>
                    <td style="padding: 10px; font-size: 12px; border: 1px solid #e2e8f0;">${formatNumber(kpiData.closedDays)}</td>
                    <td style="padding: 10px; font-size: 12px; border: 1px solid #e2e8f0;">${(kpiData.closedDays / dailyData.length * 100).toFixed(1)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="footer">
              <p>报告生成时间：${new Date().toLocaleString('zh-CN')}</p>
              <p>坤远展览票房精准测算沙盘 (2026年版)</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // 绘制完整的报告图片
  const drawFullReport = canvas => {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // 清空画布并绘制背景
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // 布局参数
    const sidebarWidth = 320;
    const sidebarX = 0;
    const mainX = sidebarWidth;
    const mainWidth = width - sidebarWidth;
    const padding = 24;
    let currentY = padding;

    // 绘制左侧参数栏背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sidebarX, 0, sidebarWidth, height);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sidebarWidth, 0);
    ctx.lineTo(sidebarWidth, height);
    ctx.stroke();

    // 绘制标题
    ctx.fillStyle = '#1E40AF';
    ctx.font = 'bold 24px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('坤远展览票房精准测算报告', sidebarX + sidebarWidth / 2, currentY + 24);
    ctx.fillStyle = '#666666';
    ctx.font = '12px Microsoft YaHei';
    ctx.fillText(`2026年版 | 展期：${startDate} 至 ${endDate}`, sidebarX + sidebarWidth / 2, currentY + 48);
    currentY += 80;

    // 绘制分隔线
    ctx.strokeStyle = '#1E40AF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sidebarX + padding, currentY);
    ctx.lineTo(sidebarX + sidebarWidth - padding, currentY);
    ctx.stroke();
    currentY += 30;

    // 绘制参数配置
    const drawSidebarSection = (title, icon, items) => {
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 14px Microsoft YaHei';
      ctx.textAlign = 'left';
      ctx.fillText(`${icon} ${title}`, sidebarX + padding, currentY);
      currentY += 24;
      items.forEach(item => {
        ctx.fillStyle = '#64748B';
        ctx.font = '11px Microsoft YaHei';
        ctx.fillText(item.label, sidebarX + padding, currentY);
        currentY += 18;

        // 绘制输入框
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.fillRect(sidebarX + padding, currentY, sidebarWidth - padding * 2, 32);
        ctx.strokeRect(sidebarX + padding, currentY, sidebarWidth - padding * 2, 32);
        ctx.fillStyle = '#333333';
        ctx.font = '12px Microsoft YaHei';
        ctx.fillText(item.value, sidebarX + padding + 10, currentY + 20);
        currentY += 44;
      });
      currentY += 10;
    };

    // 展期设置
    drawSidebarSection('展期设置', '📅', [{
      label: '开始日期',
      value: startDate
    }, {
      label: '结束日期',
      value: endDate
    }]);

    // 客流模型
    drawSidebarSection('客流模型（人次/天）', '👥', [{
      label: '★ 节日客流',
      value: formatNumber(holidayVisitors)
    }, {
      label: '📚 寒暑假客流',
      value: formatNumber(vacationVisitors)
    }, {
      label: '📅 平日客流',
      value: formatNumber(normalVisitors)
    }]);

    // 票价设置
    drawSidebarSection('票价设置', '💰', [{
      label: '平均票价（元）',
      value: `¥${avgTicketPrice}`
    }]);

    // 早鸟票设置
    if (earlyBirdEnabled) {
      drawSidebarSection('早鸟票设置', '⭐', [{
        label: '早鸟票单价（元）',
        value: `¥${earlyBirdPrice}`
      }, {
        label: '销售开始日期',
        value: earlyBirdStartDate
      }, {
        label: '销售结束日期',
        value: earlyBirdEndDate
      }, {
        label: '日均销售量（张/天）',
        value: formatNumber(earlyBirdDailySales)
      }]);
    }

    // 寒暑假范围
    drawSidebarSection('寒暑假范围', '🎓', [{
      label: '寒假',
      value: `${winterVacationStart} 至 ${winterVacationEnd}`
    }, {
      label: '暑假',
      value: `${summerVacationStart} 至 ${summerVacationEnd}`
    }]);

    // 右侧内容区
    currentY = padding;

    // 绘制KPI卡片
    const kpiCardWidth = (mainWidth - padding * 5) / 4;
    const kpiCardHeight = 100;
    const kpiDataList = [{
      label: '总票房',
      value: `¥${formatNumber(kpiData.totalRevenue)}`,
      color: ['#1E40AF', '#3B82F6'],
      subtext: kpiData.earlyBirdRevenue > 0 ? `含早鸟票 ¥${formatNumber(kpiData.earlyBirdRevenue)}` : ''
    }, {
      label: '总人次',
      value: formatNumber(kpiData.totalVisitors),
      color: ['#059669', '#10B981'],
      subtext: kpiData.earlyBirdVisitors > 0 ? `含早鸟票 ${formatNumber(kpiData.earlyBirdVisitors)}人` : ''
    }, {
      label: '运营天数',
      value: formatNumber(kpiData.operatingDays),
      color: ['#F59E0B', '#FBBF24'],
      subtext: ''
    }, {
      label: '日均票房',
      value: `¥${kpiData.operatingDays > 0 ? formatNumber(kpiData.totalRevenue / kpiData.operatingDays) : 0}`,
      color: ['#7C3AED', '#A78BFA'],
      subtext: ''
    }];
    kpiDataList.forEach((kpi, index) => {
      const cardX = mainX + padding + index * (kpiCardWidth + padding);

      // 绘制渐变背景
      const gradient = ctx.createLinearGradient(cardX, currentY, cardX + kpiCardWidth, currentY + kpiCardHeight);
      gradient.addColorStop(0, kpi.color[0]);
      gradient.addColorStop(1, kpi.color[1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(cardX, currentY, kpiCardWidth, kpiCardHeight);

      // 绘制阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(cardX + 4, currentY + 4, kpiCardWidth, kpiCardHeight);
      ctx.fillStyle = gradient;
      ctx.fillRect(cardX, currentY, kpiCardWidth, kpiCardHeight);

      // 绘制文字
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '12px Microsoft YaHei';
      ctx.textAlign = 'center';
      ctx.fillText(kpi.label, cardX + kpiCardWidth / 2, currentY + 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Microsoft YaHei';
      ctx.fillText(kpi.value, cardX + kpiCardWidth / 2, currentY + 60);
      if (kpi.subtext) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '10px Microsoft YaHei';
        ctx.fillText(kpi.subtext, cardX + kpiCardWidth / 2, currentY + 85);
      }
    });
    currentY += kpiCardHeight + padding;

    // 绘制逻辑自检
    const checkBoxHeight = 60;
    ctx.fillStyle = checkResult.isMatch ? '#ECFDF5' : '#FEF2F2';
    ctx.strokeStyle = checkResult.isMatch ? '#10B981' : '#EF4444';
    ctx.lineWidth = 2;
    ctx.fillRect(mainX + padding, currentY, mainWidth - padding * 2, checkBoxHeight);
    ctx.strokeRect(mainX + padding, currentY, mainWidth - padding * 2, checkBoxHeight);
    ctx.fillStyle = checkResult.isMatch ? '#065F46' : '#991B1B';
    ctx.font = 'bold 14px Microsoft YaHei';
    ctx.textAlign = 'left';
    ctx.fillText(checkResult.isMatch ? '✓ 计算正确' : '✗ 计算异常', mainX + padding + 16, currentY + 24);
    ctx.fillStyle = checkResult.isMatch ? '#047857' : '#B91C1C';
    ctx.font = '12px Microsoft YaHei';
    const checkText = checkResult.isMatch ? `总天数 ${checkResult.calculatedTotal} = 节日(${checkResult.breakdown.holiday}) + 寒暑假(${checkResult.breakdown.vacation}) + 平日(${checkResult.breakdown.normal}) + 闭馆(${checkResult.breakdown.closed})` : `总天数 ${checkResult.calculatedTotal} ≠ 分类天数之和 ${checkResult.totalDays}`;
    ctx.fillText(checkText, mainX + padding + 16, currentY + 44);
    currentY += checkBoxHeight + padding;

    // 绘制图表
    const chartWidth = (mainWidth - padding * 3) / 2;
    const chartHeight = 300;

    // 折线图
    const drawLineChart = (x, y, w, h) => {
      // 背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);

      // 标题
      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 16px Microsoft YaHei';
      ctx.textAlign = 'left';
      ctx.fillText('每月票房趋势', x + 16, y + 32);

      // 计算每月数据
      const monthlyData = [];
      for (let i = 0; i < 12; i++) {
        const monthData = dailyData.filter(d => {
          const month = new Date(d.date).getMonth();
          return month === i;
        });
        const monthRevenue = monthData.reduce((sum, d) => sum + d.revenue, 0);
        monthlyData.push({
          month: i + 1,
          revenue: monthRevenue
        });
      }
      const maxRevenue = Math.max(...monthlyData.map(d => d.revenue)) || 1;
      const chartPadding = 50;
      const chartAreaWidth = w - chartPadding * 2;
      const chartAreaHeight = h - chartPadding * 2;

      // 绘制坐标轴
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + chartPadding, y + chartPadding);
      ctx.lineTo(x + chartPadding, y + h - chartPadding);
      ctx.lineTo(x + w - chartPadding, y + h - chartPadding);
      ctx.stroke();

      // 绘制折线
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      monthlyData.forEach((d, i) => {
        const px = x + chartPadding + i / 11 * chartAreaWidth;
        const py = y + h - chartPadding - d.revenue / maxRevenue * chartAreaHeight;
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      });
      ctx.stroke();

      // 绘制数据点
      ctx.fillStyle = '#3B82F6';
      monthlyData.forEach((d, i) => {
        const px = x + chartPadding + i / 11 * chartAreaWidth;
        const py = y + h - chartPadding - d.revenue / maxRevenue * chartAreaHeight;
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();

        // 绘制月份标签
        ctx.fillStyle = '#64748B';
        ctx.font = '10px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText(`${d.month}月`, px, y + h - chartPadding + 16);
      });
    };

    // 饼图
    const drawPieChart = (x, y, w, h) => {
      // 背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);

      // 标题
      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 16px Microsoft YaHei';
      ctx.textAlign = 'left';
      ctx.fillText('各时段票房贡献占比', x + 16, y + 32);
      const pieX = x + w / 2;
      const pieY = y + h / 2 + 10;
      const pieRadius = 80;
      const pieData = [{
        label: '节日',
        value: kpiData.holidayDays,
        color: '#EF4444'
      }, {
        label: '寒暑假',
        value: kpiData.vacationDays,
        color: '#F59E0B'
      }, {
        label: '平日',
        value: kpiData.normalDays,
        color: '#10B981'
      }];
      const total = pieData.reduce((sum, d) => sum + d.value, 0);
      let startAngle = -Math.PI / 2;
      pieData.forEach(d => {
        const sliceAngle = d.value / total * Math.PI * 2;
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.moveTo(pieX, pieY);
        ctx.arc(pieX, pieY, pieRadius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();
        startAngle += sliceAngle;
      });

      // 绘制图例
      ctx.font = '12px Microsoft YaHei';
      pieData.forEach((d, i) => {
        const legendY = pieY + pieRadius + 30 + i * 20;
        ctx.fillStyle = d.color;
        ctx.fillRect(pieX - 60, legendY - 10, 12, 12);
        ctx.fillStyle = '#374151';
        ctx.textAlign = 'left';
        ctx.fillText(`${d.label} (${(d.value / total * 100).toFixed(0)}%)`, pieX - 40, legendY);
      });
    };
    drawLineChart(mainX + padding, currentY, chartWidth, chartHeight);
    drawPieChart(mainX + padding * 2 + chartWidth, currentY, chartWidth, chartHeight);
    currentY += chartHeight + padding;

    // 绘制分类统计表格
    const tableHeight = 200;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(mainX + padding, currentY, mainWidth - padding * 2, tableHeight);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(mainX + padding, currentY, mainWidth - padding * 2, tableHeight);

    // 标题
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 16px Microsoft YaHei';
    ctx.textAlign = 'left';
    ctx.fillText('分类统计', mainX + padding + 16, currentY + 32);

    // 表头
    const tableY = currentY + 50;
    const rowHeight = 30;
    const colWidths = [100, 100, 100];
    const tableX = mainX + padding + 16;
    ctx.fillStyle = '#1E40AF';
    ctx.fillRect(tableX, tableY, mainWidth - padding * 2 - 32, rowHeight);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Microsoft YaHei';
    ctx.fillText('类型', tableX + 20, tableY + 20);
    ctx.fillText('天数', tableX + colWidths[0] + 20, tableY + 20);
    ctx.fillText('占比', tableX + colWidths[0] + colWidths[1] + 20, tableY + 20);

    // 表格数据
    const tableData = [{
      type: '节日',
      days: kpiData.holidayDays
    }, {
      type: '寒暑假',
      days: kpiData.vacationDays
    }, {
      type: '平日',
      days: kpiData.normalDays
    }, {
      type: '闭馆',
      days: kpiData.closedDays
    }];
    tableData.forEach((row, index) => {
      const rowY = tableY + rowHeight * (index + 1);

      // 交替背景色
      if (index % 2 === 0) {
        ctx.fillStyle = '#f9f9f9';
        ctx.fillRect(tableX, rowY, mainWidth - padding * 2 - 32, rowHeight);
      }

      // 边框
      ctx.strokeStyle = '#e2e8f0';
      ctx.strokeRect(tableX, rowY, mainWidth - padding * 2 - 32, rowHeight);

      // 数据
      ctx.fillStyle = '#333333';
      ctx.font = '12px Microsoft YaHei';
      ctx.fillText(row.type, tableX + 20, rowY + 20);
      ctx.fillText(formatNumber(row.days), tableX + colWidths[0] + 20, rowY + 20);
      ctx.fillText(`${(row.days / dailyData.length * 100).toFixed(1)}%`, tableX + colWidths[0] + colWidths[1] + 20, rowY + 20);
    });
    currentY += tableHeight + padding;

    // 绘制页脚
    ctx.fillStyle = '#64748B';
    ctx.font = '12px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText(`报告生成时间：${new Date().toLocaleString('zh-CN')}`, mainX + mainWidth / 2, currentY + 20);
    ctx.fillText('坤远展览票房精准测算沙盘 (2026年版)', mainX + mainWidth / 2, currentY + 40);
  };

  // 生成完整报告图片
  const generateReportImage = () => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        // 设置较大的尺寸以保证清晰度
        canvas.width = 1400;
        canvas.height = 1200;
        drawFullReport(canvas);
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    });
  };

  // 导出图片
  const exportImage = async () => {
    try {
      // 生成完整报告图片
      const reportImageBase64 = await generateReportImage();

      // 将Base64转换为Blob
      const base64Data = reportImageBase64.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      const blob = new Blob(byteArrays, {
        type: 'image/png'
      });
      const url = URL.createObjectURL(blob);

      // 创建下载链接
      const link = document.createElement('a');
      link.href = url;
      link.download = `坤远展览票房精准测算报告_${startDate}_${endDate}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: '图片导出成功',
        description: '报告已成功导出为高清PNG图片'
      });
    } catch (error) {
      toast({
        title: '导出失败',
        description: error.message || '导出过程中发生错误',
        variant: 'destructive'
      });
    }
  };
  return <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4">导出报告</h3>
      <div className="grid grid-cols-2 gap-4">
        {/* Excel 导出 */}
        <button onClick={exportExcel} className="flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg">
          <FileSpreadsheet className="w-6 h-6" />
          <div className="text-left">
            <p className="font-bold">导出 Excel</p>
            <p className="text-xs opacity-80">包含汇总报告和每日明细</p>
          </div>
          <Download className="w-5 h-5 ml-auto" />
        </button>
        
        {/* 图片导出 */}
        <button onClick={exportImage} className="flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg">
          <Image className="w-6 h-6" />
          <div className="text-left">
            <p className="font-bold">导出图片</p>
            <p className="text-xs opacity-80">完整报告高清图片</p>
          </div>
          <Download className="w-5 h-5 ml-auto" />
        </button>
      </div>
      
      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          <strong>提示：</strong>
          图片导出将直接下载高清PNG文件，包含完整的报告内容：左侧参数栏、右侧KPI数据、图表分析、分类统计等（不含每日明细表）。图片尺寸为1400x1200像素，清晰度高，适合打印和分享。
        </p>
      </div>
    </div>;
}