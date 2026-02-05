/**
 * Analysis Service - 전세사기 위험도 분석
 * AI 분석 및 규칙 기반 분석 제공
 */

import { analyzeContractWithAI, hasApiKey } from './aiService'

// 8가지 사기 유형 정의
const FRAUD_TYPES = [
    {
        id: 1,
        title: '깡통전세',
        subtitle: '전세가율 과도',
        keywords: ['보증금', '전세금', '전세가'],
        riskLevel: 'critical'
    },
    {
        id: 2,
        title: '소유자-임대인 불일치',
        subtitle: '등기부 소유자 확인',
        keywords: ['소유자', '소유권', '등기'],
        riskLevel: 'high'
    },
    {
        id: 3,
        title: '보증보험 미가입',
        subtitle: 'HUG/SGI 보험',
        keywords: ['보증보험', 'HUG', 'SGI', '보험'],
        riskLevel: 'high'
    },
    {
        id: 4,
        title: '선순위 권리 과다',
        subtitle: '근저당/선순위 확인',
        keywords: ['근저당', '저당', '선순위', '채권'],
        riskLevel: 'critical'
    },
    {
        id: 5,
        title: '대리인 계약 사기',
        subtitle: '위임장 검증',
        keywords: ['대리', '위임', '대리인'],
        riskLevel: 'critical'
    },
    {
        id: 6,
        title: '이중계약 사기',
        subtitle: '전입신고 확인',
        keywords: ['계약일', '전입', '확정일자'],
        riskLevel: 'critical'
    },
    {
        id: 7,
        title: '전세 사기단',
        subtitle: '조직적 사기',
        keywords: ['중개', '공인중개사', '법무사'],
        riskLevel: 'critical'
    },
    {
        id: 8,
        title: '근저당 급증 사기',
        subtitle: '권리변동 확인',
        keywords: ['잔금', '권리변동', '설정'],
        riskLevel: 'high'
    }
]

/**
 * 전용 분석 함수 - 리액트 컴포넌트에서 호출
 */
export async function analyzeDocuments(contractText, registryText, stage = 'pre') {
    if (hasApiKey()) {
        try {
            const aiResult = await analyzeContractWithAI(contractText, registryText, stage)
            if (aiResult && aiResult.riskScore !== undefined) {
                return formatAIResult(aiResult)
            }
        } catch (error) {
            console.warn('AI 분석 실패, 규칙 기반으로 전환:', error)
        }
    }
    return analyzeWithRules(contractText, registryText)
}

function formatAIResult(aiResult) {
    const fraudChecks = FRAUD_TYPES.map(fraud => {
        const aiCheck = aiResult.fraudChecks?.[fraud.title]
        return {
            id: fraud.id,
            title: fraud.title,
            description: fraud.subtitle,
            passed: aiCheck ? !aiCheck.detected : true,
            riskLevel: aiCheck?.detected ? fraud.riskLevel : 'low'
        }
    })

    const score = 100 - (aiResult.riskScore || 0)
    return {
        overallScore: score,
        overallRiskLevel: getRiskLevel(score),
        fraudChecks,
        issues: aiResult.issues || [],
        recommendations: aiResult.recommendations || [],
        contractData: aiResult.extractedData || {},
        extractedData: {
            contract: aiResult.extractedData || {},
            registry: {}
        },
        summary_panel: aiResult.summary_panel || {
            jeonse_ratio: "계산 중",
            mortgage_total: "분석 중",
            seizure_status: "분석 중",
            owner_match: "분석 중",
            special_terms_check: "분석 중"
        },
        aiGenerated: true
    }
}

/**
 * 규칙 기반 분석 (기존 로직 복구)
 */
function analyzeWithRules(contractText, registryText) {
    const normalizedContract = normalizeText(contractText)
    const normalizedRegistry = normalizeText(registryText)

    const fraudChecks = FRAUD_TYPES.map(fraud => {
        const hasKeywords = fraud.keywords.some(
            keyword => normalizedContract.includes(keyword) || normalizedRegistry.includes(keyword)
        )
        return {
            id: fraud.id,
            title: fraud.title,
            description: fraud.subtitle,
            passed: hasKeywords,
            riskLevel: fraud.riskLevel
        }
    })

    const issues = extractIssues(normalizedContract, normalizedRegistry, fraudChecks)
    const { score, riskLevel } = calculateOverallScore(fraudChecks, issues)
    const recommendations = generateRecommendations(fraudChecks, issues)

    const contractData = extractContractData(normalizedContract)
    const registryData = extractRegistryData(normalizedRegistry)

    return {
        overallScore: score,
        overallRiskLevel: riskLevel,
        fraudChecks,
        issues,
        recommendations,
        contractData,
        extractedData: {
            contract: contractData,
            registry: registryData
        },
        summary_panel: {
            jeonse_ratio: "분석 필요 (매매가 미인식)",
            mortgage_total: registryData.mortgage ? `${formatMoneyValue(registryData.mortgage)}` : "없음",
            seizure_status: (normalizedRegistry.includes('압류') || normalizedRegistry.includes('가압류')) ? "주의" : "없음",
            owner_match: "확인 필요",
            special_terms_check: normalizedContract.includes('특약') ? "포함됨" : "확인 필요"
        }
    }
}

