import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { IdentityVerification } from './components/auth/IdentityVerification';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<div>Landing Page</div>} />
          <Route path="verify" element={<IdentityVerification />} />
          <Route path="matches" element={<div>Matches</div>} />
          <Route path="chat" element={<div>Chat</div>} />
          <Route path="community" element={<div>Community</div>} />
          <Route path="premium" element={<div>Premium</div>} />
          <Route path="achievements" element={<div>Achievements</div>} />
          <Route path="settings" element={<div>Settings</div>} />
          <Route path="profile" element={<div>Profile</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;