
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DispatchPool from './pages/DispatchPool';
import ProjectDetail from './pages/ProjectDetail';
import WeeklyReport from './pages/WeeklyReport';
import PromptManager from './pages/PromptManager';
import LoginPage from './pages/LoginPage';
import UserManagement from './pages/UserManagement';
import { Project, ViewMode, PromptTemplate, User } from './types';
import { MOCK_PROJECTS, DEFAULT_PROMPT_TEMPLATES, MOCK_USERS } from './constants';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);

  const [currentView, setView] = useState<ViewMode>('DASHBOARD');
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>(DEFAULT_PROMPT_TEMPLATES);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  // If not logged in, show Login Page
  if (!user) {
      return <LoginPage onLogin={setUser} />;
  }

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setView('PROJECT_DETAIL');
  };

  const handleAddProject = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev]);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);
  };

  const handleUpdateTemplate = (updatedTemplate: PromptTemplate) => {
    setPromptTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleLogout = () => {
      setUser(null);
      setView('DASHBOARD');
  };

  return (
    <Layout currentView={currentView} setView={setView} user={user} onLogout={handleLogout}>
      {currentView === 'DASHBOARD' && (
        <Dashboard projects={projects} />
      )}
      
      {currentView === 'DISPATCH' && (
        <DispatchPool 
          projects={projects} 
          onProjectSelect={handleProjectSelect}
          onAddProject={handleAddProject}
          promptTemplates={promptTemplates}
        />
      )}

      {currentView === 'WEEKLY_REPORT' && (
        <WeeklyReport projects={projects} />
      )}

      {currentView === 'USER_MANAGEMENT' && (
        <UserManagement 
            users={users}
            projects={projects}
            templates={promptTemplates}
            onUpdateUser={handleUpdateUser}
        />
      )}

      {currentView === 'PROMPT_MANAGER' && (
        <PromptManager 
            templates={promptTemplates}
            projects={projects}
            onUpdateTemplate={handleUpdateTemplate}
            user={user}
        />
      )}
      
      {currentView === 'PROJECT_DETAIL' && selectedProject && (
        <ProjectDetail 
          project={selectedProject}
          onBack={() => setView('DISPATCH')}
          onUpdateProject={handleUpdateProject}
          promptTemplates={promptTemplates}
          users={users} // Pass users for architect selection
          projects={projects} // Pass all projects context for AI recommendation logic
        />
      )}

      {/* Fallback if detail is active but no project selected */}
      {currentView === 'PROJECT_DETAIL' && !selectedProject && (
         <div className="text-center py-20">
            <p className="text-slate-400">未选择项目。请返回派单池选择。</p>
            <button 
                onClick={() => setView('DISPATCH')}
                className="mt-4 text-blue-600 font-medium hover:underline"
            >
                返回派单池
            </button>
         </div>
      )}
    </Layout>
  );
};

export default App;
