# 求职奥德赛 AI

求职奥德赛 AI 是一个面向大学生与早期职业人群的 AI 求职辅助产品。系统通过画像采集、职业地图、能力雷达、岗位匹配、简历优化与面试训练，把分散的求职准备整合为连续流程。

在线版本：

```text
https://job-odyssey-ai.netlify.app
```

## 核心功能

### 视觉与交互升级

- 页面采用奶油色画布、饱和色块、大圆角卡片和花园式职业地图视觉。
- 增加 subtle noise 纹理层、花朵浮动、点击轻震、加载扫光、雷达呼吸和卡片悬浮反馈。
- 支持 `prefers-reduced-motion`，用户系统开启减少动态效果时会自动关闭动画。
- 画像完整度、能力高置信信号、职业地图图例、动态雷达和 Agent 结果联动展示。


### 1. 画像采集

采集教育背景、专业方向、求职阶段、目标城市、行业偏好、岗位偏好、项目经历、技能工具、价值观、工作方式偏好、限制条件与目标 JD。系统会把这些信息整合为 Career Profile，作为职业推荐、能力评分和 Agent 生成的输入。

### 2. 莫奈花园职业地图

职业地图不是固定岗位清单。系统会根据输入信息从岗位画像库中动态推荐 Top 4 路径，并以花园式卡片展示岗位名称、适配度、推荐原因、证据关键词和能力缺口。点击任一岗位后，该岗位会进入后续 JD 匹配、简历优化和面试训练上下文。

### 3. 能力雷达图

能力雷达基于八个维度生成：产品定义、用户研究、数据分析、技术理解、AI 应用、项目推进、沟通表达、商业判断。评分依据包括显性技能、项目证据、量化结果、岗位 JD 和目标偏好。

### 4. AI 求职工作台

包含四类任务：职业地图生成、JD 匹配分析、AI 简历优化、面试题生成。每个任务对应不同 Agent 路由、Prompt 模板和输出结构，而不是同一套通用问答。

## 系统架构

```text
前端交互层
React + TypeScript + Vite
  ↓
画像与评分层
Career Profile Parser + Role Scoring + Ability Radar
  ↓
Agent 路由层
Career Agent / JD Matching Agent / Resume Rewrite Agent / Interview Coach Agent
  ↓
RAG 上下文层
岗位画像库 + 简历方法论 + 面试训练方法 + 职业准备度知识片段
  ↓
模型服务层
Netlify Function 读取 DEEPSEEK_API_KEY 并调用 DeepSeek Chat API
```

## RAG 与 Agent 使用位置

- Agent：根据当前任务选择不同处理器。职业地图生成、JD 匹配、简历优化和面试训练分别使用不同 system prompt、输出栏目和约束条件。
- RAG：后端根据用户画像、简历、JD、目标路径和补充指令检索岗位画像与方法论片段，再把检索结果拼入模型上下文。
- 结果 grounding：输出会同时参考用户输入、前端动态推荐岗位、能力雷达分数和后端检索上下文。

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

环境变量：

```text
DEEPSEEK_API_KEY=你的 DeepSeek API Key
```

Netlify 会将 `/api/ai` 转发到 `/.netlify/functions/ai`，模型密钥只在服务端函数中读取，前端不会暴露。
