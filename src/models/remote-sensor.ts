import { Model } from './model';

export class RemoteSensor extends Model {
  public static type = 'remote-sensors';

  'current-temperature-c'?: number;
  'current-humidity'?: number;
  inactive?: boolean;
  'battery-level'?: number;
  'created-at'?: Date;
  'updated-at'?: Date;
  'room-id'?: string;
  'structure-id'?: string;

  public fromJSON(data: any): RemoteSensor {
    this.id = data.id;
    this.name = data.attributes.name;
    this['current-temperature-c'] = data.attributes['current-temperature-c'];
    this['current-humidity'] = data.attributes['current-humidity'];
    this.inactive = data.attributes.inactive;
    this['battery-level'] = data.attributes['battery-level'];
    this['created-at'] = data.attributes['created-at']
      ? new Date(data.attributes['created-at'])
      : undefined;
    this['updated-at'] = data.attributes['updated-at']
      ? new Date(data.attributes['updated-at'])
      : undefined;
    this['room-id'] = data.relationships?.room?.data?.id;
    this['structure-id'] = data.relationships?.structure?.data?.id;
    return this;
  }

  public setCurrentReading(data: any): void {
    this['current-temperature-c'] = data.attributes['room-temperature-c'];
    this['current-humidity'] = data.attributes.humidity;
    this['battery-level'] = data.attributes['battery-level'];
  }
}