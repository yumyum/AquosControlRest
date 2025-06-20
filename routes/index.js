var net = require('net');

var express = require('express');
var router = express.Router();

const { exec } = require('child_process');

var AQUOS_IP = '192.168.1.32';
var AQUOS_PORT = 10002;
var REMO_IP = '192.168.1.200';

function sendCommand(command, res) {
	//console.log('connect to aquos');
	var socket = net.createConnection({
		port: AQUOS_PORT,
		host: AQUOS_IP
	}, function () {
		//console.log('send command: ' + command);
		socket.write(command);
		socket.write('\r');
	});
	socket.on('data', function (data) {
		//console.log(data.toString());
		socket.end();
	});
	socket.on('end', function () {
		//console.log('client disconnected');
		res.sendStatus(200);
	});
}

function ps4Waker(command, res) {
	if (command == 'up') {
		var param = "";
	} else if (command == 'torne') {
		var param = " start CUSA00442";
	} else {
		res.sendStatus(404);
		return;
	}
	exec("ps4-waker" + param, (err, stdout, stderr) => {
		if (err) {
			// console.log(`stderr: ${stderr}`);
			return;
		}
		// console.log(`stdout: ${stdout}`);
	}
	)
	res.sendStatus(200);
}

function sendRemoCmd(postData, res) {
	let options = {
		url: 'http://' + REMO_IP + '/messages',
		headers: {
			'Content-Type': 'application/json',
			'X-Requested-With': 'a'
		},
		json: postData
	};
	var request = require('request');
	request.post(options, function (error, res, body) {
		//console.log('STATUS: ' + res.statusCode);
		//console.log('HEADERS: ' + JSON.stringify(res.headers));
		//console.log('BODY: ' + body);
		//console.log('ERROR: ' + error);
	});

	res.sendStatus(200);
}

/* GET home page. */
router.get('/input2', function (req, res, next) {
	sendCommand('IAVD0002', res);
});


router.get('/input1', function (req, res, next) {
	sendCommand('IAVD0001', res);
});

router.get('/tv', function (req, res, next) {
	sendCommand('ITVD0   ', res);
});
router.get('/cmd', function (req, res, next) {
	var cmd = req.query.value1
	//console.log(cmd)
	sendCommand(cmd, res);
});
router.get('/channel', function (req, res, next) {
	var cmd = req.query.value1
	var channelArray = { 1: "IRCO024E", 2: "IRCO024F", 3: "IRCO0250", 4: "IRCO0251", 5: "IRCO0252", 6: "IRCO0253", 7: "IRCO0254", 8: "IRCO0255", 9: "IRCO0256", 10: "IRCO0257", 11: "IRCO0258", 12: "IRCO0259" }
	//console.log(cmd)
	sendCommand(channelArray[cmd], res);
});
router.get('/ps4', function (req, res, next) {
	var cmd = req.query.value1
	// console.log(cmd)
	ps4Waker(cmd, res);
});
router.get('/remo', function (req, res, next) {
	var cmd = req.query.value1;
	if (cmd == 'up') {
		var postData = { "format": "us", "freq": 38, "data": [8967, 4561, 529, 603, 529, 604, 530, 606, 531, 1707, 535, 1709, 529, 1717, 527, 1709, 531, 603, 532, 1711, 530, 1711, 530, 1710, 533, 604, 532, 600, 530, 609, 525, 604, 531, 1714, 529, 597, 534, 1713, 532, 1710, 530, 1709, 534, 1711, 530, 597, 535, 604, 532, 600, 530, 1713, 535, 593, 538, 598, 535, 597, 535, 606, 531, 1708, 532, 1711, 533, 1705, 535, 40159, 8970, 2287, 534] }
	} else if (cmd == 'down') {
		var postData = { "format": "us", "freq": 38, "data": [9013, 4520, 539, 599, 537, 602, 530, 600, 560, 1684, 556, 1684, 537, 1710, 533, 1709, 557, 574, 570, 1671, 540, 1706, 569, 1671, 561, 574, 539, 593, 541, 595, 539, 598, 536, 1707, 537, 1708, 555, 1688, 529, 1710, 534, 1709, 533, 1704, 561, 574, 560, 574, 539, 594, 539, 600, 560, 577, 553, 580, 557, 578, 536, 597, 537, 1705, 559, 1687, 557, 1683, 535, 40177, 9009, 2251, 562] }
	} else {
		res.sendStatus(400)
		return;
	}
	console.log("send");
	sendRemoCmd(postData, res);
});

module.exports = router;
