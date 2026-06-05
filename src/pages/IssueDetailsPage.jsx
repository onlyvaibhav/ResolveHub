import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchIssueByIdStream } from '../services';
import { useIssues } from '../hooks';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import {
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineTag,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowLeft,
  HiOutlineClock,
  HiOutlineDocumentCheck,
  HiOutlineTrash
} from 'react-icons/hi2';

const IssueDetailsPage = () => {
  const { id } = useParams();
  const { userData, isAdmin } = useAuth();
  const { updateStatus, addRemark, deleteIssue } = useIssues();
  const navigate = useNavigate();

  // States
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Admin form inputs
  const [statusNote, setStatusNote] = useState('');
  const [remarkText, setRemarkText] = useState('');
  const [statusDropdown, setStatusDropdown] = useState('');

  const statuses = ['Pending', 'Under Review', 'In Progress', 'Resolved', 'Closed'];

  useEffect(() => {
    setLoading(true);
    const unsubscribe = fetchIssueByIdStream(id, (data) => {
      setIssue(data);
      if (data) {
        setStatusDropdown(data.status);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!statusDropdown || statusDropdown === issue.status) return;

    setActionLoading(true);
    try {
      const result = await updateStatus(
        issue.id,
        issue.status,
        statusDropdown,
        userData.uid,
        statusNote.trim()
      );
      if (result.success) {
        setStatusNote('');
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddRemark = async (e) => {
    e.preventDefault();
    if (!remarkText.trim()) return;

    setActionLoading(true);
    try {
      const result = await addRemark(issue.id, remarkText.trim(), userData.uid, userData.name);
      if (result.success) {
        setRemarkText('');
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('Failed to add remark.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      const result = await deleteIssue(issue.id);
      if (result.success) {
        navigate(isAdmin ? '/admin/issues' : '/my-issues');
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('Failed to delete issue.');
    } finally {
      setActionLoading(false);
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
        return 'text-danger-700 bg-danger-50 dark:text-danger-400 dark:bg-danger-500/10 border-danger-200 dark:border-danger-500/20';
      case 'High':
        return 'text-warning-700 bg-warning-50 dark:text-warning-400 dark:bg-warning-500/10 border-warning-200 dark:border-warning-500/20';
      case 'Low':
        return 'text-surface-600 bg-surface-50 dark:text-surface-400 dark:bg-surface-800 border-surface-200 dark:border-surface-700';
      default:
        return 'text-primary-700 bg-primary-50 dark:text-primary-400 dark:bg-primary-500/10 border-primary-200 dark:border-primary-500/20';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20 flex justify-center">
          <Loader size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!issue) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center max-w-md mx-auto">
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Issue Not Found</h2>
          <p className="text-surface-500 dark:text-surface-400">
            The issue ticket you are looking for does not exist or has been deleted from the database.
          </p>
          <Link to="/dashboard" className="btn-primary mt-6 inline-block px-6">
            Back to Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Determine actual image source (Cloudinary or Base64 fallback)
  const imageSource = issue.imageType === 'base64' ? issue.imageData : issue.imageUrl;

  return (
    <DashboardLayout>
      {/* Back Button */}
      <div className="mb-6 flex justify-between items-center">
        <Link
          to={isAdmin ? '/admin/issues' : '/my-issues'}
          className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-white transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          <span>Back to Issues List</span>
        </Link>
        
        {/* Admin or Owner Delete Option */}
        {(isAdmin || issue.userId === userData.uid) && (
          <button
            onClick={handleDelete}
            disabled={actionLoading}
            className="btn-ghost text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-500/10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
          >
            <HiOutlineTrash className="w-4 h-4" />
            Delete Ticket
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* Left Columns (Details and Remarks) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Info Card */}
          <div className="card p-6 sm:p-8 space-y-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-100 dark:border-surface-800 pb-5">
              <div>
                <span className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400">
                  {issue.ticketId}
                </span>
                <h1 className="text-2xl font-bold text-surface-900 dark:text-white mt-1">
                  {issue.title}
                </h1>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityColor(issue.priority)}`}>
                  {issue.priority}
                </span>
                <StatusBadge status={issue.status} />
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-surface-700 dark:text-surface-300 text-sm leading-relaxed whitespace-pre-wrap">
                {issue.description}
              </p>
            </div>

            {/* Evidence Image */}
            {imageSource && (
              <div>
                <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">Photo Evidence</h3>
                <div className="rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden bg-surface-50 dark:bg-surface-800 max-w-xl">
                  <a href={imageSource} target="_blank" rel="noopener noreferrer">
                    <img src={imageSource} alt="Evidence" className="w-full h-auto object-cover max-h-96 hover:opacity-90 transition-opacity" />
                  </a>
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-surface-100 dark:border-surface-800 text-sm">
              <div className="flex items-center gap-2.5 text-surface-600 dark:text-surface-400">
                <HiOutlineCalendar className="w-5 h-5 text-surface-400" />
                <div>
                  <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider leading-tight">Reported At</p>
                  <p className="font-medium mt-0.5">{formatDate(issue.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-surface-600 dark:text-surface-400">
                <HiOutlineTag className="w-5 h-5 text-surface-400" />
                <div>
                  <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider leading-tight">Category</p>
                  <p className="font-medium mt-0.5">{issue.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-surface-600 dark:text-surface-400">
                <HiOutlineUser className="w-5 h-5 text-surface-400" />
                <div>
                  <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider leading-tight">Reporter</p>
                  <p className="font-medium mt-0.5 truncate max-w-[150px]">{issue.userName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Remarks Section */}
          <div className="card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2 mb-6">
              <HiOutlineChatBubbleLeftRight className="w-5 h-5 text-primary-500" />
              Official Admin Remarks
            </h2>

            {issue.remarks.length === 0 ? (
              <p className="text-sm text-surface-400 dark:text-surface-500 italic py-4 text-center bg-surface-50/50 dark:bg-surface-800/10 rounded-xl">
                No official remarks added to this ticket yet.
              </p>
            ) : (
              <div className="space-y-4">
                {issue.remarks.map((remark, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/20"
                  >
                    <div className="flex justify-between items-center text-xs text-surface-400 mb-1.5">
                      <span className="font-semibold text-primary-600 dark:text-primary-400">
                        {remark.createdBy}
                      </span>
                      <span>{formatDate(remark.createdAt)}</span>
                    </div>
                    <p className="text-sm text-surface-700 dark:text-surface-300">
                      {remark.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Admin Add Remark Box */}
            {isAdmin && (
              <form onSubmit={handleAddRemark} className="mt-6 pt-6 border-t border-surface-100 dark:border-surface-800 space-y-3">
                <label htmlFor="remarkText" className="label text-xs">
                  Add Official Remark
                </label>
                <textarea
                  id="remarkText"
                  rows="3"
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                  placeholder="Enter official update or remark..."
                  className="input text-sm"
                  required
                ></textarea>
                <button
                  type="submit"
                  disabled={actionLoading || !remarkText.trim()}
                  className="btn-primary py-2 px-4 text-xs font-semibold self-end"
                >
                  Post Remark
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column (Status Timeline and Admin Controls) */}
        <div className="space-y-6">
          
          {/* Admin Actions Panel */}
          {isAdmin && (
            <div className="card p-6 border-primary-100 dark:border-primary-950/20 bg-primary-50/10 dark:bg-primary-950/5">
              <h2 className="text-base font-bold text-surface-900 dark:text-white flex items-center gap-2 mb-4">
                <HiOutlineDocumentCheck className="w-5 h-5 text-primary-500" />
                Administrative Actions
              </h2>

              <form onSubmit={handleStatusUpdate} className="space-y-4">
                {/* Status Dropdown */}
                <div>
                  <label htmlFor="statusDropdown" className="label text-xs">
                    Change Ticket Status
                  </label>
                  <select
                    id="statusDropdown"
                    value={statusDropdown}
                    onChange={(e) => setStatusDropdown(e.target.value)}
                    className="input text-sm bg-white dark:bg-surface-800"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Note */}
                {statusDropdown !== issue.status && (
                  <div className="animate-fade-in">
                    <label htmlFor="statusNote" className="label text-xs">
                      Update Note / Reason
                    </label>
                    <input
                      type="text"
                      id="statusNote"
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      placeholder="e.g. Investigation completed"
                      className="input text-sm bg-white dark:bg-surface-800"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={actionLoading || statusDropdown === issue.status}
                  className="btn-primary w-full py-2.5 text-xs font-semibold"
                >
                  Save Status Update
                </button>
              </form>
            </div>
          )}

          {/* Timeline Visual Card */}
          <div className="card p-6">
            <h2 className="text-base font-bold text-surface-900 dark:text-white flex items-center gap-2 mb-6">
              <HiOutlineClock className="w-5 h-5 text-primary-500" />
              Ticket Timeline
            </h2>

            <div className="relative pl-6 border-l-2 border-surface-200 dark:border-surface-800 space-y-6">
              {issue.statusHistory.map((step, idx) => (
                <div key={idx} className="relative animate-slide-up">
                  {/* Stepper Dot Indicator */}
                  <span className="absolute -left-[31px] top-1.5 flex h-4 h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-surface-900 border-2 border-primary-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                  </span>
                  <div>
                    <span className="text-xs font-bold text-surface-900 dark:text-white bg-surface-100 dark:bg-surface-800 px-2 py-0.5 rounded-md">
                      {step.status}
                    </span>
                    <span className="block text-[10px] text-surface-400 dark:text-surface-500 mt-1">
                      {formatDate(step.updatedAt)}
                    </span>
                    <p className="text-xs text-surface-600 dark:text-surface-400 mt-1 italic leading-tight">
                      &quot;{step.note}&quot;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default IssueDetailsPage;
