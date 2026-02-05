import { useState, useEffect } from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    LabelList
} from 'recharts'
import { fetchMarketPrice, evaluatePriceRisk } from '../services/marketPriceService'
import './PriceAnalysisPanel.css'

function PriceAnalysisPanel({ address, deposit, area }) {
    const [marketData, setMarketData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            if (!address) return
            setIsLoading(true)
            try {
                // 실제로는 API 호출 (현재는 Mock)
                const data = await fetchMarketPrice(address, deposit, area)
                setMarketData(data)
            } catch (error) {
                console.error("Failed to load market price:", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [address, deposit, area])

    if (isLoading) return <div className="price-panel-loading">시세 정보를 불러오는 중...</div>
    if (!marketData) return null

    const risk = evaluatePriceRisk(marketData.jeonseRatio)

    const formatMoney = (value) => {
        if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억`
        return `${(value / 10000).toLocaleString()}만`
    }

    return (
        <div className="price-analysis-panel">
            <div className="price-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3>주변 시세 분석</h3>
                    <span className="badge" style={{
                        background: marketData.isSpecific ? '#e6fffa' : '#fffaf0',
                        color: marketData.isSpecific ? '#2c7a7b' : '#b7791f',
                        fontSize: '0.65rem'
                    }}>
                        {marketData.isSpecific ? '단지 정밀 분석' : '주변 시세 평균'}
                    </span>
                </div>
                {marketData.isMock && <span className="mock-badge" style={{ background: '#eee', color: '#666' }}>MOCK (가상)</span>}
            </div>

            <div className="price-summary-card">
                <div className="summary-row">
                    <span className="label">내 보증금</span>
                    <span className="value">{formatMoney(deposit)}</span>
                </div>
                <div className="summary-row">
                    <span className="label">주거 형태</span>
                    <span className="value">{marketData.buildingType || '아파트'}</span>
                </div>
                <div className="summary-row">
                    <span className="label">분석 대상</span>
                    <span className="value" style={{ color: marketData.isSpecific ? '#3182ce' : 'inherit' }}>
                        {marketData.aptName}
                    </span>
                </div>
                <div className="summary-row">
                    <span className="label">분석 면적 (유사 평형)</span>
                    <span className="value">{area || marketData.targetArea}㎡ ({marketData.pyeong}평형)</span>
                </div>
                <div className="summary-row">
                    <span className="label">추정 매매가</span>
                    <span className="value">{formatMoney(marketData.averagePrice)}</span>
                </div>
                <div className="summary-row" style={{ fontSize: '0.85rem', marginTop: '-4px' }}>
                    <span className="label">평당 가격</span>
                    <span className="value" style={{ color: '#555' }}>
                        평당 {Math.round(marketData.pricePerPyeong / 10000).toLocaleString()}만원
                    </span>
                </div>
                <div className="ratio-bar-container">
                    <div className="ratio-labels">
                        <span>전세가율 {marketData.jeonseRatio}%</span>
                        <span style={{ color: risk.color, fontWeight: 'bold' }}>{risk.label}</span>
                    </div>
                    <div className="ratio-bar-bg">
                        <div
                            className="ratio-bar-fill"
                            style={{
                                width: `${Math.min(marketData.jeonseRatio, 100)}%`,
                                backgroundColor: risk.color
                            }}
                        ></div>
                        <div className="safe-line" style={{ left: '70%' }}></div>
                    </div>
                    <div className="ratio-guideline">안전선 (70%)</div>
                </div>
            </div>

            <div className="chart-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <h4 style={{ wordBreak: 'keep-all', margin: 0 }}>
                        {marketData.isSpecific ? '이 단지' : '유사 평형'} 실거래가 추이
                        <span style={{ fontSize: '0.7em', fontWeight: 'normal', color: '#888', marginLeft: '8px', display: 'inline-block' }}>
                            (기준: {marketData.isSpecific ? '단지내' : '지역내'} 동일평형, 월평균)
                        </span>
                    </h4>
                    <div className="chart-jeonse-badge" style={{
                        background: risk.color + '15',
                        color: risk.color,
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        border: `1px solid ${risk.color}30`
                    }}>
                        전세가율 {marketData.jeonseRatio}%
                    </div>
                </div>
                <div style={{ width: '100%', height: 240 }}>
                    <ResponsiveContainer>
                        <LineChart
                            data={marketData.transactions}
                            margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                                interval={1} // 개수가 많으므로 하나씩 건너뜀
                            />
                            <YAxis
                                domain={['auto', 'auto']}
                                hide={false}
                                tick={{ fontSize: 9, fill: '#999' }}
                                tickFormatter={(val) => `${(val / 100000000).toFixed(1)}억`}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                formatter={(value, name, props) => {
                                    const { floorInfo } = props.payload;
                                    return [
                                        <div key="price">
                                            <div style={{ fontWeight: 'bold', color: '#3182ce' }}>{formatMoney(value)}</div>
                                            {floorInfo && <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>거래 층수: {floorInfo}</div>}
                                        </div>,
                                        ''
                                    ];
                                }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', padding: '12px' }}
                            />
                            <ReferenceLine
                                y={deposit}
                                stroke="red"
                                strokeDasharray="3 3"
                                label={{
                                    position: 'insideBottomRight',
                                    value: `보증금 (${formatMoney(deposit)})`,
                                    fill: 'red',
                                    fontSize: 10,
                                    fontWeight: 'bold',
                                    dy: -5
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="price"
                                stroke="#3182ce"
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#3182ce', strokeWidth: 0 }}
                                activeDot={{ r: 6 }}
                                isAnimationActive={true}
                            >
                                <LabelList
                                    dataKey="price"
                                    position="top"
                                    formatter={(value) => formatMoney(value)}
                                    style={{ fontSize: '9px', fill: '#4a5568', fontWeight: 'bold' }}
                                    offset={10}
                                />
                            </Line>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="analysis-insight">
                <div className="insight-icon">INFO</div>
                <p>
                    {risk.level === 'safe'
                        ? '전세가율이 70% 이하로 안전한 편입니다. 다만 최근 시세 하락세가 없는지 그래프를 확인하세요.'
                        : risk.level === 'warning'
                            ? '전세가율이 70%를 넘어 다소 위험합니다. 보증보험 가입이 필수적입니다.'
                            : '매매가와 전세가가 거의 차이가 없습니다(깡통전세 위험). 계약을 신중히 재검토하세요.'
                    }
                </p>
            </div>
        </div>
    )
}

export default PriceAnalysisPanel
