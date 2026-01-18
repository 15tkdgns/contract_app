import React, { useMemo, useCallback, useState } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
    MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './ContractFlowchart.css';

// ========== 커스텀 노드 타입들 ==========

// 시작/종료 노드
const StartEndNode = ({ data }) => (
    <div className={`flow-node start-end ${data.type}`}>
        <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
        <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
        <span>{data.label}</span>
    </div>
);

// 프로세스 노드
const ProcessNode = ({ data }) => (
    <div className={`flow-node process ${data.status || ''}`}>
        <Handle type="target" position={Position.Top} id="top" style={{ opacity: 0 }} />
        <Handle type="target" position={Position.Left} id="left" style={{ opacity: 0 }} />
        <Handle type="target" position={Position.Right} id="right" style={{ opacity: 0 }} />
        <div className="node-content">
            {data.icon && <span className="node-icon">{data.icon}</span>}
            <span className="node-label">{data.label}</span>
            {data.sublabel && <span className="node-sublabel">{data.sublabel}</span>}
        </div>
        <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0 }} />
        <Handle type="source" position={Position.Left} id="left" style={{ opacity: 0 }} />
        <Handle type="source" position={Position.Right} id="right" style={{ opacity: 0 }} />
    </div>
);

// 분기점 (다이아몬드) 노드
const DecisionNode = ({ data }) => (
    <div className="flow-node decision">
        <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
        <div className="diamond-shape">
            <span>{data.label}</span>
        </div>
        <Handle type="source" position={Position.Bottom} id="yes" style={{ opacity: 0 }} />
        <Handle type="source" position={Position.Left} id="no-left" style={{ opacity: 0 }} />
        <Handle type="source" position={Position.Right} id="no-right" style={{ opacity: 0 }} />
    </div>
);

// 결과/상태 노드
const ResultNode = ({ data }) => (
    <div className={`flow-node result ${data.status}`}>
        <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
        <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
        <span>{data.label}</span>
    </div>
);

// 그룹/섹션 노드
const GroupNode = ({ data }) => (
    <div className="flow-node group-node">
        <span className="group-title">{data.label}</span>
    </div>
);

const nodeTypes = {
    startEnd: StartEndNode,
    process: ProcessNode,
    decision: DecisionNode,
    result: ResultNode,
    group: GroupNode,
};

