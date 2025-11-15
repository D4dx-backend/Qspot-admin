import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  FiActivity,
  FiAlertCircle,
  FiClock,
  FiRefreshCw,
  FiSearch,
  FiUsers
} from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import brandIcon from '../assets/Icon.png';

const formatDuration = (seconds) => {
  const value = Number(seconds);
  if (Number.isNaN(value) || value < 0) return '0s';
  const mins = Math.floor(value / 60);
  const secs = Math.floor(value % 60);
  if (mins <= 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
};

const formatDateTime = (isoString) => {
  if (!isoString) return 'NA';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'NA';
  return date.toLocaleString();
};

const QuizAttemptsPage = () => {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const token = useMemo(() => localStorage.getItem('adminToken'), []);

  const [attempts, setAttempts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [tableLoading, setTableLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [tableError, setTableError] = useState('');
  const [detailsError, setDetailsError] = useState('');

  const handleNavigate = (path) => {
    window.location.href = path;
  };

  const fetchAttempts = useCallback(async () => {
    if (!baseURL || !token) {
      setTableError('Missing configuration or authentication token.');
      setTableLoading(false);
      return;
    }
    try {
      setTableLoading(true);
      setTableError('');
      const response = await axios.get(`${baseURL}/quizzes/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const attendees = Array.isArray(response.data?.attendees) ? response.data.attendees : [];
      setAttempts(attendees);
      if (attendees.length && !selectedAttemptId) {
        setSelectedAttemptId(attendees[0].attemptId);
      } else if (!attendees.length) {
        setSelectedAttemptId(null);
        setSelectedAttempt(null);
      }
    } catch (error) {
      console.error('Error fetching quiz attempts:', error);
      setTableError(error.response?.data?.message || 'Failed to load quiz attempts.');
    } finally {
      setTableLoading(false);
    }
  }, [baseURL, token, selectedAttemptId]);

  const fetchAttemptDetails = useCallback(async (attemptId) => {
    if (!attemptId) return;
    if (!baseURL || !token) {
      setDetailsError('Missing configuration or authentication token.');
      return;
    }
    try {
      setDetailsLoading(true);
      setDetailsError('');
      const response = await axios.get(`${baseURL}/quizzes/attempt/${attemptId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedAttempt(response.data);
    } catch (error) {
      console.error('Error fetching attempt details:', error);
      setDetailsError(error.response?.data?.message || 'Failed to load attempt details.');
    } finally {
      setDetailsLoading(false);
    }
  }, [baseURL, token]);

  useEffect(() => {
    fetchAttempts();
  }, [fetchAttempts]);

  useEffect(() => {
    if (selectedAttemptId) {
      fetchAttemptDetails(selectedAttemptId);
    }
  }, [selectedAttemptId, fetchAttemptDetails]);

  const filteredAttempts = useMemo(() => {
    if (!searchTerm.trim()) return attempts;
    const query = searchTerm.trim().toLowerCase();
    return attempts.filter((item) => {
      return (
        item.name?.toLowerCase().includes(query) ||
        item.userId?.toString().toLowerCase().includes(query)
      );
    });
  }, [attempts, searchTerm]);

  const handleRowSelect = (attemptId) => {
    setSelectedAttemptId(attemptId);
  };

  return (
    <div className="flex min-h-screen bg-[#0b0614] text-white">
      <Sidebar currentPage="quizAttempts" onNavigate={handleNavigate} />

      <main className="ml-64 w-full bg-[#0f0a1d] px-6 py-8">
        <header className="mb-8 flex flex-col justify-between gap-4 rounded-2xl border border-white/5 bg-white/5/20 px-6 py-5 shadow-[0_20px_60px_rgba(10,7,18,0.55)] backdrop-blur">
          <div className="flex w-full flex-wrap items-center gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Analytics</p>
              <h1 className="text-2xl font-semibold text-white">Quiz Attempts</h1>
              <p className="text-sm text-white/70">
                Review participant submissions and inspect per-question performance.
              </p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={fetchAttempts}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#EFB078]/60 hover:bg-[#701845]/30"
              >
                <FiRefreshCw className="text-base" />
                Refresh
              </button>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold">
                <FiUsers className="text-base text-[#EFB078]" />
                {attempts.length} Attempts
              </div>
            </div>
          </div>
        </header>

        {tableError && (
          <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {tableError}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <section className="rounded-2xl border border-white/5 bg-gradient-to-b from-[#12091f]/90 to-[#0b0714]/95 p-5 shadow-[0_25px_60px_rgba(5,3,10,0.55)]">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search by user name or ID"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white placeholder:text-white/40 focus:border-[#EFB078] focus:outline-none"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
                <FiActivity className="text-base text-[#EFB078]" />
                Live data
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/5">
              <div className="max-h-[520px] overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2">
                <table className="min-w-full divide-y divide-white/5 text-sm">
                  <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-white/60">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Participant</th>
                      <th className="px-4 py-3 font-semibold">Score</th>
                      <th className="px-4 py-3 font-semibold">Percentage</th>
                      <th className="px-4 py-3 font-semibold">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {tableLoading && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-white/60">
                          Loading attempts…
                        </td>
                      </tr>
                    )}
                    {!tableLoading && !filteredAttempts.length && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-white/60">
                          No attempts found.
                        </td>
                      </tr>
                    )}
                    {!tableLoading &&
                      filteredAttempts.map((attempt) => {
                        const isActive = selectedAttemptId === attempt.attemptId;
                        return (
                          <tr
                            key={attempt.attemptId}
                            className={`cursor-pointer transition ${
                              isActive
                                ? 'bg-[#701845]/30 text-white'
                                : 'bg-transparent text-white/85 hover:bg-white/5'
                            }`}
                            onClick={() => handleRowSelect(attempt.attemptId)}
                          >
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span className="font-semibold">{attempt.name || 'Unknown'}</span>
                                <span className="text-xs text-white/60">{attempt.userId}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-semibold">{attempt.score}</td>
                            <td className="px-4 py-3">{attempt.percentage}%</td>
                            <td className="px-4 py-3">{formatDuration(attempt.duration)}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/5 bg-gradient-to-b from-[#0a0818]/92 to-[#05030b]/95 p-5 shadow-[0_25px_60px_rgba(2,2,6,0.7)]">
            <div className="mb-4 flex items-center gap-3">
              <img src={brandIcon} alt="QSpot" className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 p-1" />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Attempt Details</p>
                <h2 className="text-xl font-semibold text-white">
                  {selectedAttempt?.user?.name || 'Select an attempt'}
                </h2>
              </div>
            </div>

            {detailsError && (
              <div className="mb-4 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
                {detailsError}
              </div>
            )}

            {!selectedAttempt && !detailsLoading && (
              <div className="flex h-64 flex-col items-center justify-center text-center text-white/60">
                <FiAlertCircle className="mb-3 text-3xl text-white/40" />
                Select an attempt from the table to see complete details.
              </div>
            )}

            {detailsLoading && (
              <div className="flex h-64 flex-col items-center justify-center text-white/60">
                <FiClock className="mb-3 animate-spin text-3xl text-white/50" />
                Loading details…
              </div>
            )}

            {selectedAttempt && !detailsLoading && (
              <div className="space-y-4 text-sm text-white/85">
                <div className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wide text-white/60">
                    Attempt ID <span className="text-white/40">#{selectedAttempt.attemptId}</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-white/60">Participant</p>
                      <p className="font-semibold">{selectedAttempt.user?.name || 'Unknown'}</p>
                      {selectedAttempt.user?.email && (
                        <p className="text-xs text-white/60">{selectedAttempt.user.email}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-white/60">Class</p>
                      <p className="font-semibold">{selectedAttempt.user?.class || 'NA'}</p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-white/60">Score</p>
                      <p className="text-lg font-semibold">{selectedAttempt.score}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Percentage</p>
                      <p className="text-lg font-semibold">{selectedAttempt.percentage}%</p>
                    </div>
                    <div>
                      <p className="text-white/60">Duration</p>
                      <p className="text-lg font-semibold">{formatDuration(selectedAttempt.totalDuration)}</p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-white/60">Language</p>
                      <p className="font-semibold">{selectedAttempt.language}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Submitted</p>
                      <p className="font-semibold">{formatDateTime(selectedAttempt.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                    <FiActivity className="text-base text-[#EFB078]" />
                    Question Breakdown
                  </div>
                  <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1 text-xs [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2">
                    {selectedAttempt.questions?.map((question, index) => {
                      const answer = selectedAttempt.answers?.[index];
                      const isCorrect = answer?.isCorrect === 'true';
                      return (
                        <div
                          key={`${question.questionNumber}-${index}`}
                          className={`rounded-lg border px-3 py-2 ${
                            isCorrect
                              ? 'border-emerald-400/40 bg-emerald-400/10'
                              : 'border-rose-400/40 bg-rose-400/10'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-white/70">
                            <span>Q{question.questionNumber}</span>
                            <span>{formatDuration(answer?.duration)}</span>
                          </div>
                          <p className="mt-1 text-sm font-semibold text-white">{question.question}</p>
                          <div className="mt-2 grid gap-2 text-[13px]">
                            <p>
                              <span className="text-white/60">Attempted:</span>{' '}
                              <span className="font-semibold">{answer?.attemptedAnswer || 'NA'}</span>
                            </p>
                            <p>
                              <span className="text-white/60">Correct:</span>{' '}
                              <span className="font-semibold">{question.correctAnswer}</span>
                            </p>
                            <p className={`text-xs font-semibold ${isCorrect ? 'text-emerald-300' : 'text-rose-200'}`}>
                              {isCorrect ? 'Correct' : 'Incorrect'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {!selectedAttempt.questions?.length && (
                      <p className="text-center text-white/60">No question data available.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default QuizAttemptsPage;


