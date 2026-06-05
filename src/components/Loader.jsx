const Loader = ({ size = 'md', text = '' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} border-surface-200 dark:border-surface-700 border-t-primary-600 rounded-full animate-spin`}
      />
      {text && (
        <p className="text-sm text-surface-500 dark:text-surface-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

// Full-page loader
export const PageLoader = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-50/80 dark:bg-surface-950/80 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary-200 dark:border-primary-900 rounded-full" />
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-primary-600 rounded-full animate-spin" />
      </div>
      <p className="text-sm font-medium text-surface-600 dark:text-surface-400">
        Loading...
      </p>
    </div>
  </div>
);

export default Loader;
