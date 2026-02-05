/**
 * graphUtils.js
 * Knowledge Graph 유틸리티 함수
 */

import { NODE_TYPES, NODE_STYLES, EDGE_STYLES } from '../schemas/graphSchema';

// ============================================
// 고유 ID 생성 함수
// ============================================
const ID_PREFIXES = {
    [NODE_TYPES.PERSON]: 'person',
    [NODE_TYPES.PROPERTY]: 'prop',
    [NODE_TYPES.RIGHT]: 'right',
    [NODE_TYPES.CONTRACT]: 'cont',
    [NODE_TYPES.INSTITUTION]: 'inst',
    [NODE_TYPES.MONEY]: 'money',
    [NODE_TYPES.DATE]: 'date'
};

/**
 * 노드 고유 ID 생성
 * @param {string} type - 노드 타입
 * @param {number} index - 인덱스 번호
 * @returns {string} 고유 ID (예: person_001)
 */
export const generateNodeId = (type, index = 0) => {
    const prefix = ID_PREFIXES[type] || 'node';
    return `${prefix}_${String(index).padStart(3, '0')}`;
};

/**
 * 엣지 고유 ID 생성
 * @param {string} source - 출발 노드 ID
 * @param {string} target - 도착 노드 ID
 * @param {string} type - 엣지 타입
 * @returns {string} 고유 ID (예: edge_person_001_prop_001_owns)
 */
export const generateEdgeId = (source, target, type) => {
    return `edge_${source}_${target}_${type}`;
};

// ============================================
// 금액 포맷팅
// ============================================
export const formatMoney = (value) => {
    if (!value) return '미확인';

    const num = typeof value === 'number'
        ? value
        : parseInt(String(value).replace(/[^0-9]/g, ''), 10);

    if (isNaN(num)) return String(value);

    if (num >= 100000000) {
        return `${(num / 100000000).toFixed(1)}억원`;
    }
    return `${(num / 10000).toLocaleString()}만원`;
};

// ============================================
// 노드 스타일 생성
// ============================================
export const getNodeStyle = (type, isHighRisk = false) => {
    const baseStyle = NODE_STYLES[type] || NODE_STYLES.person;

    return {
        background: baseStyle.bg,
        border: `2px ${isHighRisk ? 'dashed' : 'solid'} ${baseStyle.border}`,
        borderRadius: 8,
        padding: 0,
        minWidth: 120,
        boxShadow: isHighRisk ? `0 0 8px ${baseStyle.color}` : 'none'
    };
};

// ============================================
// 엣지 스타일 생성
// ============================================
export const getEdgeStyle = (type) => {
    const style = EDGE_STYLES[type] || EDGE_STYLES.owns;

    return {
        stroke: style.stroke,
        strokeWidth: style.width,
        strokeDasharray: style.style === 'dashed' ? '5,5' :
            style.style === 'dotted' ? '2,2' : 'none'
    };
};

// ============================================
// 날짜 포맷팅
// ============================================
export const formatDate = (dateStr) => {
    if (!dateStr) return '미확인';

    try {
        const date = new Date(dateStr);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    } catch {
        return dateStr;
    }
};

// ============================================
// 위험도 계산 (권리 노드 기준)
// ============================================
export const calculateRiskFromRights = (nodes) => {
    const rightNodes = nodes.filter(n => n.type === NODE_TYPES.RIGHT);

    if (rightNodes.length === 0) return 'safe';

    const hasMortgage = rightNodes.some(n => n.role === 'mortgage');
    const hasSeizure = rightNodes.some(n => n.role === 'seizure');

    if (hasSeizure) return 'critical';
    if (hasMortgage) return 'warning';
    return 'safe';
};

export default {
    generateNodeId,
    generateEdgeId,
    formatMoney,
    formatDate,
    getNodeStyle,
    getEdgeStyle,
    calculateRiskFromRights
};
