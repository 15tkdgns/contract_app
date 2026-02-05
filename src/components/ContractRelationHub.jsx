import { useState, useCallback, useMemo } from 'react'
import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    MarkerType
} from 'reactflow'
import 'reactflow/dist/style.css'
import './ContractRelationHub.css'

// 스키마 및 유틸리티 임포트
import { NODE_STYLES, EDGE_STYLES } from '../schemas/graphSchema'
import { buildCompleteGraph } from '../schemas/baseGraphTemplate'
import { formatMoney, getNodeStyle, getEdgeStyle } from '../utils/graphUtils'

// AI 엔티티를 React Flow 노드로 변환
const createNodesFromSchema = (graphData) => {
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
        return []
    }

    // 엔티티 타입별 그룹화 및 레이아웃 계산
    const groups = {}
    graphData.nodes.forEach((node, index) => {
        const type = node.type || 'person'
        if (!groups[type]) groups[type] = []
        groups[type].push({ ...node, index })
    })

    const result = []
    let yOffset = 0
    const groupOrder = ['person', 'property', 'money', 'date', 'right', 'institution', 'contract']

    groupOrder.forEach(type => {
        const items = groups[type]
        if (!items) return

        const style = NODE_STYLES[type] || NODE_STYLES.person

        items.forEach((node, idx) => {
            const isRisk = node.isRisk || style.isRisk

            result.push({
                id: node.id,
                position: { x: 50 + (idx * 200), y: yOffset + 50 },
                data: {
                    label: (
                        <div className={`kb-node ${isRisk ? 'kb-node-risk' : ''}`}>
                            <span className="kb-node-icon">{style.icon}</span>
                            <span className="kb-node-type">{node.label}</span>
                            <span className="kb-node-value">
                                {node.type === 'money' ? formatMoney(node.value) : (node.value || node.id)}
                            </span>
                        </div>
                    ),
                    properties: node.properties || {}
                },
                style: {
                    background: style.bg,
                    border: `2px ${isRisk ? 'dashed' : 'solid'} ${style.border}`,
                    borderRadius: 12,
                    padding: 0,
                    minWidth: 140,
                    boxShadow: isRisk ? `0 0 12px ${style.color}40` : 'none'
                }
            })
        })
        yOffset += 130
    })

    return result
}

// 스키마 관계를 React Flow 엣지로 변환
const createEdgesFromSchema = (graphData) => {
    if (!graphData || !graphData.edges || graphData.edges.length === 0) {
        return []
    }

    return graphData.edges.map((edge) => {
        const style = EDGE_STYLES[edge.type] || EDGE_STYLES.owns
        const isRisk = edge.isRisk || style.isRisk

        return {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.label || style.label,
            type: 'smoothstep',
            animated: isRisk || style.animated,
            style: {
                stroke: style.stroke,
                strokeWidth: style.width,
                strokeDasharray: style.style === 'dashed' ? '8,4' :
                    style.style === 'dotted' ? '3,3' : 'none'
            },
            labelStyle: {
                fontSize: 11,
                fontWeight: 600,
                fill: style.stroke
            },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: style.stroke,
                width: 20,
                height: 20
            }
        }
    })
}

// 폴백용 기본 그래프 생성 (스키마 기반)
const createDefaultGraph = (contractData) => {
    return buildCompleteGraph(contractData || {}, {})
}

function ContractRelationHub({ contractData, entities, relations, analysisResult }) {
    // 스키마 기반 그래프 생성
    const graphData = useMemo(() => {
        // 1순위: AI entities/relations 데이터가 있으면 사용
        if (entities && entities.length > 0) {
            return { nodes: entities, edges: relations || [] }
        }

        // 2순위: contractData + analysisResult로 스키마 기반 그래프 생성
        if (contractData) {
            return buildCompleteGraph(contractData, analysisResult || {})
        }

        // 3순위: 빈 기본 그래프
        return createDefaultGraph({})
    }, [contractData, entities, relations, analysisResult])

    const initialNodes = useMemo(() => {
        const nodes = createNodesFromSchema(graphData)
        return nodes.length > 0 ? nodes : createNodesFromSchema(createDefaultGraph(contractData))
    }, [graphData, contractData])

    const initialEdges = useMemo(() => {
        const edges = createEdgesFromSchema(graphData)
        return edges.length > 0 ? edges : createEdgesFromSchema(createDefaultGraph(contractData))
    }, [graphData, contractData])

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    const resetLayout = useCallback(() => {
        setNodes(initialNodes)
        setEdges(initialEdges)
    }, [setNodes, setEdges, initialNodes, initialEdges])

    return (
        <div className="relation-hub-graph">
            <div className="graph-header">
                <h3 className="graph-title">계약 관계도</h3>
                <span className="graph-badge">Knowledge Graph</span>
            </div>
            <div className="graph-controls">
                <button className="reset-btn" onClick={resetLayout}>
                    초기화
                </button>
                <span className="hint">노드 드래그로 위치 조정</span>
            </div>
            <div className="graph-container">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                    attributionPosition="bottom-left"
                    minZoom={0.5}
                    maxZoom={2}
                >
                    <Controls position="bottom-right" showInteractive={false} />
                    <Background variant="dots" gap={20} size={1} />
                </ReactFlow>
            </div>
            <div className="graph-legend">
                <span className="legend-item"><span className="dot" style={{ background: NODE_STYLES.person.color }}></span>사람</span>
                <span className="legend-item"><span className="dot" style={{ background: NODE_STYLES.property.color }}></span>부동산</span>
                <span className="legend-item"><span className="dot" style={{ background: NODE_STYLES.money.color }}></span>금액</span>
                <span className="legend-item"><span className="dot" style={{ background: NODE_STYLES.right.color }}></span>권리</span>
                <span className="legend-item"><span className="dot" style={{ background: NODE_STYLES.institution.color }}></span>기관</span>
            </div>
        </div>
    )
}

export default ContractRelationHub
