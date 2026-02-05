import React from 'react'
import { Sankey, Tooltip, ResponsiveContainer } from 'recharts'

function MoneyFlowSankey({ result }) {
    if (!result) return null

    const cd = result.contractData || result.extractedData || {}

    // 금액 파싱 (단위: 억원)
    const parseAmt = (val) => {
        if (!val) return 0
        if (typeof val === 'number') return val / 100000000
        const v = parseInt(String(val).replace(/[^0-9]/g, ''), 10)
        return isNaN(v) ? 0 : v / 100000000
    }

    const deposit = parseAmt(cd.deposit) // 내 보증금
    const mortgage = parseAmt(cd.mortgageAmount) // 선순위 근저당
    const marketPrice = parseAmt(cd.marketPrice) // 시세 (없으면 보증금 * 1.3 가정) || deposit * 1.3

    // 시뮬레이션: 경매 낙찰가 (통상 시세의 70~80%)
    const auctionPrice = marketPrice > 0 ? marketPrice * 0.8 : (deposit + mortgage) * 0.9

    // 배당 순서 시뮬레이션
    // 1. 경매비용 (약 300만원 -> 0.03억)
    const cost = 0.03
    let remaining = Math.max(0, auctionPrice - cost)

    // 2. 선순위 근저당 (먼저 가져감)
    const mortgageTaken = Math.min(remaining, mortgage)
    remaining = Math.max(0, remaining - mortgageTaken)

    // 3. 내 보증금 (확정일자가 근저당보다 늦다고 가정 - 최악의 경우)
    // 실제로는 날짜 비교 필요하지만, 여기선 위험 시나리오 강조
    const depositRecovered = Math.min(remaining, deposit)
    const depositLost = Math.max(0, deposit - depositRecovered)

    const data = {
        nodes: [
            { name: `예상 낙찰가\n${auctionPrice.toFixed(1)}억` }, // 0
            { name: "경매비용" }, // 1
            { name: "선순위 근저당" }, // 2
            { name: "내 보증금(회수)" }, // 3
            { name: "내 보증금(손실⚠️)" }, // 4
            { name: "임대인/잔여" } // 5
        ],
        links: [
            { source: 0, target: 1, value: cost },
            { source: 0, target: 2, value: mortgageTaken },
            { source: 0, target: 3, value: depositRecovered },
        ]
    }

    // 손실이 있으면 링크 추가
    if (depositLost > 0.01) {
        data.links.push({ source: 0, target: 4, value: depositLost })
    }

    // 남는 돈이 있으면 임대인에게
    const ownerShare = Math.max(0, auctionPrice - cost - mortgageTaken - depositRecovered - depositLost)
    if (ownerShare > 0.01) {
        data.links.push({ source: 0, target: 5, value: ownerShare })
    }

    // 만약 선순위 근저당이 없거나 0이면 노드 제거 등 처리가 복잡하므로,
    // 값이 0인 링크는 자동으로 안 그려지길 기대하거나 필터링해야 함.
    // Recharts Sankey는 value 0을 싫어할 수 있음.
    data.links = data.links.filter(l => l.value > 0.001)

    // 커스텀 노드 렌더링 (값 상시 표시)
    const renderNode = ({ x, y, width, height, index, payload, containerWidth }) => {
        const isLeft = x < containerWidth / 2
        let fill = '#4096ff'
        if (payload.name.includes('손실')) fill = '#ff4d4f'
        if (payload.name.includes('근저당')) fill = '#faad14'
        if (payload.name.includes('임대인')) fill = '#8c8c8c'

        return (
            <g>
                <rect x={x} y={y} width={width} height={height} rx={2} fill={fill} fillOpacity={0.8} />
                <text
                    x={isLeft ? x + width + 6 : x - 6}
                    y={y + height / 2}
                    textAnchor={isLeft ? 'start' : 'end'}
                    fontSize={12}
                    fill="#333"
                    fontWeight="bold"
                    dy={4}
                >
                    {payload.name} ({payload.value.toFixed(2)}억)
                </text>
            </g>
        )
    }

    return (
        <div className="sankey-wrapper" style={{ width: '100%', height: 300, background: '#fff', borderRadius: 8, padding: 10 }}>
            <h3>자금 흐름 시뮬레이션 (경매 시)</h3>
            <p className="caption" style={{ fontSize: '0.8rem', color: '#666', marginBottom: 10 }}>* 시세의 80% 낙찰 및 근저당 선순위 가정 시 내 보증금 보호 여부</p>
            <ResponsiveContainer width="100%" height="90%">
                <Sankey
                    data={data}
                    node={renderNode}
                    nodePadding={50}
                    margin={{ left: 10, right: 120, top: 10, bottom: 10 }}
                    link={{ stroke: '#ccc', strokeOpacity: 0.3 }}
                >
                    <Tooltip />
                </Sankey>
            </ResponsiveContainer>
        </div>
    )
}

export default MoneyFlowSankey
