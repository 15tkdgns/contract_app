import { useState } from 'react'
import './CalculatorPage.css'

function CalculatorPage() {
    const [deposit, setDeposit] = useState('')
    const [marketPrice, setMarketPrice] = useState('')
    const [mortgageAmount, setMortgageAmount] = useState('')
    const [priorDeposits, setPriorDeposits] = useState('')

    const formatNumber = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }

    const parseNumber = (str) => {
        return parseInt(str.replace(/,/g, '')) || 0
    }

    const handleNumberInput = (setter) => (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '')
        setter(value ? formatNumber(value) : '')
    }

    // 계산
    const depositNum = parseNumber(deposit)
    const marketPriceNum = parseNumber(marketPrice)
    const mortgageNum = parseNumber(mortgageAmount)
    const priorNum = parseNumber(priorDeposits)

    const jeonseRatio = marketPriceNum > 0
        ? ((depositNum / marketPriceNum) * 100).toFixed(1)
        : 0

    const totalLiability = mortgageNum + priorNum + depositNum
    const liabilityRatio = marketPriceNum > 0
        ? ((totalLiability / marketPriceNum) * 100).toFixed(1)
        : 0

    const safetyMargin = marketPriceNum - totalLiability
    const expectedRecovery = marketPriceNum * 0.8 - mortgageNum - priorNum

    const getRiskLevel = () => {
        if (jeonseRatio >= 80) return { level: 'critical', text: '매우 위험', color: 'var(--color-critical)' }
        if (jeonseRatio >= 70) return { level: 'danger', text: '위험', color: 'var(--color-danger)' }
        if (jeonseRatio >= 60) return { level: 'warning', text: '주의', color: 'var(--color-warning)' }
        return { level: 'safe', text: '안전', color: 'var(--color-success)' }
    }

    const risk = getRiskLevel()

    return (
        <div className="calculator-page animate-slide-up">
            <div className="page-header">
                <h1>전세가율 계산기</h1>
                <p>전세가율과 위험도를 계산해보세요</p>
            </div>

            {/* 입력 섹션 */}
            <section className="input-section">
                <div className="input-group">
                    <label>보증금</label>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            inputMode="numeric"
                            value={deposit}
                            onChange={handleNumberInput(setDeposit)}
                            placeholder="0"
                        />
                        <span className="input-suffix">원</span>
                    </div>
                </div>

                <div className="input-group">
                    <label>시세 (매매가)</label>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            inputMode="numeric"
                            value={marketPrice}
                            onChange={handleNumberInput(setMarketPrice)}
                            placeholder="0"
                        />
                        <span className="input-suffix">원</span>
                    </div>
                </div>

                <div className="input-group">
                    <label>근저당 설정액</label>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            inputMode="numeric"
                            value={mortgageAmount}
                            onChange={handleNumberInput(setMortgageAmount)}
                            placeholder="0"
                        />
                        <span className="input-suffix">원</span>
                    </div>
                </div>

                <div className="input-group">
                    <label>선순위 임차보증금</label>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            inputMode="numeric"
                            value={priorDeposits}
                            onChange={handleNumberInput(setPriorDeposits)}
                            placeholder="0"
                        />
                        <span className="input-suffix">원</span>
                    </div>
                </div>
            </section>

            {/* 결과 섹션 */}
            {marketPriceNum > 0 && depositNum > 0 && (
                <section className="result-section">
                    <div className="result-card main-result" style={{ borderColor: risk.color }}>
                        <div className="result-label">전세가율</div>
                        <div className="result-value" style={{ color: risk.color }}>
                            {jeonseRatio}%
                        </div>
                        <div className="result-badge" style={{ background: risk.color }}>
                            {risk.text}
                        </div>
                    </div>

                    <div className="result-grid">
                        <div className="result-card">
                            <div className="result-label">총 채무 비율</div>
                            <div className="result-value small">{liabilityRatio}%</div>
                        </div>
                        <div className="result-card">
                            <div className="result-label">안전 마진</div>
                            <div className={`result-value small ${safetyMargin < 0 ? 'negative' : ''}`}>
                                {safetyMargin < 0 ? '-' : ''}{formatNumber(Math.abs(safetyMargin))}원
                            </div>
                        </div>
                    </div>

                    <div className="result-card recovery">
                        <div className="result-label">예상 회수 가능액 (경매 시)</div>
                        <div className="result-desc">
                            시세의 80% 낙찰 가정, 선순위 채권 공제 후
                        </div>
                        <div className={`result-value ${expectedRecovery < depositNum ? 'negative' : 'positive'}`}>
                            {expectedRecovery < 0 ? '-' : ''}{formatNumber(Math.abs(expectedRecovery))}원
                        </div>
                        {expectedRecovery < depositNum && (
                            <div className="warning-text">
                                보증금 전액 회수가 어려울 수 있습니다
                            </div>
                        )}
                    </div>

                    {/* 기준 안내 */}
                    <div className="guide-section">
                        <h3>전세가율 위험 기준</h3>
                        <div className="guide-list">
                            <div className="guide-item safe">
                                <span className="guide-range">60% 미만</span>
                                <span className="guide-label">안전</span>
                            </div>
                            <div className="guide-item warning">
                                <span className="guide-range">60~70%</span>
                                <span className="guide-label">주의</span>
                            </div>
                            <div className="guide-item danger">
                                <span className="guide-range">70~80%</span>
                                <span className="guide-label">위험</span>
                            </div>
                            <div className="guide-item critical">
                                <span className="guide-range">80% 이상</span>
                                <span className="guide-label">매우 위험</span>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}

export default CalculatorPage
