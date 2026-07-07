import React, { useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './style.css'

type Task = 'resume' | 'match' | 'interview' | 'career'
type Source = 'api' | 'fallback' | ''
type AbilityKey = 'product' | 'research' | 'data' | 'tech' | 'ai' | 'delivery' | 'communication' | 'business'

type RoleProfile = {
  id: string
  title: string
  family: string
  metaphor: string
  description: string
  keywords: string[]
  evidenceKeywords: string[]
  values: string[]
  weights: Record<AbilityKey, number>
  growth: string[]
}

type CandidateRole = RoleProfile & {
  score: number
  evidence: string[]
  gaps: string[]
  reason: string
}

type AbilityScores = Record<AbilityKey, number>

type AiResponse = {
  text: string
  source?: 'api' | 'fallback'
  context?: string[]
  agentTrace?: string[]
}

const abilityLabels: Record<AbilityKey, string> = {
  product: '产品定义',
  research: '用户研究',
  data: '数据分析',
  tech: '技术理解',
  ai: 'AI 应用',
  delivery: '项目推进',
  communication: '沟通表达',
  business: '商业判断'
}

const taskMeta: Record<Task, { label: string; icon: string; title: string; description: string; placeholder: string; outputs: string[] }> = {
  career: {
    label: '职业地图生成',
    icon: '🌷',
    title: '先定位，再生成莫奈花园职业地图',
    description: '读取画像、经历、能力、偏好与限制条件，动态生成最适合的 4 条岗位路径；职业地图和雷达图会随输入实时变化。',
    placeholder: '例如：我更想做 AI 产品，但担心技术背景不够，请判断可投岗位与 30 天补强路径。',
    outputs: ['4 条动态岗位路径', '选择依据', '能力短板', '30/60/90 天行动']
  },
  match: {
    label: 'JD 匹配分析',
    icon: '🎯',
    title: '把目标岗位拆成要求、证据和缺口',
    description: '选择职业花朵或粘贴具体 JD 后，系统会对照经历证据、能力雷达与岗位要求，输出匹配度和投递策略。',
    placeholder: '例如：请判断这份 JD 是否适合投递，指出最影响通过率的 3 个缺口。',
    outputs: ['岗位要求拆解', '匹配度评分', '优势证据', '补强动作']
  },
  resume: {
    label: 'AI 简历优化',
    icon: '✍️',
    title: '把经历改写成岗位能读懂的证据',
    description: '结合已选岗位路径和 JD，抽取关键词、重排经历优先级，并生成可直接替换的中文简历 bullet。',
    placeholder: '例如：把我的项目经历改成更适合数据产品实习生，突出指标体系和项目推进。',
    outputs: ['关键词映射', '简历问题诊断', '可复制 bullet', '补充材料建议']
  },
  interview: {
    label: '面试题生成',
    icon: '💬',
    title: '围绕岗位与经历生成追问式训练',
    description: '基于目标岗位、JD 和经历生成高频题、追问链路、STAR 回答框架和评分标准。',
    placeholder: '例如：围绕 AI 求职系统项目，生成产品岗面试会追问的问题和回答框架。',
    outputs: ['高频题', '追问链路', 'STAR 框架', '评分标准']
  }
}

const roleCatalog: RoleProfile[] = [
  {
    id: 'ai-product', title: 'AI 产品实习生', family: 'AI 产品', metaphor: '薰衣草智能花圃',
    description: '把模型能力、业务场景和用户需求转译为可落地的产品流程。',
    keywords: ['AI', '大模型', 'Prompt', 'Agent', 'RAG', '模型评测', '产品方案', 'PRD', '原型', '用户需求'],
    evidenceKeywords: ['AI', 'DeepSeek', 'Prompt', 'Agent', 'RAG', 'React', 'TypeScript', '原型', 'PRD', '用户需求', '产品方案'],
    values: ['创新', '产品', '技术', '效率', '探索'],
    weights: { product: .18, research: .11, data: .10, tech: .13, ai: .22, delivery: .10, communication: .08, business: .08 },
    growth: ['模型效果指标', 'Prompt 评测表', 'Agent 流程图', '异常兜底方案']
  },
  {
    id: 'data-product', title: '数据产品实习生', family: '数据产品', metaphor: '湖蓝指标花圃',
    description: '围绕指标体系、看板、数据治理和归因分析支撑业务决策。',
    keywords: ['SQL', 'Python', 'BI', '指标体系', '数据仓库', '数据建模', '归因分析', '看板', '数据治理'],
    evidenceKeywords: ['SQL', 'Python', 'BI', '指标', '数据分析', '数据清洗', 'ArcGIS', 'GEE', '看板', '归因'],
    values: ['数据', '分析', '严谨', '业务', '决策'],
    weights: { product: .13, research: .08, data: .26, tech: .13, ai: .08, delivery: .10, communication: .08, business: .14 },
    growth: ['指标树', 'SQL 分析样例', 'BI 看板原型', '数据字典']
  },
  {
    id: 'tob-product', title: 'ToB 产品实习生', family: '企业服务', metaphor: '深绿流程花圃',
    description: '拆解企业客户流程、权限、状态流和交付链路，推动需求上线。',
    keywords: ['ToB', 'SaaS', '业务流程', '需求调研', '权限', '状态流', '项目推进', '验收', '交付', '客户'],
    evidenceKeywords: ['ToB', '医院', '政务', '流程图', '权限', '验收', '交付', '客户', '访谈', '需求评审'],
    values: ['协作', '稳定', '交付', '客户', '流程'],
    weights: { product: .18, research: .15, data: .09, tech: .10, ai: .04, delivery: .18, communication: .14, business: .12 },
    growth: ['角色权限表', '状态流图', '需求池优先级', '验收用例']
  },
  {
    id: 'product-analyst', title: '产品数据分析实习生', family: '产品分析', metaphor: '金色洞察花圃',
    description: '用漏斗、留存、归因和用户分层解释产品问题并推动迭代。',
    keywords: ['漏斗', '留存', '转化率', 'A/B Test', '归因', '用户分层', 'Excel', 'SQL', '数据分析'],
    evidenceKeywords: ['转化率', '漏斗', '归因', '问卷', 'Excel', 'SQL', '用户分层', '数据可视化'],
    values: ['分析', '增长', '业务', '效率', '结果'],
    weights: { product: .14, research: .10, data: .25, tech: .09, ai: .05, delivery: .10, communication: .10, business: .17 },
    growth: ['漏斗分析报告', '指标口径表', '归因拆解', '实验复盘']
  },
  {
    id: 'gis-data-product', title: 'GIS 数据产品实习生', family: '空间数据', metaphor: '薄荷地图花圃',
    description: '把空间数据、地图交互和行业场景结合成可解释的数据产品。',
    keywords: ['GIS', 'ArcGIS', '遥感', 'GEE', '空间分析', '地图', 'POI', '可视化', '指标库'],
    evidenceKeywords: ['GIS', 'ArcGIS', '遥感', 'GEE', '空间', '地图', 'POI', '专题图', '城市体检'],
    values: ['空间', '数据', '公共价值', '可视化', '研究'],
    weights: { product: .13, research: .13, data: .22, tech: .13, ai: .05, delivery: .12, communication: .10, business: .12 },
    growth: ['交互地图 Demo', '空间指标库', '地图故事脚本', '数据口径说明']
  },
  {
    id: 'ux-research', title: '用户研究实习生', family: '用户研究', metaphor: '粉色访谈花圃',
    description: '通过访谈、问卷、可用性测试和画像沉淀用户洞察。',
    keywords: ['用户研究', '访谈', '问卷', '可用性测试', '用户画像', '需求洞察', '竞品分析'],
    evidenceKeywords: ['问卷', '访谈', '调研', '画像', '竞品', '用户', '洞察', '需求'],
    values: ['人群', '洞察', '沟通', '研究', '共情'],
    weights: { product: .12, research: .28, data: .08, tech: .04, ai: .03, delivery: .08, communication: .22, business: .15 },
    growth: ['访谈提纲', '用户画像', '洞察报告', '可用性测试记录']
  },
  {
    id: 'growth-product', title: '增长产品 / 运营实习生', family: '增长', metaphor: '珊瑚增长花圃',
    description: '围绕用户获取、转化、激活和复购设计增长实验。',
    keywords: ['增长', '运营', '转化', '留资', '社群', '活动', '渠道', 'A/B', '内容策略'],
    evidenceKeywords: ['增长', '运营', '转化', '留资', '社群', '活动', '渠道', '内容', 'CCTV', '营收'],
    values: ['增长', '商业', '结果', '传播', '执行'],
    weights: { product: .12, research: .10, data: .13, tech: .03, ai: .04, delivery: .15, communication: .17, business: .26 },
    growth: ['增长漏斗', '活动复盘', '用户分层策略', '渠道归因表']
  },
  {
    id: 'business-analyst', title: '商业分析实习生', family: '商业分析', metaphor: '蜜桃商业花圃',
    description: '围绕市场、竞品、收入模型和战略路径完成结构化分析。',
    keywords: ['商业分析', '市场', '竞品', '收入', '商业模式', '策略', '客户', '行业研究'],
    evidenceKeywords: ['商业', '市场', '竞品', '收入', '营收', '策略', '客户', '行业', 'STP'],
    values: ['商业', '策略', '分析', '表达', '增长'],
    weights: { product: .10, research: .14, data: .13, tech: .03, ai: .03, delivery: .11, communication: .16, business: .30 },
    growth: ['市场拆解', '竞品矩阵', '商业模式画布', '策略报告']
  }
]

const defaultProfile = `教育背景：本科/硕士在读；专业方向可填写计算机、数据、商科、GIS、设计、管理等。
求职阶段：正在准备实习投递；目标城市/行业/岗位可补充。
偏好与限制：例如更喜欢产品设计、数据分析、AI 应用、ToB 项目、稳定交付或高成长业务。`

const defaultResume = `请粘贴简历经历、项目经历或上传 txt/md 文件。
示例：参与 AI 求职工具设计，完成职业定位、岗位匹配、简历优化与面试准备链路；使用 React + TypeScript 搭建前端，通过 Netlify Function 调用 DeepSeek API；具备 SQL、Python、Prompt、RAG/Agent、PRD、用户调研等能力。`

const defaultJD = `可粘贴目标岗位 JD，也可以先留空。
示例：岗位要求包括业务场景理解、用户需求分析、产品方案/原型/PRD 输出、SQL/Python 数据分析、了解大模型、Prompt、Agent、RAG 等 AI 应用方向。`

function lower(text: string) { return text.toLowerCase() }
function clamp(n: number, min = 18, max = 96) { return Math.max(min, Math.min(max, Math.round(n))) }
function hits(text: string, list: string[]) { const s = lower(text); return list.filter(k => s.includes(lower(k))) }
function uniq<T>(arr: T[]) { return Array.from(new Set(arr)) }

function computeAbilities(text: string): AbilityScores {
  const groups: Record<AbilityKey, string[]> = {
    product: ['产品', '需求', 'PRD', '原型', '流程', '用户故事', '功能', '竞品', '方案'],
    research: ['访谈', '问卷', '调研', '用户画像', '可用性', '洞察', '样本', '画像', '痛点'],
    data: ['SQL', 'Python', 'BI', '指标', '数据', '漏斗', '归因', '分析', '建模', 'ArcGIS', 'GEE'],
    tech: ['React', 'TypeScript', 'API', '接口', '数据库', '前端', '后端', '部署', '架构', 'Supabase'],
    ai: ['AI', '大模型', 'LLM', 'Prompt', 'Agent', 'RAG', 'DeepSeek', '向量', '模型', '生成'],
    delivery: ['上线', '推动', '迭代', '验收', '交付', '协同', '评审', '落地', '闭环'],
    communication: ['汇报', '沟通', '访谈', '协同', '跨团队', '客户', '医护', '管理层', '表达'],
    business: ['商业', '市场', '转化', '增长', '营收', '客户', '策略', '行业', '竞品', '成本']
  }
  const lengthBoost = Math.min(10, Math.floor(text.length / 360))
  return Object.fromEntries(Object.entries(groups).map(([key, ks]) => {
    const found = hits(text, ks)
    const numericBoost = /\d+|%|万|亿|KPI|ROI/i.test(text) ? 4 : 0
    return [key, clamp(38 + found.length * 7 + lengthBoost + numericBoost)]
  })) as AbilityScores
}

function weightedAbility(scores: AbilityScores, weights: Record<AbilityKey, number>) {
  return Object.entries(weights).reduce((sum, [key, weight]) => sum + scores[key as AbilityKey] * weight, 0)
}

function generateRoles(profileText: string, resumeText: string, jdText: string, rolePreference: string) {
  const text = `${profileText}\n${resumeText}\n${jdText}\n${rolePreference}`
  const ability = computeAbilities(text)
  return roleCatalog.map(role => {
    const keywordEvidence = hits(text, role.evidenceKeywords)
    const valueHits = hits(text, role.values)
    const jdHits = hits(jdText, role.keywords)
    const abilityScore = weightedAbility(ability, role.weights)
    const keywordScore = Math.min(20, keywordEvidence.length * 3.2)
    const valueScore = Math.min(10, valueHits.length * 2.5)
    const jdScore = Math.min(12, jdHits.length * 2.4)
    const preferenceBoost = lower(rolePreference).includes(lower(role.title.replace('实习生', ''))) || lower(rolePreference).includes(lower(role.family)) ? 6 : 0
    const score = clamp(abilityScore * .72 + keywordScore + valueScore + jdScore + preferenceBoost, 28, 98)
    const evidence = uniq([...keywordEvidence, ...valueHits, ...jdHits]).slice(0, 8)
    const gaps = role.keywords.filter(k => !evidence.some(e => lower(e) === lower(k))).slice(0, 5)
    const reason = evidence.length
      ? `匹配证据集中在 ${evidence.slice(0, 3).join('、')}，适合从「${role.family}」路径继续探索。`
      : `当前信息不足，系统基于能力权重给出初步判断，建议补充项目经历和目标岗位。`
    return { ...role, score, evidence, gaps, reason }
  }).sort((a, b) => b.score - a.score).slice(0, 4)
}


function profileCompleteness(profileText: string, resumeText: string, jdText: string, rolePreference: string) {
  const all = `${profileText}\n${resumeText}\n${jdText}\n${rolePreference}`
  const checks = [
    { label: '教育/专业', ok: /本科|硕士|研究生|专业|学院|大学|计算机|商科|地理|GIS|数据|设计|管理/i.test(all) },
    { label: '目标岗位', ok: /产品|数据|AI|运营|增长|用户研究|商业分析|ToB|岗位|实习/i.test(all) },
    { label: '目标城市/行业', ok: /北京|上海|深圳|广州|杭州|成都|南京|城市|互联网|金融|教育|医疗|政务|SaaS|行业/i.test(all) },
    { label: '项目经历', ok: /项目|负责|参与|设计|搭建|分析|调研|上线|交付|优化/i.test(resumeText) },
    { label: '技能工具', ok: /SQL|Python|BI|Excel|Figma|Axure|React|TypeScript|Prompt|Agent|RAG|ArcGIS|GEE/i.test(all) },
    { label: '量化结果', ok: /\d+|%|万|KPI|ROI|DAU|转化|提升|降低|增长/i.test(all) },
    { label: '偏好限制', ok: /偏好|希望|优先|不想|限制|时间|城市|行业|方向|稳定|成长/i.test(rolePreference) },
    { label: '目标JD', ok: jdText.trim().length > 60 && !jdText.includes('可粘贴目标岗位 JD') }
  ]
  const ready = checks.filter(x => x.ok)
  return { checks, ready, score: Math.round((ready.length / checks.length) * 100) }
}

function topAbilitySignals(scores: AbilityScores) {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key, score]) => `${abilityLabels[key as AbilityKey]} ${score}`)
}

