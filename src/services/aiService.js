/**
 * AI Service - OpenAI API 통합
 * Vision API (OCR) 및 Chat API (분석) 기능 제공
 */

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY

/**
 * OpenAI Vision API를 사용한 이미지 OCR
 * @param {string} imageData - Base64 인코딩된 이미지 데이터
 * @returns {Promise<string>} 추출된 텍스트
 */
export async function extractTextWithVision(imageData) {
    if (!API_KEY) {
        throw new Error('API 키가 설정되지 않았습니다.')
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `당신은 한국어 문서 OCR 전문가입니다. 
이미지에서 텍스트를 정확하게 추출해주세요.
계약서나 등기부등본의 경우 다음 정보를 우선 추출하세요:
- 임대인/임차인 이름
- 주소
- 보증금/전세금
- 계약 기간
- 근저당 정보`
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: '이 이미지에서 모든 텍스트를 추출해주세요. 원본 구조를 최대한 유지하세요.'
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: imageData.startsWith('data:') ? imageData : `data:image/jpeg;base64,${imageData}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 2000
            })
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error?.message || 'Vision API 오류')
        }

        const data = await response.json()
        return data.choices[0]?.message?.content || ''

    } catch (error) {
        console.error('Vision OCR 오류:', error)
        throw error
    }
}

/**
 * 계약서 텍스트 AI 분석
 * @param {string} contractText - 계약서 텍스트
 * @param {string} registryText - 등기부등본 텍스트 (선택)
 * @returns {Promise<Object>} 분석 결과
 */
export async function analyzeContractWithAI(contractText, registryText = '') {
    if (!API_KEY) {
        throw new Error('API 키가 설정되지 않았습니다.')
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `당신은 전세사기 위험 분석 전문가입니다.
계약서와 등기부등본을 분석하여 위험 요소를 찾아주세요.

다음 JSON 형식으로 응답하세요:
{
    "extractedData": {
        "landlord": "임대인 이름",
        "tenant": "임차인 이름",
        "address": "주소",
        "deposit": 보증금(숫자),
        "marketPrice": 추정시세(숫자),
        "mortgageAmount": 근저당금액(숫자),
        "startDate": "시작일",
        "endDate": "종료일",
        "hasInsurance": 보증보험여부(boolean),
        "isProxy": 대리인계약여부(boolean)
    },
    "entities": [
        { "id": "고유ID", "type": "person|organization|asset|money|date|location", "name": "표시이름", "value": "실제값" }
    ],
    "relations": [
        { "source": "엔티티ID", "target": "엔티티ID", "type": "owns|pays|receives|resides|guarantees|mediates", "label": "관계설명" }
    ],
    "documentVerification": {
        "ownerMatch": { "status": "match|mismatch|unknown", "contractValue": "계약서상 임대인", "registryValue": "등기부상 소유자", "message": "불일치 시 설명" },
        "addressMatch": { "status": "match|mismatch|unknown", "contractValue": "계약서상 주소", "registryValue": "등기부상 주소", "message": "불일치 시 설명" },
        "areaMatch": { "status": "match|mismatch|unknown", "contractValue": "계약서상 면적", "registryValue": "등기부상 면적", "message": "불일치 시 설명" }
    },
    "riskScore": 0-100 (높을수록 위험),
    "issues": [
        {
            "type": "위험유형",
            "severity": "critical/high/medium/low",
            "message": "상세 설명"
        }
    ],
    "fraudChecks": {
        "깡통전세": { "detected": boolean, "score": 0-100 },
        "이중계약": { "detected": boolean, "score": 0-100 },
        "위장임대인": { "detected": boolean, "score": 0-100 },
        "근저당과다": { "detected": boolean, "score": 0-100 }
    },
    "personalizedGuide": {
        "checklist": ["확인1", "확인2", "확인3"],
        "warnings": ["주의사항1", "주의사항2"],
        "nextSteps": ["다음단계1", "다음단계2"]
    },
    "glossary": [
        { "term": "근저당", "definition": "부동산을 담보로 대출받을 때 설정하는 권리" },
        { "term": "전세권", "definition": "전세금을 지급하고 부동산을 사용할 수 있는 권리" }
    ],
    "recommendations": ["권장사항1", "권장사항2"]
}

entities 예시:
- { "id": "landlord", "type": "person", "name": "임대인", "value": "홍길동" }
- { "id": "deposit", "type": "money", "name": "보증금", "value": "2억원" }
- { "id": "property", "type": "asset", "name": "부동산", "value": "강남구 테헤란로 123" }

relations 예시:
- { "source": "landlord", "target": "property", "type": "owns", "label": "소유" }
- { "source": "tenant", "target": "deposit", "type": "pays", "label": "지급" }

documentVerification: 계약서와 등기부등본의 핵심 정보가 일치하는지 자동 검증
personalizedGuide: 분석 결과에 따른 맞춤형 체크리스트, 주의사항, 다음 단계 제안
glossary: 문서에서 발견된 어려운 법률/부동산 용어에 대한 쉬운 설명`
                    },
                    {
                        role: 'user',
                        content: `다음 문서를 분석해주세요.

[계약서]
${contractText}

${registryText ? `[등기부등본]\n${registryText}` : '(등기부등본 없음)'}`
                    }
                ],
                max_tokens: 2000,
                temperature: 0.3
            })
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error?.message || 'Analysis API 오류')
        }

        const data = await response.json()
        const content = data.choices[0]?.message?.content || '{}'

        // JSON 파싱 시도
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0])
            }
        } catch (parseError) {
            console.error('JSON 파싱 오류:', parseError)
        }

        return null

    } catch (error) {
        console.error('AI 분석 오류:', error)
        throw error
    }
}

/**
 * API 키 존재 여부 확인
 */
export function hasApiKey() {
    return !!API_KEY
}
