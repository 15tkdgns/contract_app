import React, { useMemo } from 'react'
import CytoscapeComponent from 'react-cytoscapejs'
import cytoscape from 'cytoscape'

// 기본적으로 cose 레이아웃 사용. (설치된 경우 cose-bilkent 등 사용 가능하지만 호환성 위해 기본 사용)

function CytoscapeGraph({ result }) {
    if (!result) return null

    const elements = useMemo(() => {
        const nodes = (result.entities || []).map(e => ({
            data: {
                id: e.id,
                label: e.label || e.id,
                type: e.type,
                risk: e.risk
            }
        }))
        const edges = (result.relations || []).map((r, i) => ({
            data: {
                id: `edge-${i}`,
                source: r.source,
                target: r.target,
                label: r.label,
                type: r.type
            }
        }))
        return [...nodes, ...edges]
    }, [result])

    const layout = {
        name: 'cose',
        idealEdgeLength: 100,
        nodeOverlap: 20,
        refresh: 20,
        fit: true,
        padding: 50,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: 400000,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0
    }

    const styleSheet = [
        {
            selector: 'node',
            style: {
                'label': 'data(label)',
                'text-valign': 'center',
                'text-halign': 'center',
                'text-wrap': 'wrap',
                'text-max-width': 80,
                'font-size': '12px',
                'color': '#fff',
                'width': 60,
                'height': 60,
                'background-color': '#666',
                'border-width': 2,
                'border-color': '#fff',
                'text-outline-width': 2,
                'text-outline-color': '#333',
                'overlay-padding': '6px',
                'z-index': 10
            }
        },
        // 리스크가 있으면 강렬한 스타일
        {
            selector: 'node[risk="warning"]',
            style: {
                'background-color': '#ff4d4f',
                'border-color': '#ffccc7',
                'border-width': 4,
                'width': 70,
                'height': 70
            }
        },
        {
            selector: 'node[type="person"]',
            style: { 'background-color': '#1890ff', 'shape': 'ellipse' }
        },
        {
            selector: 'node[type="property"]',
            style: { 'background-color': '#52c41a', 'shape': 'round-rectangle' }
        },
        {
            selector: 'node[type="money"]',
            style: { 'background-color': '#faad14', 'shape': 'diamond' }
        },
        {
            selector: 'edge',
            style: {
                'width': 3,
                'line-color': '#666',
                'target-arrow-color': '#666',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier',
                'label': 'data(label)',
                'font-size': '11px',
                'color': '#ccc',
                'text-rotation': 'autorotate',
                'text-background-color': '#222',
                'text-background-opacity': 1,
                'text-background-padding': '4px',
                'text-border-width': 1,
                'text-border-color': '#444'
            }
        },
        {
            selector: 'edge[type="risk_link"]',
            style: {
                'line-color': '#ff4d4f',
                'target-arrow-color': '#ff4d4f',
                'width': 4,
                'line-style': 'dashed'
            }
        },
        {
            selector: ':selected',
            style: {
                'border-width': 4,
                'border-color': '#fff',
                'line-color': '#fff',
                'target-arrow-color': '#fff',
                'source-arrow-color': '#fff'
            }
        }

    ]

    return (
        <div style={{ width: '100%', height: '500px', background: '#1f1f1f', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid #333' }}>
            <div style={{ padding: '12px 20px', background: '#141414', color: '#fff', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🕸️</span>
                    <span style={{ fontWeight: 'bold' }}>Cytoscape Analysis</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>Drag nodes to rearrange</span>
                    <span className="badge" style={{ background: '#333', color: '#aaa', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>v3.2.0</span>
                </div>
            </div>
            <CytoscapeComponent
                elements={elements}
                style={{ width: '100%', height: 'calc(100% - 50px)' }}
                layout={layout}
                stylesheet={styleSheet}
                userZoomingEnabled={true}
                maxZoom={3}
                minZoom={0.5}
            />
        </div>
    )
}

export default CytoscapeGraph
