export const config = {
    runtime: 'edge',
}

const SYSTEM_PROMPT = `당신은 전세사기 예방을 도와주는 전문 상담사입니다.
다음 규칙을 따르세요:
1. 친절하고 명확하게 답변하세요.
2. 전세 계약, 등기부등본, 전세가율, 근저당, 보증보험 관련 질문에 답변하세요.
3. 법적 조언이 필요한 경우 전문가 상담을 권유하세요.
4. 답변은 간결하게 3-4문장 이내로 하세요.
5. 한국어로 답변하세요.`

export default async function handler(request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        })
    }

    try {
        const { message, history = [] } = await request.json()

        if (!message) {
            return new Response(JSON.stringify({ error: 'Message is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'API key not configured' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history.map(msg => ({
                role: msg.role === 'bot' ? 'assistant' : 'user',
                content: msg.content
            })),
            { role: 'user', content: message }
        ]

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages,
                max_tokens: 500,
                temperature: 0.7
            })
        })

        if (!response.ok) {
            const error = await response.json()
            return new Response(JSON.stringify({ error: error.error?.message || 'OpenAI API error' }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        const data = await response.json()
        const reply = data.choices[0]?.message?.content || '응답을 생성할 수 없습니다.'

        return new Response(JSON.stringify({ reply }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
