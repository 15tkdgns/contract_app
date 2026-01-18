const HISTORY_KEY = 'constract_analysis_history'
const MAX_HISTORY_ITEMS = 10

/**
 * 분석 결과 이력 저장
 * @param {Object} result - 분석 결과 객체
 */
export function saveHistory(result) {
    try {
        const history = getHistory()

        // 중복 저장 방지 (최근 항목과 점수/날짜 등이 같으면 스킵)
        if (history.length > 0) {
            const lastItem = history[0]
            if (lastItem.overallScore === result.overallScore &&
                lastItem.contractData?.address === result.extractedData?.contract?.address) {
                return
            }
        }

        const historyItem = {
            id: Date.now(),
            date: new Date().toISOString(),
            overallScore: result.overallScore,
            overallRiskLevel: result.overallRiskLevel,
            address: result.extractedData?.contract?.address || '주소 미확인',
            summary: result.issues?.[0]?.message || '특이사항 없음',
            data: result // 전체 데이터 저장 (상세 보기를 위해)
        }

        const newHistory = [historyItem, ...history].slice(0, MAX_HISTORY_ITEMS)
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
    } catch (error) {
        console.error('이력 저장 실패:', error)
    }
}

/**
 * 분석 이력 조회
 * @returns {Array} 이력 목록
 */
export function getHistory() {
    try {
        const history = localStorage.getItem(HISTORY_KEY)
        return history ? JSON.parse(history) : []
    } catch (error) {
        console.error('이력 조회 실패:', error)
        return []
    }
}

/**
 * 분석 이력 삭제
 * @param {number} id - 삭제할 이력 ID
 */
export function deleteHistoryItem(id) {
    try {
        const history = getHistory()
        const newHistory = history.filter(item => item.id !== id)
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
        return newHistory
    } catch (error) {
        console.error('이력 삭제 실패:', error)
        return []
    }
}

/**
 * 전체 이력 삭제
 */
export function clearHistory() {
    localStorage.removeItem(HISTORY_KEY)
}
