import { useState } from 'react'
import ContractRelationHub from './ContractRelationHub'
import './ContractDetailView.css'

// 조항별 분석 데이터
const CLAUSE_ANALYSIS = [
    { id: 1, name: '목적물의 표시', score: 10, status: 'good', desc: '주소, 면적 정보 명확' },
    { id: 2, name: '보증금 및 월세', score: 40, status: 'warning', desc: '전세가율 67% 주의' },
    { id: 3, name: '계약기간', score: 15, status: 'good', desc: '24개월 표준 기간' },
    { id: 4, name: '중도해지 위약금', score: 75, status: 'danger', desc: '불리한 조항 포함' },
    { id: 5, name: '수선의무', score: 90, status: 'critical', desc: '매우 불리한 조항' },
    { id: 6, name: '원상복구', score: 80, status: 'danger', desc: '불리한 조항' },
    { id: 7, name: '용도제한', score: 20, status: 'good', desc: '주거용 명시' },
    { id: 8, name: '임대인 출입권', score: 55, status: 'warning', desc: '주의 필요' },
    { id: 9, name: '계약갱신 거절', score: 70, status: 'danger', desc: '법적 검토 필요' },
    { id: 10, name: '손해배상', score: 50, status: 'warning', desc: '표준 수준' },
    { id: 11, name: '보증금 반환', score: 65, status: 'warning', desc: '불리한 조항' },
]

