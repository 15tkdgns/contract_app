import React, { useState, useRef, useEffect } from 'react'
import './SmartChecklist.css'

const CHECKLIST_ITEMS = [
    {
        id: 1,
        category: '권리 분석 (등기부등본)',
        items: [
            { id: 'reg1', text: '등기부등본을 오늘 날짜로 새로 발급받았나요?', risk: 'high' },
            { id: 'reg2', text: '갑구 소유자와 계약하러 온 임대인이 일치하나요?', risk: 'critical' },
            { id: 'reg3', text: '을구 근저당 채권최고액이 시세의 60% 이하인가요?', risk: 'critical' },
            { id: 'reg4', text: '압류, 가압류, 가처분 등기 내역이 없나요?', risk: 'critical' },
        ]
    },
    {
        id: 2,
        category: '물건 및 시세 확인',
        items: [
            { id: 'price1', text: '주변 매매가/전세가 시세를 확인했나요?', risk: 'high' },
            { id: 'price2', text: '전세가율(매매가 대비 전세가)이 70% 이하인가요?', risk: 'critical' },
            { id: 'build1', text: '불법 건축물(위반건축물) 등재 여부를 확인했나요?', risk: 'high' },
        ]
    },
    {
        id: 3,
        category: '계약 및 특약',
        items: [
            { id: 'contract1', text: '임대인 신분증 진위 여부를 확인했나요?', risk: 'critical' },
            { id: 'contract2', text: '보증보험 가입 가능 여부를 확인했나요?', risk: 'critical' },
            { id: 'special1', text: '"전입신고 효력 발생 전 근저당 설정 금지" 특약을 넣었나요?', risk: 'critical' },
            { id: 'special2', text: '"전세보증보험 가입 불가 시 계약 무효" 특약을 넣었나요?', risk: 'high' },
        ]
    }
]

const ALL_ITEMS = CHECKLIST_ITEMS.flatMap(cat => cat.items)

// 사기 패턴과 체크리스트 항목 매핑
const PATTERN_MAPPING = {
    'gap_investment': ['price2', 'price1'],
    'trust_fraud': ['reg2'],
    'fake_owner': ['reg2', 'contract1'],
    'illegal_building': ['build1', 'contract2'],
    'excessive_debt': ['reg3'],
    'tax_arrears': ['reg4'],
    'insurance_impossible': ['contract2']
}

function SmartChecklist({ result, embedded = false }) {
    const [checked, setChecked] = useState({})
    const [highlightedItems, setHighlightedItems] = useState([])
    const itemRefs = useRef({})

    // AI 결과 분석하여 하이라이트 항목 결정
    useEffect(() => {
        if (!result || !result.matchedPatterns) return

        const highlights = new Set()
        result.matchedPatterns.forEach(pattern => {
            const targets = PATTERN_MAPPING[pattern.id] || []
            targets.forEach(t => highlights.add(t))
        })

        // 추가: 특약 누락 등이 issues에 있다면 매핑 (여기서는 간단히 패턴만 매핑)
        setHighlightedItems(Array.from(highlights))
    }, [result])

    const handleCheck = (itemId) => {
        const isChecking = !checked[itemId]
        setChecked(prev => ({ ...prev, [itemId]: isChecking }))
    }

    // embedded 모드일 때는 간단하게 보여주기 (확인 버튼 등 생략 가능)
    // 하지만 일단 전체 기능을 제공하되 스타일만 조정

    const totalRisks = highlightedItems.filter(id => !checked[id]).length

    return (
        <div className={`smart-checklist ${embedded ? 'embedded' : ''}`}>
            {result && highlightedItems.length > 0 && (
                <div className="checklist-ai-alert">
                    <span className="ai-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="10" rx="2" />
                            <circle cx="12" cy="5" r="2" />
                            <path d="M12 7v4" />
                            <line x1="8" y1="16" x2="8" y2="16" />
                            <line x1="16" y1="16" x2="16" y2="16" />
                        </svg>
                    </span>
                    <span className="alert-text">
                        AI 분석 결과, <strong>{highlightedItems.length}개 항목</strong>을 중점적으로 확인해야 합니다.
                    </span>
                </div>
            )}

            <div className="checklist-container">
                {CHECKLIST_ITEMS.map(category => (
                    <section key={category.id} className="checklist-group">
                        <h4 className="group-title">{category.category}</h4>
                        <div className="group-items">
                            {category.items.map(item => {
                                const isHighlighted = highlightedItems.includes(item.id)
                                return (
                                    <label
                                        key={item.id}
                                        className={`checklist-item ${checked[item.id] ? 'checked' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={!!checked[item.id]}
                                            onChange={() => handleCheck(item.id)}
                                        />
                                        <span className="checkbox-custom">
                                            {checked[item.id] && 'V'}
                                        </span>
                                        <div className="item-content">
                                            <span className="item-text">{item.text}</span>
                                            {isHighlighted && <span className="highlight-tag">AI 강조</span>}
                                        </div>
                                    </label>
                                )
                            })}
                        </div>
                    </section>
                ))}
            </div>

            {totalRisks > 0 && embedded && (
                <div className="check-status-bar warning">
                    남은 중요 확인 사항: {totalRisks}개
                </div>
            )}
        </div>
    )
}

export default SmartChecklist
