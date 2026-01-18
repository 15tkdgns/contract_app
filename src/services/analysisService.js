/**
 * Analysis Service - 전세사기 위험도 분석
 * 8가지 사기 유형을 체크하고 종합 위험도를 계산합니다.
 */

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
 * 계약서와 등기부등본 텍스트 분석
 * @param {string} contractText - 계약서 OCR 텍스트
 * @param {string} registryText - 등기부등본 OCR 텍스트
 * @returns {Object} 분석 결과
 */
export async function analyzeDocuments(contractText, registryText) {
    // 텍스트 정규화
    const normalizedContract = normalizeText(contractText)
    const normalizedRegistry = normalizeText(registryText)

    // 각 사기 유형 체크
    const fraudChecks = FRAUD_TYPES.map(fraud => {
        const hasKeywords = fraud.keywords.some(
            keyword => normalizedContract.includes(keyword) || normalizedRegistry.includes(keyword)
        )
        return {
            id: fraud.id,
            title: fraud.title,
            description: fraud.subtitle,
            passed: hasKeywords, // 키워드가 있으면 관련 정보가 포함된 것으로 간주
            riskLevel: fraud.riskLevel
        }
    })

    // 위험 요소 추출
    const issues = extractIssues(normalizedContract, normalizedRegistry, fraudChecks)

    // 종합 점수 계산
    const { score, riskLevel } = calculateOverallScore(fraudChecks, issues)

    // 권장사항 생성
    const recommendations = generateRecommendations(fraudChecks, issues)

    return {
        overallScore: score,
        overallRiskLevel: riskLevel,
        fraudChecks,
        issues,
        recommendations,
        extractedData: {
            contract: extractContractData(normalizedContract),
            registry: extractRegistryData(normalizedRegistry)
        }
    }
}

/**
 * 텍스트 정규화
 */
function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim()
}

/**
 * 위험 요소 추출
 */
