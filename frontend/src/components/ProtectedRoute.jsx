import { Navigate, Outlet } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export default function ProtectedRoute() {
  const user = useAppStore((s) => s.user);
  const loading = useAppStore((s) => s.loading);

  if (loading) return <p className="text-center mt-20">Yükleniyor...</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}