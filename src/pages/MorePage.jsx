import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

function MorePage() {
    const navigate = useNavigate()

    const handleDevClick = () => {
        // 데이터가 없으면 경고 후 홈으로
        const stored = sessionStorage.getItem('analysisResult')
        if (!stored) {
            alert('분석 데이터가 없습니다. 홈에서 데모를 실행하거나 문서를 업로드해주세요.')
            navigate('/')
            return
        }
        navigate('/result', { state: { initialTab: 'dev' } })
    }

    return (
        <div className="more-page" style={{ padding: '20px', paddingBottom: '80px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>더보기</h2>

            <div className="menu-list" style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee' }}>
                <div style={itemStyle}>
                    <span>공지사항</span>
                    <span style={{ color: '#ccc' }}>›</span>
                </div>
                <div style={itemStyle}>
                    <span>자주 묻는 질문</span>
                    <span style={{ color: '#ccc' }}>›</span>
                </div>
                <div style={itemStyle}>
                    <span>설정</span>
                    <span style={{ color: '#ccc' }}>›</span>
                </div>
            </div>

            <div style={{ marginTop: '20px', background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee' }}>
                <div style={itemStyle} onClick={handleDevClick}>
                    <span>실험실 (Developer Labs)</span>
                    <span style={{ color: '#ccc' }}>›</span>
                </div>
            </div>

            <div style={{ marginTop: '30px', textAlign: 'center', color: '#999', fontSize: '0.8rem' }}>
                Constract v1.0.0
            </div>
        </div>
    )
}

const itemStyle = {
    padding: '16px 20px',
    borderBottom: '1px solid #f5f5f5',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '1rem'
}

export default MorePage
