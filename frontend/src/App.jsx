import { Navigate, Route, Routes } from 'react-router-dom'
import { DarkAgentProvider } from './context/DarkAgentContext'
import LandingPage from './pages/darkagent/LandingPage'
import DashboardPage from './pages/darkagent/DashboardPage'
import CreateBlinkPage from './pages/darkagent/CreateBlinkPage'
import AnalyzeBlinkPage from './pages/darkagent/AnalyzeBlinkPage'
import ActivityPage from './pages/darkagent/ActivityPage'

export default function App() {
  return (
    <DarkAgentProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/create" element={<CreateBlinkPage />} />
        <Route path="/analyze" element={<AnalyzeBlinkPage />} />
        <Route path="/analyze/:shareId" element={<AnalyzeBlinkPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DarkAgentProvider>
  )
}
