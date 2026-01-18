# 앱 개발 참고 자료

## 복사된 파일 목록

### 데이터 및 로직 (`src/utils/`)
| 파일 | 설명 |
|-----|------|
| `fraudData.js` | 8가지 사기 유형 데이터, 체크포인트, 위험도 계산 함수 |
| `calculators.js` | 금액 포맷, 전세가율 계산, 선순위 권리 분석 |

### 원본 소스 참고 (constract 프로젝트)
| 파일 | 경로 | 용도 |
|-----|-----|------|
| FraudCaseVisualization.jsx | src/components/ | 사기 사례 UI 참고 |
| RiskCheckWizard.jsx | src/components/ | 위험도 체크 UI 참고 |
| JeonseGaugeChart.jsx | src/components/ | 전세가율 게이지 참고 |
| RiskScoreIndicator.jsx | src/components/ | 위험도 표시 참고 |

---

## 앱 개발 핵심 기능

### 1. 문서 업로드
```
사용자 → 계약서 업로드 (PDF/이미지)
사용자 → 등기부등본 업로드 (PDF/이미지)
```

### 2. OCR 처리 (Tesseract.js)
```javascript
import Tesseract from 'tesseract.js';

const extractText = async (imageFile) => {
    const result = await Tesseract.recognize(imageFile, 'kor');
    return result.data.text;
};
```

### 3. 위험도 분석 흐름
```
1. 등기부등본에서 추출:
   - 소유자 이름
   - 근저당 금액
   - 설정일자

2. 계약서에서 추출:
   - 임대인 이름
   - 보증금
   - 계약일자

3. 대조 분석:
   - 소유자 ↔ 임대인 일치 여부
   - 전세가율 계산
   - 선순위 권리 확인

4. 8가지 사기 유형 체크
```

---

## 개인정보 보호 구현

### 원칙
- 서버 전송 없음
- 브라우저 내 처리
- 즉시 메모리 삭제

### 구현 방법
```javascript
// 파일 처리 후 즉시 해제
const handleFile = async (file) => {
    const objectUrl = URL.createObjectURL(file);
    
    try {
        // OCR 처리
        const text = await extractText(objectUrl);
        // 분석 처리
        const result = analyzeDocument(text);
        return result;
    } finally {
        // 메모리 해제
        URL.revokeObjectURL(objectUrl);
    }
};
```

---

## 데이터 구조

### 사기 유형 (fraudData.js)
```javascript
{
    id: number,
    title: string,           // 유형 이름
    subtitle: string,        // 부제
    riskLevel: 'critical' | 'high' | 'medium' | 'low',
    description: string,
    checkPoints: [           // 체크리스트
        { item, question, riskIfYes?, riskIfNo? }
    ],
    riskyBehaviors: string[],  // 위험 행위
    safeBehaviors: string[]    // 안전 행위
}
```

### 분석 결과
```javascript
{
    overallScore: number,      // 0-100
    riskLevel: string,
    issues: [
        { type, severity, message }
    ],
    recommendations: string[]
}
```

---

## 다음 개발 단계

1. [ ] Vite 프로젝트 초기화
2. [ ] 파일 업로드 컴포넌트 구현
3. [ ] Tesseract.js 통합
4. [ ] 분석 로직 연결
5. [ ] 결과 UI 구현
6. [ ] PDF 보고서 생성
