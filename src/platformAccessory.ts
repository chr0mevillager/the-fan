import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { SerialPort } from 'serialport';

import { ExampleHomebridgePlatform } from './platform';

const buttonCodes = {
	lowFanSpeed: 1207,
	mediumFanSpeed: 1199,
	highFanSpeed: 1183,
	fanOff: 1213,
	toggleLight: 1214,
}
function getButtonCodes(index: keyof typeof buttonCodes) {
	return String(buttonCodes[index]) + "\n";
}

export class FanAccessory {
	private lightService: Service;
	private fanService: Service;
	private port: SerialPort;

	private states = {
		LightOn: false,
		FanSpeed: 0,
		FanOn: false,
	};

	constructor(
		private readonly platform: ExampleHomebridgePlatform,
		private readonly accessory: PlatformAccessory,
	) {

		//Open serial port to send updates
		this.port = new SerialPort({ path: '/dev/serial/by-id/usb-1a86_USB2.0-Serial-if00-port0', baudRate: 9600 });

		// set accessory information
		this.accessory.getService(this.platform.Service.AccessoryInformation)!
			.setCharacteristic(this.platform.Characteristic.Manufacturer, "S.Q.M CO., LTD.")
			.setCharacteristic(this.platform.Characteristic.Model, "SW1422 MBK")
			.setCharacteristic(this.platform.Characteristic.SerialNumber, "NO4407600265-3923");

		// get the LightBulb service if it exists, otherwise create a new LightBulb service
		// you can create multiple services for each accessory

		// set the service name, this is what is displayed as the default name on the Home app
		// in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.

		this.fanService = this.accessory.getService(this.platform.Service.Fan) || this.accessory.addService(this.platform.Service.Fan, "Fan", "1");
		this.fanService.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.exampleDisplayName);

		this.lightService = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb, "Lightbulb", "0");
		this.lightService.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.exampleDisplayName);


		//this.batteryService.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.exampleDisplayName);

		// register handlers for the On/Off Characteristic
		this.fanService.getCharacteristic(this.platform.Characteristic.RotationSpeed)
			.onSet(this.setFanOn.bind(this))
			.onGet(() => Promise.resolve(this.states.FanSpeed));
		this.fanService.getCharacteristic(this.platform.Characteristic.On)
			.onSet(this.setFanOff.bind(this))
			.onGet(() => Promise.resolve(this.states.FanOn));
		this.lightService.getCharacteristic(this.platform.Characteristic.On)
			.onSet(this.setLightOn.bind(this))
			.onGet(() => Promise.resolve(this.states.LightOn));

	}
	async setLightOn(value: CharacteristicValue) {
		let lightWasOn = this.states.LightOn;

		this.states.LightOn = value as boolean;

		if ((this.states.LightOn && !lightWasOn) || (!this.states.LightOn && lightWasOn)) {
			this.port.write(getButtonCodes("toggleLight"));
		}

		this.platform.log.debug('The light is now on: ', this.states.LightOn);
	}

	async setFanOn(value: CharacteristicValue) {
		if (value as number != 0) this.states.FanSpeed = value as number;

		if (this.states.FanSpeed == 0) {
			this.states.FanOn = false;
			this.port.write(getButtonCodes("fanOff"));
		} else if (this.states.FanSpeed > 0 && this.states.FanSpeed <= 33) {
			this.states.FanOn = true;
			this.port.write(getButtonCodes("lowFanSpeed"));
		} else if (this.states.FanSpeed > 33 && this.states.FanSpeed <= 67) {
			this.states.FanOn = true;
			this.port.write(getButtonCodes("mediumFanSpeed"));
		} else if (this.states.FanSpeed > 67 && this.states.FanSpeed <= 100) {
			this.states.FanOn = true;
			this.port.write(getButtonCodes("highFanSpeed"));
		}

		this.platform.log.debug('The fan is set to: ', value);
	}
	async setFanOff(value: CharacteristicValue) {
		if (!(value as boolean)) {
			this.port.write(getButtonCodes("fanOff"));
			this.states.FanOn = false;

			this.platform.log.debug('The fan is turned off (set to 0% fan speed)');
		}
		this.states.FanOn = value as boolean;
	}
}