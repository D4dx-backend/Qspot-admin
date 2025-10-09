import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const VideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchVideos();
    fetchSubjects();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${baseURL}/videos`);
      setVideos(response.data || []);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${baseURL}/subjects`);
      setSubjects(response.data || []);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const handleCreateVideo = async (formData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      
      if (formData.videoType === 'file') {
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('subject', formData.subject);
        formDataToSend.append('releaseDate', formData.releaseDate);
        formDataToSend.append('video', formData.video);
        
        await axios.post(`${baseURL}/videos`, formDataToSend, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // For URL type, send as JSON
        await axios.post(`${baseURL}/videos`, {
          title: formData.title,
          description: formData.description,
          subject: formData.subject,
          releaseDate: formData.releaseDate,
          video: formData.videoUrl
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      setShowCreateModal(false);
      fetchVideos();
    } catch (err) {
      console.error('Error creating video:', err);
      alert('Failed to create video');
    }
  };

  const handleEditVideo = (video) => {
    setEditingVideo(video);
    setShowEditModal(true);
  };

  const handleUpdateVideo = async (formData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      
      if (formData.videoType === 'file' && formData.video) {
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('subject', formData.subject);
        formDataToSend.append('releaseDate', formData.releaseDate);
        formDataToSend.append('video', formData.video);
        
        await axios.put(`${baseURL}/videos/${editingVideo._id}`, formDataToSend, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // For URL type or when no new file is uploaded
        const updateData = {
          title: formData.title,
          description: formData.description,
          subject: formData.subject,
          releaseDate: formData.releaseDate
        };
        
        // Only include video if it's a URL or if we're updating to a URL
        if (formData.videoType === 'url' && formData.videoUrl) {
          updateData.video = formData.videoUrl;
        }
        
        await axios.put(`${baseURL}/videos/${editingVideo._id}`, updateData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      setShowEditModal(false);
      setEditingVideo(null);
      fetchVideos();
    } catch (err) {
      console.error('Error updating video:', err);
      alert('Failed to update video');
    }
  };

  const handleDeleteVideo = async (videoId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      
      await axios.delete(`${baseURL}/videos/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setDeleteConfirm(null);
      fetchVideos();
    } catch (err) {
      console.error('Error deleting video:', err);
      alert('Failed to delete video');
    }
  };

  const handleNavigate = (path) => {
    window.location.href = path;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage="videos" onNavigate={handleNavigate} />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Videos Management</h1>
              <p className="text-gray-600">Manage educational videos and content</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Add Video
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
                onClick={fetchVideos}
                className="ml-4 text-red-800 underline hover:text-red-900"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {videos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🎥</div>
                  <p className="text-gray-500 text-lg">No videos found</p>
                  <p className="text-gray-400">Add your first video to get started</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">
                      All Videos ({videos.length})
                    </h2>
                    <div className="text-sm text-gray-500">
                      Sorted by creation date
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => (
                      <div key={video._id} className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => window.open(video.video, '_blank')}>
                        <div className="aspect-w-16 aspect-h-9">
                          <video
                            className="w-full h-48 object-cover"
                            controls
                            preload="metadata"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <source src={video.video} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {video.title}
                            </h3>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Click to open
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {video.description || 'No description'}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              {video.subject?.name || 'No Subject'}
                            </span>
                            <span>
                              {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'Unknown date'}
                            </span>
                          </div>
                          {video.releaseDate && (
                            <div className="text-sm text-gray-500 mb-3">
                              <span className="font-medium">Release Date:</span> {video.releaseDate}
                            </div>
                          )}
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditVideo(video);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium px-3 py-1 rounded-md hover:bg-indigo-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(video);
                              }}
                              className="text-red-600 hover:text-red-900 text-sm font-medium px-3 py-1 rounded-md hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
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

      {/* Create Video Modal */}
      {showCreateModal && (
        <CreateVideoModal
          subjects={subjects}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateVideo}
        />
      )}

      {/* Edit Video Modal */}
      {showEditModal && editingVideo && (
        <EditVideoModal
          video={editingVideo}
          subjects={subjects}
          onClose={() => {
            setShowEditModal(false);
            setEditingVideo(null);
          }}
          onSave={handleUpdateVideo}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          video={deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDeleteVideo(deleteConfirm._id)}
        />
      )}
    </div>
  );
};

// Create Video Modal Component
const CreateVideoModal = ({ subjects, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    video: null,
    videoUrl: '',
    videoType: 'file', // 'file' or 'url'
    releaseDate: ''
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

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, video: file });
    }
  };

  const handleVideoTypeChange = (type) => {
    setFormData({ 
      ...formData, 
      videoType: type,
      video: type === 'file' ? formData.video : null,
      videoUrl: type === 'url' ? formData.videoUrl : ''
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Video</h3>
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
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject *</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Release Date</label>
              <input
                type="text"
                value={formData.releaseDate}
                onChange={(e) => setFormData({...formData, releaseDate: e.target.value})}
                placeholder="e.g., 2024-01-15, January 15, 2024, Q1 2024"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">Enter release date in any format you prefer</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Video Type *</label>
              <div className="mt-1 flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="videoType"
                    value="file"
                    checked={formData.videoType === 'file'}
                    onChange={(e) => handleVideoTypeChange(e.target.value)}
                    className="mr-2"
                  />
                  File Upload
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="videoType"
                    value="url"
                    checked={formData.videoType === 'url'}
                    onChange={(e) => handleVideoTypeChange(e.target.value)}
                    className="mr-2"
                  />
                  Video URL
                </label>
              </div>
            </div>
            {formData.videoType === 'file' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700">Video File *</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">Video URL *</label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                  placeholder="https://example.com/video.mp4"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter a direct link to a video file (MP4, WebM, etc.)</p>
              </div>
            )}
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
                {loading ? 'Creating...' : 'Create Video'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Edit Video Modal Component
const EditVideoModal = ({ video, subjects, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: video.title || '',
    description: video.description || '',
    subject: video.subject?._id || '',
    video: null,
    videoUrl: video.video || '',
    videoType: video.video?.startsWith('http') ? 'url' : 'file',
    releaseDate: video.releaseDate || ''
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

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, video: file });
    }
  };

  const handleVideoTypeChange = (type) => {
    setFormData({ 
      ...formData, 
      videoType: type,
      video: type === 'file' ? formData.video : null,
      videoUrl: type === 'url' ? formData.videoUrl : ''
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Video</h3>
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
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject *</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Release Date</label>
              <input
                type="text"
                value={formData.releaseDate}
                onChange={(e) => setFormData({...formData, releaseDate: e.target.value})}
                placeholder="e.g., 2024-01-15, January 15, 2024, Q1 2024"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">Enter release date in any format you prefer</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Video</label>
              <video
                src={video.video}
                className="mt-2 w-full h-32 object-cover rounded-md border"
                controls
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Video Type</label>
              <div className="mt-1 flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="videoType"
                    value="file"
                    checked={formData.videoType === 'file'}
                    onChange={(e) => handleVideoTypeChange(e.target.value)}
                    className="mr-2"
                  />
                  File Upload
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="videoType"
                    value="url"
                    checked={formData.videoType === 'url'}
                    onChange={(e) => handleVideoTypeChange(e.target.value)}
                    className="mr-2"
                  />
                  Video URL
                </label>
              </div>
            </div>
            {formData.videoType === 'file' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700">New Video File (optional)</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to keep current video</p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">New Video URL (optional)</label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                  placeholder="https://example.com/video.mp4"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">Enter a direct link to a video file or leave empty to keep current video</p>
              </div>
            )}
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
                {loading ? 'Updating...' : 'Update Video'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmModal = ({ video, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Video</h3>
          <div className="mb-4">
            <video
              src={video.video}
              className="w-full h-32 object-cover rounded-md border"
              controls
            />
            <h4 className="font-medium text-gray-900 mt-2">{video.title}</h4>
            <p className="text-sm text-gray-600">{video.description}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Are you sure you want to delete this video? This action cannot be undone and will also delete the video file.
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

export default VideosPage;
