"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FanAccessory = void 0;
const serialport_1 = require("serialport");
const buttonCodes = {
    lowFanSpeed: 1207,
    mediumFanSpeed: 1199,
    highFanSpeed: 1183,
    fanOff: 1213,
    toggleLight: 1214,
};
function getButtonCodes(index) {
    return String(buttonCodes[index]) + "\n";
}
class FanAccessory {
    constructor(platform, accessory) {
        this.platform = platform;
        this.accessory = accessory;
        this.states = {
            LightOn: false,
            FanSpeed: 0,
        };
        //Open serial port to send updates
        this.port = new serialport_1.SerialPort({ path: '/dev/serial/by-id/usb-1a86_USB2.0-Serial-if00-port0', baudRate: 9600 });
        // set accessory information
        this.accessory.getService(this.platform.Service.AccessoryInformation)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, "S.Q.M CO., LTD.")
            .setCharacteristic(this.platform.Characteristic.Model, "SW1422 MBK")
            .setCharacteristic(this.platform.Characteristic.SerialNumber, "NO4407600265-3923");
        // get the LightBulb service if it exists, otherwise create a new LightBulb service
        // you can create multiple services for each accessory
        this.lightService = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb, "Lightbulb", "0");
        this.fanService = this.accessory.getService(this.platform.Service.Fan) || this.accessory.addService(this.platform.Service.Fan, "Fan", "1");
        // set the service name, this is what is displayed as the default name on the Home app
        // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
        this.lightService.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.exampleDisplayName);
        this.fanService.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.exampleDisplayName);
        //this.batteryService.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.exampleDisplayName);
        // register handlers for the On/Off Characteristic
        this.lightService.getCharacteristic(this.platform.Characteristic.On)
            .onSet(this.setLightOn.bind(this))
            .onGet(() => Promise.resolve(this.states.LightOn));
        this.fanService.getCharacteristic(this.platform.Characteristic.RotationSpeed)
            .onSet(this.setFanOn.bind(this))
            .onGet(() => Promise.resolve(this.states.FanSpeed));
    }
    async setLightOn(value) {
        let lightWasOn = this.states.LightOn;
        this.states.LightOn = value;
        if ((this.states.LightOn && !lightWasOn) || (!this.states.LightOn && lightWasOn)) {
            this.port.write(getButtonCodes("toggleLight"));
        }
        this.platform.log.debug('The light is now on: ', this.states.LightOn);
    }
    async setFanOn(value) {
        this.states.FanSpeed = value;
        if (this.states.FanSpeed == 0) {
            this.port.write(getButtonCodes("fanOff"));
        }
        else if (this.states.FanSpeed > 0 && this.states.FanSpeed <= 33) {
            this.port.write(getButtonCodes("lowFanSpeed"));
        }
        else if (this.states.FanSpeed > 33 && this.states.FanSpeed <= 67) {
            this.port.write(getButtonCodes("mediumFanSpeed"));
        }
        else if (this.states.FanSpeed > 67 && this.states.FanSpeed <= 100) {
            this.port.write(getButtonCodes("highFanSpeed"));
        }
        this.platform.log.debug('The fan is set to: ', value);
    }
}
exports.FanAccessory = FanAccessory;
//# sourceMappingURL=platformAccessory.js.map