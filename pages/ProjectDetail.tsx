
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, FileText, User, Calendar, Sparkles, PlayCircle, PauseCircle, Send, History, Users, Edit2, Save, X, Paperclip, Trash2, Download, File, Lightbulb, RefreshCw } from 'lucide-react';
import { Project, ProjectStatus, LogEntry, Attachment, PromptTemplate, User as UserType } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { generateProjectSummary, recommendArchitect, RecommendationResult } from '../services/geminiService';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onUpdateProject: (updated: Project) => void;
  promptTemplates: PromptTemplate[];
  users?: UserType[]; // Added prop
  projects?: Project[]; // All projects for context
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack, onUpdateProject, promptTemplates, users = [], projects = [] }) => {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HISTORY' | 'FILES'>('OVERVIEW');

  // Editing Metadata state
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [editCreatedAt, setEditCreatedAt] = useState(project.createdAt);
  const [editTags, setEditTags] = useState(project.tags.join(', '));
  const [editArchitectId, setEditArchitectId] = useState(project.architectId || '');

  // Recommendation State
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);

  // New Log State
  const [newLogContent, setNewLogContent] = useState('');
  const [newLogDate, setNewLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editing Log State
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editLogContent, setEditLogContent] = useState('');
  const [editLogDate, setEditLogDate] = useState('');

  // Sync local state
  useEffect(() => {
    setEditCreatedAt(project.createdAt);
    setEditTags(project.tags.join(', '));
    setEditArchitectId(project.architectId || '');
  }, [project]);

  // Handle AI Recommendation
  const handleGetRecommendation = async () => {
      setShowRecommendation(true);
      if (recommendations.length > 0) return; // Don't re-fetch if already have result this session

      setIsRecommending(true);
      const tpl = promptTemplates.find(t => t.key === 'ARCHITECT_RECOMMENDATION')?.template || '';
      // Filter candidates to ARCHITECTs
      const candidates = users.filter(u => u.role === 'ARCHITECT');
      
      const results = await recommendArchitect(project, candidates, projects, tpl);
      setRecommendations(results);
      setIsRecommending(false);
  };

  const handleApplyRecommendation = (userId: string) => {
      setEditArchitectId(userId);
      setShowRecommendation(false);
  };

  // ... (Summary Generation Logic existing) ...
  const handleGenerateSummary = async () => {
    setIsGeneratingAI(true);
    const summaryTpl = promptTemplates.find(t => t.key === 'PROJECT_SUMMARY')?.template || '';
    const workflowCtx = promptTemplates.find(t => t.key === 'WORKFLOW_CONTEXT')?.template || '';
    const summary = await generateProjectSummary(project, summaryTpl, workflowCtx);
    onUpdateProject({ ...project, aiSummary: summary });
    setIsGeneratingAI(false);
  };

  // ... (Log Management functions existing) ...
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
      author: '当前用户', 
      content: newLogContent,
      type: type,
      attachments: pendingAttachments
    };
    onUpdateProject({
      ...project,
      history: [newLog, ...project.history],
      lastActiveAt: new Date() > new Date(project.lastActiveAt) ? new Date().toISOString().split('T')[0] : project.lastActiveAt
    });
    setNewLogContent('');
    setPendingAttachments([]);
  };

  // ... (Edit Log functions) ...
  const startEditLog = (log: LogEntry) => {
      setEditingLogId(log.id);
      setEditLogContent(log.content);
      setEditLogDate(log.date);
  };
  const saveEditLog = () => {
      if (!editingLogId) return;
      const updatedHistory = project.history.map(log => log.id === editingLogId ? { ...log, content: editLogContent, date: editLogDate } : log);
      updatedHistory.sort((a, b) => b.date.localeCompare(a.date));
      onUpdateProject({ ...project, history: updatedHistory });
      setEditingLogId(null);
  };
  const cancelEditLog = () => { setEditingLogId(null); };

  const toggleStatus = () => {
    onUpdateProject({ ...project, status: project.status === ProjectStatus.PAUSED ? ProjectStatus.IN_PROGRESS : ProjectStatus.PAUSED });
  };

  const handleSaveMetadata = () => {
    onUpdateProject({
        ...project,
        createdAt: editCreatedAt,
        tags: editTags.split(/[,，]/).map(t => t.trim()).filter(t => t),
        architectId: editArchitectId // Save Architect
    });
    setIsEditingMeta(false);
  };

  const allAttachments = project.history.flatMap(log => (log.attachments || []).map(att => ({ ...att, logContext: log })));
  const architectName = users.find(u => u.id === project.architectId)?.name || '未指定';

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-white rounded-full border border-transparent hover:border-slate-200 text-slate-500"><ArrowLeft size={20} /></button>
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold text-slate-900">{project.name}</h2>
                    <StatusBadge status={project.status} />
                </div>
                <p className="text-slate-500 text-sm font-mono">{project.code} • {project.businessUnit}</p>
            </div>
        </div>
        <div className="flex gap-3">
            <button onClick={toggleStatus} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm ${project.status === ProjectStatus.PAUSED ? 'bg-green-600 text-white' : 'bg-amber-100 text-amber-800'}`}>
                {project.status === ProjectStatus.PAUSED ? <PlayCircle size={16}/> : <PauseCircle size={16} />}
                {project.status === ProjectStatus.PAUSED ? '重启项目' : '暂停项目'}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm relative overflow-hidden">
                <Sparkles size={100} className="absolute top-0 right-0 p-4 opacity-10" />
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="text-blue-600" size={20} />
                    <h3 className="font-bold text-blue-900">智能场景回溯 (AI Recall)</h3>
                    {isGeneratingAI && <span className="text-xs text-blue-500 animate-pulse">思考中...</span>}
                </div>
                <p className="text-slate-700 text-sm relative z-10 whitespace-pre-wrap">{project.aiSummary || "暂无摘要。"}</p>
                <div className="mt-4 flex justify-end"><button onClick={handleGenerateSummary} disabled={isGeneratingAI} className="text-xs font-semibold text-blue-700 hover:underline">刷新</button></div>
            </div>

            <div className="border-b border-slate-200">
                <nav className="flex gap-6">
                    {['OVERVIEW', 'HISTORY', 'FILES'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}>{tab === 'OVERVIEW' ? '项目总览' : tab === 'HISTORY' ? '支持记录' : '文件索引'}</button>
                    ))}
                </nav>
            </div>

            <div className="min-h-[400px]">
                {activeTab === 'OVERVIEW' && (
                     <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4 pt-2">
                            <h4 className="font-semibold text-slate-800">关键信息</h4>
                            {!isEditingMeta ? (
                                <button onClick={() => setIsEditingMeta(true)} className="text-slate-400 hover:text-blue-600 flex gap-1 text-sm"><Edit2 size={14} /> 编辑</button>
                            ) : (
                                <div className="flex gap-2"><button onClick={() => setIsEditingMeta(false)}><X size={16}/></button><button onClick={handleSaveMetadata} className="text-green-600"><Save size={16}/></button></div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-y-6 text-sm">
                            <div><span className="block text-slate-400 text-xs mb-1">当前阶段</span><span className="bg-slate-100 px-2 py-1 rounded">{project.currentStage}</span></div>
                            <div><span className="block text-slate-400 text-xs mb-1">项目负责人</span><span className="flex items-center gap-2"><User size={14} /> {project.manager}</span></div>
                            
                            {/* Architect Selection Field */}
                            <div className="col-span-2">
                                <span className="block text-slate-400 text-xs mb-1">技术架构设计负责人</span>
                                {isEditingMeta ? (
                                    <div className="flex items-center gap-2">
                                        <select 
                                            value={editArchitectId}
                                            onChange={(e) => setEditArchitectId(e.target.value)}
                                            className="border border-slate-300 rounded px-2 py-1 flex-1 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        >
                                            <option value="">-- 请选择 --</option>
                                            {users.filter(u => u.role === 'ARCHITECT' || u.role === 'ADMIN').map(u => (
                                                <option key={u.id} value={u.id}>{u.name} - {u.title || 'N/A'}</option>
                                            ))}
                                        </select>
                                        <button 
                                            onClick={handleGetRecommendation}
                                            className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded border border-indigo-200 text-xs font-semibold flex items-center gap-1 hover:bg-indigo-100 whitespace-nowrap"
                                        >
                                            <Lightbulb size={12}/> AI 智能推荐
                                        </button>
                                    </div>
                                ) : (
                                    <span className="font-medium text-slate-700 flex items-center gap-2">
                                        <Users size={14} /> {architectName}
                                    </span>
                                )}
                            </div>

                            <div><span className="block text-slate-400 text-xs mb-1">创建日期</span>{isEditingMeta ? <input type="date" value={editCreatedAt} onChange={e => setEditCreatedAt(e.target.value)} className="border rounded px-2 py-1"/> : <span className="flex items-center gap-2"><Calendar size={14} /> {project.createdAt}</span>}</div>
                            <div><span className="block text-slate-400 text-xs mb-1">标签</span>{isEditingMeta ? <input type="text" value={editTags} onChange={e => setEditTags(e.target.value)} className="border rounded px-2 py-1 w-full"/> : <div className="flex gap-2 flex-wrap">{project.tags.map(t => <span key={t} className="text-xs bg-slate-100 px-2 py-1 rounded">{t}</span>)}</div>}</div>
                        </div>
                     </div>
                )}
                
                {/* ... History and Files Tabs (Same as before, abbreviated for brevity in this delta) ... */}
                {activeTab === 'HISTORY' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
                            <h4 className="text-sm font-semibold text-slate-700">新增日志</h4>
                            <div className="flex gap-3">
                                <input type="date" value={newLogDate} onChange={e => setNewLogDate(e.target.value)} className="border rounded px-2 py-1 text-sm"/>
                                <input type="text" value={newLogContent} onChange={e => setNewLogContent(e.target.value)} placeholder="内容..." className="flex-1 border rounded px-3 py-1 text-sm"/>
                                <button onClick={handleAddLog} disabled={!newLogContent} className="bg-blue-600 text-white px-3 rounded text-sm"><Send size={16}/></button>
                            </div>
                        </div>
                        <div className="border-l-2 border-slate-200 ml-4 space-y-6 pl-8">
                            {project.history.map(log => (
                                <div key={log.id} className="relative">
                                    <div className="absolute -left-[39px] w-4 h-4 bg-slate-300 rounded-full border-2 border-white"></div>
                                    <div className="bg-white p-4 rounded border border-slate-100 shadow-sm">
                                        <p className="text-xs text-slate-400">{log.date} • {log.author}</p>
                                        <p className="text-sm mt-1">{log.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'FILES' && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-slate-800">文件索引 ({allAttachments.length})</h4>
                        </div>
                        {allAttachments.length > 0 ? (
                            <ul className="space-y-3">
                                {allAttachments.map(att => (
                                    <li key={att.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-100 rounded text-slate-500">
                                                <FileText size={20}/>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">{att.name}</p>
                                                <p className="text-xs text-slate-400">{att.size} • {att.logContext.date}</p>
                                            </div>
                                        </div>
                                        <button className="text-slate-400 hover:text-blue-600">
                                            <Download size={16}/>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                <File size={32} className="mx-auto mb-2 text-slate-300"/>
                                <p>暂无附件</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
        
        {/* Modal for Recommendation */}
        {showRecommendation && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                    <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Sparkles className="text-indigo-600"/> AI 架构师推荐
                        </h3>
                        <button onClick={() => setShowRecommendation(false)} className="text-slate-400 hover:text-slate-600"><X/></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                        {isRecommending ? (
                            <div className="text-center py-12">
                                <RefreshCw className="animate-spin mx-auto text-indigo-500 mb-4" size={32}/>
                                <p className="text-slate-600">正在分析人员画像、历史负载与项目匹配度...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recommendations.map((rec, idx) => (
                                    <div key={rec.userId} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${idx === 0 ? 'bg-amber-500' : 'bg-slate-400'}`}>
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800">
                                                        {users.find(u => u.id === rec.userId)?.name}
                                                    </h4>
                                                    <p className="text-xs text-slate-500">
                                                        匹配总分: <span className="font-bold text-indigo-600">{rec.totalScore}/10</span> 
                                                        (负载: {rec.details.workloadScore} + 匹配: {rec.details.aiScore})
                                                    </p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleApplyRecommendation(rec.userId)}
                                                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700"
                                            >
                                                选择此人
                                            </button>
                                        </div>
                                        <div className="mt-3 p-3 bg-indigo-50 rounded text-sm text-indigo-900 leading-relaxed">
                                            {rec.reason}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
