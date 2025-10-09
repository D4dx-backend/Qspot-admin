import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [answerMode, setAnswerMode] = useState('create'); // 'create' | 'update'

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setIsAdmin(Boolean(token));
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
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
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
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
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage="questions" onNavigate={handleNavigate} />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Questions Management</h1>
            <p className="text-gray-600">View all submitted questions from users</p>
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
                onClick={fetchQuestions}
                className="ml-4 text-red-800 underline hover:text-red-900"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">❓</div>
                  <p className="text-gray-500 text-lg">No questions found</p>
                  <p className="text-gray-400">Questions will appear here when users submit them</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">
                      All Questions ({questions.length})
                    </h2>
                    <div className="text-sm text-gray-500">
                      Sorted by newest first
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {questions.map((question) => (
                      <div key={question._id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-500">Faculty:</span>
                                <span className="text-sm text-gray-900">
                                  {question.faculty?.name || 'Unknown Faculty'}
                                </span>
                                {question.faculty?.designation && (
                                  <span className="text-xs text-gray-500">
                                    ({question.faculty.designation})
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-500">Subject:</span>
                                <span className="text-sm text-gray-900">
                                  {question.subject || 'Unknown Subject'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-500">Posted by:</span>
                                <span className="text-sm text-gray-900">
                                  {question.user?.name || 'Anonymous'} {question.user?.class ? `(Class ${question.user.class})` : ''}
                                </span>
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <h3 className="text-lg font-medium text-gray-900 mb-2">Question:</h3>
                              <p className="text-gray-700 leading-relaxed">
                                {question.description}
                              </p>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center space-x-4">
                                <span>📅</span>
                                <span>
                                  {question.createdAt ? new Date(question.createdAt).toLocaleDateString() : 'Unknown date'}
                                </span>
                                <span>🕒</span>
                                <span>
                                  {question.createdAt ? new Date(question.createdAt).toLocaleTimeString() : 'Unknown time'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${question.isAnswered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {question.isAnswered ? 'Answered' : 'Pending'}
                                </span>
                                {isAdmin && (
                                  <>
                                    {!question.isAnswered ? (
                                      <button
                                        onClick={() => openAnswerModal(question, 'create')}
                                        className="ml-2 inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                                      >
                                        Add Answer
                                      </button>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => openAnswerModal(question, 'update')}
                                          className="ml-2 inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                                        >
                                          Edit Answer
                                        </button>
                                        <button
                                          onClick={() => deleteAnswer(question)}
                                          className="ml-2 inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700"
                                        >
                                          Delete Answer
                                        </button>
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
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

// Simple modal for answer input
const AnswerModal = ({ open, onClose, onSubmit, loading, mode, answerText, setAnswerText }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">{mode === 'create' ? 'Add Answer' : 'Edit Answer'}</h3>
        <textarea
          className="w-full border border-gray-300 rounded-md p-3 h-40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder={mode === 'create' ? 'Type your answer here...' : 'Type updated answer...'}
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
        />
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-50"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionsPage;

