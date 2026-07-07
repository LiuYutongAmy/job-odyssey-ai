# 求职奥德赛 AI 作品集

这是一个面向大学生求职场景的 AI 产品作品集 Demo。产品以“求职是一场奥德赛”为隐喻，把职业定位、简历优化、JD 匹配和面试准备串成一个可演示的求职辅助闭环。

## 在线演示

部署后把链接放在这里：

- Vercel 真实 AI 版：`https://job-odyssey-ai.vercel.app`
- GitHub Pages 静态展示：`https://你的用户名.github.io/job-odyssey-ai/`

## 项目定位

求职奥德赛 AI 是一个“AI 求职探索舱”。用户输入简历经历、目标岗位 JD 和具体问题后，系统输出结构化建议，帮助用户判断岗位匹配度、改写简历表达、准备面试回答。

## 核心功能

- AI 简历优化：根据简历内容和岗位 JD 输出结构化改写建议。
- JD 匹配分析：提取岗位关键词，判断匹配优势、短板和补强方向。
- 面试题生成：生成高频问题、回答框架和 STAR 示例。
- 职业规划展示：把产品、数据、AI、沟通、执行等能力可视化。
- 双模式运行：未配置 API Key 时显示本地 Demo 结果；配置 API Key 后调用真实 DeepSeek API。

## 技术栈

React + TypeScript + Vite + CSS + Vercel Serverless Function + DeepSeek API

## 本地运行

```bash
npm install
npm run dev
```

打开：

```text
http://localhost:8080
```

## Vercel 真实 AI 部署

1. 将项目上传到 GitHub。
2. 在 Vercel 中 Import GitHub 仓库。
3. Framework 选择 Vite。
4. Build Command 填 `npm run build`。
5. Output Directory 填 `dist`。
6. 在 Environment Variables 中新增：

```text
DEEPSEEK_API_KEY=你的 DeepSeek API Key
```

7. Redeploy。配置完成后，页面点击“生成 AI 建议”会通过 `/api/ai` 调用 DeepSeek。

## GitHub Pages 静态展示

项目内置 `docs/index.html`，即使不配置 API Key，也可以作为稳定可访问的作品集展示页。静态版会使用本地 Demo 兜底结果。

## 面试讲解口径

本项目的产品逻辑是：先把大学生求职中的信息差抽象成“职业定位—岗位理解—简历优化—面试准备”四个节点，再通过 AI 生成能力把用户输入转化为可执行建议。技术上，前端负责交互与展示，后端函数负责转发模型请求，API Key 仅保存在 Vercel 环境变量中，避免暴露到前端。
