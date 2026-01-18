import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './RightsStackChart.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RightsStackChart = ({ contract }) => {
    const formatCurrency = (value) => {
        if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억`;
        return `${(value / 10000000).toFixed(0)}천만`;
    };

    const chartData = {
        labels: ['권리관계'],
        datasets: [
            {
                label: '선순위 근저당',
                data: [contract.rights.seniorMortgage],
                backgroundColor: '#ef4444',
                borderRadius: 4,
            },
            {
                label: '선순위 임차인',
                data: [contract.rights.seniorTenant],
                backgroundColor: '#f97316',
                borderRadius: 4,
            },
            {
                label: '내 보증금',
                data: [contract.rights.myDeposit],
                backgroundColor: '#3b82f6',
                borderRadius: 4,
            },
            {
                label: '예상 회수 가능',
                data: [contract.rights.expectedRecovery],
                backgroundColor: '#22c55e',
                borderRadius: 4,
            },
        ],
    };

    const options = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#64748b',
                    padding: 16,
                    font: { family: "'Noto Sans KR', sans-serif", size: 11 },
                    usePointStyle: true,
                },
            },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 10,
                callbacks: {
                    label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}원`,
                },
            },
        },
        scales: {
            x: {
                stacked: true,
                grid: { color: '#f1f5f9' },
                ticks: {
                    color: '#64748b',
                    callback: (v) => formatCurrency(v),
                },
                max: contract.financial.appraisalValue,
            },
            y: {
                stacked: true,
                grid: { display: false },
                ticks: { display: false },
            },
        },
    };

    const recoveryRate = Math.round((contract.rights.expectedRecovery / contract.rights.myDeposit) * 100);

    return (
        <div className="rights-card card">
            <div className="card-header">
                <div className="card-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                </div>
                <h2 className="card-title">권리관계 분석</h2>
            </div>

            <div className="stats-row">
                <div className="stat-item">
                    <span className="stat-label">감정가</span>
                    <span className="stat-value">{formatCurrency(contract.financial.appraisalValue)}원</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">총 채무</span>
                    <span className="stat-value danger">{formatCurrency(contract.rights.totalLiability)}원</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">예상 회수율</span>
                    <span className={`stat-value ${recoveryRate >= 80 ? 'success' : recoveryRate >= 50 ? 'warning' : 'danger'}`}>
                        {recoveryRate}%
                    </span>
                </div>
            </div>

            <div className="chart-wrapper">
                <Bar data={chartData} options={options} />
            </div>

            <div className="recovery-box">
                <div className="recovery-info">
                    <span className="recovery-label">경매 시 예상 회수 가능 금액</span>
                    <span className="recovery-value">{formatCurrency(contract.rights.expectedRecovery)}원</span>
                </div>
                <span className={`recovery-badge ${recoveryRate >= 80 ? 'success' : recoveryRate >= 50 ? 'warning' : 'danger'}`}>
                    {recoveryRate >= 80 ? '안전' : recoveryRate >= 50 ? '주의' : '위험'}
                </span>
            </div>
        </div>
    );
};

export default RightsStackChart;
