
import { GoogleGenAI, Type } from "@google/genai";
import { Project, LogEntry, User, UserPersona } from "../types";

// Initialize Gemini Client
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const generateProjectSummary = async (
  project: Project, 
  templateString: string,
  workflowContext: string
): Promise<string> => {
  if (!apiKey) return "API Key not configured. Unable to generate AI summary.";

  const historyText = project.history
    .slice(-10) 
    .map(h => `[${h.date}] ${h.type}: ${h.content}`)
    .join("\n");

  const prompt = templateString
    .replace('{{projectName}}', project.name)
    .replace('{{workflowContext}}', workflowContext)
    .replace('{{history}}', historyText);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI service.";
  }
};

export const checkDuplicateRisk = async (
    newProjectName: string, 
    existingProjects: Project[],
    templateString: string
): Promise<string | null> => {
    if (!apiKey) return null;

    const existingNames = existingProjects.map(p => p.name).join(", ");
    
    const prompt = templateString
        .replace('{{newProjectName}}', newProjectName)
        .replace('{{existingProjectNames}}', existingNames);

    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        const text = response.text?.trim();
        return text === "NO" ? null : text;
      } catch (error) {
        return null;
      }
};

export const generateDepartmentWorkflow = async (projects: Project[]): Promise<string> => {
    if (!apiKey) return "Error: API Key not found. Please configure it.";
    if (projects.length === 0) return "Error: No projects available to analyze.";

    const allData = projects.map(p => {
        return `
        Project: ${p.name} (${p.currentStage})
        Tags: ${p.tags.join(', ')}
        Created: ${p.createdAt}
        Key Activities:
        ${p.history.map(h => `- [${h.date}] ${h.type}: ${h.content}`).join('\n')}
        `;
    }).join('\n\n----------------\n\n');

    const prompt = `
    You are an expert Business Process Analyst. 
    I will provide you with the raw activity logs and details from multiple projects in a "Solution Architecture Department".
    
    Your goal is to analyze this data and reverse-engineer the "Department Work Profile".
    
    Please output a structured description (in Chinese) covering:
    1. **Core Responsibilities**: What does this team actually do based on the logs? (e.g., Blueprint design, Meeting clients, Coding?)
    2. **Standard Workflow Steps**: What seems to be the typical sequence of events? (e.g., Meeting -> Design -> Review -> Delivery)
    3. **Time Estimation**: Roughly how long do certain phases take based on the dates in the logs?
    4. **Common Deliverables**: What kind of files are usually outputted?
    
    This output will be used as a "System Prompt" to guide an AI in helping future project managers. It needs to be insightful about the *process*.

    Here is the raw project data:
    ${allData}
    `;

    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash', 
          contents: prompt,
        });
        return response.text || "Analysis failed to generate text.";
    } catch (error) {
        console.error("Workflow Analysis Error:", error);
        return "Error generating workflow analysis: " + (error instanceof Error ? error.message : String(error));
    }
};

// --- New Feature: User Persona Generation ---
export const generateUserPersona = async (
    user: User,
    projects: Project[],
    templateString: string,
    departmentContext: string
): Promise<UserPersona | null> => {
    if (!apiKey) return null;

    // 1. Collect all logs authored by this user
    const userLogs = projects.flatMap(p => 
        p.history
            .filter(log => log.author === user.name)
            .map(log => `[Project: ${p.name}] ${log.date} ${log.type}: ${log.content}`)
    ).join('\n');

    if (!userLogs) return null; // No history to analyze

    const prompt = templateString
        .replace('{{userName}}', user.name)
        .replace('{{departmentContext}}', departmentContext)
        .replace('{{userLogs}}', userLogs);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        historySummary: { type: Type.STRING },
                        domains: { type: Type.ARRAY, items: { type: Type.STRING } },
                        workStyle: { type: Type.STRING },
                        improvementAreas: { type: Type.STRING }
                    },
                    required: ["historySummary", "domains", "workStyle", "improvementAreas"]
                }
            }
        });

        const jsonStr = response.text?.trim();
        if (jsonStr) {
            return JSON.parse(jsonStr) as UserPersona;
        }
        return null;
    } catch (error) {
        console.error("Persona Generation Error:", error);
        return null;
    }
};

// --- New Feature: Architect Recommendation ---
export interface RecommendationResult {
    userId: string;
    totalScore: number;
    reason: string;
    details: {
        workloadScore: number; // Max 3
        aiScore: number; // Max 7
    }
}

export const recommendArchitect = async (
    newProject: Project,
    candidates: User[],
    allProjects: Project[],
    templateString: string
): Promise<RecommendationResult[]> => {
    if (!apiKey) return [];

    // 1. Calculate Workload Score (Deterministic) - Max 3 Points
    // Rule: Less work in last 10 days = higher score
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const dateStr = tenDaysAgo.toISOString().split('T')[0];

    const workloadScores: Record<string, number> = {};

    candidates.forEach(user => {
        const recentLogs = allProjects.flatMap(p => p.history)
            .filter(log => log.author === user.name && log.date >= dateStr);
        
        const count = recentLogs.length;
        // Simple heuristic: 0-1 items = 3pts, 2-4 items = 2pts, 5+ items = 1pt
        if (count <= 1) workloadScores[user.id] = 3;
        else if (count <= 4) workloadScores[user.id] = 2;
        else workloadScores[user.id] = 1;
    });

    // 2. Prepare Context for AI
    const candidatesContext = candidates.map(u => {
        return `
        User ID: ${u.id}
        Name: ${u.name}
        Title: ${u.title || 'Architect'}
        Workload Score (Calculated): ${workloadScores[u.id]}/3
        Persona Summary: ${u.persona?.historySummary || 'No persona data'}
        Persona Domains: ${u.persona?.domains?.join(', ') || 'N/A'}
        `;
    }).join('\n----------------\n');

    const prompt = templateString
        .replace('{{projectName}}', newProject.name)
        .replace('{{projectDesc}}', newProject.description)
        .replace('{{candidates}}', candidatesContext);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        const text = response.text?.trim();
        if (!text) return [];

        const aiResult = JSON.parse(text);
        // Expecting { recommendations: [{ userId, totalScore, reason }] }
        
        // Merge AI result (Total Score) with our details
        return aiResult.recommendations.map((rec: any) => ({
            userId: rec.userId,
            totalScore: rec.totalScore,
            reason: rec.reason,
            details: {
                workloadScore: workloadScores[rec.userId] || 0,
                aiScore: rec.totalScore - (workloadScores[rec.userId] || 0)
            }
        })).sort((a: RecommendationResult, b: RecommendationResult) => b.totalScore - a.totalScore);

    } catch (error) {
        console.error("Recommendation Error:", error);
        return [];
    }
};
