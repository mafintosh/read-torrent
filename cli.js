#!/usr/bin/env node

var readTorrent = require('./index');

var pad = function(s) {
	return s < 10 ? '0'+s : s;
};
var format = function(d) {
	return pad(d.getUTCDate())+'/'+pad(d.getUTCMonth()+1)+'/'+d.getUTCFullYear();
};

readTorrent(process.argv[2], function(err, torrent) {
	console.log('info hash: '+torrent.infoHash);
	console.log('created:   '+format(torrent.created));
	console.log('pieces:    '+torrent.pieces.length + ' x '+torrent.pieceLength);

	console.log('name:      '+torrent.name);
	console.log('files:     '+torrent.files[0].name);
	for (var i = 1; i < torrent.files.length; i++) {
		console.log('           '+torrent.files[i].name);
	}

	console.log('trackers:  '+torrent.announce[0]);
	for (var i = 1; i < torrent.announce.length; i++) {
		console.log('           '+torrent.announce[i]);
	}
//	console.log(torrent);
});