// ========== 메인 계약 플로우 ==========
const MainContractFlow = () => {
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        const nodes = [
            // 시작
            { id: 'start', type: 'startEnd', position: { x: 350, y: 0 }, data: { label: '계약 시작', type: 'start' } },

            // Phase 1: 사전 조사
            { id: 'g1', type: 'group', position: { x: 50, y: 70 }, data: { label: '1단계: 사전 조사' } },
            { id: 'p1-1', type: 'process', position: { x: 150, y: 70 }, data: { label: '매물 탐색', sublabel: '부동산 앱/중개' } },
            { id: 'p1-2', type: 'process', position: { x: 320, y: 70 }, data: { label: '등기부등본 열람', sublabel: '인터넷등기소' } },
            { id: 'p1-3', type: 'process', position: { x: 520, y: 70 }, data: { label: '시세 확인', sublabel: 'KB/호갱노노' } },

            // 분기 1: 소유자 확인
            { id: 'd1', type: 'decision', position: { x: 350, y: 170 }, data: { label: '소유자 일치?' } },
            { id: 'r1-fail', type: 'result', position: { x: 550, y: 180 }, data: { label: '계약 중단', status: 'danger' } },

            // Phase 2: 계약 체결
            { id: 'g2', type: 'group', position: { x: 50, y: 280 }, data: { label: '2단계: 계약 체결' } },
            { id: 'p2-1', type: 'process', position: { x: 150, y: 280 }, data: { label: '계약서 작성', sublabel: '표준계약서' } },
            { id: 'p2-2', type: 'process', position: { x: 320, y: 280 }, data: { label: '특약사항 검토', sublabel: 'AI 위험분석', status: 'highlight' } },
            { id: 'p2-3', type: 'process', position: { x: 520, y: 280 }, data: { label: '계약금 지급', sublabel: '10%' } },

            // 분기 2: 전세가율 확인
            { id: 'd2', type: 'decision', position: { x: 350, y: 380 }, data: { label: '전세가율 80%' } },
            { id: 'r2-warn', type: 'result', position: { x: 550, y: 390 }, data: { label: '고위험 경고', status: 'warning' } },

            // Phase 3: 잔금/입주
            { id: 'g3', type: 'group', position: { x: 50, y: 490 }, data: { label: '3단계: 잔금 및 입주' } },
            { id: 'p3-1', type: 'process', position: { x: 150, y: 490 }, data: { label: '잔금 지급', sublabel: '90%' } },
            { id: 'p3-2', type: 'process', position: { x: 320, y: 490 }, data: { label: '전입신고', sublabel: '당일 필수', status: 'important' } },
            { id: 'p3-3', type: 'process', position: { x: 520, y: 490 }, data: { label: '확정일자', sublabel: '당일 필수', status: 'important' } },

            // 분기 3: 보증보험
            { id: 'd3', type: 'decision', position: { x: 350, y: 590 }, data: { label: '보증보험 가입?' } },
            { id: 'p3-4', type: 'process', position: { x: 120, y: 600 }, data: { label: 'HUG/SGI 가입', sublabel: '보증금 보호', status: 'safe' } },
            { id: 'r3-risk', type: 'result', position: { x: 550, y: 600 }, data: { label: '미가입 위험', status: 'warning' } },

            // 종료
            { id: 'end', type: 'startEnd', position: { x: 350, y: 700 }, data: { label: '입주 완료', type: 'end' } },
        ];

        const edges = [
            // 시작 → Phase 1 (수직)
            { id: 'e-s-p1-2', source: 'start', target: 'p1-2', type: 'smoothstep', style: { stroke: '#3b82f6', strokeWidth: 2 } },

            // Phase 1 수평 연결 (좌우)
            { id: 'e-p1-2-1', source: 'p1-2', target: 'p1-1', sourceHandle: 'left', targetHandle: 'right', type: 'smoothstep', style: { stroke: '#64748b', strokeWidth: 2 } },
            { id: 'e-p1-2-3', source: 'p1-2', target: 'p1-3', sourceHandle: 'right', targetHandle: 'left', type: 'smoothstep', style: { stroke: '#64748b', strokeWidth: 2 } },

            // Phase 1 → 분기점 (수직)
            { id: 'e-p1-2-d1', source: 'p1-2', target: 'd1', type: 'smoothstep', style: { stroke: '#64748b', strokeWidth: 2 } },

            // 분기 1
            {
                id: 'e-d1-fail', source: 'd1', target: 'r1-fail', sourceHandle: 'no-right', type: 'smoothstep',
                style: { stroke: '#ef4444', strokeWidth: 2 }, label: 'NO', labelStyle: { fill: '#ef4444', fontWeight: 600 }
            },
            {
                id: 'e-d1-p2', source: 'd1', target: 'p2-2', sourceHandle: 'yes', type: 'smoothstep',
                style: { stroke: '#22c55e', strokeWidth: 2 }, label: 'YES', labelStyle: { fill: '#22c55e', fontWeight: 600 }
            },

            // Phase 2 수평 연결 (좌우)
            { id: 'e-p2-2-1', source: 'p2-2', target: 'p2-1', sourceHandle: 'left', targetHandle: 'right', type: 'smoothstep', style: { stroke: '#64748b', strokeWidth: 2 } },
            { id: 'e-p2-2-3', source: 'p2-2', target: 'p2-3', sourceHandle: 'right', targetHandle: 'left', type: 'smoothstep', style: { stroke: '#64748b', strokeWidth: 2 } },

            // Phase 2 → 분기점 (수직)
            { id: 'e-p2-2-d2', source: 'p2-2', target: 'd2', type: 'smoothstep', style: { stroke: '#64748b', strokeWidth: 2 } },

            // 분기 2: 전세가율 - 초과(오른쪽), 이하(아래)
            {
                id: 'e-d2-warn', source: 'd2', target: 'r2-warn', sourceHandle: 'no-right', type: 'smoothstep',
                style: { stroke: '#f59e0b', strokeWidth: 2 }, label: '초과', labelStyle: { fill: '#f59e0b', fontWeight: 600 }
            },
            {
                id: 'e-d2-p3', source: 'd2', target: 'p3-2', sourceHandle: 'yes', type: 'smoothstep',
                style: { stroke: '#22c55e', strokeWidth: 2 }, label: '이하', labelStyle: { fill: '#22c55e', fontWeight: 600 }
            },

            // Phase 3 수평 연결 (좌우)
            { id: 'e-p3-2-1', source: 'p3-2', target: 'p3-1', sourceHandle: 'left', targetHandle: 'right', type: 'smoothstep', style: { stroke: '#64748b', strokeWidth: 2 } },
            { id: 'e-p3-2-3', source: 'p3-2', target: 'p3-3', sourceHandle: 'right', targetHandle: 'left', type: 'smoothstep', style: { stroke: '#64748b', strokeWidth: 2 } },

            // Phase 3 → 분기점 (수직)
            { id: 'e-p3-2-d3', source: 'p3-2', target: 'd3', type: 'smoothstep', style: { stroke: '#64748b', strokeWidth: 2 } },

            // 분기 3
            {
                id: 'e-d3-hug', source: 'd3', target: 'p3-4', sourceHandle: 'no-left', type: 'smoothstep',
                style: { stroke: '#22c55e', strokeWidth: 2 }, label: 'YES', labelStyle: { fill: '#22c55e', fontWeight: 600 }
            },
            {
                id: 'e-d3-risk', source: 'd3', target: 'r3-risk', sourceHandle: 'no-right', type: 'smoothstep',
                style: { stroke: '#f59e0b', strokeWidth: 2 }, label: 'NO', labelStyle: { fill: '#f59e0b', fontWeight: 600 }
            },

            // 종료
            { id: 'e-d3-end', source: 'd3', target: 'end', sourceHandle: 'yes', type: 'smoothstep', style: { stroke: '#22c55e', strokeWidth: 2 } },
        ];

        return { nodes, edges };
    }, []);

    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);

    return (
        <div className="rf-container large">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.5}
                maxZoom={1.5}
                proOptions={{ hideAttribution: true }}
            >
                <Background color="#e2e8f0" gap={20} />
                <Controls showInteractive={false} />
                <MiniMap
                    nodeColor={(node) => {
                        if (node.type === 'decision') return '#6366f1';
                        if (node.type === 'result') return '#ef4444';
                        return '#3b82f6';
                    }}
                    style={{ background: '#f8fafc' }}
                />
            </ReactFlow>
        </div>
    );
};

