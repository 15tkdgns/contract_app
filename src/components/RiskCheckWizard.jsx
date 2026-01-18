import React, { useState } from 'react';
import './RiskCheckWizard.css';

const RiskCheckWizard = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showResult, setShowResult] = useState(false);

    const questions = [
        {
            id: 'owner-match',
            question: '등기부상 소유자와 임대인이 일치하나요?',
            icon: '📋',
            yesScore: 0,
            noScore: 30,
            yesText: '일치',
            noText: '불일치',
        },
        {
            id: 'jeonse-ratio',
            question: '전세가율이 80% 이하인가요?',
            icon: '📊',
            yesScore: 0,
            noScore: 25,
            yesText: '80% 이하',
            noText: '80% 초과',
        },
        {
            id: 'mortgage',
            question: '근저당/전세권 설정이 없거나 적정 수준인가요?',
            icon: '🏦',
            yesScore: 0,
            noScore: 20,
            yesText: '적정',
            noText: '과다',
        },
        {
            id: 'insurance',
            question: '전세보증보험(HUG/SGI) 가입이 가능한가요?',
            icon: '🛡️',
            yesScore: 0,
            noScore: 15,
            yesText: '가능',
            noText: '불가',
        },
        {
            id: 'broker-license',
            question: '공인중개사 자격이 확인되었나요?',
            icon: '✅',
            yesScore: 0,
            noScore: 10,
            yesText: '확인됨',
            noText: '미확인',
        },
    ];

    const handleAnswer = (answer) => {
        const newAnswers = { ...answers, [questions[currentStep].id]: answer };
        setAnswers(newAnswers);

        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setShowResult(true);
        }
    };

    const calculateRiskScore = () => {
        let score = 0;
        questions.forEach(q => {
            if (answers[q.id] === 'no') {
                score += q.noScore;
            }
        });
        return score;
    };

    const getRiskLevel = (score) => {
        if (score <= 15) return { level: '안전', color: '#22c55e', bg: '#dcfce7', emoji: '✅' };
        if (score <= 35) return { level: '주의', color: '#f59e0b', bg: '#fef3c7', emoji: '⚠️' };
        if (score <= 60) return { level: '위험', color: '#ef4444', bg: '#fee2e2', emoji: '🚨' };
        return { level: '고위험', color: '#dc2626', bg: '#fecaca', emoji: '🚫' };
    };

    const getRecommendation = (score) => {
        if (score <= 15) return '이 매물은 상대적으로 안전해 보입니다. 계약 진행을 검토해 볼 수 있습니다.';
        if (score <= 35) return '몇 가지 주의사항이 있습니다. 추가 확인 후 신중하게 결정하세요.';
        if (score <= 60) return '위험 요소가 있습니다. 전문가 상담을 권장합니다.';
        return '이 매물은 전세 사기 위험이 높습니다. 계약을 재고하세요.';
    };

    const resetWizard = () => {
        setCurrentStep(0);
        setAnswers({});
        setShowResult(false);
    };

    const progress = ((currentStep) / questions.length) * 100;

    if (showResult) {
        const score = calculateRiskScore();
        const risk = getRiskLevel(score);

        return (
            <div className="wizard-card card">
                <div className="card-header">
                    <div className="card-icon wizard-bg">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 11l3 3L22 4" />
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                    </div>
                    <h2 className="card-title">전세 위험 체크 결과</h2>
                </div>

                <div className="wizard-result">
                    <div className="result-score" style={{ backgroundColor: risk.bg, borderColor: risk.color }}>
                        <span className="result-emoji">{risk.emoji}</span>
                        <span className="result-level" style={{ color: risk.color }}>{risk.level}</span>
                        <span className="result-number">위험 점수: {score}점</span>
                    </div>

                    <div className="result-summary">
                        <p>{getRecommendation(score)}</p>
                    </div>

                    <div className="result-details">
                        <h4>응답 요약</h4>
                        {questions.map(q => (
                            <div key={q.id} className={`result-item ${answers[q.id]}`}>
                                <span className="result-icon">{q.icon}</span>
                                <span className="result-question">{q.question}</span>
                                <span className={`result-answer ${answers[q.id]}`}>
                                    {answers[q.id] === 'yes' ? q.yesText : q.noText}
                                </span>
                            </div>
                        ))}
                    </div>

                    <button className="wizard-btn reset" onClick={resetWizard}>
                        다시 체크하기
                    </button>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentStep];

    return (
        <div className="wizard-card card">
            <div className="card-header">
                <div className="card-icon wizard-bg">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                </div>
                <h2 className="card-title">전세 위험 체크 위저드</h2>
                <span className="wizard-step">{currentStep + 1} / {questions.length}</span>
            </div>

            <div className="wizard-progress">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="wizard-content">
                <div className="question-icon">{currentQ.icon}</div>
                <h3 className="question-text">{currentQ.question}</h3>

                <div className="answer-buttons">
                    <button className="wizard-btn yes" onClick={() => handleAnswer('yes')}>
                        {currentQ.yesText}
                    </button>
                    <button className="wizard-btn no" onClick={() => handleAnswer('no')}>
                        {currentQ.noText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RiskCheckWizard;
