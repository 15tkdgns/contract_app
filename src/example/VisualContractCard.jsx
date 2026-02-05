import React from 'react';
import './VisualContractCard.css';

const VisualContractCard = ({ contract }) => {
    // Map the actual contract structure to our expected format
    const data = {
        property: {
            address: contract?.property?.address || '서울 강남구 삼성동 123-45',
            type: contract?.property?.type || '아파트',
            area: contract?.property?.area ? `${contract.property.area}㎡` : '84.9㎡ (25.7평)',
            floor: contract?.property?.floor || '15층/20층',
        },
        parties: {
            landlord: contract?.landlord?.name || '김철수',
            tenant: contract?.tenant?.name || '이영희',
            broker: contract?.agent?.name || '행복공인중개사',
        },
        terms: {
            deposit: contract?.financial?.deposit || 350000000,
            monthlyRent: contract?.financial?.monthlyRent || 0,
            startDate: contract?.period?.moveInDate || '2024-03-01',
            endDate: contract?.period?.endDate || '2026-02-28',
            duration: '24개월',
        },
        status: {
            registration: true,
            insurance: contract?.insurance?.hasHGI || contract?.insurance?.hasSGI || false,
            jeonseRatio: contract?.financial?.jeonseRatio || 41,
        },
        risks: contract?.risk?.factors?.filter(f => f.type !== 'success').map(f => ({
            type: f.type === 'danger' ? 'danger' : 'warning',
            text: f.text
        })) || [
                { type: 'warning', text: '근저당 설정 2억원' },
                { type: 'danger', text: 'HUG/SGI 미가입' },
            ],
        checklist: [
            { done: true, text: '등기부등본 확인' },
            { done: contract?.landlord?.isOwner || true, text: '소유자 신분 확인' },
            { done: true, text: '중개사 자격 확인' },
            { done: false, text: '전입신고' },
            { done: false, text: '확정일자' },
        ],
    };

    const formatMoney = (value) => {
        if (value >= 100000000) {
            const billions = Math.floor(value / 100000000);
            const remainder = (value % 100000000) / 10000;
            if (remainder > 0) return `${billions}억 ${remainder.toLocaleString()}만원`;
            return `${billions}억원`;
        }
        if (value >= 10000) return `${(value / 10000).toLocaleString()}만원`;
        return `${value.toLocaleString()}원`;
    };

    const getRiskColor = (ratio) => {
        if (ratio <= 60) return '#22c55e';
        if (ratio <= 70) return '#3b82f6';
        if (ratio <= 80) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="visual-contract-card card">
            <div className="card-header">
                <div className="card-icon contract-bg">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                </div>
                <h2 className="card-title">계약 요약 (Visual Contract)</h2>
            </div>

            <div className="vc-content">
                {/* 매물 정보 */}
                <div className="vc-section property">
                    <div className="vc-section-icon">ASSET</div>
                    <div className="vc-section-content">
                        <h4>{data.property.address}</h4>
                        <div className="vc-tags">
                            <span className="vc-tag">{data.property.type}</span>
                            <span className="vc-tag">{data.property.area}</span>
                            <span className="vc-tag">{data.property.floor}</span>
                        </div>
                    </div>
                </div>

                {/* 당사자 */}
                <div className="vc-parties">
                    <div className="vc-party">
                        <span className="party-icon">👤</span>
                        <span className="party-role">임대인</span>
                        <span className="party-name">{data.parties.landlord}</span>
                    </div>
                    <div className="vc-party-arrow">↔</div>
                    <div className="vc-party">
                        <span className="party-icon">👤</span>
                        <span className="party-role">임차인</span>
                        <span className="party-name">{data.parties.tenant}</span>
                    </div>
                    <div className="vc-party small">
                        <span className="party-icon">🏢</span>
                        <span className="party-role">중개</span>
                        <span className="party-name">{data.parties.broker}</span>
                    </div>
                </div>

                {/* 계약 조건 */}
                <div className="vc-terms">
                    <div className="vc-term main">
                        <span className="term-label">보증금</span>
                        <span className="term-value">{formatMoney(data.terms.deposit)}</span>
                    </div>
                    {data.terms.monthlyRent > 0 && (
                        <div className="vc-term">
                            <span className="term-label">월세</span>
                            <span className="term-value">{formatMoney(data.terms.monthlyRent)}</span>
                        </div>
                    )}
                    <div className="vc-term">
                        <span className="term-label">계약기간</span>
                        <span className="term-value">{data.terms.duration}</span>
                    </div>
                    <div className="vc-term">
                        <span className="term-label">전세가율</span>
                        <span className="term-value" style={{ color: getRiskColor(data.status.jeonseRatio) }}>
                            {data.status.jeonseRatio}%
                        </span>
                    </div>
                </div>

                {/* 위험 요소 */}
                {data.risks.length > 0 && (
                    <div className="vc-risks">
                        <h5>⚠️ 주의사항</h5>
                        {data.risks.map((risk, i) => (
                            <div key={i} className={`vc-risk ${risk.type}`}>
                                <span className="risk-icon">{risk.type === 'danger' ? '🚨' : '⚠️'}</span>
                                <span>{risk.text}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* 체크리스트 */}
                <div className="vc-checklist">
                    <h5>📋 체크리스트</h5>
                    <div className="checklist-grid">
                        {data.checklist.map((item, i) => (
                            <div key={i} className={`checklist-item ${item.done ? 'done' : 'pending'}`}>
                                <span className="check-icon">{item.done ? '✅' : '⬜'}</span>
                                <span>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 상태 배지 */}
                <div className="vc-status-badges">
                    <span className={`status-badge ${data.status.registration ? 'active' : 'inactive'}`}>
                        {data.status.registration ? '✓ 등기확인' : '✗ 등기미확인'}
                    </span>
                    <span className={`status-badge ${data.status.insurance ? 'active' : 'inactive'}`}>
                        {data.status.insurance ? '✓ 보증보험' : '✗ 보증보험'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default VisualContractCard;
