import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyzeManualInput } from '../services/analysisService'
import './ManualInputPage.css'

function ManualInputPage() {
    const navigate = useNavigate()
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    const [formData, setFormData] = useState({
        // 계약서 정보
        landlordName: '',
        tenantName: '',
        deposit: '',
        contractDate: '',

        // 등기부 정보
        ownerName: '',
        mortgageAmount: '',
        priorDeposits: '',
        marketPrice: '',

        // 확인 항목
        hasInsurance: null,
        isProxy: null,
        verifiedOwner: null
    })

    const handleChange = (e) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'radio' ? value === 'true' : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.deposit || !formData.marketPrice) {
            alert('보증금과 시세는 필수 입력 항목입니다.')
            return
        }

        setIsAnalyzing(true)

        try {
            const result = await analyzeManualInput(formData)
            sessionStorage.setItem('analysisResult', JSON.stringify(result))
            navigate('/result')
        } catch (error) {
            alert('분석 중 오류가 발생했습니다.')
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <div className="manual-page animate-slide-up">
            <div className="page-header">
                <h1>직접 입력</h1>
                <p>계약서와 등기부 정보를 직접 입력하세요</p>
            </div>

            <form onSubmit={handleSubmit} className="manual-form">
                {/* 계약서 정보 */}
                <section className="form-section">
                    <h2 className="section-title">계약서 정보</h2>

                    <div className="form-group">
                        <label>임대인 이름</label>
                        <input
                            type="text"
                            name="landlordName"
                            value={formData.landlordName}
                            onChange={handleChange}
                            placeholder="홍길동"
                        />
                    </div>

                    <div className="form-group">
                        <label>보증금 (원) *</label>
                        <input
                            type="number"
                            name="deposit"
                            value={formData.deposit}
                            onChange={handleChange}
                            placeholder="200000000"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>계약일</label>
                        <input
                            type="date"
                            name="contractDate"
                            value={formData.contractDate}
                            onChange={handleChange}
                        />
                    </div>
                </section>

                {/* 등기부 정보 */}
                <section className="form-section">
                    <h2 className="section-title">등기부등본 정보</h2>

                    <div className="form-group">
                        <label>소유자 이름</label>
                        <input
                            type="text"
                            name="ownerName"
                            value={formData.ownerName}
                            onChange={handleChange}
                            placeholder="홍길동"
                        />
                    </div>

                    <div className="form-group">
                        <label>근저당 설정액 (원)</label>
                        <input
                            type="number"
                            name="mortgageAmount"
                            value={formData.mortgageAmount}
                            onChange={handleChange}
                            placeholder="0"
                        />
                    </div>

                    <div className="form-group">
                        <label>선순위 임차보증금 (원)</label>
                        <input
                            type="number"
                            name="priorDeposits"
                            value={formData.priorDeposits}
                            onChange={handleChange}
                            placeholder="0"
                        />
                    </div>

                    <div className="form-group">
                        <label>시세 (원) *</label>
                        <input
                            type="number"
                            name="marketPrice"
                            value={formData.marketPrice}
                            onChange={handleChange}
                            placeholder="300000000"
                            required
                        />
                    </div>
                </section>

                {/* 확인 항목 */}
                <section className="form-section">
                    <h2 className="section-title">확인 항목</h2>

                    <div className="form-group radio-group">
                        <label>전세보증보험 가입 여부</label>
                        <div className="radio-options">
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="hasInsurance"
                                    value="true"
                                    checked={formData.hasInsurance === true}
                                    onChange={handleChange}
                                />
                                <span>가입</span>
                            </label>
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="hasInsurance"
                                    value="false"
                                    checked={formData.hasInsurance === false}
                                    onChange={handleChange}
                                />
                                <span>미가입</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-group radio-group">
                        <label>대리인 계약 여부</label>
                        <div className="radio-options">
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="isProxy"
                                    value="true"
                                    checked={formData.isProxy === true}
                                    onChange={handleChange}
                                />
                                <span>대리인</span>
                            </label>
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="isProxy"
                                    value="false"
                                    checked={formData.isProxy === false}
                                    onChange={handleChange}
                                />
                                <span>본인</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-group radio-group">
                        <label>소유자-임대인 일치 확인</label>
                        <div className="radio-options">
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="verifiedOwner"
                                    value="true"
                                    checked={formData.verifiedOwner === true}
                                    onChange={handleChange}
                                />
                                <span>일치</span>
                            </label>
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="verifiedOwner"
                                    value="false"
                                    checked={formData.verifiedOwner === false}
                                    onChange={handleChange}
                                />
                                <span>불일치</span>
                            </label>
                        </div>
                    </div>
                </section>

                <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={isAnalyzing}
                >
                    {isAnalyzing ? '분석 중...' : '위험도 분석'}
                </button>
            </form>
        </div>
    )
}

export default ManualInputPage
