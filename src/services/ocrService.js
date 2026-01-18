/**
 * OCR Service - OpenAI Vision API 우선, Tesseract.js 폴백
 */

import Tesseract from 'tesseract.js'
import { extractTextWithVision, hasApiKey } from './aiService'

/**
 * 이미지에서 텍스트 추출 (AI 우선, 폴백 Tesseract)
 * @param {string} imageData - Base64 인코딩된 이미지 데이터
 * @param {function} onProgress - 진행률 콜백 (선택)
 * @returns {Promise<string>} 추출된 텍스트
 */
export async function extractTextFromImage(imageData, onProgress) {
    // OpenAI Vision API 시도
    if (hasApiKey()) {
        try {
            if (onProgress) onProgress({ status: 'AI OCR 처리 중...' })
            const text = await extractTextWithVision(imageData)
            if (text && text.length > 50) {
                return text
            }
        } catch (error) {
            console.warn('AI OCR 실패, Tesseract로 폴백:', error.message)
        }
    }

    // Tesseract.js 폴백
    try {
        if (onProgress) onProgress({ status: 'Tesseract OCR 처리 중...' })

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
 * PDF에서 텍스트 추출
 */
export async function extractTextFromPdf(pdfData, onProgress) {
    // PDF도 이미지와 동일하게 처리
    return extractTextFromImage(pdfData, onProgress)
}
