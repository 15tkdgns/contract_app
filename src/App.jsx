import { Routes, Route } from 'react-router-dom'
import UploadPage from './pages/UploadPage'
import ManualInputPage from './pages/ManualInputPage'
import AnalysisPage from './pages/AnalysisPage'
import ResultPage from './pages/ResultPage'
import CalculatorPage from './pages/CalculatorPage'
import ChecklistPage from './pages/ChecklistPage'
import BottomNav from './components/BottomNav'
import './App.css'

function App() {
    return (
        <div className="app">
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<UploadPage />} />
                    <Route path="/manual" element={<ManualInputPage />} />
                    <Route path="/analysis" element={<AnalysisPage />} />
                    <Route path="/result" element={<ResultPage />} />
                    <Route path="/calculator" element={<CalculatorPage />} />
                    <Route path="/checklist" element={<ChecklistPage />} />
                </Routes>
            </main>
            <BottomNav />
        </div>
    )
}

export default App
