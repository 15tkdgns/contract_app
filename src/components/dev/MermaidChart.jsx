import React, { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
    startOnLoad: true,
    theme: 'base',
    securityLevel: 'loose',
    themeVariables: {
        primaryColor: '#e0e7ff',
        edgeLabelBackground: '#ffffff',
        tertiaryColor: '#fff'
    }
})

function MermaidChart({ result }) {
    const containerRef = useRef(null)
    const [graphDefinition, setGraphDefinition] = useState('')

    useEffect(() => {
        if (!result) return

        const cd = result.contractData || result.extractedData || {}

        // 데이터 정제
        const landlord = cd.landlord || '임대인(미확인)'
        const tenant = cd.tenant || '임차인(본인)'
        const deposit = cd.deposit ? `${parseInt(String(cd.deposit).replace(/[^0-9]/g, '')) / 100000000}억` : '??억'
        const address = cd.address ? cd.address.split(' ').slice(0, 2).join(' ') : '부동산'
        const mortgage = cd.mortgageAmount ? `${parseInt(String(cd.mortgageAmount).replace(/[^0-9]/g, '')) / 100000000}억` : '0원'

        // 노드 정의
        let graph = `graph TD\n`

        // 클래스 정의 (스타일)
        graph += `    classDef danger fill:#fecaca,stroke:#ef4444,stroke-width:2px;\n`
        graph += `    classDef warning fill:#fde68a,stroke:#f59e0b,stroke-width:2px;\n`
        graph += `    classDef safe fill:#d1fae5,stroke:#10b981,stroke-width:2px;\n`
        graph += `    classDef asset fill:#e0f2fe,stroke:#3b82f6,stroke-width:2px;\n`

        // 노드 생성
        // 임대인: 사기 패턴 매칭 시 위험 표시
        const isLandlordRisk = result.matchedPatterns?.some(p => ['fake_owner', 'gap_investment', 'tax_arrears'].includes(p.id))
        const landlordClass = isLandlordRisk ? ':::danger' : ':::safe'
        graph += `    L[임대인: ${landlord}]${landlordClass}\n`

        // 임차인
        graph += `    T[임차인: ${tenant}<br/>보증금 ${deposit}]:::safe\n`

        // 부동산
        const isBuildingRisk = result.matchedPatterns?.some(p => p.id === 'illegal_building')
        const buildingClass = isBuildingRisk ? ':::danger' : ':::asset'
        graph += `    P[부동산: ${address}]${buildingClass}\n`

        // 근저당 (있으면 표시)
        if (mortgage !== '0원') {
            const isMortgageRisk = result.matchedPatterns?.some(p => p.id === 'excessive_debt')
            const mortgageClass = isMortgageRisk ? ':::danger' : ':::warning'
            graph += `    B[은행/채권자<br/>근저당 ${mortgage}]${mortgageClass}\n`
            graph += `    B -->|담보 설정| P\n`
        }

        // 엣지 연결
        graph += `    L -->|소유| P\n`
        graph += `    T -->|계약/전입| P\n`
        graph += `    T -->|보증금 지급| L\n`

        // 선순위 등 기타 위험 요소
        if (result.matchedPatterns?.some(p => p.id === 'trust_fraud')) {
            graph += `    Trust[신탁회사]:::danger\n`
            graph += `    Trust -.->|실소유?| P\n`
            graph += `    L -.->|신탁 원부 미확인| Trust\n`
        }

        setGraphDefinition(graph)
    }, [result])

    useEffect(() => {
        if (containerRef.current && graphDefinition) {
            containerRef.current.removeAttribute('data-processed')
            containerRef.current.innerHTML = graphDefinition
            mermaid.run({ nodes: [containerRef.current] })
                .catch(err => console.error('Mermaid Render Error:', err))
        }
    }, [graphDefinition])

    return (
        <div className="mermaid-chart-wrapper">
            <h3>Mermaid 관계도 (실험실)</h3>
            <div ref={containerRef} className="mermaid">
                {graphDefinition}
            </div>
            <p className="caption">Mermaid.js로 생성된 동적 다이어그램입니다.</p>
        </div>
    )
}

export default MermaidChart
