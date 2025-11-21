
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DispatchPool from './pages/DispatchPool';
import ProjectDetail from './pages/ProjectDetail';
import WeeklyReport from './pages/WeeklyReport';
import PromptManager from './pages/PromptManager';
import { Project, ViewMode, PromptTemplate } from './types';
import { MOCK_PROJECTS, DEFAULT_PROMPT_TEMPLATES } from './constants';

const App: React.FC = () => {
  const [currentView, setView] = useState<ViewMode>('DASHBOARD');
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>(DEFAULT_PROMPT_TEMPLATES);

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

  return (
    <Layout currentView={currentView} setView={setView}>
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

      {currentView === 'PROMPT_MANAGER' && (
        <PromptManager 
            templates={promptTemplates}
            projects={projects}
            onUpdateTemplate={handleUpdateTemplate}
        />
      )}
      
      {currentView === 'PROJECT_DETAIL' && selectedProject && (
        <ProjectDetail 
          project={selectedProject}
          onBack={() => setView('DISPATCH')}
          onUpdateProject={handleUpdateProject}
          promptTemplates={promptTemplates}
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
