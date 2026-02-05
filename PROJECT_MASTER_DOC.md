# Constract App (전세사기 예방 플랫폼) - 프로젝트 종합 문서

> 이 문서는 2026년 1월 29일 기준으로 **Constract App**의 전체 구조, 기능, 기술 스택, 그리고 주요 로직을 상세하게 정리한 문서입니다.

---

## 📌 1. 프로젝트 개요 (Overview)

**Constract App**은 사회적으로 심각한 문제인 **'전세사기'**를 기술적으로 예방하고, 임차인의 권리를 보호하기 위해 개발된 웹 애플리케이션입니다.

- **핵심 목표**: 복잡한 부동산 계약서와 등기부등본을 일반인도 쉽게 이해할 수 있도록 AI로 분석하고, 위험 요소를 사전에 경고합니다.
- **주요 특징**:
    - **No-Server (Privacy First)**: 모든 분석은 클라이언트(브라우저)에서 이루어지거나, 최소한의 API 호출로 처리되며 사용자 문서 원본을 서버에 저장하지 않습니다.
    - **AI-Powered**: GPT-4o-mini와 Vision API를 활용하여 단순 텍스트 추출을 넘어 '의미 기반'의 위험성 분석을 수행합니다.
    - **Intuitive UX**: 복잡한 법률 용어를 지식 그래프 시각화, AI 챗봇 상담, 신호등 UI 등으로 직관적으로 제공합니다.

---

## 🏗️ 2. 아키텍처 및 기술 스택 (Architecture & Tech Stack)

### 2.1 프론트엔드 (Frontend)
- **Framework**: React 18, Vite (빠른 빌드 및 HMR 지원)
- **Language**: JavaScript (ES6+)
- **State Management**: Context API (ChatContext), LocalStorage/SessionStorage (데이터 영속성)
- **Styling**: Vanilla CSS (Component-scoped styles)
- **Routing**: React Router DOM v6

### 2.2 핵심 라이브러리 (Core Libraries)
- **PDF 처리**: `pdfjs-dist` (브라우저 내 PDF 렌더링 및 텍스트 추출)
- **시각화**: `reactflow` (계약 관계도/지식 그래프 구현)
- **리포트 생성**: `jspdf`, `html2canvas` (화면 캡처 기반 PDF 생성)
- **OCR (Fallback)**: `tesseract.js` (API 키 미설정 시 로컬 OCR 수행)

### 2.3 외부 API (External APIs)
- **OpenAI API**:
    - **Vision API**: 이미지/PDF 내 텍스트 고정밀 추출 (OCR 대체)
    - **Chat Completions (GPT-4o-mini)**: 계약 내용 분석, 위험도 평가, 챗봇 상담

---

## 🛠️ 3. 디렉토리 구조 (Directory Structure)

```
constract-app/
├── public/                 # 정적 자산 (fonts, icons 등)
├── src/
│   ├── api/                # (Deprecated) Vercel Serverless Functions
│   ├── components/         # 재사용 가능한 UI 컴포넌트
│   │   ├── BottomNav.jsx          # 하단 네비게이션
│   │   ├── Chatbot.jsx            # AI 챗봇 컴포넌트 (Context 사용)
│   │   ├── ContractRelationHub.jsx # 지식 그래프 (React Flow)
│   │   ├── ContractVisual.jsx     # 계약 타임라인 시각화
│   │   └── ...                    # 기타 UI 컴포넌트
│   ├── context/            # 전역 상태 관리
│   │   └── ChatContext.jsx        # 챗봇 상태 및 AI 분석 결과 공유
│   ├── data/               # 정적 데이터
│   │   └── fraudPatterns.json     # 전세사기 패턴 정의 (깡통전세 등)
│   ├── pages/              # 주요 페이지 (라우트 단위)
│   │   ├── UploadPage.jsx         # 메인: 파일 업로드 및 OCR 시작
│   │   ├── AnalysisPage.jsx       # 분석 대기 및 진행
│   │   ├── ResultPage.jsx         # 분석 결과 대시보드 (핵심 기능 집약)
│   │   ├── CalculatorPage.jsx     # 전세가율 계산기 (독립 기능)
│   │   ├── ChecklistPage.jsx      # 계약 전/후 체크리스트
│   │   └── ManualInputPage.jsx    # 수동 정보 입력
│   ├── services/           # 비즈니스 로직 및 API 통신
│   │   ├── aiService.js           # OpenAI API 호출 (OCR, 분석)
│   │   ├── analysisService.js     # 룰 기반 분석 (보조 역할)
│   │   ├── historyService.js      # 로컬스토리지 이력 관리
│   │   ├── ocrService.js          # OCR 로직 (Vision API 우선, Tesseract 폴백)
│   │   ├── pdfService.js          # PDF -> 이미지 변환 유틸리티
│   │   └── priceService.js        # 시세 서비스 (스텁 구현)
│   ├── App.jsx             # 메인 앱 컴포넌트 (라우터, 프로바이더 설정)
│   ├── main.jsx            # 진입점
│   └── index.css           # 전역 스타일
├── .env                    # 환경 변수 (VITE_OPENAI_API_KEY)
├── package.json            # 의존성 목록
└── README.md               # 프로젝트 설명
```

