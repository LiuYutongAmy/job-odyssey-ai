import React, { useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './style.css'

type Task = 'career' | 'resume' | 'match' | 'interview'

type AiResponse = {
  text: string
  source?: 'api' | 'fallback'
}

const modules = [
  ['🎓 职业规划 Agent', '基于 GCDF / BCC 方法论的 8–12 轮深度对话'],
  ['🗺️ 求职地图', '30+ 岗位方向、能力要求与成长路径拆解'],
  ['📈 能力雷达图', '把沟通、数据、产品、AI、项目推进能力可视化'],
  ['🧾 岗位画像', '聚合岗位职责、任职要求与社媒真实反馈'],
  ['📝 AI 简历编辑', '结合岗位 JD 输出针对性改写建议'],
  ['🔗 求职平台直达', '整理智联招聘 / BOSS 直聘 / 实习僧跳转入口'],
  ['💬 AI 面试站', '生成结构化面试题、STAR 回答建议与追问'],
  ['📱 PWA 展示', '移动端可访问，适合作品集在线演示']
]

const roadmap = [
  { title: '产品实习生', tags: ['用户调研', '需求文档', '原型设计', '数据分析'], level: 88 },
  { title: 'AI 产品助理', tags: ['Prompt', 'Agent', 'RAG', '场景定义'], level: 84 },
  { title: '数据产品实习生', tags: ['SQL', '指标体系', 'BI', '数据治理'], level: 80 },
  { title: '运营增长实习生', tags: ['转化漏斗', 'A/B Test', '内容策略', '用户分层'], level: 74 }
]

const defaultResume = `教育背景：本科/硕士在读，具备产品、数据分析和 AI 应用基础。\n项目经历：参与“求职奥德赛 AI” 作品集复刻，负责需求拆解、页面搭建、AI 接口联调、上线部署。\n技能：SQL、Python、React、TypeScript、Prompt Engineering、竞品分析、PRD。`
const defaultJD = `岗位：AI 产品实习生\n职责：理解业务场景和用户需求，梳理流程、痛点及产品机会；参与产品方案、原型和需求文档输出；使用 SQL/Python/BI 工具分析数据，推动产品优化；了解大模型、Prompt、Agent 等 AI 应用方向。`

function fallbackGenerate(task: Task, resumeText: string, jdText: string, userInput: string): string {
  const base = `以下为本地 Demo 引擎生成结果。部署到 Vercel 并配置 DEEPSEEK_API_KEY 后，将自动切换为真实 AI 输出。`
  const jdKeywords = ['业务场景', '用户需求', '产品方案', '原型', '需求文档', 'SQL', 'Python', 'BI', 'AI', '大模型', 'Prompt', 'Agent']
  const hit = jdKeywords.filter(k => `${resumeText}\n${jdText}\n${userInput}`.includes(k))
  const missing = jdKeywords.filter(k => !hit.includes(k)).slice(0, 5)

  if (task === 'resume') {
    return `${base}\n\n一、核心判断\n你的简历已经具备“AI 产品 + 数据分析 + 项目落地”的雏形，但表达仍偏概括，需要把经历改成“场景—问题—动作—结果”的产品逻辑。\n\n二、可强化关键词\n已覆盖：${hit.join('、') || '暂未明显覆盖'}\n建议补充：${missing.join('、') || '已较完整'}\n\n三、建议改写\n原表达可以改成：\n“围绕大学生求职场景，拆解简历优化、岗位匹配与面试准备链路，输出核心功能流程和页面结构；基于 AI 模型完成 JD 匹配分析与简历改写建议生成，并通过 Vercel 完成在线部署。”\n\n四、下一步\n补充真实数据指标，例如页面模块数、部署耗时、AI 生成成功率、用户测试反馈数量。`
  }

  if (task === 'match') {
    return `${base}\n\n匹配度评估：82 / 100\n\n优势：\n1. 项目主题与 AI 产品、求职场景高度相关。\n2. 能体现需求拆解、产品方案、AI 应用和上线部署能力。\n3. 若补充 SQL/Python 数据分析案例，和 JD 的匹配会更高。\n\n风险点：\n1. 如果只是页面复刻，面试官可能质疑原创度。\n2. 需要明确说明你负责的模块：页面复刻、AI 接口、部署、README、演示链路。\n\n面试表达：\n“我先拆解了求职场景中的简历优化、岗位匹配和面试准备三个核心节点，再把每个节点映射为可交互页面，并接入 AI 生成能力，形成从输入到建议输出的闭环。”`
  }

  if (task === 'interview') {
    return `${base}\n\n高频面试题 1：你为什么做这个 AI 求职辅导项目？\n回答框架：从大学生求职信息差切入，说明简历、岗位理解、面试准备之间缺少连续工具。\n\n高频面试题 2：你在项目中承担了什么？\n回答框架：需求拆解、页面复刻、AI 接口接入、部署上线、README 和作品集包装。\n\n高频面试题 3：如果继续迭代，你会怎么做？\n回答框架：接入登录和数据库，保存用户历史记录；加入 JD 爬取和岗位库；用 RAG 降低模型幻觉；增加埋点分析转化漏斗。\n\nSTAR 示例：\nS：面试前需要快速准备作品集。\nT：在有限时间内上线一个可访问的 AI 求职 Demo。\nA：拆解核心链路，优先实现简历优化和 JD 匹配，再部署到线上。\nR：形成可点击、可演示、可讲解的作品集项目。`
  }

  return `${base}\n\n职业规划建议：\n1. 近期目标：优先投递 AI 产品、数据产品、ToB 产品实习。\n2. 能力补齐：用一个完整作品集证明产品方案、AI 应用和上线能力。\n3. 简历关键词：用户需求、业务流程、PRD、指标体系、Prompt、Agent、SQL、Python。\n4. 作品集讲法：不要只说“我做了网页”，要说“我围绕求职链路设计了从分析到优化再到面试准备的产品闭环”。`
}

async function callAi(task: Task, resumeText: string, jdText: string, userInput: string): Promise<AiResponse> {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, resumeText, jdText, userInput })
    })

    if (!response.ok) throw new Error('API unavailable')
    const data = await response.json()
    if (!data?.text) throw new Error('Empty response')
    return { text: data.text, source: 'api' }
  } catch {
    return { text: fallbackGenerate(task, resumeText, jdText, userInput), source: 'fallback' }
  }
}

