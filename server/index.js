import dotenv from 'dotenv';
dotenv.config();

import app from './app.mjs';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`
  🚀 个人主页已启动！
  ───────────────────────────
  本地预览: http://localhost:${PORT}
  聊天 API: POST http://localhost:${PORT}/api/chat
  ───────────────────────────
`);
});
