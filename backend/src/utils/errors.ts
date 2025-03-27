import { ApiError } from '../middleware/error.middleware';

/**
 * Error handling utilities
 */

/**
 * Create a bad request error
 * @param message Error message
 * @returns ApiError with 400 status code
 */
export const createBadRequestError = (message: string): ApiError => {
  return new ApiError(400, 'BAD_REQUEST', message);
};

/**
 * Create a not found error
 * @param message Error message
 * @returns ApiError with 404 status code
 */
export const createNotFoundError = (message: string): ApiError => {
  return new ApiError(404, 'NOT_FOUND', message);
};

/**
 * Create a server error
 * @param message Error message
 * @returns ApiError with 500 status code
 */
export const createServerError = (message: string): ApiError => {
  return new ApiError(500, 'INTERNAL_SERVER_ERROR', message);
};

/**
 * Create an unauthorized error
 * @param message Error message
 * @returns ApiError with 401 status code
 */
export const createUnauthorizedError = (message: string): ApiError => {
  return new ApiError(401, 'UNAUTHORIZED', message);
};

/**
 * Create a forbidden error
 * @param message Error message
 * @returns ApiError with 403 status code
 */
export const createForbiddenError = (message: string): ApiError => {
  return new ApiError(403, 'FORBIDDEN', message);
};