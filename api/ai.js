export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'Missing API key. Set DEEPSEEK_API_KEY in Vercel Environment Variables.' })
    return
  }

  try {
    const { task, resumeText, jdText, userInput } = req.body || {}
    const systemPrompt = '你是专业的AI求职辅导员，熟悉大学生求职、AI产品、数据产品、简历优化、JD匹配和结构化面试。请用中文输出，必须具体、可执行、可复制，避免空话。'
    const taskName = {
      resume: 'AI简历优化',
      match: 'JD岗位匹配',
      interview: '面试题生成',
      career: '职业规划建议'
    }[task] || '通用求职辅导'

    const userPrompt = `任务：${taskName}\n\n简历/经历：\n${resumeText || '未提供'}\n\n岗位JD：\n${jdText || '未提供'}\n\n用户问题：\n${userInput || '请给出求职建议'}\n\n请输出：\n1. 核心判断\n2. 匹配优势\n3. 当前问题\n4. 修改建议\n5. 可直接复制进简历/面试的表达`

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.65
      })
    })

    if (!response.ok) {
      const text = await response.text()
      res.status(response.status).json({ error: text })
      return
    }

    const data = await response.json()
    res.status(200).json({ text: data?.choices?.[0]?.message?.content || 'AI 暂未返回结果' })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
}
