/**
 * baseGraphTemplate.js
 * 기본 계약 관계도 템플릿 및 특이사항 확장 로직
 */

import { NODE_TYPES, EDGE_TYPES, NODE_ROLES } from './graphSchema';
import { generateNodeId, generateEdgeId } from '../utils/graphUtils';

// ============================================
// 기본 노드 템플릿 (모든 계약서 공통)
// ============================================
export const createBaseNodes = (contractData = {}) => [
    {
        id: generateNodeId(NODE_TYPES.PERSON, 1),
        type: NODE_TYPES.PERSON,
        role: NODE_ROLES.LANDLORD,
        label: '임대인',
        value: contractData.landlord || '정보 없음',
        properties: {
            name: contractData.landlord,
            trustScore: null  // AI 분석 후 채워짐
        }
    },
    {
        id: generateNodeId(NODE_TYPES.PERSON, 2),
        type: NODE_TYPES.PERSON,
        role: NODE_ROLES.TENANT,
        label: '임차인',
        value: contractData.tenant || '정보 없음',
        properties: {
            name: contractData.tenant
        }
    },
    {
        id: generateNodeId(NODE_TYPES.PROPERTY, 1),
        type: NODE_TYPES.PROPERTY,
        label: '부동산',
        value: contractData.address || '정보 없음',
        properties: {
            address: contractData.address,
            area: contractData.area,
            marketPrice: contractData.marketPrice
        }
    },
    {
        id: generateNodeId(NODE_TYPES.MONEY, 1),
        type: NODE_TYPES.MONEY,
        role: NODE_ROLES.DEPOSIT,
        label: '보증금',
        value: contractData.deposit,
        properties: {
            amount: contractData.deposit
        }
    },
    {
        id: generateNodeId(NODE_TYPES.DATE, 1),
        type: NODE_TYPES.DATE,
        role: NODE_ROLES.START_DATE,
        label: '계약기간',
        value: contractData.startDate
            ? `${contractData.startDate} ~ ${contractData.endDate || ''}`
            : '정보 없음',
        properties: {
            startDate: contractData.startDate,
            endDate: contractData.endDate
        }
    }
];

// ============================================
// 기본 엣지 템플릿 (모든 계약서 공통)
// ============================================
export const createBaseEdges = () => {
    const landlordId = generateNodeId(NODE_TYPES.PERSON, 1);
    const tenantId = generateNodeId(NODE_TYPES.PERSON, 2);
    const propertyId = generateNodeId(NODE_TYPES.PROPERTY, 1);
    const depositId = generateNodeId(NODE_TYPES.MONEY, 1);

    return [
        {
            id: generateEdgeId(landlordId, propertyId, EDGE_TYPES.OWNS),
            source: landlordId,
            target: propertyId,
            type: EDGE_TYPES.OWNS,
            label: '소유',
            properties: {}
        },
        {
            id: generateEdgeId(tenantId, propertyId, EDGE_TYPES.LEASES),
            source: tenantId,
            target: propertyId,
            type: EDGE_TYPES.LEASES,
            label: '임차',
            properties: {}
        },
        {
            id: generateEdgeId(tenantId, depositId, EDGE_TYPES.PAYS),
            source: tenantId,
            target: depositId,
            type: EDGE_TYPES.PAYS,
            label: '지급',
            properties: {}
        }
    ];
};

// ============================================
// 특이사항 확장 함수
// ============================================
let nodeCounter = { right: 0, institution: 0, person: 2 };

const resetCounters = () => {
    nodeCounter = { right: 0, institution: 0, person: 2 };
};

/**
 * 분석 결과에 따라 그래프 확장
 * @param {Object} baseGraph - 기본 그래프 { nodes: [], edges: [] }
 * @param {Object} analysisResult - AI 분석 결과
 * @returns {Object} 확장된 그래프
 */
