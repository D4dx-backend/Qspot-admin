import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiMessageSquare, FiSearch, FiChevronLeft, FiChevronRight, FiHelpCircle, FiFilter, FiClock, FiCheckCircle } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [answerMode, setAnswerMode] = useState('create'); // 'create' | 'update'
  
  // Pagination and search states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'answered', 'pending'
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const itemsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setIsAdmin(Boolean(token));
    fetchQuestions();
  }, []);

  // Filter and sort questions based on search term, status filter, and sort options
  useEffect(() => {
    let filtered = [...questions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(question => 
        question.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.faculty?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.user?.class?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(question => 
        statusFilter === 'answered' ? question.isAnswered : !question.isAnswered
      );
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

    setFilteredQuestions(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [questions, searchTerm, statusFilter, sortBy, sortOrder]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.get(`${baseURL}/questions`);
      setQuestions(response.data || []);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const openAnswerModal = (question, mode) => {
    setSelectedQuestion(question);
    setAnswerMode(mode);
    // Backend hides answer text in public endpoints; start blank for update too
    setAnswerText('');
    setShowAnswerModal(true);
  };

  const closeAnswerModal = () => {
    setShowAnswerModal(false);
    setSelectedQuestion(null);
    setAnswerText('');
  };

  const submitAnswer = async () => {
    if (!selectedQuestion) return;
    const token = localStorage.getItem('adminToken');
    if (!token) {
      alert('Admin authentication required');
      return;
    }
    if (!answerText.trim()) {
      alert('Answer is required');
      return;
    }
    try {
      setAnswerLoading(true);
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const url = `${baseURL}/questions/${selectedQuestion._id}/answer`;
      const headers = { Authorization: `Bearer ${token}` };
      if (answerMode === 'create') {
        await axios.post(url, { answer: answerText.trim() }, { headers });
      } else {
        await axios.put(url, { answer: answerText.trim() }, { headers });
      }
      closeAnswerModal();
      await fetchQuestions();
    } catch (err) {
      console.error('Error submitting answer:', err);
      alert(err?.response?.data?.message || 'Failed to submit answer');
    } finally {
      setAnswerLoading(false);
    }
  };

  const deleteAnswer = async (question) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      alert('Admin authentication required');
      return;
    }
    if (!confirm('Are you sure you want to delete this answer?')) return;
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const url = `${baseURL}/questions/${question._id}/answer`;
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(url, { headers });
      await fetchQuestions();
    } catch (err) {
      console.error('Error deleting answer:', err);
      alert(err?.response?.data?.message || 'Failed to delete answer');
    }
  };

  const handleNavigate = (path) => {
    window.location.href = path;
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentQuestions = filteredQuestions.slice(startIndex, endIndex);

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
  const answeredCount = questions.filter(q => q.isAnswered).length;
  const pendingCount = questions.filter(q => !q.isAnswered).length;

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar currentPage="questions" onNavigate={handleNavigate} />
      
      <div className="flex-1 flex flex-col ml-64">
        <main className="flex-1 p-4">
          {/* Header Section */}
          <div className="mb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Questions Management</h2>
                <p className="text-gray-400 text-sm">View and manage all submitted questions from users</p>
              </div>
              
              {/* Statistics Cards */}
              <div className="flex gap-3">
                <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 min-w-[100px]">
                  <div className="flex items-center gap-2">
                    <FiHelpCircle className="text-indigo-400" size={16} />
                    <div>
                      <p className="text-lg font-bold text-white">{questions.length}</p>
                      <p className="text-xs text-gray-400">Total</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 min-w-[100px]">
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="text-green-400" size={16} />
                    <div>
                      <p className="text-lg font-bold text-white">{answeredCount}</p>
                      <p className="text-xs text-gray-400">Answered</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 min-w-[100px]">
                  <div className="flex items-center gap-2">
                    <FiClock className="text-yellow-400" size={16} />
                    <div>
                      <p className="text-lg font-bold text-white">{pendingCount}</p>
                      <p className="text-xs text-gray-400">Pending</p>
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
                  placeholder="Search questions by content, faculty, subject, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="all">All Questions</option>
                  <option value="answered">Answered</option>
                  <option value="pending">Pending</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="createdAt">Sort by Date</option>
                  <option value="description">Sort by Content</option>
                  <option value="subject">Sort by Subject</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white hover:bg-gray-800 transition-colors text-sm"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
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
                onClick={fetchQuestions}
                className="ml-4 text-red-300 underline hover:text-red-200"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <FiHelpCircle className="mx-auto text-gray-500 mb-3" size={36} />
                  <p className="text-gray-400">
                    {searchTerm || statusFilter !== 'all' ? 'No questions found matching your criteria' : 'No questions found'}
                  </p>
                  {(searchTerm || statusFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                      }}
                      className="mt-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {currentQuestions.map((question) => (
                    <div key={question._id} className="bg-gray-900 rounded-lg shadow-md overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg">
                      <div className="p-4">
                        {/* Question Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="flex items-center space-x-1">
                                <span className="text-xs font-medium text-gray-400">Faculty:</span>
                                <span className="text-sm text-white font-medium">
                                  {question.faculty?.name || 'Unknown Faculty'}
                                </span>
                                {question.faculty?.designation && (
                                  <span className="text-xs text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">
                                    {question.faculty.designation}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs font-medium text-gray-400">Subject:</span>
                                <span className="text-sm text-white font-medium">
                                  {question.subject || 'Unknown Subject'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="text-xs font-medium text-gray-400">Posted by:</span>
                              <div className="flex items-center space-x-2">
                                <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center">
                                  <span className="text-xs font-medium text-white">
                                    {question.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                  </span>
                                </div>
                                <span className="text-sm text-white">
                                  {question.user?.name || 'Anonymous'}
                                </span>
                                {question.user?.class && (
                                  <span className="text-xs text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">
                                    Class {question.user.class}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              question.isAnswered 
                                ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                                : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                            }`}>
                              {question.isAnswered ? (
                                <>
                                  <FiCheckCircle className="mr-1" size={10} />
                                  Answered
                                </>
                              ) : (
                                <>
                                  <FiClock className="mr-1" size={10} />
                                  Pending
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                        
                        {/* Question Content */}
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-white mb-2 flex items-center">
                            <FiHelpCircle className="mr-1 text-indigo-400" size={14} />
                            Question
                          </h3>
                          <div className="bg-gray-800 rounded-lg p-3 border-l-4 border-indigo-500">
                            <p className="text-gray-300 leading-relaxed text-sm">
                              {question.description}
                            </p>
                          </div>
                        </div>
                        
                        {/* Question Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-xs text-gray-400 flex items-center">
                              <FiClock className="mr-1" size={10} />
                              {question.createdAt ? new Date(question.createdAt).toLocaleDateString() : 'Unknown date'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {question.createdAt ? new Date(question.createdAt).toLocaleTimeString() : ''}
                            </span>
                          </div>
                          {isAdmin && (
                            <div className="flex space-x-1">
                              {!question.isAnswered ? (
                                <button
                                  onClick={() => openAnswerModal(question, 'create')}
                                  className="flex items-center space-x-1 px-2 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-xs font-medium"
                                  title="Add Answer"
                                >
                                  <FiMessageSquare size={12} />
                                  <span>Answer</span>
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => openAnswerModal(question, 'update')}
                                    className="flex items-center space-x-1 px-2 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-xs font-medium"
                                    title="Edit Answer"
                                  >
                                    <FiEdit2 size={12} />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => deleteAnswer(question)}
                                    className="flex items-center space-x-1 px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs font-medium"
                                    title="Delete Answer"
                                  >
                                    <FiTrash2 size={12} />
                                    <span>Delete</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 mt-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                          Showing {startIndex + 1} to {Math.min(endIndex, filteredQuestions.length)} of {filteredQuestions.length} questions
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

      {/* Answer Modal */}
      <AnswerModal 
        open={showAnswerModal}
        onClose={closeAnswerModal}
        onSubmit={submitAnswer}
        loading={answerLoading}
        mode={answerMode}
        answerText={answerText}
        setAnswerText={setAnswerText}
      />
    </div>
  );
};

// Compact modal for answer input
const AnswerModal = ({ open, onClose, onSubmit, loading, mode, answerText, setAnswerText }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-gray-900 w-full max-w-xl rounded-lg shadow-2xl border border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <FiMessageSquare className="mr-2 text-indigo-400" size={16} />
            {mode === 'create' ? 'Add Answer' : 'Edit Answer'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={loading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Answer Content
          </label>
          <textarea
            className="w-full border border-gray-600 rounded-lg p-3 h-32 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
            placeholder={mode === 'create' ? 'Type your answer here...' : 'Type updated answer...'}
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            disabled={loading}
          />
          <div className="mt-1 text-xs text-gray-400">
            {answerText.length} characters
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors font-medium text-sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-1 text-sm"
            onClick={onSubmit}
            disabled={loading || !answerText.trim()}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FiMessageSquare size={14} />
                <span>{mode === 'create' ? 'Add Answer' : 'Update Answer'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionsPage;

