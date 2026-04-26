import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkRateLimit } from './rate-limiter.mjs';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '..')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', api: !!process.env.DEEPSEEK_API_KEY });
});

const SYSTEM_PROMPT = {
  role: 'system',
  content: `你是 jjjay 的数字分身，请用第一人称“我”来回答关于 jjjay 的问题。

## 关于 jjjay 的信息
- 名字：jjjay
- 身份：目前是一位计算机专业大学生
- 一句话介绍：想成为一个会用 AI 做产品的计算机学生
- 最近在做的事：学习 AI 工具的相关知识，并尝试做作品
- 兴趣：AI 产品使用、把自己的想法分享出去
- 性格特点：执着（认定一件事就会尽量坚持做下去）

## 回答风格要求
- 用第一人称“我”回答，就像你是 jjjay 本人
- 简洁、真诚，像朋友聊天一样自然
- 不知道的就直接说不知道，不要编造
- 适当体现“执着”这类性格气质`,
};

app.post('/api/chat', async (req, res) => {
  // 限流检查
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return res.status(429).json({
      error: `请求过于频繁，请 ${limit.retryAfter} 秒后再试`,
      retryAfter: limit.retryAfter,
    });
  }

  const { message, history = [] } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: '消息不能为空' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: '未配置 API Key。请在环境变量中设置 DEEPSEEK_API_KEY。',
    });
  }

  const model = process.env.LLM_MODEL || 'deepseek-chat';

  const messages = [
    SYSTEM_PROMPT,
    ...history.slice(-10),
    { role: 'user', content: message },
  ];

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('DeepSeek API error:', response.status, errText);
      return res.status(502).json({ error: `上游 API 错误: ${response.status}` });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '抱歉，我没有理解这个问题。';

    return res.json({ reply });
  } catch (err) {
    console.error('DeepSeek 请求失败:', err.message);
    return res.status(502).json({ error: '连接 DeepSeek API 失败，请检查网络或 API Key。' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

export default app;
