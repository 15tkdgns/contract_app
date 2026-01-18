/**
 * 전세사기 예방 웹앱용 - 사기 유형 데이터
 * 원본: constract/src/components/FraudCaseVisualization.jsx 에서 추출
 */

export const fraudCases = [
    {
        id: 1,
        title: '깡통전세',
        subtitle: '전세가율 과도',
        riskLevel: 'critical',
        description: '매매가 대비 전세보증금이 과도하여 시세 하락 시 보증금 미회수',
        checkPoints: [
            { item: '전세가율 확인', question: '전세가율이 80% 이상인가요?', riskIfYes: true },
            { item: '시세 비교', question: '주변 시세와 비교해보셨나요?', riskIfNo: true },
            { item: '보증보험', question: '전세보증보험 가입 가능한가요?', riskIfNo: true }
        ],
        riskyBehaviors: [
            '시세 확인 없이 저렴하다고 바로 계약',
            '전세가율 80% 이상 물건에 계약',
            '주변 시세 비교 없이 중개사 말만 신뢰',
            '급매물이라는 이유로 검증 생략',
            '보증보험 가입 여부 미확인'
        ],
        safeBehaviors: [
            '국토부 실거래가, KB시세 등으로 시세 직접 확인',
            '전세가율 70% 이하 물건 선택',
            '같은 단지 3개 이상 매물 가격 비교',
            '전세보증보험 가입 가능 여부 사전 확인',
            '시세 급락 지역(미분양 많은 곳) 피하기'
        ]
    },
    {
        id: 2,
        title: '소유자-임대인 불일치',
        subtitle: '명의신탁 의심',
        riskLevel: 'high',
        description: '등기부상 소유자와 계약서상 임대인이 다른 경우',
        checkPoints: [
            { item: '등기부 확인', question: '등기부등본을 직접 발급하셨나요?', riskIfNo: true },
            { item: '소유자 일치', question: '등기부 소유자와 계약서 임대인이 같은가요?', riskIfNo: true },
            { item: '본인 확인', question: '실소유자와 대면/영상통화 하셨나요?', riskIfNo: true }
        ],
        riskyBehaviors: [
            '등기부등본 확인 없이 계약',
            '대리인이라는 말만 믿고 계약',
            '신분증 사본만 받고 본인 확인 생략',
            '위임장 공증 여부 미확인',
            '실소유자와 통화/대면 없이 진행'
        ],
        safeBehaviors: [
            '인터넷등기소에서 등기부등본 직접 발급',
            '등기부 소유자와 신분증 대조',
            '실소유자 본인과 반드시 대면 또는 영상통화',
            '대리인 계약 시 공증된 위임장 요구',
            '법무사 입회 하에 계약 체결'
        ]
    },
    {
        id: 3,
        title: '보증보험 미가입',
        subtitle: '보증금 보호 불가',
        riskLevel: 'high',
        description: '임대인 파산 시 보증금 미회수 가능',
        checkPoints: [
            { item: 'HUG 가입', question: 'HUG 전세보증보험 가입 가능한가요?', riskIfNo: true },
            { item: 'SGI 가입', question: 'SGI 전세보증보험 가입 가능한가요?', riskIfNo: true },
            { item: '전입신고', question: '입주 당일 전입신고 예정인가요?', riskIfNo: true }
        ],
        riskyBehaviors: [
            '보증보험 없이 고액 전세 계약',
            '임대인이 거부한다고 보험 가입 포기',
            '보험 가입 가능 조건 미확인',
            '확정일자만 받으면 된다고 생각',
            '전입신고 미루기'
        ],
        safeBehaviors: [
            '계약 전 HUG/SGI 보험 가입 조건 확인',
            '보험 가입을 특약으로 명시',
            '보험 미가입 시 계약 파기 조항 삽입',
            '입주 당일 전입신고 + 확정일자',
            '보증금반환보증 가입 완료 후 잔금 지급'
        ]
    },
    {
        id: 4,
        title: '선순위 권리 과다',
        subtitle: '회수 불가',
        riskLevel: 'critical',
        description: '내 보증금보다 선순위 채권이 많아 경매 시 회수 불가',
        checkPoints: [
            { item: '근저당 확인', question: '등기부 을구(근저당)를 확인하셨나요?', riskIfNo: true },
            { item: '선순위 합계', question: '근저당 + 선순위가 시세의 70% 이하인가요?', riskIfNo: true },
            { item: '법무사 분석', question: '법무사에게 권리분석 받으셨나요?', riskIfNo: true }
        ],
        riskyBehaviors: [
            '등기부 을구(근저당) 확인 생략',
            '근저당 금액이 높아도 괜찮다고 믿음',
            '선순위 임차인 존재 여부 미확인',
            '경매 시 배당순위 이해 부족',
            '법무사 권리분석 없이 계약'
        ],
        safeBehaviors: [
            '등기부 을구에서 근저당 총액 확인',
            '(근저당 + 선순위 임차보증금) < 시세 70% 확인',
            '임차권등기 또는 전입 순위 확인',
            '법무사에게 권리분석 의뢰',
            '배당순위 시뮬레이션 후 계약'
        ]
    },
    {
        id: 5,
        title: '대리인 계약 사기',
        subtitle: '위임장 위조',
        riskLevel: 'critical',
        description: '위조된 위임장으로 대리인이 계약하여 보증금 편취',
        checkPoints: [
            { item: '위임장 공증', question: '위임장이 공증되어 있나요?', riskIfNo: true },
            { item: '실소유자 확인', question: '실소유자와 직접 통화/영상통화 하셨나요?', riskIfNo: true },
            { item: '송금 계좌', question: '실소유자 명의 계좌로 송금하나요?', riskIfNo: true }
        ],
        riskyBehaviors: [
            '대리인 계약이라는 말에 그냥 수긍',
            '위임장 원본 미확인 (사본만 봄)',
            '공증 여부 확인 생략',
            '실소유자에게 전화/영상 확인 안함',
            '대리인 계좌로 보증금 송금'
        ],
        safeBehaviors: [
            '위임장 원본 및 공증 확인 필수',
            '실소유자 본인에게 직접 영상통화',
            '실소유자 계좌로만 보증금 송금',
            '법무사 입회 하에 계약',
            '인감증명서 발급일자 확인 (최근 3개월 이내)'
        ]
    },
    {
        id: 6,
        title: '이중계약 사기',
        subtitle: '동일 물건 다수 계약',
        riskLevel: 'critical',
        description: '같은 물건에 여러 명과 계약하여 보증금 다중 수령',
        checkPoints: [
            { item: '전입신고', question: '입주 즉시 전입신고 예정인가요?', riskIfNo: true },
            { item: '확정일자', question: '입주 당일 확정일자 받을 예정인가요?', riskIfNo: true },
            { item: '현 거주자', question: '현재 거주자가 있는지 확인하셨나요?', riskIfNo: true }
        ],
        riskyBehaviors: [
            '급하다는 말에 서류 검토 생략',
            '현금으로 계약금 지급',
            '전입신고를 나중에 하겠다고 미룸',
            '확정일자 받는 것을 귀찮아함',
            '현 거주자 확인 없이 계약'
        ],
        safeBehaviors: [
            '입주 즉시 전입신고 + 확정일자',
            '계약 전 현 거주자 유무 확인',
            '이웃에게 해당 집 거주 이력 탐문',
            '계좌이체로 보증금 송금 (증거 확보)',
            '잔금 전날 등기부 재발급 확인'
        ]
    },
    {
        id: 7,
        title: '전세 사기단',
        subtitle: '조직적 사기',
        riskLevel: 'critical',
        description: '중개사-임대인-법무사가 공모한 조직적 전세 사기',
        checkPoints: [
            { item: '중개사 자격', question: '공인중개사 자격증을 확인하셨나요?', riskIfNo: true },
            { item: '등기부 직접 발급', question: '등기부를 직접 인터넷등기소에서 발급하셨나요?', riskIfNo: true },
            { item: '법무사 선정', question: '법무사를 직접 선정하셨나요?', riskIfNo: true }
        ],
        riskyBehaviors: [
            '중개사가 소개한 법무사만 이용',
            '중개사와 임대인이 친한 것을 무시',
            '시세 대비 너무 저렴해도 그냥 계약',
            '서류를 중개사가 다 처리해준다고 맡김',
            '등기부를 직접 발급하지 않음'
        ],
        safeBehaviors: [
            '공인중개사 자격증 조회 (국가자격포털)',
            '등기부등본 직접 인터넷등기소에서 발급',
            '법무사도 직접 선정 (중개사 추천 거부)',
            '시세 대비 10% 이상 저렴하면 이유 확인',
            '이웃에게 임대인 정보 탐문'
        ]
    },
    {
        id: 8,
        title: '근저당 급증 사기',
        subtitle: '계약 후 권리 변동',
        riskLevel: 'high',
        description: '계약 체결 후 잔금 전까지 근저당 추가 설정',
        checkPoints: [
            { item: '잔금일 등기부', question: '잔금 당일 등기부 재확인 예정인가요?', riskIfNo: true },
            { item: '특약 조항', question: '권리변동 금지 특약이 있나요?', riskIfNo: true },
            { item: '에스크로', question: '법무사 에스크로를 이용하나요?', riskIfNo: true }
        ],
        riskyBehaviors: [
            '계약 후 잔금까지 등기부 재확인 안함',
            '특약에 권리변동 금지 조항 누락',
            '잔금 지급 전 등기부 미확인',
            '계약서에 위반 시 배상 조항 없음',
            '계약-잔금 사이 기간이 너무 긴 계약'
        ],
        safeBehaviors: [
            '계약서에 "권리변동 시 계약 해지" 특약',
            '잔금 당일 아침 등기부 재확인',
            '법무사 에스크로 활용',
            '계약-잔금 사이 기간 최소화 (2주 이내)',
            '등기부 변동 알림 서비스 활용'
        ]
    }
];

