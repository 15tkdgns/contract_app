import React, { useRef, useEffect } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import './StructureMindMap.css';

const NetworkVisGraph = ({ mindMapData }) => {
    const containerRef = useRef(null);
    const networkRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Nodes
        const nodes = new DataSet([
            // Center
            { id: 'property', label: mindMapData.center.label, group: 'center', size: 40, font: { size: 16, bold: true } },
            // Primary
            { id: 'landlord', label: '임대인', group: 'primary', size: 30 },
            { id: 'tenant', label: '임차인', group: 'primary', size: 30 },
            { id: 'agent', label: '중개사', group: 'primary', size: 30 },
            { id: 'insurance', label: '보증기관', group: 'primary', size: 30 },
            // Details
            { id: 'owner-status', label: '실소유자 확인', group: 'safe', size: 20 },
            { id: 'mortgage', label: '근저당 2억', group: 'warning', size: 20 },
            { id: 'deposit', label: '보증금 3.5억', group: 'neutral', size: 20 },
            { id: 'move-in', label: '전입신고 필수', group: 'danger', size: 20 },
            { id: 'license', label: '중개사 등록 확인', group: 'safe', size: 20 },
            { id: 'hug', label: 'HUG 미가입', group: 'danger', size: 20 },
            { id: 'sgi', label: 'SGI 미가입', group: 'danger', size: 20 },
            { id: 'market', label: '시세 9억', group: 'neutral', size: 20 },
            { id: 'ratio', label: '전세가율 41%', group: 'safe', size: 20 },
        ]);

        // Edges
        const edges = new DataSet([
            { from: 'property', to: 'landlord' },
            { from: 'property', to: 'tenant' },
            { from: 'property', to: 'agent' },
            { from: 'property', to: 'insurance' },
            { from: 'landlord', to: 'owner-status', color: '#22c55e' },
            { from: 'landlord', to: 'mortgage', color: '#f59e0b' },
            { from: 'tenant', to: 'deposit', color: '#94a3b8' },
            { from: 'tenant', to: 'move-in', color: '#ef4444' },
            { from: 'agent', to: 'license', color: '#22c55e' },
            { from: 'insurance', to: 'hug', color: '#ef4444' },
            { from: 'insurance', to: 'sgi', color: '#ef4444' },
            { from: 'property', to: 'market', color: '#94a3b8' },
            { from: 'property', to: 'ratio', color: '#22c55e' },
        ]);

        const options = {
            groups: {
                center: {
                    color: { background: '#6366f1', border: '#4f46e5', highlight: { background: '#818cf8', border: '#6366f1' } },
                    font: { color: '#ffffff' },
                    borderWidth: 3,
                },
                primary: {
                    color: { background: '#3b82f6', border: '#2563eb', highlight: { background: '#60a5fa', border: '#3b82f6' } },
                    font: { color: '#ffffff' },
                    borderWidth: 2,
                },
                safe: {
                    color: { background: '#22c55e', border: '#16a34a', highlight: { background: '#4ade80', border: '#22c55e' } },
                    font: { color: '#ffffff' },
                },
                warning: {
                    color: { background: '#f59e0b', border: '#d97706', highlight: { background: '#fbbf24', border: '#f59e0b' } },
                    font: { color: '#ffffff' },
                },
                danger: {
                    color: { background: '#ef4444', border: '#dc2626', highlight: { background: '#f87171', border: '#ef4444' } },
                    font: { color: '#ffffff' },
                },
                neutral: {
                    color: { background: '#94a3b8', border: '#64748b', highlight: { background: '#cbd5e1', border: '#94a3b8' } },
                    font: { color: '#ffffff' },
                },
            },
            nodes: {
                shape: 'dot',
                font: {
                    size: 12,
                    face: 'Arial',
                },
                borderWidth: 2,
                shadow: true,
            },
            edges: {
                width: 2,
                color: { color: '#cbd5e1', highlight: '#64748b' },
                smooth: {
                    type: 'continuous',
                    roundness: 0.5,
                },
            },
            physics: {
                enabled: true,
                barnesHut: {
                    gravitationalConstant: -3000,
                    centralGravity: 0.3,
                    springLength: 120,
                    springConstant: 0.04,
                    damping: 0.09,
                },
                stabilization: {
                    iterations: 150,
                    updateInterval: 25,
                },
            },
            interaction: {
                hover: true,
                tooltipDelay: 200,
                zoomView: true,
                dragView: true,
            },
        };

        networkRef.current = new Network(containerRef.current, { nodes, edges }, options);

        return () => {
            if (networkRef.current) {
                networkRef.current.destroy();
            }
        };
    }, [mindMapData]);

    return (
        <div className="mindmap-card card">
            <div className="card-header">
                <div className="card-icon vis-bg">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                        <line x1="12" y1="22" x2="12" y2="15.5" />
                        <polyline points="22 8.5 12 15.5 2 8.5" />
                    </svg>
                </div>
                <h2 className="card-title">vis-network (대화형)</h2>
                <div className="legend">
                    <span className="legend-item"><span className="dot safe"></span>안전</span>
                    <span className="legend-item"><span className="dot warning"></span>주의</span>
                    <span className="legend-item"><span className="dot danger"></span>위험</span>
                </div>
            </div>
            <div className="vis-network-container" ref={containerRef}></div>
        </div>
    );
};

export default NetworkVisGraph;
