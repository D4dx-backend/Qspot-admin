import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiChevronLeft, FiChevronRight, FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';

const SchedulesPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Pagination and search states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [sortBy, setSortBy] = useState('scheduleDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchSchedules();
    fetchSpeakers();
  }, []);

  // Filter and sort schedules based on search term, class filter, and sort options
  useEffect(() => {
    let filtered = [...schedules];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(schedule => 
        schedule.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.class?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.faculty?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.faculty?.designation?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply class filter
    if (classFilter !== 'all') {
      filtered = filtered.filter(schedule => 
        schedule.class === classFilter
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'scheduleDate' || sortBy === 'createdAt') {
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

    setFilteredSchedules(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [schedules, searchTerm, classFilter, sortBy, sortOrder]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const baseURL = import.meta.env.VITE_API_BASE_URL;
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
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.get(`${baseURL}/speakers`);
      setSpeakers(response.data || []);
    } catch (err) {
      console.error('Error fetching speakers:', err);
    }
  };

  const handleCreateSchedule = async (formData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      
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
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      
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
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      
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

  // Pagination logic
  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSchedules = filteredSchedules.slice(startIndex, endIndex);

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

  // Get unique classes for filter
  const uniqueClasses = [...new Set(schedules.map(s => s.class).filter(Boolean))].sort();
  
  // Statistics
  const totalSchedules = schedules.length;
  const upcomingSchedules = schedules.filter(s => new Date(s.scheduleDate) > new Date()).length;
  const pastSchedules = schedules.filter(s => new Date(s.scheduleDate) <= new Date()).length;

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar currentPage="schedules" onNavigate={handleNavigate} />
      
      <div className="flex-1 flex flex-col ml-64">
        <main className="flex-1 p-4">
          {/* Header Section */}
          <div className="mb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Schedules Management</h2>
                <p className="text-gray-400 text-sm">Manage class schedules and timetables</p>
              </div>
              
              {/* Statistics Cards */}
              <div className="flex gap-3">
                <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 min-w-[100px]">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-indigo-400" size={16} />
                    <div>
                      <p className="text-lg font-bold text-white">{totalSchedules}</p>
                      <p className="text-xs text-gray-400">Total</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 min-w-[100px]">
                  <div className="flex items-center gap-2">
                    <FiClock className="text-green-400" size={16} />
                    <div>
                      <p className="text-lg font-bold text-white">{upcomingSchedules}</p>
                      <p className="text-xs text-gray-400">Upcoming</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 min-w-[100px]">
                  <div className="flex items-center gap-2">
                    <FiUser className="text-yellow-400" size={16} />
                    <div>
                      <p className="text-lg font-bold text-white">{pastSchedules}</p>
                      <p className="text-xs text-gray-400">Completed</p>
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
                  placeholder="Search schedules by title, class, or faculty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="all">All Classes</option>
                  {uniqueClasses.map((classItem) => (
                    <option key={classItem} value={classItem}>Class {classItem}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="scheduleDate">Sort by Date</option>
                  <option value="title">Sort by Title</option>
                  <option value="class">Sort by Class</option>
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
                onClick={fetchSchedules}
                className="ml-4 text-red-300 underline hover:text-red-200"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSchedules.length === 0 ? (
                <div className="text-center py-8">
                  <FiCalendar className="mx-auto text-gray-500 mb-3" size={36} />
                  <p className="text-gray-400">
                    {searchTerm || classFilter !== 'all' ? 'No schedules found matching your criteria' : 'No schedules found'}
                  </p>
                  {(searchTerm || classFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setClassFilter('all');
                      }}
                      className="mt-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {currentSchedules.map((schedule) => (
                    <div key={schedule._id} className="bg-gray-900 rounded-lg shadow-md overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg">
                      <div className="p-4">
                        {/* Schedule Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">
                              {schedule.title}
                            </h3>
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="flex items-center space-x-1">
                                <span className="text-xs font-medium text-gray-400">Class:</span>
                                <span className="text-sm text-white bg-indigo-900/30 px-2 py-1 rounded border border-indigo-500/30">
                                  {schedule.class}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs font-medium text-gray-400">Faculty:</span>
                                <span className="text-sm text-white">
                                  {schedule.faculty?.name || 'Unknown Faculty'}
                                </span>
                                {schedule.faculty?.designation && (
                                  <span className="text-xs text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">
                                    {schedule.faculty.designation}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              new Date(schedule.scheduleDate) > new Date()
                                ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                                : 'bg-gray-900/30 text-gray-400 border border-gray-500/30'
                            }`}>
                              {new Date(schedule.scheduleDate) > new Date() ? (
                                <>
                                  <FiClock className="mr-1" size={10} />
                                  Upcoming
                                </>
                              ) : (
                                <>
                                  <FiCalendar className="mr-1" size={10} />
                                  Completed
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                        
                        {/* Schedule Details */}
                        <div className="mb-4">
                          <div className="bg-gray-800 rounded-lg p-3 border-l-4 border-indigo-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="flex items-center space-x-2">
                                <FiCalendar className="text-indigo-400" size={14} />
                                <div>
                                  <p className="text-xs text-gray-400">Date</p>
                                  <p className="text-sm text-white">
                                    {schedule.scheduleDate ? new Date(schedule.scheduleDate).toLocaleDateString() : 'No date'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <FiClock className="text-indigo-400" size={14} />
                                <div>
                                  <p className="text-xs text-gray-400">Time</p>
                                  <p className="text-sm text-white">
                                    {schedule.scheduleDate ? new Date(schedule.scheduleDate).toLocaleTimeString() : 'No time'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Schedule Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-xs text-gray-400 flex items-center">
                              <FiCalendar className="mr-1" size={10} />
                              Created: {schedule.createdAt ? new Date(schedule.createdAt).toLocaleDateString() : 'Unknown date'}
                            </span>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditSchedule(schedule)}
                              className="flex items-center space-x-1 px-2 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-xs font-medium"
                              title="Edit schedule"
                            >
                              <FiEdit2 size={12} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(schedule)}
                              className="flex items-center space-x-1 px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs font-medium"
                              title="Delete schedule"
                            >
                              <FiTrash2 size={12} />
                              <span>Delete</span>
                            </button>
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
                          Showing {startIndex + 1} to {Math.min(endIndex, filteredSchedules.length)} of {filteredSchedules.length} schedules
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
    <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-4 border border-gray-700 w-96 shadow-2xl rounded-md bg-gray-900">
        <div className="mt-2">
          <h3 className="text-lg font-medium text-white mb-3">Add New Schedule</h3>
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
              <label className="block text-sm font-medium text-gray-300">Class *</label>
              <input
                type="text"
                value={formData.class}
                onChange={(e) => setFormData({...formData, class: e.target.value})}
                placeholder="Enter class name (e.g., 8, 9, 10, 11, 12)"
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Schedule Date & Time *</label>
              <input
                type="datetime-local"
                value={formData.scheduleDate}
                onChange={(e) => setFormData({...formData, scheduleDate: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Faculty *</label>
              <select
                value={formData.faculty}
                onChange={(e) => setFormData({...formData, faculty: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
    <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-4 border border-gray-700 w-96 shadow-2xl rounded-md bg-gray-900">
        <div className="mt-2">
          <h3 className="text-lg font-medium text-white mb-3">Edit Schedule</h3>
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
              <label className="block text-sm font-medium text-gray-300">Class *</label>
              <input
                type="text"
                value={formData.class}
                onChange={(e) => setFormData({...formData, class: e.target.value})}
                placeholder="Enter class name (e.g., 8, 9, 10, 11, 12)"
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Schedule Date & Time *</label>
              <input
                type="datetime-local"
                value={formData.scheduleDate}
                onChange={(e) => setFormData({...formData, scheduleDate: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Faculty *</label>
              <select
                value={formData.faculty}
                onChange={(e) => setFormData({...formData, faculty: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
    <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-4 border border-gray-700 w-96 shadow-2xl rounded-md bg-gray-900">
        <div className="mt-2">
          <h3 className="text-lg font-medium text-white mb-3">Delete Schedule</h3>
          <div className="mb-3">
            <h4 className="font-medium text-white">{schedule.title}</h4>
            <p className="text-sm text-gray-400">Class: {schedule.class}</p>
            <p className="text-sm text-gray-400">Faculty: {schedule.faculty?.name}</p>
            <p className="text-sm text-gray-400">
              Date: {schedule.scheduleDate ? new Date(schedule.scheduleDate).toLocaleDateString() : 'No date'}
            </p>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Are you sure you want to delete this schedule? This action cannot be undone.
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

export default SchedulesPage;
