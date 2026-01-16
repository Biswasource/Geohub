
import React, { useEffect, useRef } from 'react';
import { Agent, Task, AgentStatus } from '../types';

declare const L: any;

interface MapComponentProps {
  agents: Agent[];
  tasks: Task[];
}

const MapComponent: React.FC<MapComponentProps> = ({ agents, tasks }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Initialize map
    mapInstanceRef.current = L.map(mapContainerRef.current).setView([40.7128, -74.0060], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Update Agent Markers
    agents.forEach(agent => {
      if (!agent.lastLocation) return;

      let marker = markersRef.current.get(agent.id);
      const iconColor = agent.status === AgentStatus.ONLINE ? '#10b981' : (agent.status === AgentStatus.ON_DUTY ? '#3b82f6' : '#94a3b8');
      
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${iconColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3)"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      if (marker) {
        marker.setLatLng([agent.lastLocation.lat, agent.lastLocation.lng]);
      } else {
        marker = L.marker([agent.lastLocation.lat, agent.lastLocation.lng], { icon: customIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`<b>${agent.name}</b><br>Status: ${agent.status}`);
        markersRef.current.set(agent.id, marker);
      }
    });

    // Update Task Markers
    tasks.forEach(task => {
      const taskId = `task-${task.id}`;
      if (markersRef.current.has(taskId)) return;

      const taskIcon = L.divIcon({
        className: 'custom-task-icon',
        html: `<div style="background-color: #f59e0b; width: 14px; height: 14px; transform: rotate(45deg); border: 2px solid white;"></div>`,
        iconSize: [14, 14]
      });

      const marker = L.marker([task.location.lat, task.location.lng], { icon: taskIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`<b>Task: ${task.title}</b><br>${task.location.address}`);
      markersRef.current.set(taskId, marker);
    });
  }, [agents, tasks]);

  return <div ref={mapContainerRef} className="h-full w-full" />;
};

export default MapComponent;
