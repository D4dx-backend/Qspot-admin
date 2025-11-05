import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.get(`${baseURL}/notifications`);
      setNotifications(response.data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotification = async (formData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      
      await axios.post(`${baseURL}/notifications`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setShowCreateModal(false);
      fetchNotifications();
    } catch (err) {
      console.error('Error creating notification:', err);
      alert('Failed to create notification');
    }
  };

  const handleEditNotification = (notification) => {
    setEditingNotification(notification);
    setShowEditModal(true);
  };

  const handleUpdateNotification = async (formData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      
      await axios.put(`${baseURL}/notifications/${editingNotification._id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setShowEditModal(false);
      setEditingNotification(null);
      fetchNotifications();
    } catch (err) {
      console.error('Error updating notification:', err);
      alert('Failed to update notification');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      
      await axios.delete(`${baseURL}/notifications/${notificationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setDeleteConfirm(null);
      fetchNotifications();
    } catch (err) {
      console.error('Error deleting notification:', err);
      alert('Failed to delete notification');
    }
  };

  const handleNavigate = (path) => {
    window.location.href = path;
  };

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar currentPage="notifications" onNavigate={handleNavigate} />
      
      <div className="flex-1 flex flex-col ml-64">
        <main className="flex-1 p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Notifications Management</h2>
              {/* <p className="text-gray-400">Manage system notifications and announcements</p> */}
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors"
            >
              <FiPlus size={16} />
              <span>Add Notification</span>
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-md">
              {error}
              <button 
                onClick={fetchNotifications}
                className="ml-4 text-red-300 underline hover:text-red-200"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No notifications found</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification._id} className="bg-gray-900 rounded-lg shadow-md overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {notification.title}
                          </h3>
                          <p className="text-gray-300 mb-4">
                            {notification.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-400">
                              <span>📅</span>
                              <span className="ml-2">
                                {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : 'Unknown date'}
                              </span>
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleEditNotification(notification)}
                                className="text-white hover:text-gray-300 hover:bg-gray-700 p-1 rounded transition-colors"
                                title="Edit notification"
                              >
                                <FiEdit2 size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(notification)}
                                className="text-white hover:text-gray-300 hover:bg-gray-700 p-1 rounded transition-colors"
                                title="Delete notification"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <CreateNotificationModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateNotification}
        />
      )}

      {/* Edit Notification Modal */}
      {showEditModal && editingNotification && (
        <EditNotificationModal
          notification={editingNotification}
          onClose={() => {
            setShowEditModal(false);
            setEditingNotification(null);
          }}
          onSave={handleUpdateNotification}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          notification={deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDeleteNotification(deleteConfirm._id)}
        />
      )}
    </div>
  );
};

// Create Notification Modal Component
const CreateNotificationModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
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
    <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border border-gray-700 w-96 shadow-2xl rounded-md bg-gray-900">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-white mb-4">Add New Notification</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter notification title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows="4"
                placeholder="Enter notification description"
                required
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating...' : 'Create Notification'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Edit Notification Modal Component
const EditNotificationModal = ({ notification, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: notification.title || '',
    description: notification.description || ''
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
    <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border border-gray-700 w-96 shadow-2xl rounded-md bg-gray-900">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-white mb-4">Edit Notification</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows="4"
                required
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 transition-colors"
              >
                {loading ? 'Updating...' : 'Update Notification'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmModal = ({ notification, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border border-gray-700 w-96 shadow-2xl rounded-md bg-gray-900">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-white mb-4">Delete Notification</h3>
          <div className="mb-4 p-4 bg-gray-800 rounded-md">
            <h4 className="font-medium text-white">{notification.title}</h4>
            <p className="text-sm text-gray-300 mt-1">{notification.description}</p>
          </div>
          <p className="text-sm text-gray-400 mb-6">
            Are you sure you want to delete this notification? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
