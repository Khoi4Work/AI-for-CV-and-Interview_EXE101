import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { CVProvider } from './contexts/CVContext';
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
