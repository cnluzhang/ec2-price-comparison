/**
 * Common types used throughout the application
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
}

export interface ErrorResponse {
  code: string;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
