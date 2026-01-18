import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './StructureMindMap.css';

const NetworkRelationGraph = ({ mindMapData }) => {
    const svgRef = useRef();

    useEffect(() => {
        const width = 700;
        const height = 450;

        // Clear previous
        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .style('font-family', 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif')
            .style('direction', 'ltr');

        // Define arrow markers
        const defs = svg.append('defs');

        defs.append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 8)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#64748b');

        defs.append('marker')
            .attr('id', 'arrowhead-blue')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 8)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#3b82f6');

        // Node data - triangle layout
        const nodes = [
            { id: 'landlord', label: '임대인', x: width / 2, y: 80, icon: '👤' },
            { id: 'tenant', label: '임차인', x: 150, y: 370, icon: '👤' },
            { id: 'broker', label: '중개사', x: width - 150, y: 370, icon: '🤝' },
        ];

        // Edge data with labels - added labelSide for clear positioning
        const edges = [
            { source: 'landlord', target: 'tenant', label: '보증금 반환 의무', curved: true, direction: 'down-left', labelSide: 'right' },
            { source: 'tenant', target: 'landlord', label: '차임 지급 청구권', curved: true, direction: 'up-right', highlight: true, labelSide: 'left' },
            { source: 'landlord', target: 'broker', label: '중개수수료 지급', curved: false },
            { source: 'tenant', target: 'broker', label: '중개수수료 지급', curved: false },
        ];

        const nodeMap = {};
        nodes.forEach(n => nodeMap[n.id] = n);

        // Draw edges
        edges.forEach(edge => {
            const source = nodeMap[edge.source];
            const target = nodeMap[edge.target];

            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Offset for node radius
            const nodeRadius = 45;
            const offsetX = (dx / dist) * nodeRadius;
            const offsetY = (dy / dist) * nodeRadius;

            const startX = source.x + offsetX;
            const startY = source.y + offsetY;
            const endX = target.x - offsetX;
            const endY = target.y - offsetY;

            let path;
            if (edge.curved) {
                // Curved path for bidirectional edges
                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;
                const curveOffset = edge.direction === 'up-right' ? -50 : 50;
                const perpX = -(endY - startY) / dist * curveOffset;
                const perpY = (endX - startX) / dist * curveOffset;

                path = svg.append('path')
                    .attr('d', `M${startX},${startY} Q${midX + perpX},${midY + perpY} ${endX},${endY}`)
                    .attr('fill', 'none')
                    .attr('stroke', edge.highlight ? '#3b82f6' : '#64748b')
                    .attr('stroke-width', edge.highlight ? 3 : 2)
                    .attr('marker-end', edge.highlight ? 'url(#arrowhead-blue)' : 'url(#arrowhead)');

                // Label position - close to curve but separated
                const label = edge.label;
                const isLeftSide = edge.labelSide === 'left';

                // Position along the curve midpoint, offset to left or right
                const curveMidX = midX + perpX;
                const curveMidY = midY + perpY;
                const labelX = curveMidX + (isLeftSide ? -60 : 60);
                const labelY = curveMidY;

                // Add background for label
                const labelWidth = label.length * 9;

                svg.append('rect')
                    .attr('x', labelX - labelWidth / 2 - 6)
                    .attr('y', labelY - 12)
                    .attr('width', labelWidth + 12)
                    .attr('height', 24)
                    .attr('fill', 'white')
                    .attr('stroke', edge.highlight ? '#3b82f6' : '#e2e8f0')
                    .attr('stroke-width', 1)
                    .attr('rx', 4);

                svg.append('text')
                    .attr('x', labelX)
                    .attr('y', labelY + 4)
                    .attr('text-anchor', 'middle')
                    .attr('fill', edge.highlight ? '#3b82f6' : '#475569')
                    .attr('font-size', '12px')
                    .attr('font-weight', '500')
                    .text(label);
            } else {
                // Straight line
                path = svg.append('line')
                    .attr('x1', startX)
                    .attr('y1', startY)
                    .attr('x2', endX)
                    .attr('y2', endY)
                    .attr('stroke', '#64748b')
                    .attr('stroke-width', 2)
                    .attr('marker-end', 'url(#arrowhead)');

                // Label position
                const labelX = (startX + endX) / 2;
                const labelY = (startY + endY) / 2 - 10;

                svg.append('text')
                    .attr('x', labelX)
                    .attr('y', labelY)
                    .attr('text-anchor', 'middle')
                    .attr('fill', '#475569')
                    .attr('font-size', '12px')
                    .text(edge.label);
            }
        });

        // Draw nodes
        const nodeGroup = svg.selectAll('.node')
            .data(nodes)
            .join('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.x}, ${d.y})`);

        // Node circles
        nodeGroup.append('circle')
            .attr('r', 45)
            .attr('fill', '#475569')
            .attr('stroke', '#334155')
            .attr('stroke-width', 3);

        // Node icons
        nodeGroup.append('text')
            .attr('y', -8)
            .attr('text-anchor', 'middle')
            .attr('font-size', '24px')
            .text(d => d.icon);

        // Node labels
        nodeGroup.append('text')
            .attr('y', 18)
            .attr('text-anchor', 'middle')
            .attr('fill', 'white')
            .attr('font-size', '14px')
            .attr('font-weight', '600')
            .text(d => d.label);

    }, [mindMapData]);

    return (
        <div className="mindmap-card card">
            <div className="card-header">
                <div className="card-icon network-bg">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="5" r="3" />
                        <circle cx="5" cy="19" r="3" />
                        <circle cx="19" cy="19" r="3" />
                        <line x1="12" y1="8" x2="5" y2="16" />
                        <line x1="12" y1="8" x2="19" y2="16" />
                        <line x1="5" y1="19" x2="19" y2="19" />
                    </svg>
                </div>
                <h2 className="card-title">네트워크 그래프</h2>
            </div>
            <div className="network-graph-container">
                <svg ref={svgRef}></svg>
            </div>
        </div>
    );
};

export default NetworkRelationGraph;
