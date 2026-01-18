import { useState, useCallback } from 'react'
import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    MarkerType
} from 'reactflow'
import 'reactflow/dist/style.css'
import './ContractRelationHub.css'

// 카테고리 색상 정의
const categoryColors = {
    people: { main: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
    assets: { main: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
    period: { main: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
    legal: { main: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
    organization: { main: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
}

// 섹션 그룹 노드 (배경)
const sectionNodes = [
    {
        id: 'section-people',
        position: { x: 0, y: 0 },
        data: { label: 'People 사람' },
        style: {
            width: 300,
            height: 150,
            background: categoryColors.people.bg,
            border: `2px dashed ${categoryColors.people.main}`,
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
            color: categoryColors.people.main,
            padding: 8,
        },
        draggable: false,
    },
    {
        id: 'section-assets',
        position: { x: 320, y: 0 },
        data: { label: 'Assets 자산' },
        style: {
            width: 320,
            height: 220,
            background: categoryColors.assets.bg,
            border: `2px dashed ${categoryColors.assets.main}`,
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
            color: categoryColors.assets.main,
            padding: 8,
        },
        draggable: false,
    },
    {
        id: 'section-period',
        position: { x: 660, y: 0 },
        data: { label: 'Period 기간' },
        style: {
            width: 180,
            height: 220,
            background: categoryColors.period.bg,
            border: `2px dashed ${categoryColors.period.main}`,
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
            color: categoryColors.period.main,
            padding: 8,
        },
        draggable: false,
    },
    {
        id: 'section-legal',
        position: { x: 0, y: 240 },
        data: { label: 'Legal 법적 조건' },
        style: {
            width: 380,
            height: 130,
            background: categoryColors.legal.bg,
            border: `2px dashed ${categoryColors.legal.main}`,
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
            color: categoryColors.legal.main,
            padding: 8,
        },
        draggable: false,
    },
    {
        id: 'section-org',
        position: { x: 400, y: 240 },
        data: { label: 'Organization 기관' },
        style: {
            width: 280,
            height: 130,
            background: categoryColors.organization.bg,
            border: `2px dashed ${categoryColors.organization.main}`,
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
            color: categoryColors.organization.main,
            padding: 8,
        },
        draggable: false,
    },
]

// 개체 노드 생성
const createEntityNodes = (contractData) => {
    const data = contractData || {}

    return [
        // People
        {
            id: 'landlord',
            position: { x: 40, y: 55 },
            data: { label: <div className="entity-node orange"><span className="role">임대인(갑)</span><span className="value">{data.landlord || '김철수'}</span></div> },
            style: { background: '#fed7aa', border: '2px solid #f97316', borderRadius: 6, padding: 0 },
        },
        {
            id: 'tenant',
            position: { x: 170, y: 55 },
            data: { label: <div className="entity-node orange"><span className="role">임차인(을)</span><span className="value">{data.tenant || '이영희'}</span></div> },
            style: { background: '#fed7aa', border: '2px solid #f97316', borderRadius: 6, padding: 0 },
        },

        // Assets
        {
            id: 'location',
            position: { x: 350, y: 45 },
            data: { label: <div className="entity-node yellow"><span className="role">소재지</span><span className="value">강남구 테헤란로 123</span></div> },
            style: { background: '#fef08a', border: '2px solid #eab308', borderRadius: 6, padding: 0 },
        },
        {
            id: 'building',
            position: { x: 510, y: 45 },
            data: { label: <div className="entity-node yellow"><span className="role">건물</span><span className="value">삼성아파트 1502호</span></div> },
            style: { background: '#fef08a', border: '2px solid #eab308', borderRadius: 6, padding: 0 },
        },
        {
            id: 'deposit',
            position: { x: 430, y: 140 },
            data: { label: <div className="entity-node deposit"><span className="role">보증금</span><span className="value">3.5억원</span></div> },
            style: { background: '#fb923c', border: '2px solid #ea580c', borderRadius: 6, padding: 0, color: 'white' },
        },

        // Period
        {
            id: 'start-date',
            position: { x: 690, y: 45 },
            data: { label: <div className="entity-node purple"><span className="role">시작일</span><span className="value">2025.01.15</span></div> },
            style: { background: '#c4b5fd', border: '2px solid #8b5cf6', borderRadius: 6, padding: 0 },
        },
        {
            id: 'duration',
            position: { x: 690, y: 105 },
            data: { label: <div className="entity-node duration"><span className="role">기간</span><span className="value">24개월</span></div> },
            style: { background: '#fbbf24', border: '2px solid #f59e0b', borderRadius: 6, padding: 0 },
        },
        {
            id: 'end-date',
            position: { x: 690, y: 165 },
            data: { label: <div className="entity-node purple"><span className="role">종료일</span><span className="value">2027.01.14</span></div> },
            style: { background: '#c4b5fd', border: '2px solid #8b5cf6', borderRadius: 6, padding: 0 },
        },

        // Legal
        {
            id: 'obligation',
            position: { x: 30, y: 290 },
            data: { label: <div className="entity-node pink"><span className="role">임차인 의무</span><span className="value">금지조항 3건</span></div> },
            style: { background: '#fbcfe8', border: '2px solid #ec4899', borderRadius: 6, padding: 0 },
        },
        {
            id: 'condition',
            position: { x: 155, y: 290 },
            data: { label: <div className="entity-node pink"><span className="role">해지조건</span><span className="value">2기 연체시</span></div> },
            style: { background: '#fbcfe8', border: '2px solid #ec4899', borderRadius: 6, padding: 0 },
        },
        {
            id: 'right',
            position: { x: 270, y: 290 },
            data: { label: <div className="entity-node pink-dark"><span className="role">임대인 권리</span><span className="value">계약 해지권</span></div> },
            style: { background: '#ec4899', border: '2px solid #db2777', borderRadius: 6, padding: 0, color: 'white' },
        },

        // Organization
        {
            id: 'agency',
            position: { x: 430, y: 290 },
            data: { label: <div className="entity-node green"><span className="role">중개사무소</span><span className="value">행복공인중개사</span></div> },
            style: { background: '#a7f3d0', border: '2px solid #10b981', borderRadius: 6, padding: 0 },
        },
        {
            id: 'broker',
            position: { x: 565, y: 290 },
            data: { label: <div className="entity-node green"><span className="role">대표</span><span className="value">{data.broker || '박중개'}</span></div> },
            style: { background: '#a7f3d0', border: '2px solid #10b981', borderRadius: 6, padding: 0 },
        },
    ]
}

// 엣지 정의
const initialEdges = [
    // People <-> Assets
    { id: 'e1', source: 'landlord', target: 'location', label: '소유', type: 'smoothstep', style: { stroke: '#94a3b8' }, labelStyle: { fontSize: 9 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } },
    { id: 'e2', source: 'tenant', target: 'deposit', label: '지급', type: 'smoothstep', style: { stroke: '#94a3b8' }, labelStyle: { fontSize: 9 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } },
    { id: 'e3', source: 'deposit', target: 'landlord', label: '수령', type: 'smoothstep', style: { stroke: '#22c55e' }, labelStyle: { fontSize: 9 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' } },
    { id: 'e4', source: 'location', target: 'building', label: '포함', type: 'smoothstep', style: { stroke: '#94a3b8' }, labelStyle: { fontSize: 9 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } },

    // Period connections
    { id: 'e5', source: 'start-date', target: 'duration', type: 'smoothstep', style: { stroke: '#94a3b8' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } },
    { id: 'e6', source: 'duration', target: 'end-date', type: 'smoothstep', style: { stroke: '#94a3b8' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } },

    // Legal connections
    { id: 'e7', source: 'tenant', target: 'obligation', label: '준수의무', type: 'smoothstep', style: { stroke: '#94a3b8', strokeDasharray: '5,5' }, labelStyle: { fontSize: 9 } },
    { id: 'e8', source: 'condition', target: 'right', label: '발생시', type: 'smoothstep', style: { stroke: '#94a3b8' }, labelStyle: { fontSize: 9 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } },
    { id: 'e9', source: 'landlord', target: 'right', label: '행사가능', type: 'smoothstep', style: { stroke: '#94a3b8', strokeDasharray: '5,5' }, labelStyle: { fontSize: 9 } },

    // Organization connections
    { id: 'e10', source: 'agency', target: 'broker', label: '대표', type: 'smoothstep', style: { stroke: '#94a3b8' }, labelStyle: { fontSize: 9 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } },
    { id: 'e11', source: 'agency', target: 'landlord', label: '중개', type: 'smoothstep', style: { stroke: '#94a3b8', strokeDasharray: '5,5' }, labelStyle: { fontSize: 9 } },
    { id: 'e12', source: 'agency', target: 'tenant', label: '중개', type: 'smoothstep', style: { stroke: '#94a3b8', strokeDasharray: '5,5' }, labelStyle: { fontSize: 9 } },
]

function ContractRelationHub({ contractData }) {
    const allNodes = [...sectionNodes, ...createEntityNodes(contractData)]
    const [nodes, setNodes, onNodesChange] = useNodesState(allNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    const resetLayout = useCallback(() => {
        setNodes([...sectionNodes, ...createEntityNodes(contractData)])
        setEdges(initialEdges)
    }, [setNodes, setEdges, contractData])

    return (
        <div className="relation-hub-graph">
            <div className="graph-controls">
                <button className="reset-btn" onClick={resetLayout}>
                    초기화
                </button>
                <span className="hint">노드 드래그로 위치 조정 가능</span>
            </div>
            <div className="graph-container">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                    attributionPosition="bottom-left"
                    minZoom={0.3}
                    maxZoom={1.5}
                >
                    <Controls position="bottom-right" showInteractive={false} />
                    <Background variant="dots" gap={16} size={1} />
                </ReactFlow>
            </div>
            <div className="graph-legend">
                <span className="legend-item"><span className="dot" style={{ background: '#3b82f6' }}></span>사람</span>
                <span className="legend-item"><span className="dot" style={{ background: '#f59e0b' }}></span>자산</span>
                <span className="legend-item"><span className="dot" style={{ background: '#8b5cf6' }}></span>기간</span>
                <span className="legend-item"><span className="dot" style={{ background: '#ec4899' }}></span>법적조건</span>
                <span className="legend-item"><span className="dot" style={{ background: '#10b981' }}></span>기관</span>
            </div>
        </div>
    )
}

export default ContractRelationHub
