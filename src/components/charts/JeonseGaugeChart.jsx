import './JeonseGaugeChart.css'

function JeonseGaugeChart({ ratio, marketPrice = 0, deposit = 0 }) {
    // 전세가율 계산
    const calculatedRatio = deposit && marketPrice
        ? Math.round((deposit / marketPrice) * 100)
        : (ratio || 0)

    // 위험도 판정
    const getRiskInfo = (r) => {
        if (r <= 60) return { level: '안전', color: 'var(--color-success)', desc: '보증금 회수 가능성 높음' }
        if (r <= 70) return { level: '양호', color: 'var(--color-info)', desc: '적정 수준의 전세가율' }
        if (r <= 80) return { level: '주의', color: 'var(--color-warning)', desc: '시세 하락 시 위험 가능' }
        if (r <= 90) return { level: '위험', color: 'var(--color-danger)', desc: '갭투자 가능성, 주의 필요' }
        return { level: '고위험', color: 'var(--color-critical)', desc: '전세 사기 위험 높음' }
    }

    const riskInfo = getRiskInfo(calculatedRatio)

    // 게이지 각도 계산 (0% = -90deg, 100% = 90deg)
    const angle = (calculatedRatio / 100) * 180 - 90

    // 포맷팅
    const formatMoney = (value) => {
        if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억`
        if (value >= 10000) return `${(value / 10000).toFixed(0)}만`
        return value.toString()
    }

    return (
        <div className="gauge-chart">
            <div className="gauge-container">
                <svg className="gauge-svg" viewBox="0 0 200 120">
                    {/* 배경 아크 */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="var(--bg-tertiary)"
                        strokeWidth="14"
                        strokeLinecap="round"
                    />
                    {/* 안전 구간 (0-60%) */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 52.4 34.3"
                        fill="none"
                        stroke="var(--color-success)"
                        strokeWidth="14"
                        strokeLinecap="round"
                    />
                    {/* 양호 구간 (60-70%) */}
                    <path
                        d="M 52.4 34.3 A 80 80 0 0 1 76.8 23.4"
                        fill="none"
                        stroke="var(--color-info)"
                        strokeWidth="14"
                    />
                    {/* 주의 구간 (70-80%) */}
                    <path
                        d="M 76.8 23.4 A 80 80 0 0 1 123.2 23.4"
                        fill="none"
                        stroke="var(--color-warning)"
                        strokeWidth="14"
                    />
                    {/* 위험 구간 (80-90%) */}
                    <path
                        d="M 123.2 23.4 A 80 80 0 0 1 147.6 34.3"
                        fill="none"
                        stroke="var(--color-danger)"
                        strokeWidth="14"
                    />
                    {/* 고위험 구간 (90-100%) */}
                    <path
                        d="M 147.6 34.3 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="var(--color-critical)"
                        strokeWidth="14"
                        strokeLinecap="round"
                    />
                    {/* 바늘 */}
                    <g transform={`rotate(${angle}, 100, 100)`}>
                        <line x1="100" y1="100" x2="100" y2="40" stroke="var(--text-primary)" strokeWidth="3" strokeLinecap="round" />
                        <circle cx="100" cy="100" r="6" fill="var(--text-primary)" />
                    </g>
                    {/* 라벨 */}
                    <text x="18" y="112" fontSize="9" fill="var(--text-muted)">0%</text>
                    <text x="168" y="112" fontSize="9" fill="var(--text-muted)">100%</text>
                </svg>

                {/* 중앙 수치 */}
                <div className="gauge-value">
                    <span className="ratio-number" style={{ color: riskInfo.color }}>{calculatedRatio}%</span>
                    <span className="ratio-label">전세가율</span>
                </div>
            </div>

            {/* 위험도 표시 */}
            <div className="gauge-risk">
                <span className="risk-badge" style={{ backgroundColor: riskInfo.color }}>
                    {riskInfo.level}
                </span>
                <p className="risk-desc">{riskInfo.desc}</p>
            </div>

            {/* 상세 정보 */}
            {marketPrice > 0 && (
                <div className="gauge-details">
                    <div className="detail-item">
                        <span className="detail-label">시세</span>
                        <span className="detail-value">{formatMoney(marketPrice)}원</span>
                    </div>
                    <div className="detail-divider" />
                    <div className="detail-item">
                        <span className="detail-label">보증금</span>
                        <span className="detail-value">{formatMoney(deposit)}원</span>
                    </div>
                    <div className="detail-divider" />
                    <div className="detail-item">
                        <span className="detail-label">갭</span>
                        <span className="detail-value safe">{formatMoney(marketPrice - deposit)}원</span>
                    </div>
                </div>
            )}

            {/* 범례 */}
            <div className="gauge-legend">
                <span><span className="dot" style={{ background: 'var(--color-success)' }} />~60%</span>
                <span><span className="dot" style={{ background: 'var(--color-info)' }} />~70%</span>
                <span><span className="dot" style={{ background: 'var(--color-warning)' }} />~80%</span>
                <span><span className="dot" style={{ background: 'var(--color-danger)' }} />~90%</span>
                <span><span className="dot" style={{ background: 'var(--color-critical)' }} />90%+</span>
            </div>
        </div>
    )
}

export default JeonseGaugeChart
