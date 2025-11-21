
import React from 'react';
import { LayoutGrid, PlusCircle, FolderKanban, Zap, Menu, ClipboardList, Bot } from 'lucide-react';
import { ViewMode } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const navClass = (view: ViewMode) => 
    `flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
      currentView === view 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Zap className="w-6 h-6 text-white" fill="currentColor" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">GridFlow</h1>
            <p className="text-xs text-slate-400 font-medium">架构师项目管理</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <div 
            onClick={() => setView('DASHBOARD')}
            className={navClass('DASHBOARD')}
          >
            <LayoutGrid size={20} />
            <span className="font-medium">概览仪表盘</span>
          </div>
          <div 
            onClick={() => setView('DISPATCH')}
            className={navClass('DISPATCH')}
          >
            <PlusCircle size={20} />
            <span className="font-medium">项目派单池</span>
          </div>
          <div 
            onClick={() => setView('WEEKLY_REPORT')}
            className={navClass('WEEKLY_REPORT')}
          >
            <ClipboardList size={20} />
            <span className="font-medium">周报统计</span>
          </div>
          <div 
            onClick={() => setView('PROMPT_MANAGER')}
            className={navClass('PROMPT_MANAGER')}
          >
            <Bot size={20} />
            <span className="font-medium">Prompt 调优</span>
          </div>
          <div 
            onClick={() => setView('PROJECT_DETAIL')} // Usually navigated via list, but kept for logic
            className={`${navClass('PROJECT_DETAIL')} ${currentView !== 'PROJECT_DETAIL' ? 'hidden' : ''}`}
          >
            <FolderKanban size={20} />
            <span className="font-medium">项目详情</span>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-1">当前角色</p>
            <p className="text-sm font-semibold">部门经理</p>
            <p className="text-xs text-slate-500 mt-2">解决方案架构部</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <div className="flex items-center text-slate-500 text-sm">
             <span className="mr-2">工作台</span> / 
             <span className="ml-2 font-medium text-slate-800">
                {currentView === 'DASHBOARD' ? '概览' : 
                 currentView === 'DISPATCH' ? '项目接入与分配' : 
                 currentView === 'WEEKLY_REPORT' ? '周报统计' : 
                 currentView === 'PROMPT_MANAGER' ? 'AI Prompt 模板管理' : '项目详情'}
             </span>
          </div>
          <div className="flex items-center gap-4">
             <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                <Menu size={20} />
             </button>
             <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs border border-blue-200">
                DM
             </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
