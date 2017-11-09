var fs = require('fs')
var WebSocketServer = require('websocket').server;
var https = require('https');

var privateKey  = fs.readFileSync('/etc/ssl/private/domain.key', 'utf8');
var certificate = fs.readFileSync('/etc/ssl/certs/domain.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};

var server = https.createServer(credentials, function(request, response) {
  // process HTTP request. Since we're writing just WebSockets
  // server we don't have to implement anything.
});
server.listen(1337, function() { });

// create the server
wsServer = new WebSocketServer({
  httpServer: server
});



//Define base structure
var villages ={};



var render = function () {
	/*
	* Prints the status of all villages to the console
	*/
	console.log('\x1Bc');
	for(village in villages) {
		var resourceString = "";
		resourceString += "wood: " + villages[village].wood.ammount + "\t";
		resourceString += "clay: " + villages[village].clay.ammount + "\t";
		resourceString += "iron: " + villages[village].iron.ammount + "\t";
		resourceString += "wheat: "+ villages[village].wheat.ammount;
		console.log(village + "(" + villages[village].updated.toLocaleTimeString() + ")" + " - " + resourceString);
		//console.log(villages[village]);
	}
};


// WebSocket server
wsServer.on('request', function(request) {
  var connection = request.accept(null, request.origin);

  // This is the most important callback for us, we'll handle
  // all messages from users here.
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      // process WebSocket message
	village = JSON.parse(message.utf8Data);
	village.updated = new Date();
	villages[village.villageName] = village;
	//console.log("Village: " + message.utf8Data);
	render();
    }
  });

  connection.on('close', function(connection) {
    // close user connection
  });
});

