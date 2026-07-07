const taskPrompts = {
  career: {
    agent: 'Career Pathfinder Agent',
    name: '职业规划',
    system: '你是职业定位与路径规划 Agent。基于结构化画像、简历证据、目标 JD、能力雷达和岗位推荐结果，输出可信、具体、可执行的职业路径。',
    output: ['主路径与备选路径', '推荐依据与证据', '能力雷达解读', '短板和风险', '30/60/90 天行动计划']
  },
  match: {
    agent: 'JD Matching Agent',
    name: 'JD 匹配分析',
    system: '你是岗位匹配分析 Agent。把 JD 拆成职责、硬技能、软技能、业务理解和加分项，再与候选人的经历证据逐项对照。',
    output: ['匹配度评分', '岗位要求拆解', '优势证据', '扣分原因', '投递前修改清单']
  },
  resume: {
    agent: 'Resume Rewrite Agent',
    name: 'AI 简历优化',
    system: '你是简历优化 Agent。将候选人经历改写为目标岗位能识别的证据链表达，强调动作、方法、产出、指标和岗位关键词。',
    output: ['简历诊断结论', '关键词映射', '经历排序建议', '可直接替换的中文简历 bullet', '需要补充的材料']
  },
  interview: {
    agent: 'Interview Coach Agent',
    name: '面试题生成',
    system: '你是追问式面试训练 Agent。根据目标岗位、JD、简历经历和能力短板生成高频题、追问题、回答框架和评分标准。',
    output: ['高频问题', '深挖追问', 'STAR 回答框架', '优秀回答标准', '风险问题提醒']
  }
}

