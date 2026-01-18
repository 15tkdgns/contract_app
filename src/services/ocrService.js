/**
 * OCR Service - Tesseract.js를 사용한 브라우저 내 텍스트 추출
 * 모든 처리는 클라이언트에서 이루어지며 서버로 데이터가 전송되지 않습니다.
 */

import Tesseract from 'tesseract.js'

/**
 * 이미지에서 텍스트 추출
 * @param {string} imageData - Base64 인코딩된 이미지 데이터
 * @param {function} onProgress - 진행률 콜백 (선택)
 * @returns {Promise<string>} 추출된 텍스트
 */
export async function extractTextFromImage(imageData, onProgress) {
    try {
        const result = await Tesseract.recognize(imageData, 'kor+eng', {
            logger: progress => {
                if (onProgress && progress.status === 'recognizing text') {
                    onProgress(progress)
                }
            }
        })

        return result.data.text
    } catch (error) {
        console.error('OCR 처리 중 오류:', error)
        throw new Error('문서에서 텍스트를 추출하는 중 오류가 발생했습니다.')
    }
}

/**
 * PDF에서 텍스트 추출 (PDF.js 필요 - 향후 구현)
 * 현재는 이미지로 변환 후 OCR 처리
 */
export async function extractTextFromPdf(pdfData, onProgress) {
    // PDF.js 통합 시 구현
    // 현재는 이미지와 동일하게 처리
    return extractTextFromImage(pdfData, onProgress)
}
