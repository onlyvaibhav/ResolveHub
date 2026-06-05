import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineHome,
  HiOutlinePlusCircle,
  HiOutlineClipboardDocumentList,
  HiOutlineShieldCheck,
  HiOutlineDocumentText,
  HiOutlineTableCells,
} from 'react-icons/hi2';

const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();

  const userLinks = [
    { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/create-issue', icon: HiOutlinePlusCircle, label: 'Create Issue' },
    { to: '/my-issues', icon: HiOutlineClipboardDocumentList, label: 'My Issues' },
  ];

  const adminLinks = [
    { to: '/admin', icon: HiOutlineShieldCheck, label: 'Admin Dashboard' },
    { to: '/admin/issues', icon: HiOutlineDocumentText, label: 'All Issues' },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64
          bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800
          transition-transform duration-300 ease-out
          lg:translate-x-0 lg:static lg:z-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <p className="px-3 mb-3 text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">
              {isAdmin ? 'Administration' : 'Navigation'}
            </p>
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 shadow-sm'
                      : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-white'
                  }`
                }
              >
                <link.icon className="w-5 h-5 flex-shrink-0" />
                {link.label}
              </NavLink>
            ))}

            {/* Admin can also see user view */}
            {isAdmin && (
              <>
                <div className="my-4 border-t border-surface-100 dark:border-surface-800" />
                <p className="px-3 mb-3 text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">
                  Quick Access
                </p>
                <NavLink
                  to="/dashboard"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 shadow-sm'
                        : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-white'
                    }`
                  }
                >
                  <HiOutlineHome className="w-5 h-5 flex-shrink-0" />
                  User Dashboard
                </NavLink>
              </>
            )}
          </nav>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-surface-100 dark:border-surface-800">
            <p className="text-xs text-surface-400 dark:text-surface-600">
              ResolveHub v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
