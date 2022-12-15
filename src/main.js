// touchbar-systemmonitor/src/main.js

// After 'npm i', do this: $ npx electron-rebuild
// This rebuilds osx-temperature-sensor in order to avoid NODE_MODULE_VERSION conflicts between Electron and Node.js

const { app, BrowserWindow, TouchBar, /* Tray, */ globalShortcut /*, nativeImage */ } = require('electron');
const path = require('path');
const si = require('systeminformation');
// const spawn = require('child_process').spawn;
// colors https://flatuicolors.com/palette/defo

// const appName = "Touchbar System Monitor";
const { TouchBarButton, /* TouchBarLabel, */ TouchBarSpacer } = TouchBar;

let window;

// From thaw-colour :
const colourRed		= '#ff0000';
const colourOrange	= '#ffa500'; // [255, 165, 0]
const colourYellow	= '#ffff00';
const colourGreen	= '#008000';
const colourBlue	= '#0000ff';
const colourIndigo	= '#4b0082'; // [75, 0, 130]
const colourViolet	= '#ee82ee'; // [238, 130, 238]

const colourGrey	= '#808080';

const LOAD_NORMAL = "#2ecc71";
const LOAD_MEDIUM = "#f1c40f";
const LOAD_HIGH = "#d35400";
const LOAD_SEVERE = "#e74c3c";

const cpu = new TouchBarButton({
	label: 'CPU',
	backgroundColor: "#bdc3c7",
	icon: path.join(__dirname, 'icons', 'chip.png'),
	// icon: nativeImage
	// 	.createFromPath(path.join(__dirname, 'icons', 'chip.png'))
	// 	.resize({
	// 		width: 16,
	// 		height: 16
	// 	}),
	iconPosition: "left" // ,
	// click: () => {
	// 	updateData();
	// }
});

const memory = new TouchBarButton({
	label: '',
	backgroundColor: "#bdc3c7",
	icon: path.join(__dirname, 'icons', 'ram.png'),
	iconPosition: "left"
});

// const network = new TouchBarButton({
// 	label: '',
// 	backgroundColor: '#3498db',
// 	icon: path.join(__dirname, 'icons', 'internet.png'),
// 	iconPosition: "left"
// });

const battery = new TouchBarButton({
	label: '',
	backgroundColor: "#bdc3c7",
	icon: path.join(__dirname, 'icons', 'power.png'),
	iconPosition: "left"
});

const disk = new TouchBarButton({
	label: '',
	backgroundColor: "#9b59b6",
	icon: path.join(__dirname, 'icons', 'hard-disk-drive.png'),
	iconPosition: "left"
});

const cpuTemperature = new TouchBarButton({
	label: 'Temp',
	backgroundColor: "#c00000" // ,
	// icon: path.join(__dirname, 'icons', '???.png'),
	// iconPosition: "left"
});

