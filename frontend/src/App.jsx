import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

// Public Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Farmer Pages
import { Dashboard } from './pages/Dashboard';
import { MyFarm } from './pages/MyFarm';
import { CropRecommendation } from './pages/CropRecommendation';
import { DiseaseDetection } from './pages/DiseaseDetection';
import { IrrigationAdvisory } from './pages/IrrigationAdvisory';
import { Weather } from './pages/Weather';
import { History } from './pages/History';
import { Reports } from './pages/Reports';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Farmers } from './pages/admin/Farmers';
import { Farms } from './pages/admin/Farms';
import { Predictions } from './pages/admin/Predictions';
import { CropManagement } from './pages/admin/CropManagement';
import { DiseaseManagement } from './pages/admin/DiseaseManagement';
import { SystemLogs } from './pages/admin/SystemLogs';

export const App = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Authenticated Farmer App Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/farms" element={<MyFarm />} />
          <Route path="/crop-recommendation" element={<CropRecommendation />} />
          <Route path="/disease-detection" element={<DiseaseDetection />} />
          <Route path="/irrigation" element={<IrrigationAdvisory />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/history" element={<History />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Authenticated Admin App Layout */}
        <Route
          element={
            <ProtectedRoute requireAdmin={true}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/farmers" element={<Farmers />} />
          <Route path="/admin/farms" element={<Farms />} />
          <Route path="/admin/predictions" element={<Predictions />} />
          <Route path="/admin/crops" element={<CropManagement />} />
          <Route path="/admin/diseases" element={<DiseaseManagement />} />
          <Route path="/admin/logs" element={<SystemLogs />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
