/**
 * OCR Service - OpenAI Vision API 우선, Tesseract.js 폴백
 */

import Tesseract from 'tesseract.js'
import { extractTextWithVision, hasApiKey } from './aiService'
import { convertPdfToImages } from './pdfService'

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
 * @param {File} pdfFile - PDF 파일 객체
 * @param {function} onProgress - 진행률 콜백
 * @returns {Promise<string>} 추출된 텍스트
 */
export async function extractTextFromPdf(pdfFile, onProgress) {
    try {
        if (onProgress) onProgress({ status: 'PDF 변환 중...', progress: 0 })

        // 1. PDF를 이미지 배열로 변환
        const images = await convertPdfToImages(pdfFile)
        let fullText = ''

        // 2. 각 페이지 OCR 수행
        for (let i = 0; i < images.length; i++) {
            if (onProgress) {
                onProgress({
                    status: `페이지 ${i + 1}/${images.length} 분석 중...`,
                    progress: (i / images.length) * 0.5
                })
            }

            const pageText = await extractTextFromImage(images[i])
            fullText += `\n--- Page ${i + 1} ---\n${pageText}`
        }

        return fullText
    } catch (error) {
        console.error('PDF 처리 오류:', error)
        throw new Error('PDF 문서를 분석하는 중 오류가 발생했습니다.')
    }
}
