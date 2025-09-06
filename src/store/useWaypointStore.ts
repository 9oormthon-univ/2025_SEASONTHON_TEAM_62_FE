import { create } from 'zustand';

type Waypoint = [number, number];

interface WaypointState {
  waypoints: Waypoint[];
  setWaypoints: (newWaypoints: Waypoint[]) => void;
  clearWaypoints: () => void;
}

const useWaypointStore = create<WaypointState>((set) => ({
  waypoints: [],
  setWaypoints: (newWaypoints) => set({ waypoints: newWaypoints }),
  clearWaypoints: () => set({ waypoints: [] }),
}));

export default useWaypointStore;
