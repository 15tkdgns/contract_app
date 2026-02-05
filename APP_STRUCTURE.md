# Constract App Structure Map

이 문서는 애플리케이션의 내부 구조와 컴포넌트 간의 의존성 관계를 시각화한 문서입니다. `AppStructureGraph.jsx`의 데이터를 기반으로 작성되었습니다.

## 1. Directory Structure (계층 구조)

```text
Constract App (Root)
├── /pages
│   ├── UploadPage.jsx (메인 진입점)
│   └── ResultPage.jsx (결과 렌더링 컨테이너)
├── /components
│   ├── RiskSummaryPanel.jsx (안전 점수 및 리스크 요약)
│   ├── SmartChecklist.jsx (특약 체크리스트)
│   └── /dev (실험실 - Labs)
│       ├── DevTools.jsx (실험실 탭 컨테이너)
│       └── [Visualization Layer]
│           ├── [Network Analysis]
│           │   ├── NetworkGraph.jsx (Force Directed Graph)
│           │   └── CytoscapeGraph.jsx (Cytoscape Analysis)
│           ├── [Finance Flow]
│           │   ├── MoneyFlowSankey.jsx (Simple Sankey)
│           │   └── D3Sankey.jsx (D3 Custom Layout)
│           ├── [Risk Analysis]
│           │   └── RiskRadarChart.jsx (Radar Chart)
│           └── [Meta Tools]
│               └── AppStructureGraph.jsx (App Structure Tree)
└── /services
    ├── analysisService.js (AI 분석 및 데이터 파싱)
    └── fraudPatterns.json (전세 사기 패턴 데이터)
```

## 2. Component Flow & Dependencies (호출 관계)

### 🟦 Main User Flow
1.  **`UploadPage`**
    *   Uses: `Tesseract.js` (OCR), `analysisService`
    *   Action: 이미지 업로드 -> 텍스트 추출 -> 분석 요청 -> `ResultPage` 이동

    *   Action: 이미지 업로드 -> 텍스트 추출 -> 분석 요청 -> `ResultPage` 이동

2.  **`ResultPage` (종합 분석 결과 화면 상세)**
    *   **Architecture & Data Flow**
        *   **State Management**:
            *   `result`: 전체 분석 데이터 (SessionStorage 또는 History에서 로드)
            *   `activeTab`: 'summary'(종합) vs 'dev'(실험실) 탭 전환
            *   `expandedSections`: 각 분석 섹션의 펼침/접힘 상태 관리
        *   **Lifecycle & Effects**:
            *   `Data Load`: 마운트 시 `location.state` 확인 -> 없으면 `sessionStorage` 확인 -> 없으면 홈 리다이렉트
            *   `Auto Save`: 분석 결과가 유효하면 `saveHistory()`로 로컬 이력 저장
            *   `Chatbot Trigger`: 결과 로드 완료 시 `ChatContext`에 데이터 주입 후 챗봇 자동 오픈 (1초 지연)
    
    *   **UI Components Structure (Summary Tab)**
        *   **Header Area**:
            *   `Safety Score`: 100점 만점 환산 점수, 등급(Critical/High/Medium/Low)에 따른 색상 코딩
        *   **Analysis Sections** (Scrollable):
            1.  **RiskSummaryPanel**: 핵심 위험 요인 3줄 요약 (가장 중요한 정보 우선 노출)
            2.  **SmartChecklist**: 특약 사항 자동 분석 및 권장 특약 체크 (Accordion UI)
            3.  **ContractRelationHub**: [임대인-임차인-부동산] 계약 관계 시각화 (React Flow)
            4.  **Risk Details & Fraud Warning**:
                *   `Fraud Pattern`: 사기 패턴 매칭 시 붉은 경고 박스 노출
                *   `Issues List`: 개별 위험 요소를 카드 형태로 나열
            5.  **ContractVisual**: 주요 계약 정보(보증금, 기간 등)를 집 모양 그래픽으로 표현
            6.  **AI Analysis**:
                *   `Verification`: 계약서 vs 등기부 교차 검증 결과 (일치/불일치)
                *   `Glossary`: 분석 결과에 포함된 어려운 법률 용어 자동 해설
    *   **Interactions**:
        *   **PDF Download**: `html2canvas` + `jspdf`로 리포트 파일 생성
        *   **Share**: Web Share API 또는 링크 복사 모달

    *   **Developer Tools (Labs Tab)**
        *   `DevTools` 컴포넌트를 렌더링하여 심층 분석 기능 제공 (Network Graph, Sankey Flow 등)

### 🟪 Developer Tools (Labs)
**`DevTools`**는 **Visualization Layer**를 통해 다음 카테고리의 시각화 도구를 관리합니다:

#### 🎨 Visualization Layer
*   **Network Analysis**: `NetworkGraph`, `CytoscapeGraph` - 관계 및 구조 분석
*   **Finance Flow**: `MoneyFlowSankey`, `D3Sankey` - 자금 흐름 및 낙찰 시뮬레이션
*   **Risk Analysis**: `RiskRadarChart` - 다각도 위험 분석
*   **Meta Tools**: `AppStructureGraph` - 앱 구조 트리 시각화

## 3. Navigation Structure (Current)
개편된 애플리케이션의 네비게이션 구조입니다.

### 🌐 Routing Map
- `/` (Root): **HomePage** (대시보드: 최근 내역, 안전 점수, 퀵 메뉴)
- `/upload`: **UploadPage** (문서 업로드 및 분석 시작)
- `/result`: **ResultPage** (분석 결과 상세)
- `/calculator`: **CalculatorPage** (전세가율 계산기)
- `/checklist`: **ChecklistPage** (특약 체크리스트)
- `/more`: **MorePage** (더보기: 설정, 실험실 접근)

### 🧭 Bottom Navigation
하단 네비게이션(`BottomNav`)은 5개의 탭으로 확장되었습니다:
1.  **홈**: `/` (대시보드)
2.  **계산**: `/calculator`
3.  **분석**: `/upload` (중앙 강조 버튼)
4.  **체크**: `/checklist`
5.  **더보기**: `/more`
