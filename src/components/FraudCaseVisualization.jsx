import React, { useState } from 'react';
import './FraudCaseVisualization.css';

const FraudCaseVisualization = () => {
    const [activeCase, setActiveCase] = useState(0);

    const fraudCases = [
        {
            id: 1,
            title: '깡통전세',
            subtitle: '전세가율 과도',
            riskLevel: 'critical',
            description: '매매가 대비 전세보증금이 과도하여 시세 하락 시 보증금 미회수',
            visualization: {
                type: 'gauge',
                data: {
                    jeonseRatio: 95,
                    marketPrice: 800000000,
                    deposit: 760000000,
                    expectedLoss: 200000000
                }
            },
            riskyBehaviors: [
                '시세 확인 없이 저렴하다고 바로 계약',
                '전세가율 80% 이상 물건에 계약',
                '주변 시세 비교 없이 중개사 말만 신뢰',
                '급매물이라는 이유로 검증 생략',
                '보증보험 가입 여부 미확인'
            ],
            safeBehaviors: [
                '국토부 실거래가, KB시세 등으로 시세 직접 확인',
                '전세가율 70% 이하 물건 선택',
                '같은 단지 3개 이상 매물 가격 비교',
                '전세보증보험 가입 가능 여부 사전 확인',
                '시세 급락 지역(미분양 많은 곳) 피하기'
            ],
            warnings: [
                '전세가율 95%로 매우 높음',
                '시세 하락 시 보증금 전액 손실 위험',
                '경매 시 예상 손실: 2억원 이상'
            ],
            recommendations: [
                '전세가율 70% 이하 물건 권장',
                '전세보증보험 필수 가입',
                '시세 조사 철저히'
            ]
        },
        {
            id: 2,
            title: '소유자-임대인 불일치',
            subtitle: '명의신탁 의심',
            riskLevel: 'high',
            description: '등기부상 소유자와 계약서상 임대인이 다른 경우',
            visualization: {
                type: 'mismatch',
                data: {
                    registryOwner: '김철수',
                    contractLandlord: '이영희',
                    match: false
                }
            },
            riskyBehaviors: [
                '등기부등본 확인 없이 계약',
                '대리인이라는 말만 믿고 계약',
                '신분증 사본만 받고 본인 확인 생략',
                '위임장 공증 여부 미확인',
                '실소유자와 통화/대면 없이 진행'
            ],
            safeBehaviors: [
                '인터넷등기소에서 등기부등본 직접 발급',
                '등기부 소유자와 신분증 대조',
                '실소유자 본인과 반드시 대면 또는 영상통화',
                '대리인 계약 시 공증된 위임장 요구',
                '법무사 입회 하에 계약 체결'
            ],
            warnings: [
                '등기부 소유자 ≠ 계약서 임대인',
                '명의신탁 또는 무권한 전세 가능',
                '계약 무효 위험'
            ],
            recommendations: [
                '등기부등본 직접 발급 확인',
                '실소유자와 직접 대면 계약',
                '법무사 상담 필수'
            ]
        },
        {
            id: 3,
            title: '보증보험 미가입',
            subtitle: '보증금 보호 불가',
            riskLevel: 'high',
            description: '임대인 파산 시 보증금 미회수 가능',
            visualization: {
                type: 'insurance',
                data: {
                    hasHUG: false,
                    hasSGI: false,
                    deposit: 350000000
                }
            },
            riskyBehaviors: [
                '보증보험 없이 고액 전세 계약',
                '임대인이 거부한다고 보험 가입 포기',
                '보험 가입 가능 조건 미확인',
                '확정일자만 받으면 된다고 생각',
                '전입신고 미루기'
            ],
            safeBehaviors: [
                '계약 전 HUG/SGI 보험 가입 조건 확인',
                '보험 가입을 특약으로 명시',
                '보험 미가입 시 계약 파기 조항 삽입',
                '입주 당일 전입신고 + 확정일자',
                '보증금반환보증 가입 완료 후 잔금 지급'
            ],
            warnings: [
                'HUG/SGI 보증보험 미가입',
                '임대인 파산 시 보증금 전액 손실',
                '대위변제 불가'
            ],
            recommendations: [
                '계약 전 보증보험 가입 조건 명시',
                'HUG 또는 SGI 가입 필수',
                '보증 한도 확인'
            ]
        },
        {
            id: 4,
            title: '선순위 권리 과다',
            subtitle: '회수 불가',
            riskLevel: 'critical',
            description: '내 보증금보다 선순위 채권이 많아 경매 시 회수 불가',
            visualization: {
                type: 'stack',
                data: {
                    appraisalValue: 1000000000,
                    seniorMortgage: 400000000,
                    seniorTenant: 300000000,
                    myDeposit: 400000000,
                    expectedRecovery: 100000000
                }
            },
            riskyBehaviors: [
                '등기부 을구(근저당) 확인 생략',
                '근저당 금액이 높아도 괜찮다고 믿음',
                '선순위 임차인 존재 여부 미확인',
                '경매 시 배당순위 이해 부족',
                '법무사 권리분석 없이 계약'
            ],
            safeBehaviors: [
                '등기부 을구에서 근저당 총액 확인',
                '(근저당 + 선순위 임차보증금) < 시세 70% 확인',
                '임차권등기 또는 전입 순위 확인',
                '법무사에게 권리분석 의뢰',
                '배당순위 시뮬레이션 후 계약'
            ],
            warnings: [
                '선순위 근저당 4억원',
                '선순위 임차인 3억원',
                '경매 시 예상 회수: 0~1억원'
            ],
            recommendations: [
                '등기부 권리관계 철저히 확인',
                '선순위 합계 < 감정가 70%인지 확인',
                '법무사 권리분석 의뢰'
            ]
        },
        {
            id: 5,
            title: '대리인 계약 사기',
            subtitle: '위임장 위조',
            riskLevel: 'critical',
            description: '위조된 위임장으로 대리인이 계약하여 보증금 편취',
            visualization: {
                type: 'delegation',
                data: {
                    owner: '김철수 (실소유자)',
                    agent: '박사기 (가짜 대리인)',
                    hasNotarizedPOA: false,
                    ownerVerified: false
                }
            },
            riskyBehaviors: [
                '대리인 계약이라는 말에 그냥 수긍',
                '위임장 원본 미확인 (사본만 봄)',
                '공증 여부 확인 생략',
                '실소유자에게 전화/영상 확인 안함',
                '대리인 계좌로 보증금 송금'
            ],
            safeBehaviors: [
                '위임장 원본 및 공증 확인 필수',
                '실소유자 본인에게 직접 영상통화',
                '실소유자 계좌로만 보증금 송금',
                '법무사 입회 하에 계약',
                '인감증명서 발급일자 확인 (최근 3개월 이내)'
            ],
            warnings: [
                '위임장 공증 미확인',
                '실소유자 본인 확인 불가',
                '대리인 신분증만 확인',
                '계약금 수령 후 잠적 위험'
            ],
            recommendations: [
                '위임장 공증 필수 확인',
                '실소유자 영상통화/대면 확인',
                '법무사 입회 하에 계약',
                '계약금 에스크로 활용'
            ]
        },
        {
            id: 6,
            title: '이중계약 사기',
            subtitle: '동일 물건 다수 계약',
            riskLevel: 'critical',
            description: '같은 물건에 여러 명과 계약하여 보증금 다중 수령',
            visualization: {
                type: 'timeline',
                data: {
                    events: [
                        { date: '1월 5일', event: 'A씨 계약', amount: 300000000, status: 'danger' },
                        { date: '1월 8일', event: 'B씨 계약', amount: 280000000, status: 'danger' },
                        { date: '1월 12일', event: 'C씨 계약 (나)', amount: 290000000, status: 'current' },
                        { date: '1월 15일', event: '임대인 잠적', amount: 0, status: 'critical' }
                    ]
                }
            },
            riskyBehaviors: [
                '급하다는 말에 서류 검토 생략',
                '현금으로 계약금 지급',
                '전입신고를 나중에 하겠다고 미룸',
                '확정일자 받는 것을 귀찮아함',
                '현 거주자 확인 없이 계약'
            ],
            safeBehaviors: [
                '입주 즉시 전입신고 + 확정일자',
                '계약 전 현 거주자 유무 확인',
                '이웃에게 해당 집 거주 이력 탐문',
                '계좌이체로 보증금 송금 (증거 확보)',
                '잔금 전날 등기부 재발급 확인'
            ],
            warnings: [
                '급매물 강조하며 서두름',
                '계약금 즉시 현금 요구',
                '전입신고 지연 요청',
                '확정일자 미루기'
            ],
            recommendations: [
                '확정일자 당일 받기',
                '전입신고 즉시 처리',
                '잔금 전 등기부 재확인',
                '이웃에게 거주자 탐문'
            ]
        },
        {
            id: 7,
            title: '전세 사기단',
            subtitle: '조직적 사기',
            riskLevel: 'critical',
            description: '중개사-임대인-법무사가 공모한 조직적 전세 사기',
            visualization: {
                type: 'network',
                data: {
                    nodes: [
                        { id: 'broker', label: '공인중개사 A', role: '미끼 유인' },
                        { id: 'landlord', label: '가짜 임대인 B', role: '계약 체결' },
                        { id: 'lawyer', label: '가담 법무사 C', role: '서류 위조' },
                        { id: 'victim', label: '피해자', role: '보증금 손실' }
                    ],
                    connections: [
                        { from: 'broker', to: 'landlord' },
                        { from: 'landlord', to: 'lawyer' },
                        { from: 'broker', to: 'victim' }
                    ]
                }
            },
            riskyBehaviors: [
                '중개사가 소개한 법무사만 이용',
                '중개사와 임대인이 친한 것을 무시',
                '시세 대비 너무 저렴해도 그냥 계약',
                '서류를 중개사가 다 처리해준다고 맡김',
                '등기부를 직접 발급하지 않음'
            ],
            safeBehaviors: [
                '공인중개사 자격증 조회 (국가자격포털)',
                '등기부등본 직접 인터넷등기소에서 발급',
                '법무사도 직접 선정 (중개사 추천 거부)',
                '시세 대비 10% 이상 저렴하면 이유 확인',
                '이웃에게 임대인 정보 탐문'
            ],
            warnings: [
                '중개사-임대인 관계 의심',
                '서류 일관성 부족',
                '이상하게 저렴한 가격',
                '급하게 계약 종용'
            ],
            recommendations: [
                '공인중개사 자격증 직접 확인',
                '등기부등본 직접 발급',
                '이웃 탐문 조사',
                '전세가율 시세 비교'
            ]
        },
        {
            id: 8,
            title: '근저당 급증 사기',
            subtitle: '계약 후 권리 변동',
            riskLevel: 'high',
            description: '계약 체결 후 잔금 전까지 근저당 추가 설정',
            visualization: {
                type: 'rights-timeline',
                data: {
                    events: [
                        { date: '계약일', mortgage: 0, status: 'safe' },
                        { date: '계약+3일', mortgage: 200000000, status: 'warning' },
                        { date: '계약+7일', mortgage: 500000000, status: 'danger' },
                        { date: '잔금일', mortgage: 800000000, status: 'critical' }
                    ],
                    myDeposit: 300000000
                }
            },
            riskyBehaviors: [
                '계약 후 잔금까지 등기부 재확인 안함',
                '특약에 권리변동 금지 조항 누락',
                '잔금 지급 전 등기부 미확인',
                '계약서에 위반 시 배상 조항 없음',
                '계약-잔금 사이 기간이 너무 긴 계약'
            ],
            safeBehaviors: [
                '계약서에 "권리변동 시 계약 해지" 특약',
                '잔금 당일 아침 등기부 재확인',
                '법무사 에스크로 활용',
                '계약-잔금 사이 기간 최소화 (2주 이내)',
                '등기부 변동 알림 서비스 활용'
            ],
            warnings: [
                '계약 후 등기부 변동',
                '추가 대출 설정',
                '잔금 전 권리 급증',
                '특약 위반'
            ],
            recommendations: [
                '잔금 당일 등기부 재확인',
                '특약에 권리변동 금지 명시',
                '법무사 에스크로 활용',
                '위반 시 계약 해지 조항 삽입'
            ]
        }
    ];

    const getRiskColor = (level) => {
        switch (level) {
            case 'critical': return '#dc2626';
            case 'high': return '#f59e0b';
            case 'medium': return '#3b82f6';
            default: return '#22c55e';
        }
    };

    const getRiskLabel = (level) => {
        switch (level) {
            case 'critical': return '매우 위험';
            case 'high': return '위험';
            case 'medium': return '주의';
            default: return '안전';
        }
    };

    const formatMoney = (value) => {
        if (value >= 100000000) {
            const billions = Math.floor(value / 100000000);
            const remainder = (value % 100000000) / 10000;
            if (remainder > 0) return `${billions}억 ${Math.round(remainder).toLocaleString()}만원`;
            return `${billions}억원`;
        }
        if (value >= 10000) return `${Math.round(value / 10000).toLocaleString()}만원`;
        return `${value.toLocaleString()}원`;
    };

    const currentCase = fraudCases[activeCase];

    const renderVisualization = () => {
        const { type, data } = currentCase.visualization;

        if (type === 'gauge') {
            const angle = (data.jeonseRatio / 100) * 180 - 90;
            return (
                <div className="viz-gauge">
                    <svg viewBox="0 0 200 120" className="gauge-svg">
                        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round" />
                        <path d="M 20 100 A 80 80 0 0 1 60 35" fill="none" stroke="#22c55e" strokeWidth="12" strokeLinecap="round" />
                        <path d="M 60 35 A 80 80 0 0 1 100 20" fill="none" stroke="#3b82f6" strokeWidth="12" strokeLinecap="round" />
                        <path d="M 100 20 A 80 80 0 0 1 140 35" fill="none" stroke="#f59e0b" strokeWidth="12" strokeLinecap="round" />
                        <path d="M 140 35 A 80 80 0 0 1 180 100" fill="none" stroke="#dc2626" strokeWidth="12" strokeLinecap="round" />
                        <line x1="100" y1="100" x2={100 + 60 * Math.cos(angle * Math.PI / 180)} y2={100 - 60 * Math.sin(angle * Math.PI / 180)} stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
                        <circle cx="100" cy="100" r="8" fill="#1f2937" />
                    </svg>
                    <div className="gauge-value">{data.jeonseRatio}%</div>
                    <div className="gauge-label">전세가율</div>
                    <div className="gauge-details">
                        <span>매매가: {formatMoney(data.marketPrice)}</span>
                        <span>보증금: {formatMoney(data.deposit)}</span>
                    </div>
                </div>
            );
        }

        if (type === 'mismatch') {
            return (
                <div className="viz-mismatch">
                    <div className="mismatch-box owner">
                        <span className="label">등기부 소유자</span>
                        <span className="name">{data.registryOwner}</span>
                    </div>
                    <div className="mismatch-icon">
                        <span className="not-equal">≠</span>
                        <span className="danger-text">불일치!</span>
                    </div>
                    <div className="mismatch-box landlord">
                        <span className="label">계약서 임대인</span>
                        <span className="name">{data.contractLandlord}</span>
                    </div>
                </div>
            );
        }

        if (type === 'insurance') {
            return (
                <div className="viz-insurance">
                    <div className="insurance-status">
                        <div className={`insurance-item ${data.hasHUG ? 'active' : 'inactive'}`}>
                            <span className="icon">{data.hasHUG ? '✓' : '✗'}</span>
                            <span className="name">HUG 보증</span>
                        </div>
                        <div className={`insurance-item ${data.hasSGI ? 'active' : 'inactive'}`}>
                            <span className="icon">{data.hasSGI ? '✓' : '✗'}</span>
                            <span className="name">SGI 보증</span>
                        </div>
                    </div>
                    <div className="insurance-warning">
                        <span className="warning-icon">⚠</span>
                        <span>보증금 {formatMoney(data.deposit)} 보호 불가</span>
                    </div>
                </div>
            );
        }

        if (type === 'stack') {
            const total = data.appraisalValue;
            return (
                <div className="viz-stack">
                    <div className="stack-bar">
                        <div className="stack-layer danger" style={{ width: `${(data.seniorMortgage / total) * 100}%` }}>
                            <span>근저당 {formatMoney(data.seniorMortgage)}</span>
                        </div>
                        <div className="stack-layer warning" style={{ width: `${(data.seniorTenant / total) * 100}%` }}>
                            <span>선순위 {formatMoney(data.seniorTenant)}</span>
                        </div>
                        <div className="stack-layer my-deposit" style={{ width: `${(data.myDeposit / total) * 100}%` }}>
                            <span>내 보증금 {formatMoney(data.myDeposit)}</span>
                        </div>
                    </div>
                    <div className="stack-legend">
                        <span>감정가: {formatMoney(total)}</span>
                        <span className="recovery">예상 회수: {formatMoney(data.expectedRecovery)}</span>
                    </div>
                </div>
            );
        }

        if (type === 'delegation') {
            return (
                <div className="viz-delegation">
                    <div className="delegation-flow">
                        <div className="delegation-box owner">
                            <span className="label">실소유자</span>
                            <span className="name">{data.owner}</span>
                            <span className="status unknown">확인 불가</span>
                        </div>
                        <div className="delegation-arrow">
                            <span className="arrow-line">---?---</span>
                            <span className="poa-status danger">위임장 미공증</span>
                        </div>
                        <div className="delegation-box agent danger">
                            <span className="label">대리인</span>
                            <span className="name">{data.agent}</span>
                            <span className="status danger">위험</span>
                        </div>
                    </div>
                    <div className="delegation-checks">
                        <div className={`check-item ${data.hasNotarizedPOA ? 'pass' : 'fail'}`}>
                            {data.hasNotarizedPOA ? '✓' : '✗'} 위임장 공증
                        </div>
                        <div className={`check-item ${data.ownerVerified ? 'pass' : 'fail'}`}>
                            {data.ownerVerified ? '✓' : '✗'} 본인 확인
                        </div>
                    </div>
                </div>
            );
        }

        if (type === 'timeline') {
            return (
                <div className="viz-timeline">
                    <div className="timeline-track">
                        {data.events.map((evt, idx) => (
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
        }

        if (type === 'network') {
            return (
                <div className="viz-network">
                    <div className="network-nodes">
                        {data.nodes.map((node) => (
                            <div key={node.id} className={`network-node ${node.id === 'victim' ? 'victim' : 'criminal'}`}>
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
        }

        if (type === 'rights-timeline') {
            return (
                <div className="viz-rights-timeline">
                    <div className="rights-track">
                        {data.events.map((evt, idx) => (
                            <div key={idx} className={`rights-event ${evt.status}`}>
                                <div className="rights-date">{evt.date}</div>
                                <div className="rights-bar" style={{
                                    height: `${Math.min((evt.mortgage / 1000000000) * 100, 100)}%`
                                }}>
                                    {evt.mortgage > 0 && formatMoney(evt.mortgage)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="rights-deposit-line" style={{ bottom: `${(data.myDeposit / 1000000000) * 100}%` }}>
                        <span>내 보증금 {formatMoney(data.myDeposit)}</span>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="fraud-case-card card">
            <div className="card-header">
                <div className="card-icon warning-bg">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                </div>
                <h3 className="card-title">전세 사기 사례 분석</h3>
            </div>

            <div className="case-tabs">
                {fraudCases.map((c, idx) => (
                    <button
                        key={c.id}
                        className={`case-tab ${activeCase === idx ? 'active' : ''}`}
                        onClick={() => setActiveCase(idx)}
                        style={{ borderColor: activeCase === idx ? getRiskColor(c.riskLevel) : 'transparent' }}
                    >
                        <span className="tab-number">Case {c.id}</span>
                        <span className="tab-title">{c.title}</span>
                    </button>
                ))}
            </div>

            <div className="case-content">
                <div className="case-header">
                    <div className="case-info">
                        <h4>{currentCase.title}</h4>
                        <p>{currentCase.subtitle}</p>
                    </div>
                    <span
                        className="risk-badge"
                        style={{ backgroundColor: getRiskColor(currentCase.riskLevel) }}
                    >
                        {getRiskLabel(currentCase.riskLevel)}
                    </span>
                </div>

                <p className="case-description">{currentCase.description}</p>

                <div className="case-visualization">
                    {renderVisualization()}
                </div>

                <div className="case-details">
                    <div className="warnings-section">
                        <h5>위험 신호</h5>
                        <ul>
                            {currentCase.warnings.map((w, i) => (
                                <li key={i}>{w}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="recommendations-section">
                        <h5>권장 사항</h5>
                        <ul>
                            {currentCase.recommendations.map((r, i) => (
                                <li key={i}>{r}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {currentCase.riskyBehaviors && (
                    <div className="behaviors-section">
                        <div className="risky-behaviors">
                            <h5>이렇게 하면 위험!</h5>
                            <ul>
                                {currentCase.riskyBehaviors.map((b, i) => (
                                    <li key={i}>{b}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="safe-behaviors">
                            <h5>이렇게 해야 안전!</h5>
                            <ul>
                                {currentCase.safeBehaviors.map((b, i) => (
                                    <li key={i}>{b}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FraudCaseVisualization;
