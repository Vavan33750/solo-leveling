import React, { useState } from 'react';
import { useSchedulesStore } from '../stores/schedulesStore';
import { CreateScheduleInput } from '../types';

interface SchedulesManagerProps {
  userId: string;
}

const SchedulesManager: React.FC<SchedulesManagerProps> = ({ userId }) => {
  const {
    schedules,
    loading,
    error,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    toggleSchedule,
  } = useSchedulesStore();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateScheduleInput>({
    title: '',
    description: '',
    frequency: 'daily',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (userId) {
      fetchSchedules(userId);
    }
  }, [userId, fetchSchedules]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.start_date) {
      errors.start_date = 'Start date is required';
    }

    if (formData.end_date && new Date(formData.end_date) < new Date(formData.start_date)) {
      errors.end_date = 'End date cannot be before start date';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await createSchedule(userId, formData);
      setFormData({
        title: '',
        description: '',
        frequency: 'daily',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
      });
      setShowForm(false);
      setFormErrors({});
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleSchedule(id);
    } catch (error) {
      console.error('Failed to toggle schedule:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await deleteSchedule(id);
      } catch (error) {
        console.error('Failed to delete schedule:', error);
      }
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      default: return frequency;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Schedules</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            {showForm ? 'Cancel' : 'Add Schedule'}
          </button>
        </div>

        {error && (
          <div className="mb-4 text-red-600 text-sm">Error: {error}</div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
              {formErrors.title && <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Frequency *</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date *</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
                {formErrors.start_date && <p className="mt-1 text-sm text-red-600">{formErrors.start_date}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {formErrors.end_date && <p className="mt-1 text-sm text-red-600">{formErrors.end_date}</p>}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Schedule'}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {schedules.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No schedules yet. Create your first schedule!</p>
          ) : (
            schedules.map((schedule) => (
              <div key={schedule.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{schedule.title}</h4>
                    {schedule.description && (
                      <p className="text-sm text-gray-600 mt-1">{schedule.description}</p>
                    )}
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs text-gray-500">
                        {getFrequencyLabel(schedule.frequency)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Started: {new Date(schedule.start_date).toLocaleDateString()}
                      </span>
                      {schedule.end_date && (
                        <span className="text-xs text-gray-500">
                          Ends: {new Date(schedule.end_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggle(schedule.id)}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        schedule.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {schedule.is_active ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
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
    </div>
  );
};

export default SchedulesManager;