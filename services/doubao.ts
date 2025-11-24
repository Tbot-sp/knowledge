import { KnowledgeItem } from "../types";

const apiKey = '7d056446-7f16-4a89-a5e6-c81a2e286c15';
const model = 'doubao-lite-32k-character-250228';
const endpoint = import.meta.env.MODE === 'development' ? '/doubao/chat/completions' : 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

const cleanJson = (text: string) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

const postChat = async (messages: any[], opts?: { temperature?: number; max_tokens?: number }) => {
  if (!apiKey) throw new Error('API Key missing');
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: opts?.temperature ?? 0.7,
      max_tokens: opts?.max_tokens ?? 1024,
      })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Doubao API error ${res.status}: ${text}`);
  }
  return res.json();
};

export const analyzeContent = async (content: string, type: 'TEXT' | 'URL'): Promise<{ title: string; summary: string; tags: string[]; category: string }> => {
  try {
    const result = await postChat([
      { role: 'system', content: 'You are a Knowledge Manager. Always reply with a single JSON object with keys: title, summary, tags (array), category.' },
      { role: 'user', content: `Analyze the following ${type} and return JSON only.\nContent:\n"${content.substring(0, 5000)}"` }
    ], { temperature: 0.2, max_tokens: 600 });

    const raw = result?.choices?.[0]?.message?.content ?? '';
    const text = cleanJson(String(raw));
    const parsed = JSON.parse(text);
    return {
      title: parsed.title,
      summary: parsed.summary,
      tags: parsed.tags,
      category: parsed.category,
    };
  } catch (error) {
    console.error('Doubao Analysis Error:', error);
    return {
      title: 'Untitled Knowledge',
      summary: 'Could not analyze content automatically.',
      tags: ['misc'],
      category: 'Uncategorized'
    };
  }
};

export const answerQuestion = async (question: string, contextItems: KnowledgeItem[]): Promise<string> => {
  try {
    const contextString = contextItems.map(item => `
      [Title: ${item.title}]
      [Category: ${item.category}]
      [Summary: ${item.summary}]
      [Content Snippet: ${item.content.substring(0, 300)}...]
    `).join('\n---\n');

    const result = await postChat([
      { role: 'system', content: 'You are a personal knowledge assistant named "Orbit". Prefer using the provided context. If not found, you may use general knowledge and state that it was not in the notes.' },
      { role: 'user', content: `Context:\n${contextString}\n\nQuestion:\n${question}` }
    ], { temperature: 0.7, max_tokens: 800 });

    return result?.choices?.[0]?.message?.content ?? "I couldn't generate an answer.";
  } catch (error) {
    console.error('Doubao Q&A Error:', error);
    if (!apiKey) return 'Please configure your Doubao API Key.';
    return 'Sorry, I encountered an error while processing your question.';
  }
};
