import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Project, ProjectStatus } from '../types';
import { BUSINESS_UNITS } from '../constants';

interface DashboardProps {
  projects: Project[];
}

const Dashboard: React.FC<DashboardProps> = ({ projects }) => {
  
  // Calculate stats
  const activeCount = projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length;
  const pausedCount = projects.filter(p => p.status === ProjectStatus.PAUSED).length;
  const totalCount = projects.length;

  const unitData = BUSINESS_UNITS.map(unit => ({
    name: unit.split(' ')[0], // Short name
    count: projects.filter(p => p.businessUnit === unit).length
  }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">部门概览</h2>
        <p className="text-slate-500">欢迎回来。以下是解决方案架构部门当前的运行状态。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 font-medium uppercase">进行中项目</p>
            <p className="text-4xl font-bold text-slate-800 mt-2">{activeCount}</p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${(activeCount/totalCount)*100}%` }}></div>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 font-medium uppercase">暂停 / 间歇性支持</p>
            <p className="text-4xl font-bold text-slate-800 mt-2">{pausedCount}</p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${(pausedCount/totalCount)*100}%` }}></div>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 font-medium uppercase">管理项目总数</p>
            <p className="text-4xl font-bold text-slate-800 mt-2">{totalCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
             <h3 className="text-lg font-bold text-slate-800 mb-6">各经营单元项目分布</h3>
             <ResponsiveContainer width="100%" height="80%">
                <BarChart data={unitData}>
                    <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} />
                    <YAxis />
                    <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                        {unitData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                        ))}
                    </Bar>
                </BarChart>
             </ResponsiveContainer>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl shadow-sm border border-slate-700 text-white">
            <h3 className="text-lg font-bold mb-4">记忆唤醒助手</h3>
            <p className="text-slate-300 mb-6 text-sm leading-relaxed">
                "您有 2 个位于 '虚拟电厂 (VPP)' 单元的项目已经暂停超过 90 天。建议您查看 'VPP-PILOT-HZ' 杭州试点项目，确认 2024 财年的预算是否已经获批。"
            </p>
            <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left">
                查看停滞项目 →
            </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;