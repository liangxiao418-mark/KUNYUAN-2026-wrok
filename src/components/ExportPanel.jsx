// @ts-ignore;
import React, { useRef } from 'react';
// @ts-ignore;
import { FileSpreadsheet, FileText, Download, Image } from 'lucide-react';
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
            padding: 40px;
            color: #333;
            line-height: 1.6;
            background: #fff;
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
          .check-box {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 2px solid;
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
          .charts-container {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .chart-wrapper {
            flex: 1;
            text-align: center;
          }
          .chart-image {
            max-width: 100%;
            height: auto;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
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
            .charts-container { flex-direction: column; }
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
          <div class="check-box ${checkResult.isMatch ? 'success' : 'error'}">
            <div class="check-title">${checkResult.isMatch ? '✓ 计算正确' : '✗ 计算异常'}</div>
            <div class="check-desc">
              ${checkResult.isMatch ? `总天数 ${checkResult.calculatedTotal} = 节日(${checkResult.breakdown.holiday}) + 寒暑假(${checkResult.breakdown.vacation}) + 平日(${checkResult.breakdown.normal}) + 闭馆(${checkResult.breakdown.closed})` : `总天数 ${checkResult.calculatedTotal} ≠ 分类天数之和 ${checkResult.totalDays}`}
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">图表分析</div>
          <div class="charts-container">
            <div class="chart-wrapper">
              <img src="${chartImageBase64}" alt="每月票房趋势" class="chart-image" />
            </div>
          </div>
        </div>
        
        ${kpiData.earlyBirdRevenue > 0 ? `
        <div class="section">
          <div class="section-title">早鸟票统计</div>
          <table class="summary-table">
            <thead>
              <tr>
                <th>项目</th>
                <th>数值</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>早鸟票票房</td>
                <td>¥${formatNumber(kpiData.earlyBirdRevenue)}</td>
              </tr>
              <tr>
                <td>早鸟票人次</td>
                <td>${formatNumber(kpiData.earlyBirdVisitors)}</td>
              </tr>
              <tr>
                <td>展览票房</td>
                <td>¥${formatNumber(kpiData.totalRevenue - kpiData.earlyBirdRevenue)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        ` : ''}
        
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
        
        <div class="footer">
          <p>报告生成时间：${new Date().toLocaleString('zh-CN')}</p>
          <p>坤远展览票房精准测算沙盘 (2026年版)</p>
        </div>
      </body>
      </html>
    `;
  };

  // 生成图表图片
  const generateChartImage = () => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 300;
        drawCharts(canvas, dailyData, kpiData);
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    });
  };

  // 导出 PDF
  const exportPDF = async () => {
    try {
      // 生成图表图片
      const chartImageBase64 = await generateChartImage();

      // 生成HTML内容
      const htmlContent = generateReportHTML(chartImageBase64);

      // 创建打印窗口
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        toast({
          title: '导出失败',
          description: '请允许弹出窗口以导出PDF',
          variant: 'destructive'
        });
        return;
      }
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

  // 导出图片
  const exportImage = async () => {
    try {
      // 生成图表图片
      const chartImageBase64 = await generateChartImage();

      // 将Base64转换为Blob
      const base64Data = chartImageBase64.split(',')[1];
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
        description: '报告图表已成功导出为PNG图片'
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
      <div className="grid grid-cols-3 gap-4">
        {/* Excel 导出 */}
        <button onClick={exportExcel} className="flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg">
          <FileSpreadsheet className="w-6 h-6" />
          <div className="text-left">
            <p className="font-bold">导出 Excel</p>
            <p className="text-xs opacity-80">包含汇总报告和每日明细</p>
          </div>
          <Download className="w-5 h-5 ml-auto" />
        </button>
        
        {/* PDF 导出 */}
        <button onClick={exportPDF} className="flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg">
          <FileText className="w-6 h-6" />
          <div className="text-left">
            <p className="font-bold">导出 PDF</p>
            <p className="text-xs opacity-80">核心指标和统计</p>
          </div>
          <Download className="w-5 h-5 ml-auto" />
        </button>
        
        {/* 图片导出 */}
        <button onClick={exportImage} className="flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg">
          <Image className="w-6 h-6" />
          <div className="text-left">
            <p className="font-bold">导出图片</p>
            <p className="text-xs opacity-80">与PDF内容一致</p>
          </div>
          <Download className="w-5 h-5 ml-auto" />
        </button>
      </div>
      
      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          <strong>提示：</strong>
          PDF导出将打开打印对话框，请选择"另存为 PDF"以保存报告；图片导出将直接下载PNG格式的图表文件。两者都包含核心指标、逻辑自检、图表分析、分类统计等内容（不含每日明细表）。
        </p>
      </div>
    </div>;
}