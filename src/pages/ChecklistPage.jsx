import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './ChecklistPage.css'

const CHECKLIST_ITEMS = [
    {
        id: 1,
        category: '등기부등본 확인',
        items: [
            { id: 'reg1', text: '인터넷등기소에서 직접 발급받았나요?', risk: 'high' },
            { id: 'reg2', text: '소유자와 임대인 이름이 일치하나요?', risk: 'critical' },
            { id: 'reg3', text: '근저당 설정 금액을 확인했나요?', risk: 'high' },
            { id: 'reg4', text: '압류, 가압류, 가처분 등이 없나요?', risk: 'critical' },
        ]
    },
    {
        id: 2,
        category: '전세가율 확인',
        items: [
            { id: 'price1', text: 'KB시세 또는 국토부 실거래가를 확인했나요?', risk: 'high' },
            { id: 'price2', text: '전세가율이 70% 이하인가요?', risk: 'critical' },
            { id: 'price3', text: '주변 시세와 비교했나요?', risk: 'medium' },
        ]
    },
    {
        id: 3,
        category: '계약 과정 확인',
        items: [
            { id: 'contract1', text: '공인중개사 자격증을 조회했나요?', risk: 'high' },
            { id: 'contract2', text: '대리인 계약이면 위임장 공증을 확인했나요?', risk: 'critical' },
            { id: 'contract3', text: '실소유자와 직접 대면 또는 영상통화 했나요?', risk: 'critical' },
            { id: 'contract4', text: '계약금은 실소유자 명의 계좌로 입금했나요?', risk: 'critical' },
        ]
    },
    {
        id: 4,
        category: '보증보험 확인',
        items: [
            { id: 'insurance1', text: 'HUG/SGI 전세보증보험 가입 가능 여부를 확인했나요?', risk: 'high' },
            { id: 'insurance2', text: '보험 가입이 가능한 물건인가요?', risk: 'high' },
        ]
    },
    {
        id: 5,
        category: '잔금일 확인',
        items: [
            { id: 'final1', text: '잔금 당일 등기부등본을 재확인할 예정인가요?', risk: 'critical' },
            { id: 'final2', text: '입주 당일 전입신고할 예정인가요?', risk: 'high' },
            { id: 'final3', text: '입주 당일 확정일자 받을 예정인가요?', risk: 'high' },
        ]
    },
]

// 모든 항목을 flatMap으로 펼침
const ALL_ITEMS = CHECKLIST_ITEMS.flatMap(cat => cat.items)

function ChecklistPage() {
    const navigate = useNavigate()
    const [checked, setChecked] = useState({})
    const [showResult, setShowResult] = useState(false)
    const itemRefs = useRef({})

    const totalItems = CHECKLIST_ITEMS.reduce((sum, cat) => sum + cat.items.length, 0)
    const checkedCount = Object.values(checked).filter(Boolean).length
    const progress = (checkedCount / totalItems) * 100

    const handleCheck = (itemId) => {
        const isChecking = !checked[itemId]
        setChecked(prev => ({
            ...prev,
            [itemId]: isChecking
        }))

        // 체크했을 때만 다음 항목으로 스크롤
        if (isChecking) {
            const currentIndex = ALL_ITEMS.findIndex(item => item.id === itemId)
            const nextItem = ALL_ITEMS[currentIndex + 1]

            if (nextItem && itemRefs.current[nextItem.id]) {
                setTimeout(() => {
                    itemRefs.current[nextItem.id].scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    })
                }, 150)
            }
        }
    }

    const getUncheckedRisks = () => {
        const risks = { critical: 0, high: 0, medium: 0 }
        CHECKLIST_ITEMS.forEach(category => {
            category.items.forEach(item => {
                if (!checked[item.id]) {
                    risks[item.risk]++
                }
            })
        })
        return risks
    }

    const getRiskScore = () => {
        const risks = getUncheckedRisks()
        const score = 100 - (risks.critical * 15) - (risks.high * 8) - (risks.medium * 3)
        return Math.max(0, Math.min(100, score))
    }

    const handleComplete = () => {
        setShowResult(true)
    }

    const score = getRiskScore()
    const risks = getUncheckedRisks()

    return (
        <div className="checklist-page animate-slide-up">
            <div className="page-header">
                <h1>체크리스트</h1>
                <p>계약 전 확인해야 할 항목들입니다</p>
            </div>

            {/* Progress Bar */}
            <div className="progress-section">
                <div className="progress-info">
                    <span>{checkedCount} / {totalItems} 확인</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
            </div>

            {/* Checklist */}
            <div className="checklist-container">
                {CHECKLIST_ITEMS.map(category => (
                    <section key={category.id} className="checklist-section">
                        <h2 className="section-title">{category.category}</h2>
                        <div className="checklist-items">
                            {category.items.map(item => (
                                <label
                                    key={item.id}
                                    ref={el => itemRefs.current[item.id] = el}
                                    className={`checklist-item ${checked[item.id] ? 'checked' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={!!checked[item.id]}
                                        onChange={() => handleCheck(item.id)}
                                    />
                                    <span className="checkbox-custom">
                                        {checked[item.id] && <span className="check-mark">V</span>}
                                    </span>
                                    <span className="item-text">{item.text}</span>
                                    {!checked[item.id] && (
                                        <span className={`risk-badge ${item.risk}`}>
                                            {item.risk === 'critical' ? '필수' : item.risk === 'high' ? '중요' : '권장'}
                                        </span>
                                    )}
                                </label>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            {/* Action Button */}
            <button
                className="btn btn-primary btn-lg"
                onClick={handleComplete}
            >
                위험도 확인하기
            </button>

            {/* Result Modal */}
            {showResult && (
                <div className="result-modal-overlay" onClick={() => setShowResult(false)}>
                    <div className="result-modal" onClick={e => e.stopPropagation()}>
                        <h2>체크리스트 결과</h2>

                        <div className={`score-circle ${score >= 80 ? 'safe' : score >= 50 ? 'warning' : 'danger'}`}>
                            <span className="score-value">{score}</span>
                            <span className="score-label">점</span>
                        </div>

                        {risks.critical > 0 && (
                            <div className="risk-warning critical">
                                <strong>필수 확인 항목 {risks.critical}개</strong>가 체크되지 않았습니다.
                            </div>
                        )}

                        {risks.high > 0 && (
                            <div className="risk-warning high">
                                <strong>중요 확인 항목 {risks.high}개</strong>가 체크되지 않았습니다.
                            </div>
                        )}

                        {score >= 80 && (
                            <div className="result-message safe">
                                기본적인 확인이 잘 되어 있습니다. 계약을 진행해도 좋습니다.
                            </div>
                        )}

                        <button
                            className="btn btn-secondary btn-lg"
                            onClick={() => setShowResult(false)}
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ChecklistPage
