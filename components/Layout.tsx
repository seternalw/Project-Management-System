
import React from 'react';
import { LayoutGrid, PlusCircle, FolderKanban, Zap, Menu, ClipboardList, Bot, LogOut, Users } from 'lucide-react';
import { ViewMode, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, user, onLogout }) => {
  const navClass = (view: ViewMode) => 
    `flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
      currentView === view 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl transition-all duration-300">
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
          
          {/* User Management - Admin/Manager Only */}
          {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
            <div 
                onClick={() => setView('USER_MANAGEMENT')}
                className={navClass('USER_MANAGEMENT')}
            >
                <Users size={20} />
                <span className="font-medium">人员资源管理</span>
            </div>
          )}
          
          {/* Prompt Manager - Admin Only */}
          {user.role === 'ADMIN' && (
            <div 
                onClick={() => setView('PROMPT_MANAGER')}
                className={navClass('PROMPT_MANAGER')}
            >
                <Bot size={20} />
                <span className="font-medium">Prompt 调优</span>
            </div>
          )}

          <div 
            onClick={() => setView('PROJECT_DETAIL')} 
            className={`${navClass('PROJECT_DETAIL')} ${currentView !== 'PROJECT_DETAIL' ? 'hidden' : ''}`}
          >
            <FolderKanban size={20} />
            <span className="font-medium">项目详情</span>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-lg p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 overflow-hidden border-2 border-slate-600">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold">{user.name.charAt(0)}</div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 capitalize">{user.role}</p>
                </div>
            </div>
            <button 
                onClick={onLogout}
                className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors w-full justify-center pt-2 border-t border-slate-700"
            >
                <LogOut size={14} /> 退出登录
            </button>
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
                 currentView === 'USER_MANAGEMENT' ? '人员能力画像与资源' :
                 currentView === 'PROMPT_MANAGER' ? 'AI Prompt 模板管理' : '项目详情'}
             </span>
          </div>
          <div className="flex items-center gap-4">
             <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                <Menu size={20} />
             </button>
             <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                {user.role} VIEW
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