// ========== 채무불이행 플로우 ==========
const DefaultFlow = () => {
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        const nodes = [
            { id: 'df-start', type: 'startEnd', position: { x: 200, y: 0 }, data: { label: '채무 불이행 발생', type: 'warning' } },

            { id: 'df-1', type: 'process', position: { x: 200, y: 80 }, data: { label: '내용증명 발송', sublabel: '14일 이행 촉구' } },
            { id: 'df-d1', type: 'decision', position: { x: 200, y: 180 }, data: { label: '이행 여부?' } },

            { id: 'df-ok', type: 'result', position: { x: 50, y: 220 }, data: { label: '해결', status: 'safe' } },

            { id: 'df-2', type: 'process', position: { x: 350, y: 220 }, data: { label: '보증기관 청구', sublabel: 'HUG/SGI' } },
            { id: 'df-d2', type: 'decision', position: { x: 350, y: 320 }, data: { label: '보증 가입?' } },

            { id: 'df-insured', type: 'result', position: { x: 200, y: 360 }, data: { label: '보증금 수령', status: 'safe' } },

            { id: 'df-3', type: 'process', position: { x: 500, y: 360 }, data: { label: '임차권등기', sublabel: '이사 가능' } },
            { id: 'df-4', type: 'process', position: { x: 500, y: 440 }, data: { label: '민사소송', sublabel: '지급명령' } },
            { id: 'df-5', type: 'process', position: { x: 500, y: 520 }, data: { label: '강제집행', sublabel: '경매 배당', status: 'warning' } },
        ];

        const edges = [
            { id: 'df-e1', source: 'df-start', target: 'df-1', type: 'smoothstep', style: { stroke: '#ef4444', strokeWidth: 2 } },
            { id: 'df-e2', source: 'df-1', target: 'df-d1', type: 'smoothstep', style: { stroke: '#64748b', strokeWidth: 2 } },
            {
                id: 'df-e3', source: 'df-d1', target: 'df-ok', sourceHandle: 'no-left', type: 'smoothstep',
                style: { stroke: '#22c55e', strokeWidth: 2 }, label: 'YES'
            },
            {
                id: 'df-e4', source: 'df-d1', target: 'df-2', sourceHandle: 'no-right', type: 'smoothstep',
                style: { stroke: '#ef4444', strokeWidth: 2 }, label: 'NO'
            },
            { id: 'df-e5', source: 'df-2', target: 'df-d2', type: 'smoothstep', style: { stroke: '#64748b', strokeWidth: 2 } },
            {
                id: 'df-e6', source: 'df-d2', target: 'df-insured', sourceHandle: 'no-left', type: 'smoothstep',
                style: { stroke: '#22c55e', strokeWidth: 2 }, label: 'YES'
            },
            {
                id: 'df-e7', source: 'df-d2', target: 'df-3', sourceHandle: 'no-right', type: 'smoothstep',
                style: { stroke: '#f59e0b', strokeWidth: 2 }, label: 'NO'
            },
            { id: 'df-e8', source: 'df-3', target: 'df-4', type: 'smoothstep', style: { stroke: '#64748b', strokeWidth: 2 } },
            { id: 'df-e9', source: 'df-4', target: 'df-5', type: 'smoothstep', style: { stroke: '#64748b', strokeWidth: 2 } },
        ];

        return { nodes, edges };
    }, []);

    const [nodes] = useNodesState(initialNodes);
    const [edges] = useEdgesState(initialEdges);

    return (
        <div className="rf-container medium">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                panOnDrag={false}
                zoomOnScroll={false}
                nodesDraggable={false}
                proOptions={{ hideAttribution: true }}
            >
                <Background color="#fef2f2" gap={16} />
            </ReactFlow>
        </div>
    );
};

