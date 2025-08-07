import { Model } from './model';

export class Thermostat extends Model {
  public static type = 'thermostats';

  currentTemperatureC?: number;
  setPointTemperatureC?: number;
  systemMode?: string;
  fanMode?: string;
  holdUntil?: Date;
  locked?: boolean;
  online?: boolean;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  public fromJSON(data: any): Thermostat {
    this.currentTemperatureC = data.attributes['current-temperature-c'];
    this.setPointTemperatureC = data.attributes['set-point-temperature-c'];
    this.systemMode = data.attributes['system-mode'];
    this.fanMode = data.attributes['fan-mode'];
    this.holdUntil = data.attributes['hold-until'] ? new Date(data.attributes['hold-until']) : undefined;
    this.locked = data.attributes.locked;
    this.online = data.attributes.online;
    this.name = data.attributes.name;
    this.createdAt = new Date(data.attributes['created-at']);
    this.updatedAt = new Date(data.attributes['updated-at']);
    this.id = data.id;
    return this;
  }
}