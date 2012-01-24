// Module dependencies
var guidGenerator = require('../lib/guid-generator');

var PairingService = {};

PairingService.poll = function (sockets) {
	setInterval(function () {

		if (sockets.length < 2) { return; }
		
		var _unpaired = [],
			length    = sockets.length % 2 === 0 ? sockets.length : sockets.length - 1,
			i         = 0;
		
		// Move an even number of sockets into an internal array
		for (i = 0; i < length; i += 1) {
			_unpaired.push(sockets.shift()); 
		}

		// Sort the sockets so males are at the end and females at the beginning
		_unpaired.sort(function (a, b) {
			var gen_1 = a.handshake.fb_user.gender,
				gen_2 = b.handshake.fb_user.gender;

			if (gen_1 === "male" && gen_2 === "female") { return 1; }
			if (gen_1 === "female" && gen_2 === "male") { return -1; }
			return 0;
		});

		length = _unpaired.length / 2;

		// Create chat sessions for all sockets
		for (i = 0; i < length; i += 1) {
			var room_name  = guidGenerator.create(),
				socket_one = _unpaired.pop(),
				socket_two = _unpaired.shift();

			socket_one.join(room_name);
			socket_two.join(room_name);

			socket_one.set('currentRoom', room_name);
			socket_two.set('currentRoom', room_name);

			socket_one.emit('connectedToPartner', { user: socket_two.handshake.fb_user });
			socket_two.emit('connectedToPartner', { user: socket_one.handshake.fb_user });
			
			console.log("Paired users: " + socket_two.handshake.fb_user.first_name + " with " + socket_one.handshake.fb_user.first_name);
		}

	}, 3000); // 3 seconds
};

module.exports = PairingService;