// Lazy-loaded pages for code splitting
import { lazy } from 'react';

// Login (não precisa de lazy loading - página inicial de auth)
export { LoginPage } from './Login/LoginPage';

// Pets Module - Lazy Loading
export const PetListPage = lazy(() => import('./Pets/PetListPage'));
export const PetDetailPage = lazy(() => import('./Pets/PetDetailPage'));

// Tutors Module - Lazy Loading
export const TutorListPage = lazy(() => import('./Tutors/TutorListPage'));
export const TutorDetailPage = lazy(() => import('./Tutors/TutorDetailPage'));
