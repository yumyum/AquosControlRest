var net = require('net')

var express = require('express');
var router = express.Router();

const { exec } = require('child_process')

var AQUOS_IP = '192.168.1.32'
var AQUOS_PORT = 10002
var REMO_IP = '192.168.1.200'

function sendCommand(command) {
  console.log('send to aquos');
  var socket = net.createConnection({
      port: AQUOS_PORT,
      host: AQUOS_IP
  }, function() {
      console.log('send command: ' + command);
      socket.write(command)
      socket.write('\r')
  });
  socket.on('data', function(data) {
        console.log(data.toString());
        socket.end();
  });
  socket.on('end', function() {
        console.log('client disconnected');
        socket.destroy();
  });
}

const cmd = "IRCO0115";
sendCommand(cmd);
