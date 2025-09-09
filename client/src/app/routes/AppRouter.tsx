import { Routes, Route, Navigate } from 'react-router-dom';

import { RecordingPage } from '@pages/recording';
import { EditPage } from '@pages/edit';
import { PerformancePage } from '@pages/performance';

export const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/recording" replace />} />
    <Route path="/recording" element={<RecordingPage />} />
    <Route path="/edit" element={<EditPage />} />
    <Route path="/performance" element={<PerformancePage />} />
  </Routes>
);
