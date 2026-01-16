
import React from 'react';
import { ICONS } from '../constants';
import { UserRole } from '../types';

interface LoginProps {
  onLogin: (role: UserRole, data: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-900 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-xl mb-4">
            <span className="text-blue-600">{ICONS.Map}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">GeoForce</h1>
          <p className="text-slate-500 mt-2">Field Force Management System</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => onLogin('ADMIN', { id: 'admin1', name: 'System Admin' })}
            className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:border-blue-300 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg text-white">
                {ICONS.Users}
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-900">Admin Portal</p>
                <p className="text-xs text-slate-500">Manage agents, routes & tasks</p>
              </div>
            </div>
            <div className="text-slate-300 group-hover:text-blue-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          <button
            onClick={() => onLogin('AGENT', { id: 'agent1', name: 'Alex Field' })}
            className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:border-blue-300 transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500 rounded-lg text-white">
                {ICONS.Navigation}
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-900">Field Agent App</p>
                <p className="text-xs text-slate-500">Track tasks & update location</p>
              </div>
            </div>
            <div className="text-slate-300 group-hover:text-emerald-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        <div className="text-center text-xs text-slate-400">
          Secure enterprise access. Authorized personnel only.
        </div>
      </div>
    </div>
  );
};

export default Login;
