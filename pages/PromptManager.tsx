
import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Cpu, Terminal, Info, Sparkles, Edit3, Lock, Unlock, AlertCircle } from 'lucide-react';
import { PromptTemplate, Project } from '../types';
import { generateDepartmentWorkflow } from '../services/geminiService';

interface PromptManagerProps {
  templates: PromptTemplate[];
  projects: Project[];
  onUpdateTemplate: (updated: PromptTemplate) => void;
}

const PromptManager: React.FC<PromptManagerProps> = ({ templates, projects, onUpdateTemplate }) => {
  const [selectedId, setSelectedId] = useState<string>(templates[0]?.id || '');
  const [isScanning, setIsScanning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const selectedTemplate = templates.find(t => t.id === selectedId);

  // Reset edit mode when switching templates to prevent accidental edits on the wrong one
  useEffect(() => {
    setIsEditing(false);
  }, [selectedId]);

  const handleSave = (newContent: string) => {
    if (selectedTemplate) {
      onUpdateTemplate({
        ...selectedTemplate,
        template: newContent,
        lastUpdated: new Date().toISOString().split('T')[0]
      });
    }
  };

  const handleScanAndGenerate = async () => {
    const workflowTemplate = templates.find(t => t.key === 'WORKFLOW_CONTEXT');
    
    if (!workflowTemplate) {
        alert('未找到工作流画像模板配置，无法生成。');
        return;
    }

    if (!window.confirm('即将读取系统中所有项目的历史数据（包含日志、标签、时间信息），并请求AI分析部门工作习惯。\n\n这可能消耗较多Token，过程可能持续10-20秒，是否继续？')) return;
    
    setIsScanning(true);
    try {
        const result = await generateDepartmentWorkflow(projects);
        
        if (!result || result.startsWith("Error")) {
            alert(`生成失败: ${result || '未知错误'}`);
        } else {
            onUpdateTemplate({
                ...workflowTemplate,
                template: result,
                lastUpdated: new Date().toISOString().split('T')[0]
            });
            // Ensure we are looking at the updated template
            setSelectedId(workflowTemplate.id); 
            alert('部门画像已成功生成并更新到模板中。');
        }
    } catch (error) {
        console.error("Scan failed", error);
        alert('执行过程中发生异常，请检查控制台或网络连接。');
    } finally {
        setIsScanning(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Cpu className="text-blue-600" />
            Prompt 模板工程管理
        </h2>
        <p className="text-slate-500">管理与优化驱动 Gemini AI 的提示词模板，或基于数据生成部门工作流画像。</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
        {/* Left: List */}
        <div className="bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-semibold text-slate-700">模板列表</h3>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-2">
                {templates.map(t => (
                    <div 
                        key={t.id}
                        onClick={() => setSelectedId(t.id)}
                        className={`p-3 rounded-lg cursor-pointer border transition-all ${
                            selectedId === t.id 
                            ? 'bg-blue-50 border-blue-200 shadow-sm' 
                            : 'hover:bg-slate-50 border-transparent text-slate-600'
                        }`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            {t.key === 'WORKFLOW_CONTEXT' ? <Sparkles size={14} className="text-purple-500"/> : <Terminal size={14} className="text-slate-400"/>}
                            <span className={`font-semibold text-sm ${selectedId === t.id ? 'text-blue-700' : 'text-slate-700'}`}>{t.name}</span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">{t.description}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Right: Editor */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {selectedTemplate ? (
                <>
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                        <div>
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                {selectedTemplate.name}
                                <span className="text-xs font-normal text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                                    {selectedTemplate.key}
                                </span>
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">上次更新: {selectedTemplate.lastUpdated}</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {/* Scan Button for Workflow Template */}
                            {selectedTemplate.key === 'WORKFLOW_CONTEXT' && (
                                <button 
                                    onClick={handleScanAndGenerate}
                                    disabled={isScanning}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all shadow-sm ${
                                        isScanning ? 'bg-purple-400 cursor-wait' : 'bg-purple-600 hover:bg-purple-700'
                                    }`}
                                >
                                    {isScanning ? (
                                        <>
                                            <RefreshCw size={16} className="animate-spin" />
                                            正在分析全量数据...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={16} />
                                            全量扫描生成
                                        </>
                                    )}
                                </button>
                            )}
                            
                            {/* Edit Toggle Button */}
                            <button 
                                onClick={() => setIsEditing(!isEditing)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                                    isEditing 
                                    ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {isEditing ? (
                                    <>
                                        <Lock size={16} />
                                        结束编辑
                                    </>
                                ) : (
                                    <>
                                        <Edit3 size={16} />
                                        编辑模板
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 p-0 relative bg-slate-50/50">
                        {!isEditing && (
                            <div 
                                className="absolute top-0 left-0 w-full h-full bg-slate-50/10 z-10 cursor-not-allowed" 
                                title="请点击右上角编辑按钮进行修改" 
                                onClick={() => !isEditing && alert('为了防止误操作，请先点击右上角“编辑模板”按钮解锁。')}
                            ></div>
                        )}
                        <textarea 
                            className={`w-full h-full p-6 font-mono text-sm resize-none outline-none transition-colors ${
                                isEditing 
                                ? 'bg-white text-slate-800' 
                                : 'bg-slate-50 text-slate-500'
                            }`}
                            value={selectedTemplate.template}
                            onChange={(e) => handleSave(e.target.value)}
                            readOnly={!isEditing}
                            spellCheck={false}
                        />
                    </div>

                    <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Info size={14} />
                            {selectedTemplate.key === 'PROJECT_SUMMARY' && <span>可用变量: {'{{projectName}}, {{workflowContext}}, {{history}}'}</span>}
                            {selectedTemplate.key === 'DUPLICATE_CHECK' && <span>可用变量: {'{{newProjectName}}, {{existingProjectNames}}'}</span>}
                            {selectedTemplate.key === 'WORKFLOW_CONTEXT' && <span>此内容将作为上下文注入到 AI Recall 中。</span>}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                             {isEditing ? (
                                <span className="text-amber-600 flex items-center gap-1">
                                    <Unlock size={12} /> 编辑模式
                                </span>
                             ) : (
                                <span className="text-slate-400 flex items-center gap-1">
                                    <Lock size={12} /> 只读模式
                                </span>
                             )}
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400">
                    选择左侧模板开始编辑
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PromptManager;
