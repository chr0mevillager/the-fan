import { PlatformAccessory, CharacteristicValue } from 'homebridge';
import { ExampleHomebridgePlatform } from './platform';
export declare class FanAccessory {
    private readonly platform;
    private readonly accessory;
    private lightService;
    private fanService;
    private port;
    private states;
    constructor(platform: ExampleHomebridgePlatform, accessory: PlatformAccessory);
    setLightOn(value: CharacteristicValue): Promise<void>;
    setFanOn(value: CharacteristicValue): Promise<void>;
    setFanOff(value: CharacteristicValue): Promise<void>;
}
//# sourceMappingURL=platformAccessory.d.ts.map