// ========== 인터랙티브 의사결정 위저드 ==========
const DecisionWizard = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});

    const steps = [
        { id: 'jeonse-ratio', question: '전세가율이 80% 이하인가요?', hint: '전세가율 = 보증금 / 시세 × 100' },
        { id: 'owner-match', question: '등기부상 소유자와 임대인이 일치하나요?', hint: '등기부등본에서 "갑구" 확인' },
        { id: 'mortgage', question: '근저당권 설정 금액이 감정가의 50% 이하인가요?', hint: '등기부등본 "을구" 확인' },
        { id: 'insurance', question: '전세보증금 반환보증에 가입 가능한가요?', hint: 'HUG, SGI, 보증보험 확인' },
    ];

    const handleAnswer = (answer) => {
        const newAnswers = { ...answers, [steps[currentStep].id]: answer };
        setAnswers(newAnswers);

        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const reset = () => {
        setCurrentStep(0);
        setAnswers({});
    };

    const getRiskScore = () => {
        let score = 0;
        if (answers['jeonse-ratio'] === 'yes') score += 25;
        if (answers['owner-match'] === 'yes') score += 30;
        if (answers['mortgage'] === 'yes') score += 25;
        if (answers['insurance'] === 'yes') score += 20;
        return score;
    };

    const isComplete = Object.keys(answers).length === steps.length;
    const riskScore = getRiskScore();

    return (
        <div className="wizard-container">
            <div className="wizard-progress">
                {steps.map((step, idx) => (
                    <div key={step.id} className={`progress-step ${idx < currentStep ? 'completed' : idx === currentStep ? 'active' : ''}`}>
                        <span className="step-number">{idx + 1}</span>
                        {idx < steps.length - 1 && <div className="step-line"></div>}
                    </div>
                ))}
            </div>

            {!isComplete ? (
                <div className="wizard-question">
                    <h4>{steps[currentStep].question}</h4>
                    <p className="question-hint">{steps[currentStep].hint}</p>
                    <div className="wizard-buttons">
                        <button className="btn-yes" onClick={() => handleAnswer('yes')}>예</button>
                        <button className="btn-no" onClick={() => handleAnswer('no')}>아니오</button>
                    </div>
                </div>
            ) : (
                <div className="wizard-result">
                    <div className={`score-circle ${riskScore >= 80 ? 'safe' : riskScore >= 50 ? 'warning' : 'danger'}`}>
                        <span className="score-value">{riskScore}</span>
                        <span className="score-label">안전점수</span>
                    </div>
                    <div className="result-summary">
                        <h4>{riskScore >= 80 ? '안전한 계약' : riskScore >= 50 ? '주의 필요' : '고위험 계약'}</h4>
                        <ul>
                            {Object.entries(answers).map(([key, val]) => (
                                <li key={key} className={val === 'yes' ? 'pass' : 'fail'}>
                                    {steps.find(s => s.id === key)?.question.replace('?', '')}
                                    <span>{val === 'yes' ? ' ✓' : ' ✗'}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <button className="btn-reset" onClick={reset}>다시 진단</button>
                </div>
            )}
        </div>
    );
};

// ========== 메인 컴포넌트 ==========
const ContractFlowchart = () => {
    return (
        <div className="flowchart-wrapper">
            {/* 전체 계약 플로우 */}
            <div className="section-card card">
                <div className="card-header">
                    <div className="card-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                        </svg>
                    </div>
                    <h2 className="card-title">전세 계약 전체 플로우차트</h2>
                </div>
                <p className="section-desc">드래그하여 이동, 스크롤로 확대/축소 가능합니다.</p>
                <MainContractFlow />
            </div>

            {/* 인터랙티브 위험도 진단 */}
            <div className="section-card card">
                <div className="card-header">
                    <div className="card-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </div>
                    <h2 className="card-title">전세 위험도 자가진단</h2>
                </div>
                <DecisionWizard />
            </div>

            {/* 채무 불이행 플로우 */}
            <div className="section-card card">
                <div className="card-header">
                    <div className="card-icon danger-bg">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </div>
                    <h2 className="card-title">채무 불이행 시 대응 플로우</h2>
                </div>
                <DefaultFlow />
            </div>
        </div>
    );
};

export default ContractFlowchart;
