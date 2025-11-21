
import React, { useState } from 'react';
import { Search, Filter, Plus, AlertTriangle, CheckCircle, ArrowRight, User } from 'lucide-react';
import { Project, ProjectStatus, ProjectStage, PromptTemplate } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { BUSINESS_UNITS } from '../constants';
import { checkDuplicateRisk } from '../services/geminiService';

interface DispatchPoolProps {
  projects: Project[];
  onProjectSelect: (p: Project) => void;
  onAddProject: (p: Project) => void;
  promptTemplates?: PromptTemplate[];
}

const DispatchPool: React.FC<DispatchPoolProps> = ({ projects, onProjectSelect, onAddProject, promptTemplates }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Project Form State
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectCode, setNewProjectCode] = useState('');
  const [newProjectUnit, setNewProjectUnit] = useState(BUSINESS_UNITS[0]);
  const [newProjectManager, setNewProjectManager] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckDuplicate = async () => {
    if (!newProjectName) return;
    setIsChecking(true);
    
    const templateString = promptTemplates?.find(t => t.key === 'DUPLICATE_CHECK')?.template || '';
    
    const warning = await checkDuplicateRisk(newProjectName, projects, templateString);
    setDuplicateWarning(warning);
    setIsChecking(false);
  };

  const handleCreate = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      code: newProjectCode,
      name: newProjectName,
      businessUnit: newProjectUnit,
      manager: newProjectManager || '未分配',
      createdAt: new Date().toISOString().split('T')[0],
      lastActiveAt: new Date().toISOString().split('T')[0],
      status: ProjectStatus.NEW,
      currentStage: ProjectStage.OPPORTUNITY,
      description: '从派单池新建',
      tags: [],
      history: [],
    };
    onAddProject(newProject);
    setIsModalOpen(false);
    // Reset Form
    setNewProjectName('');
    setNewProjectCode('');
    setNewProjectManager('');
    setDuplicateWarning(null);
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">项目派单池</h2>
          <p className="text-slate-500">管理接入的项目需求并分配资源。</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={18} />
          新建项目登记
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="搜索项目名称、编码或负责人..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200">
          <Filter size={18} />
          <span>筛选</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">项目信息</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">所属经营单元</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">负责人</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">最后活跃</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProjects.map(project => (
              <tr key={project.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-slate-800">{project.name}</p>
                    <p className="text-xs text-slate-400">{project.code}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{project.businessUnit}</td>
                <td className="px-6 py-4 text-sm text-slate-600 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                    {project.manager.charAt(0)}
                  </div>
                  {project.manager}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={project.status} />
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {project.lastActiveAt}
                </td>
                <td className="px-6 py-4">
                   <button 
                    onClick={() => onProjectSelect(project)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     管理 <ArrowRight size={14} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProjects.length === 0 && (
            <div className="p-12 text-center text-slate-400">
                未找到符合条件的项目。
            </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">注册新项目</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">项目名称</label>
                <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                    />
                    <button 
                        onClick={handleCheckDuplicate}
                        disabled={isChecking || !newProjectName}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {isChecking ? '检测中...' : '重名检测'}
                    </button>
                </div>
                {duplicateWarning && (
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-3 text-sm text-amber-800">
                        <AlertTriangle className="shrink-0 w-5 h-5" />
                        <p>{duplicateWarning}</p>
                    </div>
                )}
                {!duplicateWarning && isChecking === false && newProjectName.length > 0 && duplicateWarning !== null && (
                    <div className="mt-2 p-2 text-green-600 text-sm flex items-center gap-2">
                         <CheckCircle size={16}/> 项目名称未发现重复风险。
                    </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">项目编码 (ERP/CRM)</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newProjectCode}
                  onChange={(e) => setNewProjectCode(e.target.value)}
                />
              </div>

               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">项目负责人</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="请输入负责人姓名"
                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newProjectManager}
                        onChange={(e) => setNewProjectManager(e.target.value)}
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">所属经营单元</label>
                <select 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={newProjectUnit}
                  onChange={(e) => setNewProjectUnit(e.target.value)}
                >
                  {BUSINESS_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
              >
                取消
              </button>
              <button 
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg shadow-sm"
              >
                确认登记
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatchPool;
