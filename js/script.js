/* ========================================
   数字分身 · 聊天引擎
   模式：API 优先 → 本地兜底
   ======================================== */

// ---------- 本地兜底知识库 ----------
const knowledge = {
  identity: '目前是一位大学生',
  doing: '学习 AI 工具的相关知识',
  focus: '如何获取更多关于 AI 的知识，以及怎样去利用 AI',
  interests: ['AI 产品使用', '把自己的想法分享出去'],
  personality: '执着',
};

const qa = {
  '你在做什么': '我最近在系统学习各种 AI 工具的使用方法，从 ChatGPT、Claude 这类对话模型，到 Midjourney、Stable Diffusion 等生成式工具。我想先理解它们能做什么，再思考怎么用它们做出真正的产品。',
  '正在做什么': '我最近在系统学习各种 AI 工具的使用方法，从 ChatGPT、Claude 这类对话模型，到 Midjourney、Stable Diffusion 等生成式工具。我想先理解它们能做什么，再思考怎么用它们做出真正的产品。',
  '为什么想做这些': '因为我觉得 AI 正在重新定义"产品"这个词。以前做一个产品需要会写代码、会设计、会运营，现在 AI 大幅降低了这些门槛。我是一个计科专业的学生，天然有技术底子，加上我对产品有兴趣，想趁这个窗口期把自己的想法变成真实的东西。',
  '为什么有这样的想法': '因为我观察到 AI 工具正在快速改变各行各业的做事方式。与其被动地被改变，不如主动去学习和使用它们。我是一个比较执着的人——认定了一件事就想做到最好，这个个人主页就是我迈出的第一步。',
  '你是谁': '我是 jjjay 的数字分身！我的本体是一位名叫 jjjay 的计科大学生。他正在努力学习用 AI 制作产品，性格关键词是"执着"。有什么关于他的问题都可以问我～',
  '你好': '你好呀！我是 jjjay 的数字分身，欢迎来聊～ 你可以问我关于 jjjay 的任何问题，比如"你在做什么"或者"你的兴趣是什么"。',
  '兴趣': 'jjjay 的兴趣主要是 AI 产品使用和把自己的想法分享出去。他不是一个只停留在理论的人，更想动手实践、做出来给别人看。',
  '特点': '说到 jjjay 的特点，最值得一提的就是"执着"了。他认定了一件事就会坚持做下去，这也是为什么他会开始做这个个人主页。',
  '执着': '对，执着是 jjjay 的一个标签。他做事不容易半途而废，这也是他能在学习 AI 的路上一直走下去的重要原因。',
  '帮助': '当然可以！你可以问我：\n1. jjjay 最近在做什么？\n2. 他为什么想做这些作品？\n3. 他有什么样的想法？\n4. 他的兴趣和特点是什么？\n试试看吧～',
};

function findLocalAnswer(input) {
  const text = input.trim();
  if (!text) return null;

  for (const [key, answer] of Object.entries(qa)) {
    if (text.includes(key)) return answer;
  }

  if (/为什么/.test(text) && /作品|这个|这些/.test(text)) return qa['为什么想做这些'];
  if (/正在|最近|现在/.test(text) && /做|干|忙/.test(text)) return qa['正在做什么'];
  if (/什么样|什么想法|为什么/.test(text) && /想法|想|念头/.test(text)) return qa['为什么有这样的想法'];
  if (/擅长|方向|关心/.test(text)) return `jjjay 最关心的方向是：${knowledge.focus}。他一直在探索怎么把 AI 真正用起来，而不是停留在刷新闻的阶段。`;
  if (/职业|身份|学生|大学/.test(text)) return `jjjay 目前${knowledge.identity}，在读计科专业。`;

  return null;
}

function getFallback() {
  const f = [
    '这个问题很有意思，不过我暂时还不知道怎么回答。你可以换个方式问我，比如"你在做什么？"或"你的兴趣是什么？"',
    '嗯… 我还在学习中。不如试试问："你为什么想做这些？"',
    '抱歉，这个问题超出了我的知识范围。你可以问我关于 jjjay 在做的事、兴趣、或者他的特点。',
  ];
  return f[Math.floor(Math.random() * f.length)];
}

// ---------- API 地址配置 ----------
const API_BASE = window.API_URL || '';

let messageHistory = [];

async function callAPI(message) {
  const res = await fetch(API_BASE + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history: messageHistory }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  return data.reply;
}

// ---------- 渲染 ----------
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');

function addMessage(text, type) {
  const div = document.createElement('div');
  div.className = `msg msg-${type}`;

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = type === 'bot' ? 'J' : 'U';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = text.replace(/\n/g, '<br>');

  div.appendChild(avatar);
  div.appendChild(bubble);
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addTypingIndicator() {
  const div = document.createElement('div');
  div.className = 'msg msg-bot';
  div.id = 'typingIndicator';
  div.innerHTML = `<div class="msg-avatar">J</div><div class="msg-bubble" style="color:#B0ACA7;">正在输入…</div>`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

async function handleSend() {
  const text = chatInput.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  chatInput.value = '';
  chatInput.focus();

  addTypingIndicator();

  try {
    const reply = await callAPI(text);
    removeTypingIndicator();
    addMessage(reply, 'bot');
    messageHistory.push({ role: 'user', content: text });
    messageHistory.push({ role: 'assistant', content: reply });
  } catch {
    // API 不可用 → 本地兜底
    removeTypingIndicator();
    await new Promise(r => setTimeout(r, 400 + Math.random() * 400));
    const reply = findLocalAnswer(text) || getFallback();
    addMessage(reply, 'bot');
  }
}

// ---------- ABOUT 卡片点击 ----------
document.querySelectorAll('.about-card').forEach(card => {
  card.addEventListener('click', () => {
    const q = card.dataset.question;
    if (!q) return;
    chatInput.value = q;
    handleSend();
    document.getElementById('chat').scrollIntoView({ behavior: 'smooth' });
  });
});

// ---------- 快捷提问 ----------
document.querySelectorAll('.suggestion').forEach(btn => {
  btn.addEventListener('click', () => {
    chatInput.value = btn.dataset.text;
    handleSend();
  });
});

// ---------- 事件绑定 ----------
chatSend.addEventListener('click', handleSend);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSend();
});

// ---------- 启动时检测后端连接 ----------
const statusDot = document.getElementById('statusDot');
const chatStatus = document.getElementById('chatStatus');

(async function checkBackend() {
  try {
    const res = await fetch(API_BASE + '/api/health', { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    if (data.api) {
      chatStatus.textContent = '已连接';
      statusDot.style.background = '#4CAF50';
    } else {
      chatStatus.textContent = '未配置 API';
      statusDot.style.background = '#FF9800';
    }
  } catch {
    chatStatus.textContent = '本地模式';
    statusDot.style.background = '#B0ACA7';
  }
})();

