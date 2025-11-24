import { GoogleGenAI, Type, Schema } from "@google/genai";
import { KnowledgeItem } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to sanitize JSON string if the model returns markdown code blocks
const cleanJson = (text: string) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const analyzeContent = async (content: string, type: 'TEXT' | 'URL'): Promise<{ title: string; summary: string; tags: string[]; category: string }> => {
  if (!apiKey) {
    throw new Error("API Key missing");
  }

  const prompt = `
    You are a Knowledge Manager. Analyze the following content (which is a ${type}).
    1. Generate a short, concise title (max 6 words).
    2. Write a 2-sentence summary of the key insights.
    3. Extract 3-5 relevant tags (lowercase, single words).
    4. Assign a broad category (e.g., "Technology", "Science", "Health", "Philosophy", "Art", "Productivity").
    
    Content:
    "${content.substring(0, 5000)}" 
  `;

  // We use a structured schema to ensure valid JSON output
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      summary: { type: Type.STRING },
      tags: { type: Type.ARRAY, items: { type: Type.STRING } },
      category: { type: Type.STRING },
    },
    required: ["title", "summary", "tags", "category"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback if AI fails
    return {
      title: "Untitled Knowledge",
      summary: "Could not analyze content automatically.",
      tags: ["misc"],
      category: "Uncategorized"
    };
  }
};

export const answerQuestion = async (question: string, contextItems: KnowledgeItem[]): Promise<string> => {
  if (!apiKey) return "Please configure your API Key.";

  // Simple simulated RAG: We assume the caller has already filtered 'contextItems' to be somewhat relevant,
  // or we pass the most recent/important ones if the list is small.
  // Ideally, we would use embeddings, but for a frontend demo, we pass text context.
  
  const contextString = contextItems.map(item => `
    [Title: ${item.title}]
    [Category: ${item.category}]
    [Summary: ${item.summary}]
    [Content Snippet: ${item.content.substring(0, 300)}...]
  `).join('\n---\n');

  const prompt = `
    You are a personal knowledge assistant named "Orbit".
    Use the following context from the user's personal knowledge base to answer their question.
    If the answer is not in the context, use your general knowledge but mention that it wasn't explicitly found in their notes.
    Keep the answer concise and helpful.

    Context:
    ${contextString}

    User Question:
    ${question}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "I couldn't generate an answer.";
  } catch (error) {
    console.error("Gemini Q&A Error:", error);
    return "Sorry, I encountered an error while processing your question.";
  }
};
