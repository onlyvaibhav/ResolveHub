import { useAuth } from '../context/AuthContext';
import { useIssues } from '../hooks';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import {
  HiOutlineClipboardDocumentList,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlinePlusCircle,
  HiOutlineArrowRight,
  HiOutlineChevronRight
} from 'react-icons/hi2';
import { Link } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, color, gradient }) => (
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

const DashboardPage = () => {
  const { userData } = useAuth();
  const { issues, loading } = useIssues(userData?.uid);

  // Derive counts from user issues
  const totalCount = issues.length;
  const pendingCount = issues.filter((i) => i.status === 'Pending').length;
  const resolvedCount = issues.filter((i) => i.status === 'Resolved').length;

  const stats = [
    {
      icon: HiOutlineClipboardDocumentList,
      label: 'Total Issues',
      value: totalCount,
      color: 'text-primary-600 dark:text-primary-400',
      gradient: 'bg-primary-50 dark:bg-primary-500/10',
    },
    {
      icon: HiOutlineClock,
      label: 'Pending',
      value: pendingCount,
      color: 'text-warning-600 dark:text-warning-400',
      gradient: 'bg-warning-50 dark:bg-warning-500/10',
    },
    {
      icon: HiOutlineCheckCircle,
      label: 'Resolved',
      value: resolvedCount,
      color: 'text-success-600 dark:text-success-400',
      gradient: 'bg-success-50 dark:bg-success-500/10',
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

  const recentIssues = issues.slice(0, 5); // Display top 5 recent issues on dashboard

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
          Welcome back, {userData?.name?.split(' ')[0] || 'User'} 👋
        </h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">
          Here&apos;s an overview of your reported issues
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          {/* Quick Action */}
          <div className="mb-8">
            <Link
              to="/create-issue"
              className="card-hover p-5 flex items-center gap-4 border-2 border-dashed border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-600 group"
            >
              <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-500/10 group-hover:bg-primary-100 dark:group-hover:bg-primary-500/20 transition-colors">
                <HiOutlinePlusCircle className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-surface-900 dark:text-white">Create New Issue</h3>
                <p className="text-sm text-surface-500 dark:text-surface-400">
                  Report a new issue with details and image evidence
                </p>
              </div>
              <HiOutlineArrowRight className="w-5 h-5 text-surface-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors group-hover:translate-x-1 transform duration-200" />
            </Link>
          </div>

          {/* Recent Issues Table */}
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-surface-100 dark:border-surface-700 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                  Recent Issues
                </h2>
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
                  Your latest submitted issues
                </p>
              </div>
              {issues.length > 5 && (
                <Link
                  to="/my-issues"
                  className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                >
                  View All ({issues.length})
                  <HiOutlineChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            {issues.length === 0 ? (
              /* Empty state */
              <div className="py-16 text-center">
                <HiOutlineClipboardDocumentList className="w-12 h-12 mx-auto text-surface-300 dark:text-surface-600 mb-3" />
                <p className="text-surface-600 dark:text-surface-400 font-semibold">
                  No issues submitted yet
                </p>
                <p className="text-sm text-surface-400 dark:text-surface-500 mt-1">
                  Create your first issue to get started
                </p>
              </div>
            ) : (
              /* Live table */
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
        </>
      )}
    </DashboardLayout>
  );
};

export default DashboardPage;
