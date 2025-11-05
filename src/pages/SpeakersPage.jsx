import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';

const SpeakersPage = () => {
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const fetchSpeakers = async () => {
    try {
      setLoading(true);
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.get(`${baseURL}/speakers`);
      const data = Array.isArray(response.data) ? [...response.data] : [];
      data.sort((a, b) => {
        const aNum = Number(a?.order);
        const bNum = Number(b?.order);
        const aHas = !Number.isNaN(aNum);
        const bHas = !Number.isNaN(bNum);
        if (aHas && bHas) return aNum - bNum; // ascending by order
        if (aHas) return -1; // items with order come first
        if (bHas) return 1;
        return 0;
      });
      setSpeakers(data);
    } catch (err) {
      console.error('Error fetching speakers:', err);
      setError('Failed to fetch speakers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpeaker = async (formData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('designation', formData.designation);
      if (formData.order !== undefined && formData.order !== '') {
        formDataToSend.append('order', String(formData.order));
      }
      formDataToSend.append('image', formData.image);
      
      await axios.post(`${baseURL}/speakers`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setShowCreateModal(false);
      fetchSpeakers();
    } catch (err) {
      console.error('Error creating speaker:', err);
      alert('Failed to create speaker');
    }
  };

  const handleEditSpeaker = (speaker) => {
    setEditingSpeaker(speaker);
    setShowEditModal(true);
  };

  const handleUpdateSpeaker = async (formData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('designation', formData.designation);
      if (formData.order !== undefined && formData.order !== '') {
        formDataToSend.append('order', String(formData.order));
      }
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      
      await axios.put(`${baseURL}/speakers/${editingSpeaker._id}`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setShowEditModal(false);
      setEditingSpeaker(null);
      fetchSpeakers();
    } catch (err) {
      console.error('Error updating speaker:', err);
      alert('Failed to update speaker');
    }
  };

  const handleDeleteSpeaker = async (speakerId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      
      await axios.delete(`${baseURL}/speakers/${speakerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setDeleteConfirm(null);
      fetchSpeakers();
    } catch (err) {
      console.error('Error deleting speaker:', err);
      alert('Failed to delete speaker');
    }
  };

  const handleNavigate = (path) => {
    window.location.href = path;
  };

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar currentPage="speakers" onNavigate={handleNavigate} />
      
      <div className="flex-1 flex flex-col ml-64">
        <main className="flex-1 p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Speakers Management</h2>
              {/* <p className="text-gray-400">Manage speakers and their information</p> */}
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors"
            >
              <FiPlus size={16} />
              <span>Add Speaker</span>
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
                onClick={fetchSpeakers}
                className="ml-4 text-red-300 underline hover:text-red-200"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {speakers.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-400">No speakers found</p>
                </div>
              ) : (
                speakers.map((speaker) => (
                  <div key={speaker._id} className="bg-gray-900 rounded-lg shadow-md overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors">
                    <div className="aspect-w-16 aspect-h-9">
                      <img
                        src={speaker.image}
                        alt={speaker.name}
                        className="w-full h-50 object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xMiA2VjE4TTYgMTJIMTgiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {speaker.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {speaker.order !== undefined && speaker.order !== '' && (
                            <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full border border-gray-600" title="Order">
                              #{String(speaker.order)}
                            </span>
                          )}
                          <span className="text-xs bg-indigo-900/30 text-indigo-400 px-2 py-1 rounded-full border border-indigo-500/30">
                            Speaker
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                        <span className="truncate">
                          {speaker.designation || 'No designation'}
                        </span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditSpeaker(speaker)}
                            className="text-white hover:text-gray-300 hover:bg-gray-700 p-1 rounded transition-colors"
                            title="Edit speaker"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(speaker)}
                            className="text-white hover:text-gray-300 hover:bg-gray-700 p-1 rounded transition-colors"
                            title="Delete speaker"
                          >
                            <FiTrash2 size={14} />
                          </button>
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

      {/* Create Speaker Modal */}
      {showCreateModal && (
        <CreateSpeakerModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateSpeaker}
        />
      )}

      {/* Edit Speaker Modal */}
      {showEditModal && editingSpeaker && (
        <EditSpeakerModal
          speaker={editingSpeaker}
          onClose={() => {
            setShowEditModal(false);
            setEditingSpeaker(null);
          }}
          onSave={handleUpdateSpeaker}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          speaker={deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDeleteSpeaker(deleteConfirm._id)}
        />
      )}
    </div>
  );
};

// Create Speaker Modal Component
const CreateSpeakerModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    order: '',
    image: null
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border border-gray-700 w-96 shadow-2xl rounded-md bg-gray-900">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-white mb-4">Add New Speaker</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({...formData, designation: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Order (number)</label>
              <input
                type="number"
                inputMode="numeric"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 1"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Image *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
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
                {loading ? 'Creating...' : 'Create Speaker'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Edit Speaker Modal Component
const EditSpeakerModal = ({ speaker, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: speaker.name || '',
    designation: speaker.designation || '',
    order: speaker.order ?? '',
    image: null
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border border-gray-700 w-96 shadow-2xl rounded-md bg-gray-900">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-white mb-4">Edit Speaker</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({...formData, designation: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Order (number)</label>
              <input
                type="number"
                inputMode="numeric"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 1"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">New Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
              />
              <p className="text-xs text-gray-400 mt-1">Leave empty to keep current image</p>
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
                {loading ? 'Updating...' : 'Update Speaker'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmModal = ({ speaker, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border border-gray-700 w-96 shadow-2xl rounded-md bg-gray-900">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-white mb-4">Delete Speaker</h3>
          <p className="text-sm text-gray-400 mb-6">
            Are you sure you want to delete <strong className="text-white">{speaker.name}</strong>? This action cannot be undone and will also delete the speaker's image.
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

export default SpeakersPage;
