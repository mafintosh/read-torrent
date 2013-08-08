var crypto = require('crypto');
var bncode = require('bncode');
var request = require('request');
var path = require('path');
var fs = require('fs');
var zlib = require('zlib');

var sumLength = function(sum, file) {
	return sum + file.length;
};

var splitPieces = function(buffer) {
	var pieces = [];
	for (var i = 0; i < buffer.length; i += 20) {
		pieces.push(buffer.slice(i, i + 20).toString('hex'));
	}
	return pieces;
};

var parse = function(torrent) {
	torrent = bncode.decode(torrent);

	var result = {};
	var name = torrent.info.name.toString();
	var pieceLength = torrent.info['piece length'];
	var files = (torrent.info.files || [torrent.info]);

	result.created = new Date(torrent['creation date'] * 1000);
	result.announce = (torrent['announce-list'] || [torrent.announce]).map(function(obj) {
		return obj.toString().split(',')[0];
	});
	result.infoHash = crypto.createHash('sha1').update(bncode.encode(torrent.info)).digest('hex');
	result.private = !!torrent.info.private;
	result.name = name;
	result.length = files.reduce(sumLength, 0);

	result.files = files.map(function(file, i) {
		var parts = [].concat(file.name || name, file.path || []).map(function(p) {
			return p.toString();
		});

		var result = {};

		result.path = path.join.apply(null, [path.sep].concat(parts)).slice(1);
		result.name = parts.pop();
		result.length = file.length;
		result.offset = files.slice(0, i).reduce(sumLength, 0);
		result.end = result.offset + result.length - 1;
		result.offsetPiece = (result.offset / pieceLength) | 0;
		result.endPiece = (result.end / pieceLength) | 0;

		return result;
	});

	var lastFile = result.files[result.files.length-1];

	result.pieceLength = pieceLength;
	result.pieceRemainder = (result.length % pieceLength) || pieceLength;
	result.pieces = splitPieces(torrent.info.pieces);

	return result;
};

module.exports = function(url, callback) {
	var ondata = function(err, data) {
		if (err) return callback(err);
		try {
			data = parse(data);
		} catch (err) {
			return callback(err);
		}

		callback(null, data);
	};

	var onresponse = function(err, response) {
		if (err) return callback(err);
		if (response.statusCode >= 400) return callback(new Error('bad status: '+response.statusCode));
		if (response.headers['content-encoding'] === 'gzip') return zlib.gunzip(response.body, ondata);

		ondata(null, response.body);
	};

	if (Buffer.isBuffer(url)) return ondata(null, url);
	if (/^https?:/.test(url)) return request(url, {encoding:null}, onresponse);

	fs.readFile(url, ondata);
};
