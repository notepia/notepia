export type ViewType = 'map' | 'calendar';
export type ViewObjectType = 'calendar_slot' | 'map_marker';

export interface View {
  id: string;
  workspace_id: string;
  name: string;
  type: ViewType;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export interface CreateViewRequest {
  name: string;
  type: ViewType;
}

export interface UpdateViewRequest {
  name?: string;
  type?: ViewType;
}

export interface ViewObject {
  id: string;
  view_id: string;
  name: string;
  type: ViewObjectType;
  data: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export interface CreateViewObjectRequest {
  name: string;
  type: ViewObjectType;
  data?: string;
}

export interface UpdateViewObjectRequest {
  name?: string;
  type?: ViewObjectType;
  data?: string;
}