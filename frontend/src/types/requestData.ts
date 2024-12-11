export interface RequestDataPayload {
  table_name: string;
  old_values: Record<string, unknown>;
  new_values: Record<string, unknown>;
  maker_id: number;
  comments?: string;
}
