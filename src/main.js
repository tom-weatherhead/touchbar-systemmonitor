// After 'npm i', do this: $ npx electron-rebuild
// This rebuilds osx-temperature-sensor in order to avoid NODE_MODULE_VERSION conflicts between Electron and Node.js

const { app, BrowserWindow, TouchBar, /* Tray, */ globalShortcut, nativeImage } = require('electron');
const path = require('path');
const si = require('systeminformation');
const spawn = require('child_process').spawn;
// colors https://flatuicolors.com/palette/defo

// const appName = "Touchbar System Monitor";
const { TouchBarButton, TouchBarLabel, TouchBarSpacer } = TouchBar;

let window;

const LOAD_NORMAL = "#2ecc71";
const LOAD_MEDIUM = "#f1c40f";
const LOAD_HIGH = "#d35400";
const LOAD_SEVERE = "#e74c3c";

const cpu = new TouchBarButton({
	label: 'CPU',
	backgroundColor: "#bdc3c7",
	icon: path.join(__dirname, 'icons/chip.png'),
	// icon: nativeImage
	// 	.createFromPath(path.join(__dirname, 'icons/chip.png'))
	// 	.resize({
	// 		width: 16,
	// 		height: 16
	// 	}),
	iconPosition: "left",
	// click: () => {
	// 	updateData();
	// }
});

const memory = new TouchBarButton({
	label: '',
	backgroundColor: "#bdc3c7",
	icon: path.join(__dirname, 'icons/ram.png'),
	iconPosition: "left",
	click: () => {
		updateData();
	}
});

const network = new TouchBarButton({
	label: '',
	backgroundColor: '#3498db',
	icon: path.join(__dirname, 'icons/internet.png'),
	iconPosition: "left",
	click: () => {
		updateData();
	}
});

const battery = new TouchBarButton({
	label: '',
	backgroundColor: "#bdc3c7",
	icon: path.join(__dirname, 'icons/power.png'),
	iconPosition: "left",
	click: () => {
		updateData();
	}
});

const disk = new TouchBarButton({
	label: '',
	backgroundColor: "#9b59b6",
	icon: path.join(__dirname, 'icons/hard-disk-drive.png'),
	iconPosition: "left",
	click: () => {
		updateData();
	}
});

const cpuTemperature = new TouchBarButton({
	label: 'Temp',
	backgroundColor: "#ff0000" // ,
	// icon: path.join(__dirname, 'icons/hard-disk-drive.png'),
	// iconPosition: "left",
	// click: () => {
	// 	updateData();
	// }
});

