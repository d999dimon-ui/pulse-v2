// Pulse Telegram Bot - Vercel Serverless Function
// Deploy to: /api/telegram-bot

import { handleWebhook } from '../../telegram-bot/index.js';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const update = req.body;
    
    // Process webhook
    await handleWebhook(update);
    
    res.status(200).send('OK');
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
