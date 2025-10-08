import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
                                  {question.subject?.name || 'Unknown Subject'}
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
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Question
                                </span>
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
    </div>
  );
};

export default QuestionsPage;
