import React, { useEffect, useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './style.css'

type Task = 'career' | 'match' | 'resume' | 'interview'
type Source = 'api' | 'fallback' | ''
type AbilityKey = 'product' | 'research' | 'data' | 'tech' | 'ai' | 'delivery' | 'communication' | 'business'
type ProfileFields = {
  education: string
  major: string
  stage: string
  targetRoles: string
  targetCities: string
  industries: string
  rolePreference: string
  skills: string
  projects: string
  metrics: string
  values: string
  constraints: string
  timeline: string
  resumeText: string
  jdText: string
  userInput: string
}
type RoleProfile = {
  id: string
  title: string
  family: string
  description: string
  keywords: string[]
  evidenceKeywords: string[]
  values: string[]
  priority: AbilityKey[]
  growth: string[]
}
type CandidateRole = RoleProfile & {
  score: number
  evidence: string[]
  gaps: string[]
  reason: string
}
type AbilityScores = Record<AbilityKey, number>
type GeneratedProfile = {
  completeness: ReturnType<typeof profileCompleteness>
  abilities: AbilityScores
  roles: CandidateRole[]
  generatedAt: number
}
type AiResponse = { text: string; source?: 'api' | 'fallback'; context?: string[]; agentTrace?: string[] }

const emptyFields: ProfileFields = {
  education: '', major: '', stage: '', targetRoles: '', targetCities: '', industries: '', rolePreference: '',
  skills: '', projects: '', metrics: '', values: '', constraints: '', timeline: '', resumeText: '', jdText: '', userInput: ''
}

const abilityLabels: Record<AbilityKey, string> = {
  product: '产品定义', research: '用户研究', data: '数据分析', tech: '技术理解',
  ai: 'AI 应用', delivery: '项目推进', communication: '沟通表达', business: '商业判断'
}

const taskMeta: Record<Task, { label: string; icon: string; title: string; description: string; placeholder: string; outputs: string[] }> = {
  career: {
    label: '职业规划', icon: '🌷', title: '把职业花园转成行动路线',
    description: '基于已生成的职业画像、能力雷达和选中路径，输出主路径、备选路径、短板补强和 30/60/90 天计划。',
    placeholder: '例如：我更想做 AI 产品，但担心技术背景不够，请判断主路径和 30 天补强动作。',
    outputs: ['主路径判断', '备选路径', '短板补强', '30/60/90 天计划']
  },
  match: {
    label: 'JD 匹配分析', icon: '🎯', title: '把 JD 拆成要求、证据和缺口',
    description: '结合当前选中路径、目标 JD 和简历证据，输出匹配度、扣分项、投递风险和投递前修改清单。',
    placeholder: '例如：请判断这份 JD 是否适合投递，指出最影响通过率的 3 个缺口。',
    outputs: ['匹配度评分', '要求拆解', '优势证据', '扣分原因']
  },
  resume: {
    label: 'AI 简历优化', icon: '✍️', title: '把经历改写成目标岗位能识别的证据',
    description: '围绕选中岗位和 JD，重排经历优先级，提取关键词，并生成可直接替换的中文简历 bullet。',
    placeholder: '例如：把我的项目经历改成更适合数据产品实习生，突出指标体系和项目推进。',
    outputs: ['关键词映射', '简历诊断', '可复制 bullet', '补充材料']
  },
  interview: {
    label: '面试题生成', icon: '💬', title: '生成岗位与经历相关的追问训练',
    description: '根据岗位路径、JD、经历证据和能力短板，生成高频题、深挖追问、回答框架和评分标准。',
    placeholder: '例如：围绕 AI 求职系统项目，生成产品岗面试会追问的问题和回答框架。',
    outputs: ['高频题', '追问题', 'STAR 框架', '评分标准']
  }
}

function role(id: string, title: string, family: string, description: string, priority: AbilityKey[], keywords: string[], values: string[] = [], growth: string[] = []): RoleProfile {
  return { id, title, family, description, priority, keywords, evidenceKeywords: keywords, values, growth: growth.length ? growth : ['岗位关键词证据', '1 个可展示项目', 'JD 对齐简历', '面试追问材料'] }
}

const roleCatalog: RoleProfile[] = [
  role('ai-product', 'AI 产品实习生', 'AI 产品', '把模型能力、业务场景和用户需求转译为可落地产品流程。', ['ai','product','tech','research'], ['AI','大模型','Prompt','Agent','RAG','模型评测','产品方案','PRD','原型','用户需求'], ['创新','产品','技术']),
  role('llm-product', '大模型产品实习生', 'AI 产品', '负责大模型能力边界、对话流程、评测指标和场景落地。', ['ai','product','tech'], ['LLM','大模型','模型评估','多轮对话','提示词','安全兜底','评测','API']),
  role('agent-product', 'Agent 产品实习生', 'AI 产品', '设计任务编排、工具调用、状态流和 Agent 工作流。', ['ai','tech','product','delivery'], ['Agent','工具调用','工作流','任务拆解','路由','Planning','Memory','状态机']),
  role('rag-product', 'RAG 知识库产品实习生', 'AI 产品', '围绕知识库、检索、向量召回和知识更新设计问答产品。', ['ai','data','tech','product'], ['RAG','Embedding','向量','知识库','检索','召回','重排','文档切分','pgvector']),
  role('aigc-content-product', 'AIGC 内容产品实习生', 'AI 内容', '把生成式 AI 能力接入文案、图片、PPT、视频等内容生产场景。', ['ai','product','business'], ['AIGC','文案','图片生成','视频生成','PPT','内容生产','模板','审核']),
  role('ai-solution', 'AI 解决方案助理', 'AI 解决方案', '面向行业客户梳理 AI 场景、方案和落地路径。', ['ai','business','communication','delivery'], ['解决方案','客户','行业','AI落地','售前','方案','需求调研','交付']),
  role('data-product', '数据产品实习生', '数据产品', '围绕指标体系、数据治理、看板和归因分析支撑业务决策。', ['data','product','tech','business'], ['SQL','Python','BI','指标体系','数据仓库','数据建模','归因分析','看板','数据治理']),
  role('data-platform-product', '数据平台产品实习生', '数据平台', '设计数据开发、资产目录、权限、血缘和质量监控能力。', ['data','tech','product','delivery'], ['数据平台','数据资产','数据血缘','数据质量','权限','元数据','数据目录','ETL']),
  role('bi-product', 'BI 产品实习生', '商业智能', '把报表、可视化、指标口径和自助分析做成可用的数据产品。', ['data','product','business'], ['BI','Tableau','PowerBI','报表','可视化','指标口径','看板','自助分析']),
  role('product-analyst', '产品数据分析实习生', '产品分析', '用漏斗、留存、转化和归因解释产品问题并推动迭代。', ['data','business','product'], ['漏斗','留存','转化率','A/B Test','归因','用户分层','Excel','SQL','数据分析']),
  role('business-analyst', '商业分析实习生', '商业分析', '围绕市场、竞品、收入模型和战略路径完成结构化分析。', ['business','data','research','communication'], ['商业分析','市场','竞品','收入','商业模式','策略','客户','行业研究']),
  role('strategy-analyst', '战略分析实习生', '战略分析', '研究行业格局、竞争路径、市场规模和业务增长机会。', ['business','research','data'], ['战略','行业研究','市场规模','竞争格局','商业模式','增长机会','分析报告']),
  role('tob-product', 'ToB 产品实习生', '企业服务', '拆解企业客户流程、权限、状态流和交付链路，推动需求上线。', ['product','research','delivery','communication'], ['ToB','SaaS','业务流程','需求调研','权限','状态流','项目推进','验收','交付','客户']),
  role('saas-product', 'SaaS 产品助理', '企业服务', '设计订阅、权限、组织架构、数据面板和配置化能力。', ['product','tech','delivery'], ['SaaS','订阅','组织架构','权限','配置化','工作台','企业客户']),
  role('b-end-product', 'B 端平台产品实习生', '平台产品', '建设平台能力、后台系统、角色权限和运营配置工具。', ['product','tech','delivery'], ['后台','平台','权限','配置','运营后台','审核','角色','状态流']),
  role('open-platform-product', '开放平台产品实习生', '开放平台', '围绕 API、开发者文档、SDK、接入流程和生态合作设计产品。', ['tech','product','communication'], ['开放平台','API','SDK','开发者','文档','接入','生态','Webhook']),
  role('crm-product', 'CRM 产品实习生', 'CRM', '设计客户线索、销售流程、商机、跟进和业绩分析功能。', ['business','product','data'], ['CRM','线索','商机','销售漏斗','客户管理','跟进','转化']),
  role('erp-product', 'ERP 产品实习生', 'ERP', '梳理采购、库存、财务、审批和业务流转规则。', ['product','business','delivery'], ['ERP','库存','采购','审批','财务','流程','单据','供应链']),
  role('fintech-product', '金融科技产品实习生', '金融产品', '处理账户、风控、交易、合规和金融数据产品场景。', ['business','data','tech'], ['金融','风控','交易','账户','合规','支付','信贷','证券']),
  role('edtech-product', '教育产品实习生', '教育产品', '围绕学习路径、测评、课程、练习和反馈机制设计产品。', ['research','product','data'], ['教育','课程','学习路径','测评','题库','打卡','学习数据']),
  role('health-product', '医疗健康产品实习生', '医疗产品', '梳理医患流程、问诊、随访、健康档案和合规要求。', ['research','product','communication'], ['医疗','健康','问诊','随访','医患','病历','健康档案','合规']),
  role('gis-data-product', 'GIS 数据产品实习生', '空间数据', '把空间数据、地图交互和行业场景结合成可解释的数据产品。', ['data','tech','product'], ['GIS','ArcGIS','遥感','GEE','空间分析','地图','POI','可视化','指标库']),
  role('map-product', '地图产品实习生', '地图出行', '设计地图搜索、路线规划、POI、定位和导航体验。', ['product','data','tech'], ['地图','POI','路线规划','导航','定位','地理编码','出行']),
  role('iot-product', 'IoT 产品实习生', '物联网', '把设备、数据采集、告警、远程控制和平台管理结合起来。', ['tech','product','data'], ['IoT','设备','传感器','告警','远程控制','物联网','数据采集']),
  role('hardware-product', '智能硬件产品助理', '智能硬件', '结合硬件能力、App 体验、供应链和用户场景定义产品。', ['product','tech','business'], ['硬件','App','设备','供应链','蓝牙','传感器','用户场景']),
  role('ux-research', '用户研究实习生', '用户研究', '通过访谈、问卷、可用性测试和画像沉淀用户洞察。', ['research','communication','business'], ['用户研究','访谈','问卷','可用性测试','用户画像','需求洞察','竞品分析']),
  role('ux-designer', '交互设计实习生', '体验设计', '把用户流程、信息架构、原型和可用性问题转化为交互方案。', ['research','product','communication'], ['交互设计','用户流程','信息架构','原型','Figma','可用性','体验地图']),
  role('service-design', '服务设计实习生', '服务设计', '梳理跨触点体验、服务蓝图、前后台流程和用户旅程。', ['research','product','communication'], ['服务设计','服务蓝图','旅程图','触点','前后台流程','体验']),
  role('c-end-product', 'C 端产品助理', 'C 端产品', '围绕用户增长、核心功能、体验优化和商业化设计产品。', ['product','research','data','business'], ['C端','用户增长','体验','核心功能','留存','转化','商业化']),
  role('community-product', '社区产品实习生', '社区产品', '设计内容分发、互动、社区治理、创作者和用户关系。', ['research','business','communication'], ['社区','内容','互动','治理','创作者','UGC','评论','推荐']),
  role('content-product', '内容产品实习生', '内容产品', '建设内容生产、分发、审核、推荐和消费体验。', ['product','business','data'], ['内容产品','推荐','审核','分发','消费','创作者','内容质量']),
  role('ecommerce-product', '电商产品实习生', '电商产品', '围绕商品、交易、履约、营销和转化设计体验。', ['business','product','data'], ['电商','商品','交易','履约','营销','购物车','转化']),
  role('growth-product', '增长产品实习生', '增长', '围绕获客、激活、转化、留存和复购设计增长实验。', ['business','data','product','delivery'], ['增长','转化','留资','社群','活动','渠道','A/B','内容策略']),
  role('product-ops', '产品运营实习生', '产品运营', '把产品功能、用户反馈、活动、数据复盘和增长动作串联起来。', ['business','communication','data','delivery'], ['产品运营','活动','用户反馈','复盘','社群','数据','增长','内容']),
  role('user-ops', '用户运营实习生', '用户运营', '围绕分层、激活、留存、召回和用户反馈运营用户。', ['communication','data','business'], ['用户运营','用户分层','留存','召回','社群','活动','反馈']),
  role('content-ops', '内容运营实习生', '内容运营', '负责内容选题、排期、分发、数据复盘和内容策略。', ['communication','business','data'], ['内容运营','选题','排期','分发','数据复盘','账号','增长']),
  role('market-ops', '市场运营实习生', '市场运营', '围绕活动、渠道、传播、线索和品牌增长执行运营。', ['business','communication','delivery'], ['市场运营','活动','渠道','传播','品牌','线索','投放']),
  role('project-management', '项目管理实习生', '项目管理', '跟进需求排期、资源协调、风险管理和交付闭环。', ['delivery','communication','business'], ['项目管理','排期','协调','风险','交付','里程碑','跟进']),
  role('implementation-consultant', '实施顾问助理', '实施交付', '面向客户完成需求配置、培训、验收和上线支持。', ['delivery','communication','product'], ['实施','客户培训','配置','验收','上线','交付','SOP']),
  role('customer-success', '客户成功实习生', '客户成功', '跟进客户使用、续约、问题反馈和价值交付。', ['communication','business','data'], ['客户成功','续约','客户反馈','使用率','价值交付','SaaS']),
  role('pre-sales', '售前解决方案助理', '售前', '理解客户需求、设计方案、准备材料并支持商务推进。', ['business','communication','tech'], ['售前','解决方案','客户需求','方案书','演示','商务']),
  role('qa-product', '产品测试实习生', '质量保障', '围绕需求验收、测试用例、缺陷跟踪和上线质量保障。', ['tech','delivery','product'], ['测试','用例','缺陷','验收','质量','回归','上线']),
  role('data-ops', '数据运营实习生', '数据运营', '维护数据口径、数据质量、业务报表和日常分析。', ['data','delivery','business'], ['数据运营','数据质量','报表','口径','业务分析','Excel','SQL']),
  role('risk-data', '风控数据分析实习生', '风控数据', '围绕风险识别、规则策略、模型监控和异常分析支持业务。', ['data','business','tech'], ['风控','规则','异常','模型监控','风险','策略','SQL']),
  role('supply-chain-product', '供应链产品实习生', '供应链产品', '设计采购、库存、履约、仓配和供应链协同流程。', ['business','product','data'], ['供应链','库存','采购','仓配','履约','物流','订单']),
  role('hr-saas-product', '人力资源 SaaS 产品实习生', 'HR SaaS', '围绕招聘、组织、绩效、审批和员工体验设计产品。', ['product','business','research'], ['HR','招聘','绩效','组织','审批','员工体验','SaaS']),
  role('knowledge-product', '知识管理产品实习生', '知识管理', '建设文档、知识库、搜索、权限和协作流程。', ['product','tech','ai'], ['知识库','文档','搜索','权限','协作','RAG','知识管理']),
  role('collaboration-product', '协同办公产品实习生', '协同办公', '围绕文档、日程、审批、消息、权限和团队协作设计功能。', ['product','research','business'], ['办公','协同','文档','日程','审批','消息','权限','团队']),
  role('low-code-product', '低代码产品实习生', '低代码平台', '面向表单、流程、组件、权限和配置能力设计平台。', ['tech','product','delivery'], ['低代码','表单','流程','组件','配置','权限','平台']),
  role('game-product', '游戏产品实习生', '游戏产品', '围绕玩法、数值、活动、留存和商业化分析游戏体验。', ['research','data','business'], ['游戏','玩法','数值','活动','留存','商业化','玩家']),
  role('overseas-product', '海外产品实习生', '海外产品', '结合本地化、增长、合规和跨文化用户研究设计产品。', ['business','research','communication'], ['海外','本地化','跨文化','增长','合规','市场','用户研究'])
]

const floatingRoleNames = roleCatalog.map(r => r.title.replace('实习生','').replace('助理',''))

const fieldHelp = {
  education: '学校层次/学历，例如本科、硕士、转专业等。',
  major: '专业和课程方向，例如信管、数字媒体、心理学、GIS、计算机等。',
  stage: '当前求职阶段，例如刚开始探索、已投递、准备面试、希望转方向。',
  targetRoles: '你想投或不确定的岗位，可以写多个方向。',
  targetCities: '城市、远程/线下、到岗时间等。',
  industries: '偏好的行业或公司类型，例如 AI、SaaS、办公软件、医疗、政务等。',
  rolePreference: '工作方式和限制条件，例如不想纯运营、希望数据/AI 结合等。',
  skills: '工具和方法，例如 SQL、Python、Figma、Prompt、Agent、RAG、PRD。',
  projects: '项目/实习经历，写清背景、动作、产出和你的职责。',
  metrics: '量化结果或证据，例如样本数、转化率、提升幅度、上线结果。',
  values: '职业价值观，例如成长、稳定、影响力、技术深度、商业结果。',
  constraints: '限制条件，例如时间、地域、薪资、实习周期、通勤、签证等。',
  timeline: '准备计划或投递节奏，例如 2 周改简历、1 个月投递 30 个岗位。',
  jdText: '粘贴目标 JD，包含职责、要求、加分项和岗位名称。',
  userInput: '本次希望 AI 重点回答的问题。'
}

function lower(text: string) { return text.toLowerCase() }
function clamp(n: number, min = 18, max = 98) { return Math.max(min, Math.min(max, Math.round(n))) }
function hits(text: string, list: string[]) { const s = lower(text); return list.filter(k => s.includes(lower(k))) }
function uniq<T>(arr: T[]) { return Array.from(new Set(arr)) }
function loadFields(): ProfileFields { try { return { ...emptyFields, ...JSON.parse(localStorage.getItem('jo_fields_v3') || '{}') } } catch { return emptyFields } }
function compileProfile(fields: ProfileFields) {
  return [`教育/学历：${fields.education}`, `专业/课程：${fields.major}`, `求职阶段：${fields.stage}`, `目标岗位：${fields.targetRoles}`, `目标城市：${fields.targetCities}`, `行业偏好：${fields.industries}`, `岗位偏好与限制：${fields.rolePreference}`, `技能工具：${fields.skills}`, `项目/实习经历：${fields.projects}`, `量化结果：${fields.metrics}`, `价值观：${fields.values}`, `限制条件：${fields.constraints}`, `时间计划：${fields.timeline}`].filter(Boolean).join('\n')
}
function combinedText(fields: ProfileFields) { return `${compileProfile(fields)}\n简历附件/补充经历：${fields.resumeText}\n目标JD：${fields.jdText}\n补充问题：${fields.userInput}` }

function computeAbilities(text: string): AbilityScores {
  const groups: Record<AbilityKey, string[]> = {
    product: ['产品','需求','PRD','原型','流程','用户故事','功能','竞品','方案','MVP','路线图','平台','权限','体验'],
    research: ['访谈','问卷','调研','用户画像','可用性','洞察','样本','旅程图','痛点','共情','服务蓝图'],
    data: ['SQL','Python','BI','指标','数据','漏斗','归因','分析','建模','ArcGIS','GEE','Tableau','PowerBI','数据仓库','留存','转化'],
    tech: ['React','TypeScript','API','接口','数据库','前端','后端','部署','架构','Supabase','Netlify','SDK','低代码','Webhook'],
    ai: ['AI','AIGC','大模型','LLM','Prompt','Agent','RAG','DeepSeek','向量','模型','生成','Embedding','知识库'],
    delivery: ['上线','推动','迭代','验收','交付','协同','评审','落地','闭环','排期','里程碑','SOP'],
    communication: ['汇报','沟通','访谈','协同','跨团队','客户','医护','管理层','表达','培训','售前','用户反馈'],
    business: ['商业','市场','转化','增长','营收','客户','策略','行业','竞品','成本','收入','ROI','续约','留资']
  }
  const lengthBoost = Math.min(8, Math.floor(text.length / 420))
  const numericBoost = /\d+|%|万|亿|KPI|ROI|DAU|UV|PV/i.test(text) ? 4 : 0
  return Object.fromEntries(Object.entries(groups).map(([key, ks]) => {
    const found = hits(text, ks)
    return [key, clamp(30 + found.length * 6.5 + lengthBoost + numericBoost, 8, 96)]
  })) as AbilityScores
}
function weightedAbility(scores: AbilityScores, priority: AbilityKey[]) {
  const base = Object.values(scores).reduce((a,b)=>a+b,0) / Object.values(scores).length
  const focus = priority.reduce((s,k)=>s + scores[k],0) / priority.length
  return focus * .72 + base * .28
}
function generateRoles(fields: ProfileFields, abilities: AbilityScores) {
  const text = combinedText(fields)
  return roleCatalog.map(r => {
    const evidence = uniq([...hits(text, r.evidenceKeywords), ...hits(text, r.values), ...hits(fields.jdText, r.keywords)])
    const abilityScore = weightedAbility(abilities, r.priority)
    const keywordScore = Math.min(22, evidence.length * 2.3)
    const titleBoost = lower(`${fields.targetRoles} ${fields.rolePreference} ${fields.jdText}`).includes(lower(r.title.replace(/实习生|助理/g,''))) ? 7 : 0
    const familyBoost = lower(`${fields.targetRoles} ${fields.industries} ${fields.rolePreference}`).includes(lower(r.family)) ? 5 : 0
    const score = clamp(abilityScore * .74 + keywordScore + titleBoost + familyBoost, 18, 98)
    const gaps = r.keywords.filter(k => !evidence.some(e => lower(e) === lower(k))).slice(0, 5)
    const reason = evidence.length ? `已识别到 ${evidence.slice(0, 4).join('、')} 等证据，和「${r.family}」路径较相关。` : `当前证据偏少，系统主要依据能力权重给出初步推荐。`
    return { ...r, score, evidence: evidence.slice(0, 8), gaps, reason }
  }).sort((a,b)=>b.score-a.score).slice(0,4)
}
function profileCompleteness(fields: ProfileFields) {
  const checks = [
    { label:'学历', ok: fields.education.trim().length > 1 },
    { label:'专业', ok: fields.major.trim().length > 1 },
    { label:'求职阶段', ok: fields.stage.trim().length > 3 },
    { label:'目标岗位', ok: fields.targetRoles.trim().length > 2 },
    { label:'目标城市', ok: fields.targetCities.trim().length > 1 },
    { label:'行业偏好', ok: fields.industries.trim().length > 2 },
    { label:'技能工具', ok: fields.skills.trim().length > 5 },
    { label:'项目经历', ok: fields.projects.trim().length > 40 || fields.resumeText.trim().length > 80 },
    { label:'量化结果', ok: fields.metrics.trim().length > 5 || /\d+|%|万|KPI|ROI|提升|降低|增长|样本|用户/i.test(fields.projects + fields.resumeText) },
    { label:'价值观', ok: fields.values.trim().length > 2 },
    { label:'限制条件', ok: fields.constraints.trim().length > 2 || fields.rolePreference.trim().length > 15 },
    { label:'时间计划', ok: fields.timeline.trim().length > 2 },
    { label:'目标 JD', ok: fields.jdText.trim().length > 60 }
  ]
  const ready = checks.filter(x=>x.ok)
  const missing = checks.filter(x=>!x.ok)
  const score = Math.round(ready.length / checks.length * 100)
  const confidence = score >= 85 ? '高置信' : score >= 60 ? '中等置信' : score >= 35 ? '初步画像' : '信息不足'
  return { checks, ready, missing, score, confidence }
}
function topAbilitySignals(scores: AbilityScores) {
  return Object.entries(scores).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>`${abilityLabels[k as AbilityKey]} ${v}`)
}
function point(score: number, index: number, total: number, size = 300) {
  const c = size / 2
  const radius = (score / 100) * 112
  const angle = (-90 + index * (360 / total)) * Math.PI / 180
  return `${c + radius * Math.cos(angle)},${c + radius * Math.sin(angle)}`
}
function AbilityRadar({ scores, ready }: { scores: AbilityScores; ready: boolean }) {
  const entries = Object.entries(abilityLabels).map(([key,label]) => [key as AbilityKey, label, scores[key as AbilityKey] || 0] as const)
  const points = entries.map(([, , score], i) => point(score, i, entries.length)).join(' ')
  return <div className="radarCard">
    <div className="cardLabel">Ability Radar</div>
    <h3>{ready ? '能力雷达已生成' : '等待生成能力结构'}</h3>
    <p className="emptyHint">点击「生成职业画像」后，系统会根据分栏信息、简历证据和目标 JD 计算 8 个能力维度。</p>
    <svg viewBox="0 0 300 300" className="radar" role="img" aria-label="能力雷达图">
      {[25,50,75,100].map(r => <polygon key={r} points={entries.map((_, i) => point(r, i, entries.length)).join(' ')} className="radarGrid" />)}
      {entries.map((_, i) => { const [x,y] = point(100, i, entries.length).split(','); return <line key={i} x1="150" y1="150" x2={x} y2={y} className="radarAxis" /> })}
      {ready && <polygon points={points} className="radarArea" />}
      {entries.map(([key,label,score], i) => { const [x,y] = point(118, i, entries.length).split(',').map(Number); const [dx,dy] = point(score, i, entries.length).split(',').map(Number); return <g key={key}>{ready && <circle cx={dx} cy={dy} r="4.5" className="radarDot" />}<text x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="radarText">{label}</text></g> })}
    </svg>
    <div className="scoreGrid">{entries.map(([key,label,score]) => <span key={key}><b>{ready ? score : '—'}</b>{label}</span>)}</div>
  </div>
}
function fallback(task: Task, data: { fields: ProfileFields; selectedRole?: CandidateRole; roleCandidates: CandidateRole[]; abilityScores: AbilityScores }) {
  const selected = data.selectedRole || data.roleCandidates[0]
  const candidateList = data.roleCandidates.map((r,i)=>`${i+1}. ${r.title}：${r.score}/100｜${r.reason}`).join('\n')
  const radar = Object.entries(abilityLabels).map(([k,l])=>`${l}${data.abilityScores[k as AbilityKey]}`).join(' / ')
  const gaps = selected?.gaps?.slice(0,4).join('、') || '量化结果、岗位关键词、业务影响'
  if (task === 'career') return `# 职业规划\n\n## 1. 推荐路径\n${candidateList || '请先生成职业画像。'}\n\n## 2. 当前主路径\n${selected ? `建议优先探索「${selected.title}」。${selected.reason}` : '尚未选择。'}\n\n## 3. 能力雷达摘要\n${radar}\n\n## 4. 需要补强\n${gaps}\n\n## 5. 行动计划\n- 7 天：补齐目标岗位关键词和项目证据。\n- 30 天：完成 2 份不同路径简历版本。\n- 60 天：围绕主路径完成投递、复盘和面试训练。`
  if (task === 'match') return `# JD 匹配分析\n\n## 1. 匹配度\n${selected ? `${selected.title}：${selected.score}/100。` : '请先选择职业路径。'}\n\n## 2. 优势证据\n${selected?.evidence?.length ? selected.evidence.map(e=>`- ${e}`).join('\n') : '- 当前经历证据不足。'}\n\n## 3. 扣分项\n${selected?.gaps?.map(g=>`- ${g}：缺少清晰证据。`).join('\n') || '- 目标 JD 信息不足。'}\n\n## 4. 投递动作\n把简历前 1/3 改成与 JD 最相关的项目证据，优先展示工具、动作、产出、指标。`
  if (task === 'resume') return `# 简历优化\n\n## 1. 改写方向\n围绕「${selected?.title || '目标岗位'}」强化 ${selected?.evidence?.slice(0,4).join('、') || '岗位相关证据'}。\n\n## 2. 可直接替换的 bullet\n- 基于求职画像、目标 JD 和岗位能力权重，拆解职业定位、岗位匹配、简历优化与面试训练链路，提升推荐结果的可解释性。\n- 设计分栏画像采集表单，覆盖教育、专业、技能、项目、量化结果、价值观与限制条件，降低用户输入混乱度。\n- 通过服务端 Agent Router 封装模型调用与 RAG 上下文拼接，按任务类型输出职业规划、JD 匹配、简历改写和面试训练结果。\n\n## 3. 待补充\n${gaps}`
  return `# 面试题生成\n\n1. 为什么把职业推荐设计成“莫奈花园职业地图”？\n2. 能力雷达的输入字段和评分逻辑是什么？\n3. 为什么职业画像需要分栏采集，而不是一个大文本框？\n4. Agent Router 和 RAG 分别解决什么问题？\n5. 如果用户信息不足，系统如何避免误导？\n6. 如何验证 JD 匹配分数有效？\n7. 岗位库扩展后如何保证排序可信？\n8. 文件解析、登录和历史记录后续如何接入？`
}

