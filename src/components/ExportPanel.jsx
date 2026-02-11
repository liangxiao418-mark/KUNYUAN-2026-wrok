// @ts-ignore;
import React, { useRef } from 'react';
// @ts-ignore;
import { FileSpreadsheet, FileText, Image, Download } from 'lucide-react';
// @ts-ignore;
import { useToast } from '@/components/ui';

export default function ExportPanel({
  dailyData,
  kpiData,
  startDate,
  endDate,
  checkResult
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
      workbookData.sheets['汇总报告'] = [['坤远展览票房精准测算报告'], [''], ['展期', `${startDate} 至 ${endDate}`], [''], ['核心指标', '数值'], ['总票房', `¥${formatNumber(kpiData.totalRevenue)}`], ['总人次', formatNumber(kpiData.totalVisitors)], ['运营天数', formatNumber(kpiData.operatingDays)], ['日均票房', `¥${kpiData.operatingDays > 0 ? formatNumber(kpiData.totalRevenue / kpiData.operatingDays) : 0}`], [''], ['分类统计', '天数', '占比'], ['节日天数', formatNumber(kpiData.holidayDays), `${(kpiData.holidayDays / dailyData.length * 100).toFixed(1)}%`], ['寒暑假天数', formatNumber(kpiData.vacationDays), `${(kpiData.vacationDays / dailyData.length * 100).toFixed(1)}%`], ['平日天数', formatNumber(kpiData.normalDays), `${(kpiData.normalDays / dailyData.length * 100).toFixed(1)}%`], ['闭馆天数', formatNumber(kpiData.closedDays), `${(kpiData.closedDays / dailyData.length * 100).toFixed(1)}%`]];

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

  // 导出图片（概览）
  const exportImage = () => {
    try {
      // 创建 HTML 内容（只包含KPI卡片、逻辑自检、图表）
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>坤远展览票房测算概览</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Microsoft YaHei', 'SimHei', sans-serif;
              padding: 30px;
              color: #333;
              line-height: 1.6;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              border-radius: 16px;
              padding: 30px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }
            .header { 
              text-align: center; 
              margin-bottom: 25px;
              border-bottom: 3px solid #1E40AF;
              padding-bottom: 15px;
            }
            .header h1 { 
              font-size: 24px;
              color: #1E40AF;
              margin-bottom: 8px;
            }
            .header p { 
              font-size: 13px;
              color: #666;
            }
            .section { 
              margin-bottom: 25px;
            }
            .section-title { 
              font-size: 16px;
              color: #1E40AF;
              border-left: 4px solid #1E40AF;
              padding-left: 10px;
              margin-bottom: 12px;
              font-weight: bold;
            }
            .kpi-grid { 
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              margin-bottom: 15px;
            }
            .kpi-card { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
            }
            .kpi-card.blue { background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%); }
            .kpi-card.green { background: linear-gradient(135deg, #059669 0%, #10B981 100%); }
            .kpi-card.amber { background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%); }
            .kpi-card.purple { background: linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%); }
            .kpi-label { font-size: 11px; opacity: 0.9; margin-bottom: 4px; }
            .kpi-value { font-size: 20px; font-weight: bold; }
            table { 
              width: 100%;
              border-collapse: collapse;
              margin-top: 8px;
            }
            th, td { 
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
              font-size: 11px;
            }
            th { 
              background-color: #1E40AF;
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .summary-table { margin-bottom: 15px; }
            .logic-check {
              padding: 12px;
              border-radius: 8px;
              margin-bottom: 15px;
              border: 2px solid;
            }
            .logic-check.success {
              background: #ecfdf5;
              border-color: #10b981;
            }
            .logic-check.error {
              background: #fef2f2;
              border-color: #ef4444;
            }
            .logic-check-title {
              font-weight: bold;
              margin-bottom: 5px;
            }
            .logic-check.success .logic-check-title { color: #047857; }
            .logic-check.error .logic-check-title { color: #dc2626; }
            .logic-check-desc {
              font-size: 12px;
            }
            .logic-check.success .logic-check-desc { color: #059669; }
            .logic-check.error .logic-check-desc { color: #dc2626; }
            .charts-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
            }
            .chart-box {
              background: #f8fafc;
              border-radius: 8px;
              padding: 15px;
              border: 1px solid #e2e8f0;
            }
            .chart-title {
              font-size: 14px;
              font-weight: bold;
              color: #1e293b;
              margin-bottom: 10px;
            }
            .chart-placeholder {
              height: 200px;
              background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #4338ca;
              font-size: 14px;
            }
            .footer { 
              margin-top: 25px;
              padding-top: 15px;
              border-top: 1px solid #ddd;
              text-align: center;
              font-size: 11px;
              color: #666;
            }
            @media print {
              body { padding: 10px; }
              .kpi-grid { grid-template-columns: repeat(2, 1fr); }
              .charts-grid { grid-template-columns: 1fr; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>坤远展览票房测算概览</h1>
              <p>2026年版 | 展期：${startDate} 至 ${endDate}</p>
            </div>
            
            <div class="section">
              <div class="section-title">核心指标</div>
              <div class="kpi-grid">
                <div class="kpi-card blue">
                  <div class="kpi-label">总票房</div>
                  <div class="kpi-value">¥${formatNumber(kpiData.totalRevenue)}</div>
                </div>
                <div class="kpi-card green">
                  <div class="kpi-label">总人次</div>
                  <div class="kpi-value">${formatNumber(kpiData.totalVisitors)}</div>
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
            </div>
            
            <div class="section">
              <div class="section-title">逻辑自检</div>
              <div class="logic-check ${checkResult.isMatch ? 'success' : 'error'}">
                <div class="logic-check-title">逻辑自检结果</div>
                <div class="logic-check-desc">
                  ${checkResult.isMatch ? `✓ 计算正确：总天数 ${checkResult.calculatedTotal} = 节日(${checkResult.breakdown.holiday}) + 寒暑假(${checkResult.breakdown.vacation}) + 平日(${checkResult.breakdown.normal}) + 闭馆(${checkResult.breakdown.closed})` : `✗ 计算异常：总天数 ${checkResult.calculatedTotal} ≠ 分类天数之和 ${checkResult.totalDays}`}
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">分类统计</div>
              <table class="summary-table">
                <thead>
                  <tr>
                    <th>类型</th>
                    <th>天数</th>
                    <th>占比</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>节日</td>
                    <td>${formatNumber(kpiData.holidayDays)}</td>
                    <td>${(kpiData.holidayDays / dailyData.length * 100).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td>寒暑假</td>
                    <td>${formatNumber(kpiData.vacationDays)}</td>
                    <td>${(kpiData.vacationDays / dailyData.length * 100).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td>平日</td>
                    <td>${formatNumber(kpiData.normalDays)}</td>
                    <td>${(kpiData.normalDays / dailyData.length * 100).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td>闭馆</td>
                    <td>${formatNumber(kpiData.closedDays)}</td>
                    <td>${(kpiData.closedDays / dailyData.length * 100).toFixed(1)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="section">
              <div class="section-title">数据图表</div>
              <div class="charts-grid">
                <div class="chart-box">
                  <div class="chart-title">每月票房趋势</div>
                  <div class="chart-placeholder">📊 折线图区域</div>
                </div>
                <div class="chart-box">
                  <div class="chart-title">各时段票房贡献占比</div>
                  <div class="chart-placeholder">📈 饼图区域</div>
                </div>
              </div>
            </div>
            
            <div class="footer">
              <p>报告生成时间：${new Date().toLocaleString('zh-CN')}</p>
              <p>坤远展览票房精准测算沙盘 (2026年版)</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // 创建打印窗口
      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // 等待页面加载完成后触发打印
      setTimeout(() => {
        printWindow.print();
      }, 500);
      toast({
        title: '图片导出准备就绪',
        description: '请在打印对话框中选择"另存为图片"或截图保存概览'
      });
    } catch (error) {
      toast({
        title: '导出失败',
        description: error.message || '导出过程中发生错误',
        variant: 'destructive'
      });
    }
  };

  // 导出 PDF
  const exportPDF = () => {
    try {
      // 创建 HTML 内容（包含所有内容）
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>坤远展览票房精准测算报告</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Microsoft YaHei', 'SimHei', sans-serif;
              padding: 40px;
              color: #333;
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px;
              border-bottom: 3px solid #1E40AF;
              padding-bottom: 20px;
            }
            .header h1 { 
              font-size: 28px;
              color: #1E40AF;
              margin-bottom: 10px;
            }
            .header p { 
              font-size: 14px;
              color: #666;
            }
            .section { 
              margin-bottom: 30px;
            }
            .section-title { 
              font-size: 18px;
              color: #1E40AF;
              border-left: 4px solid #1E40AF;
              padding-left: 10px;
              margin-bottom: 15px;
              font-weight: bold;
            }
            .kpi-grid { 
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }
            .kpi-card { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
            }
            .kpi-card.blue { background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%); }
            .kpi-card.green { background: linear-gradient(135deg, #059669 0%, #10B981 100%); }
            .kpi-card.amber { background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%); }
            .kpi-card.purple { background: linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%); }
            .kpi-label { font-size: 12px; opacity: 0.9; margin-bottom: 5px; }
            .kpi-value { font-size: 24px; font-weight: bold; }
            table { 
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td { 
              border: 1px solid #ddd;
              padding: 10px;
              text-align: left;
              font-size: 12px;
            }
            th { 
              background-color: #1E40AF;
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .summary-table { margin-bottom: 20px; }
            .detail-table { font-size: 10px; }
            .detail-table th, .detail-table td { padding: 6px; }
            .logic-check {
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
              border: 2px solid;
            }
            .logic-check.success {
              background: #ecfdf5;
              border-color: #10b981;
            }
            .logic-check.error {
              background: #fef2f2;
              border-color: #ef4444;
            }
            .logic-check-title {
              font-weight: bold;
              margin-bottom: 8px;
              font-size: 14px;
            }
            .logic-check.success .logic-check-title { color: #047857; }
            .logic-check.error .logic-check-title { color: #dc2626; }
            .logic-check-desc {
              font-size: 13px;
            }
            .logic-check.success .logic-check-desc { color: #059669; }
            .logic-check.error .logic-check-desc { color: #dc2626; }
            .charts-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin-bottom: 20px;
            }
            .chart-box {
              background: #f8fafc;
              border-radius: 8px;
              padding: 20px;
              border: 1px solid #e2e8f0;
            }
            .chart-title {
              font-size: 16px;
              font-weight: bold;
              color: #1e293b;
              margin-bottom: 15px;
            }
            .chart-placeholder {
              height: 250px;
              background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #4338ca;
              font-size: 16px;
            }
            .footer { 
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body { padding: 20px; }
              .kpi-grid { grid-template-columns: repeat(2, 1fr); }
              .charts-grid { grid-template-columns: 1fr; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>坤远展览票房精准测算报告</h1>
            <p>2026年版 | 展期：${startDate} 至 ${endDate}</p>
          </div>
          
          <div class="section">
            <div class="section-title">核心指标</div>
            <div class="kpi-grid">
              <div class="kpi-card blue">
                <div class="kpi-label">总票房</div>
                <div class="kpi-value">¥${formatNumber(kpiData.totalRevenue)}</div>
              </div>
              <div class="kpi-card green">
                <div class="kpi-label">总人次</div>
                <div class="kpi-value">${formatNumber(kpiData.totalVisitors)}</div>
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
          </div>
          
          <div class="section">
            <div class="section-title">逻辑自检</div>
            <div class="logic-check ${checkResult.isMatch ? 'success' : 'error'}">
              <div class="logic-check-title">逻辑自检结果</div>
              <div class="logic-check-desc">
                ${checkResult.isMatch ? `✓ 计算正确：总天数 ${checkResult.calculatedTotal} = 节日(${checkResult.breakdown.holiday}) + 寒暑假(${checkResult.breakdown.vacation}) + 平日(${checkResult.breakdown.normal}) + 闭馆(${checkResult.breakdown.closed})` : `✗ 计算异常：总天数 ${checkResult.calculatedTotal} ≠ 分类天数之和 ${checkResult.totalDays}`}
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">数据图表</div>
            <div class="charts-grid">
              <div class="chart-box">
                <div class="chart-title">每月票房趋势</div>
                <div class="chart-placeholder">📊 折线图区域</div>
              </div>
              <div class="chart-box">
                <div class="chart-title">各时段票房贡献占比</div>
                <div class="chart-placeholder">📈 饼图区域</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">分类统计</div>
            <table class="summary-table">
              <thead>
                <tr>
                  <th>类型</th>
                  <th>天数</th>
                  <th>占比</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>节日</td>
                  <td>${formatNumber(kpiData.holidayDays)}</td>
                  <td>${(kpiData.holidayDays / dailyData.length * 100).toFixed(1)}%</td>
                </tr>
                <tr>
                  <td>寒暑假</td>
                  <td>${formatNumber(kpiData.vacationDays)}</td>
                  <td>${(kpiData.vacationDays / dailyData.length * 100).toFixed(1)}%</td>
                </tr>
                <tr>
                  <td>平日</td>
                  <td>${formatNumber(kpiData.normalDays)}</td>
                  <td>${(kpiData.normalDays / dailyData.length * 100).toFixed(1)}%</td>
                </tr>
                <tr>
                  <td>闭馆</td>
                  <td>${formatNumber(kpiData.closedDays)}</td>
                  <td>${(kpiData.closedDays / dailyData.length * 100).toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <div class="section-title">每日明细</div>
            <table class="detail-table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>类型</th>
                  <th>客流（人次）</th>
                  <th>票房（元）</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                ${dailyData.map(item => `
                  <tr>
                    <td>${item.date}</td>
                    <td>${item.typeLabel}</td>
                    <td>${formatNumber(item.visitors)}</td>
                    <td>${formatNumber(item.revenue)}</td>
                    <td>${item.isOpen ? '开馆' : '闭馆'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p>报告生成时间：${new Date().toLocaleString('zh-CN')}</p>
            <p>坤远展览票房精准测算沙盘 (2026年版)</p>
          </div>
        </body>
        </html>
      `;

      // 创建打印窗口
      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // 等待页面加载完成后触发打印
      setTimeout(() => {
        printWindow.print();
      }, 500);
      toast({
        title: 'PDF 导出准备就绪',
        description: '请在打印对话框中选择"另存为 PDF"以保存报告'
      });
    } catch (error) {
      toast({
        title: '导出失败',
        description: error.message || '导出过程中发生错误',
        variant: 'destructive'
      });
    }
  };
  return <div className="bg-white rounded-xl shadow-lg p-4">
      <h3 className="text-base font-bold text-slate-800 mb-3">导出报告</h3>
      <div className="grid grid-cols-3 gap-2">
        {/* Excel 导出 */}
        <button onClick={exportExcel} className="flex items-center justify-center space-x-2 px-3 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-lg transition-all transform hover:scale-105 shadow">
          <FileSpreadsheet className="w-4 h-4" />
          <div className="text-left">
            <p className="font-bold text-xs">导出 Excel</p>
            <p className="text-[10px] opacity-80">汇总和明细</p>
          </div>
          <Download className="w-3 h-3 ml-auto" />
        </button>
        
        {/* 图片导出 */}
        <button onClick={exportImage} className="flex items-center justify-center space-x-2 px-3 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-lg transition-all transform hover:scale-105 shadow">
          <Image className="w-4 h-4" />
          <div className="text-left">
            <p className="font-bold text-xs">导出图片</p>
            <p className="text-[10px] opacity-80">概览不含明细</p>
          </div>
          <Download className="w-3 h-3 ml-auto" />
        </button>
        
        {/* PDF 导出 */}
        <button onClick={exportPDF} className="flex items-center justify-center space-x-2 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg transition-all transform hover:scale-105 shadow">
          <FileText className="w-4 h-4" />
          <div className="text-left">
            <p className="font-bold text-xs">导出 PDF</p>
            <p className="text-[10px] opacity-80">完整报告</p>
          </div>
          <Download className="w-3 h-3 ml-auto" />
        </button>
      </div>
      
      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-[10px] text-blue-800">
          <strong>提示：</strong>
          PDF/图片导出将打开打印对话框，请选择"另存为 PDF"或截图保存。报告已内置中文字体支持，确保中文正常显示。
        </p>
      </div>
    </div>;
}