function extractIssues(contractText, registryText, fraudChecks) {
    const issues = []

    // 전세가율 관련 체크
    const depositMatch = contractText.match(/보증금[:\s]*([0-9,]+)/i)
    if (depositMatch) {
        const deposit = parseInt(depositMatch[1].replace(/,/g, ''))
        if (deposit > 300000000) { // 3억 이상
            issues.push({
                type: '고액 보증금',
                severity: 'high',
                message: '보증금이 3억원 이상입니다. 전세보증보험 가입을 반드시 확인하세요.'
            })
        }
    }

    // 근저당 관련 체크
    if (registryText.includes('근저당') || registryText.includes('저당')) {
        issues.push({
            type: '근저당 설정',
            severity: 'warning',
            message: '등기부에 근저당이 설정되어 있습니다. 설정 금액과 선순위를 확인하세요.'
        })
    }

    // 대리인 관련 체크
    if (contractText.includes('대리') || contractText.includes('위임')) {
        issues.push({
            type: '대리인 계약',
            severity: 'critical',
            message: '대리인 계약으로 보입니다. 반드시 위임장 공증과 실소유자 확인이 필요합니다.'
        })
    }

    // 통과하지 못한 체크 항목을 이슈로 추가
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

/**
 * 종합 점수 계산
 */
function calculateOverallScore(fraudChecks, issues) {
    // 기본 점수 100점에서 시작
    let score = 100

    // 이슈별 감점
    issues.forEach(issue => {
        switch (issue.severity) {
            case 'critical':
                score -= 25
                break
            case 'high':
                score -= 15
                break
            case 'warning':
                score -= 10
                break
            default:
                score -= 5
        }
    })

    // 체크 통과 여부에 따른 가점/감점
    fraudChecks.forEach(check => {
        if (check.passed) {
            score += 2 // 정보가 확인되면 소폭 가점
        }
    })

    // 점수 범위 제한
    score = Math.max(0, Math.min(100, score))

    // 위험 레벨 결정
    let riskLevel
    if (score >= 80) {
        riskLevel = 'low'
    } else if (score >= 60) {
        riskLevel = 'medium'
    } else if (score >= 40) {
        riskLevel = 'high'
    } else {
        riskLevel = 'critical'
    }

    return { score, riskLevel }
}

/**
 * 권장사항 생성
 */
function generateRecommendations(fraudChecks, issues) {
    const recommendations = []

    // 기본 권장사항
    recommendations.push('인터넷등기소에서 등기부등본을 직접 발급하여 최신 정보를 확인하세요.')
    recommendations.push('잔금 당일에도 등기부등본을 재확인하세요.')
    recommendations.push('전세보증보험 가입 가능 여부를 HUG/SGI에 문의하세요.')

    // 이슈 기반 권장사항
    if (issues.some(i => i.type.includes('대리'))) {
        recommendations.push('실소유자와 영상통화로 본인 확인을 하세요.')
        recommendations.push('위임장은 공증된 원본을 확인하세요.')
    }

    if (issues.some(i => i.type.includes('근저당'))) {
        recommendations.push('근저당 설정 금액이 시세의 60% 이하인지 확인하세요.')
        recommendations.push('법무사에게 배당순위 분석을 의뢰하세요.')
    }

    return recommendations
}

/**
 * 계약서 데이터 추출
 */
function extractContractData(text) {
    return {
        deposit: extractAmount(text, '보증금'),
        landlord: extractName(text, '임대인'),
        tenant: extractName(text, '임차인'),
        contractDate: extractDate(text, '계약')
    }
}

/**
 * 등기부 데이터 추출
 */
function extractRegistryData(text) {
    return {
        owner: extractName(text, '소유자'),
        mortgage: extractAmount(text, '근저당'),
        address: extractAddress(text)
    }
}

// 유틸리티 함수들
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

/**
 * 수동 입력 데이터 분석
 * @param {Object} formData - 사용자가 입력한 폼 데이터
 * @returns {Object} 분석 결과
 */
export async function analyzeManualInput(formData) {
    const issues = []
    const fraudChecks = []

    const deposit = parseInt(formData.deposit) || 0
    const marketPrice = parseInt(formData.marketPrice) || 0
    const mortgageAmount = parseInt(formData.mortgageAmount) || 0
    const priorDeposits = parseInt(formData.priorDeposits) || 0

    // 1. 전세가율 체크
    const jeonseRatio = marketPrice > 0 ? (deposit / marketPrice) * 100 : 0
    fraudChecks.push({
        id: 1,
        title: '깡통전세',
        description: `전세가율 ${jeonseRatio.toFixed(1)}%`,
        passed: jeonseRatio < 70,
        riskLevel: jeonseRatio >= 80 ? 'critical' : jeonseRatio >= 70 ? 'high' : 'low'
    })

    if (jeonseRatio >= 80) {
        issues.push({
            type: '전세가율 과도',
            severity: 'critical',
            message: `전세가율이 ${jeonseRatio.toFixed(1)}%로 매우 높습니다. 깡통전세 위험이 있습니다.`
        })
    } else if (jeonseRatio >= 70) {
        issues.push({
            type: '전세가율 주의',
            severity: 'high',
            message: `전세가율이 ${jeonseRatio.toFixed(1)}%입니다. 시세 하락 시 보증금 회수가 어려울 수 있습니다.`
        })
    }

    // 2. 소유자-임대인 일치 체크
    const ownerMatch = formData.verifiedOwner
    fraudChecks.push({
        id: 2,
        title: '소유자-임대인 불일치',
        description: ownerMatch === true ? '일치 확인됨' : ownerMatch === false ? '불일치' : '미확인',
        passed: ownerMatch === true,
        riskLevel: ownerMatch === false ? 'critical' : ownerMatch === null ? 'high' : 'low'
    })

    if (ownerMatch === false) {
        issues.push({
            type: '소유자 불일치',
            severity: 'critical',
            message: '등기부상 소유자와 임대인이 일치하지 않습니다. 대리인 계약 사기 위험이 있습니다.'
        })
    }

    // 3. 보증보험 체크
    fraudChecks.push({
        id: 3,
        title: '보증보험 미가입',
        description: formData.hasInsurance === true ? '가입' : formData.hasInsurance === false ? '미가입' : '미확인',
        passed: formData.hasInsurance === true,
        riskLevel: formData.hasInsurance === false ? 'high' : 'medium'
    })

    if (formData.hasInsurance === false) {
        issues.push({
            type: '보증보험 미가입',
            severity: 'high',
            message: '전세보증보험에 가입되어 있지 않습니다. HUG/SGI 보험 가입을 권장합니다.'
        })
    }

    // 4. 선순위 권리 체크
    const totalPrior = mortgageAmount + priorDeposits
    const priorRatio = marketPrice > 0 ? (totalPrior / marketPrice) * 100 : 0
    const totalLiability = totalPrior + deposit
    const liabilityRatio = marketPrice > 0 ? (totalLiability / marketPrice) * 100 : 0

    fraudChecks.push({
        id: 4,
        title: '선순위 권리 과다',
        description: `선순위 ${priorRatio.toFixed(1)}%`,
        passed: priorRatio < 50,
        riskLevel: priorRatio >= 60 ? 'critical' : priorRatio >= 40 ? 'high' : 'low'
    })

    if (liabilityRatio >= 100) {
        issues.push({
            type: '채무 초과',
            severity: 'critical',
            message: '근저당과 선순위 임차보증금 합계가 시세를 초과합니다. 경매 시 보증금 전액 회수가 불가능합니다.'
        })
    } else if (liabilityRatio >= 80) {
        issues.push({
            type: '채무 비율 과다',
            severity: 'high',
            message: `총 채무 비율이 ${liabilityRatio.toFixed(1)}%입니다. 시세 하락 시 회수 위험이 있습니다.`
        })
    }

    // 5. 대리인 계약 체크
    fraudChecks.push({
        id: 5,
        title: '대리인 계약 사기',
        description: formData.isProxy === true ? '대리인 계약' : '본인 계약',
        passed: formData.isProxy !== true,
        riskLevel: formData.isProxy === true ? 'critical' : 'low'
    })

    if (formData.isProxy === true) {
        issues.push({
            type: '대리인 계약',
            severity: 'critical',
            message: '대리인을 통한 계약입니다. 위임장 공증 확인과 실소유자 영상통화를 반드시 하세요.'
        })
    }

    // 나머지 체크항목 (기본값)
    fraudChecks.push(
        { id: 6, title: '이중계약 사기', description: '전입신고 필요', passed: true, riskLevel: 'low' },
        { id: 7, title: '전세 사기단', description: '중개사 자격 확인 요망', passed: true, riskLevel: 'low' },
        { id: 8, title: '근저당 급증 사기', description: '잔금일 재확인 필요', passed: true, riskLevel: 'low' }
    )

    // 점수 계산
    let score = 100
    issues.forEach(issue => {
        if (issue.severity === 'critical') score -= 25
        else if (issue.severity === 'high') score -= 15
        else if (issue.severity === 'warning') score -= 10
    })
    score = Math.max(0, Math.min(100, score))

    // 위험 레벨 결정
    let riskLevel = 'low'
    if (score < 40) riskLevel = 'critical'
    else if (score < 60) riskLevel = 'high'
    else if (score < 80) riskLevel = 'medium'

    // 권장사항
    const recommendations = [
        '인터넷등기소에서 등기부등본을 직접 발급하여 최신 정보를 확인하세요.',
        '잔금 당일에도 등기부등본을 재확인하세요.',
        '입주 당일 전입신고와 확정일자를 받으세요.'
    ]

    if (jeonseRatio >= 70) {
        recommendations.push('전세가율이 높으므로 전세보증보험 가입을 필수로 하세요.')
    }

    if (formData.isProxy) {
        recommendations.push('실소유자와 영상통화로 본인 확인을 하세요.')
        recommendations.push('위임장은 공증된 원본을 확인하세요.')
    }

    if (mortgageAmount > 0) {
        recommendations.push('근저당 설정 금액과 배당순위를 법무사에게 확인하세요.')
    }

    return {
        overallScore: score,
        overallRiskLevel: riskLevel,
        fraudChecks,
        issues,
        recommendations,
        inputData: {
            deposit,
            marketPrice,
            jeonseRatio: jeonseRatio.toFixed(1),
            mortgageAmount,
            priorDeposits,
            totalLiability,
            liabilityRatio: liabilityRatio.toFixed(1)
        }
    }
}

