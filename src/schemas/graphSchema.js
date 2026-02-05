/**
 * graphSchema.js
 * 계약서 Knowledge Graph 스키마 정의
 * 노드 타입, 엣지 타입, 시각화 속성을 중앙 집중 관리
 */

// ============================================
// 노드 타입 정의 (7종)
// ============================================
export const NODE_TYPES = {
    PERSON: 'person',           // 임대인, 임차인, 중개인, 대리인
    PROPERTY: 'property',       // 부동산 (아파트, 주택, 빌라)
    RIGHT: 'right',             // 권리 (근저당, 가압류, 전세권)
    CONTRACT: 'contract',       // 계약 (계약서, 등기부)
    INSTITUTION: 'institution', // 기관 (은행, 보험사)
    MONEY: 'money',             // 금액 (보증금, 월세)
    DATE: 'date'                // 날짜 (계약일, 만료일)
};

// ============================================
// 엣지 타입 정의 (8종)
// ============================================
export const EDGE_TYPES = {
    OWNS: 'owns',               // 소유 (임대인 → 부동산)
    LEASES: 'leases',           // 임차 (임차인 ↔ 부동산)
    PAYS: 'pays',               // 지급 (임차인 → 보증금)
    MORTGAGE: 'mortgage',       // 담보 (은행 → 부동산)
    SEIZURE: 'seizure',         // 압류 (법원 → 부동산)
    INSURES: 'insures',         // 보장 (보험사 → 임차인)
    MEDIATES: 'mediates',       // 중개 (중개인 → 계약)
    REPRESENTS: 'represents'    // 대리 (대리인 → 임대인)
};

// ============================================
// 노드 시각화 속성
// ============================================
export const NODE_STYLES = {
    person: {
        color: '#3b82f6',
        bg: '#dbeafe',
        border: '#2563eb',
        icon: '👤',
        label: '사람'
    },
    property: {
        color: '#f59e0b',
        bg: '#fef3c7',
        border: '#d97706',
        icon: '🏠',
        label: '부동산'
    },
    right: {
        color: '#ef4444',
        bg: '#fee2e2',
        border: '#dc2626',
        icon: '🔒',
        label: '권리',
        isRisk: true  // 위험 요소 플래그
    },
    contract: {
        color: '#8b5cf6',
        bg: '#ede9fe',
        border: '#7c3aed',
        icon: '📄',
        label: '계약'
    },
    institution: {
        color: '#10b981',
        bg: '#d1fae5',
        border: '#059669',
        icon: '🏦',
        label: '기관'
    },
    money: {
        color: '#ec4899',
        bg: '#fce7f3',
        border: '#db2777',
        icon: '💰',
        label: '금액'
    },
    date: {
        color: '#06b6d4',
        bg: '#cffafe',
        border: '#0891b2',
        icon: '📅',
        label: '날짜'
    }
};

// ============================================
// 엣지 시각화 속성
// ============================================
export const EDGE_STYLES = {
    owns: {
        stroke: '#22c55e',
        style: 'solid',
        width: 2,
        label: '소유',
        animated: false
    },
    leases: {
        stroke: '#f59e0b',
        style: 'solid',
        width: 2,
        label: '임차',
        animated: false
    },
    pays: {
        stroke: '#ef4444',
        style: 'solid',
        width: 2,
        label: '지급',
        animated: false
    },
    mortgage: {
        stroke: '#dc2626',
        style: 'dashed',
        width: 3,
        label: '담보',
        animated: true,
        isRisk: true  // 위험 요소 플래그
    },
    seizure: {
        stroke: '#991b1b',
        style: 'dashed',
        width: 3,
        label: '압류',
        animated: true,
        isRisk: true
    },
    insures: {
        stroke: '#10b981',
        style: 'solid',
        width: 2,
        label: '보장',
        animated: false
    },
    mediates: {
        stroke: '#6b7280',
        style: 'dotted',
        width: 1,
        label: '중개',
        animated: false
    },
    represents: {
        stroke: '#8b5cf6',
        style: 'dotted',
        width: 1,
        label: '대리',
        animated: false
    }
};

// ============================================
// 역할(Role) 정의 - 노드의 세부 역할
// ============================================
export const NODE_ROLES = {
    // Person roles
    LANDLORD: 'landlord',
    TENANT: 'tenant',
    AGENT: 'agent',
    PROXY: 'proxy',

    // Right subtypes
    MORTGAGE: 'mortgage',
    SEIZURE: 'seizure',
    LEASE_RIGHT: 'leaseRight',

    // Institution subtypes
    BANK: 'bank',
    INSURANCE: 'insurance',
    COURT: 'court',

    // Money roles
    DEPOSIT: 'deposit',
    MONTHLY_RENT: 'monthlyRent',

    // Date roles
    CONTRACT_DATE: 'contractDate',
    START_DATE: 'startDate',
    END_DATE: 'endDate'
};

export default {
    NODE_TYPES,
    EDGE_TYPES,
    NODE_STYLES,
    EDGE_STYLES,
    NODE_ROLES
};