/**
 * 위험도 레벨 정의
 */
export const riskLevels = {
    critical: { label: '매우 위험', color: '#dc2626', score: 100 },
    high: { label: '위험', color: '#f59e0b', score: 70 },
    medium: { label: '주의', color: '#3b82f6', score: 40 },
    low: { label: '안전', color: '#22c55e', score: 10 }
};

/**
 * 체크리스트 기반 위험도 계산
 * @param {Array} answers - { caseId, checkPointIndex, answer: boolean }
 * @returns {Object} { score, level, details }
 */
export function calculateRiskScore(answers) {
    let riskPoints = 0;
    let totalPoints = 0;
    
    answers.forEach(({ caseId, checkPointIndex, answer }) => {
        const fraudCase = fraudCases.find(c => c.id === caseId);
        if (fraudCase && fraudCase.checkPoints[checkPointIndex]) {
            const checkPoint = fraudCase.checkPoints[checkPointIndex];
            totalPoints += 1;
            
            // riskIfYes: Yes일 때 위험, riskIfNo: No일 때 위험
            if ((checkPoint.riskIfYes && answer) || (checkPoint.riskIfNo && !answer)) {
                riskPoints += 1;
            }
        }
    });
    
    const score = totalPoints > 0 ? Math.round((riskPoints / totalPoints) * 100) : 0;
    
    let level;
    if (score >= 70) level = 'critical';
    else if (score >= 40) level = 'high';
    else if (score >= 20) level = 'medium';
    else level = 'low';
    
    return {
        score,
        level,
        label: riskLevels[level].label,
        color: riskLevels[level].color
    };
}
