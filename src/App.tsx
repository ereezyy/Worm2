import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WormGame from './components/Game/WormGame';
import { GameProvider } from './context/GameContext';
import { Header } from './components/layout/Header';
import { PricingPage } from './pages/PricingPage';
import { SuccessPage } from './pages/SuccessPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black">
        <Routes>
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/" element={
            <>
              <Header />
              <GameProvider>
                <WormGame />
              </GameProvider>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;