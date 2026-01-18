import React, { useState, useCallback } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    useReactFlow,
    ReactFlowProvider,
    MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './ContractTextGraph.css';

const ContractTextGraph = () => {
    const [activeView, setActiveView] = useState('graph');
    const [selectedEntity, setSelectedEntity] = useState(null);

    // 계약서 샘플 텍스트
    const contractText = `
본 임대차계약서는 임대인 김철수(이하 "갑"이라 함)와 임차인 이영희(이하 "을"이라 함) 간에 아래와 같이 체결한다.

제1조 (목적물의 표시)
소재지: 서울특별시 강남구 테헤란로 123, 삼성아파트 101동 1502호
면적: 전용면적 84.9㎡ (25.7평)
용도: 주거용

제2조 (보증금 및 차임)
보증금: 금 삼억오천만원정 (₩350,000,000)
계약금: 금 삼천오백만원정 (₩35,000,000)은 계약시에 지불하고
잔금: 금 삼억일천오백만원정 (₩315,000,000)은 2025년 1월 15일에 지불한다.

제3조 (임대차기간)
임대차기간은 2025년 1월 15일부터 2027년 1월 14일까지 24개월로 한다.

제4조 (용도변경 및 전대금지)
을은 갑의 동의 없이 위 부동산의 용도나 구조를 변경하거나 전대, 임차권 양도를 하지 못한다.

제5조 (계약의 해지)
을이 2기의 차임을 연체하거나 제4조를 위반한 때에는 갑은 즉시 본 계약을 해지할 수 있다.

중개사무소: 행복공인중개사사무소
대표: 박중개
등록번호: 제12345호
    `.trim();

    // 추출된 개체명 (NER 결과 시뮬레이션) - 단순화된 구조
    const entities = [
        // 사람 (People) - 핵심 당사자만
        { id: 'e1', text: '김철수', type: 'PERSON', category: 'people', role: '임대인(갑)', color: '#3b82f6' },
        { id: 'e2', text: '이영희', type: 'PERSON', category: 'people', role: '임차인(을)', color: '#3b82f6' },

        // 자산 (Assets) - 핵심 정보만
        { id: 'e3', text: '강남구 테헤란로 123', type: 'LOCATION', category: 'assets', role: '소재지', color: '#f59e0b' },
        { id: 'e4', text: '삼성아파트 1502호', type: 'PROPERTY', category: 'assets', role: '건물', color: '#f59e0b' },
        { id: 'e5', text: '3.5억원', type: 'MONEY', category: 'assets', role: '보증금', color: '#f59e0b' },

        // 기간 (Period)
        { id: 'e8', text: '2025.01.15', type: 'DATE', category: 'period', role: '시작일', color: '#8b5cf6' },
        { id: 'e9', text: '2027.01.14', type: 'DATE', category: 'period', role: '종료일', color: '#8b5cf6' },
        { id: 'e10', text: '24개월', type: 'DURATION', category: 'period', role: '기간', color: '#8b5cf6' },

        // 법적 조건 (Legal) - 통합된 금지조항
        { id: 'e14', text: '금지조항 3건', type: 'CLAUSE', category: 'legal', role: '임차인 의무', color: '#dc2626' },
        { id: 'e17', text: '2기 연체시', type: 'CONDITION', category: 'legal', role: '해지조건', color: '#dc2626' },
        { id: 'e18', text: '계약 해지권', type: 'ACTION', category: 'legal', role: '임대인 권리', color: '#dc2626' },

        // 기관 (Organization)
        { id: 'e12', text: '행복공인중개사', type: 'ORG', category: 'organization', role: '중개사무소', color: '#ec4899' },
        { id: 'e13', text: '박중개', type: 'PERSON', category: 'organization', role: '대표', color: '#ec4899' },
    ];

    // 개체 간 관계 정의 - 단순화 (중복 제거)
    const relations = [
        // 핵심 계약 관계
        { source: 'e1', target: 'e3', label: '소유', category: 'ownership' },
        { source: 'e2', target: 'e3', label: '임차', category: 'contract' },
        { source: 'e3', target: 'e4', label: '포함', category: 'location' },

        // 금전 관계 (단일 라인)
        { source: 'e2', target: 'e5', label: '지급', category: 'transaction' },
        { source: 'e1', target: 'e5', label: '수령', category: 'transaction' },

        // 기간 관계 (단순화)
        { source: 'e8', target: 'e10', label: '', category: 'duration' },
        { source: 'e10', target: 'e9', label: '', category: 'duration' },

        // 법적 관계 (통합)
        { source: 'e2', target: 'e14', label: '준수의무', category: 'obligation' },
        { source: 'e17', target: 'e18', label: '발생시', category: 'condition' },
        { source: 'e1', target: 'e18', label: '행사가능', category: 'right' },

        // 중개 관계 (단일 라인으로 통합)
        { source: 'e12', target: 'e13', label: '대표', category: 'organization' },
        { source: 'e12', target: 'e1', label: '중개', category: 'service' },
        { source: 'e12', target: 'e2', label: '중개', category: 'service' },
    ];

    // React Flow용 노드 생성 (카테고리별 섹션 배치)
    const generateNodes = () => {
        // 카테고리 색상 정의
        const categoryColors = {
            people: { main: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
            assets: { main: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
            period: { main: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
            legal: { main: '#dc2626', bg: 'rgba(220, 38, 38, 0.15)' },
            organization: { main: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
        };

        // 섹션 그룹 노드 (배경 역할) - 더 큰 크기
        const sectionNodes = [
            {
                id: 'section-people',
                position: { x: 0, y: 0 },
                data: { label: 'People 사람' },
                style: {
                    width: 420,
                    height: 200,
                    background: categoryColors.people.bg,
                    border: `3px dashed ${categoryColors.people.main}`,
                    borderRadius: '16px',
                    fontSize: '18px',
                    fontWeight: '700',
                    color: categoryColors.people.main,
                    padding: '16px',
                },
                draggable: false,
            },
            {
                id: 'section-assets',
                position: { x: 450, y: 0 },
                data: { label: 'Assets 자산' },
                style: {
                    width: 550,
                    height: 320,
                    background: categoryColors.assets.bg,
                    border: `3px dashed ${categoryColors.assets.main}`,
                    borderRadius: '16px',
                    fontSize: '18px',
                    fontWeight: '700',
                    color: categoryColors.assets.main,
                    padding: '16px',
                },
                draggable: false,
            },
            {
                id: 'section-period',
                position: { x: 1030, y: 0 },
                data: { label: 'Period 기간' },
                style: {
                    width: 280,
                    height: 320,
                    background: categoryColors.period.bg,
                    border: `3px dashed ${categoryColors.period.main}`,
                    borderRadius: '16px',
                    fontSize: '18px',
                    fontWeight: '700',
                    color: categoryColors.period.main,
                    padding: '16px',
                },
                draggable: false,
            },
            {
                id: 'section-legal',
                position: { x: 0, y: 350 },
                data: { label: 'Legal 법적 조건' },
                style: {
                    width: 550,
                    height: 200,
                    background: categoryColors.legal.bg,
                    border: `3px dashed ${categoryColors.legal.main}`,
                    borderRadius: '16px',
                    fontSize: '18px',
                    fontWeight: '700',
                    color: categoryColors.legal.main,
                    padding: '16px',
                },
                draggable: false,
            },
            {
                id: 'section-org',
                position: { x: 580, y: 350 },
                data: { label: 'Organization 기관' },
                style: {
                    width: 400,
                    height: 200,
                    background: categoryColors.organization.bg,
                    border: `3px dashed ${categoryColors.organization.main}`,
                    borderRadius: '16px',
                    fontSize: '18px',
                    fontWeight: '700',
                    color: categoryColors.organization.main,
                    padding: '16px',
                },
                draggable: false,
            },
        ];

        // 카테고리별 노드 위치 (간격 증가)
        const nodePositions = {
            // 사람 섹션 - 2명
            'e1': { x: 60, y: 80 },
            'e2': { x: 250, y: 80 },

            // 자산 섹션 - 3개
            'e3': { x: 490, y: 70 },
            'e4': { x: 680, y: 70 },
            'e5': { x: 585, y: 190 },

            // 기간 섹션 - 3개
            'e8': { x: 1080, y: 70 },
            'e10': { x: 1080, y: 160 },
            'e9': { x: 1080, y: 250 },

            // 법적 조건 섹션 - 3개
            'e14': { x: 70, y: 420 },
            'e17': { x: 250, y: 420 },
            'e18': { x: 430, y: 420 },

            // 기관 섹션 - 2개
            'e12': { x: 650, y: 420 },
            'e13': { x: 840, y: 420 },
        };

        // 카테고리별 노드 색상 매핑
        const getCategoryColor = (category) => {
            return categoryColors[category]?.main || '#6b7280';
        };

        const entityNodes = entities.map(entity => {
            const catColor = getCategoryColor(entity.category);
            return {
                id: entity.id,
                position: nodePositions[entity.id] || { x: 0, y: 0 },
                data: {
                    label: (
                        <div className="entity-node" style={{ borderColor: catColor }}>
                            <span className="entity-type" style={{ backgroundColor: catColor }}>
                                {entity.role}
                            </span>
                            <span className="entity-text">{entity.text}</span>
                        </div>
                    )
                },
                style: {
                    background: 'white',
                    border: `2px solid ${catColor}`,
                    borderRadius: '8px',
                    padding: 0,
                    zIndex: 10,
                    boxShadow: `0 2px 8px ${catColor}30`,
                }
            };
        });

        return [...sectionNodes, ...entityNodes];
    };

    // React Flow용 엣지 생성
    const generateEdges = () => {
        return relations.map((rel, idx) => ({
            id: `edge-${idx}`,
            source: rel.source,
            target: rel.target,
            label: rel.label,
            type: 'smoothstep',
            animated: rel.category === 'condition',
            style: { stroke: '#94a3b8' },
            labelStyle: { fontSize: 11, fill: '#64748b' },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#94a3b8',
            },
        }));
    };

    const [nodes, setNodes, onNodesChange] = useNodesState(generateNodes());
    const [edges, setEdges, onEdgesChange] = useEdgesState(generateEdges());

    // 레이아웃 초기화 함수
    const resetLayout = useCallback(() => {
        setNodes(generateNodes());
        setEdges(generateEdges());
    }, [setNodes, setEdges]);

    // 텍스트 하이라이팅
    const highlightText = (text) => {
        let result = text;
        const sortedEntities = [...entities].sort((a, b) => b.text.length - a.text.length);

        sortedEntities.forEach(entity => {
            const regex = new RegExp(`(${entity.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');
            result = result.replace(regex, `<mark class="highlight" style="background-color: ${entity.color}20; border-bottom: 2px solid ${entity.color}; padding: 2px 4px; border-radius: 3px;" data-entity="${entity.id}" data-type="${entity.type}">${entity.text}</mark>`);
        });

        return result;
    };

    // 의미 카테고리 정의
    const semanticCategories = [
        {
            category: 'people',
            label: '사람',
            color: '#6366f1',
            description: '계약 당사자 및 관계자'
        },
        {
            category: 'assets',
            label: '자산',
            color: '#6366f1',
            description: '부동산, 금액, 면적 정보'
        },
        {
            category: 'period',
            label: '기간',
            color: '#6366f1',
            description: '날짜 및 계약 기간'
        },
        {
            category: 'legal',
            label: '법적 조건',
            color: '#6366f1',
            description: '의무, 금지사항, 해지조건'
        },
        {
            category: 'organization',
            label: '기관',
            color: '#6366f1',
            description: '중개사무소 등 기관 정보'
        },
    ];

    return (
        <div className="contract-text-graph card">
            <div className="card-header">
                <div className="card-icon graph-bg">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                </div>
                <h3 className="card-title">계약서 텍스트 관계 분석</h3>
                <span className="demo-badge">NER DEMO</span>
            </div>

            <div className="view-tabs">
                <button
                    className={`view-tab ${activeView === 'graph' ? 'active' : ''}`}
                    onClick={() => setActiveView('graph')}
                >
                    관계 그래프
                </button>
                <button
                    className={`view-tab ${activeView === 'text' ? 'active' : ''}`}
                    onClick={() => setActiveView('text')}
                >
                    텍스트 분석
                </button>
                <button
                    className={`view-tab ${activeView === 'entities' ? 'active' : ''}`}
                    onClick={() => setActiveView('entities')}
                >
                    개체 목록
                </button>
            </div>

            <div className="entity-legend">
                {semanticCategories.map(cat => (
                    <div key={cat.category} className="legend-item" title={cat.description}>
                        <span className="legend-dot" style={{ backgroundColor: cat.color }}></span>
                        <span>{cat.label}</span>
                    </div>
                ))}
            </div>

            <div className="graph-content">
                {activeView === 'graph' && (
                    <div className="graph-wrapper">
                        <div className="graph-controls">
                            <button className="graph-btn" onClick={resetLayout} title="레이아웃 초기화">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                    <path d="M3 3v5h5" />
                                </svg>
                                초기화
                            </button>
                            <span className="graph-hint">노드를 드래그하여 위치를 조정할 수 있습니다</span>
                        </div>
                        <div className="graph-container" style={{ height: 550 }}>
                            <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                fitView
                                attributionPosition="bottom-left"
                            >
                                <Controls />
                                <MiniMap
                                    nodeColor={() => '#6366f1'}
                                    maskColor="rgba(0, 0, 0, 0.1)"
                                />
                                <Background variant="dots" gap={20} size={1} />
                            </ReactFlow>
                        </div>
                    </div>
                )}

                {activeView === 'text' && (
                    <div className="text-analysis">
                        <div
                            className="highlighted-text"
                            dangerouslySetInnerHTML={{ __html: highlightText(contractText) }}
                        />
                        <div className="analysis-info">
                            <p>총 {entities.length}개의 개체가 인식되었습니다.</p>
                            <p>마우스를 올리면 개체 정보를 볼 수 있습니다.</p>
                        </div>
                    </div>
                )}

                {activeView === 'entities' && (
                    <div className="entities-list">
                        {semanticCategories.map(cat => {
                            const categoryEntities = entities.filter(e => e.category === cat.category);
                            if (categoryEntities.length === 0) return null;

                            return (
                                <div key={cat.category} className="entity-group">
                                    <h4 style={{ color: cat.color }}>
                                        <span className="group-dot" style={{ backgroundColor: cat.color }}></span>
                                        {cat.label} ({categoryEntities.length})
                                    </h4>
                                    <p className="group-desc">{cat.description}</p>
                                    <div className="entity-items">
                                        {categoryEntities.map(entity => (
                                            <div
                                                key={entity.id}
                                                className="entity-item"
                                                style={{ borderLeftColor: entity.color }}
                                            >
                                                <span className="entity-role">{entity.role}</span>
                                                <span className="entity-value">{entity.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="graph-footer">
                <p>* 개체명 인식(NER)과 관계 추출을 통해 계약서 내 핵심 정보를 시각화합니다.</p>
            </div>
        </div>
    );
};

export default ContractTextGraph;
