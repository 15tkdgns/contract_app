import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './StructureMindMap.css';

const NetworkRadialTree = ({ mindMapData }) => {
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

    useEffect(() => {
        const width = 700;
        const height = 450;
        const radius = Math.min(width, height) / 2 - 80;

        // Clear previous
        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);

        // Create tree layout
        const tree = d3.tree()
            .size([2 * Math.PI, radius])
            .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

        const root = d3.hierarchy(treeData);
        tree(root);

        // Draw links
        svg.selectAll('.link')
            .data(root.links())
            .join('path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', d => getNodeColor(d.target.data.group))
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', 2)
            .attr('d', d3.linkRadial()
                .angle(d => d.x)
                .radius(d => d.y));

        // Draw nodes
        const node = svg.selectAll('.node')
            .data(root.descendants())
            .join('g')
            .attr('class', 'node')
            .attr('transform', d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`);

        node.append('circle')
            .attr('r', d => d.depth === 0 ? 20 : d.depth === 1 ? 12 : 8)
            .attr('fill', d => getNodeColor(d.data.group))
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);

        // Draw labels
        node.append('text')
            .attr('dy', '0.31em')
            .attr('x', d => d.x < Math.PI === !d.children ? 10 : -10)
            .attr('text-anchor', d => d.x < Math.PI === !d.children ? 'start' : 'end')
            .attr('transform', d => d.x >= Math.PI ? 'rotate(180)' : null)
            .attr('fill', '#1e293b')
            .attr('font-size', d => d.depth === 0 ? '14px' : d.depth === 1 ? '12px' : '11px')
            .attr('font-weight', d => d.depth === 0 ? 'bold' : 'normal')
            .text(d => d.data.name)
            .clone(true).lower()
            .attr('stroke', 'white')
            .attr('stroke-width', 3);

    }, [mindMapData]);

    return (
        <div className="mindmap-card card">
            <div className="card-header">
                <div className="card-icon radial-bg">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="6" />
                        <circle cx="12" cy="12" r="2" />
                    </svg>
                </div>
                <h2 className="card-title">Radial Tree (방사형)</h2>
                <div className="legend">
                    <span className="legend-item"><span className="dot safe"></span>안전</span>
                    <span className="legend-item"><span className="dot warning"></span>주의</span>
                    <span className="legend-item"><span className="dot danger"></span>위험</span>
                </div>
            </div>
            <div className="radial-tree-container">
                <svg ref={svgRef}></svg>
            </div>
        </div>
    );
};

export default NetworkRadialTree;
