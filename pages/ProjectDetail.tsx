
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, FileText, User, Calendar, Sparkles, PlayCircle, PauseCircle, Send, History, Users, Edit2, Save, X, Paperclip, Trash2, Download, File } from 'lucide-react';
import { Project, ProjectStatus, LogEntry, Attachment, PromptTemplate } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { generateProjectSummary } from '../services/geminiService';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onUpdateProject: (updated: Project) => void;
  promptTemplates: PromptTemplate[];
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack, onUpdateProject, promptTemplates }) => {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HISTORY' | 'FILES'>('OVERVIEW');

  // Editing Metadata state
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [editCreatedAt, setEditCreatedAt] = useState(project.createdAt);
  const [editTags, setEditTags] = useState(project.tags.join(', '));

  // New Log State
  const [newLogContent, setNewLogContent] = useState('');
  const [newLogDate, setNewLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editing Log State
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editLogContent, setEditLogContent] = useState('');
  const [editLogDate, setEditLogDate] = useState('');

  // Sync local state with prop updates
  useEffect(() => {
    setEditCreatedAt(project.createdAt);
    setEditTags(project.tags.join(', '));
  }, [project]);

  // Calculate Integration Design Manager from history
  const integrationManagers = Array.from(new Set(project.history.map(log => log.author)))
    .filter(Boolean)
    .join(', ') || '暂无记录';

  // Simulate AI generation on mount if summary is missing
  useEffect(() => {
    if (!project.aiSummary && project.history.length > 0) {
      handleGenerateSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerateSummary = async () => {
    setIsGeneratingAI(true);
    
    const summaryTpl = promptTemplates.find(t => t.key === 'PROJECT_SUMMARY')?.template || '';
    const workflowCtx = promptTemplates.find(t => t.key === 'WORKFLOW_CONTEXT')?.template || '';

    const summary = await generateProjectSummary(project, summaryTpl, workflowCtx);
    onUpdateProject({ ...project, aiSummary: summary });
    setIsGeneratingAI(false);
  };

  // --- Log Management ---

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        const newAttachment: Attachment = {
            id: Date.now().toString(),
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            type: file.name.split('.').pop() || 'file'
        };
        setPendingAttachments([...pendingAttachments, newAttachment]);
    }
  };

  const removePendingAttachment = (id: string) => {
      setPendingAttachments(pendingAttachments.filter(a => a.id !== id));
  };

  const handleAddLog = () => {
    if (!newLogContent.trim()) return;
    
    const type = pendingAttachments.length > 0 ? 'DELIVERABLE' : 'NOTE';
    
    const newLog: LogEntry = {
      id: Date.now().toString(),
      date: newLogDate,
      author: '当前用户', // In a real app, this comes from auth context
      content: newLogContent,
      type: type,
      attachments: pendingAttachments
    };
    
    const updatedProject = {
      ...project,
      history: [newLog, ...project.history],
      lastActiveAt: new Date() > new Date(project.lastActiveAt) ? new Date().toISOString().split('T')[0] : project.lastActiveAt
    };
    
    onUpdateProject(updatedProject);
    
    // Reset form
    setNewLogContent('');
    setNewLogDate(new Date().toISOString().split('T')[0]);
    setPendingAttachments([]);
  };

  // --- Edit Log ---

  const startEditLog = (log: LogEntry) => {
      setEditingLogId(log.id);
      setEditLogContent(log.content);
      setEditLogDate(log.date);
  };

  const saveEditLog = () => {
      if (!editingLogId) return;
      
      const updatedHistory = project.history.map(log => {
          if (log.id === editingLogId) {
              return { ...log, content: editLogContent, date: editLogDate };
          }
          return log;
      });

      // Sort history by date descending after edit
      updatedHistory.sort((a, b) => b.date.localeCompare(a.date));

      onUpdateProject({ ...project, history: updatedHistory });
      setEditingLogId(null);
  };

  const cancelEditLog = () => {
      setEditingLogId(null);
      setEditLogContent('');
      setEditLogDate('');
  };

  const toggleStatus = () => {
    const newStatus = project.status === ProjectStatus.PAUSED 
      ? ProjectStatus.IN_PROGRESS 
      : ProjectStatus.PAUSED;
    onUpdateProject({ ...project, status: newStatus });
  };

  const handleSaveMetadata = () => {
    onUpdateProject({
        ...project,
        createdAt: editCreatedAt,
        tags: editTags.split(/[,，]/).map(t => t.trim()).filter(t => t)
    });
    setIsEditingMeta(false);
  };

  // Aggregate all files for the FILES tab
  const allAttachments = project.history.flatMap(log => 
    (log.attachments || []).map(att => ({ ...att, logContext: log }))
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Navigation */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
            <button 
                onClick={onBack}
                className="p-2 hover:bg-white rounded-full border border-transparent hover:border-slate-200 transition-all text-slate-500"
            >
                <ArrowLeft size={20} />
            </button>
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold text-slate-900">{project.name}</h2>
                    <StatusBadge status={project.status} />
                </div>
                <p className="text-slate-500 text-sm font-mono">{project.code} • {project.businessUnit}</p>
            </div>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={toggleStatus}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    project.status === ProjectStatus.PAUSED 
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                }`}
            >
                {project.status === ProjectStatus.PAUSED ? <PlayCircle size={16}/> : <PauseCircle size={16} />}
                {project.status === ProjectStatus.PAUSED ? '重启项目' : '暂停项目'}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Context & Info */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* AI Context Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles size={100} />
                </div>
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="text-blue-600" size={20} />
                    <h3 className="font-bold text-blue-900">智能场景回溯 (AI Recall)</h3>
                    {isGeneratingAI && <span className="text-xs text-blue-500 animate-pulse">思考中...</span>}
                </div>
                <p className="text-slate-700 leading-relaxed text-sm relative z-10 whitespace-pre-wrap">
                    {project.aiSummary || "暂无足够历史数据生成摘要。"}
                </p>
                <div className="mt-4 flex justify-end">
                     <button 
                        onClick={handleGenerateSummary}
                        disabled={isGeneratingAI}
                        className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                     >
                        刷新上下文
                     </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <nav className="flex gap-6">
                    <button
                        onClick={() => setActiveTab('OVERVIEW')}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'OVERVIEW'
                            ? 'border-blue-600 text-blue-600' 
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        项目总览
                    </button>
                    <button
                        onClick={() => setActiveTab('HISTORY')}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'HISTORY'
                            ? 'border-blue-600 text-blue-600' 
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        支持记录 & 成果物
                    </button>
                    <button
                        onClick={() => setActiveTab('FILES')}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'FILES'
                            ? 'border-blue-600 text-blue-600' 
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        成果物文件索引
                    </button>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="min-h-[400px]">
                {activeTab === 'OVERVIEW' && (
                     <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                             <h4 className="font-semibold text-slate-800">项目描述</h4>
                        </div>
                        <p className="text-slate-600 text-sm mb-8">{project.description}</p>

                        <div className="flex justify-between items-center mb-4 border-t border-slate-100 pt-6">
                            <h4 className="font-semibold text-slate-800">关键元数据</h4>
                            {!isEditingMeta ? (
                                <button 
                                    onClick={() => setIsEditingMeta(true)}
                                    className="text-slate-400 hover:text-blue-600 flex items-center gap-1 text-sm"
                                >
                                    <Edit2 size={14} /> 编辑
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setIsEditingMeta(false)}
                                        className="text-slate-500 hover:bg-slate-100 p-1 rounded"
                                    >
                                        <X size={16} />
                                    </button>
                                    <button 
                                        onClick={handleSaveMetadata}
                                        className="text-green-600 hover:bg-green-50 p-1 rounded"
                                    >
                                        <Save size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-y-6 text-sm">
                            <div>
                                <span className="block text-slate-400 text-xs uppercase mb-1">当前阶段</span>
                                <span className="font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">{project.currentStage}</span>
                            </div>
                            <div>
                                <span className="block text-slate-400 text-xs uppercase mb-1">项目负责人</span>
                                <span className="font-medium text-slate-700 flex items-center gap-2">
                                    <User size={14} /> {project.manager}
                                </span>
                            </div>
                            <div className="col-span-2">
                                <span className="block text-slate-400 text-xs uppercase mb-1">集成设计工作负责人 (自动抓取)</span>
                                <span className="font-medium text-slate-700 flex items-center gap-2">
                                    <Users size={14} /> {integrationManagers}
                                </span>
                            </div>
                            <div>
                                <span className="block text-slate-400 text-xs uppercase mb-1">创建日期</span>
                                {isEditingMeta ? (
                                    <input 
                                        type="date"
                                        value={editCreatedAt}
                                        onChange={(e) => setEditCreatedAt(e.target.value)}
                                        className="border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                ) : (
                                    <span className="font-medium text-slate-700 flex items-center gap-2">
                                        <Calendar size={14} /> {project.createdAt}
                                    </span>
                                )}
                            </div>
                            <div>
                                <span className="block text-slate-400 text-xs uppercase mb-1">标签</span>
                                {isEditingMeta ? (
                                    <input 
                                        type="text"
                                        value={editTags}
                                        onChange={(e) => setEditTags(e.target.value)}
                                        placeholder="标签1, 标签2"
                                        className="border border-slate-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                ) : (
                                    <div className="flex gap-2 flex-wrap">
                                        {project.tags.length > 0 ? project.tags.map(tag => (
                                            <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                                                {tag}
                                            </span>
                                        )) : <span className="text-slate-300 italic">无标签</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                     </div>
                )}

                {activeTab === 'HISTORY' && (
                    <div className="space-y-6">
                        {/* Add Log Form */}
                        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
                            <h4 className="text-sm font-semibold text-slate-700">新增工作日志 / 上传成果</h4>
                            <div className="flex gap-3">
                                <input 
                                    type="date"
                                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newLogDate}
                                    onChange={(e) => setNewLogDate(e.target.value)}
                                />
                                <input 
                                    type="text"
                                    placeholder="在此输入工作内容..."
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newLogContent}
                                    onChange={(e) => setNewLogContent(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddLog()}
                                />
                            </div>
                            
                            {/* Attachment Area */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        onChange={handleFileSelect} 
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-medium transition-colors"
                                    >
                                        <Paperclip size={14} />
                                        添加附件/成果物
                                    </button>
                                    
                                    {pendingAttachments.map(att => (
                                        <div key={att.id} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-100 text-xs whitespace-nowrap">
                                            <File size={12} />
                                            <span className="max-w-[100px] truncate">{att.name}</span>
                                            <button onClick={() => removePendingAttachment(att.id)} className="hover:text-blue-900"><X size={12}/></button>
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    onClick={handleAddLog}
                                    disabled={!newLogContent}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={16} />
                                    提交记录
                                </button>
                            </div>
                        </div>

                        {/* Log List */}
                        <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pl-8 py-2">
                            {project.history.map((log) => (
                                <div key={log.id} className="relative group">
                                    <div className={`absolute -left-[41px] w-5 h-5 rounded-full border-2 border-white shadow-sm ${
                                        log.type === 'MEETING' ? 'bg-blue-500' :
                                        log.type === 'DELIVERABLE' ? 'bg-purple-500' :
                                        log.type === 'DECISION' ? 'bg-green-500' : 'bg-slate-400'
                                    }`}></div>
                                    
                                    {/* Edit Mode vs View Mode */}
                                    {editingLogId === log.id ? (
                                        <div className="bg-white p-4 rounded-lg border-2 border-blue-100 shadow-md">
                                            <div className="flex gap-2 mb-2">
                                                 <input 
                                                    type="date"
                                                    value={editLogDate}
                                                    onChange={(e) => setEditLogDate(e.target.value)}
                                                    className="border border-slate-200 rounded px-2 py-1 text-sm"
                                                />
                                            </div>
                                            <textarea 
                                                value={editLogContent}
                                                onChange={(e) => setEditLogContent(e.target.value)}
                                                className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-3"
                                                rows={3}
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button onClick={cancelEditLog} className="px-3 py-1 text-slate-500 hover:bg-slate-100 rounded text-xs">取消</button>
                                                <button onClick={saveEditLog} className="px-3 py-1 bg-blue-600 text-white rounded text-xs">保存修改</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                                    log.type === 'MEETING' ? 'bg-blue-50 text-blue-700' :
                                                    log.type === 'DELIVERABLE' ? 'bg-purple-50 text-purple-700' :
                                                    log.type === 'DECISION' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'
                                                }`}>{log.type}</span>
                                                
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                        <History size={12} /> {log.date} • {log.author}
                                                    </span>
                                                    <button 
                                                        onClick={() => startEditLog(log)}
                                                        className="text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="编辑记录"
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-slate-700 text-sm whitespace-pre-wrap">{log.content}</p>
                                            
                                            {/* Attachments Display in Log */}
                                            {log.attachments && log.attachments.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                                                    {log.attachments.map(att => (
                                                        <div key={att.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded px-3 py-1.5 cursor-pointer hover:bg-slate-100 group/file">
                                                            <div className="bg-white p-1 rounded border border-slate-100">
                                                                <FileText size={14} className="text-blue-500"/>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-medium text-slate-700">{att.name}</span>
                                                                <span className="text-[10px] text-slate-400">{att.size}</span>
                                                            </div>
                                                            <Download size={14} className="text-slate-400 group-hover/file:text-blue-600 ml-2" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {activeTab === 'FILES' && (
                    <div className="space-y-4">
                        {allAttachments.length === 0 ? (
                            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                                <FileText className="mx-auto text-slate-300 mb-3" size={48} />
                                <p className="text-slate-500 font-medium">暂无关联文件。</p>
                                <p className="text-xs text-slate-400 mt-1">在"支持记录"中上传的附件会自动汇总到这里。</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-medium">
                                        <tr>
                                            <th className="px-4 py-3">文件名</th>
                                            <th className="px-4 py-3">大小</th>
                                            <th className="px-4 py-3">关联记录 (来源)</th>
                                            <th className="px-4 py-3">上传日期</th>
                                            <th className="px-4 py-3 text-right">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {allAttachments.map((item, idx) => (
                                            <tr key={`${item.id}-${idx}`} className="hover:bg-slate-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <File className="text-blue-500" size={16} />
                                                        <span className="text-slate-700 font-medium">{item.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">{item.size}</td>
                                                <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={item.logContext.content}>
                                                    {item.logContext.content}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">{item.logContext.date}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center justify-end gap-1 w-full">
                                                        <Download size={14} /> 下载
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* Right Column: Timeline & Meta */}
        <div className="space-y-6">
            {/* Visual Timeline Mini-Map */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold">
                    <Clock size={18} />
                    <h3>活动时间轴</h3>
                </div>
                <div className="h-64 relative border-l border-slate-100 ml-2">
                    {/* Simulated Activity Heatmap */}
                    {project.history.slice(0, 5).map((h, i) => (
                        <div key={h.id} className="mb-6 pl-6 relative">
                            <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                            <p className="text-xs text-slate-400">{h.date}</p>
                            <p className="text-xs font-medium text-slate-700 truncate">{h.content}</p>
                        </div>
                    ))}
                     <div className="pl-6 pt-4 border-t border-slate-100 text-xs text-slate-400 italic">
                        Gap 分析: 检测到 12 月至 3 月期间有 3 个月的非活跃期。
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
