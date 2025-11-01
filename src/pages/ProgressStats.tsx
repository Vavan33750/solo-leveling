import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabase';
import { Mission, MissionHistory } from '../types';

interface ProgressStatsProps {
  userId: string;
}

interface CategoryStats {
  category: string;
  completed: number;
  total: number;
  xpGained: number;
}

interface LevelProgression {
  date: string;
  level: number;
  xp: number;
}

interface StatsData {
  totalMissions: number;
  completedMissions: number;
  averageXP: number;
  categoryStats: CategoryStats[];
  levelProgression: LevelProgression[];
  missionHistory: MissionHistory[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

const ProgressStats: React.FC<ProgressStatsProps> = ({ userId }) => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'sport' | 'studies' | 'routine'>('all');

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const now = new Date();
      let startDate: Date | null = null;

      switch (dateRange) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'all':
          startDate = null;
          break;
      }

      // Fetch missions
      let missionsQuery = supabase
        .from('missions')
        .select('*')
        .eq('user_id', userId);

      if (startDate) {
        missionsQuery = missionsQuery.gte('created_at', startDate.toISOString());
      }

      const { data: missions, error: missionsError } = await missionsQuery;
      if (missionsError) throw missionsError;

      // Fetch mission history
      let historyQuery = supabase
        .from('mission_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (startDate) {
        historyQuery = historyQuery.gte('created_at', startDate.toISOString());
      }

      const { data: history, error: historyError } = await historyQuery;
      if (historyError) throw historyError;

      // Process data
      const processedMissions = missions || [];
      const processedHistory = history || [];

      // Filter by category if needed
      const filteredMissions = categoryFilter === 'all'
        ? processedMissions
        : processedMissions.filter(m => m.category === categoryFilter);

      const filteredHistory = categoryFilter === 'all'
        ? processedHistory
        : processedHistory.filter(h => {
          const mission = processedMissions.find(m => m.id === h.mission_id);
          return mission?.category === categoryFilter;
        });

      // Calculate category stats
      const categoryStats: CategoryStats[] = ['sport', 'studies', 'routine'].map(category => {
        const categoryMissions = filteredMissions.filter(m => m.category === category);
        const completedMissions = categoryMissions.filter(m => m.status === 'completed');
        const xpGained = completedMissions.reduce((sum, m) => sum + m.xp_reward, 0);

        return {
          category: category.charAt(0).toUpperCase() + category.slice(1),
          completed: completedMissions.length,
          total: categoryMissions.length,
          xpGained
        };
      });

      // Calculate level progression (simplified - in real app, you'd track level changes)
      const levelProgression: LevelProgression[] = [];
      let currentXP = 0;
      let currentLevel = 1;

      filteredHistory.forEach((entry, index) => {
        currentXP += entry.xp_gained;
        currentLevel = Math.floor(currentXP / 100) + 1; // Assuming 100 XP per level

        levelProgression.push({
          date: new Date(entry.created_at).toLocaleDateString(),
          level: currentLevel,
          xp: currentXP
        });
      });

      // Remove duplicates by date
      const uniqueProgression = levelProgression.filter((item, index, self) =>
        index === self.findIndex(t => t.date === item.date)
      );

      const statsData: StatsData = {
        totalMissions: filteredMissions.length,
        completedMissions: filteredMissions.filter(m => m.status === 'completed').length,
        averageXP: filteredMissions.length > 0
          ? Math.round(filteredMissions.reduce((sum, m) => sum + m.xp_reward, 0) / filteredMissions.length)
          : 0,
        categoryStats,
        levelProgression: uniqueProgression,
        missionHistory: filteredHistory
      };

      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userId, dateRange, categoryFilter]);

  const chartData = useMemo(() => {
    if (!stats) return [];
    return stats.categoryStats.map(stat => ({
      category: stat.category,
      completed: stat.completed,
      total: stat.total,
      completionRate: stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0
    }));
  }, [stats]);

  const levelData = useMemo(() => {
    if (!stats) return [];
    return stats.levelProgression;
  }, [stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-300">Date Range:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-300">Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm text-white"
          >
            <option value="all">All Categories</option>
            <option value="sport">Sport</option>
            <option value="studies">Studies</option>
            <option value="routine">Routine</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-white mb-2">Total Missions</h3>
          <p className="text-3xl font-bold text-indigo-400">{stats.totalMissions}</p>
          <p className="text-sm text-gray-400">{stats.completedMissions} completed</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-white mb-2">Average XP per Mission</h3>
          <p className="text-3xl font-bold text-green-400">{stats.averageXP}</p>
          <p className="text-sm text-gray-400">XP earned</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-white mb-2">Completion Rate</h3>
          <p className="text-3xl font-bold text-yellow-400">
            {stats.totalMissions > 0 ? Math.round((stats.completedMissions / stats.totalMissions) * 100) : 0}%
          </p>
          <p className="text-sm text-gray-400">Overall</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Performance Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Category Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="category" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="completed" fill="#8884d8" name="Completed" />
              <Bar dataKey="total" fill="#82ca9d" name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Level Progression Line Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Level Progression</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={levelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="level"
                stroke="#ffc658"
                strokeWidth={2}
                name="Level"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Mission History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Mission History</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {stats.missionHistory.slice(-20).reverse().map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-between items-center p-3 bg-gray-700/50 rounded border border-gray-600"
            >
              <div>
                <p className="text-sm text-white font-medium">{entry.action}</p>
                <p className="text-xs text-gray-400">
                  {new Date(entry.created_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-400">+{entry.xp_gained} XP</p>
                {entry.notes && <p className="text-xs text-gray-400">{entry.notes}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProgressStats;