import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DiseasePrediction from './pages/DiseasePrediction';
import PredictionHistory from './pages/PredictionHistory';
import MedicalReports from './pages/MedicalReports';
import SkinDetection from './pages/SkinDetection';
import Profile from './pages/Profile';
import HealthAnalytics from './pages/analytics/HealthAnalytics';
import HealthTimeline from './pages/timeline/HealthTimeline';
import AIAssistantPage from './pages/assistant/AIAssistantPage';
import Settings from './pages/settings/Settings';
import Onboarding from './pages/onboarding/Onboarding';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="predict" element={<DiseasePrediction />} />
          <Route path="history" element={<PredictionHistory />} />
          <Route path="reports" element={<MedicalReports />} />
          <Route path="skin" element={<SkinDetection />} />
          <Route path="analytics" element={<HealthAnalytics />} />
          <Route path="timeline" element={<HealthTimeline />} />
          <Route path="assistant" element={<AIAssistantPage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}