import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { EmptyBodyError, ApiError } from './errors';
import { Model, ResourceAttributes, ResourceRelationships } from './models/model';
import {
  FlairMode,
  Puck,
  Structure,
  StructureHeatCoolMode,
  User,
  Vent,
  Room,
  HvacUnit,
  HvacMode,
  FanSpeed,
  SwingMode,
  PowerState,
  Thermostat,
  Bridge,
  RemoteSensor,
} from './models';

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
   * Creates a new Flair API client using secure OAuth2 client credentials authentication
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

  /**
   *
   * @returns Promise<[User]>
   */
  public async getUsers(): Promise<[User]> {
    await this.updateClient();
    const response = await this.client.get('/api/users');
    const responseData = this.handleResponse(response);
    //TODO: Paginate
    return responseData.data.map((data: any): User => {
      return new User().fromJSON(data);
    });
  }

  /**
   *
   * @returns
   */
  public async getPucks(): Promise<[Puck]> {
    await this.updateClient();
    const response = await this.client.get('/api/pucks');
    //TODO: Paginate
    return response.data.data.map((data: any): Puck => {
      return new Puck().fromJSON(data);
    });
  }

  /**
   *
   * @returns
   */
  public async getVents(): Promise<[Vent]> {
    await this.updateClient();
    const response = await this.client.get('/api/vents');
    //TODO: Paginate
    return response.data.data.map((data: any): Vent => {
      return new Vent().fromJSON(data);
    });
  }

  /**
   *
   * @param vent
   * @returns
   */
  public async getVentReading(vent: Vent): Promise<Vent> {
    await this.updateClient();
    const response = await this.client.get(
      `/api/vents/${vent.id}/current-reading`,
    );
    vent.setCurrentReading(response.data.data);
    return vent;
  }

  /**
   *
   * @param vent
   * @param percentOpen
   * @returns
   */
  public async setVentPercentOpen(
    vent: Vent,
    percentOpen: number,
  ): Promise<Vent> {
    await this.updateClient();
    const response = await this.client.patch(`/api/vents/${vent.id}`, {
      data: {
        type: 'vents',
        attributes: {
          'percent-open': percentOpen,
        },
        relationships: {},
      },
    });
    vent.fromJSON(response.data.data);
    return vent;
  }

  /**
   *
   * @param puck
   * @returns
   */
  public async getPuckReading(puck: Puck): Promise<Puck> {
    await this.updateClient();
    const response = await this.client.get(
      `/api/pucks/${puck.id}/current-reading`,
    );
    puck.setCurrentReading(response.data.data);
    return puck;
  }

  /**
   *
   * @returns
   */
  public async getRooms(): Promise<[Room]> {
    await this.updateClient();
    const response = await this.client.get('/api/rooms');
    //TODO: Paginate
    return response.data.data.map((data: any): Room => {
      return new Room().fromJSON(data);
    });
  }

  /**
   *
   * @param room
   * @returns
   */
  public async getRoom(room: Room): Promise<Room> {
    await this.updateClient();
    const response = await this.client.get(`/api/rooms/${room.id}`);
    //TODO: Paginate
    return room.fromJSON(response.data.data);
  }

  /**
   *
   * @param room
   * @param setPointC
   * @returns
   */
  public async setRoomSetPoint(room: Room, setPointC: number): Promise<Room> {
    await this.updateClient();
    const response = await this.client.patch(`/api/rooms/${room.id}`, {
      data: {
        type: 'rooms',
        attributes: {
          'set-point-c': setPointC,
        },
        relationships: {},
      },
    });
    room.fromJSON(response.data.data);
    return room;
  }

  /**
   * Sets if you are away in the room
   * @param room
   * @param setAway
   * @returns
   */
  public async setRoomAway(room: Room, setAway: boolean): Promise<Room> {
    await this.updateClient();
    const response = await this.client.patch(`/api/rooms/${room.id}`, {
      data: {
        type: 'rooms',
        attributes: {
          active: !setAway,
        },
        relationships: {},
      },
    });
    room.fromJSON(response.data.data);
    return room;
  }

  /**
   *
   * @returns
   */
  public async getStructures(): Promise<[Structure]> {
    await this.updateClient();
    const response = await this.client.get('/api/structures');
    //TODO: Paginate
    return response.data.data.map((data: any): Structure => {
      return new Structure().fromJSON(data);
    });
  }

  /**
   *
   * @param structure
   * @returns
   */
  public async getStructure(structure: Structure): Promise<Structure> {
    await this.updateClient();
    const response = await this.client.get(`/api/structures/${structure.id}`);
    //TODO: Paginate
    return structure.fromJSON(response.data.data);
  }

  /**
   *
   * @returns
   */
  public async getPrimaryStructure(): Promise<Structure> {
    await this.updateClient();
    return (await this.getStructures()).find((structure: Structure) => {
      return structure.isPrimaryHome();
    })!;
  }

  /**
   * Set the structure mode which usually means auto or manual mode.
   * @param structure
   * @param mode
   * @returns
   */
  public async setStructureMode(
    structure: Structure,
    mode: FlairMode,
  ): Promise<Structure> {
    await this.updateClient();
    const response = await this.client.patch(
      `/api/structures/${structure.id}`,
      {
        data: {
          type: 'structures',
          attributes: {
            mode: mode,
          },
          relationships: {},
        },
      },
    );
    return structure.fromJSON(response.data.data);
  }

  /**
   *
   * @param structure
   * @param mode
   * @returns
   */
  public async setStructureHeatingCoolMode(
    structure: Structure,
    mode: StructureHeatCoolMode,
  ): Promise<Structure> {
    await this.updateClient();
    const response = await this.client.patch(
      `/api/structures/${structure.id}`,
      {
        data: {
          type: 'structures',
          attributes: {
            'structure-heat-cool-mode': mode,
          },
          relationships: {},
        },
      },
    );
    return structure.fromJSON(response.data.data);
  }

  /**
   *
   * @param structure
   * @param setPointC
   * @returns
   */
  public async setStructureSetPoint(
    structure: Structure,
    setPointC: number,
  ): Promise<Structure> {
    await this.updateClient();
    const response = await this.client.patch(
      `/api/structures/${structure.id}`,
      {
        data: {
          type: 'structures',
          attributes: {
            'set-point-temperature-c': setPointC,
          },
          relationships: {},
        },
      },
    );
    structure.fromJSON(response.data.data);
    return structure;
  }

  /**
   * Get all HVAC units
   * @returns Promise<[HvacUnit]>
   */
  public async getHvacUnits(): Promise<[HvacUnit]> {
    await this.updateClient();
    const response = await this.client.get('/api/hvac-units');
    //TODO: Paginate
    return response.data.data.map((data: any): HvacUnit => {
      return new HvacUnit().fromJSON(data);
    });
  }

  /**
   * Get a specific HVAC unit
   * @param hvacUnit
   * @returns Promise<HvacUnit>
   */
  public async getHvacUnit(hvacUnit: HvacUnit): Promise<HvacUnit> {
    await this.updateClient();
    const response = await this.client.get(`/api/hvac-units/${hvacUnit.id}`);
    return hvacUnit.fromJSON(response.data.data);
  }

  /**
   * Set HVAC unit properties
   * @param hvacUnit
   * @param attributes
   * @returns Promise<HvacUnit>
   */
  public async setHvacUnit(
    hvacUnit: HvacUnit,
    attributes: {
      temperature?: number;
      'fan-speed'?: FanSpeed;
      swing?: SwingMode;
      mode?: HvacMode;
      power?: PowerState;
    },
  ): Promise<HvacUnit> {
    await this.updateClient();
    const response = await this.client.patch(
      `/api/hvac-units/${hvacUnit.id}`,
      {
        data: {
          type: 'hvac-units',
          attributes: attributes,
          relationships: {},
        },
      },
    );
    hvacUnit.fromJSON(response.data.data);
    return hvacUnit;
  }

  /**
   * Get all thermostats
   * @returns Promise<[Thermostat]>
   */
  public async getThermostats(): Promise<[Thermostat]> {
    await this.updateClient();
    const response = await this.client.get('/api/thermostats');
    //TODO: Paginate
    return response.data.data.map((data: any): Thermostat => {
      return new Thermostat().fromJSON(data);
    });
  }

  /**
   * Get all bridges
   * @returns Promise<[Bridge]>
   */
  public async getBridges(): Promise<[Bridge]> {
    await this.updateClient();
    const response = await this.client.get('/api/bridges');
    //TODO: Paginate
    return response.data.data.map((data: any): Bridge => {
      return new Bridge().fromJSON(data);
    });
  }

  /**
   * Get bridge current reading
   * @param bridge
   * @returns Promise<Bridge>
   */
  public async getBridgeReading(bridge: Bridge): Promise<Bridge> {
    await this.updateClient();
    const response = await this.client.get(
      `/api/bridges/${bridge.id}/current-reading`,
    );
    bridge.setCurrentReading(response.data.data);
    return bridge;
  }

  /**
   * Get remote sensor current reading
   * @param remoteSensor
   * @returns Promise<RemoteSensor>
   */
  public async getRemoteSensorReading(
    remoteSensor: RemoteSensor,
  ): Promise<RemoteSensor> {
    await this.updateClient();
    const response = await this.client.get(
      `/api/remote-sensors/${remoteSensor.id}/current-reading`,
    );
    remoteSensor.setCurrentReading(response.data.data);
    return remoteSensor;
  }

  /**
   * Set structure webhook callback URL
   * @param structure
   * @param callbackUrl
   * @returns Promise<Structure>
   */
  public async setStructureWebhook(
    structure: Structure,
    callbackUrl: string,
  ): Promise<Structure> {
    await this.updateClient();
    const response = await this.client.patch(
      `/api/structures/${structure.id}`,
      {
        data: {
          type: 'structures',
          attributes: {
            'callback-url': callbackUrl,
          },
          relationships: {},
        },
      },
    );
    structure.fromJSON(response.data.data);
    return structure;
  }

  /**
   * Set active schedule for structure
   * @param structure
   * @param scheduleId
   * @returns Promise<Structure>
   */
  public async setStructureActiveSchedule(
    structure: Structure,
    scheduleId: string,
  ): Promise<Structure> {
    await this.updateClient();
    const response = await this.client.patch(
      `/api/structures/${structure.id}`,
      {
        data: {
          type: 'structures',
          attributes: {
            'active-schedule-id': scheduleId,
          },
          relationships: {},
        },
      },
    );
    structure.fromJSON(response.data.data);
    return structure;
  }
}
