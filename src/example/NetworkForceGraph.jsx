import React, { useRef, useEffect, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import './StructureMindMap.css';

const NetworkForceGraph = ({ mindMapData }) => {
    const graphRef = useRef();

    const graphData = {
        nodes: [
            // 중앙 노드
            { id: 'property', name: mindMapData.center.label, group: 'center', val: 30 },
            // 1차 노드
            { id: 'landlord', name: '임대인', group: 'primary', val: 20 },
            { id: 'tenant', name: '임차인', group: 'primary', val: 20 },
            { id: 'agent', name: '중개사', group: 'primary', val: 20 },
            { id: 'insurance', name: '보증기관', group: 'primary', val: 20 },
            // 2차 노드
            { id: 'owner-status', name: '실소유자 확인', group: 'safe', val: 10 },
            { id: 'mortgage', name: '근저당 2억', group: 'warning', val: 10 },
            { id: 'deposit', name: '보증금 3.5억', group: 'neutral', val: 10 },
            { id: 'move-in', name: '전입신고 필수', group: 'danger', val: 10 },
            { id: 'license', name: '중개사 등록 확인', group: 'safe', val: 10 },
            { id: 'hug', name: 'HUG 미가입', group: 'danger', val: 10 },
            { id: 'sgi', name: 'SGI 미가입', group: 'danger', val: 10 },
            { id: 'market', name: '시세 9억', group: 'neutral', val: 10 },
            { id: 'ratio', name: '전세가율 41%', group: 'safe', val: 10 },
        ],
        links: [
            // 중앙 → 1차
            { source: 'property', target: 'landlord' },
            { source: 'property', target: 'tenant' },
            { source: 'property', target: 'agent' },
            { source: 'property', target: 'insurance' },
            // 1차 → 2차
            { source: 'landlord', target: 'owner-status' },
            { source: 'landlord', target: 'mortgage' },
            { source: 'tenant', target: 'deposit' },
            { source: 'tenant', target: 'move-in' },
            { source: 'agent', target: 'license' },
            { source: 'insurance', target: 'hug' },
            { source: 'insurance', target: 'sgi' },
            { source: 'property', target: 'market' },
            { source: 'property', target: 'ratio' },
        ]
    };

    const getNodeColor = useCallback((node) => {
        const colors = {
            center: '#6366f1',
            primary: '#3b82f6',
            safe: '#22c55e',
            warning: '#f59e0b',
            danger: '#ef4444',
            neutral: '#94a3b8',
        };
        return colors[node.group] || '#64748b';
    }, []);

    const getLinkColor = useCallback((link) => {
        const targetGroup = link.target.group || link.target;
        const colors = {
            safe: '#22c55e',
            warning: '#f59e0b',
            danger: '#ef4444',
        };
        return colors[targetGroup] || '#cbd5e1';
    }, []);

    useEffect(() => {
        if (graphRef.current) {
            graphRef.current.d3Force('charge').strength(-300);
            graphRef.current.d3Force('link').distance(80);
        }
    }, []);

    return (
        <div className="mindmap-card card">
            <div className="card-header">
                <div className="card-icon force-bg">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
                    </svg>
                </div>
                <h2 className="card-title">Force Graph (힘 기반)</h2>
                <div className="legend">
                    <span className="legend-item"><span className="dot safe"></span>안전</span>
                    <span className="legend-item"><span className="dot warning"></span>주의</span>
                    <span className="legend-item"><span className="dot danger"></span>위험</span>
                </div>
            </div>
            <div className="force-graph-container">
                <ForceGraph2D
                    ref={graphRef}
                    graphData={graphData}
                    nodeColor={getNodeColor}
                    nodeLabel="name"
                    nodeVal="val"
                    linkColor={getLinkColor}
                    linkWidth={2}
                    linkDirectionalParticles={2}
                    linkDirectionalParticleSpeed={0.005}
                    width={700}
                    height={400}
                    backgroundColor="#f8fafc"
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        const label = node.name;
                        const fontSize = node.group === 'center' ? 14 : node.group === 'primary' ? 12 : 10;
                        ctx.font = `${fontSize}px Sans-Serif`;
                        const textWidth = ctx.measureText(label).width;
                        const bckgDimensions = [textWidth + 10, fontSize + 6];

                        // Draw node circle
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, node.val / 2, 0, 2 * Math.PI);
                        ctx.fillStyle = getNodeColor(node);
                        ctx.fill();

                        // Draw label background
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                        ctx.fillRect(
                            node.x - bckgDimensions[0] / 2,
                            node.y + node.val / 2 + 2,
                            bckgDimensions[0],
                            bckgDimensions[1]
                        );

                        // Draw label
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'top';
                        ctx.fillStyle = '#1e293b';
                        ctx.fillText(label, node.x, node.y + node.val / 2 + 4);
                    }}
                />
            </div>
        </div>
    );
};

export default NetworkForceGraph;
