import { Link } from 'react-router-dom';
import { HiOutlineExclamationTriangle, HiOutlineArrowLeft } from 'react-icons/hi2';
import { useTheme } from '../context/ThemeContext';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2';

const NotFoundPage = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 px-4 relative">
      {/* Dark mode toggle */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 btn-ghost p-2.5 rounded-xl"
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <HiOutlineSun className="w-5 h-5 text-yellow-400" />
        ) : (
          <HiOutlineMoon className="w-5 h-5 text-surface-500" />
        )}
      </button>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-danger-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl" />
      </div>

      <div className="text-center relative animate-slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-danger-50 dark:bg-danger-500/10 mb-6">
          <HiOutlineExclamationTriangle className="w-10 h-10 text-danger-500" />
        </div>
        <h1 className="text-6xl font-bold text-surface-900 dark:text-white mb-2">404</h1>
        <h2 className="text-xl font-semibold text-surface-700 dark:text-surface-300 mb-2">
          Page not found
        </h2>
        <p className="text-surface-500 dark:text-surface-400 max-w-md mx-auto mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          to="/dashboard"
          className="btn-primary px-6 py-3 inline-flex items-center gap-2"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
