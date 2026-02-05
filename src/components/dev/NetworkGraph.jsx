import React, { useRef, useEffect, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'

function NetworkGraph({ result }) {
    const containerRef = useRef()
    const [dimensions, setDimensions] = useState({ w: 800, h: 500 })

    useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                w: containerRef.current.clientWidth,
                h: containerRef.current.clientHeight
            })
        }

        const handleResize = () => {
            if (containerRef.current) {
                setDimensions({
                    w: containerRef.current.clientWidth,
                    h: containerRef.current.clientHeight
                })
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    if (!result) return null

    // Force Graph용 데이터 변환
    const graphData = {
        nodes: (result.entities || []).map(e => ({
            id: e.id,
            name: e.label || e.id,
            val: e.type === 'property' ? 10 : 5, // 크기
            color: (e.risk === 'warning' || e.risk === 'critical') ? '#ff4d4f' :
                (e.type === 'property') ? '#52c41a' :
                    (e.type === 'money') ? '#faad14' : '#1890ff'
        })),
        links: (result.relations || []).map(r => ({
            source: r.source,
            target: r.target,
            name: r.label,
            width: r.type === 'risk_link' ? 3 : 1,
            color: r.type === 'risk_link' ? '#ff4d4f' : '#ccc'
        }))
    }

    return (
        <div style={{ padding: '20px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 10px', textAlign: 'center' }}>동적 관계 네트워크</h3>
            <p style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
                노드를 드래그하여 계약 관계를 탐색해보세요. 🕸️
            </p>
            <div ref={containerRef} style={{ width: '100%', height: '500px', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                <ForceGraph2D
                    width={dimensions.w}
                    height={dimensions.h}
                    graphData={graphData}
                    nodeLabel="name"
                    nodeColor="color"
                    nodeRelSize={6}

                    linkLabel="name"
                    linkWidth="width"
                    linkColor="color"
                    linkDirectionalArrowLength={3.5}
                    linkDirectionalArrowRelPos={1}
                    linkCurvature={0.25}

                    enableNodeDrag={true}
                    d3VelocityDecay={0.3}

                    // 텍스트 라벨 커스텀 렌더링 (항상 보이게)
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        const label = node.name;
                        const fontSize = 14 / globalScale;
                        ctx.font = `${fontSize}px Sans-Serif`;
                        const textWidth = ctx.measureText(label).width;
                        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                        // 배경
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                        ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

                        // 테두리 (원)
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
                        ctx.fillStyle = node.color;
                        ctx.fill();

                        // 텍스트
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = node.color; // 텍스트 색상을 노드 색상과 동일하게
                        ctx.fillText(label, node.x, node.y);

                        node.__bckgDimensions = bckgDimensions;
                    }}
                    nodePointerAreaPaint={(node, color, ctx) => {
                        ctx.fillStyle = color;
                        const bckgDimensions = node.__bckgDimensions;
                        bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
                    }}
                />
            </div>
        </div>
    )
}

export default NetworkGraph
