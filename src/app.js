// app.js
// Copyright (c) 2020 Oleksandr Sovenko (info@oleksandrsovenko.com)

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.


const	net          = require('net'),
		vm           = require('vm'),
		os           = require('os'),
		fs           = require('fs'),
		moment       = require('moment'),
		path         = require('path'),
		{ execSync } = require('child_process'),

		{ CLOUD }    = require('./include/cloud'),
		W1           = require('./include/w1'),
		MATH         = require('./include/math'),
		DATETIME     = require('./include/datetime'),
		HASH         = require('./include/hash'),
		FILE         = require('./include/file'),
		DIR          = require('./include/dir'),

		{ GPIO, BMP280, HC_SC04 } = require('./modules/core');


/**
 *
 *
 *
 */
if (process.argv.length == 2) {
	console.log("Try 'artjs -h' for more information.");
	process.exit();
}


/**
 *
 *
 *	@command --processes
 */
if (process.argv[2] === '-h') {
	console.log('Usage: artjs [options] [script.js]');
	console.log('');
	console.log('Options:');
	console.log('	-b+		Run a script in the background, the script will also work after rebooting the system');
	console.log('	-b-		Removing a script from the background');
	console.log('');
	console.log('Examples:');
	console.log('	artjs test.js');
	console.log('	artjs -b+ ~/relay.js');
	console.log('	artjs -b- ~/relay.js');
	console.log('');
	console.log('Copyright (c) 2020 Oleksandr Sovenko (info@oleksandrsovenko.com)');
	console.log('');
	console.log('Permission is hereby granted, free of charge, to any person obtaining a copy');
	console.log('of this software and associated documentation files (the "Software"), to deal');
	console.log('in the Software without restriction, including without limitation the rights');
	console.log('to use, copy, modify, merge, publish, distribute, sublicense, and/or sell');
	console.log('copies of the Software, and to permit persons to whom the Software is');
	console.log('furnished to do so, subject to the following conditions:');
	console.log('');
	console.log('The above copyright notice and this permission notice shall be included in all');
	console.log('copies or substantial portions of the Software.');
	console.log('');
	console.log('THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR');
	console.log('IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,');
	console.log('FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE');
	console.log('AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER');
	console.log('LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,');
	console.log('OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE');
	console.log('SOFTWARE.');
	process.exit();
}


/**
 *
 *
 *	@command -b+
 */
if (process.argv[2] === '-b+') {
	console.log(process.argv);
	process.exit();
}


/**
 *
 *
 *	@command -b-
 */
if (process.argv[2] === '-b-') {

}


/**
 *	Install Service
 *
 *	@command install
 */
if (process.argv[2] === 'install') {
	var service = '' +
		'[Unit]\n' +
		'Description=\n' +
		'After=network.target\n' +
		'StartLimitIntervalSec=0\n' +
		'[Service]\n' +
		'Type=simple\n' +
		'Restart=always\n' +
		'RestartSec=1\n' +
		'User=artjs\n' +
		'ExecStart=' + process.argv[0] + ' serve\n' +
		'' +
		'[Install]\n' +
		'WantedBy=multi-user.target\n';

	try {
		fs.writeFileSync('/etc/systemd/system/artjs.service', service);
	} catch(e) {
		throw new Error('Something went wrong!');
	}

	execSync('systemctl enable artjs');

	process.exit();
}


/**
 *	Uninstall Service
 *
 *	@command uninstall
 */
if (process.argv[2] === 'uninstall') {
	execSync('systemctl disable artjs');

	try {
		fs.unlinkSync('/etc/systemd/system/artjs.service');
	} catch(e) {
		throw new Error('Something went wrong!');
	}

	process.exit();
}


/**
 *  VM (Executing JavaScript)
 *
 *	@command script.js
 */
if (/\.js/.test(process.argv[2])) {
	var filename = process.argv[2],
		jscode = '';

	if (fs.existsSync(filename))
		jscode = fs.readFileSync(filename, 'utf8');
	else
		process.exit();


	// Trying to capture all nodejs errors {
		function processLog(err) {
			const message = err.stack.replace(/\n/g, '').replace(/ at .*/g, '').trim();
			console.log('{ ERROR } =>', message);
		}

		// process.on('uncaughtExceptionMonitor', function(err) {
		// 	processLog(err)
		// });

		process.on('unhandledRejection', function(err) {
			processLog(err)
		});

		process.on('uncaughtException', function(err) {
			processLog(err)
		});
	// }


	// Execution JS code {
		result = vm.runInNewContext(jscode + ';' + true, {
			W1            : W1,
			GPIO          : GPIO,
			HC_SC04       : HC_SC04,
			BMP280        : BMP280,
			DATETIME      : DATETIME,
			DIR           : DIR,
			FILE          : FILE,
			HASH          : HASH,
			CLOUD         : CLOUD,

			exec          : execSync,

			console       : console,
			setInterval   : setInterval,
			clearInterval : clearInterval,
			setTimeout    : setTimeout,
			clearTimeout  : clearTimeout,
		}, {
			breakOnSigint : true,
			displayErrors : false
		});
	// }
}


/**
 *	Server Application
 *
 *	@command serve
 */
if (process.argv[2] === 'serve') {

}
