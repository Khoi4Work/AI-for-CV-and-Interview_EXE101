import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './features/auth/contexts/AuthContext.jsx';
import { AppProvider } from './features/auth/contexts/AppContext.jsx';
import { CVProvider } from './features/cv/contexts/CVContext.jsx';
import { MediaProvider } from './contexts/MediaContext';
import AppLayout from './components/layout/AppLayout';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AnalyticsProvider } from './features/analytics/AnalyticsProvider.jsx';
import AnalyticsRouteTracker from './features/analytics/AnalyticsRouteTracker.jsx';

function App() {
  return (
    <Router>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <AnalyticsProvider>
            <AnalyticsRouteTracker />
            <AppProvider>
              <CVProvider>
                <MediaProvider>
                  <AppLayout />
                </MediaProvider>
              </CVProvider>
            </AppProvider>
          </AnalyticsProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </Router>
  );
}

export default App;
