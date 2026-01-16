
import React, { useState, useEffect } from 'react';
import { UserRole, Agent, Task, AgentStatus } from './types';
import AdminDashboard from './components/AdminDashboard';
import AgentApp from './components/AgentApp';
import Login from './components/Login';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<any>(null);

  // Persistence
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') as UserRole;
    const savedUser = localStorage.getItem('userData');
    if (savedRole && savedUser) {
      setRole(savedRole);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (selectedRole: UserRole, data: any) => {
    setRole(selectedRole);
    setUser(data);
    localStorage.setItem('userRole', selectedRole);
    localStorage.setItem('userData', JSON.stringify(data));
  };

  const handleLogout = () => {
    setRole(null);
    setUser(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
  };

  if (!role) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      {role === 'ADMIN' ? (
        <AdminDashboard user={user} onLogout={handleLogout} />
      ) : (
        <AgentApp user={user} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;
