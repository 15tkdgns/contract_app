import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './StructureMindMap.css';

const NetworkVisualization = ({ mindMapData }) => {
    const [viewType, setViewType] = useState('radial');
    const svgRef = useRef();

    const data = {
        center: { label: mindMapData?.center?.label || '서울 강남구 삼성동 아파트', group: 'center' },
        categories: [
            {
                name: '임대인',
                group: 'primary',
                items: [
                    { name: '실소유자 확인', group: 'safe' },
                    { name: '근저당 2억', group: 'warning' },
                ]
            },
            {
                name: '임차인',
                group: 'primary',
                items: [
                    { name: '보증금 3.5억', group: 'neutral' },
                    { name: '전입신고 필수', group: 'danger' },
                ]
            },
            {
                name: '중개사',
                group: 'primary',
                items: [
                    { name: '중개사 등록 확인', group: 'safe' },
                ]
            },
            {
                name: '보증기관',
                group: 'primary',
                items: [
                    { name: 'HUG 미가입', group: 'danger' },
                    { name: 'SGI 미가입', group: 'danger' },
                ]
            },
            {
                name: '시세정보',
                group: 'primary',
                items: [
                    { name: '시세 9억', group: 'neutral' },
                    { name: '전세가율 41%', group: 'safe' },
                ]
            },
        ]
    };

    const getColor = (group) => {
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

    const getBgColor = (group) => {
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
        return { safe: '#16a34a', warning: '#b45309', danger: '#dc2626', neutral: '#64748b' }[group] || '#1e293b';
    };

    useEffect(() => {
        const width = 750;
        const height = 420;
        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .style('font-family', 'Pretendard, system-ui, sans-serif');

        if (viewType === 'radial') renderRadial(svg, width, height);
        else if (viewType === 'vertical') renderVerticalTree(svg, width, height);
        else if (viewType === 'grid') renderGrid(svg, width, height);
        else if (viewType === 'mindmap') renderMindmap(svg, width, height);
    }, [viewType, mindMapData]);

    // 1. 원형 방사형
    const renderRadial = (svg, width, height) => {
        const cx = width / 2;
        const cy = height / 2;
        const innerRadius = 60;
        const outerRadius = 150;

        // Center node
        svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 50).attr('fill', getColor('center'));
        svg.append('text').attr('x', cx).attr('y', cy + 5).attr('text-anchor', 'middle').attr('fill', 'white').attr('font-size', '12px').attr('font-weight', 'bold').text(data.center.label.substring(0, 12) + '...');

        const angleStep = (2 * Math.PI) / data.categories.length;

        data.categories.forEach((cat, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = cx + Math.cos(angle) * outerRadius;
            const y = cy + Math.sin(angle) * outerRadius;

            // Line to category
            svg.append('line').attr('x1', cx).attr('y1', cy).attr('x2', x).attr('y2', y).attr('stroke', getColor(cat.group)).attr('stroke-width', 2);

            // Category node
            svg.append('circle').attr('cx', x).attr('cy', y).attr('r', 35).attr('fill', getColor(cat.group));
            svg.append('text').attr('x', x).attr('y', y + 4).attr('text-anchor', 'middle').attr('fill', 'white').attr('font-size', '11px').attr('font-weight', '600').text(cat.name);

            // Items
            const itemAngleStep = 0.3;
            cat.items.forEach((item, j) => {
                const itemAngle = angle + (j - (cat.items.length - 1) / 2) * itemAngleStep;
                const ix = cx + Math.cos(itemAngle) * (outerRadius + 70);
                const iy = cy + Math.sin(itemAngle) * (outerRadius + 70);

                svg.append('line').attr('x1', x).attr('y1', y).attr('x2', ix).attr('y2', iy).attr('stroke', getColor(item.group)).attr('stroke-width', 1.5).attr('stroke-opacity', 0.6);
                svg.append('circle').attr('cx', ix).attr('cy', iy).attr('r', 6).attr('fill', getColor(item.group));
                svg.append('text').attr('x', ix).attr('y', iy - 10).attr('text-anchor', 'middle').attr('fill', '#475569').attr('font-size', '9px').text(item.name);
            });
        });
    };

    // 2. 계층형 세로 트리
    const renderVerticalTree = (svg, width, height) => {
        const cx = width / 2;
        const startY = 40;

        // Center
        svg.append('rect').attr('x', cx - 80).attr('y', startY).attr('width', 160).attr('height', 36).attr('rx', 8).attr('fill', getColor('center'));
        svg.append('text').attr('x', cx).attr('y', startY + 22).attr('text-anchor', 'middle').attr('fill', 'white').attr('font-size', '11px').attr('font-weight', 'bold').text(data.center.label.substring(0, 18) + '...');

        const catY = startY + 90;
        const catWidth = 100;
        const spacing = (width - 80) / data.categories.length;

        data.categories.forEach((cat, i) => {
            const catX = 40 + i * spacing + spacing / 2;

            // Line from center
            svg.append('path').attr('d', `M${cx},${startY + 36} L${cx},${startY + 55} L${catX},${startY + 55} L${catX},${catY}`).attr('fill', 'none').attr('stroke', getColor(cat.group)).attr('stroke-width', 2);

            // Category node
            svg.append('rect').attr('x', catX - catWidth / 2).attr('y', catY).attr('width', catWidth).attr('height', 30).attr('rx', 6).attr('fill', getColor(cat.group));
            svg.append('text').attr('x', catX).attr('y', catY + 19).attr('text-anchor', 'middle').attr('fill', 'white').attr('font-size', '11px').attr('font-weight', '600').text(cat.name);

            // Items
            const itemY = catY + 60;
            cat.items.forEach((item, j) => {
                const itemYPos = itemY + j * 40;
                svg.append('line').attr('x1', catX).attr('y1', catY + 30).attr('x2', catX).attr('y2', itemYPos).attr('stroke', getColor(item.group)).attr('stroke-width', 1.5);
                svg.append('rect').attr('x', catX - 50).attr('y', itemYPos - 12).attr('width', 100).attr('height', 24).attr('rx', 4).attr('fill', getBgColor(item.group)).attr('stroke', getColor(item.group)).attr('stroke-width', 1);
                svg.append('text').attr('x', catX).attr('y', itemYPos + 4).attr('text-anchor', 'middle').attr('fill', getTextColor(item.group)).attr('font-size', '10px').text(item.name);
            });
        });
    };

    // 3. 그리드 레이아웃
    const renderGrid = (svg, width, height) => {
        const padding = 20;
        const headerHeight = 50;

        // Header
        svg.append('rect').attr('x', padding).attr('y', padding).attr('width', width - padding * 2).attr('height', headerHeight).attr('rx', 8).attr('fill', getColor('center'));
        svg.append('text').attr('x', width / 2).attr('y', padding + 30).attr('text-anchor', 'middle').attr('fill', 'white').attr('font-size', '14px').attr('font-weight', 'bold').text(data.center.label);

        const gridStartY = padding + headerHeight + 20;
        const cols = 3;
        const boxWidth = (width - padding * 2 - 20 * (cols - 1)) / cols;
        const boxHeight = 130;

        data.categories.forEach((cat, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = padding + col * (boxWidth + 20);
            const y = gridStartY + row * (boxHeight + 15);

            // Category box
            svg.append('rect').attr('x', x).attr('y', y).attr('width', boxWidth).attr('height', boxHeight).attr('rx', 8).attr('fill', 'white').attr('stroke', getColor(cat.group)).attr('stroke-width', 2);

            // Category header
            svg.append('rect').attr('x', x).attr('y', y).attr('width', boxWidth).attr('height', 28).attr('rx', 8).attr('fill', getColor(cat.group));
            svg.append('rect').attr('x', x).attr('y', y + 20).attr('width', boxWidth).attr('height', 10).attr('fill', getColor(cat.group));
            svg.append('text').attr('x', x + boxWidth / 2).attr('y', y + 18).attr('text-anchor', 'middle').attr('fill', 'white').attr('font-size', '11px').attr('font-weight', '600').text(cat.name);

            // Items
            cat.items.forEach((item, j) => {
                const iy = y + 40 + j * 28;
                svg.append('circle').attr('cx', x + 15).attr('cy', iy + 4).attr('r', 5).attr('fill', getColor(item.group));
                svg.append('text').attr('x', x + 28).attr('y', iy + 8).attr('fill', '#475569').attr('font-size', '10px').text(item.name);
            });
        });
    };

    // 4. 마인드맵 스타일
    const renderMindmap = (svg, width, height) => {
        const cx = width / 2;
        const cy = height / 2;

        // Center
        svg.append('ellipse').attr('cx', cx).attr('cy', cy).attr('rx', 90).attr('ry', 35).attr('fill', getColor('center'));
        svg.append('text').attr('x', cx).attr('y', cy + 5).attr('text-anchor', 'middle').attr('fill', 'white').attr('font-size', '11px').attr('font-weight', 'bold').text(data.center.label.substring(0, 16) + '...');

        const positions = [
            { x: 120, y: 80 },
            { x: width - 120, y: 80 },
            { x: 80, y: height - 100 },
            { x: width - 80, y: height - 100 },
            { x: width / 2, y: height - 60 },
        ];

        data.categories.forEach((cat, i) => {
            const pos = positions[i];
            const cpx = (cx + pos.x) / 2 + (i % 2 === 0 ? -30 : 30);
            const cpy = (cy + pos.y) / 2;

            // Bezier curve
            svg.append('path').attr('d', `M${cx},${cy} Q${cpx},${cpy} ${pos.x},${pos.y}`).attr('fill', 'none').attr('stroke', getColor(cat.group)).attr('stroke-width', 3).attr('stroke-linecap', 'round');

            // Category bubble
            svg.append('ellipse').attr('cx', pos.x).attr('cy', pos.y).attr('rx', 50).attr('ry', 22).attr('fill', getColor(cat.group));
            svg.append('text').attr('x', pos.x).attr('y', pos.y + 5).attr('text-anchor', 'middle').attr('fill', 'white').attr('font-size', '11px').attr('font-weight', '600').text(cat.name);

            // Items as smaller bubbles
            cat.items.forEach((item, j) => {
                const offsetX = (j - (cat.items.length - 1) / 2) * 70;
                const offsetY = pos.y < height / 2 ? -45 : 45;
                const ix = pos.x + offsetX;
                const iy = pos.y + offsetY;

                svg.append('line').attr('x1', pos.x).attr('y1', pos.y + (offsetY > 0 ? 22 : -22)).attr('x2', ix).attr('y2', iy - (offsetY > 0 ? 12 : -12)).attr('stroke', getColor(item.group)).attr('stroke-width', 1.5);
                svg.append('rect').attr('x', ix - 45).attr('y', iy - 12).attr('width', 90).attr('height', 24).attr('rx', 12).attr('fill', getBgColor(item.group)).attr('stroke', getColor(item.group)).attr('stroke-width', 1);
                svg.append('text').attr('x', ix).attr('y', iy + 4).attr('text-anchor', 'middle').attr('fill', getTextColor(item.group)).attr('font-size', '9px').text(item.name);
            });
        });
    };

    return (
        <div className="mindmap-card card">
            <div className="card-header">
                <div className="card-icon tree-bg">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
                    </svg>
                </div>
                <h2 className="card-title">전세 구조 및 계약 관계 네트워크</h2>
                <div className="viz-tabs">
                    <button className={`viz-tab ${viewType === 'radial' ? 'active' : ''}`} onClick={() => setViewType('radial')}>방사형</button>
                    <button className={`viz-tab ${viewType === 'vertical' ? 'active' : ''}`} onClick={() => setViewType('vertical')}>세로트리</button>
                    <button className={`viz-tab ${viewType === 'grid' ? 'active' : ''}`} onClick={() => setViewType('grid')}>그리드</button>
                    <button className={`viz-tab ${viewType === 'mindmap' ? 'active' : ''}`} onClick={() => setViewType('mindmap')}>마인드맵</button>
                </div>
            </div>
            <div className="legend" style={{ padding: '0 1rem', marginBottom: '0.5rem' }}>
                <span className="legend-item"><span className="dot safe"></span>안전</span>
                <span className="legend-item"><span className="dot warning"></span>주의</span>
                <span className="legend-item"><span className="dot danger"></span>위험</span>
            </div>
            <div className="network-viz-container">
                <svg ref={svgRef}></svg>
            </div>
        </div>
    );
};

export default NetworkVisualization;
