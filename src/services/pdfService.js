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