export const extendGraph = (baseGraph, analysisResult = {}) => {
    resetCounters();

    const extendedNodes = [...baseGraph.nodes];
    const extendedEdges = [...baseGraph.edges];

    const propertyId = generateNodeId(NODE_TYPES.PROPERTY, 1);
    const tenantId = generateNodeId(NODE_TYPES.PERSON, 2);
    const landlordId = generateNodeId(NODE_TYPES.PERSON, 1);

    // 1. 근저당권이 있는 경우
    if (analysisResult.mortgageAmount > 0) {
        nodeCounter.right++;
        nodeCounter.institution++;

        const mortgageId = generateNodeId(NODE_TYPES.RIGHT, nodeCounter.right);
        const bankId = generateNodeId(NODE_TYPES.INSTITUTION, nodeCounter.institution);

        extendedNodes.push({
            id: mortgageId,
            type: NODE_TYPES.RIGHT,
            role: NODE_ROLES.MORTGAGE,
            label: '근저당권',
            value: analysisResult.mortgageAmount,
            isRisk: true,
            properties: {
                amount: analysisResult.mortgageAmount,
                priority: analysisResult.mortgagePriority || 1,
                holder: analysisResult.mortgageHolder || '금융기관'
            }
        });

        extendedNodes.push({
            id: bankId,
            type: NODE_TYPES.INSTITUTION,
            role: NODE_ROLES.BANK,
            label: analysisResult.mortgageHolder || '은행',
            value: analysisResult.mortgageHolder || '금융기관',
            properties: {}
        });

        extendedEdges.push({
            id: generateEdgeId(bankId, propertyId, EDGE_TYPES.MORTGAGE),
            source: bankId,
            target: propertyId,
            type: EDGE_TYPES.MORTGAGE,
            label: '담보',
            isRisk: true,
            properties: {
                amount: analysisResult.mortgageAmount,
                priority: analysisResult.mortgagePriority || 1
            }
        });
    }

    // 2. 가압류가 있는 경우
    if (analysisResult.hasSeizure || analysisResult.seizureAmount > 0) {
        nodeCounter.right++;

        const seizureId = generateNodeId(NODE_TYPES.RIGHT, nodeCounter.right);

        extendedNodes.push({
            id: seizureId,
            type: NODE_TYPES.RIGHT,
            role: NODE_ROLES.SEIZURE,
            label: '가압류',
            value: analysisResult.seizureAmount || '확인 필요',
            isRisk: true,
            properties: {
                amount: analysisResult.seizureAmount,
                creditor: analysisResult.seizureCreditor
            }
        });

        extendedEdges.push({
            id: generateEdgeId(seizureId, propertyId, EDGE_TYPES.SEIZURE),
            source: seizureId,
            target: propertyId,
            type: EDGE_TYPES.SEIZURE,
            label: '압류',
            isRisk: true,
            properties: {}
        });
    }

    // 3. 대리인이 있는 경우
    if (analysisResult.isProxy || analysisResult.proxyName) {
        nodeCounter.person++;

        const proxyId = generateNodeId(NODE_TYPES.PERSON, nodeCounter.person);

        extendedNodes.push({
            id: proxyId,
            type: NODE_TYPES.PERSON,
            role: NODE_ROLES.PROXY,
            label: '대리인',
            value: analysisResult.proxyName || '대리인',
            isRisk: true, // 대리 계약은 주의 필요
            properties: {
                name: analysisResult.proxyName,
                relationship: analysisResult.proxyRelation
            }
        });

        extendedEdges.push({
            id: generateEdgeId(proxyId, landlordId, EDGE_TYPES.REPRESENTS),
            source: proxyId,
            target: landlordId,
            type: EDGE_TYPES.REPRESENTS,
            label: '대리',
            properties: {}
        });
    }

    // 4. 보증보험이 있는 경우
    if (analysisResult.hasInsurance) {
        nodeCounter.institution++;

        const insuranceId = generateNodeId(NODE_TYPES.INSTITUTION, nodeCounter.institution);

        extendedNodes.push({
            id: insuranceId,
            type: NODE_TYPES.INSTITUTION,
            role: NODE_ROLES.INSURANCE,
            label: '보증보험',
            value: analysisResult.insuranceCompany || 'HUG/SGI',
            properties: {
                company: analysisResult.insuranceCompany,
                coverage: analysisResult.insuranceAmount
            }
        });

        extendedEdges.push({
            id: generateEdgeId(insuranceId, tenantId, EDGE_TYPES.INSURES),
            source: insuranceId,
            target: tenantId,
            type: EDGE_TYPES.INSURES,
            label: '보장',
            properties: {
                coverage: analysisResult.insuranceAmount
            }
        });
    }

    // 5. 중개인이 있는 경우
    if (analysisResult.agentName) {
        nodeCounter.person++;

        const agentId = generateNodeId(NODE_TYPES.PERSON, nodeCounter.person);

        extendedNodes.push({
            id: agentId,
            type: NODE_TYPES.PERSON,
            role: NODE_ROLES.AGENT,
            label: '공인중개사',
            value: analysisResult.agentName,
            properties: {
                name: analysisResult.agentName,
                license: analysisResult.agentLicense
            }
        });

        // 계약 노드가 있으면 중개 관계 추가
        const contractNode = extendedNodes.find(n => n.type === NODE_TYPES.CONTRACT);
        if (contractNode) {
            extendedEdges.push({
                id: generateEdgeId(agentId, contractNode.id, EDGE_TYPES.MEDIATES),
                source: agentId,
                target: contractNode.id,
                type: EDGE_TYPES.MEDIATES,
                label: '중개',
                properties: {}
            });
        }
    }

    return {
        nodes: extendedNodes,
        edges: extendedEdges
    };
};

/**
 * 전체 그래프 생성 (기본 + 확장)
 */
export const buildCompleteGraph = (contractData, analysisResult) => {
    const baseNodes = createBaseNodes(contractData);
    const baseEdges = createBaseEdges();

    return extendGraph(
        { nodes: baseNodes, edges: baseEdges },
        analysisResult
    );
};

export default {
    createBaseNodes,
    createBaseEdges,
    extendGraph,
    buildCompleteGraph
};
