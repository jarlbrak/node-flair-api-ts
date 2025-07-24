import { Model } from './model';

export class HvacUnit extends Model {
    public static type = 'hvac-units'

    irSetupEnabled?: boolean;
    makeModel?: string;
    swingMode?: string;
    systemMode?: string;
    fanMode?: string;
    setPointTemperatureC?: number;
    currentTemperatureC?: number;
    createdAt: Date = new Date();
    updatedAt: Date = new Date();

    public fromJSON(data: any): HvacUnit {
        this.irSetupEnabled = data.attributes['ir-setup-enabled'];
        this.makeModel = data.attributes['make-model'];
        this.swingMode = data.attributes['swing-mode'];
        this.systemMode = data.attributes['system-mode'];
        this.fanMode = data.attributes['fan-mode'];
        this.setPointTemperatureC = data.attributes['set-point-temperature-c'];
        this.currentTemperatureC = data.attributes['current-temperature-c'];
        this.name = data.attributes.name;
        this.createdAt = new Date(data.attributes['created-at']);
        this.updatedAt = new Date(data.attributes['updated-at']);
        this.id = data.id;
        return this;
    }
}