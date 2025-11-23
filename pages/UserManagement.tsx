
import React, { useState } from 'react';
import { User, Project, PromptTemplate } from '../types';
import { Mail, Calendar, Briefcase, RefreshCw, Sparkles, BrainCircuit, Target, Award, User as UserIcon } from 'lucide-react';
import { generateUserPersona } from '../services/geminiService';

interface UserManagementProps {
  users: User[];
  projects: Project[];
  templates: PromptTemplate[];
  onUpdateUser: (user: User) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, projects, templates, onUpdateUser }) => {
  const [selectedUser, setSelectedUser] = useState<User>(users[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePersona = async () => {
    const template = templates.find(t => t.key === 'USER_PERSONA');
    const deptContext = templates.find(t => t.key === 'WORKFLOW_CONTEXT')?.template;
    
    if (!template || !deptContext) {
        alert("缺少必要的 Prompt 模板 (USER_PERSONA 或 WORKFLOW_CONTEXT)");
        return;
    }

    setIsGenerating(true);
    try {
        const persona = await generateUserPersona(selectedUser, projects, template.template, deptContext);
        if (persona) {
            onUpdateUser({
                ...selectedUser,
                persona: persona,
                lastPersonaUpdate: new Date().toISOString().split('T')[0]
            });
            alert('AI 画像更新成功！');
        } else {
            alert('AI 未能生成画像，可能是该用户历史数据不足。');
        }
    } catch (e) {
        alert('生成失败');
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Left List */}
      <div className="w-1/3 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-700">团队成员 ({users.length})</h3>
        </div>
        <div className="overflow-y-auto flex-1 p-2">
            {users.map(u => (
                <div 
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className={`p-4 rounded-lg cursor-pointer flex items-center gap-4 transition-all ${
                        selectedUser.id === u.id 
                        ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                >
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                        {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover"/>
                        ) : (
                            <div className="flex items-center justify-center h-full font-bold text-slate-500">{u.name[0]}</div>
                        )}
                    </div>
                    <div>
                        <p className={`font-semibold ${selectedUser.id === u.id ? 'text-blue-800' : 'text-slate-800'}`}>{u.name}</p>
                        <p className="text-xs text-slate-500">{u.title || 'Architect'}</p>
                    </div>
                    {u.role === 'ADMIN' && <span className="ml-auto text-[10px] bg-slate-800 text-white px-1.5 py-0.5 rounded">ADMIN</span>}
                </div>
            ))}
        </div>
      </div>

      {/* Right Detail */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-y-auto p-8">
         <div className="flex justify-between items-start mb-8">
            <div className="flex gap-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden">
                    <img src={selectedUser.avatarUrl} alt={selectedUser.name} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{selectedUser.name}</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><Briefcase size={14}/> {selectedUser.title || '未设置职级'}</span>
                        <span className="flex items-center gap-1"><Mail size={14}/> {selectedUser.email}</span>
                        <span className="flex items-center gap-1"><Calendar size={14}/> 入职: {selectedUser.joinDate || 'N/A'}</span>
                    </div>
                </div>
            </div>
            <button 
                onClick={handleGeneratePersona}
                disabled={isGenerating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors disabled:opacity-70"
            >
                {isGenerating ? <RefreshCw className="animate-spin" size={16}/> : <Sparkles size={16}/>}
                {isGenerating ? 'AI 分析中...' : '更新能力画像'}
            </button>
         </div>

         {/* Persona Cards */}
         <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5">
                    <BrainCircuit size={120} />
                 </div>
                 <h3 className="text-indigo-900 font-bold mb-3 flex items-center gap-2">
                    <BrainCircuit size={18}/> 
                    AI 综合画像 
                    <span className="text-xs font-normal text-indigo-500 bg-white/50 px-2 py-0.5 rounded-full">
                        更新于: {selectedUser.lastPersonaUpdate || '从未'}
                    </span>
                 </h3>
                 <p className="text-slate-700 leading-relaxed mb-4">
                    {selectedUser.persona?.historySummary || "暂无画像数据。请点击右上角按钮进行生成。"}
                 </p>
                 <div className="flex flex-wrap gap-2">
                    {selectedUser.persona?.domains.map(d => (
                        <span key={d} className="bg-white text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm border border-indigo-100">
                            {d}
                        </span>
                    ))}
                 </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                 <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Target size={18} className="text-blue-500"/> 工作风格
                 </h4>
                 <p className="text-sm text-slate-600 leading-relaxed">
                    {selectedUser.persona?.workStyle || "等待分析..."}
                 </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                 <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Award size={18} className="text-amber-500"/> 待加强能力 / 成长建议
                 </h4>
                 <p className="text-sm text-slate-600 leading-relaxed">
                    {selectedUser.persona?.improvementAreas || "等待分析..."}
                 </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default UserManagement;
