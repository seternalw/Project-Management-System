
import { GoogleGenAI } from "@google/genai";
import { Project, LogEntry } from "../types";

// Initialize Gemini Client
// Note: In a real production app, calls should go through a backend to protect the API Key.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const generateProjectSummary = async (
  project: Project, 
  templateString: string,
  workflowContext: string
): Promise<string> => {
  if (!apiKey) return "API Key not configured. Unable to generate AI summary.";

  const historyText = project.history
    .slice(-10) // Analyze last 10 entries for context
    .map(h => `[${h.date}] ${h.type}: ${h.content}`)
    .join("\n");

  // Interpolate the template
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

    // 1. Aggregate all Data
    // We want to give the AI a bird's eye view of everything to find patterns.
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
}
