import React, { useEffect, useState, useRef } from 'react'
import mermaid from 'mermaid'

// Mermaid Component (using render API for isolation)
const MermaidChart = ({ id, chart }) => {
    const [svg, setSvg] = useState('')
    const [error, setError] = useState(null)
    const containerRef = useRef(null)

    useEffect(() => {
        const renderChart = async () => {
            if (chart) {
                try {
                    setError(null)
                    // Generate truly unique ID to prevent collision during HMR or re-renders
                    const uniqueId = `${id}-${Math.random().toString(36).substr(2, 9)}`

                    // IMPORTANT: Trim indentation properly
                    const cleanChart = chart.replace(/^\s+/gm, '').trim()

                    const { svg } = await mermaid.render(uniqueId, cleanChart)
                    setSvg(svg)
                } catch (err) {
                    console.error('Mermaid render error:', err)
                    setError(err.message)
                    setSvg('')
                }
            }
        }
        renderChart()
    }, [chart, id])

    if (error) {
        return <div style={{ color: 'red', padding: '20px' }}>Render Error: {error}</div>
    }

    if (!svg) {
        return <div style={{ padding: '20px', color: '#888' }}>Loading visualization...</div>
    }

    return (
        <div
            ref={containerRef}
            className="mermaid-container"
            style={{ background: '#fff', padding: '20px', borderRadius: '8px', overflowX: 'auto' }}
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    )
}

function LabPage() {
    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            // Font settings removed to prevent potential issues
        })
    }, [])

    // 1. [Tier 1] C-O Diagram: Coffee Machine Example (File Content)
    const coffeeDiagram = `
    graph TD
        contract["☕ Coffee Machine Contract"]
        payment["💰 Payment"]
        payRight["✅ Client Required: Pay Euro"]
        payWrong["❌ Client Forbidden: Pay Wrong Coins"]
        
        contract --> payment
        payment --> payRight
        payment --> payWrong
        
        style payRight fill:#e1f5ff,stroke:#0277bd
        style payWrong fill:#ffcdd2,stroke:#d32f2f
    `

    // 2. [Tier 2] Timeline: Apartment Portfolio Example (File Content)
    // Data: Apt A (24.01-26.01), Apt B (24.06-25.06), Parking (24.03-25.03)
    // Added directives to increase size
    const aptTimeline = `
    %%{init: { 'gantt': { 'barHeight': 50, 'fontSize': 16, 'sectionFontSize': 18, 'topPadding': 60, 'bottomPadding': 60 } } }%%
    gantt
        title 🏢 Apartment & Parking Portfolio (vis-timeline Data)
        dateFormat YYYY-MM-DD
        axisFormat %Y-%m
        
        section Building 1
        Apartment A (전세) :done, a1, 2024-01-01, 2026-01-01
        Apartment B (월세) :active, a2, 2024-06-15, 2025-06-15
        
        section Building 2
        Parking Lot (월세) :active, p1, 2024-03-01, 2025-03-01
    `

    // 3. [Tier 3] Hybrid: Contract Management Example (Streamlit Data)
    // Data: APT-001 (Lee Min-ho), APT-002 (Kim Ji-won), PARK-001 (Park Jin-seo) - Obligations
    const hybridGraph = `
    graph LR
        subgraph Contracts
            c1[APT-001\nLee Min-ho]
            c2[APT-002\nKim Ji-won]
            c3[PARK-001\nPark Jin-seo]
        end
        
        subgraph Obligations
            o1[월세 지급]
            o2[보증금 반환]
            o3[관리비 지급]
        end
        
        c1 -- "2024.01~2026.01" --> o1
        c2 -- "2024.06~2025.06" --> o2
        c3 -- "2024.03~2025.03" --> o3
        
        style c1 fill:#e3f2fd
        style c2 fill:#fff3e0
        style c3 fill:#e8f5e9
    `

    return (
        <div style={{ padding: '20px', paddingBottom: '80px', background: '#f8f9fa', minHeight: '100vh' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>🧪 실험실 (Visual Lab)</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                요청하신 MD 파일의 3가지 핵심 시각화 예제를 모두 구현했습니다.
            </p>

            {/* Section 1: Coffee Machine */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px' }}>
                    1. Coffee Machine Contract (C-O Diagram)
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '10px' }}>
                    Graphviz/Mermaid 예제 데이터: Contract → Payment → Pay Euro / Pay Wrong Coins
                </p>
                <div style={{ border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden' }}>
                    <MermaidChart id="graph1" chart={coffeeDiagram} />
                </div>
            </section>

            {/* Section 2: Apt Timeline */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px' }}>
                    2. Apartment Portfolio (Timeline/Gantt)
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '10px' }}>
                    vis-timeline 예제 데이터: Apartment A, B & Parking Lot 기간 시각화
                </p>
                <div style={{ border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden' }}>
                    <MermaidChart id="graph2" chart={aptTimeline} />
                </div>
            </section>

            {/* Section 3: Hybrid Graph */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px' }}>
                    3. Contract Management (Hybrid Data)
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '10px' }}>
                    Streamlit 예제 데이터: Lee Min-ho, Kim Ji-won, Park Jin-seo 계약 및 의무 관계
                </p>
                <div style={{ border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden' }}>
                    <MermaidChart id="graph3" chart={hybridGraph} />
                </div>
            </section>
        </div>
    )
}

export default LabPage
