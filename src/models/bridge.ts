import { Model } from './model';

export class Bridge extends Model {
  public static type = 'bridges';

  'display-number'?: string;
  'led-brightness'?: number;
  'current-rssi'?: number;
  inactive?: boolean;
  'created-at'?: Date;
  'updated-at'?: Date;
  'structure-id'?: string;

  public fromJSON(data: any): Bridge {
    this.id = data.id;
    this.name = data.attributes.name;
    this['display-number'] = data.attributes['display-number'];
    this['led-brightness'] = data.attributes['led-brightness'];
    this['current-rssi'] = data.attributes['current-rssi'];
    this.inactive = data.attributes.inactive;
    this['created-at'] = data.attributes['created-at']
      ? new Date(data.attributes['created-at'])
      : undefined;
    this['updated-at'] = data.attributes['updated-at']
      ? new Date(data.attributes['updated-at'])
      : undefined;
    this['structure-id'] = data.relationships?.structure?.data?.id;
    return this;
  }

  public setCurrentReading(data: any): void {
    this['current-rssi'] = data.attributes.rssi;
    this['display-number'] = data.attributes['display-number'];
    this['led-brightness'] = data.attributes['led-brightness'];
  }
}