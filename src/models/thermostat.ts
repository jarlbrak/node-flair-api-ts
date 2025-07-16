import { Model } from './model';

export class Thermostat extends Model {
  public static type = 'thermostats';

  'static-vents'?: number;
  'make-model'?: string;
  'created-at'?: Date;
  'updated-at'?: Date;
  'structure-id'?: string;
  'room-id'?: string;

  public fromJSON(data: any): Thermostat {
    this.id = data.id;
    this.name = data.attributes.name;
    this['static-vents'] = data.attributes['static-vents'];
    this['make-model'] = data.attributes['make-model'];
    this['created-at'] = data.attributes['created-at']
      ? new Date(data.attributes['created-at'])
      : undefined;
    this['updated-at'] = data.attributes['updated-at']
      ? new Date(data.attributes['updated-at'])
      : undefined;
    this['structure-id'] = data.relationships?.structure?.data?.id;
    this['room-id'] = data.relationships?.room?.data?.id;
    return this;
  }
}