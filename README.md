# 求职奥德赛 AI

一个面向求职者的职业路径生成与 AI 求职辅助产品。系统通过结构化画像采集、岗位库匹配、能力雷达、职业花园和 Agent 工作台，帮助使用者从模糊方向进入可执行的岗位选择、简历优化、JD 匹配和面试训练。

## 在线使用

- Netlify：`https://job-odyssey-ai.netlify.app`
- GitHub Pages 备用：`https://liuyutongamy.github.io/job-odyssey-ai/`

## 核心链路

1. 分栏采集学历、专业、求职阶段、目标岗位、城市、行业偏好、技能、项目经历、量化结果、价值观、限制条件、时间计划和目标 JD。
2. 点击「生成职业画像」后生成画像完整度、能力雷达和 Top 4 职业花园路径。
3. 点击任意职业花朵后，该岗位写入后续 AI 上下文。
4. AI 工作台根据当前路径分别调用职业规划、JD 匹配、简历优化和面试训练 Agent。
5. 服务端函数读取环境变量调用 DeepSeek API，前端不暴露密钥。

## 当前能力

- 结构化画像采集与完整度检测
- 扩展岗位画像库与 Top 4 动态推荐
- 8 维能力雷达：产品定义、用户研究、数据分析、技术理解、AI 应用、项目推进、沟通表达、商业判断
- 莫奈花园职业地图：花朵卡片代表推荐岗位路径，分数由当前画像和 JD 动态计算
- Agent Router：不同任务进入不同 Prompt 和输出结构
- Lightweight RAG：内置岗位画像、简历方法、JD 匹配、面试训练和职业准备度知识片段检索
- Netlify Function 服务端调用 DeepSeek API

## 技术栈

React · TypeScript · Vite · CSS · Netlify Functions · DeepSeek API

## 环境变量

Netlify 中配置：

```bash
DEEPSEEK_API_KEY=你的 DeepSeek API Key
```

## 本地运行

```bash
npm install
npm run dev
```

## 部署

Netlify 配置：

```text
Build command: npm run build
Publish directory: dist
Functions directory: netlify/functions
```
