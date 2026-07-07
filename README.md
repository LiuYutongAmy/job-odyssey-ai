# 求职奥德赛 AI

一个面向求职者的职业路径生成与 AI 求职辅助产品。系统通过结构化画像采集、岗位库匹配、能力雷达、职业花园和 Agent 工作台，帮助使用者从模糊方向进入可执行的岗位选择、简历优化、JD 匹配和面试训练。

## 在线使用

- Netlify：`https://job-odyssey-ai.netlify.app`
- GitHub Pages 备用：`https://liuyutongamy.github.io/job-odyssey-ai/`

## 核心链路

1. 分栏采集学历、专业、求职阶段、目标岗位、城市、行业偏好、技能、项目经历、量化结果、价值观、限制条件、时间计划和目标 JD。
2. 点击「生成职业画像」后生成画像完整度、能力雷达和 Top 4 职业花园路径。
3. 点击任意路径卡片后，该岗位写入后续 AI 上下文。
4. AI 工作台根据当前路径分别调用职业规划、JD 匹配、简历优化和面试训练 Agent。
5. 服务端函数读取环境变量调用 DeepSeek API，前端不暴露密钥。

## 当前能力

- 结构化画像采集与完整度检测
- 扩展岗位画像库与 Top 4 动态推荐
- 8 维通用职业能力雷达：专业执行、沟通表达、问题分析、数字技术、创新判断、协作推进、学习适应、业务理解
- 莫奈花园职业地图：花园路径卡片代表推荐岗位路径，分数由当前画像和 JD 动态计算，并保留轻量花朵视觉元素
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


## 本次更新

- 优化首页文案，强化“求职奥德赛”产品隐喻。
- 调整首页跨方向岗位浮动球位置，避免重叠，仅展示岗位族群名称。
- 删除冗余的 Product Flow 模块。
- 画像采集分栏增加示例占位说明，并提供“填入示例画像”按钮。
- 能力雷达改为适配多专业用户的通用职业能力模型。
- Footer 增加 Amy 水印。


## 最新修订说明

- 首页职业浮动球改为 8 个固定点位，覆盖数据分析、软件开发、新媒体运营、用户研究、商业分析、市场营销、人力资源、财务分析，避免重叠。
- AI 工作台左侧改为“AI 上下文 / 投递范围”，用于展示当前主攻方向、岗位拓展路径、可搜索岗位关键词和适合关注的公司池。
- 职业规划 Agent 升级为“求职执行方案”，减少与左侧重复，重点输出简历重构、经历挖掘、项目补强、项目案例包装、面试准备、投递复盘和 7/14/30 天交付清单。
