const STATUS_CONFIG = {
  'Pending': {
    bg: 'bg-warning-50 dark:bg-warning-500/10',
    text: 'text-warning-700 dark:text-warning-400',
    dot: 'bg-warning-500',
  },
  'Under Review': {
    bg: 'bg-primary-50 dark:bg-primary-500/10',
    text: 'text-primary-700 dark:text-primary-400',
    dot: 'bg-primary-500',
  },
  'In Progress': {
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  'Resolved': {
    bg: 'bg-success-50 dark:bg-success-500/10',
    text: 'text-success-700 dark:text-success-400',
    dot: 'bg-success-500',
  },
  'Closed': {
    bg: 'bg-surface-100 dark:bg-surface-700/50',
    text: 'text-surface-600 dark:text-surface-400',
    dot: 'bg-surface-400',
  },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['Pending'];

  return (
    <span
      className={`badge ${config.bg} ${config.text} gap-1.5`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
};

export default StatusBadge;
