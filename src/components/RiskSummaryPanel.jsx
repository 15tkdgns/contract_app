import React from 'react'
import './RiskSummaryPanel.css'

// SVG 아이콘 컴포넌트들
const ChartIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <rect x="3" y="12" width="6" height="8" rx="1" />
        <rect x="15" y="4" width="6" height="16" rx="1" />
        <path d="M4 20h16" />
    </svg>
)

const WalletIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
        <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
    </svg>
)

const AlertIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
)

const UserIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
)

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
)

const RiskSummaryPanel = ({ panelData }) => {
    if (!panelData) return null

    const items = [
        {
            key: 'jeonse_ratio',
            label: '전세가율',
            icon: <ChartIcon />,
            value: panelData.jeonse_ratio || '정보 없음'
        },
        {
            key: 'mortgage_total',
            label: '근저당 총액',
            icon: <WalletIcon />,
            value: panelData.mortgage_total || '정보 없음'
        },
        {
            key: 'seizure_status',
            label: '압류/가압류',
            icon: <AlertIcon />,
            value: panelData.seizure_status || '정보 없음'
        },
        {
            key: 'owner_match',
            label: '소유자 일치',
            icon: <UserIcon />,
            value: panelData.owner_match || '정보 없음'
        },
        {
            key: 'special_terms_check',
            label: '특약 핵심',
            icon: <CheckIcon />,
            value: panelData.special_terms_check || '정보 없음'
        }
    ]

    // 상태에 따른 클래스 결정
    const getStatusClass = (text) => {
        if (!text) return 'neutral'
        if (text.includes('위험') || text.includes('있음') || text.includes('불일치') || text.includes('누락')) return 'danger'
        if (text.includes('안전') || text.includes('없음') || text.includes('일치') || text.includes('포함')) return 'safe'
        if (text.includes('주의')) return 'warning'
        return 'neutral'
    }

    return (
        <div className="risk-summary-panel">
            <h3 className="panel-title">위험 진단 패널</h3>
            <div className="panel-grid">
                {items.map(item => {
                    const status = getStatusClass(item.value)
                    return (
                        <div key={item.key} className={`panel-card ${status}`}>
                            <div className="card-header">
                                <span className={`card-icon-box ${status}`}>
                                    {item.icon}
                                </span>
                                <span className="card-label">{item.label}</span>
                            </div>
                            <div className="card-value">{item.value}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default RiskSummaryPanel
