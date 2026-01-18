import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { extractTextFromImage, extractTextFromPdf } from '../services/ocrService'
import { analyzeDocuments } from '../services/analysisService'
import './AnalysisPage.css'

function AnalysisPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const isSample = searchParams.get('sample') === 'true'

    const [currentStep, setCurrentStep] = useState(0)
    const [ocrProgress, setOcrProgress] = useState(0)
    const [statusMessage, setStatusMessage] = useState('분석 준비 중...')
    const [error, setError] = useState(null)
    const [hasRegistry, setHasRegistry] = useState(true)

    useEffect(() => {
        if (isSample) {
            processSampleData()
        } else {
            startAnalysis()
        }
    }, [])

    const getSteps = () => {
        if (isSample) {
            return [
                { id: 0, label: '데이터 로드' },
                { id: 1, label: '텍스트 분석' },
                { id: 2, label: '위험도 계산' },
                { id: 3, label: '보고서 생성' }
            ]
        }

        if (hasRegistry) {
            return [
                { id: 0, label: '문서 로드' },
                { id: 1, label: '계약서 OCR' },
                { id: 2, label: '등기부 OCR' },
                { id: 3, label: '위험도 분석' },
                { id: 4, label: '보고서 생성' }
            ]
        }

        return [
            { id: 0, label: '문서 로드' },
            { id: 1, label: '계약서 OCR' },
            { id: 2, label: '위험도 분석' },
            { id: 3, label: '보고서 생성' }
        ]
    }

    const processSampleData = async () => {
        try {
            setCurrentStep(0)
            setStatusMessage('예시 계약서 데이터를 로드하는 중...')

            const sampleData = sessionStorage.getItem('sampleAnalysis')
            if (!sampleData) {
                throw new Error('샘플 데이터가 없습니다.')
            }

            const { contractText, registryText, sampleName } = JSON.parse(sampleData)
            await delay(500)

            setCurrentStep(1)
            setStatusMessage('계약서 텍스트를 분석하는 중...')
            await delay(800)

            setCurrentStep(2)
            setStatusMessage('위험도를 계산하는 중...')
            const analysisResult = await analyzeDocuments(contractText, registryText || '')
            await delay(500)

            setCurrentStep(3)
            setStatusMessage('분석 보고서를 생성하는 중...')
            await delay(500)

            sessionStorage.setItem('analysisResult', JSON.stringify({
                ...analysisResult,
                sampleName
            }))
            sessionStorage.removeItem('sampleAnalysis')

            navigate('/result')

        } catch (err) {
            setError(err.message)
        }
    }

    const startAnalysis = async () => {
        try {
            setCurrentStep(0)
            setStatusMessage('업로드된 문서를 로드하는 중...')

            // 1. location.state에서 파일 확인 (PDF 등 대용량 파일)
            const stateData = location.state
            // 2. sessionStorage에서 데이터 확인 (이미지 Base64)
            const sessionData = sessionStorage.getItem('analysisData')

            let contractData, registryData
            let hasRegistryDoc = false

            if (stateData && stateData.contractFile) {
                contractData = stateData.contractFile
                registryData = stateData.registryFile
                hasRegistryDoc = !!registryData
            } else if (sessionData) {
                const parsed = JSON.parse(sessionData)
                contractData = parsed.contract.data
                registryData = parsed.registry ? parsed.registry.data : null
                hasRegistryDoc = !!registryData
            } else {
                throw new Error('분석할 문서가 없습니다. 문서를 다시 업로드해주세요.')
            }

            setHasRegistry(hasRegistryDoc)
            await delay(500)

            // 계약서 OCR
            setCurrentStep(1)
            setStatusMessage('계약서에서 텍스트를 추출하는 중...')

            let contractText = ''
            // PDF 파일 객체인 경우
            if (contractData instanceof File && contractData.type === 'application/pdf') {
                contractText = await extractTextFromPdf(
                    contractData,
                    (progress) => setOcrProgress(progress.progress * 100)
                )
            } else {
                // 이미지 데이터 (Base64) 또는 이미지 파일 객체
                contractText = await extractTextFromImage(
                    contractData,
                    (progress) => setOcrProgress(progress.progress * 100)
                )
            }

            let registryText = ''

            // 등기부등본이 있는 경우만 OCR 수행
            if (hasRegistryDoc) {
                setCurrentStep(2)
                setOcrProgress(0)
                setStatusMessage('등기부등본에서 텍스트를 추출하는 중...')

                if (registryData instanceof File && registryData.type === 'application/pdf') {
                    registryText = await extractTextFromPdf(
                        registryData,
                        (progress) => setOcrProgress(progress.progress * 100)
                    )
                } else {
                    registryText = await extractTextFromImage(
                        registryData,
                        (progress) => setOcrProgress(progress.progress * 100)
                    )
                }

                setCurrentStep(3)
            } else {
                setCurrentStep(2)
            }

            setStatusMessage('위험도를 분석하는 중...')
            const analysisResult = await analyzeDocuments(contractText, registryText)

            // 등기부등본 없이 분석한 경우 표시
            if (!hasRegistryDoc) {
                analysisResult.noRegistry = true
                analysisResult.recommendations.unshift('등기부등본을 추가로 분석하면 더 정확한 결과를 얻을 수 있습니다.')
            }

            await delay(500)

            setCurrentStep(hasRegistryDoc ? 4 : 3)
            setStatusMessage('분석 보고서를 생성하는 중...')
            await delay(500)

            sessionStorage.setItem('analysisResult', JSON.stringify(analysisResult))
            sessionStorage.removeItem('analysisData')

            navigate('/result')

        } catch (err) {
            setError(err.message)
        }
    }

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

    const steps = getSteps()

    if (error) {
        return (
            <div className="analysis-page">
                <div className="error-container">
                    <div className="error-icon">!</div>
                    <h2>분석 중 오류가 발생했습니다</h2>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={() => navigate('/upload')}>
                        다시 시도
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="analysis-page">
            <div className="analysis-container">
                <h1 className="analysis-title">
                    {isSample ? '예시 분석 중' : '문서 분석 중'}
                </h1>
                <p className="analysis-subtitle">
                    모든 처리는 브라우저 내에서 이루어집니다.
                </p>

                <div className="steps-container">
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`step-item ${index < currentStep ? 'completed' : ''} ${index === currentStep ? 'active' : ''}`}
                        >
                            <div className="step-indicator">
                                {index < currentStep ? (
                                    <span className="check">V</span>
                                ) : index === currentStep ? (
                                    <span className="spinner"></span>
                                ) : (
                                    <span>{index + 1}</span>
                                )}
                            </div>
                            <span className="step-label">{step.label}</span>
                        </div>
                    ))}
                </div>

                <div className="progress-container">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                        />
                    </div>
                    <p className="status-message">{statusMessage}</p>
                    {!isSample && (currentStep === 1 || (hasRegistry && currentStep === 2)) && (
                        <p className="ocr-progress">OCR 진행률: {Math.round(ocrProgress)}%</p>
                    )}
                </div>

                <div className="privacy-notice">
                    <span className="shield-icon">S</span>
                    <p>귀하의 문서는 서버로 전송되지 않습니다</p>
                </div>
            </div>
        </div>
    )
}

export default AnalysisPage
