import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './StructureMindMap.css';

const NetworkHorizontalTree = ({ mindMapData }) => {
    const svgRef = useRef();

    const treeData = {
        name: mindMapData.center.label,
        group: 'center',
        children: [
            {
                name: '임대인',
                group: 'primary',
                children: [
                    { name: '실소유자 확인', group: 'safe' },
                    { name: '근저당 2억', group: 'warning' },
                ]
            },
            {
                name: '임차인',
                group: 'primary',
                children: [
                    { name: '보증금 3.5억', group: 'neutral' },
                    { name: '전입신고 필수', group: 'danger' },
                ]
            },
            {
                name: '중개사',
                group: 'primary',
                children: [
                    { name: '중개사 등록 확인', group: 'safe' },
                ]
            },
            {
                name: '보증기관',
                group: 'primary',
                children: [
                    { name: 'HUG 미가입', group: 'danger' },
                    { name: 'SGI 미가입', group: 'danger' },
                ]
            },
            {
                name: '시세정보',
                group: 'primary',
                children: [
                    { name: '시세 9억', group: 'neutral' },
                    { name: '전세가율 41%', group: 'safe' },
                ]
            },
        ]
    };

    const getNodeColor = (group) => {
        const colors = {
            center: '#6366f1',
            primary: '#3b82f6',
            safe: '#22c55e',
            warning: '#f59e0b',
            danger: '#ef4444',
            neutral: '#94a3b8',
        };
        return colors[group] || '#64748b';
    };

    const getNodeBg = (group) => {
        const colors = {
            center: '#6366f1',
            primary: '#1e3a5f',
            safe: '#dcfce7',
            warning: '#fef3c7',
            danger: '#fee2e2',
            neutral: '#f1f5f9',
        };
        return colors[group] || '#f1f5f9';
    };

    const getTextColor = (group) => {
        if (group === 'center' || group === 'primary') return '#ffffff';
        const colors = {
            safe: '#16a34a',
            warning: '#b45309',
            danger: '#dc2626',
            neutral: '#64748b',
        };
        return colors[group] || '#1e293b';
    };

    useEffect(() => {
        const width = 750;
        const height = 450;
        const marginLeft = 60;

        // Clear previous
        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g')
            .attr('transform', `translate(${marginLeft}, 0)`);

        // Create horizontal tree layout (left to right)
        const treeLayout = d3.tree()
            .size([height - 40, width - marginLeft - 180]);

        const root = d3.hierarchy(treeData);
        treeLayout(root);

        // Draw links (curved lines)
        g.selectAll('.link')
            .data(root.links())
            .join('path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', d => getNodeColor(d.target.data.group))
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', 2.5)
            .attr('d', d3.linkHorizontal()
                .x(d => d.y)
                .y(d => d.x));

        // Draw nodes
        const node = g.selectAll('.node')
            .data(root.descendants())
            .join('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.y},${d.x})`);

        // Node rectangles with rounded corners
        node.append('rect')
            .attr('rx', 6)
            .attr('ry', 6)
            .attr('fill', d => getNodeBg(d.data.group))
            .attr('stroke', d => getNodeColor(d.data.group))
            .attr('stroke-width', 2)
            .each(function (d) {
                const text = d.data.name;
                const fontSize = d.depth === 0 ? 14 : d.depth === 1 ? 12 : 11;
                const padding = d.depth === 0 ? 16 : 10;
                const textWidth = text.length * fontSize * 0.55;
                d3.select(this)
                    .attr('x', -textWidth / 2 - padding / 2)
                    .attr('y', -fontSize - 4)
                    .attr('width', textWidth + padding)
                    .attr('height', fontSize * 2 + 4);
            });

        // Node labels
        node.append('text')
            .attr('dy', '0.31em')
            .attr('text-anchor', 'middle')
            .attr('fill', d => getTextColor(d.data.group))
            .attr('font-size', d => d.depth === 0 ? '14px' : d.depth === 1 ? '12px' : '11px')
            .attr('font-weight', d => d.depth === 0 ? 'bold' : d.depth === 1 ? '600' : 'normal')
            .text(d => d.data.name);

    }, [mindMapData]);

    return (
        <div className="mindmap-card card">
            <div className="card-header">
                <div className="card-icon tree-bg">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="6" y1="3" x2="6" y2="15" />
                        <circle cx="18" cy="6" r="3" />
                        <circle cx="6" cy="18" r="3" />
                        <path d="M18 9a9 9 0 0 1-9 9" />
                    </svg>
                </div>
                <h2 className="card-title">전세 구조 및 계약 관계 네트워크</h2>
                <div className="legend">
                    <span className="legend-item"><span className="dot safe"></span>안전</span>
                    <span className="legend-item"><span className="dot warning"></span>주의</span>
                    <span className="legend-item"><span className="dot danger"></span>위험</span>
                </div>
            </div>
            <div className="horizontal-tree-container">
                <svg ref={svgRef}></svg>
            </div>
        </div>
    );
};

export default NetworkHorizontalTree;
