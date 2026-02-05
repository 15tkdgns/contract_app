import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getHistory } from '../services/historyService'
import './HomePage.css'

function HomePage() {
    const navigate = useNavigate()
    const [recentHistory, setRecentHistory] = useState([])

    useEffect(() => {
        const history = getHistory()
        setRecentHistory(history.slice(0, 3)) // 최근 3개만
    }, [])

    const handleHistoryClick = (item) => {
        navigate('/result', { state: { result: item.result } })
    }

    return (
        <div className="home-page">
            <header className="home-header">
                <h1 className="home-app-title">Constract</h1>
                <p className="home-app-subtitle">
                    안전한 전세 계약을 위한 첫걸음
                </p>
            </header>

            {/* 메인 액션 카드 */}
            <div className="main-action-card">
                <h2>계약서 분석하기</h2>
                <p>
                    등기부등본과 계약서를 업로드하고<br />
                    AI 권리 분석 리포트를 받아보세요.
                </p>
                <Link to="/upload" className="btn btn-white btn-block">
                    분석 시작하기
                </Link>
            </div>

            {/* 최근 분석 현황 */}
            <div className="history-section-header">
                <h3>최근 분석 내역</h3>
                {recentHistory.length > 0 && (
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>전체보기</span>
                )}
            </div>

            {recentHistory.length === 0 ? (
                <div className="empty-state card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                    <p>아직 분석한 내역이 없습니다.</p>
                </div>
            ) : (
                <div className="history-list">
                    {recentHistory.map((item) => (
                        <div
                            key={item.id}
                            className="history-item touchable"
                            onClick={() => handleHistoryClick(item)}
                        >
                            <div className="tool-icon-wrapper" style={{ width: '40px', height: '40px', background: 'var(--bg-tertiary)' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>DOC</span>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>{item.address || '주소 정보 없음'}</div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{item.date}</div>
                            </div>
                            <div className={`badge badge-${item.riskLevel || 'info'}`}>
                                {item.score ? `${item.score}점` : '-'}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 도구 모음 그리드 (Horizontal Layout) */}
            <section className="tools-grid-section">
                <div className="tools-grid">
                    {[
                        { title: '계산기', icon: 'Calc', desc: '중개수수료/이자 계산', path: '/calculator' },
                        { title: '체크리스트', icon: 'Check', desc: '현장 확인 필수 항목', path: '/checklist' },
                        { title: '실험실', icon: 'Lab', desc: 'AI 분석 실험실', path: '/lab' },
                        { title: '나의 계약', icon: 'Docs', desc: '저장된 계약 관리', path: '/more' },
                    ].map((tool, idx) => (
                        <div key={idx} className="tool-card touchable" onClick={() => navigate(tool.path)}>
                            <div className="tool-icon-wrapper">
                                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{tool.icon}</span>
                            </div>
                            <div className="tool-info">
                                <h3>{tool.title}</h3>
                                <p>{tool.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 실험실 배너 */}
            <div className="dev-banner">
                <p className="dev-label">Developer Labs</p>
                <Link to="/dev" className="btn-dev touchable">
                    실험실 기능 미리보기
                </Link>
            </div>
        </div>
    )
}

export default HomePage
