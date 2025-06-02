import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import GreetingPage from '../components/GreetingPage';
import SignUpPage from '../components/SignUpPage';
import UploadPhotoPage from '../components/UploadPhotoPage';
import BudgetSelectionPage from '../components/BudgetSelectionPage';
import MainLayout from '../components/MainLayout';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GreetingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/upload-photo" element={<UploadPhotoPage />} />
        <Route path="/select-budget" element={<BudgetSelectionPage />} />
        <Route path="/app/*" element={<MainLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
