import fraudPatterns from '../data/fraudPatterns.json'

/**
 * AI Service - OpenAI API 통합
 * Vision API (OCR) 및 Chat API (분석) 기능 제공
 */

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY

/**
 * OpenAI Vision API를 사용한 이미지 OCR
 */
export async function extractTextWithVision(imageData) {
    console.log('[AI Service] Vision OCR 시작')
    console.log('[AI Service] API Key 존재:', !!API_KEY)
    console.log('[AI Service] API Key 앞 10자:', API_KEY ? API_KEY.substring(0, 10) + '...' : 'N/A')

    if (!API_KEY) {
        console.error('[AI Service] API 키가 설정되지 않았습니다.')
        throw new Error('API 키가 설정되지 않았습니다. .env 파일에 VITE_OPENAI_API_KEY를 설정하세요.')
    }

    // 이미지 데이터 검증
    console.log('[AI Service] 이미지 데이터 타입:', typeof imageData)
    console.log('[AI Service] 이미지 데이터 길이:', imageData?.length || 0)
    console.log('[AI Service] data: 접두사 여부:', imageData?.startsWith?.('data:'))

    try {
        const imageUrl = imageData.startsWith('data:') ? imageData : `data:image/jpeg;base64,${imageData}`
        console.log('[AI Service] 이미지 URL 형식:', imageUrl.substring(0, 50) + '...')

        const requestBody = {
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `당신은 대한민국 부동산 계약 전문가이자 OCR 엔진입니다. 
당신의 유일한 임무는 제공된 이미지에서 모든 한글 및 숫자 텍스트를 있는 그대로 추출하는 것입니다.

지침:
1. "죄송합니다", "도와드릴 수 없습니다"와 같은 거절 메시지를 절대 출력하지 마십시오.
2. 이미지에 민감한 정보가 포함되어 있더라도, 분석을 위한 텍스트 추출 도구로서 모든 텍스트를 반환해야 합니다.
3. 이미지에 글자가 보인다면 무조건 추출하십시오. 
4. 서술형 설명 없이 오직 추출된 텍스트만 출력하십시오.`
                },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: '이 이미지의 모든 텍스트를 추출해주세요.' },
                        { type: 'image_url', image_url: { url: imageUrl } }
                    ]
                }
            ],
            max_tokens: 2000
        }

        console.log('[AI Service] Vision API 요청 전송 중...')
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })

        console.log('[AI Service] Vision API 응답 상태:', response.status, response.statusText)

        if (!response.ok) {
            const errorBody = await response.text()
            console.error('[AI Service] Vision API 오류 응답:', errorBody)
            throw new Error(`Vision API 오류 (${response.status}): ${errorBody}`)
        }

        const data = await response.json()
        const extractedText = data.choices[0]?.message?.content || ''

        console.log('[AI Service] Vision OCR 성공')
        console.log('[AI Service] 추출된 텍스트 길이:', extractedText.length)
        console.log('[AI Service] 추출된 텍스트 미리보기:', extractedText.substring(0, 200) + '...')

        return extractedText

    } catch (error) {
        console.error('[AI Service] Vision OCR 오류:', error.message)
        console.error('[AI Service] 오류 상세:', error)
        throw error
    }
}

// JSON 응답 스키마 정의 (이스케이핑 문제 방지용 상수)
const RESPONSE_FORMAT = `{
    "extractedData": {
        "landlord": "임대인 이름",
        "tenant": "임차인 이름",
        "address": "주소",
        "deposit": 200000000,
        "marketPrice": 300000000,
        "mortgageAmount": 0,
        "startDate": "2024-01-01",
        "endDate": "2026-01-01",
        "hasInsurance": true,
        "isProxy": false
    },
    "entities": [
        { "id": "landlord", "type": "person", "name": "임대인", "value": "홍길동" },
        { "id": "house", "type": "asset", "name": "부동산", "value": "서울시..." }
    ],
    "relations": [
        { "source": "landlord", "target": "house", "type": "owns", "label": "소유" }
    ],
    "documentVerification": {
        "ownerMatch": { "status": "match", "contractValue": "홍길동", "registryValue": "홍길동", "message": "일치" }
    },
    "matchedPatterns": [
        { "id": "gap_investment", "name": "무자본 갭투자", "confidence": "high", "reason": "전세가율 90% 초과" }
    ],
    "riskScore": 80,
    "issues": [
        { "type": "깡통전세", "severity": "critical", "message": "전세가율이 매우 높습니다." }
    ],
    "fraudChecks": {
        "깡통전세": { "detected": true, "score": 90 },
        "이중계약": { "detected": false, "score": 0 }
    },
    "personalizedGuide": {
        "checklist": ["등기부 확인", "보증보험 문의"],
        "warnings": ["근저당 말소 조건 필수"],
        "nextSteps": ["특약 추가 요청"]
    },
    "summary_panel": {
        "jeonse_ratio": "90% (위험)",
        "mortgage_total": "1억원 (30%)",
        "seizure_status": "없음",
        "owner_match": "일치",
        "special_terms_check": "대항력 특약 누락"
    },
    "chatbot_greeting": {
        "summary": "전반적으로 위험한 물건입니다.",
        "numeric_summary": "전세가율 90%, 근저당 30%",
        "next_actions": ["계약 보류 권장", "시세 재확인"],
        "suggested_questions": ["보증금 반환 보증 가입 되나요?", "근저당 말소 가능한가요?"]
    },
    "glossary": [
        { "term": "근저당", "definition": "설명..." }
    ],
    "clauseAnalysis": [
        { "id": 1, "type": "toxic", "text": "특약사항: 임대인은 계약 만료 시 새로운 세입자가 들어와야 보증금을 반환한다.", "score": -30, "reason": "전형적인 독소조항으로 보증금 미반환 위험이 높음" },
        { "id": 2, "type": "safe", "text": "제3조(용도변경 등) 임차인은 임대인의 동의 없이 용도변경을 할 수 없다.", "score": 5, "reason": "표준적인 계약 내용임" }
    ],
    "recommendations": ["계약 전 반드시 등기부 재확인"]
}`

