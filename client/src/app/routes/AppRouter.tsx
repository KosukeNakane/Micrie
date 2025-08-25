import { Routes, Route, Navigate } from 'react-router-dom';

import { CreatePage } from '@pages/create';
import { MelodyPage } from '@pages/melody';
import { PlayPage } from '@pages/play';
import { RhythmPage } from '@pages/rhythm';

export const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/create" replace />} />
    <Route path="/create" element={<CreatePage />} />
    <Route path="/rhythm" element={<RhythmPage />} />
    <Route path="/melody" element={<MelodyPage />} />
    <Route path="/play" element={<PlayPage />} />
  </Routes>
);