const updateData = () => {
	// console.log('updateData');

	si.currentLoad().then((data) => {
		// console.log('si.currentLoad : data is', data);
		// console.log('si.currentLoad : data.currentLoad is', data.currentLoad);

		if (typeof data !== 'undefined' && data && typeof data.currentLoad !== 'undefined' && data.currentLoad !== null) {
			// console.log('data.currentLoad is', data.currentLoad);
			// console.log('typeof data.currentLoad is', typeof data.currentLoad);
			load = data.currentLoad.toFixed(0);
			// load = Math.round(data.currentLoad);
			cpu.label = load + "%";

			if (load <= 20) {
				cpu.backgroundColor = LOAD_NORMAL;
			} else if (load <= 40) {
				cpu.backgroundColor = LOAD_MEDIUM;
			} else if (load <= 80) {
				cpu.backgroundColor = LOAD_HIGH;
			} else {
				cpu.backgroundColor = LOAD_SEVERE;
			}
		}
	}).catch((error) => {
		console.error('si.currentLoad() error:', error);
		app.quit();
	});

	si.mem().then((data) => {
		// console.log('si.mem : data is', data);

		if (typeof data !== 'undefined' && data) {
			load = ((100 * data.active ) / data.total).toFixed(0);
			memory.label = load + "%";

			if (load <= 20) {
				memory.backgroundColor = LOAD_NORMAL;
			} else if (load <= 40) {
				memory.backgroundColor = LOAD_MEDIUM;
			} else if (load <= 80) {
				memory.backgroundColor = LOAD_HIGH;
			} else {
				memory.backgroundColor = LOAD_SEVERE;
			}
		}
	}).catch((error) => {
		console.error('si.mem() error:', error);
		app.quit();
	});

	si.networkStats("").then((data) => {
		// console.log('si.networkStats : data is', data);

		if (typeof data !== 'undefined' && data) {
			kbtx = (data[0].tx_sec * 0.001).toFixed(0);
			kbrx = (data[0].rx_sec * 0.001).toFixed(0);
			l = (kbtx+kbrx).toString().length;

			network.label = "⇡" + (kbtx*0.001).toFixed(2) + " ⇣" + (kbrx * 0.001).toFixed(2) + " MB/s";
		}
	}).catch((error) => {
		console.error('si.networkStats() error:', error);
		app.quit();
	});

	si.disksIO().then((data) => {
		// console.log('si.disksIO : data is', data);

		if (typeof data !== 'undefined' && data && typeof data.tIO_sec !== 'undefined' && data.tIO_sec !== null) {
			load = data.tIO_sec.toFixed(0);
			more = 4 - load.toString().length;
			tomore = "";

			for (let i = 0; i < more; i++) {
				tomore += "0";
			}

			disk.label = tomore + load + "/s";
		}
	}).catch((error) => {
		console.error('si.disksIO() error:', error);
		app.quit();
	});

	si.battery().then((data) => {
		// console.log('si.battery : data is', data);

		if (typeof data !== 'undefined' && data) {

			if (data.ischarging) {
				battery.icon = path.join(__dirname, 'icons/charger.png');
			} else {
				battery.icon = path.join(__dirname, 'icons/power.png');
			}

			load = data.percent.toFixed(0);
			battery.label = load + "%";

			if (load <= 20) {
				battery.backgroundColor = LOAD_SEVERE;
			} else if (load <= 40) {
				battery.backgroundColor = LOAD_HIGH;
			} else if (load <= 80) {
				battery.backgroundColor = LOAD_MEDIUM;
			} else {
				battery.backgroundColor = LOAD_NORMAL;
			}
		}
	}).catch((error) => {
		console.error('si.battery() error:', error);
		app.quit();
	});

	si.cpuTemperature().then((data) => {
		console.log('cpuTemperature:', data);
		// console.log('Max cpuTemperature:', data.max);
		let str = `CPU m${data.max}C`;

		if (data.cores.length > 0) {
			const sum = data.cores.reduce((a, b) => a + b, 0);
			const avg = Math.round(sum / data.cores.length);

			str += ` a${avg}C`;
		}

		cpuTemperature.label = str;
	}).catch((error) => {
		console.error('si.cpuTemperature() error:', error);
		app.quit();
	});
};

const activitymonitor = new TouchBarButton({
	label: '',
	backgroundColor: "#34495e",
	icon: path.join(__dirname, 'icons/activity.png'),
	iconPosition: "center",
	click: () => {
		spawn("/System/Applications/Utilities/Activity Monitor.app/Contents/MacOS/Activity\ Monitor", []);
	}
});

const touchBar = new TouchBar({
	items: [
		cpu,
		new TouchBarSpacer({ size: 'small' }),
		memory,
		new TouchBarSpacer({size: 'small'}),
		network,
		new TouchBarSpacer({size: 'small'}),
		// disk,
		// new TouchBarSpacer({size: 'small'}),
		battery,
		new TouchBarSpacer({size: 'small'}),
		cpuTemperature
	],
	escapeItem: activitymonitor
});

let intervalObj;

const focusOnWindow = () => {
	console.log('focusOnWindow');
	window.show();
	window.setVisibleOnAllWorkspaces(true);
	window.focus();
	window.setVisibleOnAllWorkspaces(false);
	updateData();
	intervalObj = setInterval(() => {
		updateData();
	}, 1000);
};

// app.once('ready', () => {
app.whenReady().then(() => {
	window = new BrowserWindow({
		// width: 200,
		// height: 200,
		// title: appName
		frame: false,
		titleBarStyle: 'hiddenInset',
		width: 200,
		height: 200,
		backgroundColor: '#000'
	});

	window.loadURL('about:blank');
	window.setTouchBar(touchBar);

	window.on('blur', () => {
		clearInterval(intervalObj);
	});

	focusOnWindow();

	globalShortcut.register('CommandOrControl+Shift+1', () => {
		focusOnWindow();
	});

	globalShortcut.register('CommandOrControl+Shift+0', () => {
		app.quit();
	});

	app.dock.hide();
})

app.on('window-all-closed', () => {
	app.quit();
});
