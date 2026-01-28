import { useRef, useEffect } from 'react'
import { useChat } from '../context/ChatContext'
import './Chatbot.css'

const SYSTEM_PROMPT = `당신은 전세사기 예방을 도와주는 전문 상담사입니다.
다음 규칙을 따르세요:
1. 친절하고 명확하게 답변하세요.
2. 전세 계약, 등기부등본, 전세가율, 근저당, 보증보험 관련 질문에 답변하세요.
3. 법적 조언이 필요한 경우 전문가 상담을 권유하세요.
4. 답변은 간결하게 3-4문장 이내로 하세요.
5. 한국어로 답변하세요.`

const GREETING = '안녕하세요! 전세사기 예방을 도와드립니다. 궁금한 점을 물어보세요.'

const SUGGESTED_QUESTIONS = [
    '전세가율이 뭐예요?',
    '근저당이 있으면 위험한가요?',
    '깡통전세란?',
    '확정일자는 어떻게 받나요?'
]

function Chatbot() {
    const {
        messages, setMessages, isOpen, toggleChat, closeChat,
        contextData, isLoading, setIsLoading
    } = useChat()

    const [input, setInput] = useState('')
    const messagesEndRef = useRef(null)

    // 초기 인사말
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{ role: 'bot', content: GREETING }])
        }
    }, [messages.length, setMessages])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isOpen])

    // 직접 OpenAI API 호출
    const callOpenAI = async (message, history) => {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY

        if (!apiKey) {
            return 'API 키가 설정되지 않았습니다. .env 파일에 VITE_OPENAI_API_KEY를 설정해주세요.'
        }

        try {
            // 컨텍스트 데이터가 있으면 프롬프트에 포함
            let systemContent = SYSTEM_PROMPT
            if (contextData) {
                systemContent += `\n\n[현재 사용자가 보고 있는 분석 결과]\n${JSON.stringify(contextData, null, 2)}\n\n위 분석 결과를 바탕으로 구체적으로 조언해주세요. 사용자가 "내 계약서 어때?"라고 물으면 위 데이터를 기반으로 답변하세요.`
            }

            const apiMessages = [
                { role: 'system', content: systemContent },
                ...history.slice(1).map(msg => ({
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
                    messages: apiMessages,
                    max_tokens: 500,
                    temperature: 0.7
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error?.message || 'API 오류')
            }

            const data = await response.json()
            return data.choices[0]?.message?.content || '응답을 생성할 수 없습니다.'

        } catch (error) {
            console.error('OpenAI API error:', error)
            return `오류가 발생했습니다: ${error.message}`
        }
    }

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMessage = { role: 'user', content: input }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        const response = await callOpenAI(input, messages)
        const botResponse = { role: 'bot', content: response }

        setMessages(prev => [...prev, botResponse])
        setIsLoading(false)
    }

    const handleQuickQuestion = async (question) => {
        if (isLoading) return

        const userMessage = { role: 'user', content: question }
        setMessages(prev => [...prev, userMessage])
        setIsLoading(true)

        const response = await callOpenAI(question, messages)
        const botResponse = { role: 'bot', content: response }

        setMessages(prev => [...prev, botResponse])
        setIsLoading(false)
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend()
    }

    return (
        <>
            <button className="chatbot-fab" onClick={toggleChat}>
                {isOpen ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                )}
            </button>

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <span>전세사기 도우미</span>
                        <button className="close-btn" onClick={closeChat}>X</button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.role}`}>
                                {msg.content}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message bot loading">
                                답변 생성 중...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {messages.length === 1 && (
                        <div className="quick-questions">
                            {SUGGESTED_QUESTIONS.map((q, idx) => (
                                <button key={idx} onClick={() => handleQuickQuestion(q)} disabled={isLoading}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="chatbot-input">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="질문을 입력하세요..."
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} disabled={isLoading}>
                            {isLoading ? '...' : '전송'}
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default Chatbot
