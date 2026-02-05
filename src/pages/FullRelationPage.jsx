import React, { useEffect, useState } from 'react'
import ContractRelationHub from '../components/ContractRelationHub'
import { useNavigate } from 'react-router-dom'

function FullRelationPage() {
    const [result, setResult] = useState(null)

    useEffect(() => {
        // sessionStorage 우선 확인 후 localStorage 확인 (새 창 공유 문제 해결)
        const stored = sessionStorage.getItem('analysisResult') || localStorage.getItem('analysisResult')
        if (stored) {
            setResult(JSON.parse(stored))
        }
    }, [])

    if (!result) return <div style={{ padding: '20px' }}>Loading...</div>

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
            {/* Header */}
            <div style={{
                padding: '10px 20px',
                background: 'white',
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                zIndex: 10
            }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>계약 관계도 (전체화면)</h2>
                <button
                    onClick={() => window.close()}
                    style={{
                        background: '#333',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    닫기
                </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '20px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '20px' }}>
                    <div style={{ width: '100%', height: '100%' }}>
                        <ContractRelationHub result={result} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FullRelationPage
