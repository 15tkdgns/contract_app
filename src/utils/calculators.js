/**
 * 전세사기 예방 웹앱용 - 유틸리티 함수
 * 원본: constract 프로젝트에서 추출 및 정리
 */

/**
 * 금액 포맷팅 (억원/만원)
 * @param {number} value - 원 단위 금액
 * @returns {string} 포맷된 문자열
 */
export function formatMoney(value) {
    if (value >= 100000000) {
        const billions = Math.floor(value / 100000000);
        const remainder = (value % 100000000) / 10000;
        if (remainder > 0) return `${billions}억 ${Math.round(remainder).toLocaleString()}만원`;
        return `${billions}억원`;
    }
    if (value >= 10000) return `${Math.round(value / 10000).toLocaleString()}만원`;
    return `${value.toLocaleString()}원`;
}

/**
 * 전세가율 계산
 * @param {number} deposit - 전세보증금 (원)
 * @param {number} marketPrice - 매매시세 (원)
 * @returns {number} 전세가율 (%)
 */
export function calculateJeonseRatio(deposit, marketPrice) {
    if (marketPrice <= 0) return 0;
    return Math.round((deposit / marketPrice) * 100);
}

/**
 * 전세가율 기반 위험도 판단
 * @param {number} ratio - 전세가율 (%)
 * @returns {Object} { level, color, description }
 */
export function getJeonseRiskLevel(ratio) {
    if (ratio >= 90) {
        return { level: '고위험', color: '#dc2626', description: '전세 사기 위험 높음' };
    } else if (ratio >= 80) {
        return { level: '위험', color: '#f59e0b', description: '주의 필요' };
    } else if (ratio >= 70) {
        return { level: '주의', color: '#3b82f6', description: '일반적 수준' };
    } else {
        return { level: '안전', color: '#22c55e', description: '안전한 수준' };
    }
}

/**
 * 선순위 권리 분석
 * @param {number} marketPrice - 매매시세
 * @param {number} seniorMortgage - 선순위 근저당
 * @param {number} seniorTenant - 선순위 임차보증금
 * @param {number} myDeposit - 내 보증금
 * @returns {Object} 분석 결과
 */
export function analyzeRights(marketPrice, seniorMortgage, seniorTenant, myDeposit) {
    const totalSenior = seniorMortgage + seniorTenant;
    const totalWithMine = totalSenior + myDeposit;
    const safeThreshold = marketPrice * 0.7; // 시세의 70%

    const isSafe = totalSenior < safeThreshold;
    const expectedRecovery = Math.max(0, marketPrice * 0.8 - totalSenior);
    const myRecovery = Math.min(myDeposit, expectedRecovery);

    return {
        totalSenior,
        totalWithMine,
        safeThreshold,
        isSafe,
        expectedRecovery: myRecovery,
        lossRisk: myDeposit - myRecovery,
        message: isSafe
            ? '선순위 권리가 안전 범위 내입니다'
            : '선순위 권리가 과다하여 보증금 손실 위험이 있습니다'
    };
}

/**
 * 날짜 포맷팅
 * @param {Date|string} date 
 * @returns {string}
 */
export function formatDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * 파일 확장자 확인
 * @param {string} filename 
 * @param {Array} allowedExts - ['pdf', 'jpg', 'png']
 * @returns {boolean}
 */
export function isValidFileType(filename, allowedExts = ['pdf', 'jpg', 'jpeg', 'png']) {
    const ext = filename.split('.').pop().toLowerCase();
    return allowedExts.includes(ext);
}

/**
 * 파일 크기 포맷팅
 * @param {number} bytes 
 * @returns {string}
 */
export function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
