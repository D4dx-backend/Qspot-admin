import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiChevronLeft, FiChevronRight, FiPlay, FiCalendar, FiBookOpen } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';

const VideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Pagination and search states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchVideos();
    fetchSubjects();
  }, []);

  // Filter and sort videos based on search term, subject filter, and sort options
  useEffect(() => {
    let filtered = [...videos];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(video => 
        video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.releaseDate?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply subject filter
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(video => 
        video.subject?._id === subjectFilter
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'releaseDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else {
        aValue = aValue?.toString().toLowerCase() || '';
        bValue = bValue?.toString().toLowerCase() || '';
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredVideos(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [videos, searchTerm, subjectFilter, sortBy, sortOrder]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const baseURL = import.meta.env.VITE_API_BASE_URL;
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
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.get(`${baseURL}/subjects`);
      setSubjects(response.data || []);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const handleCreateVideo = async (formData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      
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
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      
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
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      
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

  // Helper function to extract YouTube video ID and generate thumbnail URL
  const getYouTubeThumbnail = (url) => {
    if (!url) return null;
    
    // YouTube URL patterns
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const videoId = match[1];
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }
    
    return null;
  };

  // Helper function to check if URL is a YouTube link
  const isYouTubeUrl = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Helper function to handle YouTube video click
  const handleYouTubeClick = (url) => {
    if (isYouTubeUrl(url)) {
      // Open YouTube video in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVideos = filteredVideos.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  // Statistics
  const totalVideos = videos.length;
  const recentVideos = videos.filter(v => {
    const videoDate = new Date(v.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return videoDate > weekAgo;
  }).length;

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar currentPage="videos" onNavigate={handleNavigate} />
      
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4">
          {/* Header Section */}
          <div className="mb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Videos Management</h2>
                <p className="text-gray-400 text-sm">Manage educational videos and content</p>
              </div>
              
              {/* Statistics Cards */}
              <div className="flex gap-3">
                <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 min-w-[100px]">
                  <div className="flex items-center gap-2">
                    <FiPlay className="text-indigo-400" size={16} />
                    <div>
                      <p className="text-lg font-bold text-white">{totalVideos}</p>
                      <p className="text-xs text-gray-400">Total</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 min-w-[100px]">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-green-400" size={16} />
                    <div>
                      <p className="text-lg font-bold text-white">{recentVideos}</p>
                      <p className="text-xs text-gray-400">This Week</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 min-w-[100px]">
                  <div className="flex items-center gap-2">
                    <FiBookOpen className="text-yellow-400" size={16} />
                    <div>
                      <p className="text-lg font-bold text-white">{filteredVideos.length}</p>
                      <p className="text-xs text-gray-400">Filtered</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search videos by title, description, subject, or release date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="all">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="createdAt">Sort by Date</option>
                  <option value="title">Sort by Title</option>
                  <option value="releaseDate">Sort by Release</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white hover:bg-gray-800 transition-colors text-sm"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1 transition-colors"
                >
                  <FiPlus size={14} />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-md">
              {error}
              <button 
                onClick={fetchVideos}
                className="ml-4 text-red-300 underline hover:text-red-200"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVideos.length === 0 ? (
                <div className="text-center py-8">
                  <FiPlay className="mx-auto text-gray-500 mb-3" size={36} />
                  <p className="text-gray-400">
                    {searchTerm || subjectFilter !== 'all' ? 'No videos found matching your search' : 'No videos found'}
                  </p>
                  {(searchTerm || subjectFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSubjectFilter('all');
                      }}
                      className="mt-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {currentVideos.map((video) => (
                    <div key={video._id} className="bg-gray-900 rounded-lg shadow-md overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg">
                      <div className="flex">
                        {/* Video Preview */}
                        <div className="w-48 h-32 flex-shrink-0 relative">
                          {isYouTubeUrl(video.video) ? (
                            <div 
                              className="w-full h-full relative group cursor-pointer" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleYouTubeClick(video.video);
                              }}
                              title="Click to open in YouTube"
                            >
                              <img
                                src={getYouTubeThumbnail(video.video)}
                                alt="YouTube thumbnail"
                                className="w-full h-full object-cover rounded-l-lg"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xMiA2VjE4TTYgMTJIMTgiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+';
                                }}
                              />
                              {/* YouTube Play Button Overlay */}
                              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-all duration-200">
                                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                  <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                </div>
                              </div>
                              {/* YouTube Badge with External Link Icon */}
                              <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                <span>YouTube</span>
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          ) : (
                            <video
                              className="w-full h-full object-cover rounded-l-lg"
                              controls
                              preload="metadata"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <source src={video.video} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          )}
                        </div>
                        
                        {/* Video Info */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between h-full">
                            <div className="flex-1">
                              <div className="mb-3">
                                <h3 className="text-lg font-semibold text-white mb-2">{video.title}</h3>
                                <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                                  {video.description || 'No description'}
                                </p>
                                <div className="flex items-center space-x-3 mb-2">
                                  <span className="bg-indigo-900/30 text-indigo-400 px-2 py-1 rounded border border-indigo-500/30 text-xs">
                                    {video.subject?.name || 'No Subject'}
                                  </span>
                                  {video.releaseDate && (
                                    <span className="text-xs text-gray-400">
                                      Release: {video.releaseDate}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                <span className="text-xs text-gray-400 flex items-center">
                                  <FiCalendar className="mr-1" size={10} />
                                  Created: {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'Unknown date'}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {video.createdAt ? new Date(video.createdAt).toLocaleTimeString() : ''}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex space-x-1 ml-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditVideo(video);
                                }}
                                className="flex items-center space-x-1 px-2 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-xs font-medium"
                                title="Edit video"
                              >
                                <FiEdit2 size={12} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirm(video);
                                }}
                                className="flex items-center space-x-1 px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs font-medium"
                                title="Delete video"
                              >
                                <FiTrash2 size={12} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 mt-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                          Showing {startIndex + 1} to {Math.min(endIndex, filteredVideos.length)} of {filteredVideos.length} videos
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <FiChevronLeft size={14} />
                          </button>
                          
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            // Show first page, last page, current page, and pages around current page
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    currentPage === page
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            } else if (
                              page === currentPage - 2 ||
                              page === currentPage + 2
                            ) {
                              return <span key={page} className="text-gray-500 text-xs">...</span>;
                            }
                            return null;
                          })}
                          
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <FiChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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
    <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-4 border border-gray-700 w-96 shadow-2xl rounded-md bg-gray-900">
        <div className="mt-2">
          <h3 className="text-lg font-medium text-white mb-3">Add New Video</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
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
              <label className="block text-sm font-medium text-gray-300">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Subject *</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
              <label className="block text-sm font-medium text-gray-300">Release Date</label>
              <input
                type="text"
                value={formData.releaseDate}
                onChange={(e) => setFormData({...formData, releaseDate: e.target.value})}
                placeholder="e.g., 2024-01-15, January 15, 2024, Q1 2024"
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-400 mt-1">Enter release date in any format you prefer</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Video Type *</label>
              <div className="mt-1 flex space-x-4">
                <label className="flex items-center text-gray-300">
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
                <label className="flex items-center text-gray-300">
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
                <label className="block text-sm font-medium text-gray-300">Video File *</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300">Video URL *</label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                  placeholder="https://example.com/video.mp4"
                  className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Enter a direct link to a video file (MP4, WebM, etc.)</p>
              </div>
            )}
            <div className="flex justify-end space-x-2 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 transition-colors"
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
    <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-4 border border-gray-700 w-96 shadow-2xl rounded-md bg-gray-900">
        <div className="mt-2">
          <h3 className="text-lg font-medium text-white mb-3">Edit Video</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
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
              <label className="block text-sm font-medium text-gray-300">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Subject *</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
              <label className="block text-sm font-medium text-gray-300">Release Date</label>
              <input
                type="text"
                value={formData.releaseDate}
                onChange={(e) => setFormData({...formData, releaseDate: e.target.value})}
                placeholder="e.g., 2024-01-15, January 15, 2024, Q1 2024"
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-400 mt-1">Enter release date in any format you prefer</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Current Video</label>
              {isYouTubeUrl(video.video) ? (
                <div 
                  className="mt-2 w-full h-32 relative group cursor-pointer"
                  onClick={() => handleYouTubeClick(video.video)}
                  title="Click to open in YouTube"
                >
                  <img
                    src={getYouTubeThumbnail(video.video)}
                    alt="YouTube thumbnail"
                    className="w-full h-full object-cover rounded-md border border-gray-600"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xMiA2VjE4TTYgMTJIMTgiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-all duration-200">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <span>YouTube</span>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              ) : (
                <video
                  src={video.video}
                  className="mt-2 w-full h-32 object-cover rounded-md border border-gray-600"
                  controls
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Video Type</label>
              <div className="mt-1 flex space-x-4">
                <label className="flex items-center text-gray-300">
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
                <label className="flex items-center text-gray-300">
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
                <label className="block text-sm font-medium text-gray-300">New Video File (optional)</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-400 mt-1">Leave empty to keep current video</p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300">New Video URL (optional)</label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                  placeholder="https://example.com/video.mp4"
                  className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-400 mt-1">Enter a direct link to a video file or leave empty to keep current video</p>
              </div>
            )}
            <div className="flex justify-end space-x-2 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 transition-colors"
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
    <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-4 border border-gray-700 w-96 shadow-2xl rounded-md bg-gray-900">
        <div className="mt-2">
          <h3 className="text-lg font-medium text-white mb-3">Delete Video</h3>
          <div className="mb-3">
            {isYouTubeUrl(video.video) ? (
              <div 
                className="w-full h-32 relative group cursor-pointer"
                onClick={() => handleYouTubeClick(video.video)}
                title="Click to open in YouTube"
              >
                <img
                  src={getYouTubeThumbnail(video.video)}
                  alt="YouTube thumbnail"
                  className="w-full h-full object-cover rounded-md border border-gray-600"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xMiA2VjE4TTYgMTJIMTgiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-all duration-200">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
                <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <span>YouTube</span>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            ) : (
              <video
                src={video.video}
                className="w-full h-32 object-cover rounded-md border border-gray-600"
                controls
              />
            )}
            <h4 className="font-medium text-white mt-2">{video.title}</h4>
            <p className="text-sm text-gray-300">{video.description}</p>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Are you sure you want to delete this video? This action cannot be undone and will also delete the video file.
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
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
