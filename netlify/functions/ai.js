const taskPrompts = {
  career: {
    agent: 'Career Pathfinder Agent',
    name: '职业地图生成',
    system: '你是一个职业定位与岗位路径规划 Agent。你要基于候选人的背景、经历、偏好、能力雷达和动态推荐岗位，生成可信、可执行的职业路径。不要把职业推荐写成鸡汤，要给出证据、扣分项和下一步动作。',
    output: ['推荐岗位路径排序', '推荐依据与证据', '能力雷达解读', '短板与风险', '30/60/90 天行动计划']
  },
  match: {
    agent: 'JD Matching Agent',
    name: 'JD 匹配分析',
    system: '你是一个岗位匹配分析 Agent。你要把岗位 JD 拆成职责、硬技能、软技能、行业理解和加分项，再与候选人的经历证据逐项对照。',
    output: ['匹配度评分', '岗位要求拆解', '优势证据', '扣分原因', '投递前修改清单']
  },
  resume: {
    agent: 'Resume Rewrite Agent',
    name: 'AI 简历优化',
    system: '你是一个简历优化 Agent。你要把候选人经历改写为目标岗位能识别的证据链表达，强调动作、方法、产出、指标和岗位关键词。',
    output: ['简历诊断结论', '关键词映射', '经历排序建议', '可直接替换的简历 bullet', '需要补充的材料']
  },
  interview: {
    agent: 'Interview Coach Agent',
    name: '面试题生成',
    system: '你是一个追问式面试训练 Agent。你要根据目标岗位、JD、简历经历和能力短板生成高频题、追问题、回答框架和评分标准。',
    output: ['高频问题', '深挖追问', 'STAR 回答框架', '优秀回答标准', '风险问题提醒']
  }
}

