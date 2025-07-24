import { AxiosResponse } from 'axios';

/**
 * Error thrown when API returns successful response (200/201) but with empty data
 */
export class EmptyBodyError extends Error {
  public readonly statusCode: number;

  constructor(response: AxiosResponse) {
    super(`${EmptyBodyError.name}<HTTP Response: ${response.status}>`);
    this.name = 'EmptyBodyError';
    this.statusCode = response.status;
  }
}

/**
 * Error thrown when API returns error response (status >= 400)
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly body: string;
  public readonly json: any;

  constructor(response: AxiosResponse) {
    super(`${ApiError.name}<HTTP Response: ${response.status}>`);
    this.name = 'ApiError';
    this.statusCode = response.status;
    this.body = response.data as string;
    
    try {
      this.json = typeof response.data === 'object' ? response.data : JSON.parse(response.data);
    } catch (error) {
      this.json = null;
    }
  }
}