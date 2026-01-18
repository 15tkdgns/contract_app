import React, { useState } from 'react';
import ContractTextGraph from './ContractTextGraph';
import './ContractEntityViews.css';

/**
 * 계약서 개체 관계 시각화 - 2가지 뷰
 * 1. 관계 그래프 (React Flow)
 * 2. 허브 레이아웃 (CSS)
 */
const ContractEntityViews = () => {
    const [currentView, setCurrentView] = useState('hub');

    // 카테고리 및 개체 데이터
    const categories = {
        people: {
            label: '사람',
            color: '#6366f1',
            bgColor: '#eef2ff',
            entities: [
                { role: '임대인(갑)', value: '김철수' },
                { role: '임차인(을)', value: '이영희' },
                { role: '중개사 대표', value: '박중개' },
            ]
        },
        assets: {
            label: '자산',
            color: '#6366f1',
            bgColor: '#eef2ff',
            entities: [
                { role: '소재지', value: '서울 강남구 테헤란로 123' },
                { role: '건물명', value: '삼성아파트 101동 1502호' },
                { role: '전용면적', value: '84.9㎡ (25.7평)' },
                { role: '보증금', value: '350,000,000원' },
                { role: '계약금', value: '35,000,000원' },
                { role: '잔금', value: '315,000,000원' },
            ]
        },
        period: {
            label: '기간',
            color: '#6366f1',
            bgColor: '#eef2ff',
            entities: [
                { role: '계약시작일', value: '2025년 1월 15일' },
                { role: '계약종료일', value: '2027년 1월 14일' },
                { role: '계약기간', value: '24개월' },
            ]
        },
        legal: {
            label: '법적 조건',
            color: '#6366f1',
            bgColor: '#eef2ff',
            entities: [
                { role: '금지조항', value: '용도변경 금지' },
                { role: '금지조항', value: '전대 금지' },
                { role: '금지조항', value: '임차권 양도 금지' },
                { role: '해지조건', value: '2기 차임 연체' },
                { role: '법적효과', value: '계약 해지 가능' },
            ]
        },
        organization: {
            label: '기관',
            color: '#6366f1',
            bgColor: '#eef2ff',
            entities: [
                { role: '중개사무소', value: '행복공인중개사사무소' },
                { role: '등록번호', value: '제12345호' },
            ]
        }
    };

    // 관계 데이터
    const relations = [
        { from: '김철수', to: '서울 강남구 테헤란로 123', label: '소유', fromCat: 'people', toCat: 'assets' },
        { from: '김철수', to: '350,000,000원', label: '수령', fromCat: 'people', toCat: 'assets' },
        { from: '이영희', to: '350,000,000원', label: '지급', fromCat: 'people', toCat: 'assets' },
        { from: '이영희', to: '용도변경 금지', label: '의무', fromCat: 'people', toCat: 'legal' },
        { from: '행복공인중개사사무소', to: '김철수', label: '중개', fromCat: 'organization', toCat: 'people' },
        { from: '행복공인중개사사무소', to: '이영희', label: '중개', fromCat: 'organization', toCat: 'people' },
    ];

    // 시안 1: 카드 그리드 뷰
    const CardGridView = () => (
        <div className="view-container card-grid-view">
            <div className="category-grid">
                {Object.entries(categories).map(([key, cat]) => (
                    <div
                        key={key}
                        className="category-card"
                        style={{
                            borderColor: cat.color,
                            backgroundColor: cat.bgColor
                        }}
                    >
                        <div className="category-header" style={{ backgroundColor: cat.color }}>
                            <span className="category-label">{cat.label}</span>
                            <span className="category-count">{cat.entities.length}</span>
                        </div>
                        <div className="category-entities">
                            {cat.entities.map((entity, idx) => (
                                <div key={idx} className="entity-row">
                                    <span className="entity-role">{entity.role}</span>
                                    <span className="entity-value">{entity.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // 시안 2: 중앙 허브 뷰 (임차인 중심)
    const HubView = () => (
        <div className="view-container hub-view">
            <div className="hub-layout">
                {/* 좌측: 사람 */}
                <div className="hub-section left">
                    <div className="section-label" style={{ color: categories.people.color }}>
                        {categories.people.icon} {categories.people.label}
                    </div>
                    {categories.people.entities.map((e, i) => (
                        <div key={i} className="hub-node" style={{ borderColor: categories.people.color }}>
                            <span className="node-role">{e.role}</span>
                            <span className="node-value">{e.value}</span>
                        </div>
                    ))}
                </div>

                {/* 중앙: 자산 (핵심) */}
                <div className="hub-section center">
                    <div className="section-label" style={{ color: categories.assets.color }}>
                        {categories.assets.icon} {categories.assets.label}
                    </div>
                    <div className="hub-core" style={{ borderColor: categories.assets.color }}>
                        {categories.assets.entities.slice(0, 3).map((e, i) => (
                            <div key={i} className="core-item">
                                <span className="core-role">{e.role}</span>
                                <span className="core-value">{e.value}</span>
                            </div>
                        ))}
                    </div>
                    <div className="hub-money">
                        {categories.assets.entities.slice(3).map((e, i) => (
                            <div key={i} className="money-item" style={{ borderColor: '#ef4444' }}>
                                <span className="money-role">{e.role}</span>
                                <span className="money-value">{e.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 우측: 기간 */}
                <div className="hub-section right">
                    <div className="section-label" style={{ color: categories.period.color }}>
                        {categories.period.icon} {categories.period.label}
                    </div>
                    {categories.period.entities.map((e, i) => (
                        <div key={i} className="hub-node" style={{ borderColor: categories.period.color }}>
                            <span className="node-role">{e.role}</span>
                            <span className="node-value">{e.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 하단: 법적조건 + 기관 */}
            <div className="hub-bottom">
                <div className="bottom-section">
                    <div className="section-label" style={{ color: categories.legal.color }}>
                        {categories.legal.icon} {categories.legal.label}
                    </div>
                    <div className="bottom-items">
                        {categories.legal.entities.map((e, i) => (
                            <div key={i} className="bottom-item" style={{ borderColor: categories.legal.color }}>
                                <span className="item-role">{e.role}</span>
                                <span className="item-value">{e.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bottom-section">
                    <div className="section-label" style={{ color: categories.organization.color }}>
                        {categories.organization.icon} {categories.organization.label}
                    </div>
                    <div className="bottom-items">
                        {categories.organization.entities.map((e, i) => (
                            <div key={i} className="bottom-item" style={{ borderColor: categories.organization.color }}>
                                <span className="item-role">{e.role}</span>
                                <span className="item-value">{e.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // 시안 3: 관계 매트릭스 뷰
    const MatrixView = () => (
        <div className="view-container matrix-view">
            <table className="relation-matrix">
                <thead>
                    <tr>
                        <th></th>
                        <th style={{ background: categories.people.bgColor }}>👤 사람</th>
                        <th style={{ background: categories.assets.bgColor }}>🏠 자산</th>
                        <th style={{ background: categories.period.bgColor }}>📅 기간</th>
                        <th style={{ background: categories.legal.bgColor }}>⚖️ 법적조건</th>
                        <th style={{ background: categories.organization.bgColor }}>🏢 기관</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th style={{ background: categories.people.bgColor }}>👤 사람</th>
                        <td>
                            <div className="matrix-entities">
                                {categories.people.entities.map((e, i) => (
                                    <span key={i} className="matrix-tag" style={{ borderColor: categories.people.color }}>{e.value}</span>
                                ))}
                            </div>
                        </td>
                        <td className="relation-cell">
                            <span className="relation-tag">소유/수령</span>
                            <span className="relation-tag">지급/임차</span>
                        </td>
                        <td className="relation-cell">
                            <span className="relation-tag">계약체결</span>
                        </td>
                        <td className="relation-cell">
                            <span className="relation-tag">의무준수</span>
                        </td>
                        <td className="relation-cell">
                            <span className="relation-tag">위임</span>
                        </td>
                    </tr>
                    <tr>
                        <th style={{ background: categories.assets.bgColor }}>🏠 자산</th>
                        <td></td>
                        <td>
                            <div className="matrix-entities">
                                {categories.assets.entities.map((e, i) => (
                                    <span key={i} className="matrix-tag" style={{ borderColor: categories.assets.color }}>{e.value.substring(0, 15)}...</span>
                                ))}
                            </div>
                        </td>
                        <td className="relation-cell">
                            <span className="relation-tag">사용기간</span>
                        </td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr>
                        <th style={{ background: categories.period.bgColor }}>📅 기간</th>
                        <td></td>
                        <td></td>
                        <td>
                            <div className="matrix-entities">
                                {categories.period.entities.map((e, i) => (
                                    <span key={i} className="matrix-tag" style={{ borderColor: categories.period.color }}>{e.value}</span>
                                ))}
                            </div>
                        </td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr>
                        <th style={{ background: categories.legal.bgColor }}>⚖️ 법적조건</th>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>
                            <div className="matrix-entities">
                                {categories.legal.entities.map((e, i) => (
                                    <span key={i} className="matrix-tag warning" style={{ borderColor: categories.legal.color }}>{e.value}</span>
                                ))}
                            </div>
                        </td>
                        <td></td>
                    </tr>
                    <tr>
                        <th style={{ background: categories.organization.bgColor }}>🏢 기관</th>
                        <td className="relation-cell">
                            <span className="relation-tag">중개</span>
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>
                            <div className="matrix-entities">
                                {categories.organization.entities.map((e, i) => (
                                    <span key={i} className="matrix-tag" style={{ borderColor: categories.organization.color }}>{e.value}</span>
                                ))}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );

    // 시안 4: 타임라인 + 카테고리 하이브리드
    const TimelineHybridView = () => (
        <div className="view-container timeline-hybrid-view">
            <div className="th-main-row">
                {/* 당사자 */}
                <div className="th-section" style={{ borderColor: categories.people.color }}>
                    <div className="th-header" style={{ backgroundColor: categories.people.color }}>
                        {categories.people.icon} 계약 당사자
                    </div>
                    <div className="th-content">
                        <div className="th-party landlord">
                            <div className="party-label">임대인 (갑)</div>
                            <div className="party-name">김철수</div>
                        </div>
                        <div className="th-arrow">⟷</div>
                        <div className="th-party tenant">
                            <div className="party-label">임차인 (을)</div>
                            <div className="party-name">이영희</div>
                        </div>
                    </div>
                </div>

                {/* 계약 대상 */}
                <div className="th-section" style={{ borderColor: categories.assets.color }}>
                    <div className="th-header" style={{ backgroundColor: categories.assets.color }}>
                        {categories.assets.icon} 계약 대상
                    </div>
                    <div className="th-content">
                        <div className="th-property">
                            <div className="prop-address">서울 강남구 테헤란로 123</div>
                            <div className="prop-detail">삼성아파트 101동 1502호 | 84.9㎡</div>
                        </div>
                    </div>
                </div>

                {/* 계약 기간 */}
                <div className="th-section" style={{ borderColor: categories.period.color }}>
                    <div className="th-header" style={{ backgroundColor: categories.period.color }}>
                        {categories.period.icon} 계약 기간
                    </div>
                    <div className="th-content">
                        <div className="th-period">
                            <span className="period-date">2025.01.15</span>
                            <span className="period-arrow">→</span>
                            <span className="period-duration">24개월</span>
                            <span className="period-arrow">→</span>
                            <span className="period-date">2027.01.14</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 금액 정보 */}
            <div className="th-money-row">
                <div className="money-flow">
                    <div className="money-box total">
                        <div className="money-label">보증금</div>
                        <div className="money-amount">3억 5천만원</div>
                    </div>
                    <div className="money-split">
                        <div className="money-box part">
                            <div className="money-label">계약금</div>
                            <div className="money-amount">3,500만원</div>
                            <div className="money-date">계약시</div>
                        </div>
                        <span className="plus">+</span>
                        <div className="money-box part">
                            <div className="money-label">잔금</div>
                            <div className="money-amount">3억 1,500만원</div>
                            <div className="money-date">2025.01.15</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 하단 정보 */}
            <div className="th-bottom-row">
                <div className="th-section small" style={{ borderColor: categories.legal.color }}>
                    <div className="th-header" style={{ backgroundColor: categories.legal.color }}>
                        {categories.legal.icon} 특약사항
                    </div>
                    <div className="th-content">
                        <ul className="legal-list">
                            <li>용도변경 금지</li>
                            <li>전대/양도 금지</li>
                            <li>2기 연체시 해지 가능</li>
                        </ul>
                    </div>
                </div>
                <div className="th-section small" style={{ borderColor: categories.organization.color }}>
                    <div className="th-header" style={{ backgroundColor: categories.organization.color }}>
                        {categories.organization.icon} 중개
                    </div>
                    <div className="th-content">
                        <div className="org-info">
                            <div className="org-name">행복공인중개사사무소</div>
                            <div className="org-detail">박중개 | 제12345호</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // 관계 그래프 뷰 (React Flow 컴포넌트 사용)
    const GraphView = () => (
        <div className="view-container graph-view">
            <ContractTextGraph />
        </div>
    );

    const views = [
        { id: 'graph', label: '관계 그래프', component: GraphView },
        { id: 'hub', label: '허브 레이아웃', component: HubView },
    ];

    const CurrentViewComponent = views.find(v => v.id === currentView)?.component || HubView;

    return (
        <div className="contract-entity-views card">
            <div className="card-header">
                <div className="card-icon entity-bg">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="4" />
                        <line x1="12" y1="2" x2="12" y2="4" />
                        <line x1="12" y1="20" x2="12" y2="22" />
                        <line x1="2" y1="12" x2="4" y2="12" />
                        <line x1="20" y1="12" x2="22" y2="12" />
                    </svg>
                </div>
                <h3 className="card-title">계약서 개체 관계 (시안 선택)</h3>
            </div>

            <div className="view-selector">
                {views.map(view => (
                    <button
                        key={view.id}
                        className={`view-btn ${currentView === view.id ? 'active' : ''}`}
                        onClick={() => setCurrentView(view.id)}
                    >
                        {view.label}
                    </button>
                ))}
            </div>

            <CurrentViewComponent />

            <div className="view-footer">
                <p>* 위 시안 중 선호하는 스타일을 선택해 주세요.</p>
            </div>
        </div>
    );
};

export default ContractEntityViews;
