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
    console.log('[OCR Service] 텍스트 추출 시작')
    console.log('[OCR Service] 이미지 데이터 존재:', !!imageData)
    console.log('[OCR Service] 이미지 데이터 타입:', typeof imageData)

    // 이미지 데이터가 File 객체인 경우 Base64로 변환
    if (imageData instanceof File) {
        console.log('[OCR Service] File 객체 감지, Base64 변환 중...')
        imageData = await fileToBase64(imageData)
        console.log('[OCR Service] Base64 변환 완료, 길이:', imageData.length)
    }

    // OpenAI Vision API 시도
    if (hasApiKey()) {
        console.log('[OCR Service] OpenAI API 키 존재, Vision API 시도')
        try {
            if (onProgress) onProgress({ status: 'AI OCR 처리 중...', progress: 0.3 })
            const text = await extractTextWithVision(imageData)
            console.log('[OCR Service] Vision API 성공, 텍스트 길이:', text?.length || 0)
            if (text && text.length > 50 && !isRefusalMessage(text)) {
                console.log('[OCR Service] Vision API 결과 사용')
                return text
            } else {
                if (isRefusalMessage(text)) {
                    console.warn('[OCR Service] AI가 텍스트 추출을 거부함 (거절 메시지 감지). Tesseract로 폴백합니다.')
                } else {
                    console.warn('[OCR Service] Vision API 결과가 너무 짧음, Tesseract로 폴백')
                }
            }
        } catch (error) {
            console.warn('[OCR Service] AI OCR 실패, Tesseract로 폴백:', error.message)
        }
    } else {
        console.log('[OCR Service] API 키 없음, Tesseract로 진행')
    }

    // Tesseract.js 폴백
    console.log('[OCR Service] Tesseract OCR 시작')
    try {
        if (onProgress) onProgress({ status: 'Tesseract OCR 처리 중...', progress: 0.5 })

        const result = await Tesseract.recognize(imageData, 'kor+eng', {
            logger: progress => {
                if (onProgress && progress.status === 'recognizing text') {
                    onProgress({ ...progress, progress: 0.5 + progress.progress * 0.5 })
                }
            }
        })

        console.log('[OCR Service] Tesseract 성공, 텍스트 길이:', result.data.text.length)
        console.log('[OCR Service] Tesseract 미리보기:', result.data.text.substring(0, 200))
        return result.data.text
    } catch (error) {
        console.error('[OCR Service] Tesseract OCR 오류:', error.message)
        console.error('[OCR Service] 오류 상세:', error)
        throw new Error('문서에서 텍스트를 추출하는 중 오류가 발생했습니다: ' + error.message)
    }
}

/**
 * AI의 응답이 텍스트 추출 거절 메시지인지 확인
 */
function isRefusalMessage(text) {
    if (!text) return true
    const refusalKeywords = [
        '죄송하지만',
        '도와드릴 수 없습니다',
        '추출할 수 없습니다',
        '원하시는 정보를',
        '텍스트를 추출할 수',
        '민감한 정보',
        'I cannot',
        'I apologize',
        'cannot assist'
    ]
    return refusalKeywords.some(keyword => text.includes(keyword))
}

// File을 Base64로 변환하는 헬퍼 함수
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = error => reject(error)
    })
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
