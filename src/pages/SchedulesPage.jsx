import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const SchedulesPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchSchedules();
    fetchSpeakers();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${baseURL}/schedules`);
      setSchedules(response.data || []);
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError('Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpeakers = async () => {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${baseURL}/speakers`);
      setSpeakers(response.data || []);
    } catch (err) {
      console.error('Error fetching speakers:', err);
    }
  };

  const handleCreateSchedule = async (formData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      
      await axios.post(`${baseURL}/schedules`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setShowCreateModal(false);
      fetchSchedules();
    } catch (err) {
      console.error('Error creating schedule:', err);
      alert('Failed to create schedule');
    }
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setShowEditModal(true);
  };

  const handleUpdateSchedule = async (formData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      
      await axios.put(`${baseURL}/schedules/${editingSchedule._id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setShowEditModal(false);
      setEditingSchedule(null);
      fetchSchedules();
    } catch (err) {
      console.error('Error updating schedule:', err);
      alert('Failed to update schedule');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      
      await axios.delete(`${baseURL}/schedules/${scheduleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setDeleteConfirm(null);
      fetchSchedules();
    } catch (err) {
      console.error('Error deleting schedule:', err);
      alert('Failed to delete schedule');
    }
  };

  const handleNavigate = (path) => {
    window.location.href = path;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage="schedules" onNavigate={handleNavigate} />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Schedules Management</h1>
              <p className="text-gray-600">Manage class schedules and timetables</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Add Schedule
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
              <button 
                onClick={fetchSchedules}
                className="ml-4 text-red-800 underline hover:text-red-900"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {schedules.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📅</div>
                  <p className="text-gray-500 text-lg">No schedules found</p>
                  <p className="text-gray-400">Add your first schedule to get started</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">
                      All Schedules ({schedules.length})
                    </h2>
                    <div className="text-sm text-gray-500">
                      Sorted by schedule date
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {schedules.map((schedule) => (
                      <div key={schedule._id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {schedule.title}
                            </h3>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-500">Class:</span>
                                <span className="text-sm text-gray-900 bg-blue-100 px-2 py-1 rounded">
                                  {schedule.class}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-500">Faculty:</span>
                                <span className="text-sm text-gray-900">
                                  {schedule.faculty?.name || 'Unknown Faculty'}
                                </span>
                                {schedule.faculty?.designation && (
                                  <span className="text-xs text-gray-500">
                                    ({schedule.faculty.designation})
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-500">Date:</span>
                                <span className="text-sm text-gray-900">
                                  {schedule.scheduleDate ? new Date(schedule.scheduleDate).toLocaleDateString() : 'No date'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-500">Time:</span>
                                <span className="text-sm text-gray-900">
                                  {schedule.scheduleDate ? new Date(schedule.scheduleDate).toLocaleTimeString() : 'No time'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <span>
                            Created: {schedule.createdAt ? new Date(schedule.createdAt).toLocaleDateString() : 'Unknown date'}
                          </span>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditSchedule(schedule)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium px-3 py-1 rounded-md hover:bg-indigo-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(schedule)}
                            className="text-red-600 hover:text-red-900 text-sm font-medium px-3 py-1 rounded-md hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <CreateScheduleModal
          speakers={speakers}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateSchedule}
        />
      )}

      {/* Edit Schedule Modal */}
      {showEditModal && editingSchedule && (
        <EditScheduleModal
          schedule={editingSchedule}
          speakers={speakers}
          onClose={() => {
            setShowEditModal(false);
            setEditingSchedule(null);
          }}
          onSave={handleUpdateSchedule}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          schedule={deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDeleteSchedule(deleteConfirm._id)}
        />
      )}
    </div>
  );
};

// Create Schedule Modal Component
const CreateScheduleModal = ({ speakers, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    class: '',
    scheduleDate: '',
    faculty: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Schedule</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Class *</label>
              <input
                type="text"
                value={formData.class}
                onChange={(e) => setFormData({...formData, class: e.target.value})}
                placeholder="Enter class name (e.g., 8, 9, 10, 11, 12)"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Schedule Date & Time *</label>
              <input
                type="datetime-local"
                value={formData.scheduleDate}
                onChange={(e) => setFormData({...formData, scheduleDate: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Faculty *</label>
              <select
                value={formData.faculty}
                onChange={(e) => setFormData({...formData, faculty: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select a faculty</option>
                {speakers.map((speaker) => (
                  <option key={speaker._id} value={speaker._id}>
                    {speaker.name} {speaker.designation ? `(${speaker.designation})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Schedule'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Edit Schedule Modal Component
const EditScheduleModal = ({ schedule, speakers, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: schedule.title || '',
    class: schedule.class || '',
    scheduleDate: schedule.scheduleDate ? new Date(schedule.scheduleDate).toISOString().slice(0, 16) : '',
    faculty: schedule.faculty?._id || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Schedule</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Class *</label>
              <input
                type="text"
                value={formData.class}
                onChange={(e) => setFormData({...formData, class: e.target.value})}
                placeholder="Enter class name (e.g., 8, 9, 10, 11, 12)"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Schedule Date & Time *</label>
              <input
                type="datetime-local"
                value={formData.scheduleDate}
                onChange={(e) => setFormData({...formData, scheduleDate: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Faculty *</label>
              <select
                value={formData.faculty}
                onChange={(e) => setFormData({...formData, faculty: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select a faculty</option>
                {speakers.map((speaker) => (
                  <option key={speaker._id} value={speaker._id}>
                    {speaker.name} {speaker.designation ? `(${speaker.designation})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Schedule'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmModal = ({ schedule, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Schedule</h3>
          <div className="mb-4">
            <h4 className="font-medium text-gray-900">{schedule.title}</h4>
            <p className="text-sm text-gray-600">Class: {schedule.class}</p>
            <p className="text-sm text-gray-600">Faculty: {schedule.faculty?.name}</p>
            <p className="text-sm text-gray-600">
              Date: {schedule.scheduleDate ? new Date(schedule.scheduleDate).toLocaleDateString() : 'No date'}
            </p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Are you sure you want to delete this schedule? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulesPage;
