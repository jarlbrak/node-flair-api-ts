import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { EmptyBodyError, ApiError } from './errors';
import { Model, ResourceAttributes, ResourceRelationships } from './models/model';

export interface Token {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export class Client {
  private client_id: string;
  private client_secret: string;
  private currentToken?: Token;
  private client: AxiosInstance;

  private static readonly DEFAULT_HEADERS = {
    'Accept': 'application/vnd.api+json',
    'Content-Type': 'application/json',
  };

  /**
   * Creates a new Flair API client using client credentials authentication
   * @param client_id - OAuth2 client ID
   * @param client_secret - OAuth2 client secret
   */
  constructor(client_id: string, client_secret: string) {
    this.client_id = client_id;
    this.client_secret = client_secret;

    this.client = axios.create({
      baseURL: 'https://api.flair.co',
      headers: Client.DEFAULT_HEADERS,
    });
  }

  /**
   * Gets an OAuth2 access token using client credentials flow
   */
  private async getAccessToken(): Promise<Token> {
    const response = await this.client.post('/oauth/token', {
      client_id: this.client_id,
      client_secret: this.client_secret,
      grant_type: 'client_credentials',
    });
    
    if (response.status !== 200) {
      throw new Error('Getting access token failed.');
    }
    
    return (this.currentToken = response.data as Token);
  }

  /**
   * Ensures we have a valid access token, fetching one if needed
   */
  private async ensureAccessToken(): Promise<void> {
    if (!this.currentToken) {
      await this.getAccessToken();
    }
  }

  /**
   * Updates the client with current authorization header
   */
  private async updateClient() {
    await this.ensureAccessToken();
    this.client.defaults.headers.common.Authorization =
      `${this.currentToken!.token_type} ${this.currentToken!.access_token}`;
  }

  /**
   * Handles API responses with proper error handling and data extraction
   */
  private handleResponse(response: AxiosResponse): any {
    const { status, data } = response;

    // Handle successful responses
    if (status >= 200 && status < 300 && status !== 204) {
      // Check for empty data in successful responses
      if (data && data.data === null) {
        throw new EmptyBodyError(response);
      }
      return data;
    }
    
    // Handle no content responses
    if (status === 204) {
      return null;
    }

    // Handle error responses
    if (status >= 400) {
      throw new ApiError(response);
    }

    return data;
  }

  /**
   * Constructs resource URL for API endpoints
   */
  private resourceUrl(resourceType: string, id?: string): string {
    let path = `/api/${resourceType}`;
    if (id) {
      path += `/${id}`;
    }
    return path;
  }

  /**
   * Converts relationships to JSON-API format
   */
  private toRelationshipDict(relationships: ResourceRelationships): any {
    const result: any = {};
    for (const [key, value] of Object.entries(relationships)) {
      if (Array.isArray(value)) {
        result[key] = {
          data: value.map(item => 
            item instanceof Model ? item.toRelationship() : item,
          ),
        };
      } else if (value instanceof Model) {
        result[key] = { data: value.toRelationship() };
      } else if (value) {
        result[key] = { data: value };
      }
    }
    return result;
  }

  /**
   * Generic GET method for any resource type
   */
  public async get<T extends Model>(resourceType: string, id?: string): Promise<T | T[]> {
    try {
      await this.updateClient();
      const url = this.resourceUrl(resourceType, id);
      const response = await this.client.get(url);
      const responseData = this.handleResponse(response);

      if (Array.isArray(responseData.data)) {
        // Return array of resources
        return responseData.data.map((item: any) => {
          const instance = this.createModelInstance<T>(item);
          return instance;
        });
      } else {
        // Return single resource
        return this.createModelInstance<T>(responseData.data);
      }
    } catch (error: any) {
      if (error.response) {
        throw new ApiError(error.response);
      }
      throw error;
    }
  }

  /**
   * Generic POST method for creating resources
   */
  public async create<T extends Model>(
    resourceType: string, 
    attributes: ResourceAttributes = {}, 
    relationships: ResourceRelationships = {},
  ): Promise<T> {
    try {
      await this.updateClient();
      const url = this.resourceUrl(resourceType);
      
      const requestBody = {
        data: {
          type: resourceType,
          attributes,
          relationships: this.toRelationshipDict(relationships),
        },
      };

      const response = await this.client.post(url, requestBody);
      const responseData = this.handleResponse(response);
      return this.createModelInstance<T>(responseData.data);
    } catch (error: any) {
      if (error.response) {
        throw new ApiError(error.response);
      }
      throw error;
    }
  }

  /**
   * Generic PATCH method for updating resources
   */
  public async update<T extends Model>(
    resourceType: string,
    id: string,
    attributes: ResourceAttributes = {},
    relationships: ResourceRelationships = {},
  ): Promise<T> {
    try {
      await this.updateClient();
      const url = this.resourceUrl(resourceType, id);
      
      const requestBody = {
        data: {
          id,
          type: resourceType,
          attributes,
          relationships: this.toRelationshipDict(relationships),
        },
      };

      const response = await this.client.patch(url, requestBody);
      const responseData = this.handleResponse(response);
      return this.createModelInstance<T>(responseData.data);
    } catch (error: any) {
      if (error.response) {
        throw new ApiError(error.response);
      }
      throw error;
    }
  }

  /**
   * Generic DELETE method for removing resources
   */
  public async delete(resourceType: string, id: string): Promise<void> {
    try {
      await this.updateClient();
      const url = this.resourceUrl(resourceType, id);
      const response = await this.client.delete(url);
      this.handleResponse(response);
    } catch (error: any) {
      if (error.response) {
        throw new ApiError(error.response);
      }
      throw error;
    }
  }

  /**
   * Creates a model instance from API response data
   */
  private createModelInstance<T extends Model>(data: any): T {
    // This is a simplified implementation - in a real app, you'd have a registry
    // of model classes mapped to resource types
    const instance = new Model() as any;
    instance.id = data.id;
    instance.attributes = data.attributes || {};
    instance.relationships = data.relationships || {};
    instance.setClient(this);
    
    // Copy attributes to instance for backward compatibility
    if (data.attributes) {
      Object.assign(instance, data.attributes);
    }
    
    return instance as T;
  }


}
