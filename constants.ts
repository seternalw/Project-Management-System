
import { Project, ProjectStatus, ProjectStage, LogEntry, PromptTemplate } from './types';

export const BUSINESS_UNITS = [
  "Marketing & Service",
  "Metering & AMI",
  "Virtual Power Plant (VPP)",
  "Grid Dispatch",
  "Cyber Security"
];

export const DEFAULT_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'pt_summary',
    key: 'PROJECT_SUMMARY',
    name: '智能场景回溯 (AI Recall)',
    description: '用于生成项目详情页顶部的上下文快照，分析当前状态和下一步行动。',
    lastUpdated: new Date().toISOString().split('T')[0],
    template: `You are a senior assistant to a Power Industry Solution Architect Manager.
Review the following recent history logs for the project "{{projectName}}".

CONTEXT - DEPARTMENT WORKFLOW STANDARDS:
{{workflowContext}}

INSTRUCTIONS:
Generate a concise "Context Snapshot" (max 3 sentences).
1. Current State: What was the last major thing happening?
2. Blocker/Pending: Is there anything stuck?
3. Action: What is the likely next step based on the DEPARTMENT WORKFLOW STANDARDS provided above?

Use professional, technical tone suitable for utility sector. and you must use chinese to anwser.

History Logs:
{{history}}`
  },
  {
    id: 'pt_dup',
    key: 'DUPLICATE_CHECK',
    name: '项目重名/重复风险检测',
    description: '在派单池新建项目时，检测是否与已有项目重复。',
    lastUpdated: new Date().toISOString().split('T')[0],
    template: `I am adding a new project named "{{newProjectName}}".
Here is a list of existing projects: {{existingProjectNames}}.

Does this new project sound like a duplicate or a continuation of an existing one?
If yes, return a short warning message mentioning the similar project name.
If no, return "NO".`
  },
  {
    id: 'pt_workflow',
    key: 'WORKFLOW_CONTEXT',
    name: '部门工作职责与流程画像',
    description: '系统通过扫描所有项目历史自动生成的部门工作习惯描述。此内容将被注入到"AI Recall"中以提高建议的准确性。',
    lastUpdated: new Date().toISOString().split('T')[0],
    isSystemGenerated: true,
    template: `目前暂无生成的部门画像。请点击“全量扫描生成”按钮，让AI分析您的历史数据。

(默认占位符: 本部门主要负责电力行业解决方案设计。通常工作流程为：需求调研 -> 方案蓝图设计 -> 内部评审 -> 招投标 -> 交付实施。)`
  }
];

export const MOCK_LOGS: LogEntry[] = [
  {
    id: 'l1',
    date: '2023-10-15',
    author: 'Li Ming',
    content: 'Initial requirements meeting with State Grid client. Focus on high-concurrency data collection.',
    type: 'MEETING',
    attachments: []
  },
  {
    id: 'l2',
    date: '2023-11-02',
    author: 'Wang Lei',
    content: 'Submitted technical architecture blueprint v1.0. Pending security team review.',
    type: 'DELIVERABLE',
    attachments: [
        { id: 'f1', name: 'Architecture_Blueprint_v1.0.pdf', size: '2.4 MB', type: 'pdf' },
        { id: 'f2', name: 'Network_Topology.png', size: '1.1 MB', type: 'image' }
    ]
  },
  {
    id: 'l3',
    date: '2024-01-10',
    author: 'Li Ming',
    content: 'Project paused due to client budget reallocation for next fiscal year.',
    type: 'DECISION',
    attachments: []
  }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    code: 'SG-2023-088',
    name: 'Marketing 2.0 Data Middle Platform',
    businessUnit: 'Marketing & Service',
    manager: 'Zhang San',
    createdAt: '2023-05-12',
    lastActiveAt: '2024-05-20',
    status: ProjectStatus.IN_PROGRESS,
    currentStage: ProjectStage.IMPLEMENTATION,
    description: 'Upgrade of legacy marketing database to distributed architecture.',
    tags: ['Big Data', 'Oracle->MySQL'],
    history: [
        { 
            id: 'h1', 
            date: '2024-05-20', 
            author: 'Zhang San', 
            type: 'MEETING', 
            content: 'Weekly sync. Data migration 80% complete. Validating accuracy.',
            attachments: []
        },
        { 
            id: 'h2', 
            date: '2024-05-10', 
            author: 'Li Si', 
            type: 'DELIVERABLE', 
            content: 'Uploaded migration script v4.',
            attachments: [
                { id: 'f3', name: 'Migration_Script_v4.sql', size: '45 KB', type: 'code' }
            ]
        }
    ],
    aiSummary: 'Currently in late implementation phase. Data migration is 80% complete with validation ongoing. No critical blockers reported recently.'
  },
  {
    id: 'p2',
    code: 'VPP-PILOT-HZ',
    name: 'Hangzhou Virtual Power Plant Pilot',
    businessUnit: 'Virtual Power Plant (VPP)',
    manager: 'Li Ming',
    createdAt: '2023-10-01',
    lastActiveAt: '2024-01-10',
    status: ProjectStatus.PAUSED,
    currentStage: ProjectStage.BIDDING,
    description: 'Pilot project for aggregating industrial loads in Xiaoshan district.',
    tags: ['IoT', 'Demand Response'],
    history: MOCK_LOGS,
    aiSummary: 'Project paused since Jan 2024 due to client budget cycles. Last output was the Architecture Blueprint v1.0. Needs reactivating to check 2024 budget status.'
  }
];
