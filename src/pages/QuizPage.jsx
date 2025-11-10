import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  FiRefreshCw,
  FiSettings,
  FiClock,
  FiCalendar,
  FiBarChart2,
  FiSave,
  FiEye,
  FiTrash2,
  FiX
} from 'react-icons/fi';
import Sidebar from '../components/Sidebar';

const toDateTimeLocal = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localISOTime = new Date(date.getTime() - tzOffset).toISOString();
  return localISOTime.slice(0, 16);
};

const fromDateTimeLocal = (localValue) => {
  if (!localValue) return null;
  const date = new Date(localValue);
  return date.toISOString();
};

const formatDateTime = (isoString) => {
  if (!isoString) return 'NA';
  const d = new Date(isoString);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
};

const formatMinutes = (value) => {
  const minutes = Number(value) || 0;
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
};

const QuizPage = () => {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const token = useMemo(() => localStorage.getItem('adminToken'), []);
  const ATTEMPTS_PER_PAGE = 15;

  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState('');
  const [configMessage, setConfigMessage] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);

  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(1);
  const [questionsRandomization, setQuestionsRandomization] = useState(false);

  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [stats, setStats] = useState({
    startDate: null,
    endDate: null,
    numberOfQuestions: 0,
    questionsRandomization: false,
    totalUsersAttended: 0,
    attemptsCount: 0,
    attendees: []
  });
  const [attemptPage, setAttemptPage] = useState(1);

  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [showAttemptModal, setShowAttemptModal] = useState(false);

  const handleNavigate = (path) => {
    window.location.href = path;
  };

  useEffect(() => {
    if (!baseURL) {
      setConfigError('Environment configuration error: API base URL not found');
      setStatsError('Environment configuration error: API base URL not found');
      setConfigLoading(false);
      setStatsLoading(false);
      return;
    }

    fetchConfig();
    fetchStats();
  }, [baseURL]);

  useEffect(() => {
    if (!configMessage) return;
    const timer = setTimeout(() => setConfigMessage(''), 4000);
    return () => clearTimeout(timer);
  }, [configMessage]);

  useEffect(() => {
    // Reset or clamp current page when attendee data changes
    const totalPages = Math.max(1, Math.ceil(stats.attendees.length / ATTEMPTS_PER_PAGE));
    setAttemptPage((prev) => Math.min(prev, totalPages));
  }, [stats.attendees.length]);

  const fetchConfig = async () => {
    if (!baseURL) return;
    try {
      setConfigLoading(true);
      setConfigError('');
      const response = await axios.get(`${baseURL}/quizzes/config`);
      const data = response.data;
      setStartDateInput(toDateTimeLocal(data.startDate));
      setEndDateInput(toDateTimeLocal(data.endDate));
      setNumberOfQuestions(data.numberOfQuestions ?? 1);
      setQuestionsRandomization(Boolean(data.questionsRandomization));
    } catch (error) {
      if (error.response?.status === 404) {
        // No configuration yet
        setStartDateInput('');
        setEndDateInput('');
        setNumberOfQuestions(1);
        setQuestionsRandomization(false);
        setConfigError('No quiz configuration found. Create one below.');
      } else {
        console.error('Error loading quiz configuration:', error);
        setConfigError('Failed to load quiz configuration');
      }
    } finally {
      setConfigLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!baseURL) return;
    try {
      setStatsLoading(true);
      setStatsError('');
      const response = await axios.get(`${baseURL}/quizzes/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStats(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setStats({
          startDate: null,
          endDate: null,
          numberOfQuestions: 0,
          questionsRandomization: false,
          totalUsersAttended: 0,
          attemptsCount: 0,
          attendees: []
        });
        setStatsError('No quiz data available.');
      } else {
        console.error('Error fetching quiz stats:', error);
        setStatsError('Failed to load quiz statistics');
      }
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSaveConfig = async (event) => {
    event.preventDefault();
    if (!baseURL) return;

    if (!startDateInput || !endDateInput) {
      setConfigError('Both start and end date are required.');
      return;
    }

    const startISO = fromDateTimeLocal(startDateInput);
    const endISO = fromDateTimeLocal(endDateInput);

    if (new Date(startISO) >= new Date(endISO)) {
      setConfigError('Start date must be before end date.');
      return;
    }

    try {
      setSavingConfig(true);
      setConfigError('');
      const payload = {
        startDate: startISO,
        endDate: endISO,
        numberOfQuestions: Number(numberOfQuestions),
        questionsRandomization
      };

      const response = await axios.post(`${baseURL}/quizzes/config`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setConfigMessage(response.data?.message || 'Quiz configuration saved');
      fetchConfig();
      fetchStats();
    } catch (error) {
      console.error('Error saving quiz configuration:', error);
      const message = error.response?.data?.message || 'Failed to save configuration';
      setConfigError(message);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleViewAttempt = async (attemptId) => {
    if (!baseURL) return;
    try {
      setDetailLoading(true);
      setDetailError('');
      setShowAttemptModal(true);
      const response = await axios.get(`${baseURL}/quizzes/attempt/${attemptId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSelectedAttempt(response.data);
    } catch (error) {
      console.error('Error fetching attempt detail:', error);
      const message = error.response?.data?.message || 'Failed to load attempt details';
      setDetailError(message);
      setSelectedAttempt(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteAttempt = async (attemptId) => {
    if (!baseURL) return;
    const confirmDelete = window.confirm('Are you sure you want to delete this attempt?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`${baseURL}/quizzes/attempt/${attemptId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (selectedAttempt?.attemptId === attemptId) {
        setSelectedAttempt(null);
        setShowAttemptModal(false);
      }
      fetchStats();
    } catch (error) {
      console.error('Error deleting attempt:', error);
      alert(error.response?.data?.message || 'Failed to delete attempt');
    }
  };

  const isQuizLive = useMemo(() => {
    if (!startDateInput || !endDateInput) return false;
    const now = new Date();
    const start = new Date(startDateInput);
    const end = new Date(endDateInput);
    return now >= start && now <= end;
  }, [startDateInput, endDateInput]);

  const quizStatusLabel = startDateInput && endDateInput
    ? isQuizLive ? 'Live' : (new Date() < new Date(startDateInput) ? 'Scheduled' : 'Closed')
    : 'Not Configured';

  const quizStatusColor = isQuizLive
    ? 'bg-green-500'
    : (startDateInput && endDateInput && new Date() < new Date(startDateInput))
      ? 'bg-yellow-500'
      : 'bg-gray-500';

  const totalAttemptPages = Math.max(1, Math.ceil(stats.attendees.length / ATTEMPTS_PER_PAGE));
  const paginatedAttempts = stats.attendees.slice(
    (attemptPage - 1) * ATTEMPTS_PER_PAGE,
    attemptPage * ATTEMPTS_PER_PAGE
  );

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar currentPage="quiz" onNavigate={handleNavigate} />

      <div className="flex-1 flex flex-col ml-64">
        <main className="flex-1 p-6 space-y-6">

          <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  <FiSettings className="text-indigo-400" /> Quiz Configuration
                </h1>
                <p className="text-gray-400">Manage the live window and structure of the quiz</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${quizStatusColor} text-black`}> 
                  <FiClock /> {quizStatusLabel}
                </span>
                <button
                  onClick={fetchConfig}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 transition"
                >
                  <FiRefreshCw /> Refresh
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveConfig} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                  <FiCalendar /> Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={startDateInput}
                  onChange={(e) => setStartDateInput(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                  <FiCalendar /> End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={endDateInput}
                  onChange={(e) => setEndDateInput(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 text-sm font-medium">Number of Questions</label>
                <input
                  type="number"
                  min={1}
                  value={numberOfQuestions}
                  onChange={(e) => setNumberOfQuestions(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-gray-300 text-sm font-medium">Randomization</label>
                <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3">
                  <input
                    id="randomizationToggle"
                    type="checkbox"
                    checked={questionsRandomization}
                    onChange={(e) => setQuestionsRandomization(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-indigo-500 rounded border-gray-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="randomizationToggle" className="text-gray-300">Enable question randomization</label>
                </div>
              </div>

              <div className="lg:col-span-2 flex flex-col gap-3">
                {configError && (
                  <div className="bg-red-900/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg">
                    {configError}
                  </div>
                )}
                {configMessage && (
                  <div className="bg-green-900/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg">
                    {configMessage}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={savingConfig || configLoading}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-white font-medium transition"
                  >
                    <FiSave /> {savingConfig ? 'Saving...' : 'Save Configuration'}
                  </button>
                  {configLoading && (
                    <span className="text-sm text-gray-400">Loading configuration...</span>
                  )}
                </div>
              </div>
            </form>
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                  <FiBarChart2 className="text-indigo-400" /> Quiz Attempts
                </h2>
                <p className="text-gray-400">Review attempts submitted during the active quiz window</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-300">
                  <div>Total Users Attended: <span className="text-white font-semibold">{stats.totalUsersAttended}</span></div>
                  <div>Total Attempts: <span className="text-white font-semibold">{stats.attemptsCount}</span></div>
                </div>
                <button
                  onClick={fetchStats}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 transition"
                >
                  <FiRefreshCw /> Refresh
                </button>
              </div>
            </div>

            {statsError && (
              <div className="bg-red-900/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-4">
                {statsError}
              </div>
            )}

            {statsLoading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
              </div>
            ) : stats.attendees.length === 0 ? (
              <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-10 text-center text-gray-400">
                No attempts recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-800">
                  <thead className="bg-gray-800/70">
                    <tr className="text-gray-300 text-sm uppercase tracking-wider">
                      <th className="px-4 py-3 text-left">Attempt ID</th>
                      <th className="px-4 py-3 text-left">User</th>
                      <th className="px-4 py-3 text-left">Score</th>
                      <th className="px-4 py-3 text-left">Percentage</th>
                      <th className="px-4 py-3 text-left">Duration</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-900 divide-y divide-gray-800 text-sm text-gray-200">
                    {paginatedAttempts.map((attempt) => (
                      <tr key={attempt.attemptId} className="hover:bg-gray-800/60 transition">
                        <td className="px-4 py-3">{attempt.attemptId?.slice(-8)}</td>
                        <td className="px-4 py-3">
                          <div className="text-white font-medium">{attempt.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-400">ID: {attempt.userId?.slice?.(-8) || attempt.userId}</div>
                        </td>
                        <td className="px-4 py-3">{attempt.score}</td>
                        <td className="px-4 py-3">{attempt.percentage}%</td>
                        <td className="px-4 py-3">{formatMinutes(attempt.duration)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleViewAttempt(attempt.attemptId)}
                              className="p-2 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 transition"
                            >
                              <FiEye />
                            </button>
                            <button
                              onClick={() => handleDeleteAttempt(attempt.attemptId)}
                              className="p-2 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30 transition"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {totalAttemptPages > 1 && (
                  <div className="flex items-center justify-between mt-4 text-sm text-gray-300">
                    <span>
                      Showing {(attemptPage - 1) * ATTEMPTS_PER_PAGE + 1} -
                      {' '}
                      {Math.min(attemptPage * ATTEMPTS_PER_PAGE, stats.attendees.length)}
                      {' '}of {stats.attendees.length}
                    </span>
                    <div className="flex items-center gap-2 bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2">
                      <button
                        onClick={() => setAttemptPage((prev) => Math.max(1, prev - 1))}
                        disabled={attemptPage === 1}
                        className="px-3 py-1 rounded-md bg-gray-800 text-gray-300 disabled:opacity-40 hover:bg-gray-700 transition"
                      >
                        Prev
                      </button>
                      <span className="text-white font-medium">
                        Page {attemptPage} of {totalAttemptPages}
                      </span>
                      <button
                        onClick={() => setAttemptPage((prev) => Math.min(totalAttemptPages, prev + 1))}
                        disabled={attemptPage === totalAttemptPages}
                        className="px-3 py-1 rounded-md bg-gray-800 text-gray-300 disabled:opacity-40 hover:bg-gray-700 transition"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      </div>

      {showAttemptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                Attempt Details
              </h3>
              <button
                onClick={() => setShowAttemptModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <FiX size={22} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {detailLoading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
                </div>
              ) : detailError ? (
                <div className="bg-red-900/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg">
                  {detailError}
                </div>
              ) : selectedAttempt ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-4 space-y-2">
                      <p className="text-gray-400 text-sm">Attempt ID</p>
                      <p className="text-white font-mono text-sm">{selectedAttempt.attemptId}</p>
                      <p className="text-gray-400 text-sm">User</p>
                      <p className="text-white">{selectedAttempt.user?.name || 'Unknown'}</p>
                      <p className="text-gray-400 text-sm">Class</p>
                      <p className="text-white">{selectedAttempt.user?.class || 'NA'}</p>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="text-white break-all">{selectedAttempt.user?.email || 'NA'}</p>
                    </div>
                    <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-4 space-y-2">
                      <p className="text-gray-400 text-sm">Language</p>
                      <p className="text-white">{selectedAttempt.language || 'English'}</p>
                      <p className="text-gray-400 text-sm">Score</p>
                      <p className="text-white text-lg font-semibold">{selectedAttempt.score}</p>
                      <p className="text-gray-400 text-sm">Percentage</p>
                      <p className="text-white text-lg font-semibold">{selectedAttempt.percentage}%</p>
                      <p className="text-gray-400 text-sm">Total Duration</p>
                      <p className="text-white">{formatMinutes(selectedAttempt.totalDuration)}</p>
                      <p className="text-gray-400 text-sm">Submitted At</p>
                      <p className="text-white text-sm">{formatDateTime(selectedAttempt.createdAt)}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Question Breakdown</h4>
                    <div className="space-y-4">
                      {selectedAttempt.questions?.map((question, index) => {
                        const answer = selectedAttempt.answers?.[index];
                        const isCorrect = answer?.isCorrect === 'true' || answer?.isCorrect === true;
                        return (
                          <div key={index} className="bg-gray-800/60 border border-gray-700 rounded-lg p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-sm text-gray-400">Question {question.questionNumber}</p>
                                <p className="text-white font-medium">{question.question}</p>
                              </div>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${isCorrect ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                                {isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                            </div>
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div className="text-gray-400">
                                Correct Answer:
                                <span className="text-white ml-1">{question.correctAnswer}</span>
                              </div>
                              <div className="text-gray-400">
                                Attempted:
                                <span className="text-white ml-1">{answer?.attemptedAnswer ?? 'Not answered'}</span>
                              </div>
                              <div className="text-gray-400">
                                Duration:
                                <span className="text-white ml-1">{formatMinutes(answer?.duration)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400">Select an attempt to view details.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
