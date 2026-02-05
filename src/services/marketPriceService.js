/**
 * marketPriceService.js
 * 국토교통부 실거래가 API 및 시세 분석 서비스
 */

const API_KEY = import.meta.env.VITE_MOLIT_API_KEY

// 법정동 코드 (데모용 일부 매핑)
// 실제 서비스에서는 전체 법정동 코드 DB를 연동하거나 Kakao Local API 등을 사용하여 좌표->행정동 변환 필요
const REGION_CODES = {
    '강남': '11680',
    '서초': '11650',
    '송파': '11710',
    '마포': '11440',
    '영등포': '11560',
    '종로': '11110',
    '중구': '11140',
    '용산': '11170',
    '성동': '11200',
    '광진': '11215'
}

/**
 * 1. 주소에서 법정동 코드 추출 (간이 구현)
 */
const getRegionCode = (address) => {
    for (const [key, code] of Object.entries(REGION_CODES)) {
        if (address.includes(key)) {
            return { code, name: key }
        }
    }
    return { code: '11680', name: '강남' } // Default (Fallback)
}

/**
 * 2. API 호출 함수 (프록시 사용)
 */
const fetchOpenApi = async (endpoint, params) => {
    if (!API_KEY) throw new Error('API Key Missing')

    // 쿼리 스트링 생성
    const queryParams = new URLSearchParams({
        serviceKey: decodeURIComponent(API_KEY), // 이미 인코딩된 키일 경우를 대비해 decode (보통 라이브러리가 encode함)
        ...params
    }).toString()

    // 이중 인코딩 방지를 위해 수동 구성이 필요할 수 있음
    // serviceKey는 공공데이터포털에서 Encoding된 키와 Decoding된 키를 줌. 
    // fetch URL 구성 시 주의. 여기서는 일반적인 방식으로 시도.

    const url = `/api/molit${endpoint}?${queryParams}` // endpoint starts with /...

    // Note: serviceKey는 보통 인코딩된 문자열을 그대로 보내야 하므로 URLSearchParams가 다시 인코딩하면 안될 수 있음.
    // 여기서는 간단히 구현하고 문제 발생 시 수정.

    const response = await fetch(url)
    if (!response.ok) throw new Error(`API Error: ${response.status}`)

    const text = await response.text()
    return parseXML(text)
}

/**
 * 3. XML 파싱 함수
 */
const parseXML = (xmlText) => {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlText, "text/xml")

    const items = xmlDoc.getElementsByTagName("item")
    console.log('API Parsed Items:', items.length)
    if (items.length > 0) {
        console.log('First Item XML:', items[0].outerHTML)
    } else {
        console.log('Raw XML Text:', xmlText)
    }
    const result = []

    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const getItemValue = (tagName) => item.getElementsByTagName(tagName)[0]?.textContent

        // 태그명이 영문(dealYear 등) 또는 한글(년 등)일 수 있음. 로그 확인 결과 영문.
        result.push({
            year: getItemValue('dealYear') || getItemValue('년'),
            month: getItemValue('dealMonth') || getItemValue('월'),
            day: getItemValue('dealDay') || getItemValue('일'),
            // 매매: dealAmount, 전월세: depositAmount
            price: getItemValue('dealAmount') || getItemValue('depositAmount') || getItemValue('거래금액') || getItemValue('보증금액'),
            monthlyRent: getItemValue('monthlyRent') || getItemValue('월세금액'),
            floor: getItemValue('floor') || getItemValue('층'),
            aptName: getItemValue('aptNm') || getItemValue('아파트'),
            area: getItemValue('excluUseAr') || getItemValue('전용면적')
        })
    }
    return result
}

/**
 * 통합 시세 조회 함수
 */
