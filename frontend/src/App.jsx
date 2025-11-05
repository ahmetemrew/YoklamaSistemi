import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Admin from './pages/Admin';
import Scanner from './pages/Scanner';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/admin/*" element={<Admin />} />
      <Route path="/scanner" element={<Scanner />} />
    </Routes>
  );
}

export default App;
