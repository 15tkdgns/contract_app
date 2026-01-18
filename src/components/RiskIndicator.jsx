import './RiskIndicator.css'

function RiskIndicator({ score, riskLevel }) {
    const getColorClass = () => {
        if (score >= 80) return 'success'
        if (score >= 60) return 'warning'
        if (score >= 40) return 'danger'
        return 'critical'
    }

    const getLabel = () => {
        if (score >= 80) return '안전'
        if (score >= 60) return '주의'
        if (score >= 40) return '위험'
        return '매우 위험'
    }

    const colorClass = getColorClass()
    const circumference = 2 * Math.PI * 54 // radius = 54
    const offset = circumference - (score / 100) * circumference

    return (
        <div className="risk-indicator">
            <svg className="score-ring" viewBox="0 0 120 120">
                <circle
                    className="ring-bg"
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    strokeWidth="8"
                />
                <circle
                    className={`ring-progress ${colorClass}`}
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                />
            </svg>
            <div className="score-content">
                <span className={`score-value ${colorClass}`}>{score}</span>
                <span className="score-label">{getLabel()}</span>
            </div>
        </div>
    )
}

export default RiskIndicator