const knowledgeBase = [
  { id:'input-schema', title:'职业画像输入字段', tags:['画像','采集','教育','专业','城市','偏好','限制','JD'], content:'职业画像应拆成独立字段：学历、专业、求职阶段、目标岗位、目标城市、行业偏好、岗位偏好、技能工具、项目经历、量化结果、价值观、限制条件、时间计划、目标 JD。分栏采集比大文本框更稳定，也便于计算完整度和能力雷达。' },
  { id:'career-readiness', title:'职业准备度能力框架', tags:['沟通','批判思维','技术','团队','专业素养','能力雷达'], content:'实习岗位评估应同时看专业技能和通用能力。可将沟通表达、批判分析、技术理解、项目推进、商业判断、自我发展映射到简历中的项目、工具、协作、量化结果与复盘。' },
  { id:'onet', title:'岗位画像维度', tags:['岗位','技能','能力','任务','工作活动','价值观'], content:'岗位画像不应只看岗位名，应同时拆解知识、技能、能力、任务、工作活动、工作价值和工作情境。职业推荐需要把岗位要求与候选人可验证证据相匹配。' },
  { id:'evidence-chain', title:'简历证据链规则', tags:['简历','STAR','CAR','bullet','量化','关键词'], content:'高质量简历 bullet 应包含背景/问题、行动/方法、产出/结果、规模/指标和岗位关键词。避免只写负责/参与，要写清具体动作、使用工具、协作对象和业务影响。' },
  { id:'jd-match', title:'JD 匹配拆解方法', tags:['JD','匹配','职责','要求','加分项','扣分'], content:'JD 匹配应拆成职责任务、硬技能、软技能、行业经验、工具要求、加分项和隐性要求，再逐项映射到简历证据。匹配度要同时输出优势和扣分原因。' },
  { id:'interview-loop', title:'追问式面试训练', tags:['面试','STAR','追问','评分标准','项目复盘'], content:'面试训练要覆盖动机、项目背景、方案选择、数据验证、失败复盘、技术边界和后续迭代。回答先给结论，再用 STAR 或 CAR 展开，并补充权衡和验证。' },
  { id:'agent-router', title:'Agent Router 架构', tags:['Agent','路由','Prompt','任务分流'], content:'Agent Router 根据任务类型选择不同 Prompt、输入字段和输出结构。职业规划、JD 匹配、简历优化、面试训练应走不同 Agent，而不是同一套泛化问答。' },
  { id:'light-rag', title:'轻量 RAG 架构', tags:['RAG','检索','知识库','上下文','岗位库'], content:'轻量 RAG 可先用内置岗位知识库和方法论知识库做关键词检索，把相关片段注入模型上下文。后续可迁移到 Supabase pgvector，实现向量检索、文档切分和知识库更新。' },

  { id:'ai-product', title:'AI 产品岗位画像', tags:['AI产品','大模型','Prompt','Agent','RAG','模型评测'], content:'AI 产品关注模型能力到用户场景的转译，核心证据包括 Prompt 设计、Agent 流程、RAG 知识库、模型评测、异常兜底、产品原型和业务落地。' },
  { id:'llm-product', title:'大模型产品岗位画像', tags:['大模型产品','LLM','多轮对话','模型评估','安全'], content:'大模型产品需要理解模型边界、上下文窗口、多轮对话、输出稳定性、评测集、内容安全和成本控制。简历中应体现模型产品化思维。' },
  { id:'agent-product', title:'Agent 产品岗位画像', tags:['Agent','工具调用','工作流','任务编排','状态机'], content:'Agent 产品重视任务拆解、工具调用、状态流、记忆、错误恢复和人工接管。经历中应说明 Agent 如何选择工具、何时停止、如何保证结果可信。' },
  { id:'rag-product', title:'RAG 知识库产品岗位画像', tags:['RAG','知识库','Embedding','向量','检索','重排'], content:'RAG 产品关注知识采集、文档切分、embedding、召回、重排、引用、知识更新和权限。简历可突出知识库结构和检索质量评估。' },
  { id:'aigc', title:'AIGC 内容产品岗位画像', tags:['AIGC','内容生产','模板','审核','生成'], content:'AIGC 内容产品关注生成质量、模板体系、创作流程、审核机制、版权风险和效率提升。适合有内容、设计或生成工具项目的人。' },
  { id:'data-product', title:'数据产品岗位画像', tags:['数据产品','SQL','BI','指标体系','数据治理','数据仓库'], content:'数据产品关注指标体系、数据资产、数据治理、BI 看板、数据质量和业务归因。简历需要把工具能力落到业务问题、指标口径和决策场景。' },
  { id:'data-platform', title:'数据平台岗位画像', tags:['数据平台','元数据','血缘','质量','权限','ETL'], content:'数据平台产品关注数据开发、数据资产目录、元数据、血缘、质量监控、权限和平台效率。要求理解数据链路和工程协作。' },
  { id:'product-analytics', title:'产品数据分析岗位画像', tags:['产品分析','漏斗','留存','转化','A/B','归因'], content:'产品数据分析关注用户行为、漏斗、转化、留存、归因、实验和业务解释。输出应从数据发现问题，再转化为产品动作。' },
  { id:'business-analysis', title:'商业分析岗位画像', tags:['商业分析','市场','竞品','收入','战略','行业研究'], content:'商业分析关注市场规模、竞争格局、商业模式、收入结构和增长机会。适合具备结构化分析、数据处理和表达能力的人。' },
  { id:'tob-product', title:'ToB 产品岗位画像', tags:['ToB','SaaS','业务流程','权限','状态流','交付'], content:'ToB 产品强调多角色流程、权限体系、状态流、业务规则、客户沟通、验收和交付。经历中应写清流程和角色变化。' },
  { id:'saas-product', title:'SaaS 产品岗位画像', tags:['SaaS','订阅','组织架构','配置化','权限'], content:'SaaS 产品关注组织架构、权限、配置、套餐、订阅、工作台和客户成功链路。适合有平台、后台或企业服务经历的人。' },
  { id:'open-platform', title:'开放平台岗位画像', tags:['开放平台','API','SDK','开发者','接入'], content:'开放平台产品面向开发者，关注 API、SDK、Webhook、文档、接入流程、权限和生态合作。需要较强技术理解和文档表达。' },
  { id:'ux-research', title:'用户研究岗位画像', tags:['用户研究','访谈','问卷','可用性','用户画像'], content:'用户研究关注研究设计、访谈、问卷、可用性测试、用户画像、需求洞察和报告转化。简历要写清样本、方法和结论如何影响产品。' },
  { id:'ux-design', title:'交互设计岗位画像', tags:['交互设计','信息架构','原型','Figma','流程'], content:'交互设计关注信息架构、用户流程、原型、可用性和视觉协同。适合能把需求转成可操作界面和交互方案的人。' },
  { id:'growth', title:'增长产品岗位画像', tags:['增长','转化','留存','A/B','渠道','活动'], content:'增长产品关注获客、激活、转化、留存、复购和实验设计。简历应体现增长漏斗、实验假设、数据结果和复盘。' },
  { id:'product-ops', title:'产品运营岗位画像', tags:['产品运营','活动','用户反馈','复盘','社群','数据'], content:'产品运营连接产品功能、用户反馈、活动、数据复盘和增长动作。适合有执行、沟通和数据复盘经验的人。' },
  { id:'market-ops', title:'市场运营岗位画像', tags:['市场运营','品牌','渠道','投放','传播','线索'], content:'市场运营关注品牌传播、渠道投放、活动策划、线索获取和效果复盘。强调执行力、内容表达和数据意识。' },
  { id:'customer-success', title:'客户成功岗位画像', tags:['客户成功','续约','客户反馈','使用率','SaaS'], content:'客户成功关注客户使用、问题反馈、价值交付、续约和扩容。需要沟通表达、业务理解和数据复盘能力。' },
  { id:'pre-sales', title:'售前解决方案岗位画像', tags:['售前','解决方案','客户需求','方案书','演示'], content:'售前解决方案需要理解客户业务、输出方案、做产品演示并支持商务推进。适合沟通强、有技术理解和行业分析能力的人。' },
  { id:'project-management', title:'项目管理岗位画像', tags:['项目管理','排期','协调','风险','交付'], content:'项目管理关注需求排期、资源协调、风险跟踪、交付验收和信息同步。简历应体现跨团队协作和闭环能力。' },
  { id:'implementation', title:'实施顾问岗位画像', tags:['实施','配置','培训','验收','上线'], content:'实施顾问将产品能力配置到客户场景，关注需求确认、配置、培训、验收和上线支持。需要耐心、表达和流程理解。' },
  { id:'gis', title:'GIS 数据产品岗位画像', tags:['GIS','ArcGIS','遥感','GEE','地图','空间分析'], content:'GIS 数据产品结合空间数据、地图交互、空间指标和行业场景。适合有地图、遥感、城市分析或地理数据经验的人。' },
  { id:'map', title:'地图产品岗位画像', tags:['地图','POI','路线规划','导航','定位'], content:'地图产品关注搜索、POI、路线、导航、定位、空间数据质量和场景体验。需要数据、交互和场景理解。' },
  { id:'fintech', title:'金融科技产品岗位画像', tags:['金融','风控','支付','交易','合规'], content:'金融科技产品强调账户、支付、风控、交易、合规和数据安全。经历中应体现严谨性和规则理解。' },
  { id:'edtech', title:'教育产品岗位画像', tags:['教育','课程','学习路径','测评','题库'], content:'教育产品关注课程、学习路径、测评、题库、反馈机制和学习数据。适合有教育、内容或学习场景项目的人。' },
  { id:'health', title:'医疗健康产品岗位画像', tags:['医疗','健康','问诊','随访','病历'], content:'医疗健康产品关注医患流程、问诊、随访、健康档案、合规和数据隐私。要求场景理解和沟通细致。' },
  { id:'ecommerce', title:'电商产品岗位画像', tags:['电商','商品','交易','履约','营销','转化'], content:'电商产品关注商品、交易、履约、营销、推荐和转化。简历中应体现交易链路和转化优化。' },
  { id:'community', title:'社区产品岗位画像', tags:['社区','UGC','互动','治理','创作者'], content:'社区产品关注内容生产、互动关系、分发机制、社区治理和创作者生态。适合有内容或社区经验的人。' },
  { id:'content-product', title:'内容产品岗位画像', tags:['内容产品','推荐','审核','分发','创作者'], content:'内容产品关注内容生产、审核、分发、推荐和消费体验。需要内容理解、数据分析和用户洞察。' },
  { id:'low-code', title:'低代码平台岗位画像', tags:['低代码','表单','流程','组件','配置'], content:'低代码产品关注表单、流程、组件、权限、配置和平台扩展性。需要技术理解和平台产品思维。' },
  { id:'collab', title:'协同办公产品岗位画像', tags:['办公','协同','文档','审批','权限'], content:'协同办公产品关注文档、日程、审批、消息、权限和团队协作。适合关注效率工具和组织协同的人。' },
  { id:'knowledge', title:'知识管理产品岗位画像', tags:['知识库','文档','搜索','权限','RAG'], content:'知识管理产品关注文档、搜索、权限、知识沉淀、问答和协作。可与 RAG 产品方向衔接。' }
]

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY
  if (!apiKey) return json(500, { error: 'Missing DEEPSEEK_API_KEY' })

  try {
    const body = JSON.parse(event.body || '{}')
    const { task = 'career', profileText = '', resumeText = '', jdText = '', rolePreference = '', userInput = '', selectedRole = null, roleCandidates = [], abilityScores = {} } = body
    const config = taskPrompts[task] || taskPrompts.career
    const query = [profileText, resumeText, jdText, rolePreference, userInput, selectedRole?.title, selectedRole?.description].filter(Boolean).join('\n')
    const retrieved = retrieve(query, task, selectedRole, roleCandidates)
    const agentTrace = [
      'Profile Parser：读取分栏画像、经历、技能证据、限制条件和目标 JD。',
      `RAG Retriever：检索 ${retrieved.map(x => x.title).join(' / ')}。`,
      `Task Router：当前进入 ${config.agent}。`,
      'Grounded Generation：把选中路径、能力雷达和知识上下文拼接后调用模型。'
    ]
    const systemPrompt = `${config.system}\n\n约束：\n1. 用中文输出，像真实产品内的分析报告。\n2. 不要提作品集、面试官或演示。\n3. 只依据用户提供的信息和检索上下文，不编造经历。\n4. 信息不足时必须说明缺口。\n5. 输出要具体、可执行、可复制。`
    const userPrompt = `当前任务：${config.name}\n当前 Agent：${config.agent}\n\n【结构化画像】\n${profileText || '未提供'}\n\n【简历/经历】\n${resumeText || '未提供'}\n\n【目标 JD/方向】\n${jdText || '未提供'}\n\n【偏好与限制】\n${rolePreference || '未提供'}\n\n【补充问题】\n${userInput || '无'}\n\n【职业路径 Top 4】\n${Array.isArray(roleCandidates) ? roleCandidates.map((r, i) => `${i + 1}. ${r.title}｜${r.score}/100｜${r.reason || r.description || ''}`).join('\n') : '未提供'}\n\n【当前选中路径】\n${selectedRole ? `${selectedRole.title}：${selectedRole.description}\n证据：${(selectedRole.evidence || []).join('、')}\n缺口：${(selectedRole.gaps || []).join('、')}` : '未选择'}\n\n【能力雷达】\n${Object.entries(abilityScores || {}).map(([k, v]) => `${k}: ${v}`).join(' / ') || '未提供'}\n\n【RAG 检索上下文】\n${retrieved.map(x => `- ${x.title}：${x.content}`).join('\n')}\n\n请严格输出：\n${config.output.map((x, i) => `${i + 1}. ${x}`).join('\n')}`
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], temperature: 0.58, max_tokens: 2600 })
    })
    if (!response.ok) return json(response.status, { error: await response.text() })
    const data = await response.json()
    return json(200, { text: data?.choices?.[0]?.message?.content || '模型暂未返回内容', source: 'api', context: retrieved.map(x => x.title), agentTrace })
  } catch (error) {
    return json(500, { error: String(error) })
  }
}

function retrieve(query, task, selectedRole, roleCandidates) {
  const source = String(query || '').toLowerCase()
  const roleTitles = [selectedRole?.title, ...(Array.isArray(roleCandidates) ? roleCandidates.map(r => r.title) : [])].filter(Boolean).join(' ').toLowerCase()
  return knowledgeBase.map(item => {
    const tagScore = item.tags.reduce((s, tag) => s + (source.includes(String(tag).toLowerCase()) ? 3 : 0), 0)
    const titleScore = source.includes(item.title.toLowerCase()) || roleTitles.includes(item.title.replace('岗位画像','').toLowerCase()) ? 4 : 0
    const taskScore = item.tags.includes(task) ? 2 : 0
    return { ...item, score: tagScore + titleScore + taskScore }
  }).sort((a, b) => b.score - a.score).slice(0, 8)
}
function json(statusCode, body) { return { statusCode, headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(body) } }
