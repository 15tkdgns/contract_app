import React, { useEffect, useState } from 'react'
import ContractViewer from '../components/ContractViewer'
import { useNavigate } from 'react-router-dom'

function FullContractPage() {
    const navigate = useNavigate()
    const [result, setResult] = useState(null)

    useEffect(() => {
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
                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>계약서 원문 분석 (전체화면)</h2>
                <button
                    onClick={() => window.close()} // 팝업인 경우 닫기
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
                <div style={{ height: '100%', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    {/* Reuse ContractViewer but ensure it takes full height */}
                    <div className="full-screen-wrapper" style={{ height: '100%' }}>
                        <ContractViewer
                            text={result.ocrText}
                            analysis={result.clauseAnalysis || []}
                        />
                    </div>
                </div>
            </div>

            {/* Style overwrite for full screen usage */}
            <style>{`
                .full-screen-wrapper .contract-viewer-container {
                    height: 100% !important;
                    border-radius: 0;
                    background: transparent;
                }
            `}</style>
        </div>
    )
}

export default FullContractPage
