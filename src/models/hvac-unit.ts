import { Model } from './model';

export type HvacMode = 'Heat' | 'Cool' | 'Fan' | 'Dry' | 'Auto';
export type FanSpeed = 'High' | 'Medium' | 'Low' | 'Auto';
export type SwingMode = 'On' | 'Off';
export type PowerState = 'On' | 'Off';

export interface HvacConstraints {
  modes?: HvacMode[];
  'fan-speeds'?: FanSpeed[];
  'temperature-scale'?: 'F' | 'C';
  'min-temperature'?: number;
  'max-temperature'?: number;
  swing?: SwingMode[];
  power?: PowerState[];
}

export class HvacUnit extends Model {
  public static type = 'hvac-units';

  temperature?: number;
  'fan-speed'?: FanSpeed;
  swing?: SwingMode;
  mode?: HvacMode;
  power?: PowerState;
  constraints?: HvacConstraints;
  'make-model'?: string;
  'room-id'?: string;
  'structure-id'?: string;
  'created-at'?: Date;
  'updated-at'?: Date;

  public fromJSON(data: any): HvacUnit {
    this.id = data.id;
    this.name = data.attributes.name;
    this.temperature = data.attributes.temperature;
    this['fan-speed'] = data.attributes['fan-speed'];
    this.swing = data.attributes.swing;
    this.mode = data.attributes.mode;
    this.power = data.attributes.power;
    this.constraints = data.attributes.constraints;
    this['make-model'] = data.attributes['make-model'];
    this['room-id'] = data.relationships?.room?.data?.id;
    this['structure-id'] = data.relationships?.structure?.data?.id;
    this['created-at'] = data.attributes['created-at']
      ? new Date(data.attributes['created-at'])
      : undefined;
    this['updated-at'] = data.attributes['updated-at']
      ? new Date(data.attributes['updated-at'])
      : undefined;
    return this;
  }
}