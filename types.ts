
export type UserRole = 'ADMIN' | 'AGENT';

export enum AgentStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  ON_DUTY = 'ON_DUTY',
}

export interface Location {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  lastLocation?: Location;
  routeHistory: Location[];
  batteryLevel?: number;
  lastUpdated: number;
}

export interface Task {
  id: string;
  agentId: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  location: { lat: number; lng: number; address: string };
  checkInTime?: number;
  checkOutTime?: number;
  proofImageUrl?: string;
}

export interface Attendance {
  id: string;
  agentId: string;
  date: string;
  startTime: number;
  endTime?: number;
  startLocation: Location;
  endLocation?: Location;
}
