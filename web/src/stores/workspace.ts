import { create } from 'zustand';
import { getWorkspaces } from '../api/workspace';

export interface Workspace {
  id: string;
  name: string;
}

interface WorkspaceStore {
  workspaces: Workspace[];
  fetchWorkspaces: () => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  workspaces: [],
  fetchWorkspaces: async () => {
    try {
      const data = await getWorkspaces();
      set({
        workspaces: data,
      });
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
    }
  },
}));