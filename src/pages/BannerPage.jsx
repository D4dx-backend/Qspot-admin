import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiChevronLeft, FiChevronRight, FiImage, FiCalendar, FiEye } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';

const BannerPage = () => {
  const [banners, setBanners] = useState([]);
  const [filteredBanners, setFilteredBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Pagination and search states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchBanners();
  }, []);

  // Filter and sort banners based on search term and sort options
  useEffect(() => {
    let filtered = [...banners];

    // Apply search filter (since banners don't have text content, we'll search by creation date)
    if (searchTerm) {
      filtered = filtered.filter(banner => {
        const dateStr = banner.createdAt ? new Date(banner.createdAt).toLocaleDateString() : '';
        return dateStr.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt') {
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

    setFilteredBanners(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [banners, searchTerm, sortBy, sortOrder]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.get(`${baseURL}/banner`);
      setBanners(response.data || []);
    } catch (err) {
      console.error('Error fetching banners:', err);
      setError('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBanner = async (formData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      
      const formDataToSend = new FormData();
      formDataToSend.append('image', formData.image);
      
      await axios.post(`${baseURL}/banner`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setShowCreateModal(false);
      fetchBanners();
    } catch (err) {
      console.error('Error creating banner:', err);
      alert('Failed to create banner');
    }
  };

  const handleEditBanner = (banner) => {
    setEditingBanner(banner);
    setShowEditModal(true);
  };

  const handleUpdateBanner = async (formData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      
      const formDataToSend = new FormData();
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      
      await axios.put(`${baseURL}/banner/${editingBanner._id}`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setShowEditModal(false);
      setEditingBanner(null);
      fetchBanners();
    } catch (err) {
      console.error('Error updating banner:', err);
      alert('Failed to update banner');
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      
      await axios.delete(`${baseURL}/banner/${bannerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setDeleteConfirm(null);
      fetchBanners();
    } catch (err) {
      console.error('Error deleting banner:', err);
      alert('Failed to delete banner');
    }
  };

  const handleNavigate = (path) => {
    window.location.href = path;
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredBanners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBanners = filteredBanners.slice(startIndex, endIndex);

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
  const totalBanners = banners.length;
  const recentBanners = banners.filter(b => {
    const bannerDate = new Date(b.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return bannerDate > weekAgo;
  }).length;

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar currentPage="banner" onNavigate={handleNavigate} />
      
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4">
          {/* Header Section */}
          <div className="mb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Banner Management</h2>
                <p className="text-gray-400 text-sm">Manage website banners and promotional images</p>
              </div>
              
              {/* Statistics Cards */}
              <div className="flex gap-3">
                <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 min-w-[100px]">
                  <div className="flex items-center gap-2">
                    <FiImage className="text-indigo-400" size={16} />
                    <div>
                      <p className="text-lg font-bold text-white">{totalBanners}</p>
                      <p className="text-xs text-gray-400">Total</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 min-w-[100px]">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-green-400" size={16} />
                    <div>
                      <p className="text-lg font-bold text-white">{recentBanners}</p>
                      <p className="text-xs text-gray-400">This Week</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 min-w-[100px]">
                  <div className="flex items-center gap-2">
                    <FiEye className="text-yellow-400" size={16} />
                    <div>
                      <p className="text-lg font-bold text-white">{filteredBanners.length}</p>
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
                  placeholder="Search banners by creation date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="createdAt">Sort by Date</option>
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
                onClick={fetchBanners}
                className="ml-4 text-red-300 underline hover:text-red-200"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBanners.length === 0 ? (
                <div className="text-center py-8">
                  <FiImage className="mx-auto text-gray-500 mb-3" size={36} />
                  <p className="text-gray-400">
                    {searchTerm ? 'No banners found matching your search' : 'No banners found'}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {currentBanners.map((banner) => (
                    <div key={banner._id} className="bg-gray-900 rounded-lg shadow-md overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg">
                      <div className="flex">
                        {/* Banner Image */}
                        <div className="w-48 h-32 flex-shrink-0">
                          <img
                            className="w-full h-full object-cover"
                            src={banner.image}
                            alt="Banner"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xMiA2VjE4TTYgMTJIMTgiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+';
                            }}
                          />
                        </div>
                        
                        {/* Banner Info */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between h-full">
                            <div className="flex-1">
                              <div className="mb-3">
                                <h3 className="text-lg font-semibold text-white mb-2">Banner Image</h3>
                                <div className="bg-gray-800 rounded-lg p-3 border-l-4 border-indigo-500">
                                  <div className="flex items-center space-x-2">
                                    <FiImage className="text-indigo-400" size={14} />
                                    <div>
                                      <p className="text-xs text-gray-400">Image URL</p>
                                      <p className="text-sm text-white truncate max-w-xs">
                                        {banner.image}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                <span className="text-xs text-gray-400 flex items-center">
                                  <FiCalendar className="mr-1" size={10} />
                                  Created: {banner.createdAt ? new Date(banner.createdAt).toLocaleDateString() : 'Unknown date'}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {banner.createdAt ? new Date(banner.createdAt).toLocaleTimeString() : ''}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex space-x-1 ml-4">
                              <button
                                onClick={() => handleEditBanner(banner)}
                                className="flex items-center space-x-1 px-2 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-xs font-medium"
                                title="Edit banner"
                              >
                                <FiEdit2 size={12} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(banner)}
                                className="flex items-center space-x-1 px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs font-medium"
                                title="Delete banner"
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
                          Showing {startIndex + 1} to {Math.min(endIndex, filteredBanners.length)} of {filteredBanners.length} banners
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

      {/* Create Banner Modal */}
      {showCreateModal && (
        <CreateBannerModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateBanner}
        />
      )}

      {/* Edit Banner Modal */}
      {showEditModal && editingBanner && (
        <EditBannerModal
          banner={editingBanner}
          onClose={() => {
            setShowEditModal(false);
            setEditingBanner(null);
          }}
          onSave={handleUpdateBanner}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          banner={deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDeleteBanner(deleteConfirm._id)}
        />
      )}
    </div>
  );
};

// Create Banner Modal Component
const CreateBannerModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
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
      <div className="relative top-20 mx-auto p-4 border border-gray-700 w-96 shadow-2xl rounded-md bg-gray-900">
        <div className="mt-2">
          <h3 className="text-lg font-medium text-white mb-3">Add New Banner</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300">Banner Image *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Recommended size: 1200x400px or similar aspect ratio</p>
            </div>
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
                {loading ? 'Creating...' : 'Create Banner'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Edit Banner Modal Component
const EditBannerModal = ({ banner, onClose, onSave }) => {
  const [formData, setFormData] = useState({
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
      <div className="relative top-20 mx-auto p-4 border border-gray-700 w-96 shadow-2xl rounded-md bg-gray-900">
        <div className="mt-2">
          <h3 className="text-lg font-medium text-white mb-3">Edit Banner</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300">Current Image</label>
              <img
                src={banner.image}
                alt="Current banner"
                className="mt-2 w-full h-32 object-cover rounded-md border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">New Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-400 mt-1">Leave empty to keep current image</p>
            </div>
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
                {loading ? 'Updating...' : 'Update Banner'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmModal = ({ banner, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-4 border border-gray-700 w-96 shadow-2xl rounded-md bg-gray-900">
        <div className="mt-2">
          <h3 className="text-lg font-medium text-white mb-3">Delete Banner</h3>
          <div className="mb-3">
            <img
              src={banner.image}
              alt="Banner to delete"
              className="w-full h-32 object-cover rounded-md border border-gray-600"
            />
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Are you sure you want to delete this banner? This action cannot be undone and will also delete the banner image.
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

export default BannerPage;
