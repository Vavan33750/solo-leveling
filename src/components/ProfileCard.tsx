import React, { useState, useEffect } from 'react';
import { useProfileStore } from '../stores/profileStore';

interface ProfileCardProps {
  userId: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ userId }) => {
  const { profile, loading, error, fetchProfile } = useProfileStore();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);

  React.useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    }
  }, [userId, fetchProfile]);

  useEffect(() => {
    if (profile && previousLevel !== null && profile.level > previousLevel) {
      setShowLevelUp(true);
      const timer = setTimeout(() => setShowLevelUp(false), 3000);
      return () => clearTimeout(timer);
    }
    if (profile) {
      setPreviousLevel(profile.level);
    }
  }, [profile?.level, previousLevel]);

  if (loading) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg p-5">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-2 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg p-5">
        <div className="text-red-600 text-sm">Error loading profile: {error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg p-5">
        <div className="text-gray-500">No profile data available</div>
      </div>
    );
  }

  const xpForNextLevel = profile.level * 100;
  const progressPercentage = (profile.xp / xpForNextLevel) * 100;

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg relative">
      {showLevelUp && (
        <div className="absolute inset-0 bg-yellow-400 bg-opacity-90 flex items-center justify-center z-10 rounded-lg animate-pulse">
          <div className="text-center text-white">
            <div className="text-4xl font-bold mb-2">🎉</div>
            <div className="text-2xl font-bold">LEVEL UP!</div>
            <div className="text-lg">You are now Level {profile.level}</div>
          </div>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {profile.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {profile.username || 'User'}
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                Level {profile.level}
              </dd>
            </dl>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>XP Progress</span>
            <span>{profile.xp} / {xpForNextLevel} XP</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{profile.stats.strength}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Strength</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{profile.stats.intelligence}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Intelligence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{profile.stats.motivation}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Motivation</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;