
import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants';
import MapComponent from './MapComponent';
import { Agent, AgentStatus, Task } from '../types';

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'map' | 'agents' | 'tasks' | 'reports'>('map');
  
  // Persistence-ready state
  const [agents, setAgents] = useState<Agent[]>(() => {
    const saved = localStorage.getItem('gf_agents');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'John Doe', status: AgentStatus.ONLINE, batteryLevel: 82, lastUpdated: Date.now(), lastLocation: { lat: 40.7128, lng: -74.0060, timestamp: Date.now() }, routeHistory: [] },
      { id: '2', name: 'Jane Smith', status: AgentStatus.ON_DUTY, batteryLevel: 45, lastUpdated: Date.now(), lastLocation: { lat: 40.7589, lng: -73.9851, timestamp: Date.now() }, routeHistory: [] },
      { id: '3', name: 'Mike Ross', status: AgentStatus.OFFLINE, batteryLevel: 12, lastUpdated: Date.now(), lastLocation: { lat: 40.7306, lng: -73.9352, timestamp: Date.now() }, routeHistory: [] }
    ];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('gf_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 't1', agentId: '1', title: 'Deliver Package #402', description: 'Priority delivery to downtown center', status: 'PENDING', location: { lat: 40.71, lng: -74.00, address: 'Wall St, NY' } },
      { id: 't2', agentId: '2', title: 'Site Inspection', description: 'Inspect the construction at 42nd St', status: 'IN_PROGRESS', location: { lat: 40.75, lng: -73.98, address: '42nd St, NY' } }
    ];
  });

  // Modal states
  const [showAgentModal, setShowAgentModal] = useState<boolean>(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form states
  const [taskForm, setTaskForm] = useState({ title: '', agentId: '', description: '', address: '' });
  const [agentForm, setAgentForm] = useState({ name: '', status: AgentStatus.ONLINE });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('gf_agents', JSON.stringify(agents));
    localStorage.setItem('gf_tasks', JSON.stringify(tasks));
  }, [agents, tasks]);

  // Simulated GPS updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(a => {
        if (a.status !== AgentStatus.OFFLINE && a.lastLocation) {
          const newLoc = {
            lat: a.lastLocation.lat + (Math.random() - 0.5) * 0.002,
            lng: a.lastLocation.lng + (Math.random() - 0.5) * 0.002,
            timestamp: Date.now()
          };
          return {
            ...a,
            lastLocation: newLoc,
            lastUpdated: Date.now(),
            routeHistory: [...a.routeHistory, newLoc].slice(-50)
          };
        }
        return a;
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // CRUD Handlers for Agents
  const handleSaveAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAgent) {
      setAgents(prev => prev.map(a => a.id === editingAgent.id ? { ...a, ...agentForm } : a));
    } else {
      const newAgent: Agent = {
        id: Math.random().toString(36).substr(2, 9),
        name: agentForm.name,
        status: agentForm.status,
        batteryLevel: 100,
        lastUpdated: Date.now(),
        lastLocation: { lat: 40.7128, lng: -74.0060, timestamp: Date.now() },
        routeHistory: []
      };
      setAgents(prev => [...prev, newAgent]);
    }
    setShowAgentModal(false);
    setEditingAgent(null);
    setAgentForm({ name: '', status: AgentStatus.ONLINE });
  };

  const deleteAgent = (id: string) => {
    if (window.confirm('Are you sure you want to remove this agent?')) {
      setAgents(prev => prev.filter(a => a.id !== id));
      setTasks(prev => prev.filter(t => t.agentId !== id));
    }
  };

  // CRUD Handlers for Tasks
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...taskForm } : t));
      setShowTaskModal(false);
      setEditingTask(null);
    } else {
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        agentId: taskForm.agentId || (agents[0]?.id || ''),
        title: taskForm.title,
        description: taskForm.description,
        status: 'PENDING',
        location: { lat: 40.71 + (Math.random() - 0.5) * 0.05, lng: -74.00 + (Math.random() - 0.5) * 0.05, address: taskForm.address }
      };
      setTasks(prev => [...prev, newTask]);
    }
    setTaskForm({ title: '', agentId: '', description: '', address: '' });
  };

  const deleteTask = (id: string) => {
    if (window.confirm('Delete this task?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  // Calculation for reports
  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const pendingCount = tasks.filter(t => t.status === 'PENDING').length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-blue-400">{ICONS.Map}</span>
            <h2 className="text-xl font-bold tracking-tight">GeoForce Admin</h2>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('map')}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${activeTab === 'map' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            {ICONS.Map} <span>Live Track</span>
          </button>
          <button 
            onClick={() => setActiveTab('agents')}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${activeTab === 'agents' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            {ICONS.Users} <span>Agents List</span>
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${activeTab === 'tasks' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            {ICONS.Tasks} <span>Task Manager</span>
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${activeTab === 'reports' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            {ICONS.Stats} <span>Insights</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center space-x-2">
              <img src={`https://picsum.photos/seed/${user.id}/32/32`} className="w-8 h-8 rounded-full border border-slate-700" alt="Admin" />
              <div className="text-xs">
                <p className="font-semibold">{user.name}</p>
                <p className="text-slate-500">Manager</p>
              </div>
            </div>
            <button onClick={onLogout} className="text-slate-400 hover:text-red-400">
              {ICONS.Logout}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <h1 className="text-lg font-bold text-slate-800 capitalize">
            {activeTab === 'map' ? 'Live GPS Tracking' : `${activeTab} Management`}
          </h1>
          <div className="flex items-center space-x-4">
             <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{ICONS.Search}</span>
                <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-64" />
             </div>
             <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
                {ICONS.Alerts}
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'map' && (
            <div className="h-full flex flex-col space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm">Active Agents</p>
                    <h3 className="text-2xl font-bold text-emerald-600">{agents.filter(a => a.status !== AgentStatus.OFFLINE).length}</h3>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">{ICONS.Users}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm">Tasks in Progress</p>
                    <h3 className="text-2xl font-bold text-blue-600">{tasks.filter(t => t.status === 'IN_PROGRESS').length}</h3>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg text-blue-600">{ICONS.Tasks}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm">Completed Today</p>
                    <h3 className="text-2xl font-bold text-slate-800">{tasks.filter(t => t.status === 'COMPLETED').length}</h3>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-slate-600">{ICONS.Check}</div>
                </div>
              </div>
              <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
                <MapComponent agents={agents} tasks={tasks} />
              </div>
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold">Managed Field Staff</h3>
                <button 
                  onClick={() => { setEditingAgent(null); setAgentForm({ name: '', status: AgentStatus.ONLINE }); setShowAgentModal(true); }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                >
                  {ICONS.Plus} <span>Add New Agent</span>
                </button>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4">Agent Name</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Battery</th>
                    <th className="px-6 py-4">Last Sync</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {agents.length === 0 ? (
                    <tr><td colSpan={5} className="p-10 text-center text-slate-400 italic">No agents registered.</td></tr>
                  ) : agents.map(agent => (
                    <tr key={agent.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img src={`https://picsum.photos/seed/${agent.id}/40/40`} className="w-10 h-10 rounded-full border border-slate-200" />
                          <div className="text-sm">
                            <p className="font-bold text-slate-900">{agent.name}</p>
                            <p className="text-slate-400 text-xs">ID: {agent.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          agent.status === AgentStatus.ONLINE ? 'bg-emerald-100 text-emerald-700' :
                          agent.status === AgentStatus.ON_DUTY ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {agent.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${agent.batteryLevel! < 20 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${agent.batteryLevel}%` }}></div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">{agent.batteryLevel}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(agent.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setEditingAgent(agent); setAgentForm({ name: agent.name, status: agent.status }); setShowAgentModal(true); }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button 
                            onClick={() => deleteAgent(agent.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="bg-white p-6 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold">Active & Pending Tasks</h3>
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold">{tasks.filter(t => t.status !== 'COMPLETED').length} Total</span>
                  </div>
                  <div className="space-y-3">
                    {tasks.filter(t => t.status !== 'COMPLETED').length === 0 ? (
                      <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-lg text-slate-400">No active tasks.</div>
                    ) : tasks.filter(t => t.status !== 'COMPLETED').map(task => (
                      <div key={task.id} className="group p-4 border border-slate-100 rounded-lg bg-slate-50 hover:bg-white hover:shadow-md hover:border-blue-200 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-slate-900">{task.title}</h4>
                            <p className="text-[10px] text-blue-600 font-bold uppercase">Assigned to: {agents.find(a => a.id === task.agentId)?.name || 'Unknown'}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                             <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                               task.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                             }`}>
                               {task.status}
                             </span>
                             <button onClick={() => deleteTask(task.id)} className="p-1 text-slate-300 hover:text-red-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                             </button>
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 mb-3">{task.description}</p>
                        <div className="flex items-center text-[10px] text-slate-400 font-bold">
                           <span className="flex items-center">{ICONS.Navigation} <span className="ml-1">{task.location.address}</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="bg-white p-6 rounded-xl border border-slate-200 sticky top-0 h-fit">
                  <h3 className="font-bold mb-4">{editingTask ? 'Edit Task' : 'Assign New Task'}</h3>
                  <form onSubmit={handleSaveTask} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Task Title</label>
                      <input 
                        required 
                        value={taskForm.title} 
                        onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                        type="text" 
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" 
                        placeholder="e.g., Deliver Package #102" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assign Agent</label>
                        <select 
                          required
                          value={taskForm.agentId}
                          onChange={e => setTaskForm({...taskForm, agentId: e.target.value})}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                        >
                          <option value="">Select Agent...</option>
                          {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Address</label>
                        <input 
                          required 
                          value={taskForm.address} 
                          onChange={e => setTaskForm({...taskForm, address: e.target.value})}
                          type="text" 
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" 
                          placeholder="Wall St, NY" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Work Description</label>
                      <textarea 
                        required
                        value={taskForm.description}
                        onChange={e => setTaskForm({...taskForm, description: e.target.value})}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none h-24 text-sm" 
                        placeholder="Details of the task..."
                      ></textarea>
                    </div>
                    <div className="flex space-x-3">
                      <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                        {editingTask ? 'Update Task' : 'Create & Assign'}
                      </button>
                      {editingTask && (
                        <button 
                          type="button" 
                          onClick={() => { setEditingTask(null); setTaskForm({ title: '', agentId: '', description: '', address: '' }); }}
                          className="px-4 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
               </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                 {/* KPI Cards */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total Tasks</p>
                    <h3 className="text-3xl font-extrabold text-slate-900">{tasks.length}</h3>
                    <div className="mt-2 flex items-center text-emerald-500 text-xs font-bold">
                       <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
                       <span>12% from last week</span>
                    </div>
                 </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">Completion Rate</p>
                    <h3 className="text-3xl font-extrabold text-blue-600">{completionRate}%</h3>
                    <div className="mt-3 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500" style={{ width: `${completionRate}%` }}></div>
                    </div>
                 </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">Avg. Response Time</p>
                    <h3 className="text-3xl font-extrabold text-slate-900">42m</h3>
                    <p className="text-slate-400 text-[10px] mt-1 italic">Target: Under 60m</p>
                 </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">On Duty Now</p>
                    <h3 className="text-3xl font-extrabold text-emerald-600">{agents.filter(a => a.status === AgentStatus.ON_DUTY).length}</h3>
                    <p className="text-slate-400 text-[10px] mt-1">Total Agents: {agents.length}</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                 {/* Simulated Bar Chart: Weekly Productivity */}
                 <div className="bg-white p-8 rounded-2xl border border-slate-200">
                    <div className="flex justify-between items-center mb-8">
                       <h3 className="font-bold text-slate-800">Weekly Task Productivity</h3>
                       <select className="text-xs bg-slate-50 border-none outline-none font-bold text-slate-500">
                          <option>Last 7 Days</option>
                          <option>Last 30 Days</option>
                       </select>
                    </div>
                    <div className="flex items-end justify-between h-48 px-2">
                       {[65, 45, 80, 55, 90, 40, 75].map((val, i) => (
                          <div key={i} className="w-10 flex flex-col items-center group">
                             <div className="w-full bg-blue-100 rounded-t-lg group-hover:bg-blue-600 transition-colors relative" style={{ height: `${val}%` }}>
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                   {val}
                                </div>
                             </div>
                             <span className="mt-4 text-[10px] font-bold text-slate-400 uppercase">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                             </span>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Task Status Distribution */}
                 <div className="bg-white p-8 rounded-2xl border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-8">Task Status Distribution</h3>
                    <div className="flex items-center space-x-12">
                       <div className="relative w-40 h-40">
                          {/* Simulated SVG Donut */}
                          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                             <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#f1f5f9" strokeWidth="4"></circle>
                             <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#3b82f6" strokeWidth="4" strokeDasharray={`${completionRate} 100`}></circle>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                             <span className="text-xl font-black text-slate-800">{completionRate}%</span>
                             <span className="text-[10px] text-slate-400 font-bold uppercase">Success</span>
                          </div>
                       </div>
                       <div className="flex-1 space-y-4">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="text-sm font-medium text-slate-600">Completed</span>
                             </div>
                             <span className="font-bold text-slate-800">{completedCount}</span>
                          </div>
                          <div className="flex items-center justify-between">
                             <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                                <span className="text-sm font-medium text-slate-600">Pending</span>
                             </div>
                             <span className="font-bold text-slate-800">{pendingCount}</span>
                          </div>
                          <div className="flex items-center justify-between">
                             <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                                <span className="text-sm font-medium text-slate-600">In Progress</span>
                             </div>
                             <span className="font-bold text-slate-800">{inProgressCount}</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Performance Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                 <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold">Top Performing Agents</h3>
                    <button className="text-blue-600 text-xs font-bold hover:underline">Download CSV Report</button>
                 </div>
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                          <th className="px-6 py-4">Agent</th>
                          <th className="px-6 py-4">Tasks Done</th>
                          <th className="px-6 py-4">Productivity Score</th>
                          <th className="px-6 py-4">Avg Completion Time</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {agents.slice(0, 5).map((agent, i) => (
                          <tr key={agent.id} className="hover:bg-slate-50 transition-colors">
                             <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                   <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                                      {agent.name.charAt(0)}
                                   </div>
                                   <span className="text-sm font-bold text-slate-900">{agent.name}</span>
                                </div>
                             </td>
                             <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                {Math.floor(Math.random() * 20) + 5} tasks
                             </td>
                             <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                   <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                      <div className={`h-full ${i === 0 ? 'bg-emerald-500' : 'bg-blue-400'}`} style={{ width: `${95 - i * 8}%` }}></div>
                                   </div>
                                   <span className="text-xs font-bold">{95 - i * 8}%</span>
                                </div>
                             </td>
                             <td className="px-6 py-4 text-sm text-slate-500">
                                {40 + i * 5} mins
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Agent Modal */}
      {showAgentModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="font-bold text-lg">{editingAgent ? 'Edit Agent' : 'Register Agent'}</h3>
                 <button onClick={() => setShowAgentModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              <form onSubmit={handleSaveAgent} className="p-6 space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                    <input 
                      required 
                      value={agentForm.name} 
                      onChange={e => setAgentForm({...agentForm, name: e.target.value})}
                      type="text" 
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                      placeholder="e.g. Robert Brown" 
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Initial Status</label>
                    <select 
                      value={agentForm.status}
                      onChange={e => setAgentForm({...agentForm, status: e.target.value as AgentStatus})}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                      <option value={AgentStatus.ONLINE}>Online</option>
                      <option value={AgentStatus.OFFLINE}>Offline</option>
                      <option value={AgentStatus.ON_DUTY}>On Duty</option>
                    </select>
                 </div>
                 <div className="pt-4 flex space-x-3">
                    <button type="button" onClick={() => setShowAgentModal(false)} className="flex-1 py-3 font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                    <button type="submit" className="flex-1 py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors">
                      {editingAgent ? 'Save Changes' : 'Register Agent'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
