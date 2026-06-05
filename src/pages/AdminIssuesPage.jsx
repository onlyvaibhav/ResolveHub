import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useIssues } from '../hooks';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import exportIssuesToExcel from '../utils/excelExport';
import { Link } from 'react-router-dom';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineChevronRight,
  HiOutlineTrash,
  HiOutlineArrowDownTray,
  HiOutlineChevronUpDown,
  HiOutlineAdjustmentsHorizontal
} from 'react-icons/hi2';

const AdminIssuesPage = () => {
  const { userData } = useAuth();
  const { issues, categories, loading, deleteIssue } = useIssues(null, true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Sorting & UI
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc'
  const [showAdvanceFilters, setShowAdvanceFilters] = useState(false);

  const statuses = ['All', 'Pending', 'Under Review', 'In Progress', 'Resolved', 'Closed'];
  const priorities = ['All', 'Low', 'Medium', 'High', 'Critical'];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'text-danger-700 bg-danger-50 dark:text-danger-400 dark:bg-danger-500/10 border-danger-200 dark:border-danger-500/20';
      case 'High':
        return 'text-warning-700 bg-warning-50 dark:text-warning-400 dark:bg-warning-500/10 border-warning-200 dark:border-warning-500/20';
      case 'Low':
        return 'text-surface-600 bg-surface-50 dark:text-surface-400 dark:bg-surface-800 border-surface-200 dark:border-surface-700';
      default:
        return 'text-primary-700 bg-primary-50 dark:text-primary-400 dark:bg-primary-500/10 border-primary-200 dark:border-primary-500/20';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '—';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Perform filtering and sorting
  const filteredIssues = issues
    .filter((issue) => {
      // Exclude soft deleted issues (hook does this, but double check)
      if (issue.isDeleted) return false;

      // 1. Search (ID, Title, Name, Email)
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        issue.ticketId?.toLowerCase().includes(q) ||
        issue.titleLower?.includes(q) ||
        issue.userName?.toLowerCase().includes(q) ||
        issue.userEmail?.toLowerCase().includes(q);

      // 2. Status Filter
      const matchesStatus = selectedStatus === 'All' || issue.status === selectedStatus;

      // 3. Category Filter
      const matchesCategory = selectedCategory === 'All' || issue.category === selectedCategory;

      // 4. Priority Filter
      const matchesPriority = selectedPriority === 'All' || issue.priority === selectedPriority;

      // 5. Date Range Filter
      let matchesDate = true;
      const issueDate = issue.createdAt?.toDate ? issue.createdAt.toDate() : new Date(issue.createdAt);
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (issueDate < start) matchesDate = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (issueDate > end) matchesDate = false;
      }

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesDate;
    })
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const handleDeleteIssue = async (issueId) => {
    if (window.confirm('Are you sure you want to soft delete this issue? This will remove it from all logs, dashboards, and public lookup.')) {
      try {
        const result = await deleteIssue(issueId);
        if (!result.success) {
          alert(result.error);
        }
      } catch (err) {
        alert('Failed to delete issue.');
      }
    }
  };

  const handleExport = async () => {
    try {
      await exportIssuesToExcel(filteredIssues);
    } catch (error) {
      alert('Failed to export Excel report. Please try again.');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All');
    setSelectedCategory('All');
    setSelectedPriority('All');
    setStartDate('');
    setEndDate('');
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            System Issues Log
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Search, filter, manage status flow, and export tickets.
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={filteredIssues.length === 0}
          className="btn-primary inline-flex items-center gap-2 py-2.5 self-start sm:self-auto"
        >
          <HiOutlineArrowDownTray className="w-5 h-5" />
          <span>Export Excel</span>
        </button>
      </div>

      {/* Main Filter Control Panel */}
      <div className="card p-4 mb-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Global Search */}
          <div className="relative">
            <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search ID, title, user, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 text-sm"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input text-sm bg-white dark:bg-surface-800"
              aria-label="Status Filter"
            >
              <option value="All">All Statuses</option>
              {statuses.slice(1).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="flex items-center justify-between px-4 py-2 border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800 hover:bg-surface-50 dark:hover:bg-surface-700/50 rounded-xl text-sm font-medium text-surface-700 dark:text-surface-200 transition-colors"
          >
            <span>Sort Date ({sortOrder === 'desc' ? 'Newest' : 'Oldest'})</span>
            <HiOutlineChevronUpDown className="w-4 h-4 text-surface-400" />
          </button>

          {/* Advanced filters toggle & clear */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowAdvanceFilters(!showAdvanceFilters)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-xl text-sm font-medium transition-colors ${
                showAdvanceFilters
                  ? 'border-primary-300 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400'
                  : 'border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-700/50'
              }`}
            >
              <HiOutlineAdjustmentsHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
            <button
              onClick={clearFilters}
              className="px-3 py-2 border border-surface-200 dark:border-surface-700 bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-xs font-semibold rounded-xl text-surface-600 dark:text-surface-300 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Advanced filters panel */}
        {showAdvanceFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-surface-100 dark:border-surface-800 animate-slide-up">
            {/* Category Filter */}
            <div>
              <label className="label text-xs">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input text-sm bg-white dark:bg-surface-800 mt-1"
                aria-label="Category Select"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="label text-xs">Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="input text-sm bg-white dark:bg-surface-800 mt-1"
                aria-label="Priority Select"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p === 'All' ? 'All Priorities' : p}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="label text-xs">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input text-sm bg-white dark:bg-surface-800 mt-1"
                aria-label="Start Date"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="label text-xs">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input text-sm bg-white dark:bg-surface-800 mt-1"
                aria-label="End Date"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main content table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          {filteredIssues.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-surface-500 dark:text-surface-400 font-semibold text-lg">No active issues found</p>
              <p className="text-sm text-surface-400 dark:text-surface-500 mt-1">
                Try adjusting your search queries or active filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-100 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/20">
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 px-5 py-3">
                      Ticket ID
                    </th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 px-5 py-3">
                      Title
                    </th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 px-5 py-3">
                      Reporter
                    </th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 px-5 py-3">
                      Category
                    </th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 px-5 py-3">
                      Priority
                    </th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 px-5 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 px-5 py-3">
                      Created
                    </th>
                    <th className="text-right text-xs font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400 px-5 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
                  {filteredIssues.map((issue) => (
                    <tr
                      key={issue.id}
                      className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                    >
                      {/* Ticket ID */}
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-mono font-bold text-primary-600 dark:text-primary-400">
                          {issue.ticketId}
                        </span>
                      </td>

                      {/* Title */}
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-medium text-surface-900 dark:text-surface-100 line-clamp-1">
                          {issue.title}
                        </span>
                      </td>

                      {/* Reporter Info */}
                      <td className="px-5 py-3.5">
                        <div className="text-sm font-medium text-surface-700 dark:text-surface-300">
                          {issue.userName}
                        </div>
                        <div className="text-xs text-surface-400 dark:text-surface-500 font-mono">
                          {issue.userEmail}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-surface-600 dark:text-surface-300">
                          {issue.category}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <StatusBadge status={issue.status} />
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-surface-500 dark:text-surface-400">
                          {formatDate(issue.createdAt)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right space-x-2">
                        {/* Manage */}
                        <Link
                          to={`/issue/${issue.id}`}
                          className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-350 bg-primary-50 dark:bg-primary-500/10 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1 transition-colors"
                        >
                          Manage
                          <HiOutlineChevronRight className="w-3.5 h-3.5" />
                        </Link>

                        {/* Soft Delete */}
                        <button
                          onClick={() => handleDeleteIssue(issue.id)}
                          className="text-xs font-semibold text-danger-600 dark:text-danger-400 hover:text-danger-700 dark:hover:text-danger-300 bg-danger-50 dark:bg-danger-500/10 p-1.5 rounded-lg inline-flex items-center transition-colors"
                          title="Soft delete ticket"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminIssuesPage;
