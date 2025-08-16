import { Routes, Route, Navigate } from 'react-router-dom';
import { CreatePage } from '@pages/create/ui/CreatePage';
import { RhythmPage } from '@pages/rhythm/ui/RhythmPage';
import { MelodyPage } from '@pages/melody/ui/MelodyPage';
import { PlayPage } from '@pages/play/ui/PlayPage';

export const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/create" replace />} />
    <Route path="/create" element={<CreatePage />} />
    <Route path="/rhythm" element={<RhythmPage />} />
    <Route path="/melody" element={<MelodyPage />} />
    <Route path="/play" element={<PlayPage />} />
  </Routes>
);

