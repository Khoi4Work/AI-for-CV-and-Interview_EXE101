import { useAuth } from '../features/auth/contexts/AuthContext.jsx';
import HomeExperience from './HomeExperience.jsx';

export default function LandingPage() {
  const { isLoggedIn } = useAuth();
  return <HomeExperience isAuthenticated={isLoggedIn} />;
}