function point(score: number, index: number, total: number, size = 300) {
  const c = size / 2
  const radius = (score / 100) * 112
  const angle = (-90 + index * (360 / total)) * Math.PI / 180
  return `${c + radius * Math.cos(angle)},${c + radius * Math.sin(angle)}`
}

function AbilityRadar({ scores }: { scores: AbilityScores }) {
  const entries = Object.entries(abilityLabels).map(([key, label]) => [key as AbilityKey, label, scores[key as AbilityKey]] as const)
  const points = entries.map(([, , score], i) => point(score, i, entries.length)).join(' ')
  return <div className="radarCard">
    <div className="cardLabel">能力雷达</div>
    <h3>基于画像、经历、JD 与显性能力证据生成</h3>
    <svg viewBox="0 0 300 300" className="radar" role="img" aria-label="能力雷达图">
      {[25, 50, 75, 100].map(r => <polygon key={r} points={entries.map((_, i) => point(r, i, entries.length)).join(' ')} className="radarGrid" />)}
      {entries.map((_, i) => {
        const [x, y] = point(100, i, entries.length).split(',')
        return <line key={i} x1="150" y1="150" x2={x} y2={y} className="radarAxis" />
      })}
      <polygon points={points} className="radarArea" />
      {entries.map(([key, label, score], i) => {
        const [x, y] = point(118, i, entries.length).split(',').map(Number)
        const [dx, dy] = point(score, i, entries.length).split(',').map(Number)
        return <g key={key}>
          <circle cx={dx} cy={dy} r="4.5" className="radarDot" />
          <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="radarText">{label}</text>
        </g>
      })}
    </svg>
    <div className="scoreGrid">
      {entries.map(([key, label, score]) => <span key={key}><b>{score}</b>{label}</span>)}
    </div>
  </div>
}