---

## 💡 4. 주요 기능 상세 (Key Features)

### 4.1 스마트 문서 분석 (Smart Analysis)
1. **업로드 (`UploadPage`)**: 사용자가 계약서(이미지/PDF)와 등기부등본을 업로드합니다.
2. **AI OCR (`ocrService` -> `aiService`)**:
   - `extractTextWithVision`: OpenAI Vision API를 사용하여 이미지에서 텍스트를 추출합니다. "계약 기간", "보증금", "특약사항" 등 핵심 정보를 우선적으로 읽도록 프롬프트가 최적화되어 있습니다.
3. **위험도 분석 (`aiService` -> `analyzeContractWithAI`)**:
   - 추출된 텍스트를 LLM(GPT-4o-mini)에 전송합니다.
   - **사기 패턴 매칭**: `fraudPatterns.json`에 정의된 6가지 패턴(깡통전세, 신탁사기 등)과 대조합니다.
   - **문서 교차 검증**: 계약서와 등기부등본의 소유자, 주소 등이 일치하는지 비교합니다.
   - **결과 생성**: JSON 형식으로 구조화된 데이터(`extractedData`, `riskScore`, `entities`, `relations` 등)를 반환합니다.

### 4.2 결과 시각화 및 대시보드 (`ResultPage`)
분석된 결과는 다음과 같이 시각화됩니다:
- **종합 위험도**: 신호등 색상(초록/주황/빨강)과 점수(0~100)로 표시.
- **지식 그래프 (`ContractRelationHub`)**: 임대인, 임차인, 부동산, 돈의 흐름을 노드와 엣지로 연결하여 시각화. AI가 정보를 찾지 못하면 '인식 불가'로 표시하고 수정 힌트를 제공.
- **맞춤형 가이드**: 현재 계약 상황에 맞는 '주의사항', '체크리스트', '다음 단계'를 AI가 생성하여 제공.
- **용어 해설**: 계약서에 등장한 어려운 법률 용어(근저당권, 대항력 등)를 자동으로 설명.

### 4.3 AI 챗봇 통합 (`Chatbot`, `ChatContext`)
- **전역 연동**: 앱 어디서나 접근 가능하며, 분석이 완료되면 `ChatContext`를 통해 결과 데이터를 공유받습니다.
- **능동적 대응**: 결과 페이지에 진입하면 챗봇이 자동으로 창을 열고 "분석이 완료되었습니다!"라고 인사를 건넵니다.
- **문맥 인식**: 사용자가 "이 계약 괜찮아?"라고 물으면, 챗봇은 현재 분석된 특정 계약서의 내용(보증금 액수, 특약 유무 등)을 바탕으로 구체적인 답변을 제공합니다.

### 4.4 전세가율 계산기 (`CalculatorPage`)
- **독립 도구**: 분석 이외에도 사용자가 직접 매매가와 전세금을 입력하여 안전성을 판단할 수 있습니다.
- **공시지가 추정**: 공시지가 입력 시 150%(보증보험 가입 기준)를 자동으로 적용하여 추정 시세를 계산합니다.

---

## 📝 5. 데이터 흐름 (Data Flow)

1. **User Action**: 파일 업로드 (`UploadPage`)
   ↓
2. **Processing**: `ocrService` (PDF -> Image -> Text)
   ↓
3. **Analysis**: `aiService` (Text -> LLM -> JSON Result)
   ↓
4. **Storage**: `sessionStorage` (분석 결과 임시 저장), `localStorage` (분석 이력 저장)
   ↓
5. **Visualization**: `ResultPage` (JSON 데이터 렌더링)
   - `ContractRelationHub`: 엔티티/관계 시각화
   - `Chatbot`: 분석 결과 컨텍스트 주입

---

## 🚀 6. 향후 계획 (Roadmap)

1. **Phase 3 확장 (진행 중)**: 공공데이터포털 API 연동을 통해 실거래가 자동 조회 기능 구현 (현재는 계산기 및 스텁 서비스로 대체).
2. **Phase 4 (배포/안정화)**: Vercel 배포 자동화 파이프라인 구축 및 모바일 웹 최적화.
3. **기능 고도화**:
   - 등기부등본의 '갑구/을구' 상세 변동 내역 타임라인 시각화.
   - HUG 전세보증보험 가입 가능 여부 모의 심사 기능.

---

> **Note**: 이 프로젝트는 사용자의 민감한 개인정보(계약서)를 다루므로, 서버 저장소를 사용하지 않고 클라이언트 처리를 원칙으로 합니다. OpenAI API 사용 시에도 데이터 학습에 사용되지 않도록 설정(Enterprise 정책 등)을 고려해야 합니다.
