import React, { useState } from 'react';
import { useProfileStore } from '../stores/profileStore';
import { useObjectivesStore } from '../stores/objectivesStore';
import { useSchedulesStore } from '../stores/schedulesStore';
import { auth } from '../utils/auth';
import { supabase } from '../utils/supabase';

interface SettingsProps {
  userId: string;
  onSignOut: () => void;
}

const Settings: React.FC<SettingsProps> = ({ userId, onSignOut }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'objectives' | 'schedules' | 'app' | 'account'>('profile');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('en');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { profile, updateProfile, loading: profileLoading } = useProfileStore();
  const { objectives, createObjective, updateObjective, deleteObjective, incrementProgress } = useObjectivesStore();
  const { schedules, createSchedule, updateSchedule, deleteSchedule, toggleSchedule } = useSchedulesStore();

  const [profileForm, setProfileForm] = useState({
    username: profile?.username || '',
    strength: profile?.stats.strength || 0,
    intelligence: profile?.stats.intelligence || 0,
    motivation: profile?.stats.motivation || 0,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [objectiveForm, setObjectiveForm] = useState({
    title: '',
    description: '',
    target_value: 1,
    category: '',
    deadline: '',
  });

  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    description: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  });

  const showMessage = (message: string, isError = false) => {
    if (isError) {
      setErrorMessage(message);
      setSuccessMessage('');
    } else {
      setSuccessMessage(message);
      setErrorMessage('');
    }
    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 5000);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        username: profileForm.username,
        stats: {
          strength: profileForm.strength,
          intelligence: profileForm.intelligence,
          motivation: profileForm.motivation,
        },
      });
      showMessage('Profile updated successfully!');
    } catch (error: any) {
      showMessage(error.message, true);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('Passwords do not match', true);
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });
      if (error) throw error;
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showMessage('Password changed successfully!');
    } catch (error: any) {
      showMessage(error.message, true);
    }
  };

  const handleAccountDeletion = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    try {
      // Delete user data first
      await supabase.from('profiles').delete().eq('id', userId);
      await supabase.from('objectives').delete().eq('user_id', userId);
      await supabase.from('schedules').delete().eq('user_id', userId);
      await supabase.from('missions').delete().eq('user_id', userId);

      // Delete auth user
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      onSignOut();
      showMessage('Account deleted successfully');
    } catch (error: any) {
      showMessage(error.message, true);
    }
  };

  const handleObjectiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createObjective(userId, objectiveForm);
      setObjectiveForm({
        title: '',
        description: '',
        target_value: 1,
        category: '',
        deadline: '',
      });
      showMessage('Objective created successfully!');
    } catch (error: any) {
      showMessage(error.message, true);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSchedule(userId, scheduleForm);
      setScheduleForm({
        title: '',
        description: '',
        frequency: 'daily',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
      });
      showMessage('Schedule created successfully!');
    } catch (error: any) {
      showMessage(error.message, true);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'objectives', label: 'Objectives', icon: '🎯' },
    { id: 'schedules', label: 'Schedules', icon: '📅' },
    { id: 'app', label: 'App Settings', icon: '⚙️' },
    { id: 'account', label: 'Account', icon: '🔐' },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your profile, objectives, schedules, and account settings</p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 animate-fade-in">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 animate-fade-in">
            {errorMessage}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'border-indigo-400 text-indigo-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50">
              <h2 className="text-xl font-semibold mb-6 text-white">Profile Management</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter your username"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Strength</label>
                    <input
                      type="number"
                      min="0"
                      value={profileForm.strength}
                      onChange={(e) => setProfileForm({ ...profileForm, strength: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Intelligence</label>
                    <input
                      type="number"
                      min="0"
                      value={profileForm.intelligence}
                      onChange={(e) => setProfileForm({ ...profileForm, intelligence: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Motivation</label>
                    <input
                      type="number"
                      min="0"
                      value={profileForm.motivation}
                      onChange={(e) => setProfileForm({ ...profileForm, motivation: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {profileLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          )}

          {/* Objectives Tab */}
          {activeTab === 'objectives' && (
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50">
              <h2 className="text-xl font-semibold mb-6 text-white">Objectives Management</h2>
              <form onSubmit={handleObjectiveSubmit} className="space-y-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                    <input
                      type="text"
                      value={objectiveForm.title}
                      onChange={(e) => setObjectiveForm({ ...objectiveForm, title: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Target Value *</label>
                    <input
                      type="number"
                      min="1"
                      value={objectiveForm.target_value}
                      onChange={(e) => setObjectiveForm({ ...objectiveForm, target_value: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={objectiveForm.description}
                    onChange={(e) => setObjectiveForm({ ...objectiveForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <input
                      type="text"
                      value={objectiveForm.category}
                      onChange={(e) => setObjectiveForm({ ...objectiveForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Deadline</label>
                    <input
                      type="date"
                      value={objectiveForm.deadline}
                      onChange={(e) => setObjectiveForm({ ...objectiveForm, deadline: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  Create Objective
                </button>
              </form>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Your Objectives</h3>
                {objectives.length === 0 ? (
                  <p className="text-gray-400">No objectives yet.</p>
                ) : (
                  objectives.map((objective) => (
                    <div key={objective.id} className="bg-gray-800/30 rounded-lg p-4 border border-gray-600/50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{objective.title}</h4>
                          {objective.description && <p className="text-gray-400 mt-1">{objective.description}</p>}
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-400">
                            <span>Progress: {objective.current_value} / {objective.target_value}</span>
                            <span>Status: {objective.status}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteObjective(objective.id)}
                          className="text-red-400 hover:text-red-300 ml-4"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Schedules Tab */}
          {activeTab === 'schedules' && (
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50">
              <h2 className="text-xl font-semibold mb-6 text-white">Schedules Management</h2>
              <form onSubmit={handleScheduleSubmit} className="space-y-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                    <input
                      type="text"
                      value={scheduleForm.title}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Frequency *</label>
                    <select
                      value={scheduleForm.frequency}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, frequency: e.target.value as any })}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={scheduleForm.description}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Start Date *</label>
                    <input
                      type="date"
                      value={scheduleForm.start_date}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, start_date: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">End Date (Optional)</label>
                    <input
                      type="date"
                      value={scheduleForm.end_date}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, end_date: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  Create Schedule
                </button>
              </form>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Your Schedules</h3>
                {schedules.length === 0 ? (
                  <p className="text-gray-400">No schedules yet.</p>
                ) : (
                  schedules.map((schedule) => (
                    <div key={schedule.id} className="bg-gray-800/30 rounded-lg p-4 border border-gray-600/50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{schedule.title}</h4>
                          {schedule.description && <p className="text-gray-400 mt-1">{schedule.description}</p>}
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-400">
                            <span>Frequency: {schedule.frequency}</span>
                            <span>Status: {schedule.is_active ? 'Active' : 'Inactive'}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleSchedule(schedule.id)}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              schedule.is_active
                                ? 'bg-green-600/20 text-green-400 border border-green-600/50'
                                : 'bg-gray-600/20 text-gray-400 border border-gray-600/50'
                            }`}
                          >
                            {schedule.is_active ? 'Active' : 'Inactive'}
                          </button>
                          <button
                            onClick={() => deleteSchedule(schedule.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* App Settings Tab */}
          {activeTab === 'app' && (
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50">
              <h2 className="text-xl font-semibold mb-6 text-white">App Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Theme</h3>
                    <p className="text-gray-400">Choose your preferred theme</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setTheme('light')}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        theme === 'light'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        theme === 'dark'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Notifications</h3>
                    <p className="text-gray-400">Enable or disable notifications</p>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications ? 'bg-indigo-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Language</h3>
                    <p className="text-gray-400">Select your language</p>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Account Management Tab */}
          {activeTab === 'account' && (
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50">
              <h2 className="text-xl font-semibold mb-6 text-white">Account Management</h2>
              <div className="space-y-8">
                {/* Password Change */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Change Password</h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
                    >
                      Change Password
                    </button>
                  </form>
                </div>

                {/* Account Deletion */}
                <div className="border-t border-gray-600 pt-8">
                  <h3 className="text-lg font-medium text-red-400 mb-4">Danger Zone</h3>
                  <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Delete Account</h4>
                    <p className="text-gray-400 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button
                      onClick={handleAccountDeletion}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;