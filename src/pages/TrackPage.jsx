import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMagnifyingGlass, HiOutlineArrowLeft, HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2';
import { fetchPublicIssueByTicketId } from '../services';
import StatusBadge from '../components/StatusBadge';
import { useTheme } from '../context/ThemeContext';

const TrackPage = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [ticketId, setTicketId] = useState('');
  const [loading, setLoading] = useState(false);
  const [issue, setIssue] = useState(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!ticketId.trim()) return;

    setLoading(true);
    setError('');
    setIssue(null);
    setSearched(true);

    try {
      const result = await fetchPublicIssueByTicketId(ticketId.trim());
      if (result) {
        setIssue(result);
      } else {
        setError('No active ticket found with the ID provided. It may be invalid or deleted.');
      }
    } catch (err) {
      setError('An error occurred while fetching the ticket status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '—';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'text-danger-600 dark:text-danger-400 bg-danger-50 dark:bg-danger-500/10 border-danger-200 dark:border-danger-500/20';
      case 'High':
        return 'text-warning-600 dark:text-warning-400 bg-warning-50 dark:bg-warning-500/10 border-warning-200 dark:border-warning-500/20';
      case 'Low':
        return 'text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700';
      default:
        return 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 border-primary-200 dark:border-primary-500/20';
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface-50 dark:bg-surface-950 px-4 py-8 relative">
      {/* Header controls */}
      <div className="flex justify-between items-center max-w-4xl mx-auto w-full mb-8">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-white transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
        <button
          onClick={toggleDarkMode}
          className="btn-ghost p-2.5 rounded-xl"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <HiOutlineSun className="w-5 h-5 text-yellow-400" />
          ) : (
            <HiOutlineMoon className="w-5 h-5 text-surface-500" />
          )}
        </button>
      </div>

      {/* Main Card */}
      <div className="flex-1 flex flex-col justify-center items-center max-w-xl mx-auto w-full">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <span className="text-white font-bold text-2xl">R</span>
          </div>
          <h1 className="text-3xl font-extrabold text-surface-900 dark:text-white tracking-tight">
            Track Issue Status
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-2">
            Enter your Ticket ID below to see real-time updates.
          </p>
        </div>

        {/* Search form */}
        <div className="card p-6 w-full shadow-xl">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder="e.g. ISS-1001"
                className="input pl-4 uppercase font-semibold text-center tracking-widest"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-6 flex items-center gap-2"
            >
              <HiOutlineMagnifyingGlass className="w-5 h-5" />
              <span>Search</span>
            </button>
          </form>

          {/* Loading state */}
          {loading && (
            <div className="mt-8 py-8 flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-3">Searching records...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 rounded-xl border border-danger-200 dark:border-danger-500/20 bg-danger-50 dark:bg-danger-500/10 text-center text-sm text-danger-700 dark:text-danger-400 animate-fade-in">
              {error}
            </div>
          )}

          {/* Ticket Detail Box */}
          {issue && !loading && (
            <div className="mt-6 border border-surface-200 dark:border-surface-700/50 rounded-2xl p-6 bg-surface-50/50 dark:bg-surface-800/20 animate-slide-up">
              <div className="flex items-center justify-between border-b border-surface-200 dark:border-surface-800 pb-4 mb-4">
                <div>
                  <p className="text-xs font-semibold text-surface-400 uppercase tracking-widest">Ticket ID</p>
                  <h3 className="text-lg font-bold font-mono text-primary-600 dark:text-primary-400">{issue.ticketId}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-surface-400 uppercase tracking-widest mb-1">Status</p>
                  <StatusBadge status={issue.status} />
                </div>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <p className="text-xs font-semibold text-surface-400 uppercase tracking-widest">Title</p>
                  <p className="text-base font-semibold text-surface-900 dark:text-white mt-0.5">{issue.title}</p>
                </div>

                {/* Priority */}
                <div>
                  <p className="text-xs font-semibold text-surface-400 uppercase tracking-widest mb-1">Priority</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityColor(issue.priority)}`}>
                    {issue.priority}
                  </span>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 border-t border-surface-200 dark:border-surface-800 pt-4">
                  <div>
                    <p className="text-xs font-semibold text-surface-400 uppercase tracking-widest">Reported</p>
                    <p className="text-xs text-surface-600 dark:text-surface-300 mt-1">{formatDate(issue.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-surface-400 uppercase tracking-widest">Last Updated</p>
                    <p className="text-xs text-surface-600 dark:text-surface-300 mt-1">{formatDate(issue.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Searched but empty placeholder */}
          {searched && !issue && !error && !loading && (
            <p className="text-center text-sm text-surface-400 dark:text-surface-500 mt-6">
              Enter another ticket ID to search.
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto w-full text-center mt-8 border-t border-surface-200 dark:border-surface-800 pt-4">
        <p className="text-xs text-surface-400 dark:text-surface-600">
          ResolveHub Security Notice: Public status tracking only displays status and priority levels. Reporter identity details are kept private.
        </p>
      </div>
    </div>
  );
};

export default TrackPage;
