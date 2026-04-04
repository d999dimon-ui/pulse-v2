// Force Majeure System - AI analyzes dispute and makes decision
import { supabase } from './supabase';

export interface ForceMajeureCase {
  id: string;
  taskId: string;
  reporterId: string;
  reason: string;
  evidence: string;
  status: 'pending' | 'ai_reviewing' | 'decided';
  aiDecision?: string;
  compensationHours?: number; // 30-144 hours (30h to 6d)
  createdAt: string;
  decidedAt?: string;
}

// Submit force majeure claim
export async function submitForceMajeure(
  taskId: string,
  userId: string,
  reason: string,
  evidence: string
): Promise<ForceMajeureCase | null> {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    const caseData: ForceMajeureCase = {
      id,
      taskId,
      reporterId: userId,
      reason,
      evidence,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await supabase.from('force_majeure_cases').insert(caseData);
    return caseData;
  } catch {
    return null;
  }
}

// AI analyzes the situation and makes a decision
export async function aiAnalyzeDispute(
  caseId: string,
  reason: string,
  evidence: string,
  language: 'en' | 'ru'
): Promise<{
  decision: string;
  compensationHours: number;
  reasoning: string;
}> {
  const prompt = language === 'ru'
    ? `Проанализируй форс-мажор. Причина: "${reason}". Доказательства: "${evidence}".
Вердикт: COMPENSATE или REJECT. Если COMPENSATE, укажи часы компенсации (30-144).
Ответь форматом: VERDICT|HOURS|REASONING. Максимум 1 предложение.`
    : `Analyze force majeure. Reason: "${reason}". Evidence: "${evidence}".
Verdict: COMPENSATE or REJECT. If COMPENSATE, state hours (30-144).
Reply format: VERDICT|HOURS|REASONING. Max 1 sentence.`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
        'X-Title': 'TaskHub Force Majeure',
      },
      body: JSON.stringify({
        model: 'google/gemma-3-1b-it:free',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 100,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content?.trim() || '';
      const [verdict, hours, reasoning] = reply.split('|').map(s => s.trim());

      const compensationHours = verdict === 'COMPENSATE'
        ? Math.min(144, Math.max(30, parseInt(hours) || 30))
        : 0;

      // Update case
      await supabase
        .from('force_majeure_cases')
        .update({
          status: 'decided',
          ai_decision: reasoning,
          compensation_hours: compensationHours,
          decided_at: new Date().toISOString(),
        })
        .eq('id', caseId);

      return {
        decision: verdict === 'COMPENSATE' ? 'approved' : 'rejected',
        compensationHours,
        reasoning: reasoning || (language === 'ru' ? 'Нет достаточных доказательств' : 'Insufficient evidence'),
      };
    }
  } catch { /* ignore */ }

  // Fallback: auto-approve with minimum compensation
  return {
    decision: 'approved',
    compensationHours: 30,
    reasoning: language === 'ru' ? 'Автоматическое решение AI' : 'AI auto-decision',
  };
}

// Generate promo code for compensation
export async function generateCompensationPromo(
  userId: string,
  hours: number
): Promise<string> {
  const code = `FM-${userId.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  await supabase.from('promo_codes').insert({
    id: code,
    type: 'no_commission',
    created_by: userId,
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    is_used: false,
    created_at: new Date().toISOString(),
  });

  return code;
}