export async function fetchMarketPrice(address, deposit, targetArea = 0) {
    if (!API_KEY || API_KEY === 'YOUR_KEY_HERE') {
        return fetchMockData(address, deposit, targetArea)
    }

    try {
        const { code } = getRegionCode(address)
        const targetAreaNum = parseFloat(targetArea) || 20 // 원룸의 경우 기본값 20제곱미터 가정

        // 주소 키워드에 따른 빌딩 타입 추정
        let buildingType = 'RH' // 기본값을 RH로 변경 (원룸, 다세대 등이 더 많음)
        if (address.includes('아파트') || address.includes('APT')) buildingType = 'APT'
        else if (address.includes('오피스텔')) buildingType = 'OFFI'
        else if (address.includes('원룸') || address.includes('빌라') || address.includes('다세대') ||
            address.includes('연립') || address.includes('다가구') || address.includes('도시형생활')) buildingType = 'RH'

        // API 엔드포인트 매핑
        const endpoints = {
            'APT': '/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade',
            'RH': '/1613000/RTMSDataSvcRHTrade/getRTMSDataSvcRHTrade',
            'OFFI': '/1613000/RTMSDataSvcOffiTrade/getRTMSDataSvcOffiTrade'
        }

        // 우선순위에 따른 엔드포인트 순서 결정 (추정 타입 우선)
        const searchOrder = [buildingType, ...Object.keys(endpoints).filter(t => t !== buildingType)]

        const addrParts = address.split(' ').filter(p => !p.endsWith('동') && !p.endsWith('구') && !p.endsWith('시'))
        const targetName = addrParts[addrParts.length - 1]

        const today = new Date()
        const monthsToFetch = 12

        for (const type of searchOrder) {
            console.log(`Searching for building type: ${type}`)
            const tradeDataPromises = []
            for (let i = 0; i < monthsToFetch; i++) {
                const d = new Date(today)
                d.setMonth(d.getMonth() - i)
                const ymd = d.toISOString().slice(0, 4) + d.toISOString().slice(5, 7)

                tradeDataPromises.push(
                    fetchOpenApi(endpoints[type], {
                        LAWD_CD: code,
                        DEAL_YMD: ymd,
                        pageNo: 1,
                        numOfRows: 100
                    }).catch(() => [])
                )
            }

            const tradeDataResults = await Promise.all(tradeDataPromises)
            const allTradeData = tradeDataResults.flat()

            if (allTradeData.length === 0) continue

            // 필터링 및 가공 로직
            let filtered = allTradeData.filter(item => {
                const itemArea = parseFloat(item.area)
                const nameMatch = item.aptName?.includes(targetName) || targetName.includes(item.aptName || '')
                const areaMatch = itemArea >= targetAreaNum * 0.7 && itemArea <= targetAreaNum * 1.3 // 원룸은 오차범위 30%로 확대
                return (type === 'APT' || type === 'OFFI' ? nameMatch : true) && areaMatch
            })

            let isSpecific = true
            if (filtered.length < 2) {
                filtered = allTradeData.filter(item => {
                    const itemArea = parseFloat(item.area)
                    return itemArea >= targetAreaNum * 0.7 && itemArea <= targetAreaNum * 1.3
                })
                isSpecific = false
            }

            if (filtered.length > 0) {
                const monthlyGroups = filtered.reduce((acc, item) => {
                    const dateKey = `${item.year}-${String(item.month).padStart(2, '0')}`
                    if (!acc[dateKey]) acc[dateKey] = { sum: 0, count: 0, date: dateKey, floors: [] }
                    const price = parseInt(item.price.replace(/,/g, '').trim()) * 10000
                    acc[dateKey].sum += price
                    acc[dateKey].count += 1
                    if (item.floor) acc[dateKey].floors.push(item.floor)
                    return acc
                }, {})

                const transactions = Object.values(monthlyGroups)
                    .map(group => ({
                        date: group.date,
                        price: Math.round(group.sum / group.count),
                        floorInfo: group.floors.length > 0 ? `${Math.min(...group.floors)}~${Math.max(...group.floors)}층` : '',
                        type: '실거래'
                    }))
                    .sort((a, b) => a.date.localeCompare(b.date))

                const averagePrice = transactions.reduce((acc, curr) => acc + curr.price, 0) / transactions.length
                const pyeong = (targetAreaNum / 3.3057).toFixed(1)

                return {
                    address,
                    aptName: isSpecific ? (filtered[0].aptName || '대상 건물') : `${type === 'RH' ? '주변 빌라' : type === 'OFFI' ? '주변 오피스텔' : '주변 단지'} 평균`,
                    targetArea: targetAreaNum,
                    pyeong,
                    pricePerPyeong: Math.round(averagePrice / parseFloat(pyeong)),
                    averagePrice: Math.round(averagePrice),
                    maxPrice: Math.max(...transactions.map(t => t.price)),
                    minPrice: Math.min(...transactions.map(t => t.price)),
                    jeonseRatio: ((deposit / averagePrice) * 100).toFixed(1),
                    transactions: transactions.slice(-12),
                    isMock: false,
                    isSpecific,
                    buildingType: type === 'APT' ? '아파트' : type === 'OFFI' ? '오피스텔' : '빌라/연립'
                }
            }
        }

        return fetchMockData(address, deposit, targetAreaNum)
    } catch (error) {
        console.error('Market Service Error:', error)
        return fetchMockData(address, deposit, targetArea)
    }
}


// --- Mock Data (Fallback) ---

const generateMockTransactions = (basePrice) => {
    const transactions = []
    const today = new Date()

    for (let i = 0; i < 12; i++) {
        const date = new Date(today)
        date.setMonth(date.getMonth() - i)
        // 가격 변동 폭 (±5%)
        const fluctuation = (Math.random() - 0.5) * 0.1
        const price = Math.round(basePrice * (1 + fluctuation) / 1000000) * 1000000

        transactions.push({
            date: date.toISOString().slice(0, 7), // YYYY-MM
            price: price,
            floor: Math.floor(Math.random() * 15) + 2,
            type: '실거래'
        })
    }
    return transactions.reverse()
}

export async function fetchMockData(address, deposit, targetArea = 84) {
    await new Promise(resolve => setTimeout(resolve, 800)) // Latency simulation

    const targetAreaNum = parseFloat(targetArea) || 84
    const isGangnam = address && (address.includes('강남') || address.includes('서초'))
    const basePrice = isGangnam ? 900000000 : 350000000

    const transactions = generateMockTransactions(basePrice)
    const averagePrice = transactions.reduce((acc, curr) => acc + curr.price, 0) / transactions.length
    const jeonseRatio = (deposit / averagePrice) * 100
    const pyeong = (targetAreaNum / 3.3057).toFixed(1)
    const pricePerPyeong = Math.round(averagePrice / parseFloat(pyeong))

    return {
        address: address,
        targetArea: targetAreaNum,
        pyeong,
        pricePerPyeong,
        averagePrice: Math.round(averagePrice),
        maxPrice: Math.max(...transactions.map(t => t.price)),
        minPrice: Math.min(...transactions.map(t => t.price)),
        jeonseRatio: jeonseRatio.toFixed(1),
        transactions: transactions,
        isMock: true
    }
}

export function evaluatePriceRisk(jeonseRatio) {
    if (jeonseRatio >= 80) return { level: 'critical', label: '매우 위험 (깡통전세 경고)', color: '#e53e3e' }
    if (jeonseRatio >= 70) return { level: 'warning', label: '주의 (높은 전세가율)', color: '#dd6b20' }
    return { level: 'safe', label: '안전 (적정 범위)', color: '#38a169' }
}
