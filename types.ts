
export enum ProjectStatus {
  NEW = 'NEW',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED', // Crucial for intermittent projects
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

export enum ProjectStage {
  OPPORTUNITY = 'Opportunity/Presales',
  BLUEPRINT = 'Blueprint Design',
  BIDDING = 'Bidding/Tender',
  IMPLEMENTATION = 'Implementation/Delivery',
  MAINTENANCE = 'Maintenance/Optimization'
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string; // e.g., 'pdf', 'docx', 'image'
  url?: string; // In real app, this is the download link
}

export interface LogEntry {
  id: string;
  date: string;
  author: string;
  content: string;
  type: 'MEETING' | 'DELIVERABLE' | 'DECISION' | 'NOTE';
  tags?: string[];
  attachments?: Attachment[];
}

export interface Project {
  id: string;
  code: string;
  name: string;
  businessUnit: string; // e.g., "Marketing", "Metering"
  manager: string;
  architectId?: string; // New: Designated Technical Architect
  createdAt: string;
  lastActiveAt: string;
  status: ProjectStatus;
  currentStage: ProjectStage;
  description: string;
  tags: string[];
  history: LogEntry[];
  aiSummary?: string; // The "Context Snapshot"
}

export interface PromptTemplate {
  id: string;
  key: 'PROJECT_SUMMARY' | 'DUPLICATE_CHECK' | 'WORKFLOW_CONTEXT' | 'ARCHITECT_RECOMMENDATION' | 'USER_PERSONA';
  name: string;
  description: string;
  template: string;
  lastUpdated: string;
  isSystemGenerated?: boolean;
}

export type ViewMode = 'DASHBOARD' | 'DISPATCH' | 'PROJECT_DETAIL' | 'WEEKLY_REPORT' | 'PROMPT_MANAGER' | 'USER_MANAGEMENT';

export type UserRole = 'ADMIN' | 'MANAGER' | 'ARCHITECT';

export interface UserPersona {
  historySummary: string; // 历史项目支持情况
  domains: string[]; // 擅长的项目领域
  workStyle: string; // 擅长的工作方式
  improvementAreas: string; // 待加强的能力 (根据部门职责分析)
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  // New fields
  title?: string; // 职级
  joinDate?: string; // 入职时间
  persona?: UserPersona; // AI 画像
  lastPersonaUpdate?: string; // 上次画像更新时间
}
