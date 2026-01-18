import React from 'react';
import './JeonseGaugeChart.css';

const JeonseGaugeChart = ({ ratio = 41, marketPrice = 900000000, deposit = 350000000 }) => {
    // 전세가율 계산
    const calculatedRatio = deposit && marketPrice ? Math.round((deposit / marketPrice) * 100) : ratio;

    // 위험도 판정
    const getRiskInfo = (r) => {
        if (r <= 60) return { level: '안전', color: '#22c55e', desc: '보증금 회수 가능성 높음' };
        if (r <= 70) return { level: '양호', color: '#3b82f6', desc: '적정 수준의 전세가율' };
        if (r <= 80) return { level: '주의', color: '#f59e0b', desc: '시세 하락 시 위험 가능' };
        if (r <= 90) return { level: '위험', color: '#ef4444', desc: '갭투자 가능성, 주의 필요' };
        return { level: '고위험', color: '#dc2626', desc: '전세 사기 위험 높음' };
    };

    const riskInfo = getRiskInfo(calculatedRatio);

    // 게이지 각도 계산 (0% = -90deg, 100% = 90deg)
    const angle = (calculatedRatio / 100) * 180 - 90;

    // 포맷팅
    const formatMoney = (value) => {
        if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억`;
        if (value >= 10000) return `${(value / 10000).toFixed(0)}만`;
        return value.toString();
    };

    return (
        <div className="gauge-card card">
            <div className="card-header">
                <div className="card-icon gauge-bg">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
                        <circle cx="12" cy="12" r="10" />
                    </svg>
                </div>
                <h2 className="card-title">전세가율 분석</h2>
            </div>

            <div className="gauge-content">
                <div className="gauge-container">
                    {/* 게이지 배경 */}
                    <svg className="gauge-svg" viewBox="0 0 200 120">
                        {/* 배경 아크 */}
                        <path
                            d="M 20 100 A 80 80 0 0 1 180 100"
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="16"
                            strokeLinecap="round"
                        />

                        {/* 안전 구간 (0-60%) */}
                        <path
                            d="M 20 100 A 80 80 0 0 1 52.4 34.3"
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="16"
                            strokeLinecap="round"
                        />

                        {/* 양호 구간 (60-70%) */}
                        <path
                            d="M 52.4 34.3 A 80 80 0 0 1 76.8 23.4"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="16"
                        />

                        {/* 주의 구간 (70-80%) */}
                        <path
                            d="M 76.8 23.4 A 80 80 0 0 1 123.2 23.4"
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="16"
                        />

                        {/* 위험 구간 (80-90%) */}
                        <path
                            d="M 123.2 23.4 A 80 80 0 0 1 147.6 34.3"
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="16"
                        />

                        {/* 고위험 구간 (90-100%) */}
                        <path
                            d="M 147.6 34.3 A 80 80 0 0 1 180 100"
                            fill="none"
                            stroke="#dc2626"
                            strokeWidth="16"
                            strokeLinecap="round"
                        />

                        {/* 바늘 */}
                        <g transform={`rotate(${angle}, 100, 100)`}>
                            <line x1="100" y1="100" x2="100" y2="35" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
                            <circle cx="100" cy="100" r="8" fill="#1e293b" />
                        </g>

                        {/* 라벨 */}
                        <text x="15" y="115" fontSize="10" fill="#64748b">0%</text>
                        <text x="175" y="115" fontSize="10" fill="#64748b">100%</text>
                    </svg>

                    {/* 중앙 수치 */}
                    <div className="gauge-value">
                        <span className="ratio-number" style={{ color: riskInfo.color }}>{calculatedRatio}%</span>
                        <span className="ratio-label">전세가율</span>
                    </div>
                </div>

                {/* 위험도 표시 */}
                <div className="risk-badge" style={{ backgroundColor: riskInfo.color }}>
                    {riskInfo.level}
                </div>
                <p className="risk-desc">{riskInfo.desc}</p>

                {/* 상세 정보 */}
                <div className="gauge-details">
                    <div className="detail-item">
                        <span className="detail-label">시세</span>
                        <span className="detail-value">{formatMoney(marketPrice)}</span>
                    </div>
                    <div className="detail-divider"></div>
                    <div className="detail-item">
                        <span className="detail-label">보증금</span>
                        <span className="detail-value">{formatMoney(deposit)}</span>
                    </div>
                    <div className="detail-divider"></div>
                    <div className="detail-item">
                        <span className="detail-label">갭</span>
                        <span className="detail-value safe">{formatMoney(marketPrice - deposit)}</span>
                    </div>
                </div>

                {/* 범례 */}
                <div className="gauge-legend">
                    <div className="legend-item"><span className="dot" style={{ background: '#22c55e' }}></span>~60% 안전</div>
                    <div className="legend-item"><span className="dot" style={{ background: '#3b82f6' }}></span>60-70% 양호</div>
                    <div className="legend-item"><span className="dot" style={{ background: '#f59e0b' }}></span>70-80% 주의</div>
                    <div className="legend-item"><span className="dot" style={{ background: '#ef4444' }}></span>80-90% 위험</div>
                    <div className="legend-item"><span className="dot" style={{ background: '#dc2626' }}></span>90%+ 고위험</div>
                </div>
            </div>
        </div>
    );
};

export default JeonseGaugeChart;
