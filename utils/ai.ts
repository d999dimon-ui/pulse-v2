// AI API integration helper with language support

import { Language } from '@/utils/translations';

export interface AIRequest {
  prompt: string;
  language: Language;
  context?: Record<string, any>;
}

export async function callAI(request: AIRequest): Promise<string> {
  const { prompt, language, context } = request;

  // System instruction to respond in the user's language
  const systemPrompt = `You are a helpful assistant for a task management app. 
IMPORTANT: You MUST respond strictly in ${language === 'ru' ? 'Russian' : 'English'} language only.
Do not use any other language in your response.

Context: ${JSON.stringify(context || {})}`;

  try {
    // OpenRouter API call (in production, this would be server-side)
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://your-app.vercel.app',
        'X-Title': 'TaskHub Mini App',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error('AI API request failed');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('AI API Error:', error);
    throw error;
  }
}

// Helper for task description enhancement
export async function enhanceTaskDescription(
  description: string, 
  language: Language
): Promise<string> {
  const prompt = `Improve this task description to be clear and professional: "${description}"`;
  return callAI({ prompt, language });
}

// Helper for task categorization
export async function categorizeTask(
  title: string, 
  description: string,
  language: Language
): Promise<string> {
  const prompt = `Categorize this task into one of: delivery, cleaning, help, photo. 
  Title: "${title}"
  Description: "${description}"
  Respond with only the category name.`;
  
  return callAI({ prompt, language });
}
