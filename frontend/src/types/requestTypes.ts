// File: frontend/src/types/requestTypes.ts
export type StatusFilter = 'new' | 'in_progress' | 'done';
export type PriorityFilter = 'low' | 'normal' | 'high';

export interface Request {
    id: number;
    title: string;
    description?: string;
    status: StatusFilter;
    priority: PriorityFilter;
    created_at: string; // Treat as ISO date string for frontend display
    updated_at: string;
}

interface PaginatedResult {
    data: Request[];
    total_items: number;
    total_pages: number;
    current_page: number;
    page_size: number;
}