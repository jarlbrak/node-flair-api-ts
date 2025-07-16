import { Model } from './model';

export enum StructureHeatCoolMode {
  OFF = 'float', //for some reason flair calls off float? Maybe its "floating..." around.
  COOL = 'cool',
  HEAT = 'heat',
  AUTO = 'auto',
}

export enum FlairMode {
  MANUAL = 'manual',
  AUTO = 'auto'
}

export enum HomeAwayMode {
  HOME = 'Home',
  AWAY = 'Away'
}

export enum StructureAwayMode {
  OFF = 'off',
  ECO = 'eco'
}

export class Structure extends Model {
  public static type = 'structures';

  updatedAt: Date = new Date();
  createdAt: Date = new Date();
  isActive = false;
  home = false;

  structureHeatCoolMode: StructureHeatCoolMode = StructureHeatCoolMode.COOL;
  structureHeatCoolModeCalculated?: StructureHeatCoolMode;
  setPointTemperatureC = 0;
  mode: FlairMode = FlairMode.AUTO;

  // New attributes from latest API
  'callback-url'?: string;
  'active-schedule-id'?: string;
  'hysteresis-heat-cool-mode'?: string;
  'structure-heat-cool-mode-popup-resolved-at'?: Date;
  'home-away-mode'?: HomeAwayMode;
  'puck-client-id'?: string;
  'puck-client-secret'?: string;
  'setup-mode'?: boolean;
  'setup-complete'?: boolean;
  'setup-step'?: number;
  'hold-reason'?: string;
  'hold-until'?: Date;
  'hold-until-schedule-event'?: string;
  'use-remote-sensor-occupancy'?: boolean;
  'preheat-precool'?: boolean;
  'frozen-pipe-pet-protect'?: boolean;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  'zip-code'?: string;
  latitude?: number;
  longitude?: number;
  'default-hold-duration'?: number;
  'release-channel'?: string;
  'humidity-away-min'?: number;
  'humidity-away-max'?: number;
  'structure-away-mode'?: StructureAwayMode;
  'state-updated-at'?: Date;
  'licensed-features'?: string[];

  public fromJSON(data: any): Structure {
    this.name = data.attributes.name;
    this.createdAt = new Date(data.attributes['created-at']);
    this.updatedAt = new Date(data.attributes['updated-at']);

    this.isActive = data.attributes['is-active'];
    this.home = data.attributes.home;
    this.structureHeatCoolMode = data.attributes['structure-heat-cool-mode'];
    this.structureHeatCoolModeCalculated = data.attributes['structure-heat-cool-mode-calculated'] === null ? undefined : data.attributes['structure-heat-cool-mode-calculated'];
    this.setPointTemperatureC = data.attributes['set-point-temperature-c'];
    this.mode = data.attributes.mode;

    // New attributes
    this['callback-url'] = data.attributes['callback-url'];
    this['active-schedule-id'] = data.attributes['active-schedule-id'];
    this['hysteresis-heat-cool-mode'] = data.attributes['hysteresis-heat-cool-mode'];
    this['structure-heat-cool-mode-popup-resolved-at'] = data.attributes['structure-heat-cool-mode-popup-resolved-at'] 
      ? new Date(data.attributes['structure-heat-cool-mode-popup-resolved-at']) : undefined;
    this['home-away-mode'] = data.attributes['home-away-mode'];
    this['puck-client-id'] = data.attributes['puck-client-id'];
    this['puck-client-secret'] = data.attributes['puck-client-secret'];
    this['setup-mode'] = data.attributes['setup-mode'];
    this['setup-complete'] = data.attributes['setup-complete'];
    this['setup-step'] = data.attributes['setup-step'];
    this['hold-reason'] = data.attributes['hold-reason'];
    this['hold-until'] = data.attributes['hold-until'] ? new Date(data.attributes['hold-until']) : undefined;
    this['hold-until-schedule-event'] = data.attributes['hold-until-schedule-event'];
    this['use-remote-sensor-occupancy'] = data.attributes['use-remote-sensor-occupancy'];
    this['preheat-precool'] = data.attributes['preheat-precool'];
    this['frozen-pipe-pet-protect'] = data.attributes['frozen-pipe-pet-protect'];
    this.location = data.attributes.location;
    this.city = data.attributes.city;
    this.state = data.attributes.state;
    this.country = data.attributes.country;
    this['zip-code'] = data.attributes['zip-code'];
    this.latitude = data.attributes.latitude;
    this.longitude = data.attributes.longitude;
    this['default-hold-duration'] = data.attributes['default-hold-duration'];
    this['release-channel'] = data.attributes['release-channel'];
    this['humidity-away-min'] = data.attributes['humidity-away-min'];
    this['humidity-away-max'] = data.attributes['humidity-away-max'];
    this['structure-away-mode'] = data.attributes['structure-away-mode'];
    this['state-updated-at'] = data.attributes['state-updated-at'] ? new Date(data.attributes['state-updated-at']) : undefined;
    this['licensed-features'] = data.attributes['licensed-features'];

    this.id = data.id;
    return this;
  }

  public isPrimaryHome(): boolean {
    return this.home;
  }
}
