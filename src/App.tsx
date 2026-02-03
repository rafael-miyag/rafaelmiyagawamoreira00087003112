import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import {
  LoginPage,
  PetListPage,
  PetDetailPage,
  TutorListPage,
  TutorDetailPage,
} from '@/pages';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route - Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes with MainLayout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Pets Routes */}
          <Route path="/pets" element={<PetListPage />} />
          <Route path="/pets/:id" element={<PetDetailPage />} />

          {/* Tutors Routes */}
          <Route path="/tutores" element={<TutorListPage />} />
          <Route path="/tutores/:id" element={<TutorDetailPage />} />
        </Route>

        {/* Root redirect to login or pets based on auth */}
        <Route path="/" element={<Navigate to="/pets" replace />} />

        {/* Fallback Route - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
