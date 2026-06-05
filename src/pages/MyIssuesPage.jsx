import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useIssues } from '../hooks';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import { Link } from 'react-router-dom';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineChevronRight,
  HiOutlineChevronUpDown,
  HiOutlinePlusCircle
} from 'react-icons/hi2';

const MyIssuesPage = () => {
  const { userData } = useAuth();
  const { issues, categories, loading } = useIssues(userData?.uid);

  // States for search, filter, and sort
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (newest first) or 'asc' (oldest first)

  const statuses = ['All', 'Pending', 'Under Review', 'In Progress', 'Resolved', 'Closed'];

  // Handle formatting date
  const formatDate = (timestamp) => {
    if (!timestamp) return '—';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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

  // Filter issues based on criteria
  const filteredIssues = issues
    .filter((issue) => {
      // 1. Search Query (Title or Category matches)
      const matchesSearch =
        issue.titleLower?.includes(searchQuery.toLowerCase()) ||
        issue.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.ticketId?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Status Filter
      const matchesStatus = selectedStatus === 'All' || issue.status === selectedStatus;

      // 3. Category Filter
      const matchesCategory = selectedCategory === 'All' || issue.category === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      // Sort by Date
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);

      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            My Reported Issues
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Track and search all issues you have reported.
          </p>
        </div>
        <Link to="/create-issue" className="btn-primary flex items-center gap-2 self-start sm:self-auto py-2.5">
          <HiOutlinePlusCircle className="w-5 h-5" />
          <span>Report Issue</span>
        </Link>
      </div>

      {/* Control bar: Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Search */}
        <div className="relative">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search by title, ID, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9 text-sm"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input text-sm"
            aria-label="Filter by Status"
          >
            <option value="All">All Statuses</option>
            {statuses.slice(1).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input text-sm"
            aria-label="Filter by Category"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Trigger */}
        <button
          onClick={toggleSortOrder}
          className="flex items-center justify-between gap-2 px-4 py-2 border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800 hover:bg-surface-50 dark:hover:bg-surface-700/50 rounded-xl text-sm font-medium text-surface-700 dark:text-surface-200 transition-colors"
        >
          <span>Sort: Date ({sortOrder === 'desc' ? 'Newest First' : 'Oldest First'})</span>
          <HiOutlineChevronUpDown className="w-4 h-4 text-surface-400" />
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          {filteredIssues.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-surface-500 dark:text-surface-400 font-semibold text-lg">No issues found</p>
              <p className="text-sm text-surface-400 dark:text-surface-500 mt-1">
                Try modifying your search queries or filters.
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
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
                  {filteredIssues.map((issue) => (
                    <tr
                      key={issue.id}
                      className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-mono font-bold text-primary-600 dark:text-primary-400">
                          {issue.ticketId}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-medium text-surface-900 dark:text-surface-100 line-clamp-1">
                          {issue.title}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-surface-600 dark:text-surface-300">
                          {issue.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={issue.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-surface-500 dark:text-surface-400">
                          {formatDate(issue.createdAt)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to={`/issue/${issue.id}`}
                          className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-350 bg-primary-50 dark:bg-primary-500/10 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1 transition-colors"
                        >
                          Details
                          <HiOutlineChevronRight className="w-3.5 h-3.5" />
                        </Link>
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

export default MyIssuesPage;
