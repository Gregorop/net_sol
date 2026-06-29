export interface Request {
    id: number;
    title: string;
    description?: string;
    status: 'new' | 'in_progress' | 'done';
    priority: 'low' | 'normal' | 'high';
    created_at: string;
    updated_at: string;
  }
  
  export interface RequestCreate {
    title: string;
    description?: string;
    status: 'new' | 'in_progress';
    priority: 'low' | 'normal' | 'high';
  }
  
  export interface RequestUpdate {
    status: 'new' | 'in_progress' | 'done';
  }
  
  export interface PaginatedResponse {
    total_items: number;
    total_pages: number;
    current_page: number;
    page_size: number;
    data: Request[];
  }
  
  export interface Filters {
    status?: string;
    priority?: string;
    search?: string;
    sort_by: 'created_at' | 'priority';
    sort_desc: boolean;
    page: number;
    limit: number;
  }