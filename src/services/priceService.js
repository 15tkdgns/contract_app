/**
 * 시세 분석 및 전세가율 계산 서비스
 */

// 전세가율 위험 기준 (80% 이상 위험)
const RISK_THRESHOLDS = {
    SAFE: 70,
    WARNING: 80,
    DANGER: 90
}

/**
 * 전세가율 계산
 * @param {number} deposit - 전세금
 * @param {number} price - 매매가 (또는 공시지가 * 150%)
 * @returns {Object} 계산 결과 ({ ratio, level, message })
 */
export function calculateJeonseRatio(deposit, price) {
    if (!deposit || !price) return null

    const ratio = (deposit / price) * 100
    let level = 'safe'
    let message = '안전한 수준입니다.'

    if (ratio >= RISK_THRESHOLDS.DANGER) {
        level = 'danger'
        message = '매우 위험! 깡통전세 가능성이 높습니다.'
    } else if (ratio >= RISK_THRESHOLDS.WARNING) {
        level = 'warning'
        message = '주의가 필요합니다. 전세보증보험 가입이 어려울 수 있습니다.'
    }

    return {
        ratio: ratio.toFixed(1),
        level,
        message
    }
}

/**
 * 공시지가로 매매가 추정 (일반적으로 공시지가의 150% 적용)
 * @param {number} officialPrice - 공시지가
 * @returns {number} 추정 매매가
 */
export function estimatePriceFromOfficial(officialPrice) {
    return officialPrice * 1.5 // 150% 적용
}

/**
 * 국토부 실거래가 API 연동 (추후 구현)
 * 공공데이터포털 API Key 필요
 */
export async function fetchRealPrice(address) {
    // TODO: API 연동 구현
    // const API_KEY = import.meta.env.VITE_DATA_GO_KR_API_KEY
    console.log(`Fetching price for ${address}...`)

    // 더미 데이터 반환 (테스트용)
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                price: 350000000,
                date: '2023-12-01',
                source: '국토교통부 실거래가'
            })
        }, 1000)
    })
}
