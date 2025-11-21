import React, { useState, useEffect } from 'react';
import { Calendar, Download, Copy, FileText } from 'lucide-react';
import { Project, LogEntry } from '../types';
import { StatusBadge } from '../components/StatusBadge';

interface WeeklyReportProps {
  projects: Project[];
}

const WeeklyReport: React.FC<WeeklyReportProps> = ({ projects }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Initialize with current week (Monday to Sunday)
  useEffect(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(today.setDate(diff));
    const sunday = new Date(today.setDate(monday.getDate() + 6));

    setStartDate(monday.toISOString().split('T')[0]);
    setEndDate(sunday.toISOString().split('T')[0]);
  }, []);

  // Logic to filter projects and logs
  const reportData = projects.map(project => {
    const logsInRange = project.history.filter(log => 
      log.date >= startDate && log.date <= endDate
    );

    if (logsInRange.length === 0) return null;

    // Aggregate content
    const aggregatedContent = logsInRange
        .sort((a, b) => b.date.localeCompare(a.date))
        .map(log => `[${log.date.slice(5)}] ${log.content}`) // simplified date MM-DD
        .join('; ');

    return {
      ...project,
      weeklyContent: aggregatedContent
    };
  }).filter(item => item !== null);

  const handleCopyTable = () => {
    const header = "项目名称\t项目阶段\t本周工作内容\t负责人\n";
    const rows = reportData.map(p => 
        `${p!.name}\t${p!.currentStage}\t${p!.weeklyContent}\t${p!.manager}`
    ).join('\n');
    
    navigator.clipboard.writeText(header + rows);
    alert('报表内容已复制到剪贴板 (Excel格式)');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">周报统计生成器</h2>
        <p className="text-slate-500">选择时间区间，自动汇总各项目的支持记录。</p>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-end gap-6">
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">开始日期</label>
            <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                />
            </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">结束日期</label>
            <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                />
            </div>
        </div>
        <div className="flex-1 flex justify-end">
             <button 
                onClick={handleCopyTable}
                disabled={reportData.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <Copy size={18} />
                复制报表内容 (Excel)
             </button>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase w-1/5">项目名称</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase w-1/6">阶段 / 状态</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">本周工作内容汇总 ({startDate} 至 {endDate})</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase w-1/6">负责人</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {reportData.length > 0 ? (
                    reportData.map(project => (
                        <tr key={project!.id} className="hover:bg-slate-50 transition-colors align-top">
                            <td className="px-6 py-4">
                                <div className="font-semibold text-slate-800">{project!.name}</div>
                                <div className="text-xs text-slate-400 mt-1">{project!.code}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-2 items-start">
                                    <StatusBadge status={project!.status} />
                                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                                        {project!.currentStage}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                                {project!.weeklyContent}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                                {project!.manager}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                            <div className="flex flex-col items-center gap-2">
                                <FileText size={32} className="text-slate-300" />
                                <p>该时间段内没有产生新的工作记录。</p>
                                <p className="text-xs">请确保在"项目详情"页更新了工作日志。</p>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeeklyReport;