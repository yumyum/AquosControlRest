var net = require('net')

var express = require('express');
var router = express.Router();

const { exec } = require('child_process')

var AQUOS_IP = '192.168.1.32'
var AQUOS_PORT = 10002


function sendCommand(command, res) {
  //console.log('connect to aquos');
  var socket = net.createConnection({
      port: AQUOS_PORT,
      host: AQUOS_IP
  }, function() {
	  //console.log('send command: ' + command);
	  socket.write(command)
	  socket.write('\r\n')
  });
  socket.on('data', function(data) {
	  	//console.log(data.toString());
		socket.end();
  });
  socket.on('end', function() {
	  	//console.log('client disconnected');
	  	res.sendStatus(200);
  });
}

function ps4Waker(command, res) {
  if (command == 'up') {
    var param = ""
  } else if (command =='torne') {
    var param = " start CUSA00442"
  } else {
    res.sendStatus(404);
    return
  }
	exec("ps4-waker" + param, (err, stdout, stderr) => {
		if (err) {
		  // console.log(`stderr: ${stderr}`)
		  return
		}
		// console.log(`stdout: ${stdout}`)
	  }
  )
  res.sendStatus(200);
}

/* GET home page. */
router.get('/input2', function(req, res, next) {
	sendCommand('IAVD0002', res);
});


router.get('/input1', function(req, res, next) {
	sendCommand('IAVD0001', res);
});

router.get('/tv', function(req, res, next) {
	sendCommand('ITVD0   ', res);
});
router.get('/cmd', function(req, res, next) {
	var cmd = req.query.value1
	//console.log(cmd)
	sendCommand(cmd, res);
});
router.get('/channel', function(req, res, next) {
	var cmd = req.query.value1
	var channelArray = {1:"IRCO024E",2:"IRCO024F",3:"IRCO0250",4:"IRCO0251",5:"IRCO0252",6:"IRCO0253",7:"IRCO0254",8:"IRCO0255",9:"IRCO0256",10:"IRCO0257",11:"IRCO0258",12:"IRCO0259"}
	//console.log(cmd)
	sendCommand(channelArray[cmd], res);
});
router.get('/ps4', function(req, res, next) {
	var cmd = req.query.value1
	// console.log(cmd)
	ps4Waker(cmd, res);
});

module.exports = router;
