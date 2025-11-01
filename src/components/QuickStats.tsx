import React from 'react';
import { useProfileStore } from '../stores/profileStore';
import { useMissionsStore } from '../stores/missionsStore';
import { motion } from 'framer-motion';

interface QuickStatsProps {
  userId: string;
}

const QuickStats: React.FC<QuickStatsProps> = ({ userId }) => {
  const { profile } = useProfileStore();
  const { missions } = useMissionsStore();

  const completedMissionsToday = missions.filter(
    m => m.status === 'completed' &&
    new Date(m.updated_at).toDateString() === new Date().toDateString()
  ).length;

  const totalXPFromMissions = missions
    .filter(m => m.status === 'completed')
    .reduce((sum, m) => sum + m.xp_reward, 0);

  const activeMissions = missions.filter(
    m => m.status === 'pending' || m.status === 'in_progress'
  ).length;

  const stats = [
    {
      label: 'Level',
      value: profile?.level || 1,
      icon: '⭐',
      color: 'text-yellow-400'
    },
    {
      label: 'XP Today',
      value: totalXPFromMissions,
      icon: '⚡',
      color: 'text-blue-400'
    },
    {
      label: 'Missions Done',
      value: completedMissionsToday,
      icon: '✅',
      color: 'text-green-400'
    },
    {
      label: 'Active Missions',
      value: activeMissions,
      icon: '🎯',
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="card-glow rounded-lg p-4 text-center"
        >
          <div className="text-2xl mb-2">{stat.icon}</div>
          <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
};

export default QuickStats;