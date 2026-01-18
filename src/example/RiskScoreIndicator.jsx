import React, { useEffect, useState } from 'react';
import './RiskScoreIndicator.css';

const RiskScoreIndicator = ({ risk }) => {
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        const duration = 1000;
        const steps = 40;
        const increment = risk.score / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= risk.score) {
                setAnimatedScore(risk.score);
                clearInterval(timer);
            } else {
                setAnimatedScore(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [risk.score]);

    const getScoreColor = (score) => {
        if (score >= 80) return 'var(--color-success)';
        if (score >= 60) return 'var(--color-warning)';
        return 'var(--color-danger)';
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return { text: '안전', class: 'success' };
        if (score >= 60) return { text: '주의', class: 'warning' };
        return { text: '위험', class: 'danger' };
    };

    const scoreColor = getScoreColor(animatedScore);
    const scoreLabel = getScoreLabel(animatedScore);
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

    return (
        <div className="risk-card card">
            <div className="card-header">
                <div className="card-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                </div>
                <h2 className="card-title">리스크 점수</h2>
            </div>

            <div className="risk-content">
                <div className="gauge-container">
                    <svg className="gauge" viewBox="0 0 100 100">
                        <circle
                            className="gauge-bg"
                            cx="50" cy="50" r="45"
                            fill="none" strokeWidth="8"
                        />
                        <circle
                            className="gauge-progress"
                            cx="50" cy="50" r="45"
                            fill="none" strokeWidth="8"
                            strokeLinecap="round"
                            style={{
                                stroke: scoreColor,
                                strokeDasharray: circumference,
                                strokeDashoffset: strokeDashoffset,
                            }}
                        />
                    </svg>
                    <div className="gauge-center">
                        <span className="score" style={{ color: scoreColor }}>{animatedScore}</span>
                        <span className="score-max">/ 100</span>
                    </div>
                </div>
                <span className={`level-badge ${scoreLabel.class}`}>{scoreLabel.text}</span>
            </div>

            <div className="risk-list">
                <h4 className="risk-list-title">주요 위험 요소</h4>
                {risk.topRisks.map((item, index) => (
                    <div key={index} className="risk-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{item}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RiskScoreIndicator;
