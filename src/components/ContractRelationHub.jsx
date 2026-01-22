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

// 엔티티 타입별 색상 정의
const entityColors = {
    person: { main: '#3b82f6', bg: '#dbeafe', border: '#2563eb' },
    organization: { main: '#10b981', bg: '#d1fae5', border: '#059669' },
    asset: { main: '#f59e0b', bg: '#fef3c7', border: '#d97706' },
    money: { main: '#ef4444', bg: '#fee2e2', border: '#dc2626' },
    date: { main: '#8b5cf6', bg: '#ede9fe', border: '#7c3aed' },
    location: { main: '#06b6d4', bg: '#cffafe', border: '#0891b2' },
    default: { main: '#6b7280', bg: '#f3f4f6', border: '#4b5563' }
}

// 관계 타입별 스타일
const relationStyles = {
    owns: { stroke: '#22c55e', label: '소유' },
    pays: { stroke: '#ef4444', label: '지급' },
    receives: { stroke: '#3b82f6', label: '수령' },
    resides: { stroke: '#f59e0b', label: '거주' },
    guarantees: { stroke: '#8b5cf6', label: '보증' },
    mediates: { stroke: '#10b981', label: '중개' },
    default: { stroke: '#94a3b8', label: '' }
}

// AI 엔티티를 React Flow 노드로 변환
const createNodesFromEntities = (entities = []) => {
    if (!entities || entities.length === 0) {
        return createDefaultNodes()
    }

    // 엔티티 타입별 그룹화
    const groups = {}
    entities.forEach((entity, index) => {
        const type = entity.type || 'default'
        if (!groups[type]) groups[type] = []
        groups[type].push({ ...entity, index })
    })

    const nodes = []
    let yOffset = 0

    Object.entries(groups).forEach(([type, items]) => {
        const color = entityColors[type] || entityColors.default

        items.forEach((entity, idx) => {
            nodes.push({
                id: entity.id,
                position: { x: 50 + (idx * 180), y: yOffset + 50 },
                data: {
                    label: (
                        <div className="kb-node">
                            <span className="kb-node-type">{entity.name || type}</span>
                            <span className="kb-node-value">{entity.value || entity.id}</span>
                        </div>
                    )
                },
                style: {
                    background: color.bg,
                    border: `2px solid ${color.border}`,
                    borderRadius: 8,
                    padding: 0,
                    minWidth: 120
                }
            })
        })
        yOffset += 120
    })

    return nodes
}

// AI 관계를 React Flow 엣지로 변환
const createEdgesFromRelations = (relations = []) => {
    if (!relations || relations.length === 0) {
        return createDefaultEdges()
    }

    return relations.map((rel, idx) => {
        const style = relationStyles[rel.type] || relationStyles.default
        return {
            id: `e-${idx}`,
            source: rel.source,
            target: rel.target,
            label: rel.label || style.label,
            type: 'smoothstep',
            style: { stroke: style.stroke, strokeWidth: 2 },
            labelStyle: { fontSize: 10, fontWeight: 500 },
            markerEnd: { type: MarkerType.ArrowClosed, color: style.stroke }
        }
    })
}

// 기본 노드 (AI 데이터 없을 때 폴백)
const createDefaultNodes = () => [
    { id: 'landlord', position: { x: 50, y: 50 }, data: { label: <div className="kb-node"><span className="kb-node-type">임대인</span><span className="kb-node-value">정보 없음</span></div> }, style: { background: entityColors.person.bg, border: `2px solid ${entityColors.person.border}`, borderRadius: 8 } },
    { id: 'tenant', position: { x: 230, y: 50 }, data: { label: <div className="kb-node"><span className="kb-node-type">임차인</span><span className="kb-node-value">정보 없음</span></div> }, style: { background: entityColors.person.bg, border: `2px solid ${entityColors.person.border}`, borderRadius: 8 } },
    { id: 'property', position: { x: 140, y: 170 }, data: { label: <div className="kb-node"><span className="kb-node-type">부동산</span><span className="kb-node-value">정보 없음</span></div> }, style: { background: entityColors.asset.bg, border: `2px solid ${entityColors.asset.border}`, borderRadius: 8 } },
    { id: 'deposit', position: { x: 50, y: 290 }, data: { label: <div className="kb-node"><span className="kb-node-type">보증금</span><span className="kb-node-value">정보 없음</span></div> }, style: { background: entityColors.money.bg, border: `2px solid ${entityColors.money.border}`, borderRadius: 8 } },
    { id: 'period', position: { x: 230, y: 290 }, data: { label: <div className="kb-node"><span className="kb-node-type">계약기간</span><span className="kb-node-value">정보 없음</span></div> }, style: { background: entityColors.date.bg, border: `2px solid ${entityColors.date.border}`, borderRadius: 8 } },
]

