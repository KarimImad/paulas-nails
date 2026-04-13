import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { ToastProvider } from './context/ToastContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Reservation from './pages/Reservation';
import MyReservations from './pages/MyReservations';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CompleteProfile from './pages/CompleteProfile';
import Welcome from './pages/Welcome';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminServices from './pages/admin/Services';
import AdminSlots from './pages/admin/Slots';
import AdminReservations from './pages/admin/Reservations';

function ProtectedRoute({ children, requirePhone = true }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/connexion" replace />;
  if (requirePhone && !user.phone) return <Navigate to="/completer-profil" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/connexion" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function PageLoader() {
  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-cream-200 border-t-cream-600 rounded-full animate-spin" />
        <p className="text-cream-500 text-sm font-sans">Chargement…</p>
      </div>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      <Toast />
      {!isAdminRoute && <Navbar />}
      <main id="main-content" className={isAdminRoute ? '' : 'flex-1'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          <Route path="/reservation" element={
            <ProtectedRoute><Reservation /></ProtectedRoute>
          } />
          <Route path="/mes-reservations" element={
            <ProtectedRoute><MyReservations /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute><AdminLayout /></AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="creneaux" element={<AdminSlots />} />

            <Route path="reservations" element={<AdminReservations />} />
          </Route>
          <Route path="/bienvenue" element={
            <ProtectedRoute requirePhone={false}><Welcome /></ProtectedRoute>
          } />
          <Route path="/completer-profil" element={
            <ProtectedRoute requirePhone={false}><CompleteProfile /></ProtectedRoute>
          } />
          <Route path="/politique-confidentialite" element={<PrivacyPolicy />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
