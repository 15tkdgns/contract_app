/**
 * 시각화 컴포넌트 예시 코드
 * 원본: constract/src/components/FraudCaseVisualization.jsx
 * 
 * 이 파일은 대시보드에서 사용된 시각화 렌더링 코드를 참고용으로 정리한 것입니다.
 */

import React from 'react';

/**
 * 게이지 차트 (전세가율)
 * SVG로 반원형 게이지 렌더링
 */
export const GaugeChart = ({ ratio, marketPrice, deposit }) => {
    const angle = (ratio / 100) * 180 - 90;

    const formatMoney = (value) => {
        if (value >= 100000000) {
            return `${Math.floor(value / 100000000)}억원`;
        }
        return `${Math.round(value / 10000).toLocaleString()}만원`;
    };

    return (
        <div className="viz-gauge">
            <svg viewBox="0 0 200 120" className="gauge-svg">
                {/* 배경 호 */}
                <path d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round" />
                {/* 안전 구간 (0-60%) */}
                <path d="M 20 100 A 80 80 0 0 1 60 35"
                    fill="none" stroke="#22c55e" strokeWidth="12" strokeLinecap="round" />
                {/* 주의 구간 (60-70%) */}
                <path d="M 60 35 A 80 80 0 0 1 100 20"
                    fill="none" stroke="#3b82f6" strokeWidth="12" strokeLinecap="round" />
                {/* 위험 구간 (70-80%) */}
                <path d="M 100 20 A 80 80 0 0 1 140 35"
                    fill="none" stroke="#f59e0b" strokeWidth="12" strokeLinecap="round" />
                {/* 매우 위험 구간 (80-100%) */}
                <path d="M 140 35 A 80 80 0 0 1 180 100"
                    fill="none" stroke="#dc2626" strokeWidth="12" strokeLinecap="round" />
                {/* 바늘 */}
                <line x1="100" y1="100"
                    x2={100 + 60 * Math.cos(angle * Math.PI / 180)}
                    y2={100 - 60 * Math.sin(angle * Math.PI / 180)}
                    stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
                <circle cx="100" cy="100" r="8" fill="#1f2937" />
            </svg>
            <div className="gauge-value">{ratio}%</div>
            <div className="gauge-label">전세가율</div>
            <div className="gauge-details">
                <span>매매가: {formatMoney(marketPrice)}</span>
                <span>보증금: {formatMoney(deposit)}</span>
            </div>
        </div>
    );
};

/**
 * 불일치 비교 박스
 */
export const MismatchBox = ({ registryOwner, contractLandlord, match }) => {
    return (
        <div className="viz-mismatch">
            <div className="mismatch-box owner">
                <span className="label">등기부 소유자</span>
                <span className="name">{registryOwner}</span>
            </div>
            <div className="mismatch-icon">
                <span className="not-equal">{match ? '=' : '≠'}</span>
                <span className="danger-text">{match ? '일치' : '불일치!'}</span>
            </div>
            <div className="mismatch-box landlord">
                <span className="label">계약서 임대인</span>
                <span className="name">{contractLandlord}</span>
            </div>
        </div>
    );
};

/**
 * 스택 바 차트 (선순위 권리)
 */
export const StackBar = ({ appraisalValue, seniorMortgage, seniorTenant, myDeposit, expectedRecovery }) => {
    const total = appraisalValue;

    const formatMoney = (value) => {
        if (value >= 100000000) {
            return `${Math.floor(value / 100000000)}억원`;
        }
        return `${Math.round(value / 10000).toLocaleString()}만원`;
    };

    return (
        <div className="viz-stack">
            <div className="stack-bar">
                <div className="stack-layer danger"
                    style={{ width: `${(seniorMortgage / total) * 100}%` }}>
                    <span>근저당 {formatMoney(seniorMortgage)}</span>
                </div>
                <div className="stack-layer warning"
                    style={{ width: `${(seniorTenant / total) * 100}%` }}>
                    <span>선순위 {formatMoney(seniorTenant)}</span>
                </div>
                <div className="stack-layer my-deposit"
                    style={{ width: `${(myDeposit / total) * 100}%` }}>
                    <span>내 보증금 {formatMoney(myDeposit)}</span>
                </div>
            </div>
            <div className="stack-legend">
                <span>감정가: {formatMoney(total)}</span>
                <span className="recovery">예상 회수: {formatMoney(expectedRecovery)}</span>
            </div>
        </div>
    );
};

/**
 * 타임라인 차트
 */
export const Timeline = ({ events }) => {
    const formatMoney = (value) => {
        if (value >= 100000000) {
            return `${Math.floor(value / 100000000)}억원`;
        }
        return `${Math.round(value / 10000).toLocaleString()}만원`;
    };

    return (
        <div className="viz-timeline">
            <div className="timeline-track">
                {events.map((evt, idx) => (
                    <div key={idx} className={`timeline-event ${evt.status}`}>
                        <div className="event-date">{evt.date}</div>
                        <div className="event-dot"></div>
                        <div className="event-content">
                            <span className="event-name">{evt.event}</span>
                            {evt.amount > 0 && (
                                <span className="event-amount">{formatMoney(evt.amount)}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * 네트워크 그래프 (간단 버전)
 */
export const NetworkGraph = ({ nodes, connections }) => {
    return (
        <div className="viz-network">
            <div className="network-nodes">
                {nodes.map((node) => (
                    <div key={node.id}
                        className={`network-node ${node.id === 'victim' ? 'victim' : 'criminal'}`}>
                        <span className="node-label">{node.label}</span>
                        <span className="node-role">{node.role}</span>
                    </div>
                ))}
            </div>
            <div className="network-warning">
                <span className="warning-badge">조직적 공모</span>
                <span className="warning-text">사기단 연결 구조</span>
            </div>
        </div>
    );
};

/**
 * CSS 스타일 참고 (인라인 또는 별도 파일)
 * 
 * .viz-gauge { text-align: center; }
 * .gauge-svg { width: 200px; height: 120px; }
 * .gauge-value { font-size: 2rem; font-weight: 700; color: #dc2626; }
 * 
 * .viz-mismatch { display: flex; align-items: center; gap: 1rem; }
 * .mismatch-box { padding: 1rem; border-radius: 8px; text-align: center; }
 * .mismatch-box.owner { background: #dbeafe; border: 2px solid #3b82f6; }
 * .mismatch-box.landlord { background: #fee2e2; border: 2px solid #dc2626; }
 * 
 * .viz-stack { width: 100%; }
 * .stack-bar { display: flex; height: 50px; border-radius: 8px; overflow: hidden; }
 * .stack-layer { display: flex; align-items: center; justify-content: center; color: white; }
 * .stack-layer.danger { background: #dc2626; }
 * .stack-layer.warning { background: #f59e0b; }
 * .stack-layer.my-deposit { background: #3b82f6; }
 */
