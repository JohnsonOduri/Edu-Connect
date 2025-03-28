
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Login from './pages/Login';
import Auth from './pages/Auth';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import About from './pages/About';
import { Toaster } from "@/components/ui/toaster";

function App() {
  const { isAuthenticated, user, loading } = useAuth();

  // Add logging to debug role issues
  console.log("App rendering with user role:", user?.role);

  // Show loading state if auth is still being determined
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/auth" element={!isAuthenticated ? <Auth /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={
          isAuthenticated ? (
            user?.role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/about" element={<About />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
