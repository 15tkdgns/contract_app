/**
 * 시각화 예시 - 사기 사례별 차트 데이터
 * 원본: constract/src/components/FraudCaseVisualization.jsx 에서 추출
 */

/**
 * Case 1: 깡통전세 - 게이지 차트 데이터
 */
export const gaugeChartExample = {
    type: 'gauge',
    data: {
        jeonseRatio: 95,           // 전세가율 %
        marketPrice: 800000000,    // 매매가 8억
        deposit: 760000000,        // 보증금 7.6억
        expectedLoss: 200000000    // 예상 손실 2억
    },
    // 게이지 색상 구간
    zones: [
        { min: 0, max: 60, color: '#22c55e', label: '안전' },
        { min: 60, max: 70, color: '#3b82f6', label: '주의' },
        { min: 70, max: 80, color: '#f59e0b', label: '위험' },
        { min: 80, max: 100, color: '#dc2626', label: '매우 위험' }
    ]
};

/**
 * Case 2: 소유자-임대인 불일치 - 비교 박스 데이터
 */
export const mismatchChartExample = {
    type: 'mismatch',
    data: {
        registryOwner: '김철수',     // 등기부 소유자
        contractLandlord: '이영희',  // 계약서 임대인
        match: false                 // 일치 여부
    }
};

/**
 * Case 3: 보증보험 미가입 - 상태 표시 데이터
 */
export const insuranceChartExample = {
    type: 'insurance',
    data: {
        hasHUG: false,              // HUG 가입 여부
        hasSGI: false,              // SGI 가입 여부
        deposit: 350000000          // 보증금 3.5억
    }
};

/**
 * Case 4: 선순위 권리 과다 - 스택 바 차트 데이터
 */
export const stackChartExample = {
    type: 'stack',
    data: {
        appraisalValue: 1000000000, // 감정가 10억
        seniorMortgage: 400000000,  // 선순위 근저당 4억
        seniorTenant: 300000000,    // 선순위 임차인 3억
        myDeposit: 400000000,       // 내 보증금 4억
        expectedRecovery: 100000000 // 예상 회수 1억
    },
    // 스택 레이어 색상
    colors: {
        seniorMortgage: '#dc2626',  // 빨강
        seniorTenant: '#f59e0b',    // 주황
        myDeposit: '#3b82f6'        // 파랑
    }
};

/**
 * Case 5: 대리인 계약 사기 - 위임 관계도 데이터
 */
export const delegationChartExample = {
    type: 'delegation',
    data: {
        owner: '김철수 (실소유자)',
        agent: '박사기 (가짜 대리인)',
        hasNotarizedPOA: false,     // 위임장 공증 여부
        ownerVerified: false        // 본인 확인 여부
    }
};

/**
 * Case 6: 이중계약 사기 - 타임라인 데이터
 */
export const timelineChartExample = {
    type: 'timeline',
    data: {
        events: [
            { date: '1월 5일', event: 'A씨 계약', amount: 300000000, status: 'danger' },
            { date: '1월 8일', event: 'B씨 계약', amount: 280000000, status: 'danger' },
            { date: '1월 12일', event: 'C씨 계약 (나)', amount: 290000000, status: 'current' },
            { date: '1월 15일', event: '임대인 잠적', amount: 0, status: 'critical' }
        ]
    },
    // 상태별 색상
    colors: {
        danger: '#dc2626',
        current: '#3b82f6',
        critical: '#7c2d12'
    }
};

/**
 * Case 7: 전세 사기단 - 네트워크 그래프 데이터
 */
export const networkChartExample = {
    type: 'network',
    data: {
        nodes: [
            { id: 'broker', label: '공인중개사 A', role: '미끼 유인' },
            { id: 'landlord', label: '가짜 임대인 B', role: '계약 체결' },
            { id: 'lawyer', label: '가담 법무사 C', role: '서류 위조' },
            { id: 'victim', label: '피해자', role: '보증금 손실' }
        ],
        connections: [
            { from: 'broker', to: 'landlord' },
            { from: 'landlord', to: 'lawyer' },
            { from: 'broker', to: 'victim' }
        ]
    },
    // 노드 스타일
    nodeStyles: {
        criminal: { background: '#fef2f2', border: '#dc2626' },
        victim: { background: '#eff6ff', border: '#3b82f6' }
    }
};

/**
 * Case 8: 근저당 급증 사기 - 권리변동 타임라인 데이터
 */
export const rightsTimelineExample = {
    type: 'rights-timeline',
    data: {
        events: [
            { date: '계약일', mortgage: 0, status: 'safe' },
            { date: '계약+3일', mortgage: 200000000, status: 'warning' },
            { date: '계약+7일', mortgage: 500000000, status: 'danger' },
            { date: '잔금일', mortgage: 800000000, status: 'critical' }
        ],
        myDeposit: 300000000
    },
    // 상태별 색상
    colors: {
        safe: '#22c55e',
        warning: '#f59e0b',
        danger: '#dc2626',
        critical: '#7c2d12'
    }
};

/**
 * 모든 시각화 예시
 */
export const allVisualizationExamples = {
    gauge: gaugeChartExample,
    mismatch: mismatchChartExample,
    insurance: insuranceChartExample,
    stack: stackChartExample,
    delegation: delegationChartExample,
    timeline: timelineChartExample,
    network: networkChartExample,
    rightsTimeline: rightsTimelineExample
};
