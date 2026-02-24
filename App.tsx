// src/App.tsx
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { GameConfig } from './pages/GameConfig';
import { NumberArena } from './pages/NumberArena';
import { Modules } from './pages/Modules';

// YANGI SAHIFALAR
import { WordChains } from './pages/WordChains';
import { Flashcards } from './pages/Flashcards';
import { FaceName } from './pages/FaceName';
import { AbstractImages } from './pages/AbstractImages';

import { Monitoring } from './pages/Monitoring';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/monitoring" element={<Monitoring />} />

          {/* Number Matrix */}
          <Route path="/train/numbers/config" element={<GameConfig />} />
          <Route path="/train/numbers/play" element={<NumberArena />} />

          {/* YANGI MASHQLAR */}
          <Route path="/train/words" element={<WordChains />} />
          <Route path="/train/flashcards" element={<Flashcards />} />
          <Route path="/train/faces" element={<FaceName />} />
          <Route path="/train/abstract" element={<AbstractImages />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;