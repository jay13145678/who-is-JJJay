/* ========================================
   数字分身 · 聊天引擎
   模式：API 优先 -> 本地兜底
   ======================================== */

// ---------- 本地兜底知识库 ----------
const knowledge = {
  identity: '目前是一位计算机专业的大学生',
  doing: '在学习使用 Claude 和 Cursor 做项目，最近就在完成这个个人主页',
  focus: '把 AI 工具学透彻，并用它们做出真正能用的产品',
  interests: ['用 AI 工具把想法做成产品'],
  personality: '执着，认定一件事就要学透彻',
};

const qa = {
  '你在做什么': '我最近在持续学习 Claude 和 Cursor 这些 AI 工具，一边学一边做。这个个人主页就是最近的成果，从设计到实现基本都是用 AI 工具辅助完成的。我想先把完整流程跑通，再去做更复杂的产品。',
  '你最近在做什么': '我最近在持续学习 Claude 和 Cursor 这些 AI 工具，一边学一边做。这个个人主页就是最近的成果，从设计到实现基本都是用 AI 工具辅助完成的。我想先把完整流程跑通，再去做更复杂的产品。',
  '你为什么想做这些': '因为我觉得 AI 正在重新定义”做产品”这件事。以前做一个产品需要会写代码、会设计、会运营，现在 AI 大幅降低了很多门槛。我本身是计算机专业学生，也对产品很感兴趣，所以想趁这个阶段把自己的想法变成真实的东西。',
  '你为什么会有这样的想法': '因为我观察到 AI 工具正在快速改变很多行业的做事方式。与其被动地被改变，不如主动去学习和使用它们。我是一个比较执着的人，认定一件事就想尽量做好，这个个人主页就是我迈出的第一步。',
  '你是谁': '我是 jjjay 的数字分身。我的本体是一位叫 jjjay 的计算机大学生，他正在学习用 AI 工具把想法做成产品。性格关键词是”执着”，学东西喜欢学透彻。有关于他的事情都可以来问我。',
  '你好': '你好，我是 jjjay 的数字分身，欢迎来聊天。你可以问我关于 jjjay 的近况、兴趣、想法，或者他为什么在做这些东西。',
  '兴趣': 'jjjay 的兴趣是用 AI 工具把自己的想法落地成产品。他不喜欢只停留在理论和新鲜感层面，而是更想动手做出来。最近他在深入学 Claude 和 Cursor，想把这两个工具吃透。',
  '特点': 'jjjay 最明显的特点是”执着”——不是那种喊口号的执着，而是具体到学一个工具就一定要学透彻，不会用个皮毛就切换到下一个。他做这个个人主页也是一样，从布局到交互都在反复打磨。',
  '执着': '对，执着是 jjjay 的一个真实标签。他学 AI 工具不会止步于”知道怎么用”，而是想理解透，所以在 Claude、Cursor 这些工具上都花了不少时间深入。这种性格也让他在做东西时更愿意打磨细节。',
  '帮助': '当然可以。你可以问我：\n1. jjjay 最近在做什么？\n2. 他为什么想做这些作品？\n3. 他的兴趣是什么？\n4. 他有什么特点？',
};

function findLocalAnswer(input) {
  const text = input.trim();
  if (!text) return null;

  for (const [key, answer] of Object.entries(qa)) {
    if (text.includes(key)) return answer;
  }

  if (/为什么/.test(text) && /作品|这个|这些/.test(text)) return qa['你为什么想做这些'];
  if (/(最近|现在|正在)/.test(text) && /做什么/.test(text)) return qa['你最近在做什么'];
  if (/(什么想法|为什么会有这样的想法|怎么想的)/.test(text)) return qa['你为什么会有这样的想法'];
  if (/(擅长|方向|关心)/.test(text)) {
    return `jjjay 现在最关心的方向是：${knowledge.focus}。他一直在探索怎么把 AI 真正用起来，而不只是停留在新鲜感阶段。`;
  }
  if (/(职业|身份|学生|大学)/.test(text)) {
    return `jjjay ${knowledge.identity}。`;
  }

  return null;
}

function getFallback() {
  const fallback = [
    '这个问题很有意思，不过我暂时还不知道怎么回答。你可以换个方式问我，比如“你最近在做什么？”或者“你的兴趣是什么？”',
    '我还在学习中，不如试试问我：“你为什么想做这些作品？”',
    '抱歉，这个问题超出了我目前的知识范围。你可以问我关于 jjjay 在做的事、兴趣，或者他的特点。',
  ];
  return fallback[Math.floor(Math.random() * fallback.length)];
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
  div.innerHTML = '<div class="msg-avatar">J</div><div class="msg-bubble" style="color:#B0ACA7;">正在输入...</div>';
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
    removeTypingIndicator();
    await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 400));
    const reply = findLocalAnswer(text) || getFallback();
    addMessage(reply, 'bot');
  }
}

// ---------- ABOUT 卡片点击 ----------
document.querySelectorAll('.about-card').forEach((card) => {
  card.addEventListener('click', () => {
    const q = card.dataset.question;
    if (!q) return;
    chatInput.value = q;
    handleSend();
    document.getElementById('chat').scrollIntoView({ behavior: 'smooth' });
  });
});

// ---------- 快捷提问 ----------
document.querySelectorAll('.suggestion').forEach((btn) => {
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

// ---------- 分区显隐 ----------
(function revealSections() {
  const sections = document.querySelectorAll('.about, .chat, .works');

  if (!sections.length) return;

  if (!('IntersectionObserver' in window)) {
    sections.forEach((section) => section.classList.add('section-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('section-visible');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px',
    }
  );

  sections.forEach((section) => observer.observe(section));
})();

// ---------- 导航滚动监听 ----------
(function scrollSpy() {
  const sections = document.querySelectorAll('#hero, #about, #works, #chat');
  const links = document.querySelectorAll('.nav-link');

  function update() {
    const scrollY = window.scrollY + 80;
    let current = '';

    sections.forEach((section) => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      if (scrollY >= top && scrollY < bottom) current = section.id;
    });

    links.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
      ticking = true;
    }
  });

  update();
})();
