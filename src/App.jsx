import { Routes, Route } from 'react-router-dom'
import UploadPage from './pages/UploadPage'
import HomePage from './pages/HomePage'
import MorePage from './pages/MorePage'
import ManualInputPage from './pages/ManualInputPage'
import AnalysisPage from './pages/AnalysisPage'
import ResultPage from './pages/ResultPage'
import CalculatorPage from './pages/CalculatorPage'
import ChecklistPage from './pages/ChecklistPage'
import BottomNav from './components/BottomNav'
import Chatbot from './components/Chatbot'
import { ChatProvider } from './context/ChatContext'
import FullContractPage from './pages/FullContractPage'
import FullRelationPage from './pages/FullRelationPage'
import LabPage from './pages/LabPage'
import { useLocation } from 'react-router-dom'
import './App.css'

function App() {
    // App 컴포넌트 내부에서 useLocation을 사용하려면 Router 내부에 있어야 함.
    // 하지만 보통 index.js에서 Router로 감싸므로 여기서는 가능할 수도 있지만,
    // 만약 App이 Router를 포함하고 있다면 에러 발생.
    // 여기 구조상 App이 최상위라면 Router는 index.js에 있을 것임.
    // 안전하게 하단에서 useLocation 판별.

    return (
        <ChatProvider>
            <AppContent />
        </ChatProvider>
    )
}

function AppContent() {
    const location = useLocation()
    const isFullScreen = location.pathname.startsWith('/view/')

    return (
        <div className="app">
            <main className={`main-content ${isFullScreen ? 'full-screen' : ''}`}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/manual" element={<ManualInputPage />} />
                    <Route path="/analysis" element={<AnalysisPage />} />
                    <Route path="/result" element={<ResultPage />} />
                    <Route path="/calculator" element={<CalculatorPage />} />
                    <Route path="/checklist" element={<ChecklistPage />} />
                    <Route path="/more" element={<MorePage />} />

                    {/* Full Screen Views */}
                    <Route path="/view/contract" element={<FullContractPage />} />
                    <Route path="/view/relation" element={<FullRelationPage />} />

                    {/* Lab */}
                    <Route path="/lab" element={<LabPage />} />
                </Routes>
            </main>
            {!isFullScreen && <BottomNav />}
            {!isFullScreen && <Chatbot />}
        </div>
    )
}

export default App

