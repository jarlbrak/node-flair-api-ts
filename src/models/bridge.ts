import { Model } from './model';

export class Bridge extends Model {
  public static type = 'bridges';

  rssi?: number;
  currentFirmwareVersion?: string;
  macAddress?: string;
  ipAddress?: string;
  online?: boolean;
  lastHeartbeat?: Date;
  systemVoltage?: number;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  public fromJSON(data: any): Bridge {
    this.rssi = data.attributes.rssi;
    this.currentFirmwareVersion = data.attributes['current-firmware-version'];
    this.macAddress = data.attributes['mac-address'];
    this.ipAddress = data.attributes['ip-address'];
    this.online = data.attributes.online;
    this.lastHeartbeat = data.attributes['last-heartbeat'] ? new Date(data.attributes['last-heartbeat']) : undefined;
    this.systemVoltage = data.attributes['system-voltage'];
    this.name = data.attributes.name;
    this.createdAt = new Date(data.attributes['created-at']);
    this.updatedAt = new Date(data.attributes['updated-at']);
    this.id = data.id;
    return this;
  }
}