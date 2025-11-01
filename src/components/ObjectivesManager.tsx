import React, { useState } from 'react';
import { useObjectivesStore } from '../stores/objectivesStore';
import { CreateObjectiveInput } from '../types';

interface ObjectivesManagerProps {
  userId: string;
}

const ObjectivesManager: React.FC<ObjectivesManagerProps> = ({ userId }) => {
  const {
    objectives,
    loading,
    error,
    fetchObjectives,
    createObjective,
    updateObjective,
    deleteObjective,
    incrementProgress,
  } = useObjectivesStore();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateObjectiveInput>({
    title: '',
    description: '',
    target_value: 1,
    category: '',
    deadline: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (userId) {
      fetchObjectives(userId);
    }
  }, [userId, fetchObjectives]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (formData.target_value < 1) {
      errors.target_value = 'Target value must be at least 1';
    }

    if (formData.deadline && new Date(formData.deadline) < new Date()) {
      errors.deadline = 'Deadline cannot be in the past';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await createObjective(userId, formData);
      setFormData({
        title: '',
        description: '',
        target_value: 1,
        category: '',
        deadline: '',
      });
      setShowForm(false);
      setFormErrors({});
    } catch (error) {
      console.error('Failed to create objective:', error);
    }
  };

  const handleIncrement = async (id: string) => {
    try {
      await incrementProgress(id);
    } catch (error) {
      console.error('Failed to increment progress:', error);
    }
  };

  const handleStatusChange = async (id: string, status: 'active' | 'completed' | 'paused') => {
    try {
      await updateObjective(id, { status });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this objective?')) {
      try {
        await deleteObjective(id);
      } catch (error) {
        console.error('Failed to delete objective:', error);
      }
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Objectives</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            {showForm ? 'Cancel' : 'Add Objective'}
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
                <label className="block text-sm font-medium text-gray-700">Target Value *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: parseInt(e.target.value) || 1 })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
                {formErrors.target_value && <p className="mt-1 text-sm text-red-600">{formErrors.target_value}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {formErrors.deadline && <p className="mt-1 text-sm text-red-600">{formErrors.deadline}</p>}
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
                {loading ? 'Creating...' : 'Create Objective'}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {objectives.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No objectives yet. Create your first objective!</p>
          ) : (
            objectives.map((objective) => (
              <div key={objective.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{objective.title}</h4>
                    {objective.description && (
                      <p className="text-sm text-gray-600 mt-1">{objective.description}</p>
                    )}
                    {objective.category && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                        {objective.category}
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <select
                      value={objective.status}
                      onChange={(e) => handleStatusChange(objective.id, e.target.value as any)}
                      className="text-xs border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      onClick={() => handleDelete(objective.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress: {objective.current_value} / {objective.target_value}</span>
                    <span>{Math.round((objective.current_value / objective.target_value) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${Math.min((objective.current_value / objective.target_value) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {objective.status === 'active' && objective.current_value < objective.target_value && (
                  <button
                    onClick={() => handleIncrement(objective.id)}
                    className="mt-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                  >
                    +1 Progress
                  </button>
                )}

                {objective.deadline && (
                  <p className="text-xs text-gray-500 mt-2">
                    Deadline: {new Date(objective.deadline).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ObjectivesManager;