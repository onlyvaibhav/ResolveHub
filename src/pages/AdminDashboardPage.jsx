import { useEffect } from 'react';
import { useIssues } from '../hooks';
import { initializeSystem } from '../services';
import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import {
  HiOutlineClipboardDocumentList,
  HiOutlineClock,
  HiOutlineMagnifyingGlass,
  HiOutlineWrenchScrewdriver,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineArrowTrendingUp,
  HiOutlineChevronRight
} from 'react-icons/hi2';

const AdminStatCard = ({ icon: Icon, label, value, color, gradient }) => (
  <div className="stat-card group">
    <div className="flex items-center justify-between">
      <div className={`p-2.5 rounded-xl ${gradient}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <span className="text-2xl font-bold text-surface-900 dark:text-white">{value}</span>
    </div>
    <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">{label}</p>
  </div>
);

const AdminDashboardPage = () => {
  // Listen to systemStats and all issues (for recent activity)
  const { stats, loading: statsLoading } = useIssues(null, false, true);
  const { issues, loading: issuesLoading } = useIssues(null, true);

  const loading = statsLoading || issuesLoading;

  // Initialize DB documents (counters, stats, categories) securely with admin permissions
  useEffect(() => {
    initializeSystem();
  }, []);

  const statsList = [
    {
      icon: HiOutlineClipboardDocumentList,
      label: 'Total Issues',
      value: stats?.totalIssues || 0,
      color: 'text-primary-600 dark:text-primary-400',
      gradient: 'bg-primary-50 dark:bg-primary-500/10',
    },
    {
      icon: HiOutlineClock,
      label: 'Pending',
      value: stats?.pending || 0,
      color: 'text-warning-600 dark:text-warning-400',
      gradient: 'bg-warning-50 dark:bg-warning-500/10',
    },
    {
      icon: HiOutlineMagnifyingGlass,
      label: 'Under Review',
      value: stats?.underReview || 0,
      color: 'text-blue-600 dark:text-blue-400',
      gradient: 'bg-blue-50 dark:bg-blue-500/10',
    },
    {
      icon: HiOutlineWrenchScrewdriver,
      label: 'In Progress',
      value: stats?.inProgress || 0,
      color: 'text-indigo-600 dark:text-indigo-400',
      gradient: 'bg-indigo-50 dark:bg-indigo-500/10',
    },
    {
      icon: HiOutlineCheckCircle,
      label: 'Resolved',
      value: stats?.resolved || 0,
      color: 'text-success-600 dark:text-success-400',
      gradient: 'bg-success-50 dark:bg-success-500/10',
    },
    {
      icon: HiOutlineXCircle,
      label: 'Closed',
      value: stats?.closed || 0,
      color: 'text-surface-500 dark:text-surface-400',
      gradient: 'bg-surface-100 dark:bg-surface-700/50',
    },
  ];

  const formatDate = (timestamp) => {
    if (!timestamp) return '—';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const recentIssues = issues.slice(0, 5); // display 5 recent reports

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            System metrics and global issue tracking overview.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20">
          <HiOutlineArrowTrendingUp className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          <span className="text-sm font-medium text-primary-700 dark:text-primary-400">
            Administrator Mode
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {statsList.map((stat) => (
              <AdminStatCard key={stat.label} {...stat} />
            ))}
          </div>

          {/* Recent Activity */}
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-surface-100 dark:border-surface-700 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                  Recent Issue Activity
                </h2>
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
                  Latest issue submissions
                </p>
              </div>
              {issues.length > 5 && (
                <Link
                  to="/admin/issues"
                  className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                >
                  View All Issues ({issues.length})
                  <HiOutlineChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {issues.length === 0 ? (
              <div className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 mb-4">
                  <HiOutlineClipboardDocumentList className="w-8 h-8 text-surface-400 dark:text-surface-500" />
                </div>
                <p className="text-surface-600 dark:text-surface-400 font-semibold">
                  No issues registered in the system
                </p>
                <p className="text-sm text-surface-400 dark:text-surface-500 mt-1">
                  Once users submit issues, they will show up here.
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
                    {recentIssues.map((issue) => (
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
                          <div className="text-sm font-medium text-surface-700 dark:text-surface-300">
                            {issue.userName}
                          </div>
                          <div className="text-xs text-surface-400 dark:text-surface-500">
                            {issue.userEmail}
                          </div>
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
                            Manage
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
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
