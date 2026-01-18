import './ContractVisual.css'
import JeonseGaugeChart from './charts/JeonseGaugeChart'

function ContractVisual({ data }) {
    if (!data) return null

    const {
        landlord = '홍길동',
        tenant = '이임차',
        deposit = 200000000,
        marketPrice = 300000000,
        mortgageAmount = 0,
        contractDate = '2026-01-15',
        endDate = '2028-01-14',
        address = '서울시 강남구 테헤란로 123',
        hasInsurance = false,
        isProxy = false
    } = data

    const jeonseRatio = marketPrice > 0 ? (deposit / marketPrice) * 100 : 0
    const mortgageRatio = marketPrice > 0 ? (mortgageAmount / marketPrice) * 100 : 0
    const totalRatio = jeonseRatio + mortgageRatio
    const safetyMargin = marketPrice - deposit - mortgageAmount

    const formatMoney = (num) => {
        if (num >= 100000000) {
            return (num / 100000000).toFixed(1) + '억'
        }
        if (num >= 10000) {
            return (num / 10000).toFixed(0) + '만'
        }
        return num.toLocaleString()
    }

    const getRatioColor = (ratio) => {
        if (ratio >= 80) return 'var(--color-danger)'
        if (ratio >= 70) return 'var(--color-warning)'
        return 'var(--color-success)'
    }

    return (
        <div className="contract-visual">
            {/* 계약 당사자 */}
            <div className="visual-section parties">
                <div className="party landlord">
                    <div className="party-icon">L</div>
                    <div className="party-info">
                        <span className="party-role">임대인</span>
                        <span className="party-name">{landlord}</span>
                        {isProxy && <span className="proxy-tag">대리인</span>}
                    </div>
                </div>
                <div className="contract-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </div>
                <div className="party tenant">
                    <div className="party-icon">T</div>
                    <div className="party-info">
                        <span className="party-role">임차인</span>
                        <span className="party-name">{tenant}</span>
                    </div>
                </div>
            </div>

            {/* 핵심 정보 카드 */}
            <div className="visual-section info-cards">
                <div className="info-card">
                    <span className="info-label">보증금</span>
                    <span className="info-value">{formatMoney(deposit)}원</span>
                </div>
                <div className="info-card">
                    <span className="info-label">시세</span>
                    <span className="info-value">{formatMoney(marketPrice)}원</span>
                </div>
                <div className="info-card">
                    <span className="info-label">계약기간</span>
                    <span className="info-value small">{contractDate} ~ {endDate}</span>
                </div>
            </div>

            {/* 전세가율 게이지 차트 */}
            <div className="visual-section gauge-section">
                <JeonseGaugeChart
                    ratio={jeonseRatio}
                    marketPrice={marketPrice}
                    deposit={deposit}
                />
            </div>

            {/* 안전 마진 */}
            <div className="visual-section safety-margin">
                <h4>안전 마진</h4>
                <div className={`margin-display ${safetyMargin < 0 ? 'negative' : 'positive'}`}>
                    <span className="margin-value">
                        {safetyMargin < 0 ? '-' : '+'}{formatMoney(Math.abs(safetyMargin))}원
                    </span>
                    <span className="margin-desc">
                        {safetyMargin >= 0
                            ? '시세가 하락해도 여유가 있습니다'
                            : '시세보다 채무가 많아 위험합니다'}
                    </span>
                </div>
            </div>

            {/* 보호 상태 */}
            <div className="visual-section protection-status">
                <h4>보호 상태</h4>
                <div className="status-items">
                    <div className={`status-item ${hasInsurance ? 'active' : ''}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        <span>전세보증보험</span>
                    </div>
                    <div className="status-item active">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        </svg>
                        <span>전입신고</span>
                    </div>
                    <div className="status-item active">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>확정일자</span>
                    </div>
                </div>
            </div>

            {/* 주소 */}
            <div className="visual-section address-info">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{address}</span>
            </div>
        </div>
    )
}

export default ContractVisual
