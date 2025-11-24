export enum ItemType {
  TEXT = 'TEXT',
  URL = 'URL',
}

export interface KnowledgeItem {
  id: string;
  type: ItemType;
  content: string; // The text or URL
  title: string;
  summary: string;
  tags: string[];
  category: string; // Used for color coding in visualizer
  createdAt: number;
  embeddingSim?: number[]; // Placeholder for vector similarity if we had it
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type ViewMode = 'orbit' | 'list' | 'chat' | 'add';
