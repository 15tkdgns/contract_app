import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import FileUploader from '../components/FileUploader'
import './UploadPage.css'

function UploadPage() {
    const navigate = useNavigate()
    const [contractFile, setContractFile] = useState(null)
    const [registryFile, setRegistryFile] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [showSampleBuilder, setShowSampleBuilder] = useState(false)
    const [showPreview, setShowPreview] = useState(false)

    // 커스텀 샘플 설정
    const [sampleConfig, setSampleConfig] = useState({
        jeonseRatio: 70,
        hasMortgage: false,
        mortgageRatio: 30,
        isProxy: false,
        hasInsurance: true,
        ownerMatch: true
    })

    const handleStartAnalysis = async () => {
        if (!contractFile) {
            alert('계약서를 업로드해주세요.')
            return
        }

        setIsLoading(true)

        const contractData = await fileToBase64(contractFile)
        const registryData = registryFile ? await fileToBase64(registryFile) : null

        sessionStorage.setItem('analysisData', JSON.stringify({
            contract: { name: contractFile.name, data: contractData },
            registry: registryFile ? { name: registryFile.name, data: registryData } : null
        }))

        navigate('/analysis')
    }

    const handleShowPreview = () => {
        setShowPreview(true)
    }

    const handleStartSampleAnalysis = () => {
        const { contractText, registryText } = generateSampleTexts()

        sessionStorage.setItem('sampleAnalysis', JSON.stringify({
            contractText,
            registryText,
            sampleName: '커스텀 테스트',
            config: sampleConfig
        }))
        setShowPreview(false)
        navigate('/analysis?sample=true')
    }

    const generateSampleTexts = () => {
        const deposit = 200000000
        const marketPrice = Math.round(deposit / (sampleConfig.jeonseRatio / 100))
        const mortgageAmount = sampleConfig.hasMortgage
            ? Math.round(marketPrice * (sampleConfig.mortgageRatio / 100))
            : 0

        const contractText = `
      전세계약서
      임대인: ${sampleConfig.isProxy ? '김대리 (대리인)' : '홍길동'}
      ${sampleConfig.isProxy ? '위임자: 박소유' : ''}
      임차인: 이임차
      보증금: ${deposit.toLocaleString()}원
      계약일: 2026-01-15
      주소: 서울시 강남구 테헤란로 123
      ${sampleConfig.hasInsurance ? '보증보험: HUG 가입' : ''}
    `

        const registryText = `
      등기부등본
      소유자: ${sampleConfig.ownerMatch ? (sampleConfig.isProxy ? '박소유' : '홍길동') : '최타인'}
      주소: 서울시 강남구 테헤란로 123
      시세: ${marketPrice.toLocaleString()}원
      을구 사항:
        ${mortgageAmount > 0 ? `- 근저당권 설정: ${mortgageAmount.toLocaleString()}원 (국민은행)` : '없음'}
    `

        return { contractText, registryText }
    }

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result)
            reader.onerror = error => reject(error)
        })
    }

    const getRiskPreview = () => {
        let score = 100
        if (sampleConfig.jeonseRatio >= 80) score -= 30
        else if (sampleConfig.jeonseRatio >= 70) score -= 15

        if (sampleConfig.hasMortgage) {
            if (sampleConfig.mortgageRatio >= 50) score -= 20
            else if (sampleConfig.mortgageRatio >= 30) score -= 10
        }

        if (sampleConfig.isProxy) score -= 20
        if (!sampleConfig.hasInsurance) score -= 10
        if (!sampleConfig.ownerMatch) score -= 25

        score = Math.max(0, Math.min(100, score))

        if (score >= 80) return { label: '안전', color: 'var(--color-success)' }
        if (score >= 60) return { label: '주의', color: 'var(--color-warning)' }
        if (score >= 40) return { label: '위험', color: 'var(--color-danger)' }
        return { label: '매우 위험', color: 'var(--color-critical)' }
    }

    const riskPreview = getRiskPreview()
    const canStartAnalysis = contractFile && !isLoading

    return (
        <div className="upload-page">
            <div className="upload-header">
                <h1 className="upload-title">문서 분석</h1>
            </div>

            {/* 예시 계약서 빌더 */}
            <div className="sample-section">
                <button
                    className="sample-toggle touchable"
                    onClick={() => setShowSampleBuilder(!showSampleBuilder)}
                >
                    <span>예시 계약서로 테스트</span>
                    <span className={`toggle-icon ${showSampleBuilder ? 'open' : ''}`}>v</span>
                </button>

                {showSampleBuilder && (
                    <div className="sample-builder">
                        <div className="config-item">
                            <label>
                                <span>전세가율</span>
                                <span className="config-value">{sampleConfig.jeonseRatio}%</span>
                            </label>
                            <input
                                type="range"
                                min="50"
                                max="95"
                                step="5"
                                value={sampleConfig.jeonseRatio}
                                onChange={(e) => setSampleConfig({ ...sampleConfig, jeonseRatio: Number(e.target.value) })}
                            />
                            <div className="range-labels">
                                <span>50%</span>
                                <span>70%</span>
                                <span>95%</span>
                            </div>
                        </div>

                        <div className="config-item">
                            <label className="toggle-label">
                                <span>근저당 설정</span>
                                <button
                                    className={`toggle-btn ${sampleConfig.hasMortgage ? 'on' : ''}`}
                                    onClick={() => setSampleConfig({ ...sampleConfig, hasMortgage: !sampleConfig.hasMortgage })}
                                >
                                    <span className="toggle-knob"></span>
                                </button>
                            </label>
                            {sampleConfig.hasMortgage && (
                                <div className="sub-config">
                                    <span>근저당 비율: {sampleConfig.mortgageRatio}%</span>
                                    <input
                                        type="range"
                                        min="10"
                                        max="70"
                                        step="10"
                                        value={sampleConfig.mortgageRatio}
                                        onChange={(e) => setSampleConfig({ ...sampleConfig, mortgageRatio: Number(e.target.value) })}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="config-item">
                            <label className="toggle-label">
                                <span>대리인 계약</span>
                                <button
                                    className={`toggle-btn ${sampleConfig.isProxy ? 'on' : ''}`}
                                    onClick={() => setSampleConfig({ ...sampleConfig, isProxy: !sampleConfig.isProxy })}
                                >
                                    <span className="toggle-knob"></span>
                                </button>
                            </label>
                        </div>

                        <div className="config-item">
                            <label className="toggle-label">
                                <span>전세보증보험</span>
                                <button
                                    className={`toggle-btn ${sampleConfig.hasInsurance ? 'on' : ''}`}
                                    onClick={() => setSampleConfig({ ...sampleConfig, hasInsurance: !sampleConfig.hasInsurance })}
                                >
                                    <span className="toggle-knob"></span>
                                </button>
                            </label>
                        </div>

                        <div className="config-item">
                            <label className="toggle-label">
                                <span>소유자-임대인 일치</span>
                                <button
                                    className={`toggle-btn ${sampleConfig.ownerMatch ? 'on' : ''}`}
                                    onClick={() => setSampleConfig({ ...sampleConfig, ownerMatch: !sampleConfig.ownerMatch })}
                                >
                                    <span className="toggle-knob"></span>
                                </button>
                            </label>
                        </div>

                        <div className="risk-preview" style={{ borderColor: riskPreview.color }}>
                            <span>예상 결과:</span>
                            <span className="risk-label" style={{ color: riskPreview.color }}>{riskPreview.label}</span>
                        </div>

                        <button className="btn btn-primary btn-lg" onClick={handleShowPreview}>
                            계약서 미리보기
                        </button>
                    </div>
                )}
            </div>

            <div className="divider">
                <span>또는 직접 업로드</span>
            </div>

            <div className="upload-grid">
                <div className="upload-section required">
                    <h2 className="section-label">
                        <span className="label-number">1</span>
                        계약서
                        <span className="required-badge">필수</span>
                    </h2>
                    <FileUploader
                        label="전세 계약서"
                        accept=".pdf,.jpg,.jpeg,.png"
                        file={contractFile}
                        onFileSelect={setContractFile}
                        onFileRemove={() => setContractFile(null)}
                    />
                </div>

                <div className="upload-section optional">
                    <h2 className="section-label">
                        <span className="label-number">2</span>
                        등기부등본
                        <span className="optional-badge">선택</span>
                    </h2>
                    <FileUploader
                        label="등기부등본"
                        accept=".pdf,.jpg,.jpeg,.png"
                        file={registryFile}
                        onFileSelect={setRegistryFile}
                        onFileRemove={() => setRegistryFile(null)}
                    />
                </div>
            </div>

            <div className="upload-actions">
                <button
                    className={`btn btn-primary btn-lg ${!canStartAnalysis ? 'disabled' : ''}`}
                    onClick={handleStartAnalysis}
                    disabled={!canStartAnalysis}
                >
                    {isLoading ? '준비 중...' : '분석 시작'}
                </button>
            </div>

            {/* 수동 입력 링크 */}
            <div className="manual-input-link">
                <p>문서가 없으신가요?</p>
                <Link to="/manual" className="btn btn-secondary">
                    정보 직접 입력하기
                </Link>
            </div>

            {/* 계약서 미리보기 모달 */}
            {showPreview && (
                <div className="preview-modal-overlay" onClick={() => setShowPreview(false)}>
                    <div className="preview-modal" onClick={e => e.stopPropagation()}>
                        <h2>예시 계약서 미리보기</h2>

                        <div className="preview-docs">
                            <div className="preview-doc">
                                <h3>전세계약서</h3>
                                <div className="doc-content">
                                    <div className="doc-row">
                                        <span className="label">임대인</span>
                                        <span className="value">{sampleConfig.isProxy ? '김대리 (대리인)' : '홍길동'}</span>
                                    </div>
                                    {sampleConfig.isProxy && (
                                        <div className="doc-row">
                                            <span className="label">위임자</span>
                                            <span className="value">박소유</span>
                                        </div>
                                    )}
                                    <div className="doc-row">
                                        <span className="label">임차인</span>
                                        <span className="value">이임차</span>
                                    </div>
                                    <div className="doc-row">
                                        <span className="label">보증금</span>
                                        <span className="value">2억원</span>
                                    </div>
                                    <div className="doc-row">
                                        <span className="label">계약일</span>
                                        <span className="value">2026-01-15</span>
                                    </div>
                                    <div className="doc-row">
                                        <span className="label">주소</span>
                                        <span className="value">서울시 강남구 테헤란로 123</span>
                                    </div>
                                    {sampleConfig.hasInsurance && (
                                        <div className="doc-row insurance">
                                            <span className="label">보증보험</span>
                                            <span className="value">HUG 가입</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="preview-doc">
                                <h3>등기부등본</h3>
                                <div className="doc-content">
                                    <div className="doc-row">
                                        <span className="label">소유자</span>
                                        <span className={`value ${!sampleConfig.ownerMatch ? 'danger' : ''}`}>
                                            {sampleConfig.ownerMatch ? (sampleConfig.isProxy ? '박소유' : '홍길동') : '최타인'}
                                        </span>
                                    </div>
                                    <div className="doc-row">
                                        <span className="label">시세</span>
                                        <span className="value">{Math.round(200000000 / (sampleConfig.jeonseRatio / 100) / 100000000).toFixed(1)}억원</span>
                                    </div>
                                    <div className="doc-row">
                                        <span className="label">전세가율</span>
                                        <span className={`value ${sampleConfig.jeonseRatio >= 80 ? 'danger' : sampleConfig.jeonseRatio >= 70 ? 'warning' : ''}`}>
                                            {sampleConfig.jeonseRatio}%
                                        </span>
                                    </div>
                                    {sampleConfig.hasMortgage && (
                                        <div className="doc-row">
                                            <span className="label">근저당</span>
                                            <span className="value danger">{sampleConfig.mortgageRatio}%</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="preview-summary">
                            <span>예상 분석 결과:</span>
                            <span className="result-badge" style={{ background: riskPreview.color }}>{riskPreview.label}</span>
                        </div>

                        <div className="preview-actions">
                            <button className="btn btn-secondary" onClick={() => setShowPreview(false)}>
                                설정 수정
                            </button>
                            <button className="btn btn-primary" onClick={handleStartSampleAnalysis}>
                                OCR + AI 분석 시작
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UploadPage
