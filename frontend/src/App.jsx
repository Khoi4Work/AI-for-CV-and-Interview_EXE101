import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './features/auth/contexts/AuthContext.jsx';
import { AppProvider } from './features/auth/contexts/AppContext.jsx';
import { CVProvider } from './features/cv/contexts/CVContext.jsx';
import { MediaProvider } from './contexts/MediaContext';
import AppLayout from './components/layout/AppLayout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <CVProvider>
            <MediaProvider>
              <AppLayout />
            </MediaProvider>
          </CVProvider>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
