

export interface ChangeTrackerData {
    request_id: string;
    id?: string;
    maker?: string;
    created_at: string;
    comments?: string;
    table_name: string;
    status: 'pending' | 'approved' | 'rejected';
    new_data?: Record<string, unknown>;
    old_data?: Record<string, unknown>;
}

export interface ChangeTrackerResponse {
    success: boolean;
    message: string;
    data: ChangeTrackerData[];
}

export interface ApproveRejectResponse {
    success: boolean;
    message: string;
    data?: unknown;
}

