import { Model } from './model';

export class RemoteSensor extends Model {
    public static type = 'remote-sensors'

    currentTemperatureC?: number;
    currentHumidity?: number;
    rssi?: number;
    systemVoltage?: number;
    batteryLevel?: number;
    online?: boolean;
    lastReading?: Date;
    temperatureOffsetC?: number;
    humidityOffset?: number;
    createdAt: Date = new Date();
    updatedAt: Date = new Date();

    public fromJSON(data: any): RemoteSensor {
        this.currentTemperatureC = data.attributes['current-temperature-c'];
        this.currentHumidity = data.attributes['current-humidity'];
        this.rssi = data.attributes.rssi;
        this.systemVoltage = data.attributes['system-voltage'];
        this.batteryLevel = data.attributes['battery-level'];
        this.online = data.attributes.online;
        this.lastReading = data.attributes['last-reading'] ? new Date(data.attributes['last-reading']) : undefined;
        this.temperatureOffsetC = data.attributes['temperature-offset-c'];
        this.humidityOffset = data.attributes['humidity-offset'];
        this.name = data.attributes.name;
        this.createdAt = new Date(data.attributes['created-at']);
        this.updatedAt = new Date(data.attributes['updated-at']);
        this.id = data.id;
        return this;
    }
}