function App() {
  const [task, setTask] = useState<Task>('resume')
  const [resumeText, setResumeText] = useState(defaultResume)
  const [jdText, setJdText] = useState(defaultJD)
  const [userInput, setUserInput] = useState('请帮我优化成更适合 AI 产品实习生岗位的表达。')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [source, setSource] = useState<'api' | 'fallback' | ''>('')

  const score = useMemo(() => {
    const text = `${resumeText}\n${jdText}\n${userInput}`
    return Math.min(96, 65 + ['AI', '产品', 'SQL', 'Python', 'Prompt', 'Agent', '用户', '需求', '数据'].filter(k => text.includes(k)).length * 3)
  }, [resumeText, jdText, userInput])

  const handleGenerate = async () => {
    setLoading(true)
    setResult('')
    const data = await callAi(task, resumeText, jdText, userInput)
    setResult(data.text)
    setSource(data.source || '')
    setLoading(false)
  }

  return (
    <main>
      <nav className="nav">
        <div className="brand"><span className="logo">☘️</span> 求职奥德赛 AI</div>
        <div className="navlinks">
          <a href="#features">功能</a>
          <a href="#workspace">AI 工作台</a>
          <a href="#report">报告</a>
          <a href="#about">关于</a>
        </div>
      </nav>

      <section className="hero">
        <div className="badge">求职奥德赛 AI · 作品集 Demo</div>
        <h1>求职奥德赛 AI</h1>
        <p className="subtitle">以“求职是一场奥德赛”为产品隐喻，面向大学生求职场景，覆盖职业定位、简历优化、岗位匹配与面试准备。</p>
        <div className="heroActions">
          <a className="primary" href="#workspace">🚀 在线体验</a>
          <a className="secondary" href="#features">查看功能</a>
        </div>
        <div className="status"><span /> 已上线 · 支持 PC / 手机访问 · 可接入真实 AI API</div>
        <div className="mascot">😊</div>
      </section>

      <section id="features" className="section">
        <h2>🏆 关于本作品</h2>
        <p>本项目聚焦“求职信息差”和“简历与岗位不匹配”问题，把求职过程拆成职业定位、岗位理解、简历优化、模拟面试四个环节，形成可演示的产品闭环。</p>
        <div className="grid">
          {modules.map(([title, desc]) => <article className="card" key={title}><h3>{title}</h3><p>{desc}</p></article>)}
        </div>
      </section>

      <section className="section split">
        <div>
          <h2>🗺️ 莫奈花园职业地图</h2>
          <p>用岗位卡片展示不同职业方向的能力要求，帮助用户从“我想找工作”过渡到“我适合投什么岗位”。</p>
          <div className="roadmap">
            {roadmap.map(item => <div className="roadItem" key={item.title}><div><strong>{item.title}</strong><div>{item.tags.map(t => <span key={t}>{t}</span>)}</div></div><b>{item.level}%</b></div>)}
          </div>
        </div>
        <div className="radarCard">
          <h3>📈 能力雷达图</h3>
          <div className="radar"><span>产品</span><span>数据</span><span>AI</span><span>沟通</span><span>执行</span></div>
          <p>当前岗位匹配度：<b>{score}</b> / 100</p>
        </div>
      </section>

      <section id="workspace" className="section workspace">
        <h2>✨ AI 求职工作台</h2>
        <div className="tabs">
          <button className={task === 'resume' ? 'active' : ''} onClick={() => setTask('resume')}>AI 简历优化</button>
          <button className={task === 'match' ? 'active' : ''} onClick={() => setTask('match')}>JD 匹配分析</button>
          <button className={task === 'interview' ? 'active' : ''} onClick={() => setTask('interview')}>面试题生成</button>
          <button className={task === 'career' ? 'active' : ''} onClick={() => setTask('career')}>职业规划</button>
        </div>
        <div className="editor">
          <label>简历 / 个人经历</label>
          <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} />
          <label>岗位 JD</label>
          <textarea value={jdText} onChange={e => setJdText(e.target.value)} />
          <label>你的具体问题</label>
          <input value={userInput} onChange={e => setUserInput(e.target.value)} />
          <button className="generate" onClick={handleGenerate} disabled={loading}>{loading ? '生成中...' : '生成 AI 建议'}</button>
        </div>
        <div className="result">
          <div className="resultHead"><strong>生成结果</strong>{source && <em>{source === 'api' ? '真实 AI API' : '本地 Demo 兜底'}</em>}</div>
          <pre>{loading ? '正在分析简历、岗位 JD 与能力关键词...' : result || '点击“生成 AI 建议”后，这里会显示结构化求职建议。'}</pre>
        </div>
      </section>

      <section id="report" className="section">
        <h2>🤖 技术亮点</h2>
        <ul className="points">
          <li><b>产品方法：</b>围绕“职业定位—岗位理解—简历优化—面试准备”构建闭环。</li>
          <li><b>AI 接入：</b>前端请求 /api/ai，服务端读取环境变量调用模型，不在前端暴露密钥。</li>
          <li><b>可部署：</b>GitHub Pages 可展示静态作品，Vercel 配置 API Key 后可启用真实 AI。</li>
          <li><b>可讲解：</b>面试时可说明需求拆解、MVP 取舍、接口封装、上线部署与后续迭代。</li>
        </ul>
      </section>

      <section id="about" className="section about">
        <h2>📄 技术栈</h2>
        <table>
          <tbody>
            <tr><th>前端</th><td>React · TypeScript · Vite · CSS</td></tr>
            <tr><th>AI</th><td>DeepSeek / OpenAI-compatible API，可选本地 Demo 兜底</td></tr>
            <tr><th>部署</th><td>GitHub Pages 静态展示 / Vercel Serverless Function 真实 AI</td></tr>
            <tr><th>作品定位</th><td>AI 产品实习生、数据产品实习生、ToB 产品实习生作品集</td></tr>
          </tbody>
        </table>
      </section>

      <footer>求职奥德赛 AI 作品集 · Built for portfolio presentation</footer>
    </main>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
