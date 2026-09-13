import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Layers,
  CalendarDays,
  CheckCircle2,
  Award,
  CreditCard,
  Megaphone,
  School,
  X,
  BookOpen,
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role;

  const adminNav = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Students', path: '/students', icon: GraduationCap },
    { label: 'Teachers', path: '/teachers', icon: Users },
    { label: 'Classes & Subjects', path: '/classes', icon: Layers },
    { label: 'Master Timetable', path: '/timetable', icon: CalendarDays },
    { label: 'Attendance', path: '/attendance', icon: CheckCircle2 },
    { label: 'Exams & Grading', path: '/exams', icon: Award },
    { label: 'Fees & Billing', path: '/fees', icon: CreditCard },
    { label: 'Noticeboard', path: '/notices', icon: Megaphone },
  ];

  const teacherNav = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'My Students', path: '/students', icon: GraduationCap },
    { label: 'My Schedule', path: '/timetable', icon: CalendarDays },
    { label: 'Mark Attendance', path: '/attendance', icon: CheckCircle2 },
    { label: 'Exams & Gradebook', path: '/exams', icon: Award },
    { label: 'Noticeboard', path: '/notices', icon: Megaphone },
  ];

  const studentNav = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Weekly Schedule', path: '/timetable', icon: CalendarDays },
    { label: 'My Attendance', path: '/attendance/my-history', icon: CheckCircle2 },
    { label: 'Report Card & Grades', path: '/exams/my-report', icon: Award },
    { label: 'Fees & Invoices', path: '/fees', icon: CreditCard },
    { label: 'School Notices', path: '/notices', icon: Megaphone },
  ];

  const navItems = role === 'ADMIN' ? adminNav : role === 'TEACHER' ? teacherNav : studentNav;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={clsx(
          'fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20">
              <School className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
                EduPulse
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400">
                School OS
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigation Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={clsx(
                        'w-5 h-5 transition-colors',
                        isActive
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      )}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info badge */}
        <div className="p-4 m-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 mb-1">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span>Academic Year 2026</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Spring Semester in Session
          </p>
        </div>
      </aside>
    </>
  );
};