function App() {
  const [task, setTask] = useState<Task>('career')
  const [fields, setFields] = useState<ProfileFields>(() => loadFields())
  const [generated, setGenerated] = useState<GeneratedProfile | null>(null)
  const [dirty, setDirty] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [result, setResult] = useState('填写画像后点击「生成职业画像」，再选择一条职业路径，最后使用 AI 工作台生成具体建议。')
  const [source, setSource] = useState<Source>('')
  const [loading, setLoading] = useState(false)
  const [fileNote, setFileNote] = useState('支持 txt / md / csv / json 文本附件读取；PDF / DOCX 可先复制正文粘贴，后续可接入服务端解析。')
  useEffect(() => localStorage.setItem('jo_fields_v3', JSON.stringify(fields)), [fields])
  function update<K extends keyof ProfileFields>(key: K, value: ProfileFields[K]) { setFields(prev => ({ ...prev, [key]: value })); setDirty(true) }
  function clearAll() { setFields(emptyFields); setGenerated(null); setDirty(false); setSelectedRoleId(''); setSource(''); setResult('已清空画像。请重新填写分栏信息并生成职业画像。'); localStorage.removeItem('jo_fields_v3') }
  function handleFile(file: File | undefined) {
    if (!file) return
    const canRead = /text|json|csv|markdown|plain/.test(file.type) || /\.(txt|md|csv|json)$/i.test(file.name)
    if (!canRead) { setFileNote(`已选择 ${file.name}。当前前端安全读取文本文件；PDF / DOCX 建议先复制正文粘贴，后续可接服务端解析。`); return }
    const reader = new FileReader()
    reader.onload = () => { const text = String(reader.result || ''); update('resumeText', text.slice(0, 15000)); setFileNote(`已读取 ${file.name}，共 ${text.length} 字符，已填入简历文本。`) }
    reader.readAsText(file, 'utf-8')
  }
  const liveCompleteness = useMemo(() => profileCompleteness(fields), [fields])
  const missingSuggestions = liveCompleteness.missing.length ? liveCompleteness.missing.map(x=>x.label) : ['目标公司类型','薪资预期','投递节奏','作品链接','到岗时间']
  const displayScores = generated?.abilities || Object.fromEntries(Object.keys(abilityLabels).map(k=>[k,0])) as AbilityScores
  const roleCandidates = generated?.roles || []
  const selectedRole = roleCandidates.find(r=>r.id === selectedRoleId) || roleCandidates[0]
  function generateProfile() {
    const text = combinedText(fields)
    const abilities = computeAbilities(text)
    const roles = generateRoles(fields, abilities)
    const completeness = profileCompleteness(fields)
    setGenerated({ completeness, abilities, roles, generatedAt: Date.now() })
    setDirty(false)
    setSelectedRoleId(roles[0]?.id || '')
    setResult(`职业画像已生成。当前 Top 1 路径为「${roles[0]?.title || '暂无'}」。你可以点击其他职业花朵切换上下文，再使用 AI 工作台。`)
  }
  async function generate() {
    if (!generated) { generateProfile(); return }
    setLoading(true); setSource('')
    const payload = { task, profileText: compileProfile(fields), resumeText: fields.resumeText || fields.projects, jdText: fields.jdText, rolePreference: `${fields.rolePreference}\n${fields.constraints}\n${fields.timeline}`, userInput: fields.userInput, selectedRole, roleCandidates, abilityScores: displayScores }
    try {
      const res = await fetch('/api/ai', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error(await res.text())
      const data: AiResponse = await res.json()
      const trace = data.agentTrace?.length ? `\n\n---\nAgent Trace\n${data.agentTrace.map((s,i)=>`${i+1}. ${s}`).join('\n')}` : ''
      setResult(`${data.text || '模型暂未返回内容'}${trace}`); setSource(data.source || 'api')
    } catch {
      setResult(fallback(task, { fields, selectedRole, roleCandidates, abilityScores: displayScores })); setSource('fallback')
    } finally { setLoading(false) }
  }
  const formFields: Array<[keyof ProfileFields,string,'input'|'textarea']> = [
    ['education','学历/学校背景','input'], ['major','专业/课程方向','input'], ['stage','求职阶段','input'], ['targetRoles','目标岗位','input'],
    ['targetCities','目标城市/到岗方式','input'], ['industries','行业偏好','input'], ['skills','技能工具','textarea'], ['projects','项目/实习经历','textarea'],
    ['metrics','量化结果/能力证据','textarea'], ['values','价值观/工作偏好','textarea'], ['constraints','限制条件','textarea'], ['timeline','时间计划','textarea']
  ]
  return <main>
    <nav className="nav"><a className="brand" href="#top"><span className="brandMark">🌺</span><span>求职奥德赛 AI</span></a><div className="navLinks"><a href="#profile">画像采集</a><a href="#garden">职业地图</a><a href="#workspace">AI 工作台</a><a href="#system">系统架构</a></div></nav>
    <section id="top" className="hero"><div className="heroCopy"><span className="eyebrow">Career Odyssey Agent</span><h1>先把信息讲清楚，再把职业路径种出来。</h1><p>分栏采集背景、经历、技能、偏好、限制和目标 JD；点击生成后，系统会输出职业花园、能力雷达和可继续追问的 AI 上下文。</p><div className="heroActions"><a href="#profile" className="primaryBtn">开始填写画像</a><a href="#system" className="secondaryBtn">查看系统链路</a></div></div><div className="roleCloud">{floatingRoleNames.slice(0,28).map((name,i)=><span key={name} className={`bubble b${i%9}`}>{name}</span>)}</div></section>
    <section className="productIntro section"><div><span className="sectionKicker">Product Flow</span><h2>从画像到行动建议</h2></div><p>先完成结构化画像，再生成职业地图和能力雷达；选中岗位路径后，AI 工作台会围绕该路径继续做 JD 匹配、简历优化、面试训练和职业规划。</p><div className="flowPills"><span>分栏画像</span><span>岗位库匹配</span><span>能力建模</span><span>Agent 生成</span></div></section>
    <section id="profile" className="section profileGrid"><div className="sectionHead"><span className="sectionKicker">Step 01</span><h2>画像采集</h2><p>每一项信息都会影响后续推荐。填完后点击「生成职业画像」，系统才会生成职业花园和能力雷达，避免边输入边抖动。</p></div><div className="profileQuality formCard"><div className="qualityTop"><span>画像完整度 · {liveCompleteness.confidence}</span><b>{liveCompleteness.score}%</b></div><div className="qualityBar"><i style={{width:`${liveCompleteness.score}%`}} /></div><div className="qualityChecks">{liveCompleteness.checks.map(item=><em key={item.label} className={item.ok?'ok':''}>{item.ok?'✓':'○'} {item.label}</em>)}</div><div className="signalLine"><strong>{dirty && generated ? '画像已修改' : '建议补充'}</strong>{missingSuggestions.map(s=><span key={s}>{s}</span>)}</div><button type="button" className="secondaryBtn compact" onClick={clearAll}>清空画像</button></div><div className="fieldGrid">{formFields.map(([key,label,kind])=><label key={key} className="fieldItem"><b>{label}</b><small>{fieldHelp[key]}</small>{kind==='input'?<input value={fields[key]} onChange={e=>update(key,e.target.value)} />:<textarea value={fields[key]} onChange={e=>update(key,e.target.value)} />}</label>)}</div><div className="formCard"><label>上传简历 / 经历附件</label><input type="file" accept=".txt,.md,.csv,.json,.pdf,.doc,.docx" onChange={e=>handleFile(e.target.files?.[0])}/><p className="note">{fileNote}</p><label>简历 / 个人经历文本</label><textarea value={fields.resumeText} placeholder="可粘贴完整简历正文，或由文本附件自动填入。" onChange={e=>update('resumeText', e.target.value)} /></div><div className="formCard"><label>目标岗位 JD</label><textarea value={fields.jdText} placeholder="粘贴目标 JD：岗位职责、任职要求、加分项、技能要求。" onChange={e=>update('jdText', e.target.value)} /><label>本次任务补充问题</label><textarea className="mini" value={fields.userInput} placeholder={taskMeta[task].placeholder} onChange={e=>update('userInput', e.target.value)} /><button type="button" className="primaryBtn full generateProfile" onClick={generateProfile}>{generated && dirty ? '重新生成职业画像' : '生成职业画像'}</button></div></section>
    <section id="garden" className="section split"><div><div className="sectionHead"><span className="sectionKicker">Step 02</span><h2>莫奈花园职业地图</h2><p>系统会从扩展岗位库中选出最匹配的 4 条路径。每张花朵卡的分数来自当前画像和目标 JD；点击卡片后，该路径会进入后续 AI 工作台上下文。</p></div><div className="selectedPathBanner"><b>当前选中路径</b><strong>{selectedRole ? selectedRole.title : '请先生成职业画像'}</strong><p>{selectedRole ? selectedRole.description : '生成后点击任意花朵卡片，系统会把该岗位写入 JD 匹配、简历优化和面试训练上下文。'}</p></div><div className="gardenGrid">{roleCandidates.length ? roleCandidates.map((r,i)=><button key={r.id} className={`gardenCard flowerCard c${i} ${selectedRole?.id===r.id?'active pulse':''}`} onClick={()=>setSelectedRoleId(r.id)}><span className="petal">{r.score}</span><div><b>{r.title}</b><em>{r.family}</em><p>{r.description}</p></div><small>{r.reason}</small><div className="chips">{r.evidence.slice(0,5).map(e=><i key={e}>{e}</i>)}</div></button>) : <div className="emptyGarden"><b>等待职业花园生成</b><p>完成画像后点击「生成职业画像」。系统会基于岗位库、能力权重和 JD 证据推荐 Top 4 路径。</p><div><span></span><span></span><span></span><span></span></div></div>}</div></div><AbilityRadar scores={displayScores} ready={!!generated}/></section>
    <section id="workspace" className="section workspace"><div className="sectionHead wide"><span className="sectionKicker">Step 03</span><h2>AI 求职工作台</h2><p>四个模块会进入不同 Agent Prompt。画像、选中岗位、能力雷达、JD 和补充问题会一起进入服务端生成链路。</p></div><div className="taskTabs">{(Object.keys(taskMeta) as Task[]).map(k=><button key={k} className={task===k?'active':''} onClick={()=>setTask(k)}><span>{taskMeta[k].icon}</span>{taskMeta[k].label}</button>)}</div><div className="taskPanel"><div><h3>{taskMeta[task].title}</h3><p>{taskMeta[task].description}</p></div><div className="chips">{taskMeta[task].outputs.map(o=><i key={o}>{o}</i>)}</div></div><div className="contextCard"><b>AI 上下文</b><strong>{selectedRole ? selectedRole.title : '尚未选择职业路径'}</strong><p>{selectedRole ? selectedRole.description : '先生成职业画像并点击一张花朵卡片。'}</p><div className="chips">{selectedRole ? selectedRole.growth.map(g=><i key={g}>{g}</i>) : missingSuggestions.map(g=><i key={g}>待补充：{g}</i>)}</div></div><div className="resultCard"><div className="resultTop"><b>生成结果</b><span className={source==='api'?'source api':source==='fallback'?'source fallback':'source'}>{source==='api'?'模型服务':source==='fallback'?'离线规则引擎':'待生成'}</span></div><button className={`primaryBtn full ${loading?'isLoading':''}`} disabled={loading} onClick={generate}>{loading?'Agent 正在检索与生成…':`生成 ${taskMeta[task].label}`}</button><pre>{result}</pre></div></section>
    <section id="system" className="section systemSection"><div className="sectionHead"><span className="sectionKicker">System</span><h2>系统架构与能力</h2><p>前端负责画像采集、能力评分和岗位排序；服务端负责 Agent 路由、知识检索和模型调用。</p></div><div className="systemGrid compact"><article className="pink"><b>画像层</b><p>结构化采集教育、专业、技能、经历、证据和限制条件。</p></article><article className="teal"><b>推荐层</b><p>岗位库匹配 + 能力权重，生成 Top 4 职业路径。</p></article><article className="lavender"><b>Agent 层</b><p>职业、JD、简历、面试任务分流到不同 Prompt。</p></article><article className="peach"><b>RAG 层</b><p>检索岗位画像、简历规则、面试方法和行业知识。</p></article><article className="ochre"><b>模型层</b><p>Netlify Function 读取密钥并调用 DeepSeek。</p></article><article className="cream"><b>体验层</b><p>先生成画像，再选择路径，最后生成行动建议。</p></article></div></section><footer>求职奥德赛 AI · Career Odyssey Agent</footer>
  </main>
}
ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
