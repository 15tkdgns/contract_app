import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { calculateJeonseRatio, estimatePriceFromOfficial } from '../services/priceService'
import './CalculatorPage.css'

function CalculatorPage() {
    const navigate = useNavigate()
    const [priceType, setPriceType] = useState('market') // 'market' | 'official'
    const [deposit, setDeposit] = useState('')
    const [price, setPrice] = useState('')
    const [officialPrice, setOfficialPrice] = useState('')
    const [result, setResult] = useState(null)
    const [isAnimating, setIsAnimating] = useState(false)

    // 금액 입력 포맷팅
    const handleNumberInput = (e, setter) => {
        const value = e.target.value.replace(/[^0-9]/g, '')
        setter(value ? parseInt(value, 10) : '')
    }

    // 한글 금액 표시
    const formatKoreanMoney = (number) => {
        if (!number) return ''
        const unit = 100000000
        const billion = Math.floor(number / unit)
        const remainder = Math.floor((number % unit) / 10000)

        let text = ''
        if (billion > 0) text += `${billion}억 `
        if (remainder > 0) text += `${remainder}만`
        return text + '원'
    }

    const handleCalculate = () => {
        let marketPrice = price

        if (priceType === 'official') {
            if (!officialPrice) return
            marketPrice = estimatePriceFromOfficial(officialPrice)
        }

        if (!deposit || !marketPrice) return

        setIsAnimating(true)
        setTimeout(() => {
            const calcResult = calculateJeonseRatio(deposit, marketPrice)
            setResult({ ...calcResult, marketPrice })
            setIsAnimating(false)
        }, 600)
    }

    const reset = () => {
        setResult(null)
        setDeposit('')
        setPrice('')
        setOfficialPrice('')
    }

    return (
        <div className="calculator-page">
            <header className="calc-header">
                <button className="back-btn" onClick={() => navigate(-1)}>←</button>
                <h1>전세가율 계산기</h1>
            </header>

            <div className="calc-container">
                <div className="input-card">
                    <div className="input-group">
                        <label>전세보증금</label>
                        <input
                            type="text"
                            value={deposit ? deposit.toLocaleString() : ''}
                            onChange={(e) => handleNumberInput(e, setDeposit)}
                            placeholder="예: 200,000,000"
                        />
                        <span className="money-text">{formatKoreanMoney(deposit)}</span>
                    </div>

                    <div className="type-toggle">
                        <button
                            className={priceType === 'market' ? 'active' : ''}
                            onClick={() => { setPriceType('market'); setResult(null); }}
                        >
                            매매가 기준
                        </button>
                        <button
                            className={priceType === 'official' ? 'active' : ''}
                            onClick={() => { setPriceType('official'); setResult(null); }}
                        >
                            공시지가 기준
                        </button>
                    </div>

                    {priceType === 'market' ? (
                        <div className="input-group">
                            <label>매매가 (시세)</label>
                            <input
                                type="text"
                                value={price ? price.toLocaleString() : ''}
                                onChange={(e) => handleNumberInput(e, setPrice)}
                                placeholder="예: 300,000,000"
                            />
                            <span className="money-text">{formatKoreanMoney(price)}</span>
                        </div>
                    ) : (
                        <div className="input-group">
                            <label>공시지가 <span className="badge">150% 적용</span></label>
                            <input
                                type="text"
                                value={officialPrice ? officialPrice.toLocaleString() : ''}
                                onChange={(e) => handleNumberInput(e, setOfficialPrice)}
                                placeholder="예: 200,000,000"
                            />
                            <span className="info-text">* 보증보험 가입 시 공시지가의 150%를 인정합니다.</span>
                            <span className="money-text">{formatKoreanMoney(officialPrice)}</span>
                        </div>
                    )}

                    <button
                        className={`calc-btn ${isAnimating ? 'loading' : ''}`}
                        onClick={handleCalculate}
                        disabled={!deposit || (priceType === 'market' ? !price : !officialPrice)}
                    >
                        {isAnimating ? '계산 중...' : '전세가율 확인하기'}
                    </button>
                </div>

                {result && (
                    <div className={`result-card ${result.level} slide-up`}>
                        <div className="result-header">
                            <span className="result-label">전세가율</span>
                            <span className="result-value">{result.ratio}%</span>
                        </div>

                        <div className="gauge-bar">
                            <div
                                className="gauge-fill"
                                style={{ width: `${Math.min(result.ratio, 100)}%` }}
                            ></div>
                        </div>

                        <div className="result-message">
                            <h3>{result.level === 'safe' ? '안전' : result.level === 'warning' ? '주의' : '위험'}</h3>
                            <p>{result.message}</p>
                        </div>

                        {priceType === 'official' && (
                            <div className="price-info">
                                <p>추정 매매가: {result.marketPrice.toLocaleString()}원</p>
                            </div>
                        )}

                        <button className="reset-btn" onClick={reset}>다시 계산하기</button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CalculatorPage