function fallback(task: Task, data: {
  profileText: string; resumeText: string; jdText: string; userInput: string; selectedRole?: CandidateRole; roleCandidates: CandidateRole[]; abilityScores: AbilityScores
}) {
  const selected = data.selectedRole || data.roleCandidates[0]
  const candidateList = data.roleCandidates.map((r, i) => `${i + 1}. ${r.title}：${r.score}/100｜${r.reason}`).join('\n')
  const radar = Object.entries(abilityLabels).map(([k, label]) => `${label}${data.abilityScores[k as AbilityKey]}`).join(' / ')
  const gaps = selected.gaps.slice(0, 4).join('、') || '量化结果、岗位关键词、业务影响'
  if (task === 'career') return `# 职业地图生成\n\n## 1. 推荐岗位路径\n${candidateList}\n\n## 2. 当前主路径\n建议优先探索「${selected.title}」。${selected.reason}\n\n## 3. 能力雷达摘要\n${radar}\n\n## 4. 需要补强\n${gaps}\n\n## 5. 30/60/90 天行动\n- 30 天：补齐目标岗位关键词，整理 1 个可展示项目和 1 份岗位匹配简历。\n- 60 天：完成 2 轮真实 JD 匹配与简历迭代，沉淀面试题库。\n- 90 天：形成岗位路径组合，按主路径和备选路径分层投递。`
  if (task === 'match') return `# JD 匹配分析\n\n## 1. 匹配度\n${selected.title}：${selected.score}/100。\n\n## 2. 优势证据\n${selected.evidence.length ? selected.evidence.map(e => `- ${e}`).join('\n') : '- 当前经历证据不足，建议补充具体项目、工具、指标和结果。'}\n\n## 3. 扣分项\n${selected.gaps.map(g => `- ${g}：简历或项目中缺少清晰证据。`).join('\n')}\n\n## 4. 投递动作\n把简历前 1/3 改成与 JD 最相关的项目证据，优先展示工具、动作、产出、指标。`
  if (task === 'resume') return `# AI 简历优化\n\n## 1. 改写方向\n围绕「${selected.title}」强化 ${selected.evidence.slice(0, 4).join('、') || '岗位相关证据'}。\n\n## 2. 可直接替换的 bullet\n- 围绕求职链路中的职业定位、岗位理解、简历优化和面试准备，拆解核心场景并设计 AI 辅助流程，提升用户从画像采集到行动计划生成的连续性。\n- 基于岗位画像、个人经历和能力维度构建匹配评分逻辑，动态生成职业地图与能力雷达，辅助判断主路径与备选岗位。\n- 通过 Netlify Function 封装模型调用，在服务端读取环境变量并完成 Agent 路由与 RAG 上下文拼接，避免前端暴露密钥。\n\n## 3. 待补充\n${gaps}`
  return `# 面试题生成\n\n## 1. 高频题\n1. 为什么把职业推荐设计成“莫奈花园职业地图”？\n2. 能力雷达的输入数据和评分逻辑是什么？\n3. Agent 路由和 RAG 分别解决了什么问题？\n4. 如果用户信息不足，系统如何避免误导？\n5. 如何验证 JD 匹配分数是否有效？\n6. 后续接入真实岗位库后，排序逻辑如何升级？\n\n## 2. 追问链路\n从产品目标 → 数据采集 → 匹配算法 → 大模型提示词 → 结果可信度 → 后续迭代展开。\n\n## 3. 回答框架\n先说明问题定义，再讲输入数据、计算逻辑、AI Agent、RAG 上下文和结果展示。`
}

