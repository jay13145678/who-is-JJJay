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
  div.innerHTML = '<div class="msg-avatar">J</div><div class="msg-bubble typing-dots"><span></span><span></span><span></span></div>';
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

async function handleSend() {
  const text = chatInput.value.trim();
  if (!text || chatSend.disabled) return;

  chatSend.disabled = true;
  chatSend.textContent = '发送中';

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

  chatSend.disabled = false;
  chatSend.textContent = '发送';
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

// ---------- Works: 跳转确认 ----------
function openRepoConfirm(url) {
  // 创建遮罩
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.display = 'flex';

  const box = document.createElement('div');
  box.className = 'modal';
  box.style.maxWidth = '380px';
  box.innerHTML = `
    <div class="modal-header" style="border-bottom-color:var(--cobalt);">
      <span>跳转确认</span>
    </div>
    <div class="modal-body" style="padding:1.5rem 1.2rem;text-align:center;">
      <p style="font-size:0.9rem;color:#5A5A5A;line-height:1.7;margin-bottom:0.3rem;">
        即将跳转到 GitHub 查看项目源码
      </p>
      <p style="font-size:0.78rem;color:#B0ACA7;">是否继续？</p>
    </div>
    <div class="modal-footer" style="justify-content:center;gap:0.8rem;">
      <button class="modal-btn modal-btn-cancel" id="confirmCancel" style="min-width:80px;">取消</button>
      <button class="modal-btn modal-btn-confirm" id="confirmOk" style="min-width:80px;" autofocus>继续</button>
    </div>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  const close = () => overlay.remove();

  document.getElementById('confirmCancel').addEventListener('click', close);
  document.getElementById('confirmOk').addEventListener('click', () => {
    close();
    window.open(url, '_blank');
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
}

// ---------- Works: 首张卡片交互 ----------
(function setupFirstCard() {
  const card = document.getElementById('worksCardFirst');
  if (!card) return;

  // 点击跳转 GitHub 仓库
  card.style.cursor = 'pointer';
  card.addEventListener('click', (e) => {
    if (e.target.closest('.works-card-delete')) return;
    openRepoConfirm('https://github.com/jay13145678/who-is-JJJay');
  });

  // 状态切换
  const statusEl = card.querySelector('.works-card-status');
  const firstStatusKey = 'jjjay_first_status';
  const savedStatus = localStorage.getItem(firstStatusKey) || '进行中';
  const statusMap = {
    '进行中': { cls: 'status-active', label: '进行中' },
    '已完成': { cls: 'status-completed', label: '已完成' },
    '规划中': { cls: 'status-planned', label: '规划中' },
  };
  const applyStatus = (label) => {
    const s = statusMap[label] || statusMap['进行中'];
    statusEl.className = `works-card-status ${s.cls}`;
    statusEl.textContent = s.label;
  };
  applyStatus(savedStatus);
  const cycle = ['进行中', '已完成', '规划中'];
  statusEl.addEventListener('click', (e) => {
    e.stopPropagation();
    const cur = statusEl.textContent;
    const next = cycle[(cycle.indexOf(cur) + 1) % cycle.length];
    applyStatus(next);
    localStorage.setItem(firstStatusKey, next);
  });

  // 删除
  const delBtn = card.querySelector('.works-card-delete');
  if (delBtn) {
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      card.remove();
    });
  }
})();

// ---------- Works: GitHub 项目导入 ----------
const GITHUB_USER = 'jay13145678';
const STORAGE_KEY = 'jjjay_works';
const worksGrid = document.getElementById('worksGrid');

// 初始化示例数据
(function seedWorks() {
  const cs2 = {
    id: 'cs-message-seed',
    title: 'CS2 比赛日报自动化',
    description: '用 Playwright 爬取 5eplay 赛事数据，自动筛选一线赛事和热门战队比赛结果，通过 QQ 邮箱 SMTP 推送日报。覆盖 IEM、BLAST、Major、ESL Pro League 等顶级赛事。',
    tags: ['Node.js', 'Python', 'Playwright'],
    url: 'https://github.com/jay13145678/CS-message',
    status: '已完成',
  };
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const repos = saved ? JSON.parse(saved) : [];
    const hasIt = repos.some(r => r.title === cs2.title || r.id === cs2.id);
    if (!hasIt && repos.length < 5) {
      repos.push(cs2);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(repos));
    }
  } catch { /* ignore */ }
})();
const worksAddBtn = document.getElementById('worksAddBtn');
const repoModal = document.getElementById('repoModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');
const modalCancel = document.getElementById('modalCancel');
const modalConfirm = document.getElementById('modalConfirm');

let selectedRepos = new Map();

// 页面加载时从 localStorage 恢复
(function loadWorksFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const repos = JSON.parse(saved);
    if (!repos.length) return;
    renderWorksCards(repos);
  } catch { /* ignore */ }
})();

function saveWorksToStorage(repos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(repos));
}

function renderWorksCards(repos) {
  // 保留第 01 号卡片（个人主页），清除之后的所有卡片
  while (worksGrid.children.length > 1) {
    worksGrid.removeChild(worksGrid.lastChild);
  }

  repos.forEach((repo, i) => {
    const num = i + 2; // 从 02 开始编号
    const card = document.createElement('div');
    card.className = 'works-card';
    card.dataset.repoId = repo.id || `repo-${i}`;
    const statusMap = {
      '进行中': { cls: 'status-active', label: '进行中' },
      '已完成': { cls: 'status-completed', label: '已完成' },
      '规划中': { cls: 'status-planned', label: '规划中' },
    };
    const cur = statusMap[repo.status] || statusMap['已完成'];
    card.innerHTML = `
      <div class="works-card-header">
        <span class="works-card-number">${String(num).padStart(2, '0')}</span>
        <span class="works-card-status ${cur.cls}" data-status="${cur.label}">${cur.label}</span>
      </div>
      <h4 class="works-card-title">${escapeHtml(repo.title)}</h4>
      <p class="works-card-desc">${escapeHtml(repo.description || '暂无描述')}</p>
      <div class="works-card-tags">
        ${repo.tags.map(t => `<span class="works-tag">${escapeHtml(t)}</span>`).join('')}
      </div>
      <button class="works-card-delete" title="删除该项目">删除</button>
    `;
    // 删除按钮
    const delBtn = card.querySelector('.works-card-delete');
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const idx = saved.findIndex(r => r.id === repo.id);
      if (idx !== -1) saved.splice(idx, 1);
      saveWorksToStorage(saved);
      renderWorksCards(saved);
    });
    // 状态切换
    const statusEl = card.querySelector('.works-card-status');
    const cycle = ['进行中', '已完成', '规划中'];
    statusEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const curIdx = cycle.indexOf(repo.status || '已完成');
      const next = cycle[(curIdx + 1) % cycle.length];
      repo.status = next;
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const match = saved.find(r => r.id === repo.id);
      if (match) match.status = next;
      saveWorksToStorage(saved);
      renderWorksCards(saved);
    });

    // 点击跳转到 GitHub
    if (repo.url) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        if (e.target.closest('.works-card-delete')) return;
        openRepoConfirm(repo.url);
      });
    }
    worksGrid.appendChild(card);
  });

  // 补 placeholder 到至少 3 张
  fillPlaceholders(repos.length + 1);
}

function fillPlaceholders(existingCount) {
  const placeholders = worksGrid.querySelectorAll('.works-card-placeholder');
  const total = existingCount + placeholders.length;
  // 如果总数 < 3，补 placeholder
  for (let i = total; i < 3; i++) {
    const num = i + 1;
    const card = document.createElement('div');
    card.className = 'works-card works-card-placeholder';
    card.innerHTML = `
      <div class="works-card-header">
        <span class="works-card-number">${String(num).padStart(2, '0')}</span>
        <span class="works-card-status status-planned">规划中</span>
      </div>
      <h4 class="works-card-title">更多作品</h4>
      <p class="works-card-desc">持续更新中，后面会把更多尝试和成品慢慢补进来。</p>
      <div class="works-card-tags">
        <span class="works-tag">待定</span>
      </div>
    `;
    worksGrid.appendChild(card);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---- modal ----
worksAddBtn.addEventListener('click', openRepoModal);

modalClose.addEventListener('click', closeRepoModal);
modalCancel.addEventListener('click', closeRepoModal);
repoModal.addEventListener('click', (e) => {
  if (e.target === repoModal) closeRepoModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && repoModal.classList.contains('open')) closeRepoModal();
});

function openRepoModal() {
  selectedRepos.clear();
  modalConfirm.disabled = true;
  repoModal.classList.add('open');
  modalBody.innerHTML = '<div class="modal-loading">加载仓库列表...</div>';

  fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=50&type=owner`)
    .then(res => {
      if (!res.ok) throw new Error(`GitHub API ${res.status}`);
      return res.json();
    })
    .then(repos => {
      // 过滤 fork 的仓库
      const own = repos.filter(r => !r.fork);
      if (!own.length) {
        modalBody.innerHTML = '<div class="modal-empty">没有找到公开仓库</div>';
        return;
      }
      renderRepoList(own);
    })
    .catch(err => {
      modalBody.innerHTML = `<div class="modal-error">加载失败：${err.message}</div>`;
    });
}

