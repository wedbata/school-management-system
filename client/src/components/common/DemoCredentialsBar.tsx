import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, GraduationCap, UserCheck, Sparkles } from 'lucide-react';
import { Role } from '../../types';

export const DemoCredentialsBar: React.FC = () => {
  const { demoLogin, user, isLoading } = useAuth();

  const handleSwitch = async (role: Role) => {
    if (user?.role === role) return;
    try {
      await demoLogin(role);
    } catch (err) {
      console.error('Demo login switch error:', err);
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white px-4 py-2 text-xs font-medium border-b border-indigo-700/50 flex flex-wrap items-center justify-between gap-3 shadow-inner">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="flex items-center gap-1.5 font-semibold text-indigo-100">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          Live Interactive Demo
        </span>
        <span className="hidden md:inline text-indigo-300/80">|</span>
        <span className="hidden md:inline text-indigo-200/90">
          Switch role instantly to test all portals:
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleSwitch('ADMIN')}
          disabled={isLoading}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
            user?.role === 'ADMIN'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
              : 'bg-indigo-950/60 hover:bg-indigo-700/80 text-indigo-100 border border-indigo-600/50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-current" />
          <span>Admin</span>
        </button>

        <button
          onClick={() => handleSwitch('TEACHER')}
          disabled={isLoading}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
            user?.role === 'TEACHER'
              ? 'bg-emerald-400 text-slate-950 font-bold shadow-sm'
              : 'bg-indigo-950/60 hover:bg-indigo-700/80 text-indigo-100 border border-indigo-600/50'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-current" />
          <span>Teacher</span>
        </button>

        <button
          onClick={() => handleSwitch('STUDENT')}
          disabled={isLoading}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
            user?.role === 'STUDENT'
              ? 'bg-sky-400 text-slate-950 font-bold shadow-sm'
              : 'bg-indigo-950/60 hover:bg-indigo-700/80 text-indigo-100 border border-indigo-600/50'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-current" />
          <span>Student</span>
        </button>
      </div>
    </div>
  );
};
