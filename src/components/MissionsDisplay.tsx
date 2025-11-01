import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMissionsStore } from '../stores/missionsStore';
import { useProfileStore } from '../stores/profileStore';
import { useObjectivesStore } from '../stores/objectivesStore';
import { useSchedulesStore } from '../stores/schedulesStore';
import { Mission } from '../types';

interface MissionsDisplayProps {
  userId: string;
}

const MissionsDisplay: React.FC<MissionsDisplayProps> = ({ userId }) => {
  const {
    missions,
    loading,
    error,
    fetchMissions,
    markMissionComplete,
    generateDailyMissions
  } = useMissionsStore();

  const { profile } = useProfileStore();
  const { objectives } = useObjectivesStore();
  const { schedules } = useSchedulesStore();

  const [completingMissions, setCompletingMissions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (userId) {
      fetchMissions(userId);
    }
  }, [userId, fetchMissions]);

  const handleCompleteMission = async (missionId: string) => {
    setCompletingMissions(prev => new Set(prev).add(missionId));

    try {
      await markMissionComplete(missionId);
      // Add XP to profile
      await useProfileStore.getState().addXP(
        missions.find(m => m.id === missionId)?.xp_reward || 0
      );
    } catch (error) {
      console.error('Failed to complete mission:', error);
    } finally {
      setTimeout(() => {
        setCompletingMissions(prev => {
          const newSet = new Set(prev);
          newSet.delete(missionId);
          return newSet;
        });
      }, 600); // Match animation duration
    }
  };

  const handleGenerateMissions = async () => {
    if (profile && objectives && schedules) {
      await generateDailyMissions(userId, profile, objectives, schedules);
      await fetchMissions(userId);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sport': return '🏃';
      case 'studies': return '📚';
      case 'routine': return '🧹';
      default: return '🎯';
    }
  };

  const pendingMissions = missions.filter(m => m.status === 'pending' || m.status === 'in_progress');

  if (loading) {
    return (
      <div className="card-glow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-glow rounded-lg p-6">
        <div className="text-red-400 text-sm">Error loading missions: {error}</div>
      </div>
    );
  }

  return (
    <div className="card-glow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Daily Missions</h3>
        <button
          onClick={handleGenerateMissions}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200"
        >
          Generate New Missions
        </button>
      </div>

      <AnimatePresence>
        {pendingMissions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-8"
          >
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-gray-400">No active missions. Generate some new ones!</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {pendingMissions.map((mission: Mission) => (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: completingMissions.has(mission.id) ? [1, 1.05, 1] : 1
                }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className={`card-glow rounded-lg p-4 ${
                  completingMissions.has(mission.id) ? 'mission-complete' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getCategoryIcon(mission.category)}</div>
                    <div>
                      <h4 className="text-white font-medium">{mission.title}</h4>
                      <p className="text-gray-400 text-sm">{mission.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs font-medium ${getDifficultyColor(mission.difficulty)}`}>
                          {mission.difficulty.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-yellow-400">+{mission.xp_reward} XP</span>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCompleteMission(mission.id)}
                    disabled={completingMissions.has(mission.id)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg transition-colors duration-200"
                  >
                    {completingMissions.has(mission.id) ? '✓' : 'Complete'}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MissionsDisplay;