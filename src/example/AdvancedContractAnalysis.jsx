import React, { useState } from 'react';
import './AdvancedContractAnalysis.css';

/**
 * 고급 계약서 분석 - 불리한 조항 및 중요사항 시각화
 */
const AdvancedContractAnalysis = () => {
    const [selectedClause, setSelectedClause] = useState(null);
    const [activeTab, setActiveTab] = useState('risk');

    // 복잡한 임대차 계약서 조항들
    const contractClauses = [
        {
            id: 'c1',
            article: '제1조',
            title: '목적물의 표시',
            content: '서울특별시 강남구 테헤란로 456, 리치타워 2503호 (전용 112㎡)',
            riskLevel: 'low',
            riskScore: 10,
            category: 'basic',
            analysis: '기본 정보로 특별한 위험 없음'
        },
        {
            id: 'c2',
            article: '제2조',
            title: '보증금 및 월세',
            content: '보증금 5억원, 월세 200만원 (매월 말일 납부)',
            riskLevel: 'medium',
            riskScore: 40,
            category: 'money',
            analysis: '시세 대비 보증금이 다소 높음. 전세가율 확인 필요'
        },
        {
            id: 'c3',
            article: '제3조',
            title: '계약기간',
            content: '2025년 2월 1일부터 2027년 1월 31일까지 (24개월)',
            riskLevel: 'low',
            riskScore: 15,
            category: 'period',
            analysis: '표준 계약기간. 주택임대차보호법 적용 가능'
        },
        {
            id: 'c4',
            article: '제4조',
            title: '중도해지 위약금',
            content: '임차인이 중도 해지 시 잔여 월세의 3개월분을 위약금으로 지급한다.',
            riskLevel: 'high',
            riskScore: 75,
            category: 'penalty',
            analysis: '과도한 위약금 조항. 통상 1-2개월이 적정. 협상 권장',
            warning: '불리한 조항'
        },
        {
            id: 'c5',
            article: '제5조',
            title: '수선의무',
            content: '모든 시설물의 수선 및 교체 비용은 임차인이 부담한다.',
            riskLevel: 'critical',
            riskScore: 90,
            category: 'maintenance',
            analysis: '대수선 비용까지 임차인 부담은 부당. 민법상 임대인 부담이 원칙',
            warning: '매우 불리한 조항'
        },
        {
            id: 'c6',
            article: '제6조',
            title: '원상복구',
            content: '계약 종료 시 임차인은 처음 상태로 원상복구해야 하며, 불가 시 시가의 150%로 배상한다.',
            riskLevel: 'high',
            riskScore: 80,
            category: 'restoration',
            analysis: '150% 배상은 과도함. 통상 감가상각 적용이 공정',
            warning: '불리한 조항'
        },
        {
            id: 'c7',
            article: '제7조',
            title: '용도제한',
            content: '주거용으로만 사용하며, 임대인 동의 없이 용도변경, 전대 또는 양도할 수 없다.',
            riskLevel: 'low',
            riskScore: 20,
            category: 'usage',
            analysis: '표준적인 용도제한 조항'
        },
        {
            id: 'c8',
            article: '제8조',
            title: '임대인 출입권',
            content: '임대인은 언제든지 목적물에 출입하여 시설을 점검할 수 있다.',
            riskLevel: 'medium',
            riskScore: 55,
            category: 'access',
            analysis: '사전 통보 없는 출입은 사생활 침해. 24시간 사전 통보 조항 추가 권장',
            warning: '주의 필요'
        },
        {
            id: 'c9',
            article: '제9조',
            title: '계약갱신 거절',
            content: '임대인은 갱신 요구를 거절할 수 있으며, 이 경우 3개월 전에 통보한다.',
            riskLevel: 'high',
            riskScore: 70,
            category: 'renewal',
            analysis: '주택임대차보호법상 갱신거절권 제한 있음. 이 조항은 법적 효력 없을 수 있음',
            warning: '법적 검토 필요'
        },
        {
            id: 'c10',
            article: '제10조',
            title: '손해배상',
            content: '임차인의 과실로 인한 모든 손해에 대해 임차인이 전액 배상한다.',
            riskLevel: 'medium',
            riskScore: 50,
            category: 'liability',
            analysis: '과실 범위가 모호함. 구체적 정의 필요'
        },
        {
            id: 'c11',
            article: '제11조',
            title: '보증금 반환',
            content: '보증금은 퇴거 완료 후 60일 이내에 반환하며, 미납 월세 및 손해배상액을 공제할 수 있다.',
            riskLevel: 'high',
            riskScore: 65,
            category: 'deposit',
            analysis: '60일은 과도함. 통상 30일 이내. 공제 기준도 명확히 해야 함',
            warning: '불리한 조항'
        },
        {
            id: 'c12',
            article: '특약사항 1',
            title: '반려동물 금지',
            content: '반려동물 사육을 금지하며, 위반 시 즉시 계약을 해지할 수 있다.',
            riskLevel: 'medium',
            riskScore: 45,
            category: 'special',
            analysis: '반려동물이 있다면 사전 협의 필수'
        },
        {
            id: 'c13',
            article: '특약사항 2',
            title: '주차장 사용',
            content: '지하 1층 주차 1대 포함. 추가 차량은 월 20만원 별도 부담.',
            riskLevel: 'low',
            riskScore: 15,
            category: 'special',
            analysis: '적정 수준의 주차비'
        }
    ];

    // 위험도별 색상
    const riskColors = {
        low: '#22c55e',
        medium: '#f59e0b',
        high: '#ef4444',
        critical: '#dc2626'
    };

    // 위험도 통계
    const riskStats = {
        critical: contractClauses.filter(c => c.riskLevel === 'critical').length,
        high: contractClauses.filter(c => c.riskLevel === 'high').length,
        medium: contractClauses.filter(c => c.riskLevel === 'medium').length,
        low: contractClauses.filter(c => c.riskLevel === 'low').length,
    };

    const totalRiskScore = Math.round(
        contractClauses.reduce((sum, c) => sum + c.riskScore, 0) / contractClauses.length
    );

    // 위험도 분석 뷰
    const RiskAnalysisView = () => (
        <div className="risk-analysis-view">
            {/* 종합 위험도 스코어 */}
            <div className="risk-summary">
                <div className="risk-gauge">
                    <div
                        className="risk-gauge-fill"
                        style={{
                            width: `${totalRiskScore}%`,
                            background: totalRiskScore > 60 ? '#ef4444' :
                                totalRiskScore > 40 ? '#f59e0b' : '#22c55e'
                        }}
                    />
                    <span className="risk-score-label">{totalRiskScore}점</span>
                </div>
                <div className="risk-stats">
                    <div className="stat critical">
                        <span className="stat-count">{riskStats.critical}</span>
                        <span className="stat-label">매우 불리</span>
                    </div>
                    <div className="stat high">
                        <span className="stat-count">{riskStats.high}</span>
                        <span className="stat-label">불리</span>
                    </div>
                    <div className="stat medium">
                        <span className="stat-count">{riskStats.medium}</span>
                        <span className="stat-label">주의</span>
                    </div>
                    <div className="stat low">
                        <span className="stat-count">{riskStats.low}</span>
                        <span className="stat-label">양호</span>
                    </div>
                </div>
            </div>

            {/* 조항별 위험도 바 차트 */}
            <div className="clause-risk-bars">
                <h4>조항별 위험도</h4>
                {contractClauses.map(clause => (
                    <div
                        key={clause.id}
                        className={`clause-bar-row ${selectedClause === clause.id ? 'selected' : ''}`}
                        onClick={() => setSelectedClause(clause.id === selectedClause ? null : clause.id)}
                    >
                        <div className="clause-bar-label">
                            <span className="clause-article">{clause.article}</span>
                            <span className="clause-title">{clause.title}</span>
                            {clause.warning && (
                                <span className={`clause-warning ${clause.riskLevel}`}>
                                    {clause.warning}
                                </span>
                            )}
                        </div>
                        <div className="clause-bar-container">
                            <div
                                className="clause-bar-fill"
                                style={{
                                    width: `${clause.riskScore}%`,
                                    backgroundColor: riskColors[clause.riskLevel]
                                }}
                            />
                        </div>
                        <span className="clause-score">{clause.riskScore}점</span>
                    </div>
                ))}
            </div>

            {/* 선택된 조항 상세 */}
            {selectedClause && (
                <div className="clause-detail">
                    {(() => {
                        const clause = contractClauses.find(c => c.id === selectedClause);
                        return (
                            <>
                                <h4>
                                    <span className={`risk-badge ${clause.riskLevel}`}>
                                        {clause.riskLevel === 'critical' ? '매우 불리' :
                                            clause.riskLevel === 'high' ? '불리' :
                                                clause.riskLevel === 'medium' ? '주의' : '양호'}
                                    </span>
                                    {clause.article} {clause.title}
                                </h4>
                                <div className="clause-content">
                                    <p className="content-text">"{clause.content}"</p>
                                    <div className="analysis-box">
                                        <strong>분석:</strong> {clause.analysis}
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </div>
            )}
        </div>
    );

    // 조항 관계 그래프 뷰
    const ClauseRelationView = () => (
        <div className="clause-relation-view">
            <div className="relation-diagram">
                {/* 임대인 측 */}
                <div className="party-column landlord">
                    <div className="party-header">임대인 유리</div>
                    {contractClauses
                        .filter(c => c.riskLevel === 'high' || c.riskLevel === 'critical')
                        .map(clause => (
                            <div
                                key={clause.id}
                                className={`relation-node ${clause.riskLevel}`}
                                onClick={() => setSelectedClause(clause.id)}
                            >
                                <span className="node-article">{clause.article}</span>
                                <span className="node-title">{clause.title}</span>
                            </div>
                        ))
                    }
                </div>

                {/* 중립 */}
                <div className="party-column neutral">
                    <div className="party-header">중립/표준</div>
                    {contractClauses
                        .filter(c => c.riskLevel === 'low')
                        .map(clause => (
                            <div
                                key={clause.id}
                                className="relation-node low"
                                onClick={() => setSelectedClause(clause.id)}
                            >
                                <span className="node-article">{clause.article}</span>
                                <span className="node-title">{clause.title}</span>
                            </div>
                        ))
                    }
                </div>

                {/* 주의 필요 */}
                <div className="party-column caution">
                    <div className="party-header">주의 필요</div>
                    {contractClauses
                        .filter(c => c.riskLevel === 'medium')
                        .map(clause => (
                            <div
                                key={clause.id}
                                className="relation-node medium"
                                onClick={() => setSelectedClause(clause.id)}
                            >
                                <span className="node-article">{clause.article}</span>
                                <span className="node-title">{clause.title}</span>
                            </div>
                        ))
                    }
                </div>
            </div>

            {/* 범례 */}
            <div className="relation-legend">
                <div className="legend-item">
                    <span className="legend-dot critical"></span>
                    <span>매우 불리 (협상 필수)</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot high"></span>
                    <span>불리 (협상 권장)</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot medium"></span>
                    <span>주의 필요</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot low"></span>
                    <span>표준/양호</span>
                </div>
            </div>
        </div>
    );

    // 카테고리별 분석 뷰
    const CategoryAnalysisView = () => {
        const categories = {
            money: { label: '금전 관련' },
            penalty: { label: '위약금/벌칙' },
            maintenance: { label: '수선/관리' },
            period: { label: '기간 관련' },
            access: { label: '출입/사생활' },
            renewal: { label: '계약갱신' },
            deposit: { label: '보증금 반환' },
            special: { label: '특약사항' },
            basic: { label: '기본정보' },
            usage: { label: '용도제한' },
            restoration: { label: '원상복구' },
            liability: { label: '손해배상' },
        };

        const groupedClauses = {};
        contractClauses.forEach(clause => {
            if (!groupedClauses[clause.category]) {
                groupedClauses[clause.category] = [];
            }
            groupedClauses[clause.category].push(clause);
        });

        return (
            <div className="category-analysis-view">
                <div className="category-grid">
                    {Object.entries(groupedClauses).map(([catKey, clauses]) => {
                        const cat = categories[catKey];
                        const maxRisk = Math.max(...clauses.map(c => c.riskScore));
                        const riskLevel = maxRisk >= 70 ? 'high' : maxRisk >= 40 ? 'medium' : 'low';

                        return (
                            <div key={catKey} className={`category-card ${riskLevel}`}>
                                <div className="category-header">
                                    <span className="category-label">{cat?.label || catKey}</span>
                                </div>
                                <div className="category-clauses">
                                    {clauses.map(clause => (
                                        <div
                                            key={clause.id}
                                            className={`mini-clause ${clause.riskLevel}`}
                                            onClick={() => setSelectedClause(clause.id)}
                                        >
                                            <span>{clause.article}</span>
                                            {clause.warning && <span className="mini-warning">!</span>}
                                        </div>
                                    ))}
                                </div>
                                <div className="category-risk-indicator">
                                    최고 위험도: {maxRisk}점
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="advanced-contract-analysis card">
            <div className="card-header">
                <div className="card-icon analysis-bg">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                    </svg>
                </div>
                <h3 className="card-title">고급 계약서 분석 (불리조항 탐지)</h3>
                <span className="demo-badge">ADVANCED</span>
            </div>

            <div className="analysis-tabs">
                <button
                    className={`analysis-tab ${activeTab === 'risk' ? 'active' : ''}`}
                    onClick={() => setActiveTab('risk')}
                >
                    위험도 분석
                </button>
                <button
                    className={`analysis-tab ${activeTab === 'relation' ? 'active' : ''}`}
                    onClick={() => setActiveTab('relation')}
                >
                    조항 관계도
                </button>
                <button
                    className={`analysis-tab ${activeTab === 'category' ? 'active' : ''}`}
                    onClick={() => setActiveTab('category')}
                >
                    카테고리 분석
                </button>
            </div>

            <div className="analysis-content">
                {activeTab === 'risk' && <RiskAnalysisView />}
                {activeTab === 'relation' && <ClauseRelationView />}
                {activeTab === 'category' && <CategoryAnalysisView />}
            </div>

            <div className="analysis-footer">
                <p>* 본 분석은 AI 기반 참고용이며, 실제 법률 검토가 필요합니다.</p>
            </div>
        </div>
    );
};

export default AdvancedContractAnalysis;
