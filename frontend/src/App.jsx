import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase, getSession } from './services/supabase';
import { useAppStore } from './store/useAppStore';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Fridge from './pages/Fridge';
import Recipes from './pages/Recipes';
import Shopping from './pages/Shopping';
import Profile from './pages/Profile';
import Report from './pages/Report';

function App() {
  const setUser = useAppStore((s) => s.setUser);
  const setLoading = useAppStore((s) => s.setLoading);

  useEffect(() => {
    getSession().then((session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, [setUser, setLoading]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/fridge" replace />} />
            <Route path="/fridge" element={<Fridge />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/shopping" element={<Shopping />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/report" element={<Report />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/fridge" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
