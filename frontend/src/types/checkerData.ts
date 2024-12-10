// export interface ChangeTrackerResponse {
//     success: boolean;
//     message: string;
//     data: ChangeTrackerData[];
// }

// export interface ChangeTrackerData {
//     id: number;
//     table_name: string;
//     old_values: Record<string, unknown>;
//     new_values: Record<string, unknown>;
//     maker_id: number;
//     row_id: number;
//     comments: string;
//     status: 'pending' | 'approved' | 'rejected';
//     created_at: string;
//     updated_at: string;
//     maker_name?: string;
// }

// export interface ApproveRejectResponse {
//     success: boolean;
//     message: string;
//     data?: unknown;
// }

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


// export interface TableData {
//     name: string;
//     changes: Change[];
// }

// export interface Change {
//     id: number;
//     user: string;
//     dateTime: string;
//     reason: string;
//     changes: ColumnChange[];
//     fullRow: Record<string, string>;
//     tableName: string;
//     status: 'pending' | 'approved' | 'rejected';
//     newValues?: Record<string, any>;
//     oldValues?: Record<string, any>;
//     rowData?: Record<string, string>;
//     rowId?: number;
// }

// export interface ColumnChange {
//     column: string;
//     oldValue: string;
//     newValue: string;
// }
