export enum RequestStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  DONE = 'done'
}

export enum RequestPriority {
  LOW = 'low',
  MEDIUM = 'normal',
  HIGH = 'high'
}

export interface ServiceRequest  {
  id: number;
  title: string;
  description: string;
  status: RequestStatus;
  priority: RequestPriority;
  created_at: string;
  updated_at: string;
}

export interface RequestCreate {
  title: string;
  description: string;
  status: RequestStatus;
  priority: RequestPriority;
}

export interface RequestUpdate {
  status?: RequestStatus;
  priority?: RequestPriority;
}

export interface PaginatedRequests {
  total_items: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  data: ServiceRequest [];
}

export interface RequestFilters {
  status?: RequestStatus;
  priority?: RequestPriority;
  search?: string;
  sort?: string;
  skip?: number;
  limit?: number;
}

export interface ErrorResponse {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}