const createDefaultEdges = () => [
    { id: 'e1', source: 'landlord', target: 'property', label: '소유', type: 'smoothstep', style: { stroke: '#22c55e' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' } },
    { id: 'e2', source: 'tenant', target: 'deposit', label: '지급', type: 'smoothstep', style: { stroke: '#ef4444' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } },
    { id: 'e3', source: 'tenant', target: 'property', label: '임차', type: 'smoothstep', style: { stroke: '#f59e0b' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
]

function ContractRelationHub({ contractData, entities, relations }) {
    // AI 데이터가 있으면 동적 생성, 없으면 기존 데이터에서 생성
    const initialNodes = useMemo(() => {
        if (entities && entities.length > 0) {
            return createNodesFromEntities(entities)
        }
        // contractData가 있으면 그걸로 기본 노드 값 채우기
        if (contractData) {
            return [
                { id: 'landlord', position: { x: 50, y: 50 }, data: { label: <div className="kb-node"><span className="kb-node-type">임대인</span><span className="kb-node-value">{contractData.landlord || '미확인'}</span></div> }, style: { background: entityColors.person.bg, border: `2px solid ${entityColors.person.border}`, borderRadius: 8 } },
                { id: 'tenant', position: { x: 230, y: 50 }, data: { label: <div className="kb-node"><span className="kb-node-type">임차인</span><span className="kb-node-value">{contractData.tenant || '미확인'}</span></div> }, style: { background: entityColors.person.bg, border: `2px solid ${entityColors.person.border}`, borderRadius: 8 } },
                { id: 'property', position: { x: 140, y: 170 }, data: { label: <div className="kb-node"><span className="kb-node-type">부동산</span><span className="kb-node-value">{contractData.address || '미확인'}</span></div> }, style: { background: entityColors.asset.bg, border: `2px solid ${entityColors.asset.border}`, borderRadius: 8 } },
                { id: 'deposit', position: { x: 50, y: 290 }, data: { label: <div className="kb-node"><span className="kb-node-type">보증금</span><span className="kb-node-value">{contractData.deposit ? `${(contractData.deposit / 100000000).toFixed(1)}억원` : '미확인'}</span></div> }, style: { background: entityColors.money.bg, border: `2px solid ${entityColors.money.border}`, borderRadius: 8 } },
                { id: 'period', position: { x: 230, y: 290 }, data: { label: <div className="kb-node"><span className="kb-node-type">계약기간</span><span className="kb-node-value">{contractData.startDate && contractData.endDate ? `${contractData.startDate} ~ ${contractData.endDate}` : '미확인'}</span></div> }, style: { background: entityColors.date.bg, border: `2px solid ${entityColors.date.border}`, borderRadius: 8 } },
            ]
        }
        return createDefaultNodes()
    }, [entities, contractData])

    const initialEdges = useMemo(() => {
        if (relations && relations.length > 0) {
            return createEdgesFromRelations(relations)
        }
        return createDefaultEdges()
    }, [relations])

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    const resetLayout = useCallback(() => {
        setNodes(initialNodes)
        setEdges(initialEdges)
    }, [setNodes, setEdges, initialNodes, initialEdges])

    return (
        <div className="relation-hub-graph">
            <div className="graph-header">
                <h3 className="graph-title">Knowledge Graph</h3>
                <span className="graph-badge">AI 분석</span>
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
                <span className="legend-item"><span className="dot" style={{ background: entityColors.person.main }}></span>사람</span>
                <span className="legend-item"><span className="dot" style={{ background: entityColors.asset.main }}></span>자산</span>
                <span className="legend-item"><span className="dot" style={{ background: entityColors.money.main }}></span>금액</span>
                <span className="legend-item"><span className="dot" style={{ background: entityColors.date.main }}></span>기간</span>
                <span className="legend-item"><span className="dot" style={{ background: entityColors.organization.main }}></span>기관</span>
            </div>
        </div>
    )
}

export default ContractRelationHub