function closeRepoModal() {
  repoModal.classList.remove('open');
  selectedRepos.clear();
}

function renderRepoList(repos) {
  modalBody.innerHTML = '';
  repos.forEach(repo => {
    const wrapper = document.createElement('div');
    wrapper.className = 'modal-repo-wrapper';

    const item = document.createElement('label');
    item.className = 'modal-repo-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.dataset.id = repo.id;

    const info = document.createElement('div');
    info.className = 'modal-repo-info';

    const name = document.createElement('div');
    name.className = 'modal-repo-name';
    name.textContent = repo.name;

    const desc = document.createElement('div');
    desc.className = 'modal-repo-desc';
    desc.textContent = repo.description || '暂无描述';

    const lang = document.createElement('div');
    if (repo.language) {
      lang.className = 'modal-repo-lang';
      lang.textContent = repo.language;
    }

    info.appendChild(name);
    info.appendChild(desc);
    if (repo.language) info.appendChild(lang);
    item.appendChild(checkbox);
    item.appendChild(info);

    // 可编辑描述区
    const editor = document.createElement('div');
    editor.className = 'modal-repo-editor';
    editor.style.display = 'none';
    const nameLabel = document.createElement('div');
    nameLabel.className = 'modal-repo-editor-label';
    nameLabel.textContent = '项目名称';
    const nameInput = document.createElement('input');
    nameInput.className = 'modal-repo-editor-input';
    nameInput.type = 'text';
    nameInput.placeholder = '自定义名称...';
    nameInput.value = repo.name;
    const descLabel = document.createElement('div');
    descLabel.className = 'modal-repo-editor-label';
    descLabel.textContent = '项目介绍';
    const descInput = document.createElement('textarea');
    descInput.className = 'modal-repo-editor-input';
    descInput.rows = 3;
    descInput.placeholder = '写一段项目介绍...';
    descInput.value = repo.description || '';
    editor.appendChild(nameLabel);
    editor.appendChild(nameInput);
    editor.appendChild(descLabel);
    editor.appendChild(descInput);

    wrapper.appendChild(item);
    wrapper.appendChild(editor);
    modalBody.appendChild(wrapper);

    item.addEventListener('click', (e) => {
      if (e.target === checkbox) return;
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    });

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        selectedRepos.set(repo.id, {
          title: nameInput.value.trim() || repo.name,
          description: descInput.value.trim() || repo.description || '暂无描述',
          tags: repo.language ? [repo.language] : [],
          url: repo.html_url,
        });
        editor.style.display = 'block';
        nameInput.focus();
        nameInput.setSelectionRange(nameInput.value.length, nameInput.value.length);
      } else {
        selectedRepos.delete(repo.id);
        editor.style.display = 'none';
      }
      modalConfirm.disabled = selectedRepos.size === 0;
    });

    // 实时更新名称和描述
    nameInput.addEventListener('input', () => {
      if (selectedRepos.has(repo.id)) {
        const data = selectedRepos.get(repo.id);
        data.title = nameInput.value.trim() || repo.name;
      }
    });
    descInput.addEventListener('input', () => {
      if (selectedRepos.has(repo.id)) {
        const data = selectedRepos.get(repo.id);
        data.description = descInput.value.trim() || repo.description || '暂无描述';
      }
    });
  });
}

modalConfirm.addEventListener('click', () => {
  const repos = Array.from(selectedRepos.values());
  if (!repos.length) return;

  // 合并已有 + 新增
  let existing = [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) existing = JSON.parse(saved);
  } catch { /* ignore */ }

  const merged = [...existing, ...repos];
  saveWorksToStorage(merged);
  renderWorksCards(merged);
  closeRepoModal();
});