const updateData = () => {

	si.currentLoad().then((data) => {

		if (typeof data !== 'undefined' && data && typeof data.currentLoad !== 'undefined' && data.currentLoad !== null) {
			const load = data.currentLoad.toFixed(0); // Is data.currentLoad a percentage?

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
		} else {
			cpu.label = '??? %';
			cpu.backgroundColor = colourGrey;
		}
	}).catch((error) => {
		console.error('si.currentLoad() error:', error);
		app.quit();
	});

	si.mem().then((data) => {
		// console.log('si.mem : data is', data);

		if (typeof data !== 'undefined' && data) {
			const load = ((100 * data.active ) / data.total).toFixed(0);

			memory.label = load + "%";

			if (load <= 50) {
				memory.backgroundColor = LOAD_NORMAL;
			} else if (load <= 70) {
				memory.backgroundColor = LOAD_MEDIUM;
			} else if (load <= 90) {
				memory.backgroundColor = LOAD_HIGH;
			} else {
				memory.backgroundColor = LOAD_SEVERE;
			}
		} else {
			memory.label = '??? %';
			memory.backgroundColor = colourGrey;
		}
	}).catch((error) => {
		console.error('si.mem() error:', error);
		app.quit();
	});

	// si.networkStats("").then((data) => {
	// 	// console.log('si.networkStats : data is', data);

	// 	if (typeof data !== 'undefined' && data) {
	// 		const kbtx = (data[0].tx_sec * 0.001).toFixed(0);
	// 		const kbrx = (data[0].rx_sec * 0.001).toFixed(0);

	// 		network.label = "⇡" + (kbtx * 0.001).toFixed(2) + " ⇣" + (kbrx * 0.001).toFixed(2) + " MB/s";
	//		network.backgroundColor = '#3498db';
	// 	} else {
	// 		network.label = '???';
	// 		network.backgroundColor = colourGrey;
	// 	}
	// }).catch((error) => {
	// 	console.error('si.networkStats() error:', error);
	// 	app.quit();
	// });

	si.disksIO().then((data) => {
		// console.log('si.disksIO : data is', data);

		if (typeof data !== 'undefined' && data && typeof data.tIO_sec !== 'undefined' && data.tIO_sec !== null) {
			const load = data.tIO_sec.toFixed(0);
			// const more = 4 - load.toString().length;
			// let tomore = "";

			// for (let i = 0; i < more; i++) {
			// 	tomore += "0";
			// }

			// disk.label = tomore + load + "/s";
			disk.label = ('000' + load).slice(-4) + "/s";
			// disk.backgroundColor = ?;
		} else {
			disk.label = '???';
			// disk.backgroundColor = colourGrey;
		}
	}).catch((error) => {
		console.error('si.disksIO() error:', error);
		app.quit();
	});

	si.battery().then((data) => {
		// console.log('si.battery : data is', data);

		if (typeof data !== 'undefined' && data) {
			battery.icon = path.join(__dirname, 'icons', data.isCharging ? 'charger.png' : 'power.png');

			let batteryPercentCharged = data.percent.toFixed(0);

			if (batteryPercentCharged < 0) { // Clamp
				batteryPercentCharged = 0;
			} else if (batteryPercentCharged > 100) {
				batteryPercentCharged = 100;
			}

			battery.label = batteryPercentCharged + '%';

			// batteryPercentCharged === 0 -> red; batteryPercentCharged == 100 -> green
			const g = Math.round(batteryPercentCharged * 255 / 100);
			const gg = ('0' + g.toString(16)).slice(-2);
			const rr = ('0' + (255 - g).toString(16)).slice(-2);

			// if (batteryPercentCharged <= 20) {
			// 	battery.backgroundColor = LOAD_SEVERE;
			// } else if (batteryPercentCharged <= 40) {
			// 	battery.backgroundColor = LOAD_HIGH;
			// } else if (batteryPercentCharged <= 80) {
			// 	battery.backgroundColor = LOAD_MEDIUM;
			// } else {
			// 	battery.backgroundColor = LOAD_NORMAL;
			// }

			battery.backgroundColor = `#${rr}${gg}00`;
			// console.log('battery.backgroundColor is', battery.backgroundColor);
		} else {
			battery.label = '??? %';
			battery.backgroundColor = colourGrey;
		}
	}).catch((error) => {
		console.error('si.battery() error:', error);
		app.quit();
	});

	si.cpuTemperature().then((data) => {
		// console.log('cpuTemperature:', data);

		if (typeof data !== 'undefined' && data && typeof data.max !== 'undefined') {
			// console.log('Max cpuTemperature:', data.max);

			let str = `Temp m${data.max}C`;

			if (data.cores.length > 0) {
				const sum = data.cores.reduce((a, b) => a + b, 0);
				const avg = Math.round(sum / data.cores.length);

				str += ` a${avg}C`;
			}

			cpuTemperature.label = str;

			if (data.max < 45) {
				cpuTemperature.backgroundColor = colourViolet; // '#000000'; // Black
			} else if (data.max < 50) {
				cpuTemperature.backgroundColor = colourIndigo; // '#0000ff'; // Blue
			} else if (data.max < 55) {
				cpuTemperature.backgroundColor = colourBlue; // '#00ffff'; // Cyan
			} else if (data.max < 60) {
				cpuTemperature.backgroundColor = colourGreen; // '#00ff00'; // Green
			} else if (data.max < 65) {
				cpuTemperature.backgroundColor = colourYellow; // '#ffff00'; // Yellow
			} else if (data.max < 70) {
				cpuTemperature.backgroundColor = colourOrange; // '#ff0000'; // Red
			} else {
				cpuTemperature.backgroundColor = colourRed; // '#ff00ff'; // Magenta (or white?)
			}
		} else {
			cpuTemperature.label = '???';
			cpuTemperature.backgroundColor = colourGrey;
		}
	}).catch((error) => {
		console.error('si.cpuTemperature() error:', error);
		app.quit();
	});
};

// const activitymonitor = new TouchBarButton({
// 	label: '',
// 	backgroundColor: "#34495e",
// 	icon: path.join(__dirname, 'icons', 'activity.png'),
// 	iconPosition: "center",
// 	click: () => {
// 		spawn("/System/Applications/Utilities/Activity Monitor.app/Contents/MacOS/Activity\ Monitor", []);
// 	}
// });
const escapeItem = new TouchBarButton({
	label: 'esc',
	backgroundColor: "#34495e",
	click: () => {
		app.quit();
	}
});

const touchBar = new TouchBar({
	items: [
		cpu,
		new TouchBarSpacer({ size: 'small' }),
		memory,
		new TouchBarSpacer({ size: 'small' }),
		// network,
		// new TouchBarSpacer({ size: 'small' }),
		disk,
		new TouchBarSpacer({ size: 'small' }),
		battery,
		new TouchBarSpacer({ size: 'small' }),
		cpuTemperature
	],
	// escapeItem: activitymonitor
	escapeItem
});

let intervalObj;

const focusOnWindow = () => {
	// console.log('focusOnWindow');
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
