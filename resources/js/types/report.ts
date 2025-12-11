/**
 * Report Types
 */

export type ReportType =
    | 'inventory_summary'
    | 'user_assignments'
    | 'item_history'
    | 'financial'
    | 'maintenance'
    | 'disposal'
    | 'utilization'
    | 'activity';

export type ExportFormat = 'excel' | 'pdf' | 'csv';

export interface ReportDefinition {
    key: ReportType;
    name: string;
    title: string;
    description: string;
}

export interface ReportFilter {
    type: 'date' | 'select' | 'text';
    label: string;
    default?: string | number;
    options?: Record<string, string>;
}

export interface ReportData {
    name: string;
    title: string;
    description: string;
    data: Array<Record<string, unknown>>;
    columns: Record<string, string>;
    summary: Record<string, unknown>;
    filters: Record<string, unknown>;
    available_filters: Record<string, ReportFilter>;
    generated_at: string;
}

export interface ReportExportRequest {
    format: ExportFormat;
    filters: Record<string, unknown>;
}