function formatMoneyValue(val) {
    if (!val) return '0원'
    const num = parseInt(String(val).replace(/[^0-9]/g, ''))
    if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억원`
    return `${(num / 10000).toLocaleString()}만원`
}

function normalizeText(text) {
    return text ? text.toLowerCase().replace(/\s+/g, ' ').trim() : ''
}

function getRiskLevel(score) {
    if (score >= 80) return 'low'
    if (score >= 60) return 'medium'
    if (score >= 40) return 'high'
    return 'critical'
}

function extractIssues(contractText, registryText, fraudChecks) {
    const issues = []

    const depositMatch = contractText.match(/보증금[:\s]*([0-9,]+)/i)
    if (depositMatch) {
        const deposit = parseInt(depositMatch[1].replace(/,/g, ''))
        if (deposit > 300000000) {
            issues.push({
                type: '고액 보증금',
                severity: 'high',
                message: '보증금이 3억원 이상입니다. 전세보증보험 가입을 반드시 확인하세요.'
            })
        }
    }

    if (registryText.includes('근저당') || registryText.includes('저당')) {
        issues.push({
            type: '근저당 설정',
            severity: 'warning',
            message: '등기부에 근저당이 설정되어 있습니다. 설정 금액과 선순위를 확인하세요.'
        })
    }

    if (contractText.includes('대리') || contractText.includes('위임')) {
        issues.push({
            type: '대리인 계약',
            severity: 'critical',
            message: '대리인 계약으로 보입니다. 반드시 위임장 공증과 실소유자 확인이 필요합니다.'
        })
    }

    fraudChecks
        .filter(check => !check.passed && check.riskLevel === 'critical')
        .forEach(check => {
            issues.push({
                type: check.title,
                severity: 'warning',
                message: `${check.description} 관련 정보를 확인할 수 없습니다. 직접 확인이 필요합니다.`
            })
        })

    return issues
}

function calculateOverallScore(fraudChecks, issues) {
    let score = 100
    issues.forEach(issue => {
        switch (issue.severity) {
            case 'critical': score -= 25; break;
            case 'high': score -= 15; break;
            case 'warning': score -= 10; break;
            default: score -= 5;
        }
    })
    fraudChecks.forEach(check => { if (check.passed) score += 2; })
    score = Math.max(0, Math.min(100, score))
    return { score, riskLevel: getRiskLevel(score) }
}

function generateRecommendations(fraudChecks, issues) {
    const recommendations = [
        '인터넷등기소에서 등기부등본을 직접 발급하여 최신 정보를 확인하세요.',
        '잔금 당일에도 등기부등본을 재확인하세요.',
        '전세보증보험 가입 가능 여부를 HUG/SGI에 문의하세요.'
    ]
    if (issues.some(i => i.type.includes('대리'))) {
        recommendations.push('실소유자와 영상통화로 본인 확인을 하세요.')
    }
    return recommendations
}

function extractContractData(text) {
    return {
        deposit: extractAmount(text, '보증금'),
        landlord: extractName(text, '임대인'),
        tenant: extractName(text, '임차인'),
        contractDate: extractDate(text, '계약')
    }
}

function extractRegistryData(text) {
    return {
        owner: extractName(text, '소유자'),
        mortgage: extractAmount(text, '근저당'),
        address: extractAddress(text)
    }
}

function extractAmount(text, keyword) {
    const regex = new RegExp(`${keyword}[:\\s]*([0-9,]+)`, 'i')
    const match = text.match(regex)
    return match ? match[1] : null
}

function extractName(text, keyword) {
    const regex = new RegExp(`${keyword}[:\\s]*([가-힣]+)`, 'i')
    const match = text.match(regex)
    return match ? match[1] : null
}

function extractDate(text, keyword) {
    const regex = new RegExp(`${keyword}[일자]*[:\\s]*([0-9]{4}[./-][0-9]{1,2}[./-][0-9]{1,2})`, 'i')
    const match = text.match(regex)
    return match ? match[1] : null
}

function extractAddress(text) {
    const regex = /([가-힣]+시\s+[가-힣]+구)/i
    const match = text.match(regex)
    return match ? match[1] : null
}

export async function analyzeManualInput(formData) {
    const issues = []
    const fraudChecks = []
    const deposit = parseInt(formData.deposit) || 0
    const marketPrice = parseInt(formData.marketPrice) || 0
    const mortgageAmount = parseInt(formData.mortgageAmount) || 0
    const priorDeposits = parseInt(formData.priorDeposits) || 0

    const jeonseRatio = marketPrice > 0 ? (deposit / marketPrice) * 100 : 0
    fraudChecks.push({
        id: 1,
        title: '깡통전세',
        description: `전세가율 ${jeonseRatio.toFixed(1)}%`,
        passed: jeonseRatio < 70,
        riskLevel: jeonseRatio >= 80 ? 'critical' : jeonseRatio >= 70 ? 'high' : 'low'
    })

    if (jeonseRatio >= 80) {
        issues.push({ type: '전세가율 과도', severity: 'critical', message: `전세가율이 ${jeonseRatio.toFixed(1)}%로 매우 높습니다.` })
    }

    const { score, riskLevel } = calculateOverallScore(fraudChecks, issues)
    return {
        overallScore: score,
        overallRiskLevel: riskLevel,
        fraudChecks,
        issues,
        recommendations: ['등기부등본 직접 확인 권장'],
        inputData: { ...formData, jeonseRatio: jeonseRatio.toFixed(1) }
    }
}