function ContractDetailView({ data }) {
    const [activeTab, setActiveTab] = useState('info')

    const contractInfo = data || {
        landlord: '김철수',
        tenant: '이영희',
        broker: '박중개',
        address: '서울 강남구 테헤란로 123',
        building: '삼성아파트 101동 1502호',
        area: '84.9m² (25.7평)',
        deposit: 350000000,
        downPayment: 35000000,
        balance: 315000000,
        startDate: '2025-01-15',
        endDate: '2027-01-14',
        duration: 24,
        restrictions: ['용도변경 금지', '전대 금지', '임차권 양도 금지'],
        conditions: ['2기 차임 연체', '계약 해지 가능'],
        agency: '행복공인중개사사무소',
        registrationNo: '제12345호'
    }

    const formatMoney = (val) => {
        if (val >= 100000000) return `${(val / 100000000).toFixed(1)}억원`
        if (val >= 10000) return `${(val / 10000).toLocaleString()}만원`
        return val.toLocaleString() + '원'
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'good': return 'var(--color-success)'
            case 'warning': return 'var(--color-warning)'
            case 'danger': return 'var(--color-danger)'
            case 'critical': return 'var(--color-critical)'
            default: return 'var(--text-muted)'
        }
    }

    const overallScore = Math.round(CLAUSE_ANALYSIS.reduce((sum, c) => sum + c.score, 0) / CLAUSE_ANALYSIS.length)
    const criticalCount = CLAUSE_ANALYSIS.filter(c => c.status === 'critical').length
    const dangerCount = CLAUSE_ANALYSIS.filter(c => c.status === 'danger').length
    const warningCount = CLAUSE_ANALYSIS.filter(c => c.status === 'warning').length
    const goodCount = CLAUSE_ANALYSIS.filter(c => c.status === 'good').length

    return (
        <div className="contract-detail-view">
            {/* 탭 네비게이션 */}
            <div className="detail-tabs">
                <button
                    className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                    onClick={() => setActiveTab('info')}
                >
                    계약 정보
                </button>
                <button
                    className={`tab-btn ${activeTab === 'clause' ? 'active' : ''}`}
                    onClick={() => setActiveTab('clause')}
                >
                    조항 분석
                </button>
                <button
                    className={`tab-btn ${activeTab === 'relation' ? 'active' : ''}`}
                    onClick={() => setActiveTab('relation')}
                >
                    관계도
                </button>
            </div>

            {/* 계약 정보 탭 */}
            {activeTab === 'info' && (
                <div className="info-content">
                    {/* 사람 섹션 */}
                    <div className="info-section people">
                        <h3>사람</h3>
                        <div className="info-cards">
                            <div className="info-card">
                                <span className="card-label">임대인(갑)</span>
                                <span className="card-value">{contractInfo.landlord}</span>
                            </div>
                            <div className="info-card">
                                <span className="card-label">임차인(을)</span>
                                <span className="card-value">{contractInfo.tenant}</span>
                            </div>
                            <div className="info-card">
                                <span className="card-label">중개사 대표</span>
                                <span className="card-value">{contractInfo.broker}</span>
                            </div>
                        </div>
                    </div>

                    {/* 자산 섹션 */}
                    <div className="info-section assets">
                        <h3>자산</h3>
                        <div className="asset-detail">
                            <div className="asset-row">
                                <span className="label">소재지</span>
                                <span className="value highlight">{contractInfo.address}</span>
                            </div>
                            <div className="asset-row">
                                <span className="label">건물명</span>
                                <span className="value">{contractInfo.building}</span>
                            </div>
                            <div className="asset-row">
                                <span className="label">전용면적</span>
                                <span className="value">{contractInfo.area}</span>
                            </div>
                        </div>
                        <div className="money-cards">
                            <div className="money-card deposit">
                                <span className="label">보증금</span>
                                <span className="value">{formatMoney(contractInfo.deposit)}</span>
                            </div>
                            <div className="money-card down">
                                <span className="label">계약금</span>
                                <span className="value">{formatMoney(contractInfo.downPayment)}</span>
                            </div>
                            <div className="money-card balance">
                                <span className="label">잔금</span>
                                <span className="value">{formatMoney(contractInfo.balance)}</span>
                            </div>
                        </div>
                    </div>

                    {/* 기간 섹션 */}
                    <div className="info-section period">
                        <h3>기간</h3>
                        <div className="period-cards">
                            <div className="period-card">
                                <span className="label">계약시작일</span>
                                <span className="value">{contractInfo.startDate}</span>
                            </div>
                            <div className="period-card">
                                <span className="label">계약종료일</span>
                                <span className="value">{contractInfo.endDate}</span>
                            </div>
                            <div className="period-card">
                                <span className="label">계약기간</span>
                                <span className="value">{contractInfo.duration}개월</span>
                            </div>
                        </div>
                    </div>

                    {/* 법적 조건 / 기관 */}
                    <div className="info-section-row">
                        <div className="info-section legal">
                            <h3>법적 조건</h3>
                            <div className="tag-row">
                                {contractInfo.restrictions.map((r, i) => (
                                    <span key={i} className="tag restriction">{r}</span>
                                ))}
                            </div>
                            <div className="tag-row">
                                {contractInfo.conditions.map((c, i) => (
                                    <span key={i} className="tag condition">{c}</span>
                                ))}
                            </div>
                        </div>
                        <div className="info-section org">
                            <h3>기관</h3>
                            <div className="org-info">
                                <span className="label">중개사무소</span>
                                <span className="value">{contractInfo.agency}</span>
                            </div>
                            <div className="org-info">
                                <span className="label">등록번호</span>
                                <span className="value">{contractInfo.registrationNo}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 조항 분석 탭 */}
            {activeTab === 'clause' && (
                <div className="clause-content">
                    {/* 종합 점수 */}
                    <div className="overall-score">
                        <div className="score-bar">
                            <div className="score-fill" style={{ width: `${overallScore}%`, background: overallScore > 50 ? 'var(--color-warning)' : 'var(--color-success)' }}></div>
                            <span className="score-value">{overallScore}점</span>
                        </div>
                        <div className="score-stats">
                            <span className="stat critical">{criticalCount}<br />매우 불리</span>
                            <span className="stat danger">{dangerCount}<br />불리</span>
                            <span className="stat warning">{warningCount}<br />주의</span>
                            <span className="stat good">{goodCount}<br />양호</span>
                        </div>
                    </div>

                    {/* 조항별 위험도 */}
                    <h4>조항별 위험도</h4>
                    <div className="clause-list">
                        {[...CLAUSE_ANALYSIS].sort((a, b) => b.score - a.score).map(clause => (
                            <div key={clause.id} className="clause-item">
                                <div className="clause-header">
                                    <span className="clause-id">제{clause.id}조</span>
                                    <span className="clause-name">{clause.name}</span>
                                    {clause.status !== 'good' && (
                                        <span className={`clause-tag ${clause.status}`}>
                                            {clause.status === 'critical' ? '매우 불리한 조항' :
                                                clause.status === 'danger' ? '불리한 조항' : '주의 필요'}
                                        </span>
                                    )}
                                </div>
                                <div className="clause-bar">
                                    <div
                                        className="clause-fill"
                                        style={{
                                            width: `${clause.score}%`,
                                            background: getStatusColor(clause.status)
                                        }}
                                    ></div>
                                </div>
                                <span className="clause-score">{clause.score}점</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 관계도 탭 - 허브 레이아웃 */}
            {activeTab === 'relation' && (
                <ContractRelationHub contractData={contractInfo} />
            )}
        </div>
    )
}

export default ContractDetailView
