
import React, { useState, useEffect, useRef } from 'react';
import { ICONS } from '../constants';
import { AgentStatus, Task } from '../types';

interface AgentAppProps {
  user: any;
  onLogout: () => void;
}

interface DayRecord {
  date: string;
  distance: string;
  tasksCompleted: number;
}

const AgentApp: React.FC<AgentAppProps> = ({ user, onLogout }) => {
  const [onDuty, setOnDuty] = useState(false);
  const [lastLocation, setLastLocation] = useState<GeolocationCoordinates | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'profile' | 'history'>('tasks');
  const [tasks, setTasks] = useState<Task[]>([
    { id: 't1', agentId: user.id, title: 'Check Inventory - Store B', description: 'Count SKU items in aisle 4', status: 'PENDING', location: { lat: 40.71, lng: -74, address: 'Broadway, NY' } }
  ]);
  const [showCamera, setShowCamera] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mock past days history
  const [pastDaysHistory] = useState<DayRecord[]>([
    { date: 'Oct 24, 2025', distance: '12.4 km', tasksCompleted: 4 },
    { date: 'Oct 23, 2025', distance: '8.2 km', tasksCompleted: 3 },
    { date: 'Oct 22, 2025', distance: '15.7 km', tasksCompleted: 6 },
    { date: 'Oct 21, 2025', distance: '10.1 km', tasksCompleted: 5 },
  ]);

  // GPS Tracking Simulation or Real if available
  useEffect(() => {
    let watchId: number;
    if (onDuty && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => setLastLocation(pos.coords),
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
    }
    return () => navigator.geolocation.clearWatch(watchId);
  }, [onDuty]);

  const toggleDuty = () => {
    setOnDuty(!onDuty);
    // In real app, send update to server
  };

  const handleTaskAction = (taskId: string, action: 'START' | 'PROOF') => {
    if (action === 'PROOF') {
      setActiveTaskId(taskId);
      setShowCamera(true);
      startCamera();
    } else {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'IN_PROGRESS', checkInTime: Date.now() } : t));
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) {
      console.error("Camera access denied", e);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && activeTaskId) {
      const context = canvasRef.current.getContext('2d');
      context?.drawImage(videoRef.current, 0, 0, 320, 240);
      // Close camera
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setShowCamera(false);
      
      setTasks(prev => prev.map(t => 
        t.id === activeTaskId ? { ...t, status: 'COMPLETED', checkOutTime: Date.now() } : t
      ));
      
      setActiveTaskId(null);
      alert("Proof captured and task completed!");
    }
  };

  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

  return (
    <div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden">
      {/* Mobile Header */}
      <header className="bg-slate-900 text-white p-5 flex justify-between items-center shadow-lg shrink-0">
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Agent Console</p>
          <h2 className="text-xl font-bold">{user.name}</h2>
        </div>
        <button onClick={onLogout} className="p-2 bg-slate-800 rounded-lg text-slate-400">
          {ICONS.Logout}
        </button>
      </header>

      {/* Main App Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-6">
        {/* Status Card */}
        <div className={`p-6 rounded-2xl shadow-sm border transition-all ${onDuty ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${onDuty ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
              <span className={`font-bold ${onDuty ? 'text-emerald-700' : 'text-slate-500'}`}>
                {onDuty ? 'ON DUTY' : 'OFF DUTY'}
              </span>
            </div>
            <button 
              onClick={toggleDuty}
              className={`px-6 py-2 rounded-full font-bold shadow-md transition-all active:scale-95 ${onDuty ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}
            >
              {onDuty ? 'End Duty' : 'Start Duty'}
            </button>
          </div>
          
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center">
              {ICONS.Navigation}
              <span className="ml-2">{lastLocation ? `${lastLocation.latitude.toFixed(4)}, ${lastLocation.longitude.toFixed(4)}` : 'Waiting for GPS...'}</span>
            </div>
            <div className="flex items-center">
              {ICONS.Clock}
              <span className="ml-2">Shift: {onDuty ? '02:45h' : '00:00h'}</span>
            </div>
          </div>
        </div>

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              {ICONS.Tasks} <span className="ml-2">Active Tasks</span>
            </h3>
            {tasks.filter(t => t.status !== 'COMPLETED').length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                <p className="text-slate-500 italic">No active tasks assigned.</p>
              </div>
            ) : (
              tasks.filter(t => t.status !== 'COMPLETED').map(task => (
                <div key={task.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-start mb-2">
                     <h4 className="font-bold text-slate-900">{task.title}</h4>
                     <span className={`text-[10px] px-2 py-1 rounded font-bold ${
                       task.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                     }`}>{task.status}</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">{task.description}</p>
                  <div className="text-xs text-slate-400 mb-4 flex items-center">
                     {ICONS.Navigation} <span className="ml-1">{task.location.address}</span>
                  </div>
                  
                  {task.status === 'PENDING' && (
                    <button 
                      onClick={() => handleTaskAction(task.id, 'START')}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center"
                    >
                      Start Visit
                    </button>
                  )}
                  {task.status === 'IN_PROGRESS' && (
                    <button 
                      onClick={() => handleTaskAction(task.id, 'PROOF')}
                      className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2"
                    >
                      {ICONS.Camera} <span>Check-in Proof</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Task History Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                {ICONS.Tasks} <span className="ml-2">Task History</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4 font-semibold uppercase tracking-wider">Completed Today</p>
              {completedTasks.length === 0 ? (
                <div className="p-10 border-2 border-dashed border-slate-100 rounded-xl text-center">
                  <p className="text-sm text-slate-400 italic">No tasks completed today yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedTasks.map(task => (
                    <div key={task.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-100 hover:shadow-sm transition-all">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-800 text-sm">{task.title}</h4>
                        <div className="flex items-center text-emerald-600">
                          {ICONS.Check}
                        </div>
                      </div>
                      <div className="flex items-start space-x-2 mb-3">
                         <span className="mt-0.5 text-slate-400">{ICONS.Navigation}</span>
                         <p className="text-xs text-slate-500 leading-tight">{task.location.address}</p>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-wide font-bold pt-2 border-t border-slate-100">
                        <span>Completion Time</span>
                        <span className="text-slate-600">{task.checkOutTime ? new Date(task.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Routes Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-slate-800 flex items-center">
                   {ICONS.Map} <span className="ml-2">Past Routes</span>
                 </h3>
                 <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Last 7 Days</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">Automated logs of your daily field movements.</p>
              <div className="space-y-6">
                 {pastDaysHistory.map((day, idx) => (
                    <div key={idx} className="border-l-2 border-slate-200 pl-5 relative group">
                       <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-colors"></div>
                       <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{day.date}</p>
                          <span className="text-[10px] font-black text-slate-300"># {pastDaysHistory.length - idx}</span>
                       </div>
                       <div className="bg-slate-50 p-3 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                          <p className="text-sm font-bold text-slate-700">{day.distance} traveled</p>
                          <div className="flex items-center space-x-2 mt-1">
                             <span className="text-emerald-500">{ICONS.Check}</span>
                             <span className="text-xs text-slate-500 font-medium">{day.tasksCompleted} tasks completed</span>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Camera Modal Overlay */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-auto bg-slate-900" />
            <canvas ref={canvasRef} width="320" height="240" className="hidden" />
          </div>
          <div className="p-8 flex justify-between items-center bg-black/50">
            <button onClick={() => { setShowCamera(false); setActiveTaskId(null); }} className="text-white">Cancel</button>
            <button onClick={capturePhoto} className="w-16 h-16 rounded-full bg-white border-4 border-slate-300 active:scale-90 transition-transform"></button>
            <div className="w-10"></div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="h-20 bg-white border-t border-slate-200 fixed bottom-0 left-0 right-0 flex items-center justify-around px-6 shrink-0 z-40">
        <button onClick={() => setActiveTab('tasks')} className={`flex flex-col items-center space-y-1 ${activeTab === 'tasks' ? 'text-blue-600' : 'text-slate-400'}`}>
          {ICONS.Tasks}
          <span className="text-[10px] font-bold">Tasks</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center space-y-1 ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-400'}`}>
          {ICONS.Stats}
          <span className="text-[10px] font-bold">History</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center space-y-1 ${activeTab === 'profile' ? 'text-blue-600' : 'text-slate-400'}`}>
          {ICONS.Users}
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default AgentApp;
