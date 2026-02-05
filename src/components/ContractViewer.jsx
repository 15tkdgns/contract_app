import React, { useState } from 'react'
import './ContractViewer.css'

function ContractViewer({ text, analysis }) {
    const [selectedClause, setSelectedClause] = useState(null)

    // Highlight text logic
    const renderText = () => {
        if (!text) return <p>계약서 원문이 없습니다.</p>

        let parts = []
        let lastIndex = 0

        // 조항들을 순서대로 정렬 (텍스트 내 위치 기준)
        const sortedClauses = [...analysis].sort((a, b) => text.indexOf(a.text) - text.indexOf(b.text))

        // 텍스트 매칭 및 쪼개기
        sortedClauses.forEach(clause => {
            const index = text.indexOf(clause.text, lastIndex)
            if (index !== -1) {
                // 이전 일반 텍스트
                if (index > lastIndex) {
                    parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, index)}</span>)
                }
                // 하이라이트 부분
                const isSelected = selectedClause && selectedClause.id === clause.id
                parts.push(
                    <span
                        key={`clause-${clause.id}`}
                        className={`highlight-clause ${clause.type} ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedClause(clause)}
                    >
                        {clause.text}
                    </span>
                )
                lastIndex = index + clause.text.length
            }
        })

        // 나머지 텍스트
        if (lastIndex < text.length) {
            parts.push(<span key={`text-end`}>{text.substring(lastIndex)}</span>)
        }

        return <pre className="ocr-text-content">{parts}</pre>
    }

    return (
        <div className="contract-viewer-container">
            {/* Left: Document View */}
            <div className="pdf-view-panel">
                <div className="panel-header">
                    <h4>계약서 원문 (OCR)</h4>
                    <span className="badge-ocr">TEXT EXTRACTED</span>
                </div>
                <div className="pdf-content is-scrolling">
                    {renderText()}
                </div>
            </div>

            {/* Right: Analysis Panel */}
            <div className="analysis-side-panel">
                <div className="panel-header">
                    <h4>조항 정밀 분석</h4>
                    <span className="badge-ai">AI ANALYSIS</span>
                </div>

                <div className="clause-list">
                    {analysis.map(clause => (
                        <div
                            key={clause.id}
                            className={`clause-card ${clause.type} ${selectedClause?.id === clause.id ? 'active' : ''}`}
                            onClick={() => setSelectedClause(clause)}
                        >
                            <div className="clause-header">
                                <span className={`risk-tag ${clause.type}`}>
                                    {clause.type === 'safe' ? '안전' : clause.type === 'toxic' ? '독소조항' : '주의'}
                                </span>
                                <span className={`score-badge ${clause.score > 0 ? 'plus' : 'minus'}`}>
                                    {clause.score > 0 ? `+${clause.score}` : `${clause.score}`}점
                                </span>
                            </div>
                            <p className="clause-snippet">"{clause.text.substring(0, 40)}..."</p>
                            {selectedClause?.id === clause.id && (
                                <div className="clause-detail fade-in">
                                    <p className="reason">💡 {clause.reason}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ContractViewer
