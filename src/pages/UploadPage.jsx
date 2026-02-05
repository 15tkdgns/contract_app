import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import FileUploader from '../components/FileUploader'
import { getHistory } from '../services/historyService'
import './UploadPage.css'

// Stages Definition
const STAGES = [
    {
        id: 'pre',
        title: '계약 전',
        subtitle: '매물 탐색 단계',
        desc: '등기부등본을 분석하여 깡통전세 위험과 권리 관계를 확인합니다.',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
        ),
        color: 'var(--color-primary)'
    },
    {
        id: 'ing',
        title: '계약 중',
        subtitle: '계약서 작성 단계',
        desc: '계약서 초안의 독소조항을 찾고, 필수 특약 사항을 추천받습니다.',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
        ),
        color: 'var(--color-success)'
    },
    {
        id: 'post',
        title: '계약 후',
        subtitle: '거주/잔금 단계',
        desc: '대항력 유지, 보증보험 가입 요건, 만기 시 보증금 반환을 대비합니다.',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
        color: '#8b5cf6'
    }
]

function UploadPage() {
    const navigate = useNavigate()

    // Wizard State
    const [step, setStep] = useState(1) // 1: Stage Select, 2: Upload
    const [selectedStage, setSelectedStage] = useState(null)

    // Upload State
    const [contractFile, setContractFile] = useState(null)
    const [registryFile, setRegistryFile] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [showSampleBuilder, setShowSampleBuilder] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [history, setHistory] = useState([])

    // Sample Config State
    const [sampleConfig, setSampleConfig] = useState({
        jeonseRatio: 70,
        hasMortgage: false,
        mortgageRatio: 30,
        isProxy: false,
        hasInsurance: true,
        ownerMatch: true
    })

    useEffect(() => {
        setHistory(getHistory())
    }, [])

    // Handlers
    const handleStageSelect = (stageId) => {
        setSelectedStage(stageId)
        setStep(2)
        window.scrollTo(0, 0)
    }

    const handleBackStep = () => {
        setStep(1)
        setSelectedStage(null)
    }

    const handleDevDemo = (stageOverride) => {
        const targetStage = (typeof stageOverride === 'string') ? stageOverride : 'ing'

        const demoResult = {
            isSample: true,
            stage: targetStage, // Dynamic stage
            overallScore: 72,
            overallRiskLevel: 'warning',
            summary_panel: {
                jeonse_ratio: '78%',
                mortgage_total: '1.2억',
                seizure_status: '없음',
                owner_match: '일치',
                special_terms_check: targetStage === 'ing' ? '3건 확인' : '해당 없음'
            },
            contractData: {
                landlord: '홍길동',
                tenant: '김철수',
                deposit: 300000000,
                marketPrice: 380000000,
                address: '서울특별시 강남구 테헤란로 123', // 시세 API 데모 연동을 위해 강남 주소 사용
                startDate: '2026-04-01',
                endDate: '2028-03-31'
            },
            entities: [
                { id: 'contract', name: '전세계약', type: 'contract' },
                { id: 'landlord', name: '홍길동', type: 'person' },
                { id: 'tenant', name: '김철수', type: 'person' },
                { id: 'house', name: '아파트(강남)', type: 'asset' },
                { id: 'bank', name: '우리은행', type: 'company' },
                { id: 'mortgage', name: '근저당 1.2억', type: 'risk' }
            ],
            relations: [
                { source: 'landlord', target: 'house', type: 'owns', label: '소유 (2020.03~)' },
                { source: 'tenant', target: 'contract', type: 'party', label: '임차인' },
                { source: 'landlord', target: 'contract', type: 'party', label: '임대인' },
                { source: 'contract', target: 'house', type: 'target', label: '목적물' },
                { source: 'house', target: 'mortgage', type: 'has_risk', label: '설정' },
                { source: 'mortgage', target: 'bank', type: 'creditor', label: '채권자' },
                { source: 'tenant', target: 'landlord', type: 'pays', label: '보증금 3억 지급' }
            ],
            // 4. 계약서 원문 및 조항 분석 (LLM Mock)
            ocrText: `[부동산 임대차 계약서]

제1조 (보증금 및 지급시기)
임대인 홍길동과 임차인 김철수는 보증금 금 300,000,000원정을 아래와 같이 지불하기로 한다.
- 계약금: 30,000,000원 (2026.02.01 영수함)
- 잔금: 270,000,000원 (2026.04.01 지급 예정)

제2조 (존속기간)
임대차 기간은 2026년 4월 1일부터 2028년 3월 31일까지(24개월)로 한다.

[특약사항]
1. 현 시설 상태에서의 계약이며, 기본 시설물 파손 시 임차인 책임으로 한다.
2. 반려동물 사육 및 실내 흡연을 금지한다. (위반 시 퇴실 조치)
3. 임대인은 임차인의 전세자금대출에 적극 협조한다.
4. 단, 임차인의 신용 문제로 대출 불가 시 본 계약은 무효로 하되, 계약금은 반환하지 않는다. (주의)
5. 계약 종료 후 보증금 반환이 지연될 경우, 임차인은 연 5%의 지연이자를 청구할 수 없다. (위험)
6. 임차인은 2년 후 퇴거 시 '신축 아파트 평균 시세'에 맞춰 보증금을 인상한다.
7. 임대인이 바뀌더라도 본 계약은 승계된다.`,

            clauseAnalysis: [
                { id: 'c1', text: '임차인의 신용 문제로 대출 불가 시 ... 계약금은 반환하지 않는다', type: 'unfair', score: -15, reason: '대출 거부 시 계약금 반환 불가 조항은 임차인에게 과도한 손해를 유발할 수 있습니다. (통상 반환 조건 필요)' },
                { id: 'c2', text: '임차인은 연 5%의 지연이자를 청구할 수 없다', type: 'toxic', score: -30, reason: '보증금 미반환에 대한 법적 지연이자 청구권을 무효화하는 독소 조항입니다.' },
                { id: 'c3', text: '신축 아파트 평균 시세에 맞춰 보증금을 인상한다', type: 'ambiguous', score: -10, reason: '인상 기준이 모호하여 추후 분쟁 소지가 있습니다. (상한선 5% 명시 권장)' },
                { id: 'c4', text: '임대인은 임차인의 전세자금대출에 적극 협조한다', type: 'safe', score: +10, reason: '임차인 보호를 위한 안전 장치입니다.' }
            ],
            riskScoreBreakdown: [
                { category: '권리 관계', score: -20, note: '선순위 근저당 존재' },
                { category: '특약 사항', score: -35, note: '독소 조항 2건 발견' },
                { category: '시세 위험', score: -5, note: '전세가율 78%' },
                { category: '계약자 검증', score: +10, note: '임대인 본인 확인 완료' }
            ]
        }
        sessionStorage.setItem('analysisResult', JSON.stringify(demoResult))
        navigate('/result', { state: { result: demoResult, initialTab: 'summary' } })
    }

    const handleStartAnalysis = async () => {
        if (!contractFile && !showSampleBuilder) {
            alert('문서를 업로드해주세요.')
            return
        }
        setIsLoading(true)

        try {
            const isPdfUpload = (contractFile?.type === 'application/pdf') || (registryFile?.type === 'application/pdf')

            if (isPdfUpload) {
                navigate('/analysis', {
                    state: {
                        contractFile,
                        registryFile,
                        stage: selectedStage
                    }
                })
            } else {
                const contractData = contractFile ? await fileToBase64(contractFile) : null
                const registryData = registryFile ? await fileToBase64(registryFile) : null

                sessionStorage.setItem('analysisData', JSON.stringify({
                    contract: contractData ? { name: contractFile.name, data: contractData } : null,
                    registry: registryData ? { name: registryFile.name, data: registryData } : null,
                    stage: selectedStage
                }))
                navigate('/analysis')
            }
        } catch (error) {
            console.error(error)
            alert('오류 발생')
            setIsLoading(false)
        }
    }

    const fileToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
    })

    // Render Step 1: Stage Selection
    const renderStep1 = () => (
        <div className="step-container fade-in">
            <h1 className="step-title">현재 어떤 상황인가요?</h1>
            <p className="step-desc">상황에 딱 맞는 분석 포인트를 짚어드립니다.</p>

            <div className="stage-cards">
                {STAGES.map(stage => (
                    <div
                        key={stage.id}
                        className="stage-card"
                        onClick={() => handleStageSelect(stage.id)}
                    >
                        <div className="stage-icon" style={{ color: stage.color }}>
                            {stage.icon}
                        </div>
                        <div className="stage-info">
                            <h3>{stage.title}</h3>
                            <span className="stage-subtitle">{stage.subtitle}</span>
                            <p>{stage.desc}</p>
                        </div>
                        <div className="stage-arrow">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dev-options">
                <button onClick={handleDevDemo} className="btn-text-sm">개발자 데모 모드</button>
            </div>
        </div>
    )

    // Render Step 2: Upload
    const renderStep2 = () => {
        const currentStageInfo = STAGES.find(s => s.id === selectedStage)

        return (
            <div className="step-container fade-in">
                <div className="step-header">
                    <button className="back-link-btn" onClick={handleBackStep}>
                        ← 단계 선택으로
                    </button>
                    <span className="step-Badge" style={{ background: currentStageInfo?.color + '20', color: currentStageInfo?.color }}>
                        {currentStageInfo?.title} 분석
                    </span>
                </div>

                <div className="upload-grid">
                    <div className="upload-section required">
                        <h2 className="section-label">
                            <span className="label-number">1</span>
                            계약서
                            {selectedStage === 'ing' && <span className="required-badge">필수</span>}
                        </h2>
                        <FileUploader
                            label="전세 계약서"
                            accept=".pdf,.jpg,.jpeg,.png"
                            file={contractFile}
                            onFileSelect={setContractFile}
                            onFileRemove={() => setContractFile(null)}
                        />
                        {selectedStage === 'ing' && <p className="upload-tip">특약사항 분석을 위해 필수입니다.</p>}
                    </div>

                    <div className="upload-section optional">
                        <h2 className="section-label">
                            <span className="label-number">2</span>
                            등기부등본
                            {selectedStage === 'pre' && <span className="required-badge">권장</span>}
                        </h2>
                        <FileUploader
                            label="등기부등본"
                            accept=".pdf,.jpg,.jpeg,.png"
                            file={registryFile}
                            onFileSelect={setRegistryFile}
                            onFileRemove={() => setRegistryFile(null)}
                        />
                        {selectedStage === 'pre' && <p className="upload-tip">소유자 및 근저당 확인에 필요합니다.</p>}
                    </div>
                </div>

                <div className="upload-actions">
                    <button
                        className="btn btn-primary btn-lg full-width"
                        onClick={handleStartAnalysis}
                        disabled={!contractFile && !registryFile}
                    >
                        {isLoading ? '분석 중...' : '분석 시작하기'}
                    </button>
                </div>

                {/* Sample Toggle (Instant Action) */}
                {/* Sample Toggle (Instant Action) */}
                <div className="sample-toggle-area">
                    <button className="btn-demo" onClick={() => handleDevDemo(selectedStage)}>
                        예시 데이터로 즉시 분석하기
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="upload-page-wizard">
            <div className="wizard-progress">
                <div className={`progress-dot ${step >= 1 ? 'active' : ''}`}></div>
                <div className="progress-line"></div>
                <div className={`progress-dot ${step >= 2 ? 'active' : ''}`}></div>
                <div className="progress-line"></div>
                <div className={`progress-dot ${step >= 3 ? 'active' : ''}`}></div>
            </div>

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
        </div>
    )
}

export default UploadPage
