/**
 * PDF Service - 분석 보고서 PDF 생성
 * jsPDF를 사용하여 클라이언트에서 PDF를 생성합니다.
 */

import jsPDF from 'jspdf'

/**
 * 분석 결과 PDF 보고서 생성
 * @param {Object} result - 분석 결과 객체
 */
export async function generatePdfReport(result) {
    const doc = new jsPDF()

    let yPos = 20

    // 제목
    doc.setFontSize(20)
    doc.setTextColor(26, 86, 219) // accent-primary 색상
    doc.text('전세사기 위험 분석 보고서', 105, yPos, { align: 'center' })
    yPos += 15

    // 생성 일시
    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139) // text-secondary
    doc.text(`생성일: ${new Date().toLocaleDateString('ko-KR')}`, 105, yPos, { align: 'center' })
    yPos += 20

    // 종합 점수
    doc.setFontSize(14)
    doc.setTextColor(30, 41, 59) // text-primary
    doc.text('종합 위험도 점수', 20, yPos)
    yPos += 10

    const scoreColor = getScoreColor(result.overallScore)
    doc.setFontSize(36)
    doc.setTextColor(...scoreColor)
    doc.text(`${result.overallScore}점`, 20, yPos)

    doc.setFontSize(14)
    doc.text(getRiskLevelText(result.overallRiskLevel), 60, yPos)
    yPos += 20

    // 구분선
    doc.setDrawColor(226, 232, 240)
    doc.line(20, yPos, 190, yPos)
    yPos += 15

    // 발견된 위험 요소
    if (result.issues && result.issues.length > 0) {
        doc.setFontSize(14)
        doc.setTextColor(30, 41, 59)
        doc.text('발견된 위험 요소', 20, yPos)
        yPos += 10

        doc.setFontSize(11)
        result.issues.forEach((issue, index) => {
            if (yPos > 270) {
                doc.addPage()
                yPos = 20
            }

            const severityColor = getSeverityColor(issue.severity)
            doc.setTextColor(...severityColor)
            doc.text(`${index + 1}. [${getSeverityText(issue.severity)}] ${issue.type}`, 25, yPos)
            yPos += 6

            doc.setTextColor(100, 116, 139)
            doc.text(`   ${issue.message}`, 25, yPos)
            yPos += 10
        })
        yPos += 10
    }

    // 8가지 사기 유형 체크
    doc.setFontSize(14)
    doc.setTextColor(30, 41, 59)
    doc.text('8가지 사기 유형 체크 결과', 20, yPos)
    yPos += 10

    doc.setFontSize(10)
    result.fraudChecks?.forEach((check, index) => {
        if (yPos > 270) {
            doc.addPage()
            yPos = 20
        }

        const status = check.passed ? '[O]' : '[X]'
        const statusColor = check.passed ? [34, 197, 94] : [220, 38, 38]

        doc.setTextColor(...statusColor)
        doc.text(status, 25, yPos)

        doc.setTextColor(30, 41, 59)
        doc.text(`${check.title} - ${check.description}`, 35, yPos)
        yPos += 7
    })
    yPos += 10

    // 권장사항
    if (result.recommendations && result.recommendations.length > 0) {
        if (yPos > 240) {
            doc.addPage()
            yPos = 20
        }

        doc.setFontSize(14)
        doc.setTextColor(30, 41, 59)
        doc.text('권장사항', 20, yPos)
        yPos += 10

        doc.setFontSize(10)
        doc.setTextColor(100, 116, 139)
        result.recommendations.forEach((rec, index) => {
            if (yPos > 270) {
                doc.addPage()
                yPos = 20
            }

            const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, 165)
            lines.forEach(line => {
                doc.text(line, 25, yPos)
                yPos += 5
            })
            yPos += 3
        })
    }

    // 푸터
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(148, 163, 184)
        doc.text(
            'Constract App - 본 보고서는 참고용이며 법적 효력이 없습니다.',
            105,
            285,
            { align: 'center' }
        )
        doc.text(`${i} / ${pageCount}`, 190, 285, { align: 'right' })
    }

    // 다운로드
    const fileName = `전세사기분석_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
}

// 유틸리티 함수들
function getScoreColor(score) {
    if (score >= 80) return [34, 197, 94]   // success
    if (score >= 60) return [245, 158, 11]  // warning
    if (score >= 40) return [220, 38, 38]   // danger
    return [153, 27, 27]                     // critical
}

function getRiskLevelText(level) {
    switch (level) {
        case 'critical': return '매우 위험'
        case 'high': return '위험'
        case 'medium': return '주의'
        default: return '안전'
    }
}

function getSeverityColor(severity) {
    switch (severity) {
        case 'critical': return [153, 27, 27]
        case 'high': return [220, 38, 38]
        case 'warning': return [245, 158, 11]
        default: return [100, 116, 139]
    }
}

function getSeverityText(severity) {
    switch (severity) {
        case 'critical': return '매우 위험'
        case 'high': return '위험'
        case 'warning': return '주의'
        default: return '정보'
    }
}
