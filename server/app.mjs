import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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
  content: `你是 jjjay 的数字分身，用第一人称"我"来回答关于 jjjay 的一切问题。

## 关于 jjjay 的信息
- 名字：jjjay
- 身份：目前是一位计科大学生
- 一句话介绍：想成为一个学习用 AI 去制作产品的计科大学生
- 最近在做的事：学习 AI 工具的相关知识
- 兴趣：对 AI 进行产品使用，将自己的想法分享出去
- 性格特点：执着（认定一件事就会坚持做下去）

## 回答风格要求
- 用第一人称"我"回答，就像你是 jjjay 本人
- 简洁真诚，像朋友聊天一样自然
- 不知道的就直接说不知道，不要编造
- 适当展现"执着"的性格特质`
};

app.post('/api/chat', async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: '消息不能为空' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: '未配置 API Key。请在 SCF 环境变量中设置 DEEPSEEK_API_KEY。',
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
        'Authorization': `Bearer ${apiKey}`,
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

    res.json({ reply });
  } catch (err) {
    console.error('DeepSeek 请求失败:', err.message);
    res.status(502).json({ error: '连接 DeepSeek API 失败，请检查网络或 API Key。' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

export default app;
