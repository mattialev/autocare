import { Navigate, Route, Routes } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { AuthPage } from './pages/AuthPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { VehicleLayout } from './pages/VehicleLayout';
import { DashboardPage } from './pages/DashboardPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { DocumentsPage } from './pages/DocumentsPage';
import { ProfilePage } from './pages/ProfilePage';
import { DeadlinesPage } from './pages/DeadlinesPage';
import { StatsPage } from './pages/StatsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

const Protected = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useApp();
  if (loading) return <div className="screen-center"><div className="spinner" />Caricamento AutoCare...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export const App = () => {
  const { toast, clearToast, mode } = useApp();

  return (
    <>
      {toast && (
        <button className="toast" onClick={clearToast} type="button">
          {toast}
        </button>
      )}
      {mode === 'demo' && <div className="demo-ribbon">Modalita demo locale: configura Supabase per dati reali</div>}
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/" element={<Navigate to="/vehicles" replace />} />
        <Route
          path="/vehicles"
          element={
            <Protected>
              <VehiclesPage />
            </Protected>
          }
        />
        <Route
          path="/vehicles/:vehicleId"
          element={
            <Protected>
              <VehicleLayout />
            </Protected>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="deadlines" element={<DeadlinesPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};
