import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RiskIndicator from '../components/RiskIndicator'
import ContractVisual from '../components/ContractVisual'
import ContractRelationHub from '../components/ContractRelationHub'
import { generatePdfReport } from '../services/pdfService'
import { saveHistory } from '../services/historyService'
import './ResultPage.css'

function ResultPage() {
    const navigate = useNavigate()
    const [result, setResult] = useState(null)
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
    const [showShareModal, setShowShareModal] = useState(false)
    const [copySuccess, setCopySuccess] = useState(false)
    const [expandedSections, setExpandedSections] = useState({
        graph: true,
        issues: false,
        visual: false,
        info: false
    })

    useEffect(() => {
        const analysisResult = sessionStorage.getItem('analysisResult')
        if (!analysisResult) {
            navigate('/')
            return
        }
        const parsedResult = JSON.parse(analysisResult)
        setResult(parsedResult)

        // 이력 저장 (샘플 분석이 아닌 경우에만 저장)
        if (!parsedResult.isSample) {
            saveHistory(parsedResult)
        }
    }, [navigate])

    const handleDownloadPdf = async () => {
        setIsGeneratingPdf(true)
        try {
            await generatePdfReport(result)
        } finally {
            setIsGeneratingPdf(false)
        }
    }

    const handleNewAnalysis = () => {
        sessionStorage.removeItem('analysisResult')
        navigate('/')
    }

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Constract - 전세사기 위험도 분석',
                text: generateShareText(),
                url: window.location.origin
            }).catch(() => { })
        } else {
            setShowShareModal(true)
        }
    }

    const handleCopyLink = () => {
        navigator.clipboard.writeText(generateShareText()).then(() => {
            setCopySuccess(true)
            setTimeout(() => setCopySuccess(false), 2000)
        })
    }

    const generateShareText = () => {
        if (!result) return ''
        const riskLabel = getRiskLevelInfo(result.overallRiskLevel).label
        return `[Constract] 전세사기 위험도: ${result.overallScore}점 (${riskLabel})`
    }

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

    if (!result) return null

    const getRiskLevelInfo = (level) => {
        switch (level) {
            case 'critical': return { label: '매우 위험', className: 'critical' }
            case 'high': return { label: '위험', className: 'danger' }
            case 'medium': return { label: '주의', className: 'warning' }
            default: return { label: '안전', className: 'success' }
        }
    }

    const riskInfo = getRiskLevelInfo(result.overallRiskLevel)
    const contractData = result.contractData || result.extractedData || {}

    return (
        <div className="result-page scroll-layout">
            {/* 헤더: 위험도 점수 */}
            <section className="score-hero">
                <div className={`score-badge ${riskInfo.className}`}>
                    <span className="score-value">{result.overallScore}</span>
                    <span className="score-label">{riskInfo.label}</span>
                </div>
                {result.isSample && <span className="sample-tag">예시 분석</span>}
            </section>

            {/* 섹션 1: 관계도 (React Flow) */}
            <section className="result-section">
                <button className="section-header" onClick={() => toggleSection('graph')}>
                    <h2>계약 관계도</h2>
                    <span className={`expand-icon ${expandedSections.graph ? 'open' : ''}`}>v</span>
                </button>
                {expandedSections.graph && (
                    <div className="section-content graph-section">
                        <ContractRelationHub
                            contractData={contractData}
                            entities={result.entities}
                            relations={result.relations}
                        />
                    </div>
                )}
            </section>

            {/* 섹션 2: 위험 요소 */}
            {result.issues && result.issues.length > 0 && (
                <section className="result-section">
                    <button className="section-header" onClick={() => toggleSection('issues')}>
                        <h2>위험 요소 <span className="count-badge">{result.issues.length}</span></h2>
                        <span className={`expand-icon ${expandedSections.issues ? 'open' : ''}`}>v</span>
                    </button>
                    {expandedSections.issues && (
                        <div className="section-content">
                            <div className="issues-list">
                                {result.issues.map((issue, index) => {
                                    const issueRisk = getRiskLevelInfo(issue.severity)
                                    return (
                                        <div key={index} className={`issue-card issue-${issueRisk.className}`}>
                                            <span className={`badge badge-${issueRisk.className}`}>{issueRisk.label}</span>
                                            <div className="issue-content">
                                                <h4>{issue.type}</h4>
                                                <p>{issue.message}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* 섹션 3: 계약 시각화 */}
            <section className="result-section">
                <button className="section-header" onClick={() => toggleSection('visual')}>
                    <h2>계약 시각화</h2>
                    <span className={`expand-icon ${expandedSections.visual ? 'open' : ''}`}>v</span>
                </button>
                {expandedSections.visual && (
                    <div className="section-content">
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
                    </div>
                )}
            </section>

            {/* 섹션 4: 계약 정보 */}
            <section className="result-section">
                <button className="section-header" onClick={() => toggleSection('info')}>
                    <h2>계약 정보</h2>
                    <span className={`expand-icon ${expandedSections.info ? 'open' : ''}`}>v</span>
                </button>
                {expandedSections.info && (
                    <div className="section-content">
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">임대인</span>
                                <span className="info-value">{contractData.landlord || '-'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">임차인</span>
                                <span className="info-value">{contractData.tenant || '-'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">보증금</span>
                                <span className="info-value">{contractData.deposit ? `${(contractData.deposit / 100000000).toFixed(1)}억원` : '-'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">주소</span>
                                <span className="info-value">{contractData.address || '-'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">계약기간</span>
                                <span className="info-value">{contractData.startDate} ~ {contractData.endDate}</span>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* 섹션 5: 문서 검증 결과 (AI) */}
            {result.documentVerification && (
                <section className="result-section verification-section">
                    <div className="section-header-static">
                        <h2>문서 교차 검증</h2>
                        <span className="ai-badge">AI 자동검증</span>
                    </div>
                    <div className="section-content">
                        <div className="verification-grid">
                            {Object.entries(result.documentVerification).map(([key, value]) => (
                                <div key={key} className={`verification-item ${value.status}`}>
                                    <div className="verification-icon">
                                        {value.status === 'match' ? '✓' : value.status === 'mismatch' ? '✗' : '?'}
                                    </div>
                                    <div className="verification-content">
                                        <span className="verification-label">
                                            {key === 'ownerMatch' ? '소유자 일치' :
                                                key === 'addressMatch' ? '주소 일치' : '면적 일치'}
                                        </span>
                                        {value.status !== 'unknown' && (
                                            <div className="verification-values">
                                                <span>계약서: {value.contractValue || '-'}</span>
                                                <span>등기부: {value.registryValue || '-'}</span>
                                            </div>
                                        )}
                                        {value.message && <p className="verification-message">{value.message}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 섹션 6: 맞춤형 가이드 (AI) */}
            {result.personalizedGuide && (
                <section className="result-section guide-section">
                    <div className="section-header-static">
                        <h2>맞춤형 가이드</h2>
                        <span className="ai-badge">AI 추천</span>
                    </div>
                    <div className="section-content">
                        {result.personalizedGuide.warnings?.length > 0 && (
                            <div className="guide-block warnings">
                                <h4>주의사항</h4>
                                <ul>
                                    {result.personalizedGuide.warnings.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {result.personalizedGuide.checklist?.length > 0 && (
                            <div className="guide-block checklist">
                                <h4>확인 체크리스트</h4>
                                <ul>
                                    {result.personalizedGuide.checklist.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {result.personalizedGuide.nextSteps?.length > 0 && (
                            <div className="guide-block next-steps">
                                <h4>다음 단계</h4>
                                <ul>
                                    {result.personalizedGuide.nextSteps.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* 섹션 7: 용어 사전 (AI) */}
            {result.glossary && result.glossary.length > 0 && (
                <section className="result-section glossary-section">
                    <div className="section-header-static">
                        <h2>용어 해설</h2>
                    </div>
                    <div className="section-content">
                        <div className="glossary-list">
                            {result.glossary.map((item, idx) => (
                                <div key={idx} className="glossary-item">
                                    <span className="glossary-term">{item.term}</span>
                                    <span className="glossary-definition">{item.definition}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 섹션 8: 다음 단계 */}
            <section className="next-steps-section">
                <h2>다음 단계</h2>
                <div className="action-cards">
                    <div className="action-card" onClick={() => navigate('/checklist')}>
                        <div className="action-icon checklist">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 11l3 3L22 4" />
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                            </svg>
                        </div>
                        <div className="action-text">
                            <h4>체크리스트</h4>
                            <p>계약 전 필수 확인</p>
                        </div>
                    </div>
                    <div className="action-card" onClick={() => navigate('/calculator')}>
                        <div className="action-icon calculator">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="4" y="2" width="16" height="20" rx="2" />
                                <line x1="8" y1="6" x2="16" y2="6" />
                            </svg>
                        </div>
                        <div className="action-text">
                            <h4>전세가율 계산</h4>
                            <p>적정 전세가 확인</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 하단 액션 */}
            <section className="result-actions">
                <div className="action-row">
                    <button className="btn btn-primary" onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
                        {isGeneratingPdf ? '생성 중...' : 'PDF 리포트'}
                    </button>
                    <button className="btn btn-kakao" onClick={handleShare}>
                        카카오톡 공유
                    </button>
                </div>
                <button className="btn btn-secondary btn-lg" onClick={handleNewAnalysis}>새 분석</button>
            </section>

            {/* 공유 모달 */}
            {showShareModal && (
                <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
                    <div className="share-modal" onClick={e => e.stopPropagation()}>
                        <h3>분석 결과 공유</h3>
                        <button className="share-btn" onClick={handleCopyLink}>
                            {copySuccess ? '복사됨!' : '텍스트 복사'}
                        </button>
                        <button className="btn btn-secondary" onClick={() => setShowShareModal(false)}>닫기</button>
                    </div>
                </div>
            )}

            <div className="privacy-reminder">
                <p>브라우저 종료 시 모든 데이터가 삭제됩니다.</p>
            </div>
        </div>
    )
}

export default ResultPage
