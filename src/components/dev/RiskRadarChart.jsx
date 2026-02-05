import React, { useMemo } from 'react'
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts'
import './DevTools.css'

function RiskRadarChart({ result }) {
    if (!result) return null

    const chartData = useMemo(() => {
        // 기본값 설정
        let jeonseRisk = 20
        let mortgageRisk = 10
        let ownershipRisk = 10
        let insuranceRisk = 10
        let contractRisk = 20

        // 1. 전세가율 위험도 계산
        // summary_panel이 있으면 그 값을 쓰고, 없으면 contractData 등에서 추산
        if (result.summary_panel) {
            jeonseRisk = result.summary_panel.jeonseRatio || 0
        } else if (result.contractData) {
            const deposit = result.contractData.deposit || 0
            const market = result.contractData.marketPrice || deposit * 1.2
            jeonseRisk = Math.min(100, Math.round((deposit / market) * 100))
        }

        // 2. 융자 위험도
        if (result.summary_panel && result.summary_panel.mortgageRatio !== undefined) {
            mortgageRisk = result.summary_panel.mortgageRatio
        } // 없으면 0으로 가정

        // 3. 소유권/등기부 위험도
        if (result.documentVerification) {
            let score = 0
            if (result.documentVerification.ownerMatch?.status !== 'match') score += 50
            if (result.documentVerification.addressMatch?.status !== 'match') score += 30
            ownershipRisk = score
        } else if (result.summary_panel && !result.summary_panel.isOwnerMatch) {
            ownershipRisk = 80
        }

        // 4. 보증보험 가입 불가능성 (높을수록 위험)
        // 전세가율 90% 이상이거나 위반건축물이면 위험
        if (jeonseRisk > 90) insuranceRisk = 90
        else if (jeonseRisk > 80) insuranceRisk = 60
        else if (result.contractData?.hasInsurance) insuranceRisk = 0 // 이미 가입했다면 위험 0

        // 5. 계약 특약 / 사기 패턴 위험
        if (result.matchedPatterns && result.matchedPatterns.length > 0) {
            contractRisk = Math.min(100, result.matchedPatterns.length * 40)
        }

        // 캡핑 100
        jeonseRisk = Math.min(100, Math.max(0, jeonseRisk))
        mortgageRisk = Math.min(100, Math.max(0, mortgageRisk))
        ownershipRisk = Math.min(100, Math.max(0, ownershipRisk))
        insuranceRisk = Math.min(100, Math.max(0, insuranceRisk))
        contractRisk = Math.min(100, Math.max(0, contractRisk))

        return [
            { subject: '전세가율', A: jeonseRisk, fullMark: 100 },
            { subject: '근저당 비율', A: mortgageRisk, fullMark: 100 },
            { subject: '등기부 신뢰도', A: ownershipRisk, fullMark: 100 },
            { subject: '보험 가입 불가', A: insuranceRisk, fullMark: 100 },
            { subject: '특약/사기패턴', A: contractRisk, fullMark: 100 },
        ]
    }, [result])

    // 전체 평균 위험도
    const avgRisk = Math.round(chartData.reduce((acc, cur) => acc + cur.A, 0) / 5)

    return (
        <div className="chart-container" style={{ width: '100%', height: '400px', background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div className="chart-header" style={{ marginBottom: '10px', textAlign: 'center' }}>
                <h3 style={{ margin: 0, color: '#333' }}>다각도 리스크 프로파일 (Radar)</h3>
                <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: '#666' }}>
                    영역이 <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>넓을수록</span> 위험합니다 (만점 100)
                </p>
                <div style={{ marginTop: '5px' }}>
                    <span className={`badge ${avgRisk >= 60 ? 'danger' : avgRisk >= 40 ? 'warning' : 'success'}`}
                        style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', color: 'white', background: avgRisk >= 60 ? '#ff4d4f' : avgRisk >= 40 ? '#faad14' : '#52c41a' }}>
                        종합 위험도: {avgRisk} / 100
                    </span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="85%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#555', fontSize: 13, fontWeight: 500 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                    <Radar
                        name="위험 지수"
                        dataKey="A"
                        stroke="#ff4d4f"
                        strokeWidth={2}
                        fill="#ff4d4f"
                        fillOpacity={0.4}
                    />
                    <Tooltip
                        formatter={(value) => [`${value}점`, '위험 지수']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default RiskRadarChart
