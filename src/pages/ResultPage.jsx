import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RiskIndicator from '../components/RiskIndicator'
import ContractVisual from '../components/ContractVisual'
import ContractDetailView from '../components/ContractDetailView'
import { generatePdfReport } from '../services/pdfService'
import './ResultPage.css'

function ResultPage() {
    const navigate = useNavigate()
    const [result, setResult] = useState(null)
    const [activeTab, setActiveTab] = useState('summary')
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
    const [showShareModal, setShowShareModal] = useState(false)
    const [copySuccess, setCopySuccess] = useState(false)

    useEffect(() => {
        const analysisResult = sessionStorage.getItem('analysisResult')
        if (!analysisResult) {
            navigate('/upload')
            return
        }
        setResult(JSON.parse(analysisResult))
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
        navigate('/upload')
    }

    const handleShare = () => {
        setShowShareModal(true)
    }

    const handleCopyLink = () => {
        const shareText = generateShareText()
        navigator.clipboard.writeText(shareText).then(() => {
            setCopySuccess(true)
            setTimeout(() => setCopySuccess(false), 2000)
        })
    }

    const handleKakaoShare = () => {
        const shareText = generateShareText()
        // 카카오톡 공유 URL (모바일에서 카카오톡 앱으로 전환)
        const kakaoUrl = `https://sharer.kakao.com/talk/friends/picker/link?app_key=javascript_key&url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(shareText)}`

        // 대안: SMS나 기본 공유 API 사용
        if (navigator.share) {
            navigator.share({
                title: 'Constract - 전세사기 위험도 분석 결과',
                text: shareText,
                url: window.location.origin
            }).catch(() => {
                // 공유 취소 시 무시
            })
        } else {
            // 데스크탑이나 공유 API 미지원 시
            window.open(kakaoUrl, '_blank')
        }
        setShowShareModal(false)
    }

    const generateShareText = () => {
        if (!result) return ''

        const riskLabel = getRiskLevelInfo(result.overallRiskLevel).label
        const issueCount = result.issues?.length || 0

        return `[Constract 분석 결과]
전세사기 위험도: ${result.overallScore}점 (${riskLabel})
발견된 위험 요소: ${issueCount}개

전세 계약 전, Constract로 위험을 미리 확인하세요!
${window.location.origin}`
    }

    if (!result) {
        return null
    }

    const getRiskLevelInfo = (level) => {
        switch (level) {
            case 'critical':
                return { label: '매우 위험', className: 'critical' }
            case 'high':
                return { label: '위험', className: 'danger' }
            case 'medium':
                return { label: '주의', className: 'warning' }
            default:
                return { label: '안전', className: 'success' }
        }
    }

    const overallRisk = getRiskLevelInfo(result.overallRiskLevel)

    return (
        <div className="result-page">
            <div className="result-header">
                <h1 className="result-title">분석 완료</h1>
                {result.sampleName && (
                    <span className="sample-tag">{result.sampleName}</span>
                )}
            </div>

            {/* Overall Score */}
            <div className="score-section">
                <RiskIndicator score={result.overallScore} riskLevel={result.overallRiskLevel} />
                <div className="score-info">
                    <span className={`risk-badge badge badge-${overallRisk.className}`}>
                        {overallRisk.label}
                    </span>
                    <p className="score-description">
                        {result.overallScore >= 80 && '전반적으로 안전한 계약으로 판단됩니다.'}
                        {result.overallScore >= 60 && result.overallScore < 80 && '일부 주의가 필요한 항목이 있습니다.'}
                        {result.overallScore >= 40 && result.overallScore < 60 && '위험 요소가 발견되었습니다. 신중한 검토가 필요합니다.'}
                        {result.overallScore < 40 && '심각한 위험 요소가 발견되었습니다. 계약을 재검토하세요.'}
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="result-tabs">
                <button
                    className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
                    onClick={() => setActiveTab('summary')}
                >
                    분석 요약
                </button>
                <button
                    className={`tab-btn ${activeTab === 'detail' ? 'active' : ''}`}
                    onClick={() => setActiveTab('detail')}
                >
                    상세 분석
                </button>
                <button
                    className={`tab-btn ${activeTab === 'visual' ? 'active' : ''}`}
                    onClick={() => setActiveTab('visual')}
                >
                    계약 시각화
                </button>
            </div>

            {/* Detail Tab */}
            {activeTab === 'detail' && (
                <ContractDetailView data={result.contractData} />
            )}

            {/* Visual Tab */}
            {activeTab === 'visual' && (
                <ContractVisual data={result.contractData || {
                    landlord: result.extractedData?.landlord || '임대인',
                    tenant: result.extractedData?.tenant || '임차인',
                    deposit: result.extractedData?.deposit || 200000000,
                    marketPrice: result.extractedData?.marketPrice || 300000000,
                    mortgageAmount: result.extractedData?.mortgageAmount || 0,
                    contractDate: result.extractedData?.contractDate || '2026-01-15',
                    endDate: result.extractedData?.endDate || '2028-01-14',
                    address: result.extractedData?.address || '주소 정보 없음',
                    hasInsurance: result.extractedData?.hasInsurance || false,
                    isProxy: result.extractedData?.isProxy || false
                }} />
            )}

            {/* Summary Tab - Issues */}
            {activeTab === 'summary' && result.issues && result.issues.length > 0 && (
                <div className="issues-section">
                    <h2 className="section-title">발견된 위험 요소</h2>
                    <div className="issues-list">
                        {result.issues.map((issue, index) => {
                            const riskInfo = getRiskLevelInfo(issue.severity)
                            return (
                                <div key={index} className={`issue-card issue-${riskInfo.className}`}>
                                    <div className="issue-header">
                                        <span className={`badge badge-${riskInfo.className}`}>
                                            {riskInfo.label}
                                        </span>
                                        <h3>{issue.type}</h3>
                                    </div>
                                    <p className="issue-message">{issue.message}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Fraud Type Checks */}
            {activeTab === 'summary' && (
                <div className="checks-section">
                    <h2 className="section-title">8가지 사기 유형 체크</h2>
                    <div className="checks-grid">
                        {result.fraudChecks?.map((check, index) => (
                            <div key={index} className={`check-card ${check.passed ? 'passed' : 'failed'}`}>
                                <div className="check-status">
                                    {check.passed ? (
                                        <span className="check-icon passed">V</span>
                                    ) : (
                                        <span className="check-icon failed">X</span>
                                    )}
                                </div>
                                <div className="check-content">
                                    <h4>{check.title}</h4>
                                    <p>{check.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {activeTab === 'summary' && result.recommendations && result.recommendations.length > 0 && (
                <div className="recommendations-section">
                    <h2 className="section-title">권장사항</h2>
                    <ul className="recommendations-list">
                        {result.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* 다음 단계 액션 카드 */}
            <div className="next-steps-section">
                <h2 className="section-title">다음 단계</h2>
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
                            <p>계약 전 필수 확인사항</p>
                        </div>
                    </div>
                    <div className="action-card" onClick={() => navigate('/calculator')}>
                        <div className="action-icon calculator">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="4" y="2" width="16" height="20" rx="2" />
                                <line x1="8" y1="6" x2="16" y2="6" />
                                <line x1="8" y1="10" x2="8" y2="10.01" />
                                <line x1="12" y1="10" x2="12" y2="10.01" />
                                <line x1="16" y1="10" x2="16" y2="10.01" />
                            </svg>
                        </div>
                        <div className="action-text">
                            <h4>전세가율 계산</h4>
                            <p>적정 전세가 확인</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="result-actions">
                <div className="action-row">
                    <button
                        className="btn btn-primary"
                        onClick={handleDownloadPdf}
                        disabled={isGeneratingPdf}
                    >
                        {isGeneratingPdf ? '생성 중...' : 'PDF 리포트'}
                    </button>
                    <button className="btn btn-secondary" onClick={handleShare}>
                        공유하기
                    </button>
                </div>
                <button className="btn btn-secondary btn-lg" onClick={handleNewAnalysis}>
                    새 문서 분석
                </button>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
                    <div className="share-modal" onClick={e => e.stopPropagation()}>
                        <h3>분석 결과 공유</h3>
                        <div className="share-buttons">
                            <button className="share-btn copy" onClick={handleCopyLink}>
                                <span className="share-icon">C</span>
                                <span>{copySuccess ? '복사됨!' : '텍스트 복사'}</span>
                            </button>
                            <button className="share-btn kakao" onClick={handleKakaoShare}>
                                <span className="share-icon">K</span>
                                <span>공유하기</span>
                            </button>
                        </div>
                        <button className="btn btn-secondary" onClick={() => setShowShareModal(false)}>
                            닫기
                        </button>
                    </div>
                </div>
            )}

            {/* Privacy Reminder */}
            <div className="privacy-reminder">
                <p>
                    브라우저를 닫거나 새로고침하면 모든 데이터가 삭제됩니다.
                    필요한 경우 PDF를 먼저 다운로드해주세요.
                </p>
            </div>
        </div>
    )
}

export default ResultPage
