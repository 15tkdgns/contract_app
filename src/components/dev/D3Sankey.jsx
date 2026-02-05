import React, { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'

function D3Sankey({ result }) {
    const svgRef = useRef(null)
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 })
    const containerRef = useRef(null)

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                })
            }
        }
        window.addEventListener('resize', handleResize)
        handleResize()
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        if (!result || !svgRef.current) return

        const cd = result.contractData || result.extractedData || {}
        const parseAmt = (val) => {
            if (!val) return 0
            if (typeof val === 'number') return val
            const v = parseInt(String(val).replace(/[^0-9]/g, ''), 10)
            return isNaN(v) ? 0 : v
        }

        // 단위: 원 -> 억원 변환을 내부에서 처리하거나 스케일링
        const rawDeposit = parseAmt(cd.deposit)
        const rawMortgage = parseAmt(cd.mortgageAmount)
        const rawMarket = parseAmt(cd.marketPrice)
        const rawAuction = rawMarket > 0 ? rawMarket * 0.8 : (rawDeposit + rawMortgage) * 0.9

        // 억 단위 변환
        const toEok = (v) => v / 100000000

        const cost = toEok(Math.max(3000000, rawAuction * 0.01)) // 최소 300만 or 1%
        const auctionPrice = toEok(rawAuction)
        const mortgage = toEok(rawMortgage)
        const deposit = toEok(rawDeposit)

        let remaining = Math.max(0, auctionPrice - cost)
        const mortgageTaken = Math.min(remaining, mortgage)
        remaining = Math.max(0, remaining - mortgageTaken)
        const depositRecovered = Math.min(remaining, deposit)
        const depositLost = Math.max(0, deposit - depositRecovered)
        const ownerShare = Math.max(0, remaining - depositRecovered)

        const totalValue = cost + mortgageTaken + depositRecovered + depositLost + ownerShare

        // 렌더링 초기화
        const svg = d3.select(svgRef.current)
        svg.selectAll('*').remove()

        const { width, height } = dimensions
        if (width === 0 || height === 0) return

        // --- Manual Layout 계산 ---
        const paddingX = 50
        const paddingY = 40
        const nodeWidth = 20
        const availableHeight = height - (paddingY * 2)
        const availableWidth = width - (paddingX * 2)

        // Y축 스케일
        const yScale = d3.scaleLinear()
            .domain([0, totalValue])
            .range([0, availableHeight])

        // 노드 및 링크 데이터 생성
        const sourceNode = {
            id: 'auction',
            name: `예상 낙찰가\n${auctionPrice.toFixed(1)}억`,
            value: totalValue,
            x0: paddingX,
            x1: paddingX + nodeWidth,
            y0: paddingY,
            y1: paddingY + yScale(totalValue),
            color: '#1890ff'
        }

        const targets = [
            { name: '경매비용', value: cost, color: '#8c8c8c' },
            { name: '선순위채권', value: mortgageTaken, color: '#faad14' },
            { name: '보증금회수', value: depositRecovered, color: '#52c41a' },
            { name: '보증금손실', value: depositLost, color: '#ff4d4f' },
            { name: '잔여배당', value: ownerShare, color: '#d9d9d9' }
        ].filter(d => d.value > 0.001)

        let currentY = paddingY
        const targetX = width - paddingX - nodeWidth - 80 // 텍스트 공간 확보

        const nodes = [sourceNode]
        const links = []

        targets.forEach(t => {
            const h = yScale(t.value)
            const node = {
                id: t.name,
                name: t.name,
                value: t.value,
                x0: targetX,
                x1: targetX + nodeWidth,
                y0: currentY,
                y1: currentY + h,
                color: t.color
            }
            nodes.push(node)
            links.push({
                source: sourceNode,
                target: node,
                value: t.value,
                y0: currentY + (h / 2) // 소스에서의 시작점 (단순화: 소스 전체를 분할해야 함)
            })
            currentY += h + 5 // 노드 간 간격
        })

        // 소스 노드의 링크 시작점(y0)을 재계산 (스택처럼 쌓이게)
        let sourceY = sourceNode.y0
        links.forEach(l => {
            const h = yScale(l.value)
            l.sourceY = sourceY + (h / 2)
            l.width = h
            sourceY += h
            // 간격 때문에 전체 높이가 늘어날 수 있으므로 소스 노드 높이 조정 필요하지만 생략하거나 비율로 조정
            // 여기서는 단순하게 비율로 배치
        })

        // 간격 보정 (소스 노드의 높이 내에서 안분)
        const totalLinkValue = links.reduce((acc, l) => acc + l.value, 0)
        let stackedY = sourceNode.y0
        links.forEach(l => {
            const ratio = l.value / totalLinkValue
            const h = (sourceNode.y1 - sourceNode.y0) * ratio
            l.sourceY = stackedY + (h / 2)
            l.sourceHeight = h
            l.width = h
            stackedY += h
        })

        // --- 그리기 ---

        // 링크 (Paths)
        const linkGen = d3.linkHorizontal()
            .source(d => [d.source.x1, d.sourceY])
            .target(d => [d.target.x0, (d.target.y0 + d.target.y1) / 2])

        // Gradient 정의
        const defs = svg.append("defs")
        links.forEach((l, i) => {
            const gradId = `gradient-${i}`
            const grad = defs.append("linearGradient")
                .attr("id", gradId)
                .attr("gradientUnits", "userSpaceOnUse")
                .attr("x1", l.source.x1)
                .attr("x2", l.target.x0)

            grad.append("stop").attr("offset", "0%").attr("stop-color", l.source.color)
            grad.append("stop").attr("offset", "100%").attr("stop-color", l.target.color)

            l.gradientUrl = `url(#${gradId})`
        })

        svg.append("g")
            .selectAll("path")
            .data(links)
            .join("path")
            .attr("d", linkGen)
            .attr("fill", "none")
            .attr("stroke", d => d.gradientUrl)
            .attr("stroke-width", d => Math.max(1, d.width))
            .attr("stroke-opacity", 0.6)
            .style("mix-blend-mode", "multiply")
            .append("title")
            .text(d => `${d.target.name}\n${d.value.toFixed(2)}억`)

        // 노드
        const nodeGroup = svg.append("g")
            .selectAll("rect")
            .data(nodes)
            .join("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => d.color)
            .attr("rx", 4)

        nodeGroup.append("title")
            .text(d => `${d.name}\n${d.value.toFixed(2)}억`)

        // 라벨
        svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 12)
            .attr("font-weight", "bold")
            .selectAll("text")
            .data(nodes)
            .join("text")
            .attr("x", d => d.id === 'auction' ? d.x0 - 6 : d.x1 + 6)
            .attr("y", d => (d.y0 + d.y1) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => d.id === 'auction' ? "end" : "start")
            .text(d => d.name.includes('\n') ? d.name.split('\n')[0] : d.name)

        // 금액 서브 라벨
        svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 11)
            .attr("fill", "#666")
            .selectAll("text")
            .data(nodes)
            .join("text")
            .attr("x", d => d.id === 'auction' ? d.x0 - 6 : d.x1 + 6)
            .attr("y", d => (d.y0 + d.y1) / 2 + 16) // 아래로
            .attr("text-anchor", d => d.id === 'auction' ? "end" : "start")
            .text(d => `(${d.value.toFixed(2)}억)`)

    }, [result, dimensions])

    return (
        <div ref={containerRef} style={{ width: '100%', height: '400px', background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px', textAlign: 'center', color: '#333' }}>D3.js Custom Sankey Analysis</h3>
            <svg ref={svgRef} width={dimensions.width} height={dimensions.height} style={{ overflow: 'visible' }}></svg>
        </div>
    )
}

export default D3Sankey