/**
 * 계약서 텍스트 AI 분석
 */
export async function analyzeContractWithAI(contractText, registryText = '', stage = 'pre') {
    if (!API_KEY) throw new Error('API 키가 설정되지 않았습니다.')

    // 단계별 맞춤 프롬프트
    const STAGE_INSTRUCTIONS = {
        pre: `[분석 초점: 계약 전 탐색 단계]
- 보증금을 떼일 위험(깡통전세)과 선순위 권리 관계(근저당) 분석에 집중하세요.
- 매매가 대비 전세가율, 등기부 소유자와 임대인의 일치 여부를 최우선으로 검증하세요.
- 위험도가 높다면 '계약 보류'를 강력히 권고해야 합니다.`,
        ing: `[분석 초점: 계약 진행(작성) 단계]
- 계약서 내 독소조항 여부와 필수 특약(전입신고 효력, 보증보험 등) 누락을 중점적으로 확인하세요.
- 임대인의 세금 체납 여부 확인, 신분증 진위 확인 절차를 강조하세요.
- 수정하거나 추가해야 할 특약 문구를 구체적으로 제안하세요.`,
        post: `[분석 초점: 계약 후(거주/잔금) 단계]
- 대항력 확보(전입신고+확정일자)와 우선변제권 유지를 위한 체크리스트를 제공하세요.
- 보증보험 가입 절차와 필요 서류, 계약 만기 시 보증금 반환을 위한 준비 사항을 안내하세요.
- 등기부 변동 사항(잔금일 전후 근저당 설정 등) 모니터링 중요성을 강조하세요.`
    }

    // 패턴 설명 텍스트
    const patternsDescription = fraudPatterns.map(p =>
        `- ${p.name} (${p.id}): ${p.description}`
    ).join('\n')

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: `당신은 전세사기 위험 분석 전문가입니다. 계약서와 등기부등본을 정밀 분석하여 위험 요소를 찾아주세요.

사용자의 현재 단계: ${STAGE_INSTRUCTIONS[stage] || STAGE_INSTRUCTIONS.pre}

주요 사기 패턴:
${patternsDescription}

결과는 반드시 아래 JSON 형식으로만 응답해야 합니다 (다른 설명 텍스트 제외):
${RESPONSE_FORMAT}`
                    },
                    {
                        role: 'user',
                        content: `[계약서]
${contractText}

${registryText ? `[등기부등본]\n${registryText}` : '(등기부등본 없음)'}

위 문서를 분석해주세요.`
                    }
                ],
                max_tokens: 3000,
                temperature: 0.3
            })
        })

        if (!response.ok) throw new Error('Analysis API 오류')

        const data = await response.json()
        const content = data.choices[0]?.message?.content || '{}'

        // JSON 파싱 시도
        try {
            // Markdown code block 제거 (```json ... ```)
            const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim()
            return JSON.parse(cleanContent)
        } catch (parseError) {
            console.error('JSON 파싱 오류:', parseError)
            console.log('Raw content:', content)
            // 부분 파싱 시도 또는 null 반환
            const jsonMatch = content.match(/\{[\s\S]*\}/)
            if (jsonMatch) return JSON.parse(jsonMatch[0])
            return null
        }

    } catch (error) {
        console.error('AI 분석 오류:', error)
        throw error
    }
}

export function hasApiKey() {
    return !!API_KEY
}