function App() {
  const [task, setTask] = useState<Task>('career')
  const [profileText, setProfileText] = useState(defaultProfile)
  const [resumeText, setResumeText] = useState(defaultResume)
  const [jdText, setJdText] = useState(defaultJD)
  const [rolePreference, setRolePreference] = useState('AI 产品 / 数据产品 / ToB 产品 / GIS 数据产品都可以探索，优先选择能沉淀可迁移能力的路径。')
  const [userInput, setUserInput] = useState('')
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [result, setResult] = useState('请先补充画像、简历或 JD；职业地图和能力雷达会自动更新。')
  const [source, setSource] = useState<Source>('')
  const [loading, setLoading] = useState(false)
  const [fileNote, setFileNote] = useState('支持 txt / md / csv / json 文本附件读取；PDF / DOCX 可先复制正文粘贴，后续可接入服务端解析。')

  const combinedText = `${profileText}\n${resumeText}\n${jdText}\n${rolePreference}\n${userInput}`
  const abilityScores = useMemo(() => computeAbilities(combinedText), [combinedText])
  const roleCandidates = useMemo(() => generateRoles(profileText, resumeText, jdText, rolePreference), [profileText, resumeText, jdText, rolePreference])
  const selectedRole = roleCandidates.find(r => r.id === selectedRoleId) || roleCandidates[0]
  const completeness = useMemo(() => profileCompleteness(profileText, resumeText, jdText, rolePreference), [profileText, resumeText, jdText, rolePreference])
  const signals = useMemo(() => topAbilitySignals(abilityScores), [abilityScores])

  function handleFile(file: File | undefined) {
    if (!file) return
    const canRead = /text|json|csv|markdown|plain/.test(file.type) || /\.(txt|md|csv|json)$/i.test(file.name)
    if (!canRead) {
      setFileNote(`已选择 ${file.name}。当前前端安全读取文本文件；PDF / DOCX 建议先复制正文粘贴，后续可接服务端 pdf-parse / mammoth。`)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || '')
      setResumeText(text.slice(0, 15000))
      setFileNote(`已读取 ${file.name}，共 ${text.length} 字符，已填入「简历/经历文本」。`)
    }
    reader.readAsText(file, 'utf-8')
  }

  async function generate() {
    setLoading(true)
    setSource('')
    const payload = { task, profileText, resumeText, jdText, rolePreference, userInput, selectedRole, roleCandidates, abilityScores }
    try {
      const res = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error(await res.text())
      const data: AiResponse = await res.json()
      const trace = data.agentTrace?.length ? `\n\n---\nAgent Trace\n${data.agentTrace.map((s, i) => `${i + 1}. ${s}`).join('\n')}` : ''
      setResult(`${data.text || '模型暂未返回内容'}${trace}`)
      setSource(data.source || 'api')
    } catch (err) {
      setResult(fallback(task, { profileText, resumeText, jdText, userInput, selectedRole, roleCandidates, abilityScores }))
      setSource('fallback')
    } finally {
      setLoading(false)
    }
  }

  return <main>
    <nav className="nav">
      <a className="brand" href="#top"><span className="brandMark">🌺</span><span>求职奥德赛 AI</span></a>
      <div className="navLinks"><a href="#profile">画像采集</a><a href="#garden">职业地图</a><a href="#workspace">AI 工作台</a><a href="#system">系统架构</a></div>
    </nav>

    <section id="top" className="hero">
      <div className="heroCopy">
        <span className="eyebrow">Career Odyssey Agent</span>
        <h1>把模糊的求职方向，种成一座可行动的职业花园。</h1>
        <p>输入背景、经历、偏好和目标岗位，系统生成动态职业路径、能力雷达、JD 匹配、简历优化和面试训练。每一次修改，都会重新影响推荐路径和能力判断。</p>
        <div className="heroActions"><a href="#profile" className="primaryBtn">开始生成职业地图</a><a href="#system" className="secondaryBtn">查看系统链路</a></div>
      </div>
      <div className="clayScene" aria-label="莫奈花园职业地图视觉">
        <div className="sun"></div><div className="hill hillA"></div><div className="hill hillB"></div>
        <div className="mote m1"></div><div className="mote m2"></div><div className="mote m3"></div>
        {roleCandidates.map((role, i) => <div key={role.id} className={`flower f${i}`}><b>{role.score}</b><span>{role.title.replace('实习生', '')}</span></div>)}
      </div>
    </section>

    <section className="productIntro section">
      <div><span className="sectionKicker">本产品</span><h2>从画像采集到行动建议的连续链路</h2></div>
      <p>系统聚焦职业定位、岗位理解、简历优化和面试准备四个连续环节。先建立候选人画像，再生成岗位路径和能力结构，随后把选中的岗位上下文传入 AI 工作台，避免单次问答割裂。</p>
      <div className="flowPills"><span>画像解析</span><span>岗位检索</span><span>能力建模</span><span>Agent 生成</span></div>
    </section>

    <section id="profile" className="section profileGrid">
      <div className="sectionHead"><span className="sectionKicker">Step 01</span><h2>画像采集</h2><p>职业推荐不能只看关键词。这里会采集背景、经历、技能、偏好、限制条件和目标 JD，用于后续职业地图、能力雷达和 Agent Prompt。</p></div>
      <div className="profileQuality formCard">
        <div className="qualityTop"><span>画像完整度</span><b>{completeness.score}%</b></div>
        <div className="qualityBar"><i style={{ width: `${completeness.score}%` }} /></div>
        <div className="qualityChecks">{completeness.checks.map(item => <em key={item.label} className={item.ok ? 'ok' : ''}>{item.ok ? '✓' : '○'} {item.label}</em>)}</div>
        <div className="signalLine"><strong>当前高置信能力</strong>{signals.map(s => <span key={s}>{s}</span>)}</div>
      </div>
      <div className="formCard large">
        <label>基本背景、求职阶段与偏好</label>
        <textarea value={profileText} onChange={e => setProfileText(e.target.value)} />
        <label>目标偏好 / 不确定方向</label>
        <textarea className="mini" value={rolePreference} onChange={e => setRolePreference(e.target.value)} />
        <div className="dataChecklist">
          <span>建议补充</span><b>教育/专业</b><b>目标城市</b><b>行业偏好</b><b>岗位偏好</b><b>能力证据</b><b>价值观</b><b>限制条件</b><b>时间计划</b>
        </div>
      </div>
      <div className="formCard">
        <label>上传简历 / 经历附件</label>
        <input type="file" accept=".txt,.md,.csv,.json,.pdf,.doc,.docx" onChange={e => handleFile(e.target.files?.[0])} />
        <p className="note">{fileNote}</p>
        <label>简历 / 个人经历文本</label>
        <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} />
      </div>
      <div className="formCard">
        <label>目标岗位 JD / 岗位方向</label>
        <textarea value={jdText} onChange={e => setJdText(e.target.value)} />
        <label>本次任务补充指令</label>
        <textarea className="mini" placeholder={taskMeta[task].placeholder} value={userInput} onChange={e => setUserInput(e.target.value)} />
      </div>
    </section>

    <section id="garden" className="section split">
      <div>
        <div className="sectionHead"><span className="sectionKicker">Step 02</span><h2>莫奈花园职业地图</h2><p>“莫奈花园”不是固定图，而是把岗位路径设计成可浮动、可选择的职业花圃。花朵大小代表适配度，颜色代表岗位族群；点击任意花朵后，该岗位会进入 JD 匹配、简历优化和面试训练上下文。</p></div>
        <div className="gardenLegend"><span>花朵大小 = 适配度</span><span>花瓣色彩 = 岗位族群</span><span>点击花朵 = 写入 AI 上下文</span></div>
        <div className="gardenGrid">
          {roleCandidates.map((role, index) => <button key={role.id} className={`gardenCard c${index} ${selectedRole.id === role.id ? 'active pulse' : ''}`} onClick={() => setSelectedRoleId(role.id)}>
            <span className="petal">{role.score}</span>
            <div><b>{role.title}</b><em>{role.metaphor}</em><p>{role.description}</p></div>
            <small>{role.reason}</small>
            <div className="chips">{role.evidence.slice(0, 5).map(e => <i key={e}>{e}</i>)}</div>
          </button>)}
        </div>
      </div>
      <AbilityRadar scores={abilityScores} />
    </section>

    <section id="workspace" className="section workspace">
      <div className="sectionHead wide"><span className="sectionKicker">Step 03</span><h2>AI 求职工作台</h2><p>四个模块不是同一套问题。模块决定 Agent 的任务类型和输出结构；上方画像、职业地图、能力雷达、JD 与补充指令会共同进入 Prompt。</p></div>
      <div className="taskTabs">
        {(Object.keys(taskMeta) as Task[]).map(key => <button key={key} className={task === key ? 'active' : ''} onClick={() => setTask(key)}><span>{taskMeta[key].icon}</span>{taskMeta[key].label}</button>)}
      </div>
      <div className="taskPanel">
        <div><h3>{taskMeta[task].title}</h3><p>{taskMeta[task].description}</p></div>
        <div className="chips">{taskMeta[task].outputs.map(o => <i key={o}>{o}</i>)}</div>
      </div>
      <div className="contextCard"><b>当前选中路径</b><strong>{selectedRole.title}</strong><p>{selectedRole.description}</p><div className="chips">{selectedRole.growth.map(g => <i key={g}>{g}</i>)}</div></div>
      <div className="resultCard">
        <div className="resultTop"><b>生成结果</b><span className={source === 'api' ? 'source api' : source === 'fallback' ? 'source fallback' : 'source'}>{source === 'api' ? '模型服务' : source === 'fallback' ? '离线规则引擎' : '待生成'}</span></div>
        <button className={`primaryBtn full ${loading ? 'isLoading' : ''}`} disabled={loading} onClick={generate}>{loading ? 'Agent 正在检索与生成…' : `生成 ${taskMeta[task].label}`}</button>
        <pre>{result}</pre>
      </div>
    </section>

    <section id="system" className="section systemSection">
      <div className="sectionHead"><span className="sectionKicker">System</span><h2>系统架构与能力</h2><p>页面上可见的职业地图、雷达图和生成结果，分别对应前端评分层、Agent 路由层和 RAG 上下文层。</p></div>
      <div className="systemGrid">
        <article className="pink"><b>画像层</b><p>采集背景、经历、技能证据、偏好、限制条件和 JD，形成 Career Profile。</p></article>
        <article className="teal"><b>推荐层</b><p>根据岗位画像库、能力权重和显性证据，生成 Top 4 职业花朵与雷达图。</p></article>
        <article className="lavender"><b>Agent 层</b><p>Career Agent / JD Agent / Resume Agent / Interview Agent 根据任务切换 Prompt 和输出结构。</p></article>
        <article className="peach"><b>RAG 层</b><p>后端检索岗位画像、简历方法论、面试训练和职业规划知识片段，拼入模型上下文。</p></article>
        <article className="ochre"><b>模型层</b><p>Netlify Function 在服务端读取 DEEPSEEK_API_KEY 调用模型，前端不暴露密钥。</p></article>
        <article className="cream"><b>体验层</b><p>用户修改任意输入后，职业地图和能力雷达立即重算，生成任务可基于最新上下文执行。</p></article>
      </div>
    </section>
    <footer>求职奥德赛 AI · Career Odyssey Agent · Monet Garden Mode</footer>
  </main>
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