const knowledgeBase = [
  { id: 'profile-inputs', title: '职业画像输入规范', tags: ['画像', '背景', '偏好', '价值观', '限制条件', '职业规划'], content: '职业定位建议至少采集教育专业、求职阶段、目标城市、行业偏好、岗位偏好、过往经历、技能工具、项目成果、价值观、工作方式偏好、时间限制和投递约束。信息越完整，职业路径和能力雷达越可信。' },
  { id: 'onet-model', title: 'O*NET 岗位分析维度', tags: ['岗位', '能力', '技能', '任务', '活动', '工作价值'], content: '岗位画像应同时考虑 worker-oriented 与 job-oriented 信息：知识、技能、能力、工作活动、任务、工作价值与工作情境。职业推荐不能只根据岗位名称，应对照岗位要求和个人证据。' },
  { id: 'nace-competencies', title: '职业准备度能力', tags: ['沟通', '批判思维', '领导力', '专业素养', '团队', '技术', '自我发展'], content: '职业准备度可参考沟通、批判思维、技术、团队、领导力、专业素养、职业自我发展等维度。对大学生或实习岗位，应把这些通用能力映射到具体项目证据。' },
  { id: 'ai-product', title: 'AI 产品岗位画像', tags: ['AI', '大模型', 'Prompt', 'Agent', 'RAG', '模型评测', '产品方案'], content: 'AI 产品岗位关注业务场景理解、用户需求拆解、Prompt 与 Agent 设计、RAG 知识库方案、模型效果评估、异常兜底和产品化落地。简历需要体现从模型能力到用户场景的转译能力。' },
  { id: 'data-product', title: '数据产品岗位画像', tags: ['SQL', 'Python', 'BI', '指标体系', '数据治理', '归因分析'], content: '数据产品岗位关注指标体系、数据建模、BI 看板、数据治理、数据质量、问题归因和跨团队推动。简历需要把工具能力落到业务问题和决策场景。' },
  { id: 'tob-product', title: 'ToB 产品岗位画像', tags: ['ToB', 'SaaS', '业务流程', '权限', '状态流', '交付'], content: 'ToB 产品强调多角色流程、权限体系、状态流、交付验收、客户沟通和业务规则沉淀。经历中应写清客户是谁、流程如何变化、上线/交付如何验证。' },
  { id: 'resume-method', title: '简历证据链方法', tags: ['简历', 'STAR', 'bullet', '量化', '关键词'], content: '简历 bullet 应采用问题场景、行动方法、产出结果的证据链，避免只写负责/参与。优先加入工具、角色、指标、规模、影响和岗位关键词。' },
  { id: 'interview-method', title: '追问式面试训练', tags: ['面试', 'STAR', '追问', '评分标准'], content: '面试题应覆盖动机、项目、方法、数据、技术边界、失败复盘和未来迭代。回答建议先给结论，再用 STAR 展开，并说明权衡和验证方式。' },
  { id: 'rag-agent-architecture', title: 'RAG 与 Agent 使用边界', tags: ['RAG', 'Agent', '检索', '路由', '上下文'], content: 'Agent 负责判断当前任务类型并选择对应提示词、工具和输出结构；RAG 负责根据用户画像、JD 与任务检索相关岗位画像和方法论片段，把外部知识作为上下文交给模型。' }
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
    const retrieved = retrieve(query, task)
    const agentTrace = [
      `Career Profile Parser：整合背景、经历、偏好、JD 与补充指令。`,
      `Role Retrieval：从岗位画像库检索 ${retrieved.map(x => x.title).join(' / ')}。`,
      `Task Router：当前进入 ${config.agent}。`,
      `Grounded Generation：把 Top 岗位、能力雷达和 RAG 上下文拼接后调用模型。`
    ]

    const systemPrompt = `${config.system}\n\n通用约束：\n1. 用中文输出，语气像真实产品内的分析报告。\n2. 不能说“作为AI作品/作品集/面试官”，只把它当作上线产品功能。\n3. 只依据用户提供的信息和RAG上下文，不编造用户没有提供的经历。\n4. 如果信息不足，要说明缺口，并给出补充信息清单。\n5. 输出必须具体、可执行、可复制。`

    const userPrompt = `当前任务：${config.name}\n当前 Agent：${config.agent}\n\n【用户画像】\n${profileText || '未提供'}\n\n【简历/经历】\n${resumeText || '未提供'}\n\n【目标岗位JD/方向】\n${jdText || '未提供'}\n\n【目标偏好与限制】\n${rolePreference || '未提供'}\n\n【补充指令】\n${userInput || '无'}\n\n【前端动态推荐出的职业路径 Top 4】\n${Array.isArray(roleCandidates) ? roleCandidates.map((r, i) => `${i + 1}. ${r.title}｜${r.score}/100｜${r.reason || r.description || ''}`).join('\n') : '未提供'}\n\n【当前选中路径】\n${selectedRole ? `${selectedRole.title}：${selectedRole.description}\n证据：${(selectedRole.evidence || []).join('、')}\n缺口：${(selectedRole.gaps || []).join('、')}` : '未选择'}\n\n【能力雷达分数】\n${Object.entries(abilityScores || {}).map(([k, v]) => `${k}: ${v}`).join(' / ') || '未提供'}\n\n【RAG 检索上下文】\n${retrieved.map(x => `- ${x.title}：${x.content}`).join('\n')}\n\n请严格输出以下栏目：\n${config.output.map((x, i) => `${i + 1}. ${x}`).join('\n')}\n\n任务特定要求：\n- 职业地图：必须给出 Top 4 岗位排序、每个岗位的推荐原因和风险。\n- JD 匹配：必须给出 0-100 分匹配度，以及扣分原因。\n- 简历优化：必须给出 3-5 条可直接复制的中文简历 bullet。\n- 面试题：必须给出至少 8 个问题，其中至少 4 个为追问题，并给出评分标准。`

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.58,
        max_tokens: 2600
      })
    })

    if (!response.ok) return json(response.status, { error: await response.text() })
    const data = await response.json()
    return json(200, { text: data?.choices?.[0]?.message?.content || '模型暂未返回内容', source: 'api', context: retrieved.map(x => x.title), agentTrace })
  } catch (error) {
    return json(500, { error: String(error) })
  }
}

function retrieve(query, task) {
  const source = String(query || '').toLowerCase()
  return knowledgeBase.map(item => {
    const tagScore = item.tags.reduce((s, tag) => s + (source.includes(String(tag).toLowerCase()) ? 3 : 0), 0)
    const taskScore = item.tags.includes(task) ? 2 : 0
    const titleScore = source.includes(item.title.toLowerCase()) ? 2 : 0
    return { ...item, score: tagScore + taskScore + titleScore }
  }).sort((a, b) => b.score - a.score).slice(0, 5)
}

function json(statusCode, body) {
  return { statusCode, headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(body) }
}
