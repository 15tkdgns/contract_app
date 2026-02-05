import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ContractVisual from '../components/ContractVisual'
import ContractRelationHub from '../components/ContractRelationHub'
import RiskSummaryPanel from '../components/RiskSummaryPanel'
import SmartChecklist from '../components/SmartChecklist'
import RiskRadarChart from '../components/dev/RiskRadarChart'
import ContractViewer from '../components/ContractViewer'
import { generatePdfReport } from '../services/pdfService'
import { saveHistory } from '../services/historyService'
import { useChat } from '../context/ChatContext'
import DevTools from '../components/dev/DevTools'
import PriceAnalysisPanel from '../components/PriceAnalysisPanel'
import './ResultPage.css'

// --- SVG Icons ---
const BackIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
)
const ShareIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
)
const DownloadIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
)
const CheckCircleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
)
const ChevronRightIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
)

function ResultPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const { updateContextData, openChat, addMessage } = useChat()

    // State
    const [result, setResult] = useState(null)
    const [activeTab, setActiveTab] = useState(location.state?.initialTab || 'summary') // 'summary' | 'detail' | 'guide' | 'dev'
    const [showShareModal, setShowShareModal] = useState(false)
    const [copySuccess, setCopySuccess] = useState(false)
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
    const hasNotifiedChat = useRef(false)

    // Data Load Effect
    useEffect(() => {
        if (location.state?.result) {
            setResult(location.state.result)
            if (!location.state.result.isSample) saveHistory(location.state.result)
            return
        }
        const stored = sessionStorage.getItem('analysisResult')
        if (stored) {
            const parsed = JSON.parse(stored)
            setResult(parsed)
            if (!parsed.isSample) saveHistory(parsed)
        } else {
            navigate('/')
        }
    }, [location.state, navigate])

    // Chatbot & LocalStorage Sync Effect
    useEffect(() => {
        if (result) {
            // 새 창에서 접근 가능하도록 localStorage에도 저장
            localStorage.setItem('analysisResult', JSON.stringify(result))

            if (!hasNotifiedChat.current) {
                updateContextData(result)
                hasNotifiedChat.current = true
            }
        }
    }, [result, updateContextData, openChat])

    if (!result) return null

    // Helpers
    const getRiskInfo = (level) => {
        switch (level) {
            case 'critical': return { label: '매우 위험', className: 'critical', color: '#dc3545' }
            case 'high': return { label: '위험', className: 'danger', color: '#ff9800' }
            case 'medium': return { label: '주의', className: 'warning', color: '#ffc107' }
            default: return { label: '안전', className: 'success', color: '#28a745' }
        }
    }
    const riskInfo = getRiskInfo(result.overallRiskLevel)
    const contractData = result.contractData || result.extractedData || {}

    // Actions
    const handleDownloadPdf = async () => {
        setIsGeneratingPdf(true)
        try { await generatePdfReport(result) } finally { setIsGeneratingPdf(false) }
    }
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Constract 분석 결과',
                text: `위험도: ${result.overallScore}점 (${riskInfo.label})`,
                url: window.location.origin
            }).catch(() => { })
        } else {
            setShowShareModal(true)
        }
    }
    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
    }

    const handleOpenFullScreen = (path) => {
        window.open(path, '_blank', 'noopener,noreferrer')
    }

    // --- Render Tabs ---

    // 1. [핵심] Summary Tab
    const renderSummaryTab = () => (
        <div className="tab-pane fade-in">
            {/* Full Screen Actions */}
            <div className="full-screen-actions" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                    onClick={() => handleOpenFullScreen('/view/contract')}
                    className="action-btn"
                    style={{ flex: 1, padding: '12px', background: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    📑 계약서 원문 (전체화면)
                </button>
                <button
                    onClick={() => handleOpenFullScreen('/view/relation')}
                    className="action-btn"
                    style={{ flex: 1, padding: '12px', background: 'white', color: '#333', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    🕸️ 계약 관계도 (전체화면)
                </button>
            </div>

            {/* Score Hero */}
            <div className="score-hero-compact">
                <div className="score-circle" style={{ borderColor: riskInfo.color, color: riskInfo.color }}>
                    <span className="score-num">{result.overallScore}</span>
                    <span className="score-text">{riskInfo.label}</span>
                </div>
                <div className="score-meta">
                    <h2 className="address-text">{contractData.address || '주소 정보 없음'}</h2>
                    <p className="price-text">보증금 {contractData.deposit ? `${(contractData.deposit / 100000000).toFixed(1)}억` : '-'}</p>
                </div>
            </div>

            {/* Risk Panel */}
            <RiskSummaryPanel panelData={result.summary_panel} />

            {/* Price Analysis (Summary View) */}
            <PriceAnalysisPanel
                address={contractData.address}
                deposit={contractData.deposit}
                area={contractData.area}
            />

            {/* Top 3 Checklist (Static for now, dynamic later) */}
            <div className="top3-actions-card">
                <h3>필수 확인 3가지</h3>
                <div className="action-item">
                    <div className="action-status danger">확인필요</div>
                    <div className="action-content">
                        <h4>등기부등본 재발급</h4>
                        <p>계약 직전 권리변동 확인 필수</p>
                    </div>
                    <button className="action-btn">방법</button>
                </div>
                <div className="action-item">
                    <div className="action-status warning">주의</div>
                    <div className="action-content">
                        <h4>선순위 채권 확인</h4>
                        <p>은행 대출금 상환 여부 체크</p>
                    </div>
                    <button className="action-btn">방법</button>
                </div>
                <div className="action-item">
                    <div className="action-status neutral">대기</div>
                    <div className="action-content">
                        <h4>확정일자 부여</h4>
                        <p>계약 즉시 주민센터 방문</p>
                    </div>
                    <button className="action-btn">방법</button>
                </div>
            </div>

            <button className="btn-full-primary" onClick={() => setActiveTab('detail')}>
                상세 분석 결과 전체 보기
            </button>
        </div>
    )

    // 2. [상세] Detail Tab
    const renderDetailTab = () => (
        <div className="tab-pane fade-in">
            {/* Relation Graph */}
            <section className="detail-section">
                <h3>계약 관계도</h3>
                <div className="graph-container">
                    <ContractRelationHub
                        contractData={contractData}
                        entities={result.entities}
                        relations={result.relations}
                    />
                </div>
            </section>

            {/* Fraud Warning */}
            {result.matchedPatterns && result.matchedPatterns.length > 0 && (
                <section className="detail-section">
                    <div className="fraud-alert-box">
                        <div className="fraud-title">사기 위험 패턴 감지</div>
                        {result.matchedPatterns.map((p, i) => (
                            <div key={i} className="fraud-item">
                                <span className="fraud-name">{p.name}</span>
                                <span className="fraud-desc">{p.reason}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Full Checklist moved to separate Tab */}

            {/* Contract Visual */}
            <section className="detail-section">
                <h3>계약 시각화</h3>
                <ContractVisual data={{
                    landlord: contractData.landlord || '임대인',
                    tenant: contractData.tenant || '임차인',
                    deposit: contractData.deposit || 200000000,
                    marketPrice: contractData.marketPrice || 300000000,
                    mortgageAmount: contractData.mortgageAmount || 0,
                    contractDate: contractData.startDate || '2026-01-15',
                    endDate: contractData.endDate || '2028-01-14',
                    address: contractData.address || '주소 정보',
                    hasInsurance: contractData.hasInsurance || false,
                    isProxy: contractData.isProxy || false
                }} />
            </section>

            {/* Verification */}
            {result.documentVerification && (
                <section className="detail-section">
                    <h3>문서 교차 검증</h3>
                    <div className="verification-list">
                        {Object.entries(result.documentVerification).map(([key, val]) => (
                            <div key={key} className={`verify-row ${val.status}`}>
                                <div className="verify-label">
                                    {key === 'ownerMatch' ? '소유자' : key === 'addressMatch' ? '주소' : '기타'}
                                </div>
                                <div className="verify-result">
                                    {val.status === 'match' ? '일치' : '불일치'}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )

    // 3. [가이드] Guide Tab
    const renderGuideTab = () => (
        <div className="tab-pane fade-in">
            <div className="guide-timeline">
                <h3>진행 단계별 가이드</h3>
                <div className="timeline-item active">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                        <h4>계약 체결일 (오늘)</h4>
                        <ul>
                            <li><CheckCircleIcon /> 등기부등본 당일 발급 확인</li>
                            <li><CheckCircleIcon /> 신분증 진위 여부 확인</li>
                            <li><CheckCircleIcon /> 특약사항 꼼꼼히 기재</li>
                        </ul>
                    </div>
                </div>
                <div className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                        <h4>잔금일 전</h4>
                        <ul>
                            <li>중도금 입금 전 권리변동 확인</li>
                            <li>대출 실행 가능 여부 최종 점검</li>
                        </ul>
                    </div>
                </div>
                <div className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                        <h4>이사 당일</h4>
                        <ul>
                            <li>전입신고 즉시 신청</li>
                            <li>확정일자 부여 확인</li>
                            <li>잔금 입금</li>
                        </ul>
                    </div>
                </div>
            </div>

            {result.glossary && (
                <div className="glossary-box">
                    <h3>법률 용어 해설</h3>
                    {result.glossary.map((item, i) => (
                        <div key={i} className="glossary-row">
                            <span className="term">{item.term}</span>
                            <span className="def">{item.definition}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )

    return (
        <div className="result-page-new">
            {/* Header */}
            <header className="result-header">
                <button className="back-btn" onClick={() => navigate('/')}>
                    <BackIcon />
                </button>
                <h1 className="header-title">
                    분석 결과
                    {result.isSample && <span className="test-mode-badge" style={{ fontSize: '0.6em', marginLeft: '8px', background: '#ecc94b', color: '#744210', padding: '2px 8px', borderRadius: '12px', verticalAlign: 'middle' }}>TEST (가상 데이터)</span>}
                </h1>
                <div className="header-actions">
                    <button onClick={handleDownloadPdf}><DownloadIcon /></button>
                    <button onClick={handleShare}><ShareIcon /></button>
                </div>
            </header>

            {/* Tabs Navigation */}
            <div className="tabs-bar">
                {['summary', 'contract', 'detail', 'checklist', 'guide', 'dev'].map(tab => (
                    <button
                        key={tab}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'summary' && '핵심'}
                        {tab === 'contract' && '계약서'}
                        {tab === 'detail' && '상세'}
                        {tab === 'checklist' && '체크리스트'}
                        {tab === 'guide' && '가이드'}
                        {tab === 'dev' && '실험실'}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className={`result-content-area ${activeTab === 'contract' ? 'no-padding' : ''}`}>
                {activeTab === 'summary' && renderSummaryTab()}
                {activeTab === 'detail' && renderDetailTab()}
                {activeTab === 'contract' && (
                    <div className="tab-pane fade-in no-padding">
                        <ContractViewer
                            text={result.ocrText}
                            analysis={result.clauseAnalysis || []}
                        />
                    </div>
                )}
                {activeTab === 'checklist' && (
                    <div className="tab-pane fade-in">
                        <section className="detail-section">
                            <h3>상세 체크리스트</h3>
                            <p className="section-desc">계약 단계별로 꼼꼼히 챙겨야 할 항목들을 확인하세요.</p>
                            <SmartChecklist result={result} embedded={true} />
                        </section>
                    </div>
                )}
                {activeTab === 'guide' && renderGuideTab()}
                {activeTab === 'dev' && <DevTools result={result} />}
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <h3>공유하기</h3>
                        <div className="modal-actions">
                            <button className="btn-primary" onClick={handleCopyLink}>
                                {copySuccess ? '복사완료' : '링크 복사'}
                            </button>
                            <button className="btn-text" onClick={() => setShowShareModal(false)}>닫기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ResultPage
