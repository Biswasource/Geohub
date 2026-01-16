
import React from 'react';
import { 
  Users, 
  Map as MapIcon, 
  ClipboardList, 
  Settings, 
  Bell, 
  LogOut, 
  Navigation, 
  CheckCircle, 
  Clock, 
  Camera, 
  BarChart3,
  Search,
  Plus
} from 'lucide-react';

export const COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  dark: '#1e293b',
};

export const MOCK_AGENTS: any[] = [
  { id: '1', name: 'John Doe', status: 'ONLINE', battery: 85, lastLat: 40.7128, lastLng: -74.0060 },
  { id: '2', name: 'Jane Smith', status: 'ON_DUTY', battery: 42, lastLat: 40.7282, lastLng: -73.7949 },
  { id: '3', name: 'Mike Ross', status: 'OFFLINE', battery: 12, lastLat: 40.7589, lastLng: -73.9851 },
];

export const ICONS = {
  Users: <Users className="w-5 h-5" />,
  Map: <MapIcon className="w-5 h-5" />,
  Tasks: <ClipboardList className="w-5 h-5" />,
  Stats: <BarChart3 className="w-5 h-5" />,
  Settings: <Settings className="w-5 h-5" />,
  Alerts: <Bell className="w-5 h-5" />,
  Logout: <LogOut className="w-5 h-5" />,
  Navigation: <Navigation className="w-5 h-5" />,
  Check: <CheckCircle className="w-5 h-5" />,
  Clock: <Clock className="w-5 h-5" />,
  Camera: <Camera className="w-5 h-5" />,
  Search: <Search className="w-4 h-4" />,
  Plus: <Plus className="w-4 h-4" />,
};
