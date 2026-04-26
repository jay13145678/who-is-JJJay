import { checkRateLimit } from './rate-limiter.mjs';

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

function parseBody(event) {
  if (!event.body) return null;
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf-8')
    : event.body;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function jsonResponse(status, data) {
  return {
    isBase64Encoded: false,
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify(data),
  };
}

function errorResponse(status, message) {
  return jsonResponse(status, { error: message });
}

async function handleHealth() {
  return jsonResponse(200, { status: 'ok', api: !!process.env.DEEPSEEK_API_KEY });
}

async function handleChat(event) {
  // 限流检查
  const ip = (event.headers?.['x-forwarded-for'] || event.headers?.['X-Forwarded-For'] || '').split(',')[0]?.trim() || 'unknown';
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return errorResponse(429, `请求过于频繁，请 ${limit.retryAfter} 秒后再试`);
  }

  const body = parseBody(event);
  if (!body || !body.message || !body.message.trim()) {
    return errorResponse(400, '消息不能为空');
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return errorResponse(500, '未配置 API Key。请在环境变量中设置 DEEPSEEK_API_KEY。');
  }

  const model = process.env.LLM_MODEL || 'deepseek-chat';
  const { message, history = [] } = body;

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
      return errorResponse(502, `上游 API 错误: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '抱歉，我没有理解这个问题。';
    return jsonResponse(200, { reply });
  } catch (err) {
    console.error('DeepSeek 请求失败:', err.message);
    return errorResponse(502, '连接 DeepSeek API 失败，请检查网络或 API Key。');
  }
}

export async function main_handler(event) {
  const pathname = event.path || '/';
  const method = (event.httpMethod || 'GET').toUpperCase();

  if (method === 'OPTIONS') {
    return {
      isBase64Encoded: false,
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    };
  }

  if (pathname === '/api/health' && method === 'GET') {
    return handleHealth();
  }

  if (pathname === '/api/chat' && method === 'POST') {
    return handleChat(event);
  }

  return errorResponse(404, 'Not Found');
}
