import { useState, useEffect } from 'react';
import { auth, AuthUser } from './utils/auth';
import Auth from './pages/Auth';
import ProgressStats from './pages/ProgressStats';
import Settings from './pages/Settings';
import { usePWAInstall } from './hooks/usePWAInstall';
import ProfileCard from './components/ProfileCard';
import ObjectivesManager from './components/ObjectivesManager';
import SchedulesManager from './components/SchedulesManager';
import MissionsDisplay from './components/MissionsDisplay';
import QuickStats from './components/QuickStats';
import { useProfileStore } from './stores/profileStore';
import { useObjectivesStore } from './stores/objectivesStore';
import { useSchedulesStore } from './stores/schedulesStore';

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'progression' | 'stats' | 'settings'>('dashboard');
  const { isInstallable, installPWA } = usePWAInstall();

  const { fetchProfile } = useProfileStore();
  const { fetchObjectives } = useObjectivesStore();
  const { fetchSchedules } = useSchedulesStore();

  useEffect(() => {
    // Check for existing session
    const checkUser = async () => {
      const currentUser = await auth.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((user) => {
      setUser(user);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user data when user is authenticated
  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
      fetchObjectives(user.id);
      fetchSchedules(user.id);
    }
  }, [user?.id, fetchProfile, fetchObjectives, fetchSchedules]);

  const handleSignOut = async () => {
    await auth.signOut();
  };

  const handleAuthSuccess = async () => {
    const currentUser = await auth.getCurrentUser();
    setUser(currentUser);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-400"></div>
          <p className="mt-4 text-lg text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#0f0f23]">
      <header className="card-glow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Progression Hero</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentPage('progression')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'progression' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                Progression
              </button>
              <button
                onClick={() => setCurrentPage('stats')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'stats' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                Stats
              </button>
              <button
                onClick={() => setCurrentPage('settings')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'settings' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                Settings
              </button>
            </nav>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">Welcome, {user.username || user.email}!</span>
              {isInstallable && (
                <button
                  onClick={installPWA}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Install App
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {currentPage === 'dashboard' && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">Dashboard</h2>
                <p className="text-lg text-gray-300">Your progression journey begins here!</p>
              </div>

              <div className="mb-8">
                <QuickStats userId={user.id} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <ProfileCard userId={user.id} />
                <MissionsDisplay userId={user.id} />
              </div>
            </>
          )}

          {currentPage === 'progression' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <ObjectivesManager userId={user.id} />
              <SchedulesManager userId={user.id} />
            </div>
          )}

          {currentPage === 'stats' && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">Progression Statistics</h2>
                <p className="text-lg text-gray-300">Track your progress and analyze your performance across different categories.</p>
              </div>
              <ProgressStats userId={user.id} />
            </div>
          )}

          {currentPage === 'settings' && (
            <Settings userId={user.id} onSignOut={handleSignOut} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;