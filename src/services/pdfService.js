import * as pdfjsLib from 'pdfjs-dist'

// Worker 설정 (Vite 환경)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

/**
 * PDF 파일을 이미지 배열로 변환
 * @param {File} file - PDF 파일 객체
 * @returns {Promise<string[]>} - 이미지 데이터 URL 배열
 */
export async function convertPdfToImages(file) {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const images = []

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 2.0 }) // 고해상도 변환

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.height = viewport.height
        canvas.width = viewport.width

        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise

        images.push(canvas.toDataURL('image/png'))
    }

    return images
}

/**
 * PDF 리포트 생성 및 다운로드
 * @param {Object} result - 분석 결과 객체
 */
export async function generatePdfReport(result) {
    const { jsPDF } = await import('jspdf')
    const html2canvas = (await import('html2canvas')).default

    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()

    // 제목
    doc.setFontSize(20)
    doc.setTextColor(30, 64, 175)
    doc.text('Constract 분석 리포트', pageWidth / 2, 20, { align: 'center' })

    // 날짜
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`생성일: ${new Date().toLocaleDateString('ko-KR')}`, pageWidth / 2, 28, { align: 'center' })

    // 위험도 점수
    doc.setFontSize(16)
    doc.setTextColor(0)
    doc.text(`위험도 점수: ${result.overallScore}점`, 20, 45)

    // 위험 등급
    const riskLabels = {
        critical: '매우 위험',
        high: '위험',
        medium: '주의',
        low: '안전'
    }
    doc.text(`위험 등급: ${riskLabels[result.overallRiskLevel] || '분석 완료'}`, 20, 55)

    // 주요 이슈
    if (result.issues && result.issues.length > 0) {
        doc.setFontSize(14)
        doc.text('주요 위험 요소:', 20, 70)

        doc.setFontSize(11)
        let yPos = 80
        result.issues.slice(0, 5).forEach((issue, index) => {
            const text = `${index + 1}. ${issue.type}: ${issue.message}`
            const lines = doc.splitTextToSize(text, pageWidth - 40)
            doc.text(lines, 25, yPos)
            yPos += lines.length * 6 + 3
        })
    }

    // 권장사항
    if (result.recommendations && result.recommendations.length > 0) {
        doc.setFontSize(14)
        doc.text('권장 사항:', 20, 150)

        doc.setFontSize(11)
        let yPos = 160
        result.recommendations.slice(0, 3).forEach((rec, index) => {
            const text = `${index + 1}. ${rec}`
            const lines = doc.splitTextToSize(text, pageWidth - 40)
            doc.text(lines, 25, yPos)
            yPos += lines.length * 6 + 3
        })
    }

    // 푸터
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text('이 리포트는 참고용이며 법적 효력이 없습니다.', pageWidth / 2, 280, { align: 'center' })

    doc.save(`constract-report-${Date.now()}.pdf`)
}
