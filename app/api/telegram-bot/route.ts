// Pulse Telegram Bot - Vercel Serverless Function (App Router)
import { handleWebhook } from '../../../telegram-bot/index.js';

export async function POST(req: Request) {
  const body = await req.json();
  await handleWebhook(body);
  return new Response('OK', { status: 200 });
}
